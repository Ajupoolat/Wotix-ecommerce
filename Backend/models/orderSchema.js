const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: String,
        price: {
          type: Number,
          required: true,
        },
        discountedPrice: {
          type: Number,
          required: false,
        },
        size: String,
        quantity: {
          type: Number,
          required: true,
          default: 1,
        },
        image: String,
        eligibleForReturn: {
          type: Boolean,
          default: true,
        },
        returnStatus: {
          type: String,
          enum: [
            "none",
            "return_requested",
            "return_approved",
            "return_rejected",
            "return_completed",
          ],
          default: "none",
        },
        cancelled: {
          type: Boolean,
          default: false,
        },
        cancellationReason: String,
        cancelledAt: Date,
        cancelledBy: {
          type: String,
          enum: ["customer", "admin", "system"],
          default: "customer",
        },
      },
    ],
    returnRequests: [
      {
        requestId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        products: [
          {
            productId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Product",
              required: true,
            },
            name: {
              type: String,
              required: true,
            },
            quantity: {
              type: Number,
              required: true,
            },
            price: {
              // Use discountedPrice for refund calculations (MODIFIED)
              type: Number,
              required: true,
            },
          },
        ],
        reason: {
          type: String,
          required: true,
        },
        additionalInfo: String,
        status: {
          type: String,
          enum: [
            "requested",
            "approved",
            "rejected",
            "completed",
            "partially_return_requested",
          ],
          default: "requested",
        },
        requestedAt: {
          type: Date,
          default: Date.now,
        },
        requestedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        estimatedRefund: {
          type: Number,
          required: true,
        },
        processedAt: Date,
        adminNotes: String,
        images: [String],
      },
    ],
    shippingAddress: {
      fullName: String,
      phone: String,
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "upi", "card", "netbanking"],
      required: true,
    },
    paymentStatus: {
      type: Boolean,
      default: false,
    },
    subtotal: {
      type: Number,
      required: true,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    finalAmount: {
      type: Number,
      required: true,
    },
    coupons: [
      {
        couponId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Coupon",
        },
        code: String,
        discountType: {
          type: String,
          enum: ["flat", "percentage"],
        },
        discountValue: Number,
        minPurchaseAmount: Number,
      },
    ],
    status: {
      type: String,
      enum: [
        "placed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "partially_cancelled",
        "returned",
        "return_requested",
        "partially_returned",
        "partially_return_requested",
      ],
      default: "placed",
    },
    statusTimeline: [
      {
        status: String,
        date: Date,
        note: String,
      },
    ],
    returnPolicy: {
      lastReturnDate: Date,
      refundMethod: String,
    },
    razorpayOrderId: {
      type: String,
    },
    razorpayPaymentId: {
      type: String,
      default: null,
    },
    cancellationPolicy: {
      allowPartialCancellations: { type: Boolean, default: true },
      cancellationWindowHours: { type: Number, default: 24 },
    },
    lastCancellationDate: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
