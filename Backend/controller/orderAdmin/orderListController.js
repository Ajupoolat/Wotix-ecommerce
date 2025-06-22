const orderSchema = require("../../models/orderSchema");
const userschema = require("../../models/userSchema");
const walletModel = require("../../models/wallet");
const productModel = require("../../models/productSchema");
const mongoose = require("mongoose");
const {
  createNotification,
} = require("../../controller/notifications/notificationControllers");

const getorders = async (req, res) => {
  try {
    const {
      search = "",
      status,
      sortByDate = "desc",
      page = 1,
      limit = 5,
    } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    let query = {};
    if (search.trim()) {
      // Find users with matching email
      const users = await userschema
        .find({ email: { $regex: search, $options: "i" } })
        .select("_id")
        .lean();
      const userIds = users.map((user) => user._id);
      query.userId = {
        $in: userIds.length ? userIds : [new mongoose.Types.ObjectId()],
      }; // Fallback to avoid empty results
    }
    if (status && status !== "all") {
      query.status = status;
    }

    let sort = { createdAt: sortByDate === "asc" ? 1 : -1 };

    const totalOrders = await orderSchema.countDocuments(query);
    const orders = await orderSchema
      .find(query)
      .populate({
        path: "userId",
        select: "firstName lastName email",
      })
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean();

    const totalPages = Math.ceil(totalOrders / limitNum);

    res.status(200).json({
      orders,
      totalOrders,
      totalPages,
      currentPage: pageNum,
      limit: limitNum,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message || "Failed to fetch orders" });
  }
};

const detailsorder = async (req, res) => {
  const orderId = req.params.id;

  try {
    const orderdetails = await orderSchema.findById(orderId).populate({
      path: "userId",
      select: "firstName lastName email",
    });

    if (!orderdetails)
      return res.status(500).json({ message: "the order is not founded" });

    res.status(200).json(orderdetails);
  } catch (error) {
    res.status(500).json({ message: "there is some server error" });
  }
};

const updateOrderStatus = async (req, res) => {
  const orderId = req.params.id;
  const { status } = req.body;

  const validStatuses = [
    "placed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",

  ];

  const restrictedStatusesForDelivered = [
    "placed",
    "processing",
    "shipped",
    "cancelled",
    "returned",
    "return_requested",
    "partially_returned",
    "partially_return_requested",
  ];

  const resforreturned = [
    "placed",
    "processing",
    "shipped",
    "cancelled",
    "delivered",
    "return_requested",
  ];

  const thisIsForReturnOrder =[
    "returned",
    "return_requested",
  ]

  const resforpartreturned = [
    "placed",
    "processing",
    "shipped",
    "cancelled",
    "delivered",
    "returned",
    "return_requested",
    "partially_return_requested",
  ];

  try {

   
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const order = await orderSchema.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }


    if (
      (order.status === "return_requested" ||
        order.status === "partially_return_requested") &&
      status === "delivered"
    ) {

      return res.status(400).json({
        message:
          "return requested and partially return requested order never changable into delivered",
      });
    }
   
    if (
      order.status === "delivered" &&
      restrictedStatusesForDelivered.includes(status)
    ) {
      return res.status(400).json({
        message:
          "Cannot change a delivered order to placed, processing, shipped, or cancelled",
      });
    }

    if (order.status === "returned" && resforreturned.includes(status)) {
      return res.status(400).json({
        message: "returned order stutas is not allow to change",
      });
    }

    if (
      order.status === "partially_returned" &&
      resforpartreturned.includes(status)
    ) {
      return res.status(400).json({
        message: "partially retuen order stutas is not allow to change",
      });
    }

    // Update the order
    if (status === "delivered") {
      const updatedOrder = await orderSchema
        .findByIdAndUpdate(
          orderId,
          { status, paymentStatus: true },
          { new: true }
        )
        .populate({
          path: "userId",
          select: "firstName lastName email",
        });

      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }

      res.status(200).json(updatedOrder);
    } else {
      const updatedOrder = await orderSchema
        .findByIdAndUpdate(orderId, { status }, { new: true })
        .populate({
          path: "userId",
          select: "firstName lastName email",
        });

      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }

      res.status(200).json(updatedOrder);
    }
  } catch (error) {
    res.status(500).json({
      message: "Server error while updating order status",
     
    });
  }
};

