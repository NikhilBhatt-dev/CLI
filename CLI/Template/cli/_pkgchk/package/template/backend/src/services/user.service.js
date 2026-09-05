import mongoose from "mongoose";
import User from "../models/User.js";
import Order from "../models/Order.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

const userSummaryLookup = [
  {
    $lookup: {
      from: "orders",
      let: { userId: "$_id" },
      pipeline: [
        { $match: { $expr: { $eq: ["$user", "$$userId"] } } },
        {
          $group: {
            _id: null,
            numberOfOrders: { $sum: 1 },
            totalSpent: {
              $sum: {
                $cond: [{ $eq: ["$orderStatus", "CANCELLED"] }, 0, "$totalPrice"],
              },
            },
          },
        },
      ],
      as: "orderSummary",
    },
  },
  {
    $lookup: {
      from: "orders",
      let: { userId: "$_id" },
      pipeline: [
        { $match: { $expr: { $eq: ["$user", "$$userId"] } } },
        { $sort: { createdAt: -1 } },
        { $limit: 1 },
        { $project: { "shippingAddress.phone": 1 } },
      ],
      as: "latestOrder",
    },
  },
];

export const getAdminUsers = async () => {
  const users = await User.aggregate([
    ...userSummaryLookup,
    {
      $project: {
        name: 1,
        email: 1,
        role: 1,
        isActive: 1,
        createdAt: 1,
        numberOfOrders: { $ifNull: [{ $arrayElemAt: ["$orderSummary.numberOfOrders", 0] }, 0] },
        totalSpent: { $ifNull: [{ $arrayElemAt: ["$orderSummary.totalSpent", 0] }, 0] },
        phone: { $ifNull: [{ $arrayElemAt: ["$latestOrder.shippingAddress.phone", 0] }, ""] },
      },
    },
    { $sort: { createdAt: -1 } },
  ]);

  return new ApiResponse(200, { users }, "Users fetched successfully.");
};

export const getAdminUserById = async (userId) => {
  if (!mongoose.isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user ID.");
  }

  // Explicit selection ensures the password field can never enter this response.
  const user = await User.findById(userId)
    .select("name email role isActive createdAt updatedAt")
    .lean();

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  const [summary] = await Order.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        numberOfOrders: { $sum: 1 },
        totalSpent: {
          $sum: { $cond: [{ $eq: ["$orderStatus", "CANCELLED"] }, 0, "$totalPrice"] },
        },
      },
    },
  ]);

  const recentOrders = await Order.find({ user: userId })
    .select("orderNumber totalPrice orderStatus paymentStatus shippingAddress statusHistory createdAt")
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  return new ApiResponse(
    200,
    {
      user: {
        ...user,
        phone: recentOrders[0]?.shippingAddress?.phone || "",
        address: recentOrders[0]?.shippingAddress || null,
        numberOfOrders: summary?.numberOfOrders || 0,
        totalSpent: summary?.totalSpent || 0,
        recentOrders,
      },
    },
    "User details fetched successfully.",
  );
};
