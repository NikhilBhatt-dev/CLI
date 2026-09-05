// import Category from "../models/Category.js";
// import ApiError from "../utils/ApiError.js";
// import ApiResponse from "../utils/ApiResponse.js";

// // Create Category
// export const createCategory = async (categoryData) => {
//   const { name, description, image } = categoryData;

//   if (!name) {
//     throw new ApiError(400, "Category name is required");
//   }

//   const existingCategory = await Category.findOne({ name });

//   if (existingCategory) {
//     throw new ApiError(400, "Category already exists");
//   }

//   const category = await Category.create({
//     name,
//     description,
//     image,
//   });

//   return new ApiResponse(201, { category }, "Category created successfully");
// };

// // Get All Categories
// export const getAllCategories = async () => {
//   const categories = await Category.find();

//   return new ApiResponse(
//     200,
//     { categories },
//     "Categories fetched successfully",
//   );
// };

// // Get Category By ID
// export const getCategoryById = async (id) => {
//   const category = await Category.findById(id);

//   if (!category) {
//     throw new ApiError(404, "Category not found");
//   }

//   return new ApiResponse(200, { category }, "Category fetched successfully");
// };

// // Update Category
// export const updateCategory = async (id, updateData) => {
//   const category = await Category.findById(id);

//   if (!category) {
//     throw new ApiError(404, "Category not found");
//   }

//   Object.assign(category, updateData);

//   await category.save();

//   return new ApiResponse(200, { category }, "Category updated successfully");
// };

// // Delete Category
// export const deleteCategory = async (id) => {
//   const category = await Category.findById(id);

//   if (!category) {
//     throw new ApiError(404, "Category not found");
//   }

//   await category.deleteOne();

//   return new ApiResponse(200, null, "Category deleted successfully");
// };



import Category from "../models/Category.js";

import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

import { uploadImage } from "./upload.service.js";


// Create Category

export const createCategory = async (categoryData, file) => {

    const {
        name,
        description,
    } = categoryData;


    if (!name) {

        throw new ApiError(
            400,
            "Category name is required"
        );

    }


    const existingCategory = await Category.findOne({
        name,
    });


    if (existingCategory) {

        throw new ApiError(
            400,
            "Category already exists"
        );

    }


    let image = "";


    if (file) {

        const uploadedImage = await uploadImage(file);

        image = uploadedImage.url;

    }


    const category = await Category.create({

        name,

        description,

        image,

    });


    return new ApiResponse(
        201,
        { category },
        "Category created successfully"
    );

};


// Get All Categories

export const getAllCategories = async () => {

    const categories = await Category.find({
        isActive: true,
    });


    return new ApiResponse(
        200,
        { categories },
        "Categories fetched successfully"
    );

};


// Get Category By ID

export const getCategoryById = async (id) => {

    const category = await Category.findById(id);


    if (!category) {

        throw new ApiError(
            404,
            "Category not found"
        );

    }


    return new ApiResponse(
        200,
        { category },
        "Category fetched successfully"
    );

};


// Update Category

export const updateCategory = async (
    id,
    updateData,
    file
) => {

    const category = await Category.findById(id);


    if (!category) {

        throw new ApiError(
            404,
            "Category not found"
        );

    }


    if (updateData.name) {

        category.name = updateData.name;

    }


    if (updateData.description !== undefined) {

        category.description =
            updateData.description;

    }


    if (updateData.isActive !== undefined) {

        category.isActive =
            updateData.isActive;

    }


    if (file) {

        const uploadedImage =
            await uploadImage(file);

        category.image =
            uploadedImage.url;

    }


    await category.save();


    return new ApiResponse(
        200,
        { category },
        "Category updated successfully"
    );

};


// Delete Category

export const deleteCategory = async (id) => {

    const category = await Category.findById(id);


    if (!category) {

        throw new ApiError(
            404,
            "Category not found"
        );

    }


    await category.deleteOne();


    return new ApiResponse(
        200,
        null,
        "Category deleted successfully"
    );

};