const processReturnRequest = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { orderId } = req.params;
    const { status, adminNotes } = req.body;

    // Validate status
    if (!["approved", "rejected"].includes(status)) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ message: "Invalid status. Use 'approved' or 'rejected'" });
    }

    // Find and validate order
    const order = await orderSchema
      .findById(orderId)
      .populate("userId")
      .session(session);

    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Order not found" });
    }

    // Find all pending return requests
    const pendingRequests = order.returnRequests.filter(
      (req) => req.status === "requested"
    );

    if (pendingRequests.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({ message: "No pending return requests" });
    }

    let refundAmount = 0;
    const approvedProductIds = [];

    if (status === "approved") {
      // Process all pending return requests
      for (const returnRequest of pendingRequests) {
        returnRequest.status = "approved";
        returnRequest.processedAt = new Date();
        returnRequest.adminNotes = adminNotes;
        refundAmount += returnRequest.estimatedRefund;

        // Process products in THIS return request only
        for (const returnProduct of returnRequest.products) {
          const product = order.products.find(
            (p) => p.productId.toString() === returnProduct.productId.toString()
          );
          if (!product) {
            await session.abortTransaction();
            return res.status(404).json({
              message: `Product ${returnProduct.productId} not found in order`,
            });
          }
          // Only modify products that are part of THIS return request
          product.returnStatus = "return_approved";
          approvedProductIds.push(returnProduct.productId.toString());

          // Update stock for THIS product only
          await productModel.findByIdAndUpdate(
            returnProduct.productId,
            { $inc: { stock: returnProduct.quantity } },
            { session }
          );
        }

        returnRequest.refundedAt = new Date();
        returnRequest.refundedAmount = returnRequest.estimatedRefund;
      }

      // Process wallet refund (single transaction for all approved returns)
      const wallet = await walletModel
        .findOne({ userID: order.userId._id })
        .session(session);
      if (!wallet) {
        await session.abortTransaction();
        return res.status(404).json({message: "User wallet not found" });
      }

      // Create transaction entries for each approved return
      for (const returnRequest of pendingRequests) {
        wallet.transactions.push({
          type: "credit",
          amount: returnRequest.estimatedRefund,
          description: `Refund for return request ${returnRequest.requestId} of Order #${order.orderNumber}`,
          status: "completed",
          referenceType: "return",
          referenceId: returnRequest.requestId,
        });
      }

      wallet.balance += refundAmount;
      await wallet.save({ session });

      // Update order status based on ALL products, not just returned ones
      const returnedProducts = order.products.filter(
        (p) => p.returnStatus === "return_approved" || p.cancelled
      );

      if (returnedProducts.length === order.products.length) {
        order.status = "returned";
      } else if (returnedProducts.length > 0) {
        order.status = "partially_returned";
      }
    } else if (status === "rejected") {
      // Reject all pending return requests
      for (const returnRequest of pendingRequests) {
        returnRequest.status = "rejected";
        returnRequest.processedAt = new Date();
        returnRequest.adminNotes = adminNotes;

        // Only update products in THIS return request
        for (const returnProduct of returnRequest.products) {
          const product = order.products.find(
            (p) => p.productId.toString() === returnProduct.productId.toString()
          );
          if (product) {
            product.returnStatus = "return_rejected";
          }
        }
      }
    }

    await order.save({ session });
    await session.commitTransaction();

    //creating the notifications for user

    const io = req.app.get("io");
    const userID = order.userId;
    const role = "user";
    const user = await userschema.findById(userID).select("firstName lastName");
    if (!user) {
      console.error("User not found");
      return;
    }

    const fullUserName = `${user.firstName} ${user.lastName}`;
    const type = "return_approved";
    const message = `Hey ${fullUserName}, your return request for order ${order.orderNumber} has been approved.`;

    await createNotification(io, userID, role, type, message, orderId);

    res.status(200).json({
      success: true,
      message: `Return request(s) ${status} successfully`,
      order,
      refundAmount: status === "approved" ? refundAmount : undefined,
      approvedProductIds:
        status === "approved" ? approvedProductIds : undefined,
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({
      message: "Failed to process return request",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  } finally {
    session.endSession();
  }
};

const getPendingReturnRequests = async (req, res) => {
  try {
    const orders = await orderSchema
      .find({ "returnRequests.status": "requested" })
      .populate("userId", "email firstName lastName")
      .select("orderNumber status returnRequests userId");

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch return requests",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
module.exports = {
  getorders,
  detailsorder,
  updateOrderStatus,
  processReturnRequest,
  getPendingReturnRequests,
};
