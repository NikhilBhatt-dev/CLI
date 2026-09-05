// import asyncHandler from "../utils/asyncHandler.js";
// import * as categoryService from "../services/category.service.js";

// // Create Category
// export const createCategory = asyncHandler(async (req, res) => {
//   const result = await categoryService.createCategory(req.body);

//   res.status(201).json(result);
// });

// // Get All Categories
// export const getAllCategories = asyncHandler(async (req, res) => {
//   const result = await categoryService.getAllCategories();

//   res.status(200).json(result);
// });

// // Get Category By ID
// export const getCategoryById = asyncHandler(async (req, res) => {
//   const result = await categoryService.getCategoryById(req.params.id);

//   res.status(200).json(result);
// });

// // Update Category
// export const updateCategory = asyncHandler(async (req, res) => {
//   const result = await categoryService.updateCategory(req.params.id, req.body);

//   res.status(200).json(result);
// });

// // Delete Category
// export const deleteCategory = asyncHandler(async (req, res) => {
//   const result = await categoryService.deleteCategory(req.params.id);

//   res.status(200).json(result);
// });



import asyncHandler from "../utils/asyncHandler.js";

import * as categoryService from "../services/category.service.js";


// Create Category

export const createCategory = asyncHandler(async (req, res) => {

    const result = await categoryService.createCategory(
        req.body,
        req.file
    );

    res.status(201).json(result);

});


// Get All Categories

export const getAllCategories = asyncHandler(async (req, res) => {

    const result = await categoryService.getAllCategories();

    res.status(200).json(result);

});


// Get Category By ID

export const getCategoryById = asyncHandler(async (req, res) => {

    const result = await categoryService.getCategoryById(
        req.params.id
    );

    res.status(200).json(result);

});


// Update Category

export const updateCategory = asyncHandler(async (req, res) => {

    const result = await categoryService.updateCategory(
        req.params.id,
        req.body,
        req.file
    );

    res.status(200).json(result);

});


// Delete Category

export const deleteCategory = asyncHandler(async (req, res) => {

    const result = await categoryService.deleteCategory(
        req.params.id
    );

    res.status(200).json(result);

});
