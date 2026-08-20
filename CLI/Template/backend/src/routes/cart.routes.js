import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../controllers/cart.controller.js";

const router = express.Router();

// All cart routes are protected
router.use(protect);

// Get Cart
router.get("/", getCart);

// Add Product To Cart
router.post("/", addToCart);

// Update Product Quantity
router.patch("/:productId", updateCartItem);

// Remove Product From Cart
router.delete("/:productId", removeCartItem);

// Clear Cart
router.delete("/", clearCart);

export default router;
