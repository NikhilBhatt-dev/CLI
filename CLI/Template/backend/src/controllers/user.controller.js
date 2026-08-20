import asyncHandler from "../utils/asyncHandler.js";
import * as userService from "../services/user.service.js";

export const getAdminUsers = asyncHandler(async (req, res) => {
  const result = await userService.getAdminUsers();
  res.status(200).json(result);
});

export const getAdminUserById = asyncHandler(async (req, res) => {
  const result = await userService.getAdminUserById(req.params.id);
  res.status(200).json(result);
});
