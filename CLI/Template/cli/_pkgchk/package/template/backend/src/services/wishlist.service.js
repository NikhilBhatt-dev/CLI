// import Wishlist from "../models/Wishlist.js";

// import ApiError from "../utils/ApiError.js";
// import ApiResponse from "../utils/ApiResponse.js";
// import getValidProduct from "../utils/getValidProduct.js";

// /**
//  * Get User Wishlist
//  */
// const getUserWishlist = async (userId, populate = false) => {
//   let query = Wishlist.findOne({ user: userId });

//   if (populate) {
//     query = query
//       .populate(
//         "items.product",
//         "name price discountPrice images stock isActive",
//       )
//       .populate("user", "name email");
//   }

//   const wishlist = await query;

//   if (!wishlist) {
//     throw new ApiError(404, "Wishlist not found");
//   }

//   return wishlist;
// };

// /**
//  * Save & Populate Wishlist
//  */

// const saveAndPopulateWishlist = async (wishlist) => {
//   await wishlist.save();

//   return getPopulatedWishlist(wishlist._id);
// };

// /**
//  * Add Product To Wishlist
//  */
// export const addToWishlist = async (userId, productId) => {
//   const product = await getValidProduct(productId);

//   let wishlist = await Wishlist.findOne({ user: userId });

//   if (!wishlist) {
//     wishlist = await Wishlist.create({
//       user: userId,
//       items: [],
//     });
//   }

//   const alreadyExists = wishlist.items.some(
//     (item) => item.product.toString() === productId,
//   );

//   if (alreadyExists) {
//     throw new ApiError(400, "Product already exists in wishlist");
//   }

//   wishlist.items.push({
//     product: product._id,
//   });

//   const updatedWishlist = await saveAndPopulateWishlist(wishlist);

//   return new ApiResponse(
//     200,
//     { wishlist: updatedWishlist },
//     "Product added to wishlist",
//   );
// };

// /**
//  * Get User Wishlist
//  */
// export const getWishlist = async (userId) => {
//   try {
//     const wishlist = await getUserWishlist(userId, true);

//     return new ApiResponse(
//       200,
//       { wishlist },
//       "Wishlist fetched successfully"
//     );
//   } catch (error) {
//     if (error instanceof ApiError && error.statusCode === 404) {
//       return new ApiResponse(
//         200,
//         {
//           items: [],
//         },
//         "Wishlist is empty"
//       );
//     }

//     throw error;
//   }
// };

import Wishlist from "../models/Wishlist.js";

import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import getValidProduct from "../utils/getValidProduct.js";
import getPopulatedWishlist from "../utils/getPopulatedWishlist.js";

/**
 * Get User Wishlist
 */
const getUserWishlist = async (userId, populate = false) => {
  let query = Wishlist.findOne({ user: userId });

  if (populate) {
    query = getPopulatedWishlist(query);
  }

  let wishlist = await query;

  if (!wishlist) {
    wishlist = await Wishlist.create({
      user: userId,
      items: [],
    });

    if (populate) {
      wishlist = await getPopulatedWishlist(Wishlist.findById(wishlist._id));
    }
  }

  return wishlist;
};

/**
 * Save & Populate Wishlist
 */
const saveAndPopulateWishlist = async (wishlist) => {
  await wishlist.save();

  return getPopulatedWishlist(Wishlist.findById(wishlist._id));
};

/**
 * Add Product To Wishlist
 */
export const addToWishlist = async (userId, productId) => {
  await getValidProduct(productId);

  const wishlist = await getUserWishlist(userId);

  const alreadyExists = wishlist.items.some(
    (item) => item.product.toString() === productId,
  );

  if (alreadyExists) {
    throw new ApiError(409, "Product already exists in wishlist");
  }

  wishlist.items.push({
    product: productId,
  });

  const updatedWishlist = await saveAndPopulateWishlist(wishlist);

  return new ApiResponse(
    200,
    { wishlist: updatedWishlist },
    "Product added to wishlist",
  );
};

/**
 * Get User Wishlist
 */
export const getWishlist = async (userId) => {
  const wishlist = await getUserWishlist(userId, true);

  return new ApiResponse(200, { wishlist }, "Wishlist fetched successfully");
};

/**
 * Remove Product From Wishlist
 */
export const removeFromWishlist = async (userId, productId) => {
  const wishlist = await getUserWishlist(userId);

  const initialLength = wishlist.items.length;

  wishlist.items = wishlist.items.filter(
    (item) => item.product.toString() !== productId,
  );

  if (wishlist.items.length === initialLength) {
    throw new ApiError(404, "Product not found in wishlist");
  }

  const updatedWishlist = await saveAndPopulateWishlist(wishlist);

  return new ApiResponse(
    200,
    { wishlist: updatedWishlist },
    "Product removed from wishlist",
  );
};

/**
 * Clear Wishlist
 */
export const clearWishlist = async (userId) => {
  const wishlist = await getUserWishlist(userId);

  wishlist.items = [];

  const updatedWishlist = await saveAndPopulateWishlist(wishlist);

  return new ApiResponse(
    200,
    { wishlist: updatedWishlist },
    "Wishlist cleared successfully",
  );
};