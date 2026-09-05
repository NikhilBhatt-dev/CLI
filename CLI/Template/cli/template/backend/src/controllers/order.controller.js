import asyncHandler from "../utils/asyncHandler.js";

import * as orderService from "../services/order.service.js";

export const placeCodOrder = asyncHandler(async (req, res) => {
  const response = await orderService.placeCodOrder(req.user._id, req.body);

  res.status(response.statusCode).json(response);
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const response = await orderService.getMyOrders(req.user._id);

  res.status(response.statusCode).json(response);
});

export const getOrderById = asyncHandler(async (req, res) => {
  const response = await orderService.getOrderById(req.user._id, req.params.id);

  res.status(response.statusCode).json(response);
});

export const cancelOrder = asyncHandler(async (req, res) => {
  const response = await orderService.cancelOrder(req.user._id, req.params.id);

  res.status(response.statusCode).json(response);
});

export const getAllOrders = asyncHandler(async (req, res) => {
  const response = await orderService.getAllOrders();

  res.status(response.statusCode).json(response);
});

export const getOrderByIdForAdmin = asyncHandler(async (req, res) => {
  const response = await orderService.getOrderByIdForAdmin(req.params.id);

  res.status(response.statusCode).json(response);
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const response = await orderService.updateOrderStatus(
    req.user._id,
    req.params.id,
    req.body.orderStatus,
  );

  res.status(response.statusCode).json(response);
});