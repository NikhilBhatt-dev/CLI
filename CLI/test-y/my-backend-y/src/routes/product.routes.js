import express from "express";
import protect from "../middleware/authMiddleware.js";

import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js";
import { getProductReviews, saveProductReview } from "../controllers/review.controller.js";

const router = express.Router();


router.get("/", getAllProducts);
router.get("/:id/reviews", getProductReviews);
router.post("/:id/reviews", protect, saveProductReview);
router.get("/:id", getProductById);

router.post("/", protect, createProduct);
router.put("/:id", protect, updateProduct);
router.delete("/:id", protect, deleteProduct);

export default router;
