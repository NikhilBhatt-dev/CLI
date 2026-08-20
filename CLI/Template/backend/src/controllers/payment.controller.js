import asyncHandler from "../utils/asyncHandler.js";

import {
  createRazorpayOrder,
  verifyPayment,
} from "../services/payment.service.js";

/**
 * Create Razorpay Order
 * POST /orders/razorpay
 */
export const createRazorpayOrderController = asyncHandler(async (req, res) => {
  const response = await createRazorpayOrder(req.user._id);

  return res.status(response.statusCode).json(response);
});

/**
 * Verify Payment
 * POST /orders/verify-payment
 */
export const verifyPaymentController = asyncHandler(async (req, res) => {
  const response = await verifyPayment(req.user._id, req.body);

  return res.status(response.statusCode).json(response);
});
