import asyncHandler from "../utils/asyncHandler.js";
import { sendContactMessage } from "../services/contact.service.js";

export const submitContactController = asyncHandler(async (req, res) => {
  const result = await sendContactMessage(req.body);
  res.status(result.statusCode || 200).json(result);
});
