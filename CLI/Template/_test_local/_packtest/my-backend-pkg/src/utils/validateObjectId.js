import mongoose from "mongoose";
import ApiError from "./ApiError.js";

const validateObjectId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid Object ID");
  }
};

export default validateObjectId;
