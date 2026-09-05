import Product from "../models/Product.js";
import Category from "../models/Category.js";
import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

export const createProduct = async (productData, userId) => {



  const {
    name,
    description,
    price,
    discountPrice,
    category,
    stock,
    brand,
    isFeatured,
    images,
  } = productData;

  // Basic validation
  if (!name || !description || !price || !category) {
    throw new ApiError(400, "Please fill all required fields");
  }

  // Check if category exists
  const existingCategory = await Category.findById(category);

  if (!existingCategory) {
    throw new ApiError(404, "Category not found");
  }


  const product = await Product.create({
    name,
    description,
    price,
    discountPrice,
    category,
    images,
    stock,
    brand,
    isFeatured,
    createdBy: userId,
  });
  return new ApiResponse(201, { product }, "Product created successfully");
};

export const getAllProducts = async (queryParams) => {
  const {
    search,
    category,
    minPrice,
    maxPrice,
    page = 1,
    limit = 10,
    sort = "-createdAt",
  } = queryParams;

  const filter = {};

  // Search by product name
  if (search) {
    filter.name = {
      $regex: search,
      $options: "i",
    };
  }

  // Filter by category
  if (category) {
    // Aggregate pipelines do not apply Mongoose's normal ObjectId casting.
    // Convert the query-string ID before matching it against Product.category.
    if (!mongoose.isValidObjectId(category)) {
      throw new ApiError(400, "Invalid category filter");
    }

    filter.category = new mongoose.Types.ObjectId(category);
  }

  // Pagination
  const currentPage = Math.max(1, Number(page));
  const perPage = Math.max(1, Number(limit));
  const skip = (currentPage - 1) * perPage;

  // Allowed sort fields
  const allowedSortFields = [
    "price",
    "-price",
    "createdAt",
    "-createdAt",
    "name",
    "-name",
  ];

  const sortOption = allowedSortFields.includes(sort) ? sort : "-createdAt";
  const sortField = sortOption.startsWith("-") ? sortOption.slice(1) : sortOption;
  const sortOrder = sortOption.startsWith("-") ? -1 : 1;

  const pipeline = [{ $match: filter }];

  pipeline.push({
    $addFields: {
      sellingPrice: {
        $cond: [
          {
            $and: [
              { $gt: ["$discountPrice", 0] },
              { $lte: ["$discountPrice", "$price"] },
            ],
          },
          "$discountPrice",
          "$price",
        ],
      },
    },
  });

  if (minPrice || maxPrice) {
    const sellingPriceFilter = {};

    if (minPrice) {
      sellingPriceFilter.$gte = Number(minPrice);
    }

    if (maxPrice) {
      sellingPriceFilter.$lte = Number(maxPrice);
    }

    pipeline.push({
      $match: {
        sellingPrice: sellingPriceFilter,
      },
    });
  }

  const sortStage =
    sortField === "price"
      ? { $sort: { sellingPrice: sortOrder, _id: 1 } }
      : { $sort: { [sortField]: sortOrder, _id: 1 } };

  const aggregation = await Product.aggregate([
    ...pipeline,
    {
      $facet: {
        metadata: [{ $count: "totalProducts" }],
        data: [sortStage, { $skip: skip }, { $limit: perPage }, { $project: { sellingPrice: 0 } }],
      },
    },
  ]);

  const metadata = aggregation[0]?.metadata[0] || { totalProducts: 0 };
  const productDocs = aggregation[0]?.data || [];

  const products = await Product.populate(productDocs, [
    { path: "createdBy", select: "name email" },
    { path: "category", select: "name description" },
  ]);

  return new ApiResponse(
    200,
    {
      products,
      pagination: {
        totalProducts: metadata.totalProducts,
        currentPage,
        perPage,
        totalPages: Math.ceil(metadata.totalProducts / perPage),
      },
    },
    "Products fetched successfully",
  );
};

export const getProductById = async (id) => {
  const product = await Product.findById(id)
    .populate("createdBy", "name email")
    .populate("category", "name description");

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  return new ApiResponse(200, { product }, "Product fetched successfully");
};

export const updateProduct = async (id, updateData) => {
  // If category is being updated, verify it exists
  if (updateData.category) {
    const existingCategory = await Category.findById(updateData.category);

    if (!existingCategory) {
      throw new ApiError(404, "Category not found");
    }
  }

  const product = await Product.findById(id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  Object.assign(product, updateData);

  await product.save();

  return new ApiResponse(200, { product }, "Product updated successfully");
};

export const deleteProduct = async (id) => {
  const product = await Product.findById(id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  await product.deleteOne();

  return new ApiResponse(200, null, "Product deleted successfully");
};
