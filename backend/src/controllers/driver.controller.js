const pool = require("../config/db");

const VALID_STATUSES = ["active", "inactive", "suspended"];

function rowToDriver(row) {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    licenseNumber: row.license_number,
    licenseExpiry: row.license_expiry
      ? row.license_expiry.toISOString().slice(0, 10)
      : "",
    status: row.status,
    createdAt: row.created_at,
  };
}

async function list(req, res) {
  const access_code = req.user?.access_code;
  if (!access_code) {
    return res.status(403).json({ error: "No organisation context" });
  }

  try {
    const result = await pool.query(
      `SELECT id, name, phone, license_number, license_expiry, status, created_at
       FROM drivers
       WHERE organisation_access_code = $1
       ORDER BY created_at DESC`,
      [access_code]
    );
    const drivers = result.rows.map(rowToDriver);
    return res.json(drivers);
  } catch (err) {
    console.error("Drivers list error:", err);
    return res.status(500).json({ error: "Failed to list drivers" });
  }
}

async function create(req, res) {
  const access_code = req.user?.access_code;
  if (!access_code) {
    return res.status(403).json({ error: "No organisation context" });
  }

  const { name, phone, licenseNumber, licenseExpiry, status } = req.body;

  if (!name || !phone || !licenseNumber) {
    return res.status(400).json({
      error: "Missing required fields: name, phone, licenseNumber",
    });
  }

  const statusNorm =
    status && VALID_STATUSES.includes(status) ? status : "active";
  const licenseExpiryVal =
    licenseExpiry && String(licenseExpiry).trim()
      ? String(licenseExpiry).trim()
      : null;

  try {
    const result = await pool.query(
      `INSERT INTO drivers (name, phone, license_number, license_expiry, organisation_access_code, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, phone, license_number, license_expiry, status, created_at`,
      [
        String(name).trim(),
        String(phone).trim(),
        String(licenseNumber).trim(),
        licenseExpiryVal,
        access_code,
        statusNorm,
      ]
    );
    const driver = rowToDriver(result.rows[0]);
    return res.status(201).json(driver);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({
        error:
          "A driver with this license number already exists in your organisation",
      });
    }
    console.error("Driver create error:", err);
    return res.status(500).json({ error: "Failed to create driver" });
  }
}

async function updateStatus(req, res) {
  const access_code = req.user?.access_code;
  if (!access_code) {
    return res.status(403).json({ error: "No organisation context" });
  }

  const { id } = req.params;
  const { status } = req.body;

  if (!status || !VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      error: "Invalid status. Must be active, inactive, or suspended",
    });
  }

  try {
    const result = await pool.query(
      `UPDATE drivers
       SET status = $1
       WHERE id = $2 AND organisation_access_code = $3
       RETURNING id, name, phone, license_number, license_expiry, status, created_at`,
      [status, id, access_code]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: "Driver not found" });
    }

    const driver = rowToDriver(result.rows[0]);
    return res.json(driver);
  } catch (err) {
    console.error("Driver update status error:", err);
    return res.status(500).json({ error: "Failed to update status" });
  }
}

module.exports = { list, create, updateStatus };
