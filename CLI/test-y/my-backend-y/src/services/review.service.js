import mongoose from "mongoose";
import Product from "../models/Product.js";
import Review from "../models/Review.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

const updateProductRating = async (productId) => {
  const [summary] = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId) } },
    { $group: { _id: "$product", rating: { $avg: "$rating" }, numReviews: { $sum: 1 } } },
  ]);

  const rating = summary ? Number(summary.rating.toFixed(1)) : 0;
  const numReviews = summary?.numReviews || 0;

  return Product.findByIdAndUpdate(
    productId,
    { rating, numReviews },
    { new: true },
  ).populate("category", "name description");
};

export const getProductReviews = async (productId) => {
  if (!mongoose.isValidObjectId(productId)) {
    throw new ApiError(400, "Invalid product ID");
  }

  const reviews = await Review.find({ product: productId })
    .populate("user", "name")
    .sort({ createdAt: -1 });

  return new ApiResponse(200, { reviews }, "Reviews fetched successfully");
};

export const createOrUpdateReview = async (productId, userId, reviewData) => {
  if (!mongoose.isValidObjectId(productId)) {
    throw new ApiError(400, "Invalid product ID");
  }

  const rating = Number(reviewData.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new ApiError(400, "Rating must be a whole number between 1 and 5");
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  const comment = typeof reviewData.comment === "string" ? reviewData.comment.trim() : "";
  const review = await Review.findOneAndUpdate(
    { product: productId, user: userId },
    { rating, comment },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  ).populate("user", "name");

  const updatedProduct = await updateProductRating(productId);
  return new ApiResponse(200, { review, product: updatedProduct }, "Review saved successfully");
};
