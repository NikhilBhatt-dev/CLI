import mongoose from "mongoose";

import Blog from "../models/Blog.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

const BLOG_CATEGORIES = [
  "Parenting Tips",
  "Toy Guides",
  "Learning",
  "Gift Ideas",
  "Kids Activities",
  "News & Updates",
];

const slugify = (value = "") => {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "blog";
};

const normalizeTags = (tags = []) => {
  if (Array.isArray(tags)) {
    return tags
      .map((tag) => String(tag).trim())
      .filter(Boolean)
      .map((tag) => tag.replace(/\s+/g, " "));
  }

  if (typeof tags === "string") {
    return tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return [];
};

const validateBlogPayload = (payload, { isUpdate = false } = {}) => {
  const requiredFields = ["title", "excerpt", "content", "category"];

  requiredFields.forEach((field) => {
    if (!payload[field] || !String(payload[field]).trim()) {
      throw new ApiError(400, `${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
    }
  });

  if (!isUpdate && !payload.coverImage) {
    throw new ApiError(400, "Cover image is required");
  }

  if (payload.category && !BLOG_CATEGORIES.includes(payload.category)) {
    const categoryName = String(payload.category).trim();
    if (!categoryName) {
      throw new ApiError(400, "Category is required");
    }
  }

  if (payload.status && !["draft", "published"].includes(payload.status)) {
    throw new ApiError(400, "Status must be either draft or published");
  }
};

const buildUniqueSlug = async (title, currentId = null) => {
  const baseSlug = slugify(title);
  let slug = baseSlug;
  let counter = 1;

  while (await Blog.exists({ slug, _id: { $ne: currentId } })) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  return slug;
};

export const getPublicBlogs = async () => {
  const blogs = await Blog.find({ status: "published" })
    .sort({ publishedAt: -1, createdAt: -1 })
    .lean();

  return new ApiResponse(200, { blogs }, "Published blogs fetched successfully");
};

export const getBlogBySlug = async (slug) => {
  const blog = await Blog.findOne({ slug, status: "published" }).lean();

  if (!blog) {
    throw new ApiError(404, "Blog not found");
  }

  return new ApiResponse(200, { blog }, "Blog fetched successfully");
};

export const getAdminBlogs = async (query = {}) => {
  const { search = "", status = "", category = "" } = query;

  const filter = {};

  if (search) {
    filter.title = { $regex: search, $options: "i" };
  }

  if (status) {
    filter.status = status;
  }

  if (category) {
    filter.category = category;
  }

  const blogs = await Blog.find(filter).sort({ createdAt: -1 }).lean();

  return new ApiResponse(200, { blogs }, "Admin blogs fetched successfully");
};

export const createBlog = async (blogData) => {
  validateBlogPayload(blogData);

  const payload = {
    ...blogData,
    tags: normalizeTags(blogData.tags),
    author: blogData.author || "WonderFox Editorial",
    slug: blogData.slug || (await buildUniqueSlug(blogData.title)),
    status: blogData.status || "draft",
  };

  if (payload.slug) {
    const normalizedSlug = slugify(payload.slug);
    payload.slug = await buildUniqueSlug(normalizedSlug || payload.title, null);
  }

  if (payload.status === "published" && !payload.publishedAt) {
    payload.publishedAt = new Date();
  }

  if (payload.status === "draft") {
    payload.publishedAt = null;
  }

  const existing = await Blog.findOne({ slug: payload.slug });

  if (existing) {
    payload.slug = await buildUniqueSlug(payload.title, existing._id);
  }

  const blog = await Blog.create(payload);

  return new ApiResponse(201, { blog }, "Blog created successfully");
};

export const updateBlog = async (id, blogData) => {
  const existingBlog = await Blog.findById(id);

  if (!existingBlog) {
    throw new ApiError(404, "Blog not found");
  }

  validateBlogPayload(
    {
      ...existingBlog.toObject(),
      ...blogData,
    },
    { isUpdate: true },
  );

  const nextData = {
    ...existingBlog.toObject(),
    ...blogData,
    tags: normalizeTags(blogData.tags ?? existingBlog.tags),
    author: blogData.author || existingBlog.author || "WonderFox Editorial",
  };

  if (blogData.title && blogData.title !== existingBlog.title) {
    nextData.slug = await buildUniqueSlug(blogData.title, existingBlog._id);
  } else if (blogData.slug) {
    nextData.slug = slugify(blogData.slug);
    const duplicate = await Blog.findOne({ slug: nextData.slug, _id: { $ne: existingBlog._id } });
    if (duplicate) {
      nextData.slug = await buildUniqueSlug(nextData.slug, existingBlog._id);
    }
  }

  if (nextData.status === "published") {
    nextData.publishedAt = nextData.publishedAt || new Date();
  } else {
    nextData.publishedAt = null;
  }

  const updatedBlog = await Blog.findByIdAndUpdate(id, nextData, { new: true, runValidators: true });

  return new ApiResponse(200, { blog: updatedBlog }, "Blog updated successfully");
};

export const deleteBlog = async (id) => {
  const deletedBlog = await Blog.findByIdAndDelete(id);

  if (!deletedBlog) {
    throw new ApiError(404, "Blog not found");
  }

  return new ApiResponse(200, { blog: deletedBlog }, "Blog deleted successfully");
};

export const BLOG_CATEGORIES_LIST = BLOG_CATEGORIES;
