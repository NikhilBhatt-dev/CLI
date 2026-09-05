import mongoose from "mongoose";

import Order from "../models/Order.js";

import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

import getPopulatedOrder from "../helpers/getPopulatedOrder.js";
import createOrderFromCart from "../helpers/createOrderFromCart.js";

/* Place COD Order */

export const placeCodOrder = async (userId, data) => {
  const { shippingAddress } = data;

  if (!shippingAddress) {
    throw new ApiError(400, "Shipping address is required.");
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const order = await createOrderFromCart({
      userId,
      shippingAddress,
      paymentMethod: "COD",
      paymentStatus: "PENDING",
      orderStatus: "PENDING",
      session,
    });

    await session.commitTransaction();

    const populatedOrder = await getPopulatedOrder(Order.findById(order._id));

    return new ApiResponse(
      201,
      { order: populatedOrder },
      "Order placed successfully.",
    );
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Get Logged-in User Orders
 */
export const getMyOrders = async (userId) => {
  const orders = await getPopulatedOrder(
    Order.find({ user: userId }).sort({ createdAt: -1 }),
  );

  return new ApiResponse(200, { orders }, "Orders fetched successfully.");
};

/**
 * Get Order By ID
 */
export const getOrderById = async (userId, orderId) => {
  const order = await getPopulatedOrder(Order.findById(orderId));

  if (!order) {
    throw new ApiError(404, "Order not found.");
  }

  if (order.user._id.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not authorized to access this order.");
  }

  return new ApiResponse(200, { order }, "Order fetched successfully.");
};

/**
 * Cancel Order
 */
export const cancelOrder = async (userId, orderId) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found.");
  }

  if (order.user.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not authorized to cancel this order.");
  }

  if (order.orderStatus === "CANCELLED") {
    throw new ApiError(400, "Order is already cancelled.");
  }

  const cancellableStatuses = ["PENDING", "CONFIRMED"];

  if (!cancellableStatuses.includes(order.orderStatus)) {
    throw new ApiError(
      400,
      `Order cannot be cancelled once it is ${order.orderStatus.toLowerCase()}.`,
    );
  }

  order.orderStatus = "CANCELLED";

  order.statusHistory.push({
    status: "CANCELLED",
    updatedBy: userId,
  });

  await order.save();

  const populatedOrder = await getPopulatedOrder(Order.findById(order._id));

  return new ApiResponse(
    200,
    { order: populatedOrder },
    "Order cancelled successfully.",
  );
};

/**
 * Get All Orders (Admin)
 */
export const getAllOrders = async () => {
  const orders = await getPopulatedOrder(Order.find().sort({ createdAt: -1 }));

  return new ApiResponse(200, { orders }, "Orders fetched successfully.");
};

/**
 * Get Order By ID (Admin)
 */
export const getOrderByIdForAdmin = async (orderId) => {
  const order = await getPopulatedOrder(Order.findById(orderId));

  if (!order) {
    throw new ApiError(404, "Order not found.");
  }

  return new ApiResponse(200, { order }, "Order fetched successfully.");
};

/**
 * Update Order Status (Admin)
 */
export const updateOrderStatus = async (adminId, orderId, orderStatus) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found.");
  }

  const allowedTransitions = {
    PENDING: ["CONFIRMED", "CANCELLED"],
    CONFIRMED: ["PACKED", "CANCELLED"],
    PACKED: ["SHIPPED"],
    SHIPPED: ["DELIVERED"],
    DELIVERED: [],
    CANCELLED: [],
  };

  if (!allowedTransitions[order.orderStatus].includes(orderStatus)) {
    throw new ApiError(
      400,
      `Order cannot be changed from ${order.orderStatus} to ${orderStatus}.`,
    );
  }

  order.orderStatus = orderStatus;

  if (orderStatus === "DELIVERED") {
    order.deliveredAt = new Date();
  }

  order.statusHistory.push({
    status: orderStatus,
    updatedBy: adminId,
  });

  await order.save();

  const populatedOrder = await getPopulatedOrder(Order.findById(order._id));

  return new ApiResponse(
    200,
    { order: populatedOrder },
    "Order status updated successfully.",
  );
};
