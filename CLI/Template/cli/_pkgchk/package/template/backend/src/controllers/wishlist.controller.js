import asyncHandler from "../utils/asyncHandler.js";

import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  clearWishlist,
} from "../services/wishlist.service.js";

import sendResponse from "../utils/sendResponse.js";

/**
 * Add Product To Wishlist
 */
export const addToWishlistController = asyncHandler(async (req, res) => {
  const response = await addToWishlist(req.user._id, req.body.productId);

  sendResponse(res, response);
});

/**
 * Get Wishlist
 */
export const getWishlistController = asyncHandler(async (req, res) => {
  const response = await getWishlist(req.user._id);

  sendResponse(res, response);
});

/**
 * Remove Product From Wishlist
 */
export const removeFromWishlistController = asyncHandler(async (req, res) => {
  const response = await removeFromWishlist(req.user._id, req.params.productId);

  sendResponse(res, response);
});

/**
 * Clear Wishlist
 */
export const clearWishlistController = asyncHandler(async (req, res) => {
  const response = await clearWishlist(req.user._id);

  sendResponse(res, response);
});
