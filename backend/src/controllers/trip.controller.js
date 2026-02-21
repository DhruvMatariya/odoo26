const pool = require("../config/db");

const VALID_STATUSES = ["Draft", "Dispatched", "Completed", "Cancelled"];

function rowToTrip(row) {
  return {
    id: row.id,
    vehicleId: row.vehicle_id,
    driverId: row.driver_id,
    origin: row.origin,
    destination: row.destination,
    status: row.status,
    departureTime: row.departure_time
      ? row.departure_time.toISOString().slice(0, 16).replace("T", " ")
      : "",
    eta: row.eta
      ? row.eta.toISOString().slice(0, 16).replace("T", " ")
      : "",
    cargoWeight: row.cargo_weight,
    estimatedCost: row.estimated_cost,
  };
}

async function list(req, res) {
  const organisation_id = req.user?.organisation_id;
  if (!organisation_id) {
    return res.status(403).json({ error: "No organisation context" });
  }

  try {
    const result = await pool.query(
      `SELECT id, vehicle_id, driver_id, origin, destination, status,
              departure_time, eta, cargo_weight, estimated_cost
       FROM trips
       WHERE organisation_id = $1
       ORDER BY created_at DESC`,
      [organisation_id]
    );
    const trips = result.rows.map(rowToTrip);
    return res.json(trips);
  } catch (err) {
    console.error("Trips list error:", err);
    return res.status(500).json({ error: "Failed to list trips" });
  }
}

async function create(req, res) {
  const organisation_id = req.user?.organisation_id;
  if (!organisation_id) {
    return res.status(403).json({ error: "No organisation context" });
  }

  const {
    vehicleId,
    driverId,
    origin,
    destination,
    departureTime,
    eta,
    cargoWeight,
    estimatedCost,
  } = req.body;

  if (!vehicleId || !driverId || !origin || !destination) {
    return res.status(400).json({
      error: "Missing required fields: vehicleId, driverId, origin, destination",
    });
  }

  const cargoWeightNum =
    cargoWeight != null ? parseInt(cargoWeight, 10) : 0;
  const cargoWeightFinal =
    isNaN(cargoWeightNum) || cargoWeightNum < 0 ? 0 : cargoWeightNum;

  const estimatedCostNum =
    estimatedCost != null ? parseInt(estimatedCost, 10) : 0;
  const estimatedCostFinal =
    isNaN(estimatedCostNum) || estimatedCostNum < 0 ? 0 : estimatedCostNum;

  const departureTimeVal =
    departureTime && String(departureTime).trim()
      ? String(departureTime).trim()
      : null;
  const etaVal =
    eta && String(eta).trim() ? String(eta).trim() : null;

  try {
    const result = await pool.query(
      `INSERT INTO trips (organisation_id, vehicle_id, driver_id, origin, destination,
                          status, departure_time, eta, cargo_weight, estimated_cost)
       VALUES ($1, $2, $3, $4, $5, 'Draft', $6, $7, $8, $9)
       RETURNING id, vehicle_id, driver_id, origin, destination, status,
                 departure_time, eta, cargo_weight, estimated_cost`,
      [
        organisation_id,
        String(vehicleId).trim(),
        String(driverId).trim(),
        String(origin).trim(),
        String(destination).trim(),
        departureTimeVal,
        etaVal,
        cargoWeightFinal,
        estimatedCostFinal,
      ]
    );
    const trip = rowToTrip(result.rows[0]);
    return res.status(201).json(trip);
  } catch (err) {
    console.error("Trip create error:", err);
    return res.status(500).json({ error: "Failed to create trip" });
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
      error:
        "Invalid status. Must be Draft, Dispatched, Completed, or Cancelled",
    });
  }

  try {
    const result = await pool.query(
      `UPDATE trips
       SET status = $1
       WHERE id = $2 AND organisation_id = $3
       RETURNING id, vehicle_id, driver_id, origin, destination, status,
                 departure_time, eta, cargo_weight, estimated_cost`,
      [status, id, organisation_id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: "Trip not found" });
    }

    const trip = rowToTrip(result.rows[0]);
    return res.json(trip);
  } catch (err) {
    console.error("Trip update status error:", err);
    return res.status(500).json({ error: "Failed to update trip status" });
  }
}

module.exports = { list, create, updateStatus };
