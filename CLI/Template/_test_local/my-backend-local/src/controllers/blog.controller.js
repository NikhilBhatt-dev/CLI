import asyncHandler from "../utils/asyncHandler.js";
import * as blogService from "../services/blog.service.js";

export const getPublicBlogsController = asyncHandler(async (req, res) => {
  const result = await blogService.getPublicBlogs();
  res.status(200).json(result);
});

export const getBlogBySlugController = asyncHandler(async (req, res) => {
  const result = await blogService.getBlogBySlug(req.params.slug);
  res.status(200).json(result);
});

export const getAdminBlogsController = asyncHandler(async (req, res) => {
  const result = await blogService.getAdminBlogs(req.query);
  res.status(200).json(result);
});

export const createBlogController = asyncHandler(async (req, res) => {
  const result = await blogService.createBlog(req.body);
  res.status(201).json(result);
});

export const updateBlogController = asyncHandler(async (req, res) => {
  const result = await blogService.updateBlog(req.params.id, req.body);
  res.status(200).json(result);
});

export const deleteBlogController = asyncHandler(async (req, res) => {
  const result = await blogService.deleteBlog(req.params.id);
  res.status(200).json(result);
});
