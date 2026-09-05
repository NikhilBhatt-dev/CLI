import asyncHandler from "../utils/asyncHandler.js";
import * as reviewService from "../services/review.service.js";

export const getProductReviews = asyncHandler(async (req, res) => {
  const result = await reviewService.getProductReviews(req.params.id);
  res.status(200).json(result);
});

export const saveProductReview = asyncHandler(async (req, res) => {
  const result = await reviewService.createOrUpdateReview(req.params.id, req.user._id, req.body);
  res.status(200).json(result);
});
