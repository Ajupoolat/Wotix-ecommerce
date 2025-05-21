const Notification = require("../models/notificationSchema");

const sendNotification = async (io, connectedUsers, notificationData) => {
  try {
    if (!notificationData.recipientId || !notificationData.message) {
      throw new Error("recipientId and message are required");
    }

    const notification = await Notification.create({
      createdAt: new Date(),
      ...notificationData,
    });

    const recipientSocketId = connectedUsers.get(
      notificationData.recipientId.toString()
    );
    if (recipientSocketId && io) {
      // Added io existence check
      io.to(recipientSocketId).emit("new_notification", {
        _id: notification._id,
        type: notification.type,
        message: notification.message,
        relatedEntity: notification.relatedEntity,
        createdAt: notification.createdAt,
        read: notification.read,
      });
    }

    return notification;
  } catch (error) {
  }
};

// In your notification service
const notifyAdmin = async (io, connectedUsers, order, request, message) => {
  if (!order || !order._id || !order.userId) {
    throw new Error("Invalid order object");
  }
  if (!request) {
    throw new Error("Invalid return request object");
  }

  return sendNotification(io, connectedUsers, {
    recipientId: "admin",
    senderId: order.userId,
    type: "return_request",
    message: message || `New return request for order ${order.orderNumber}`,
    relatedEntity: {
      orderId: order._id,
      requestId: request.requestId,
      productId: request.productId,
    },
    entityModel: "ReturnRequest",
  });
};

const notifyUser = async (io, connectedUsers, order, message) => {
  if (!order || !order._id || !order.userId) {
    throw new Error("Invalid order object");
  }

  return sendNotification(io, connectedUsers, {
    recipientId: order.userId,
    senderId: "system",
    type: "order_update",
    message: message,
    relatedEntity: order._id,
    entityModel: "Order",
  });
};

module.exports = {
  sendNotification,
  notifyAdmin,
  notifyUser,
};
