import asyncHandler from "../utils/asyncHandler.js";
import * as dashboardService from "../services/dashboard.service.js";

export const getDashboardStats = asyncHandler(async (req, res) => {
  const result = await dashboardService.getDashboardStats();

  res.status(200).json(result);
});
