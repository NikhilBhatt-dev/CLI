import ApiError from "./ApiError.js";

const validateQuantity = (quantity) => {
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new ApiError(400, "Quantity must be a positive integer");
  }
};

export default validateQuantity;
