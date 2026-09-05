import Product from "../models/Product.js";
import ApiError from "../utils/ApiError.js";

const validateOrderItems = async (cart, session = null) => {
  if (!cart || !cart.items || cart.items.length === 0) {
    throw new ApiError(400, "Cart is empty.");
  }

  // Support both:
  // item.product = ObjectId
  // item.product = { _id, name, ... }
  const productIds = cart.items.map((item) => {
    if (!item.product) {
      throw new ApiError(400, "Invalid cart item.");
    }

    return item.product._id || item.product;
  });

  let query = Product.find({
    _id: { $in: productIds },
  }).lean();

  if (session) {
    query = query.session(session);
  }

  const products = await query;

  const productMap = new Map(
    products.map((product) => [product._id.toString(), product]),
  );

  const validatedItems = [];

  for (const cartItem of cart.items) {
    const productId = cartItem.product._id || cartItem.product;

    const product = productMap.get(productId.toString());

    if (!product) {
      throw new ApiError(404, "Product not found.");
    }

    if (!product.isActive) {
      throw new ApiError(400, `${product.name} is currently unavailable.`);
    }

    if (!Number.isInteger(cartItem.quantity) || cartItem.quantity < 1) {
      throw new ApiError(400, `Invalid quantity for ${product.name}.`);
    }

    if (product.stock < cartItem.quantity) {
      throw new ApiError(
        400,
        `Only ${product.stock} item(s) available for ${product.name}.`,
      );
    }

    validatedItems.push({
      product,
      quantity: cartItem.quantity,
    });
  }

  return validatedItems;
};

export default validateOrderItems;
