import mongoose from "mongoose";

const ORDER_STATUS = [
  "PENDING",
  "CONFIRMED",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

const PAYMENT_METHODS = ["COD", "RAZORPAY"];

const PAYMENT_STATUS = ["PENDING", "PAID", "FAILED", "REFUNDED"];

const COUNTRIES = ["India"];

// ==============================
// Order Item Schema
// ==============================

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
      default: "",
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    discountPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    _id: false,
  },
);

// ==============================
// Shipping Address Schema
// ==============================

const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 10,
      match: [/^[6-9]\d{9}$/, "Please enter a valid Indian phone number."],
    },

    addressLine1: {
      type: String,
      required: true,
      trim: true,
    },

    addressLine2: {
      type: String,
      trim: true,
      default: "",
    },

    landmark: {
      type: String,
      trim: true,
      default: "",
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    state: {
      type: String,
      required: true,
      trim: true,
    },

    postalCode: {
      type: String,
      required: true,
      trim: true,
      minlength: 6,
      maxlength: 6,
      match: [/^\d{6}$/, "Please enter a valid Indian postal code."],
    },

    country: {
      type: String,
      enum: COUNTRIES,
      required: true,
      default: "India",
      trim: true,
    },
  },
  {
    _id: false,
  },
);

// ==============================
// Payment Result Schema
// ==============================

const paymentResultSchema = new mongoose.Schema(
  {
    razorpayOrderId: {
      type: String,
      default: "",
    },

    razorpayPaymentId: {
      type: String,
      default: "",
    },

    razorpaySignature: {
      type: String,
      default: "",
    },
  },
  {
    _id: false,
  },
);

// ==============================
// Status History Schema
// ==============================

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ORDER_STATUS,
      required: true,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    _id: false,
  },
);

// ==============================
// Order Schema
// ==============================

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items) => items.length > 0,
        message: "Order must contain at least one item.",
      },
    },

    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },

    paymentMethod: {
      type: String,
      enum: PAYMENT_METHODS,
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: PAYMENT_STATUS,
      default: "PENDING",
    },

    paymentResult: {
      type: paymentResultSchema,
      default: () => ({}),
    },

    orderStatus: {
      type: String,
      enum: ORDER_STATUS,
      default: "PENDING",
    },

    statusHistory: {
      type: [statusHistorySchema],
      default: [],
    },

    itemsPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    shippingPrice: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    taxPrice: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    paidAt: Date,

    deliveredAt: Date,
  },
  {
    timestamps: true,
  },
);

// ==============================
// Indexes
// ==============================

// User's orders (latest first)
orderSchema.index({ user: 1, createdAt: -1 });

// Prevent duplicate Razorpay payments
orderSchema.index(
  {
    "paymentResult.razorpayPaymentId": 1,
  },
  {
    unique: true,
    sparse: true,
  }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;