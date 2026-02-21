const pool = require("../config/db");

const VALID_TYPES = ["Truck", "Van", "Bike"];
const VALID_STATUSES = ["Available", "On Trip", "In Shop", "Retired"];

function rowToVehicle(row) {
  return {
    id: row.id,
    model: row.model,
    plate: row.plate,
    type: row.type,
    capacity: row.capacity_kg,
    status: row.status,
    odometer: row.odometer_km,
    purchaseDate: row.purchase_date ? row.purchase_date.toISOString().slice(0, 10) : "",
  };
}

async function list(req, res) {
  const organisation_id = req.user?.organisation_id;
  if (!organisation_id) {
    return res.status(403).json({ error: "No organisation context" });
  }

  try {
    const result = await pool.query(
      `SELECT id, model, plate, type, capacity_kg, status, odometer_km, purchase_date
       FROM vehicles
       WHERE organisation_id = $1
       ORDER BY created_at DESC`,
      [organisation_id]
    );
    const vehicles = result.rows.map(rowToVehicle);
    return res.json(vehicles);
  } catch (err) {
    console.error("Vehicles list error:", err);
    return res.status(500).json({ error: "Failed to list vehicles" });
  }
}

async function create(req, res) {
  const organisation_id = req.user?.organisation_id;
  if (!organisation_id) {
    return res.status(403).json({ error: "No organisation context" });
  }

  const { model, plate, type, capacity, status, odometer, purchaseDate } = req.body;

  if (!model || !plate || !type || capacity == null) {
    return res.status(400).json({
      error: "Missing required fields: model, plate, type, capacity",
    });
  }

  const typeNorm = String(type).trim();
  if (!VALID_TYPES.includes(typeNorm)) {
    return res.status(400).json({
      error: "Invalid type. Must be Truck, Van, or Bike",
    });
  }

  const capacityNum = parseInt(capacity, 10);
  if (isNaN(capacityNum) || capacityNum < 0) {
    return res.status(400).json({ error: "Capacity must be a non-negative number" });
  }

  const statusNorm = (status && VALID_STATUSES.includes(status)) ? status : "Available";
  const odometerNum = odometer != null ? parseInt(odometer, 10) : 0;
  const odometerFinal = isNaN(odometerNum) || odometerNum < 0 ? 0 : odometerNum;
  const purchaseDateVal = purchaseDate && String(purchaseDate).trim() ? String(purchaseDate).trim() : null;

  try {
    const result = await pool.query(
      `INSERT INTO vehicles (organisation_id, model, plate, type, capacity_kg, status, odometer_km, purchase_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, model, plate, type, capacity_kg, status, odometer_km, purchase_date`,
      [
        organisation_id,
        String(model).trim(),
        String(plate).trim(),
        typeNorm,
        capacityNum,
        statusNorm,
        odometerFinal,
        purchaseDateVal,
      ]
    );
    const vehicle = rowToVehicle(result.rows[0]);
    return res.status(201).json(vehicle);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "A vehicle with this plate already exists in your fleet" });
    }
    console.error("Vehicle create error:", err);
    return res.status(500).json({ error: "Failed to create vehicle" });
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
    return res.status(400).json({
      error: "Invalid status. Must be Available, On Trip, In Shop, or Retired",
    });
  }

  try {
    const result = await pool.query(
      `UPDATE vehicles
       SET status = $1
       WHERE id = $2 AND organisation_id = $3
       RETURNING id, model, plate, type, capacity_kg, status, odometer_km, purchase_date`,
      [status, id, organisation_id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: "Vehicle not found" });
    }

    const vehicle = rowToVehicle(result.rows[0]);
    return res.json(vehicle);
  } catch (err) {
    console.error("Vehicle update status error:", err);
    return res.status(500).json({ error: "Failed to update status" });
  }
}

module.exports = { list, create, updateStatus };
