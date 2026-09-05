import Cart from "../models/Cart.js";
import ApiError from "../utils/ApiError.js";
import getPopulatedCart from "../utils/getPopulatedCart.js";

const getUserCart = async (userId, session = null) => {
  const query = Cart.findOne({ user: userId });

  if (session) {
    query.session(session);
  }

  const cart = await getPopulatedCart(query);

  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, "Cart is empty.");
  }

  return cart;
};

export default getUserCart;
