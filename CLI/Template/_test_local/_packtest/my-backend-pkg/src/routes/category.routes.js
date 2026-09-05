import express from "express";

import {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
} from "../controllers/category.controller.js";

;
import protect from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

/* Public Routes */

router.get("/", getAllCategories);

router.get("/:id", getCategoryById);


/* Protected Routes */

router.post(
    "/",
    protect,
    upload.single("image"),
    createCategory
);

router.put(
    "/:id",
    protect,
    upload.single("image"),
    updateCategory
);

router.delete(
    "/:id",
    protect,
    deleteCategory
);

export default router;