const Notifications = require("../../models/notificationSchema");
const {
  adminNotiResponse,
} = require("../../enums/notifications/admin/notifEnumsAdmin");
const {
  userNotiResponse,
} = require("../../enums/notifications/user/notiEnumsUser");
//notification creater function

const createNotification = async (
  io,
  userId,
  role,
  type,
  message,
  relatedId
) => {
  try {
    const notification = await Notifications.create({
      userId,
      role,
      type,
      message,
      relatedId,
      isRead: false,
    });
    io.to(userId.toString()).emit("notification", {
      _id: notification._id,
      type: notification.type,
      message: notification.message,
      relatedId: notification.relatedId,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
    });
    return notification;
  } catch (error) {
    throw error;
  }
};

//notification get for admin

const getnotificationsAdmin = async (req, res) => {
  try {
    const role = "admin";
    const { page = 1, limit = 10 } = req.query; // Default to page 1 with 10 items per page

    const skip = (page - 1) * limit;

    const [notifications, totalCount] = await Promise.all([
      Notifications.find({ role: role })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notifications.countDocuments({ role: role })
    ]);

    if (!notifications) {
      return res
        .status(adminNotiResponse.NOT_FOUND.statusCode)
        .json({ message: adminNotiResponse.NOT_FOUND.messages });
    }

    res.status(adminNotiResponse.SUCCESS.statusCode).json({
      notifications,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page
    });
  } catch (error) {
    res
      .status(adminNotiResponse.SERVER_ERROR.statusCode)
      .json({ message: adminNotiResponse.SERVER_ERROR.messages });
  }
};



const getnotificationsUsers = async (req, res) => {

  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query; 


    const skip = (page - 1) * limit;

    const [notifications, totalCount] = await Promise.all([
      Notifications.find({ userId: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notifications.countDocuments({ userId: userId })
    ]);

    if (!notifications) {
      return res
        .status(userNotiResponse.NOT_FOUND.statusCode)
        .json({ message: userNotiResponse.NOT_FOUND.messages });
    }

    res.status(userNotiResponse.SUCCESS.statusCode).json({
      notifications,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page
    });
  } catch (error) {
    res
      .status(userNotiResponse.SERVER_ERROR.statusCode)
      .json({ message: userNotiResponse.SERVER_ERROR.messages });
  }
};

//updation of the notificaiton

const updateNotificationUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id)
      return res
        .status(userNotiResponse.REQUIRED.statusCode)
        .json({message:userNotiResponse.REQUIRED.messages});
    const result = await Notifications.updateOne(
      { _id: id },
      { $set: { isRead: true } }
    );

    if (!result)
      return res
        .status(userNotiResponse.NOT_FOUND.statusCode)
        .json({message:userNotiResponse.NOT_FOUND.messages});

    res
      .status(userNotiResponse.SUCCESS.statusCode)
      .json({message:userNotiResponse.SUCCESS.messages});
  } catch (error) {
    res
      .status(userNotiResponse.SERVER_ERROR.statusCode)
      .json({message:userNotiResponse.SERVER_ERROR.messages});
  }
};

const updateNotificationAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id)
      return res
        .status(adminNotiResponse.REQUIRED.statusCode)
        .json({message:adminNotiResponse.REQUIRED.messages});
    const result = await Notifications.updateOne(
      { _id: id },
      { $set: { isRead: true } }
    );

    if (!result)
      return res
        .status(adminNotiResponse.NOT_FOUND.statusCode)
        .json({message:adminNotiResponse.NOT_FOUND.messages});

    res
      .status(adminNotiResponse.SUCCESS.statusCode)
      .json({message:adminNotiResponse.SUCCESS.messages});
  } catch (error) {
    res
      .status(adminNotiResponse.SERVER_ERROR.statusCode)
      .json({message:adminNotiResponse.SERVER_ERROR.messages});
  }
};

//deletion

const deletionNotificationUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(userNotiResponse.REQUIRED.statusCode)
        .json({ message: userNotiResponse.REQUIRED.messages });
    }

    const result = await Notifications.deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Notification not found." });
    }

    res
      .status(userNotiResponse.SUCCESS.statusCode)
      .json({ message: "The deletion of notification is successful." });

  } catch (error) {
    res
      .status(userNotiResponse.SERVER_ERROR.statusCode)
      .json({ message: userNotiResponse.SERVER_ERROR.messages });
  }
};

const deletionNotificationAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(adminNotiResponse.REQUIRED.statusCode)
        .json({ message: adminNotiResponse.REQUIRED.messages });
    }

    const result = await Notifications.deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      return res.status(adminNotiResponse.NOT_FOUND.statusCode).json({ message: adminNotiResponse.SUCCESS.messages });
    }

    res
      .status(adminNotiResponse.SUCCESS_DELETE.statusCode)
      .json({ message: adminNotiResponse.SUCCESS_DELETE.messages });

  } catch (error) {
    res
      .status(adminNotiResponse.SERVER_ERROR.statusCode)
      .json({ message: adminNotiResponse.SERVER_ERROR.messages });
  }
};





module.exports = {
  createNotification,
  getnotificationsAdmin,
  getnotificationsUsers,
  updateNotificationUser,
  updateNotificationAdmin,
  deletionNotificationUser,
  deletionNotificationAdmin
};
