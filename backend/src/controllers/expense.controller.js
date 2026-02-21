const pool = require("../config/db");

function rowToExpense(row) {
  return {
    id: row.id,
    tripId: row.trip_id,
    fuelAmount: row.fuel_amount,
    fuelCost: row.fuel_cost,
    otherExpense: row.other_expense,
    expenseNote: row.expense_note,
    date: row.date ? new Date(row.date).toISOString().slice(0, 10) : "",
  };
}

async function list(req, res) {
  const organisation_id = req.user?.organisation_id;
  if (!organisation_id) {
    return res.status(403).json({ error: "No organisation context" });
  }

  try {
    const result = await pool.query(
      `SELECT id, trip_id, fuel_amount, fuel_cost, other_expense, expense_note, date
       FROM expenses
       WHERE organisation_id = $1
       ORDER BY created_at DESC`,
      [organisation_id]
    );
    return res.json(result.rows.map(rowToExpense));
  } catch (err) {
    console.error("Expenses list error:", err);
    return res.status(500).json({ error: "Failed to list expenses" });
  }
}

async function create(req, res) {
  const organisation_id = req.user?.organisation_id;
  if (!organisation_id) {
    return res.status(403).json({ error: "No organisation context" });
  }

  const { tripId, fuelAmount, fuelCost, otherExpense, expenseNote, date } = req.body;

  if (!tripId || !date) {
    return res
      .status(400)
      .json({ error: "Missing required fields: tripId, date" });
  }

  const fuelAmountNum = fuelAmount != null ? parseInt(fuelAmount, 10) : 0;
  const fuelAmountFinal = isNaN(fuelAmountNum) || fuelAmountNum < 0 ? 0 : fuelAmountNum;

  const fuelCostNum = fuelCost != null ? parseInt(fuelCost, 10) : 0;
  const fuelCostFinal = isNaN(fuelCostNum) || fuelCostNum < 0 ? 0 : fuelCostNum;

  const otherExpenseNum = otherExpense != null ? parseInt(otherExpense, 10) : 0;
  const otherExpenseFinal = isNaN(otherExpenseNum) || otherExpenseNum < 0 ? 0 : otherExpenseNum;

  const noteFinal = (expenseNote || "").trim();

  try {
    const result = await pool.query(
      `INSERT INTO expenses
         (organisation_id, trip_id, fuel_amount, fuel_cost, other_expense, expense_note, date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, trip_id, fuel_amount, fuel_cost, other_expense, expense_note, date`,
      [organisation_id, tripId, fuelAmountFinal, fuelCostFinal, otherExpenseFinal, noteFinal, date]
    );

    return res.status(201).json(rowToExpense(result.rows[0]));
  } catch (err) {
    console.error("Expense create error:", err);
    return res.status(500).json({ error: "Failed to create expense" });
  }
}

async function remove(req, res) {
  const organisation_id = req.user?.organisation_id;
  if (!organisation_id) {
    return res.status(403).json({ error: "No organisation context" });
  }

  const { id } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM expenses WHERE id = $1 AND organisation_id = $2 RETURNING id`,
      [id, organisation_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Expense not found" });
    }

    return res.json({ message: "Expense deleted", id });
  } catch (err) {
    console.error("Expense delete error:", err);
    return res.status(500).json({ error: "Failed to delete expense" });
  }
}

module.exports = { list, create, remove };
