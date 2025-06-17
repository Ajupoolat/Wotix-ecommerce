const orderSchema = require("../../models/orderSchema");
const Product = require("../../models/productSchema");
const mongoose = require("mongoose");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const coupon = require("../../models/couponSchema");
const walletSchema = require("../../models/wallet");
const userSchema = require("../../models/userSchema");
const productSchema = require("../../models/productSchema");
const offerSchema = require("../../models/offerSchema");
const { OrderResponses } = require("../../enums/order/user/orderuserEnum");
const ADMIN_ID_ = process.env.ADMIN_ID
const {createNotification} = require('../../controller/notifications/notificationControllers')
require("dotenv").config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const migrateOrders = async () => {
  try {
    await orderSchema.updateMany(
      { "products.discountedPrice": { $exists: false } },
      [
        {
          $set: {
            products: {
              $map: {
                input: "$products",
                as: "product",
                in: {
                  $mergeObjects: [
                    "$$product",
                    { discountedPrice: "$$product.price" },
                  ],
                },
              },
            },
            subtotal: {
              $reduce: {
                input: "$products",
                initialValue: 0,
                in: {
                  $add: [
                    "$$value",
                    { $multiply: ["$$this.price", "$$this.quantity"] },
                  ],
                },
              },
            },
            discountAmount: 0,
            finalAmount: "$totalPrice",
          },
        },
      ]
    );
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
};

const placeOrder = async (req, res) => {
  const SHIPPING_FEE = 50;

  try {
    const userId = req.params.id;
    const {
      products,
      address,
      paymentMethod,
      totalPrice,
      coupons,
      discountAmount,
      subtotal,
      finalAmount,
    } = req.body;

    // Validate required fields
    if (
      !paymentMethod ||
      !products?.length ||
      !address ||
      totalPrice == null ||
      subtotal == null ||
      finalAmount == null
    ) {
      return res.status(OrderResponses.MISSING_FIELDS.statusCode).json({
        success: false,
        ...OrderResponses.MISSING_FIELDS,
      });
    }

    // Validate products
    const productIds = products.map((p) => p.productId);
    const existingProducts = await Product.find({ _id: { $in: productIds } });

    for (const item of products) {
      const product = existingProducts.find(
        (p) => p._id.toString() === item.productId
      );
      if (!product) {
        return res.status(OrderResponses.PRODUCT_NOT_FOUND.statusCode).json({
          success: false,
          ...OrderResponses.PRODUCT_NOT_FOUND,
          message: OrderResponses.PRODUCT_NOT_FOUND.message.replace(
            "{productName}",
            item.name || item.productId
          ),
        });
      }
      if (product.stock < item.quantity) {
        return res.status(OrderResponses.INSUFFICIENT_STOCK.statusCode).json({
          success: false,
          ...OrderResponses.INSUFFICIENT_STOCK,
          message: OrderResponses.INSUFFICIENT_STOCK.message
            .replace("{productName}", product.name)
            .replace("{stock}", product.stock)
            .replace("{quantity}", item.quantity),
        });
      }
    }

    // Coupon validation and discount calculation
    let validCoupons = [];
    let totalDiscount = 0;

    if (coupons?.length > 0) {
      validCoupons = await coupon
        .find({
          _id: { $in: coupons },
          isActive: true,
          startDate: { $lte: new Date() },
          endDate: { $gte: new Date() },
        })
        .lean();

      if (validCoupons.length !== coupons.length) {
        return res.status(OrderResponses.INVALID_COUPONS.statusCode).json({
          success: false,
          ...OrderResponses.INVALID_COUPONS,
        });
      }

      const calculatedSubtotal = products.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      if (Math.abs(calculatedSubtotal - subtotal) > 0.01) {
        return res.status(OrderResponses.SUBTOTAL_MISMATCH.statusCode).json({
          success: false,
          ...OrderResponses.SUBTOTAL_MISMATCH,
        });
      }

      totalDiscount = validCoupons.reduce((total, coupon) => {
        if (subtotal >= coupon.minPurchaseAmount) {
          return (
            total +
            (coupon.discountType === "flat"
              ? coupon.discountValue
              : (subtotal * coupon.discountValue) / 100)
          );
        }
        return total;
      }, 0);

      if (Math.abs(discountAmount - totalDiscount) > 0.01) {
        return res.status(OrderResponses.DISCOUNT_MISMATCH.statusCode).json({
          success: false,
          ...OrderResponses.DISCOUNT_MISMATCH,
        });
      }
    }

    // Validate total price
    const calculatedTotal = subtotal + SHIPPING_FEE;
    if (Math.abs(calculatedTotal - totalPrice) > 0.01) {
      return res.status(OrderResponses.TOTAL_PRICE_MISMATCH.statusCode).json({
        success: false,
        ...OrderResponses.TOTAL_PRICE_MISMATCH,
      });
    }

    // Validate final amount
    const calculatedFinalAmount = subtotal - totalDiscount + SHIPPING_FEE;
    if (Math.abs(calculatedFinalAmount - finalAmount) > 0.01) {
      return res.status(OrderResponses.FINAL_AMOUNT_MISMATCH.statusCode).json({
        success: false,
        ...OrderResponses.FINAL_AMOUNT_MISMATCH,
      });
    }

    // Generate unique order number
    const orderNumber = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Prepare order products with discount breakdown
    const totalItems = products.reduce((sum, item) => sum + item.quantity, 0);
    const orderProducts = products.map((product) => {
      const itemSubtotal = product.price * product.quantity;
      const discountPerItem = totalItems
        ? (totalDiscount * itemSubtotal) / subtotal / product.quantity
        : 0;
      const originalPrice = product.originalPrice || product.price;
      const discountedPrice = product.discountedPrice || product.price;

      return {
        productId: product.productId,
        name: product.name,
        price: product.price,
        discountedPrice: discountedPrice > 0 ? discountedPrice : product.price,
        quantity: product.quantity,
        image: product.images?.[0] || "",
        originalPrice,
        offer: product.offer || null,
      };
    });

    // Create Razorpay order if needed
    let razorpayOrder = null;
    if (paymentMethod !== "cod") {
      const razorpayAmount = Math.round(finalAmount * 100);
      if (razorpayAmount <= 0 || isNaN(razorpayAmount)) {
        return res
          .status(OrderResponses.INVALID_PAYMENT_AMOUNT.statusCode)
          .json({
            success: false,
            ...OrderResponses.INVALID_PAYMENT_AMOUNT,
          });
      }

      try {
        razorpayOrder = await razorpay.orders.create({
          amount: razorpayAmount,
          currency: "INR",
          receipt: orderNumber,
          payment_capture: 1,
        });
      } catch (razorpayError) {
        return res
          .status(OrderResponses.RAZORPAY_ORDER_FAILED.statusCode)
          .json({
            success: false,
            ...OrderResponses.RAZORPAY_ORDER_FAILED,
            error: razorpayError.message,
          });
      }
    }

    // Start transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    const statusTimeline = [
      {
        status: "placed",
        date: new Date(),
        note: OrderResponses.ORDER_PLACED_SUCCESS.message,
      },
    ];

    const newOrder = new orderSchema({
      userId,
      orderNumber,
      products: orderProducts,
      shippingAddress: address,
      paymentMethod,
      subtotal,
      discountAmount: totalDiscount,
      totalPrice,
      finalAmount,
      coupons: validCoupons.map((c) => c._id),
      couponDetails: validCoupons.map((c) => ({
        code: c.code,
        discountType: c.discountType,
        discountValue: c.discountValue,
      })),
      paymentStatus: paymentMethod === "cod" ? false : false,
      status: "placed",
      statusTimeline,
      razorpayOrderId: razorpayOrder?.id || null,
    });

    try {
      await newOrder.save({ session });

      // Reduce stock
      for (const item of products) {
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { stock: -item.quantity } },
          { session }
        );
      }

      // Increment coupon usage count
      if (validCoupons.length > 0) {
        await coupon.updateMany(
          { _id: { $in: validCoupons.map((c) => c._id) } },
          { $inc: { usageCount: 1 } },
          { session }
        );
      }

      await session.commitTransaction();
      session.endSession();

      return res.status(OrderResponses.ORDER_PLACED_SUCCESS.statusCode).json({
        success: true,
        ...OrderResponses.ORDER_PLACED_SUCCESS,
        order: newOrder,
        razorpayOrder: razorpayOrder
          ? {
              id: razorpayOrder.id,
              amount: razorpayOrder.amount,
            }
          : null,
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    return res.status(OrderResponses.SERVER_ERROR.statusCode).json({
      success: false,
      ...OrderResponses.SERVER_ERROR,
      error: error.message,
    });
  }
};

const verifyPayment = async (req, res) => {
  console.log('the verify payment is working ')
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = req.body;

    // Validate required fields
    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !orderId
    ) {
      return res
        .status(OrderResponses.MISSING_PAYMENT_DETAILS.statusCode)
        .json({
          success: false,
          ...OrderResponses.MISSING_PAYMENT_DETAILS,
        });
    }

    // Verify payment signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res
        .status(OrderResponses.INVALID_PAYMENT_SIGNATURE.statusCode)
        .json({
          success: false,
          ...OrderResponses.INVALID_PAYMENT_SIGNATURE,
        });
    }

    // Update order payment status
    const updatedOrder = await orderSchema.findByIdAndUpdate(
      orderId,
      {
        paymentStatus: true,
        razorpayPaymentId: razorpay_payment_id,
        $push: {
          statusTimeline: {
            status: "paid",
            date: new Date(),
            note: OrderResponses.PAYMENT_VERIFIED_SUCCESS.message,
          },
        },
      },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(OrderResponses.ORDER_NOT_FOUND.statusCode).json({
        success: false,
        ...OrderResponses.ORDER_NOT_FOUND,
      });
    }

    res.status(OrderResponses.PAYMENT_VERIFIED_SUCCESS.statusCode).json({
      success: true,
      ...OrderResponses.PAYMENT_VERIFIED_SUCCESS,
      order: updatedOrder,
    });
  } catch (error) {
    res.status(OrderResponses.SERVER_ERROR.statusCode).json({
      success: false,
      ...OrderResponses.SERVER_ERROR,
      error: error.message,
    });
  }
};

