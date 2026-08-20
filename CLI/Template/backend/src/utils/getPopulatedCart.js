import Cart from "../models/Cart.js";

const getPopulatedCart = async (cartOrQuery) => {
  const query =
    typeof cartOrQuery?.populate === "function"
      ? cartOrQuery
      : Cart.findById(cartOrQuery);

  return await query
    .populate("items.product", "name price discountPrice images stock isActive")
    .populate("user", "name email");
};

export default getPopulatedCart;
