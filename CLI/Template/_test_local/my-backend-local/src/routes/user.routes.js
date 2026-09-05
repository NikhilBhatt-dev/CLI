import express from "express";
import protect from "../middleware/authMiddleware.js";
import authorize from "../middleware/adminMiddleware.js";
import { getAdminUserById, getAdminUsers } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/admin", protect, authorize("admin"), getAdminUsers);
router.get("/admin/:id", protect, authorize("admin"), getAdminUserById);

export default router;
