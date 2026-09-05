import Wishlist from "../models/Wishlist.js";

const getPopulatedWishlist = (query) => {
  return query
    .populate("items.product", "name price discountPrice images stock isActive")
    .populate("user", "name email");
};

export default getPopulatedWishlist;