const getOrders = async (req, res) => {
  try {
    const userId = req.params.id;
    const email = req.params.email;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const user = await userSchema.findById(userId);

    if (user.email !== email) {
      return res.status(OrderResponses.UNAUTHORIZED_ACCESS.statusCode).json({
        ...OrderResponses.UNAUTHORIZED_ACCESS,
      });
    }

    const skip = (page - 1) * limit;
    const orders = await orderSchema
      .find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalOrders = await orderSchema.countDocuments({ userId });

    if (!orders.length) {
      return res.status(OrderResponses.NO_ORDERS_FOUND.statusCode).json({
        success: false,
        ...OrderResponses.NO_ORDERS_FOUND,
      });
    }

    res.status(200).json({
      success: true,
      orders,
      pagination: {
        totalOrders,
        currentPage: page,
        totalPages: Math.ceil(totalOrders / limit),
        limit,
      },
    });
  } catch (error) {
    res.status(OrderResponses.SERVER_ERROR.statusCode).json({
      success: false,
      ...OrderResponses.SERVER_ERROR,
      error: error.message,
    });
  }
};

const getOrderDetails = async (req, res) => {
  console.log('the order parameters are there ,',req.params.userId,req.params.id)
  const userId = req.params.userId;

  try {
    const order = await orderSchema.findById(req.params.id);
    if (!order) {
      return res.status(OrderResponses.ORDER_NOT_FOUND.statusCode).json({
        success: false,
        ...OrderResponses.ORDER_NOT_FOUND,
      });
    }

    if (order.userId.toString() !== userId.toString()) {
      return res.status(OrderResponses.UNAUTHORIZED_ACCESS.statusCode).json({
        ...OrderResponses.UNAUTHORIZED_ACCESS,
      });
    }
     
    console.log('the response data :',order)
    res.status(200).json(order);
  } catch (error) {
    res.status(OrderResponses.SERVER_ERROR.statusCode).json({
      success: false,
      ...OrderResponses.SERVER_ERROR,
      error: error.message,
    });
  }
};

