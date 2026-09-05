import Product from "../models/Product.js";
import Category from "../models/Category.js";
import Order from "../models/Order.js";

import ApiResponse from "../utils/ApiResponse.js";

export const getDashboardStats = async () => {

  const totalProducts = await Product.countDocuments();

  const recentProducts = await Product.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select("name price images stock createdAt");

    const lowStockProducts = await Product.find({
      stock: { $lte: 5 },
    })
      .sort({ stock: 1 })
      .limit(5)
      .select("name stock images");

  const totalCategories = await Category.countDocuments();

  const totalOrders = await Order.countDocuments();

  const orders = await Order.find();

  const totalRevenue = orders.reduce(
    (sum, order) => sum + (order.totalPrice || 0),
    0,
  );


return new ApiResponse(
  200,
  {
    totalProducts,
    totalCategories,
    totalOrders,
    totalRevenue,
    recentProducts,
    lowStockProducts,
},

  "Dashboard stats fetched successfully",

);

};