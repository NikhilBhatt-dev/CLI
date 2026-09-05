import asyncHandler from "../utils/asyncHandler.js";
import sendResponse from "../utils/sendResponse.js";
import * as cartService from "../services/cart.service.js";

export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;

  const response = await cartService.addToCart(
    req.user._id,
    productId,
    quantity,
  );

  return sendResponse(res, response);
});

export const getCart = asyncHandler(async (req, res) => {
  const response = await cartService.getCart(req.user._id);

  return sendResponse(res, response);
});

export const updateCartItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  const response = await cartService.updateCartItem(
    req.user._id,
    productId,
    quantity,
  );

  return sendResponse(res, response);
});

export const removeCartItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const response = await cartService.removeCartItem(req.user._id, productId);

  return sendResponse(res, response);
});

export const clearCart = asyncHandler(async (req, res) => {
  const response = await cartService.clearCart(req.user._id);

  return sendResponse(res, response);
});