const retrypayment = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await orderSchema.findById(id);

    if (!order) {
      return res.status(OrderResponses.ORDER_NOT_FOUND.statusCode).json({
        ...OrderResponses.ORDER_NOT_FOUND,
      });
    }

    if (order.paymentStatus) {
      return res
        .status(OrderResponses.PAYMENT_ALREADY_COMPLETED.statusCode)
        .json({
          ...OrderResponses.PAYMENT_ALREADY_COMPLETED,
        });
    }

    let realfinalamount;

    const cancelledAmount = order.products
      .filter((p) => p.cancelled)
      .reduce((acc, p) => acc + (p.discountedPrice || 0), 0);

    realfinalamount = order.finalAmount - cancelledAmount;

    const razorpayorder = await razorpay.orders.create({
      amount: parseInt(realfinalamount) * 100,
      currency: "INR",
      receipt: `retry_${order.orderNumber}`,
    });

    res.status(200).json({
      order: order,
      razorpayOrder: razorpayorder,
    });
  } catch (error) {
    res.status(OrderResponses.RETRY_PAYMENT_FAILED.statusCode).json({
      ...OrderResponses.RETRY_PAYMENT_FAILED,
      details: error.message,
    });
  }
};

const canOrderBeCancelled = (order) => {
  if (["cancelled", "delivered", "completed"].includes(order.status)) {
    return false;
  }

  if (order.cancellationPolicy?.cancellationWindowHours) {
    const cancellationDeadline = new Date(order.createdAt);
    cancellationDeadline.setHours(
      cancellationDeadline.getHours() +
        order.cancellationPolicy.cancellationWindowHours
    );

    if (new Date() > cancellationDeadline) {
      return false;
    }
  }

  const allowedStatuses = ["placed", "processing", "partially_cancelled"];

  return allowedStatuses.includes(order.status);
};

const cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const {
      productsToCancel = [],
      cancellationReason,
      cancelEntireOrder = false,
    } = req.body;

    const order = await orderSchema
      .findById(orderId)
      .populate("products.productId");

    if (!order) {
      return res.status(OrderResponses.ORDER_NOT_FOUND.statusCode).json({
        success: false,
        ...OrderResponses.ORDER_NOT_FOUND,
      });
    }

    if (!canOrderBeCancelled(order)) {
      return res
        .status(OrderResponses.ORDER_CANCEL_NOT_ALLOWED.statusCode)
        .json({
          success: false,
          ...OrderResponses.ORDER_CANCEL_NOT_ALLOWED,
        });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      let cancelledProducts = [];
      let refundAmount = 0;
      let shipcharge = 50;
      let newStatus = order.status;

      if (cancelEntireOrder) {
        order.products.forEach((product) => {
          product.cancelled = true;
          product.cancellationReason = cancellationReason;
          product.cancelledAt = new Date();
          cancelledProducts.push({
            productId: product.productId._id,
            quantity: product.quantity,
          });
          refundAmount +=
            (product.discountedPrice || product.price) * product.quantity;
        });
        refundAmount += shipcharge;
        newStatus = "cancelled";
      } else {
        for (const product of order.products) {
          if (productsToCancel.includes(product.productId._id.toString())) {
            product.cancelled = true;
            product.cancellationReason = cancellationReason;
            product.cancelledAt = new Date();
            cancelledProducts.push({
              productId: product.productId._id,
              quantity: product.quantity,
            });
            refundAmount +=
              (product.discountedPrice || product.price) * product.quantity;
          }
        }
        const allCancelled = order.products.every((p) => p.cancelled);
        newStatus = allCancelled ? "cancelled" : "partially_cancelled";
        if (newStatus === "cancelled") {
          refundAmount += shipcharge;
        }
      }

      order.status = newStatus;
      order.statusTimeline.push({
        status: newStatus,
        date: new Date(),
        note:
          cancellationReason ||
          OrderResponses.ORDER_CANCEL_SUCCESS.message.replace(
            "{status}",
            newStatus.replace("_", " ")
          ),
      });

      await order.save({ session });
      await restockCancelledProducts(cancelledProducts, session);

      if (order.paymentStatus && refundAmount > 0) {
        await processRefundToWallet({
          userId: order.userId,
          amount: refundAmount,
          orderId: order._id,
          session,
        });
      }

      await session.commitTransaction();
      session.endSession();

      res.status(OrderResponses.ORDER_CANCEL_SUCCESS.statusCode).json({
        success: true,
        ...OrderResponses.ORDER_CANCEL_SUCCESS,
        message: OrderResponses.ORDER_CANCEL_SUCCESS.message.replace(
          "{status}",
          newStatus.replace("_", " ")
        ),
        refundAmount: order.paymentStatus ? refundAmount : 0,
        order,
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    res.status(OrderResponses.SERVER_ERROR.statusCode).json({
      success: false,
      ...OrderResponses.SERVER_ERROR,
      error: error.message,
    });
  }
};

const restockCancelledProducts = async (products, session) => {
  for (const { productId, quantity } of products) {
    await Product.findByIdAndUpdate(
      productId,
      { $inc: { stock: quantity } },
      { session }
    );
  }
};

const processRefundToWallet = async ({ userId, amount, orderId, session }) => {
  try {
    let wallet = await walletSchema
      .findOne({ userID: userId })
      .session(session);

    if (!wallet) {
      wallet = new walletSchema({
        userID: userId,
        balance: 0,
        transactions: [],
      });
    }

    wallet.balance += amount;

    wallet.transactions.push({
      type: "credit",
      amount: amount,
      description: `Refund for cancelled order ${orderId}`,
      date: new Date(),
      status: "completed",
      referenceType: "order",
      referenceId: orderId,
    });

    await wallet.save({ session });

    return wallet;
  } catch (error) {
    throw error;
  }
};

const orderSearching = async (req, res) => {
  const { query } = req.query;

  try {
    const orders = await orderSchema.find({
      "products.name": { $regex: query, $options: "i" },
    });
    res.status(200).json(orders);
  } catch (error) {
    res.status(OrderResponses.ORDERS_NOT_FOUND.statusCode).json({
      ...OrderResponses.ORDERS_NOT_FOUND,
    });
  }
};

const submitReturnRequest = async (req, res) => {
  console.log('the order returning is working here')
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { orderId } = req.params;
    const userId = req.params.id;
    const { productsToReturn, returnReason, additionalInfo } = req.body;

    if (!returnReason || typeof returnReason !== "string") {
      await session.abortTransaction();
      return res.status(OrderResponses.INVALID_RETURN_REASON.statusCode).json({
        ...OrderResponses.INVALID_RETURN_REASON,
      });
    }

    if (
      !productsToReturn ||
      !Array.isArray(productsToReturn) ||
      productsToReturn.length === 0
    ) {
      await session.abortTransaction();
      return res
        .status(OrderResponses.INVALID_RETURN_PRODUCTS.statusCode)
        .json({
          ...OrderResponses.INVALID_RETURN_PRODUCTS,
        });
    }

    const order = await orderSchema
      .findById(orderId)
      .populate("userId", "email firstName lastName")
      .session(session);

    if (!order) {
      await session.abortTransaction();
      return res.status(OrderResponses.ORDER_NOT_FOUND.statusCode).json({
        ...OrderResponses.ORDER_NOT_FOUND,
        suggestion: "Check the order ID and try again",
      });
    }

    if (
      ![
        "delivered",
        "partially_return_requested",
        "partially_returned",
      ].includes(order.status)
    ) {
      await session.abortTransaction();
      return res
        .status(OrderResponses.ORDER_NOT_ELIGIBLE_FOR_RETURN.statusCode)
        .json({
          ...OrderResponses.ORDER_NOT_ELIGIBLE_FOR_RETURN,
          message: OrderResponses.ORDER_NOT_ELIGIBLE_FOR_RETURN.message.replace(
            "{status}",
            order.status
          ),
        });
    }

    if (
      order.returnPolicy?.lastReturnDate &&
      new Date() > order.returnPolicy.lastReturnDate
    ) {
      await session.abortTransaction();
      return res.status(OrderResponses.RETURN_WINDOW_EXPIRED.statusCode).json({
        ...OrderResponses.RETURN_WINDOW_EXPIRED,
        lastReturnDate: order.returnPolicy.lastReturnDate,
      });
    }

    const invalidProducts = [];
    const validProducts = [];

    productsToReturn.forEach((productId) => {
      const product = order.products.find(
        (p) => p.productId.toString() === productId
      );
      if (!product) {
        invalidProducts.push(productId);
      } else if (product.cancelled || product.returnStatus !== "none") {
        invalidProducts.push(productId);
      } else {
        validProducts.push(product);
      }
    });

    if (invalidProducts.length > 0) {
      await session.abortTransaction();
      return res
        .status(OrderResponses.PRODUCTS_NOT_ELIGIBLE_FOR_RETURN.statusCode)
        .json({
          ...OrderResponses.PRODUCTS_NOT_ELIGIBLE_FOR_RETURN,
          invalidProducts,
          reasons: invalidProducts.map((id) => {
            const product = order.products.find(
              (p) => p.productId.toString() === id
            );
            if (!product) return "Product not found in order";
            if (product.cancelled) return "Product was cancelled";
            if (product.returnStatus !== "none")
              return "Return already requested";
            return "Unknown reason";
          }),
        });
    }

    if (validProducts.length === 0) {
      await session.abortTransaction();
      return res
        .status(OrderResponses.NO_VALID_RETURN_PRODUCTS.statusCode)
        .json({
          ...OrderResponses.NO_VALID_RETURN_PRODUCTS,
        });
    }

    const estimatedRefund = validProducts.reduce((total, product) => {
      return (
        total + (product.discountedPrice || product.price) * product.quantity
      );
    }, 0);

    const newReturnRequest = {
      requestId: new mongoose.Types.ObjectId(),
      products: validProducts.map((product) => ({
        productId: product.productId,
        name: product.name || "Unknown",
        quantity: product.quantity,
        price: product.discountedPrice || product.price,
      })),
      reason: returnReason,
      additionalInfo: additionalInfo || "",
      status: "requested",
      requestedAt: new Date(),
      requestedBy: userId,
      estimatedRefund,
    };

    order.returnRequests.push(newReturnRequest);

    const productstoReturn = productsToReturn.map(
      (id) => new mongoose.Types.ObjectId(id)
    );

    const allProductsBeingReturned = order.products.every((p) =>
      productstoReturn.some((id) => id.toString() === p.productId.toString())
    );

    order.status = allProductsBeingReturned
      ? "return_requested"
      : "partially_return_requested";

    order.products.forEach((product) => {
      if (
        productstoReturn.some(
          (id) => id.toString() === product.productId.toString()
        )
      ) {
        product.returnStatus = "return_requested";
      }
    });

    await order.save({ session });
    await session.commitTransaction();


    //creating notification for the admin 
   const io = req.app.get('io')
   const adminId = ADMIN_ID_
   const type = 'return_request'
   const role = 'admin'
   const message = `a user has requested for return. The Order ID:${order.orderNumber}`
    await createNotification(
       io,
       adminId,
       role,
       type,
       message,
       orderId
    )

    res.status(OrderResponses.RETURN_REQUEST_SUCCESS.statusCode).json({
      success: true,
      ...OrderResponses.RETURN_REQUEST_SUCCESS,
      returnRequest: {
        id: newReturnRequest.requestId,
        status: newReturnRequest.status,
        estimatedRefund,
      },
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
      },
      nextSteps: "We will review your request within 24-48 hours",
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(OrderResponses.RETURN_REQUEST_FAILED.statusCode).json({
      ...OrderResponses.RETURN_REQUEST_FAILED,
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
      contactSupport: true,
    });
  } finally {
    session.endSession();
  }
};

module.exports = {
  placeOrder,
  getOrders,
  getOrderDetails,
  cancelOrder,
  returnOrder: submitReturnRequest,
  orderSearching,
  verifyPayment,
  retrypayment,
};
