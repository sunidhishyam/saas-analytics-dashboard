import express from "express";
import OverallStat from "../models/OverallStat.js";

const router = express.Router();

/**
 * GET /kpi/growth
 * Returns month-over-month revenue and units growth percentages for the latest two months.
 */
router.get("/growth", async (req, res) => {
  try {
    const stat = await OverallStat.findOne().sort({ year: -1 });
    if (!stat) return res.status(404).json({ message: "No stats found" });

    const monthly = stat.monthlyData;
    if (monthly.length < 2) {
      return res.status(200).json({ revenueGrowth: null, unitsGrowth: null });
    }

    const current = monthly[monthly.length - 1];
    const previous = monthly[monthly.length - 2];

    const revenueGrowth =
      previous.totalSales === 0
        ? null
        : (((current.totalSales - previous.totalSales) / previous.totalSales) * 100).toFixed(2);

    const unitsGrowth =
      previous.totalUnits === 0
        ? null
        : (((current.totalUnits - previous.totalUnits) / previous.totalUnits) * 100).toFixed(2);

    res.status(200).json({
      currentMonth: current.month,
      previousMonth: previous.month,
      revenueGrowth: revenueGrowth !== null ? parseFloat(revenueGrowth) : null,
      unitsGrowth: unitsGrowth !== null ? parseFloat(unitsGrowth) : null,
      currentRevenue: current.totalSales,
      previousRevenue: previous.totalSales,
      currentUnits: current.totalUnits,
      previousUnits: previous.totalUnits,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * GET /kpi/summary
 * Returns high-level KPI summary: total customers, yearly sales, top sales category.
 */
router.get("/summary", async (req, res) => {
  try {
    const stat = await OverallStat.findOne().sort({ year: -1 });
    if (!stat) return res.status(404).json({ message: "No stats found" });

    const categoryEntries = [...stat.salesByCategory.entries()];
    const topCategory = categoryEntries.sort((a, b) => b[1] - a[1])[0];

    res.status(200).json({
      year: stat.year,
      totalCustomers: stat.totalCustomers,
      yearlySalesTotal: stat.yearlySalesTotal,
      yearlyTotalSoldUnits: stat.yearlyTotalSoldUnits,
      topCategory: topCategory ? { name: topCategory[0], sales: topCategory[1] } : null,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
