const pool = require("../config/db");

const VALID_STATUSES = ["Scheduled", "In Progress", "Completed"];

function rowToLog(row) {
  return {
    id: row.id,
    vehicleId: row.vehicle_id,
    issue: row.issue,
    serviceDate: row.service_date
      ? new Date(row.service_date).toISOString().slice(0, 10)
      : "",
    cost: row.cost,
    status: row.status,
  };
}

async function list(req, res) {
  const organisation_id = req.user?.organisation_id;
  if (!organisation_id) {
    return res.status(403).json({ error: "No organisation context" });
  }

  try {
    const result = await pool.query(
      `SELECT id, vehicle_id, issue, service_date, cost, status
       FROM maintenance_logs
       WHERE organisation_id = $1
       ORDER BY created_at DESC`,
      [organisation_id]
    );
    return res.json(result.rows.map(rowToLog));
  } catch (err) {
    console.error("Maintenance list error:", err);
    return res.status(500).json({ error: "Failed to list maintenance logs" });
  }
}

async function create(req, res) {
  const organisation_id = req.user?.organisation_id;
  if (!organisation_id) {
    return res.status(403).json({ error: "No organisation context" });
  }

  const { vehicleId, issue, serviceDate, cost, status } = req.body;

  if (!vehicleId || !issue || !serviceDate) {
    return res
      .status(400)
      .json({ error: "Missing required fields: vehicleId, issue, serviceDate" });
  }

  const costNum = cost != null ? parseInt(cost, 10) : 0;
  const costFinal = isNaN(costNum) || costNum < 0 ? 0 : costNum;

  const statusFinal =
    status && VALID_STATUSES.includes(status) ? status : "Scheduled";

  try {
    const result = await pool.query(
      `INSERT INTO maintenance_logs
         (organisation_id, vehicle_id, issue, service_date, cost, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, vehicle_id, issue, service_date, cost, status`,
      [organisation_id, vehicleId, issue, serviceDate, costFinal, statusFinal]
    );

    // Optionally set the vehicle to "In Shop" when a log is created
    await pool.query(
      `UPDATE vehicles SET status = 'In Shop' WHERE id = $1 AND organisation_id = $2`,
      [vehicleId, organisation_id]
    );

    return res.status(201).json(rowToLog(result.rows[0]));
  } catch (err) {
    console.error("Maintenance create error:", err);
    return res.status(500).json({ error: "Failed to create maintenance log" });
  }
}

async function updateStatus(req, res) {
  const organisation_id = req.user?.organisation_id;
  if (!organisation_id) {
    return res.status(403).json({ error: "No organisation context" });
  }

  const { id } = req.params;
  const { status } = req.body;

  if (!status || !VALID_STATUSES.includes(status)) {
    return res
      .status(400)
      .json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` });
  }

  try {
    const result = await pool.query(
      `UPDATE maintenance_logs SET status = $1
       WHERE id = $2 AND organisation_id = $3
       RETURNING id, vehicle_id, issue, service_date, cost, status`,
      [status, id, organisation_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Maintenance log not found" });
    }

    // If completed, set vehicle back to Available
    if (status === "Completed") {
      const log = result.rows[0];
      // Only set to Available if no other open maintenance logs exist for this vehicle
      const openLogs = await pool.query(
        `SELECT id FROM maintenance_logs
         WHERE vehicle_id = $1 AND organisation_id = $2
           AND status != 'Completed' AND id != $3`,
        [log.vehicle_id, organisation_id, id]
      );
      if (openLogs.rows.length === 0) {
        await pool.query(
          `UPDATE vehicles SET status = 'Available'
           WHERE id = $1 AND organisation_id = $2 AND status = 'In Shop'`,
          [log.vehicle_id, organisation_id]
        );
      }
    }

    return res.json(rowToLog(result.rows[0]));
  } catch (err) {
    console.error("Maintenance updateStatus error:", err);
    return res.status(500).json({ error: "Failed to update maintenance status" });
  }
}

module.exports = { list, create, updateStatus };
