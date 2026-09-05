import Product from "../models/Product.js";
import ApiError from "./ApiError.js";
import validateObjectId from "./validateObjectId.js";

const getValidProduct = async (productId) => {
  validateObjectId(productId);

  const product = await Product.findById(productId);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  if (!product.isActive) {
    throw new ApiError(400, "Product is not available");
  }

  return product;
};

export default getValidProduct;
