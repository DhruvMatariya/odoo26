const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db"); // fixed import

const SALT_ROUNDS = 10;
const ALLOWED_ROLES = ["manager", "dispatcher"];

function randomSixDigitCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

async function signup(req, res) {
  const { name, email, password, role, organisationName, accessCode, organisationId } = req.body;

  if (!name || !email || !password || !role)
    return res.status(400).json({ error: "Missing required fields" });

  const roleLower = role.toLowerCase();
  if (!ALLOWED_ROLES.includes(roleLower))
    return res.status(400).json({ error: "Invalid role" });

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    const userResult = await client.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1,$2,$3,$4)
       RETURNING id,name,email,role`,
      [name.trim(), email.trim().toLowerCase(), password_hash, roleLower]
    );

    const user = userResult.rows[0];

    // ===== MANAGER FLOW =====
    if (roleLower === "manager") {
      const orgName = organisationName?.trim() || "My Organisation";

      let access_code;
      let exists = true;

      while (exists) {
        access_code = randomSixDigitCode();
        const check = await client.query(
          "SELECT 1 FROM organisations WHERE access_code=$1",
          [access_code]
        );
        exists = check.rows.length > 0;
      }

      await client.query(
        `INSERT INTO organisations (name, access_code, user_id, role)
         VALUES ($1,$2,$3,$4)`,
        [orgName, access_code, user.id, roleLower]
      );

      await client.query("COMMIT");

      return res.status(201).json({
        message: "Manager registered",
        access_code,
        user,
      });
    }

    // ===== DISPATCHER FLOW =====
    if (roleLower === "dispatcher") {
      if (!organisationId)
        throw new Error("Organisation ID is required");

      const orgCheck = await client.query(
        "SELECT name, access_code FROM organisations WHERE id=$1 AND role='manager' LIMIT 1",
        [organisationId]
      );

      if (!orgCheck.rows.length)
        throw new Error("Invalid organisation ID");

      await client.query(
        `INSERT INTO organisations (name, access_code, user_id, role)
         VALUES ($1,$2,$3,$4)`,
        [orgCheck.rows[0].name, orgCheck.rows[0].access_code, user.id, roleLower]
      );

      await client.query("COMMIT");

      return res.status(201).json({
        message: "Dispatcher registered",
        user,
      });
    }

  } catch (err) {
    await client.query("ROLLBACK");
    if (err.code === "23505")
      return res.status(409).json({ error: "Email already exists" });

    console.error("Signup error:", err);
    return res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: "Email and password required" });

  try {
    const userResult = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email.trim().toLowerCase()]
    );

    if (!userResult.rows.length)
      return res.status(401).json({ error: "Invalid credentials" });

    const user = userResult.rows[0];

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid)
      return res.status(401).json({ error: "Invalid credentials" });

    const orgResult = await pool.query(
      "SELECT id, access_code FROM organisations WHERE user_id=$1 LIMIT 1",
      [user.id]
    );

    const userOrg = orgResult.rows[0];
    const access_code = userOrg?.access_code;

    // Resolve canonical organisation_id (the manager's org row) so that
    // all users who share the same access_code see the same vehicles.
    let organisation_id = userOrg?.id;
    if (access_code) {
      const managerOrg = await pool.query(
        "SELECT id FROM organisations WHERE access_code=$1 AND role='manager' LIMIT 1",
        [access_code]
      );
      if (managerOrg.rows.length) {
        organisation_id = managerOrg.rows[0].id;
      }
    }

    const token = signToken({
      userId: user.id,
      role: user.role,
      access_code,
      organisation_id,
    });

    return res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, access_code, organisation_id },
    });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Login failed" });
  }
}

async function forgotPassword(req, res) {
  const { email } = req.body;

  if (!email)
    return res.status(400).json({ error: "Email is required" });

  const client = await pool.connect();

  try {
    // ✅ Check if user exists
    const userResult = await client.query(
      "SELECT * FROM users WHERE email = $1",
      [email.trim().toLowerCase()]
    );

    if (!userResult.rows.length)
      return res.status(404).json({ error: "No account found with this email" });

    const user = userResult.rows[0];

    // ✅ Generate reset token
    const resetToken = randomSixDigitCode();
    const resetExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // ✅ Save reset token to database
    await client.query(
      `UPDATE users 
       SET reset_token = $1, reset_token_expiry = $2 
       WHERE email = $3`,
      [resetToken, resetExpiry, email.trim().toLowerCase()]
    );

    // ✅ In production send email - for now return token
    console.log(`🔑 Reset token for ${email}: ${resetToken}`);

    return res.status(200).json({
      message: "Password reset code sent to your email",
      // ✅ Remove this in production - only for testing
      resetToken: resetToken
    });

  } catch (err) {
    console.error("Forgot password error:", err);
    return res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
}

async function verifyResetCode(req, res) {
  const { email, resetToken } = req.body;

  if (!email || !resetToken)
    return res.status(400).json({ error: "Email and reset code are required" });

  const client = await pool.connect();

  try {
    // ✅ Check token is valid and not expired
    const userResult = await client.query(
      `SELECT * FROM users 
       WHERE email = $1 
       AND reset_token = $2 
       AND reset_token_expiry > NOW()`,
      [email.trim().toLowerCase(), resetToken]
    );

    if (!userResult.rows.length)
      return res.status(400).json({ error: "Invalid or expired reset code" });

    return res.status(200).json({
      message: "Reset code verified successfully",
      email: email
    });

  } catch (err) {
    console.error("Verify reset code error:", err);
    return res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
}

async function resetPassword(req, res) {
  const { email, resetToken, newPassword, confirmPassword } = req.body;

  if (!email || !resetToken || !newPassword || !confirmPassword)
    return res.status(400).json({ error: "All fields are required" });

  if (newPassword !== confirmPassword)
    return res.status(400).json({ error: "Passwords do not match" });

  if (newPassword.length < 8)
    return res.status(400).json({ error: "Password must be at least 8 characters" });

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // ✅ Verify token again
    const userResult = await client.query(
      `SELECT * FROM users 
       WHERE email = $1 
       AND reset_token = $2 
       AND reset_token_expiry > NOW()`,
      [email.trim().toLowerCase(), resetToken]
    );

    if (!userResult.rows.length)
      return res.status(400).json({ error: "Invalid or expired reset code" });

    // ✅ Hash new password
    const password_hash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // ✅ Update password and clear reset token
    await client.query(
      `UPDATE users 
       SET password_hash = $1, 
           reset_token = NULL, 
           reset_token_expiry = NULL 
       WHERE email = $2`,
      [password_hash, email.trim().toLowerCase()]
    );

    await client.query("COMMIT");

    return res.status(200).json({
      message: "Password reset successfully. Please login with your new password."
    });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Reset password error:", err);
    return res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
}

module.exports = { signup, login, forgotPassword, verifyResetCode, resetPassword };