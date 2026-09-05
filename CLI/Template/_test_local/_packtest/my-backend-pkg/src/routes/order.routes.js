import express from "express";

import {
  placeCodOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  getOrderByIdForAdmin,
  updateOrderStatus,
} from "../controllers/order.controller.js";

import {
  createRazorpayOrderController,
  verifyPaymentController,
} from "../controllers/payment.controller.js";

import protect from "../middleware/authMiddleware.js";
import authorize from "../middleware/adminMiddleware.js";
const router = express.Router();

/* -------------------------------------------------------------------------- */
/*                                 Admin Routes                               */
/* -------------------------------------------------------------------------- */

router.get("/admin", protect, authorize("admin"), getAllOrders);

router.get("/admin/:id", protect, authorize("admin"), getOrderByIdForAdmin);

router.patch(
  "/admin/:id/status",
  protect,
  authorize("admin"),
  updateOrderStatus,
);

/* -------------------------------------------------------------------------- */
/*                               Customer Routes                              */
/* -------------------------------------------------------------------------- */

// COD Order
router.post("/", protect, placeCodOrder);

// Create Razorpay Order
router.post("/razorpay", protect, createRazorpayOrderController);

// Verify Razorpay Payment
router.post("/verify-payment", protect, verifyPaymentController);

// Get My Orders
router.get("/", protect, getMyOrders);

// Get Single Order
router.get("/:id", protect, getOrderById);

// Cancel Order
router.patch("/:id/cancel", protect, cancelOrder);

export default router;
