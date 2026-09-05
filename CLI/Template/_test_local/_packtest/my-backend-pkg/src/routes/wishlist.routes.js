import express from "express";

import {
  addToWishlistController,
  getWishlistController,
  removeFromWishlistController,
  clearWishlistController,
} from "../controllers/wishlist.controller.js";

import  protect  from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router
  .route("/")
  .post(addToWishlistController)
  .get(getWishlistController)
  .delete(clearWishlistController);

router.delete("/:productId", removeFromWishlistController);

export default router;
