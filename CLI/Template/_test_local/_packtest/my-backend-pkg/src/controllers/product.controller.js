import asyncHandler from "../utils/asyncHandler.js";
import * as productService from "../services/product.service.js";
export const createProduct = asyncHandler(async (req, res) => {
  const result = await productService.createProduct(req.body, req.user._id);

  res.status(201).json(result);
});


export const getAllProducts = asyncHandler(async (req, res) => {
  const result = await productService.getAllProducts(req.query);

  res.status(200).json(result);
});

export const getProductById = asyncHandler(async (req, res) => {
  const result = await productService.getProductById(req.params.id);

  res.status(200).json(result);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const result = await productService.updateProduct(req.params.id, req.body);

  res.status(200).json(result);
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const result = await productService.deleteProduct(req.params.id);

  res.status(200).json(result);
});