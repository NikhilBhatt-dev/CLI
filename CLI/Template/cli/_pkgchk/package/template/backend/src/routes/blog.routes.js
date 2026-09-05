import express from "express";

import {
  createBlogController,
  deleteBlogController,
  getAdminBlogsController,
  getBlogBySlugController,
  getPublicBlogsController,
  updateBlogController,
} from "../controllers/blog.controller.js";
import protect from "../middleware/authMiddleware.js";
import authorize from "../middleware/adminMiddleware.js";

const router = express.Router();

router.get("/", getPublicBlogsController);
router.get("/admin", protect, authorize("admin"), getAdminBlogsController);
router.get("/:slug", getBlogBySlugController);

router.post("/", protect, authorize("admin"), createBlogController);
router.put("/:id", protect, authorize("admin"), updateBlogController);
router.delete("/:id", protect, authorize("admin"), deleteBlogController);

export default router;
