import asyncHandler from "../utils/asyncHandler.js";
import * as uploadService from "../services/upload.service.js";

export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new Error("Image is required");
  }

  const image = await uploadService.uploadImage(req.file);

  res.status(200).json({
    success: true,
    message: "Image uploaded successfully",
    data: image,
  });
});
