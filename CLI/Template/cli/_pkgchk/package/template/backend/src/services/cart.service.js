import Cart from "../models/Cart.js";

import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import calculateCartTotal from "../utils/calculateCartTotal.js";
import getPopulatedCart from "../utils/getPopulatedCart.js";
import getValidProduct from "../utils/getValidProduct.js";
import validateQuantity from "../utils/validateQuantity.js";

/**
 * Get User Cart
 */
const getUserCart = async (userId, populate = false) => {
  let query = Cart.findOne({ user: userId });

  if (populate) {
    query = query
      .populate(
        "items.product",
        "name price discountPrice images stock isActive",
      )
      .populate("user", "name email");
  }

  const cart = await query;

  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  return cart;
};

/**
 * Save Cart & Return Populated Cart
 */
const saveAndPopulateCart = async (cart) => {
  cart.totalAmount = calculateCartTotal(cart.items);

  await cart.save();

  return getPopulatedCart(cart._id);
};

/**
 * Add Product To Cart
 */
export const addToCart = async (userId, productId, quantity = 1) => {
  validateQuantity(quantity);

  const product = await getValidProduct(productId);

  if (quantity > product.stock) {
    throw new ApiError(400, "Insufficient stock");
  }

  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = await Cart.create({
      user: userId,
      items: [],
      totalAmount: 0,
    });
  }

  const existingItem = cart.items.find(
    (item) => item.product.toString() === productId,
  );

  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity;

    if (newQuantity > product.stock) {
      throw new ApiError(400, "Insufficient stock");
    }

    existingItem.quantity = newQuantity;
  } else {
    cart.items.push({
      product: product._id,
      quantity,
      price: product.price,
    });
  }

  const updatedCart = await saveAndPopulateCart(cart);

  return new ApiResponse(200, { cart: updatedCart }, "Product added to cart");
};


/**
 * Get User Cart
 */
export const getCart = async (userId) => {
  try {
    const cart = await getUserCart(userId, true);

    return new ApiResponse(
      200,
      { cart },
      "Cart fetched successfully"
    );
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) {
      return new ApiResponse(
        200,
        {
          items: [],
          totalAmount: 0,
        },
        "Cart is empty"
      );
    }

    throw error;
  }
};


/**
 * Update Cart Item Quantity
 */
export const updateCartItem = async (userId, productId, quantity) => {
  validateQuantity(quantity);

  const cart = await getUserCart(userId);

  const item = cart.items.find(
    (item) => item.product.toString() === productId
  );

  if (!item) {
    throw new ApiError(404, "Product not found in cart");
  }

  const product = await getValidProduct(productId);

  if (quantity > product.stock) {
    throw new ApiError(400, "Insufficient stock");
  }

  item.quantity = quantity;

  const updatedCart = await saveAndPopulateCart(cart);

  return new ApiResponse(
    200,
    { cart: updatedCart },
    "Cart updated successfully"
  );
};


/**
 * Remove Product From Cart
 */
export const removeCartItem = async (userId, productId) => {
 

  const cart = await getUserCart(userId);

  const initialLength = cart.items.length;

  cart.items = cart.items.filter(
    (item) => item.product.toString() !== productId
  );

  if (cart.items.length === initialLength) {
    throw new ApiError(404, "Product not found in cart");
  }

  const updatedCart = await saveAndPopulateCart(cart);

  return new ApiResponse(
    200,
    { cart: updatedCart },
    "Product removed from cart"
  );
};

/**
 * Clear User Cart
 */
export const clearCart = async (userId) => {
  const cart = await getUserCart(userId);

  cart.items = [];

  const updatedCart = await saveAndPopulateCart(cart);

  return new ApiResponse(
    200,
    { cart: updatedCart },
    "Cart cleared successfully"
  );
};