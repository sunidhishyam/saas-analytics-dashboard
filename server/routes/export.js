import express from "express";
import Transaction from "../models/Transaction.js";
import OverallStat from "../models/OverallStat.js";

const router = express.Router();

/** Converts an array of objects to CSV string */
function toCSV(rows) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]).join(",");
  const lines = rows.map((row) =>
    Object.values(row)
      .map((v) => (typeof v === "string" ? `"${v.replace(/"/g, '""')}"` : v))
      .join(",")
  );
  return [headers, ...lines].join("\n");
}

/**
 * GET /export/transactions
 * Downloads all transactions as a CSV file.
 * Query params: limit (default 1000), page (default 1)
 */
router.get("/transactions", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 1000, 5000);
    const skip = (page - 1) * limit;

    const transactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const rows = transactions.map((t) => ({
      id: t._id.toString(),
      userId: t.userId,
      cost: t.cost,
      productCount: t.products?.length ?? 0,
      createdAt: t.createdAt?.toISOString() ?? "",
    }));

    const csv = toCSV(rows);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="transactions_page${page}.csv"`);
    res.status(200).send(csv);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * GET /export/monthly-sales
 * Downloads monthly sales data as CSV for the most recent year.
 */
router.get("/monthly-sales", async (req, res) => {
  try {
    const stat = await OverallStat.findOne().sort({ year: -1 }).lean();
    if (!stat) return res.status(404).json({ message: "No stats found" });

    const rows = stat.monthlyData.map((m) => ({
      year: stat.year,
      month: m.month,
      totalSales: m.totalSales,
      totalUnits: m.totalUnits,
    }));

    const csv = toCSV(rows);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="monthly_sales_${stat.year}.csv"`);
    res.status(200).send(csv);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
