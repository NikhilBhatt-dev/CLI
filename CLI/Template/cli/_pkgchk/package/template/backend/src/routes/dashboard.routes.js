import express from "express";

import protect from "../middleware/authMiddleware.js";

import { getDashboardStats } from "../controllers/dashboard.controller.js";

const router = express.Router();

router.get("/", protect, getDashboardStats);

export default router;