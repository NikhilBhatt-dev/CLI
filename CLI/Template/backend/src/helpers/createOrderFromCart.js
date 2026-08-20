import Cart from "../models/Cart.js";
import Order from "../models/Order.js";

import getUserCart from "./getUserCart.js";
import validateOrderItems from "./validateOrderItems.js";
import buildOrderItemsSnapshot from "./buildOrderItemsSnapshot.js";
import calculateOrderTotal from "./calculateOrderTotal.js";
import generateOrderNumber from "./generateOrderNumber.js";
import updateProductStock from "./updateProductStock.js";



  const createOrderFromCart = async ({
  userId,
  shippingAddress,
  paymentMethod,
  paymentStatus,
  paymentResult = null,
  paidAt = null,
  orderStatus = "PENDING",
  session,
}) => {
  // Get User Cart
  const cart = await getUserCart(userId, session);

  // Validate Products & Stock
  const validatedItems = await validateOrderItems(cart, session);

  // Create Order Snapshot
  const orderItems = buildOrderItemsSnapshot(validatedItems);

  // Calculate Pricing
  const { itemsPrice, shippingPrice, taxPrice, totalPrice } =
    calculateOrderTotal(orderItems);

  // Generate Order Number
  const orderNumber = generateOrderNumber();

  // Create Order
  const [order] = await Order.create(
    [
      {
        orderNumber,
        user: userId,
        items: orderItems,
        shippingAddress,


        paymentMethod,
        paymentStatus,
        paymentResult,
        paidAt,

        orderStatus,

        statusHistory: [
          {
            status: orderStatus,
            updatedBy: userId,
          },
        ],

        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
      },
    ],
    { session },
  );

  // Update Product Stock
  await updateProductStock(validatedItems, session);

  // Clear User Cart
  await Cart.updateOne(
    { user: userId },
    {
      $set: {
        items: [],
        totalAmount: 0,
      },
    },
    { session },
  );

  return order;
};

export default createOrderFromCart;
