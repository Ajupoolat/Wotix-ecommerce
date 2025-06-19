module.exports = Object.freeze({
  adminNotiResponse: {
    NOT_FOUND: {
      messages: "the notifications are not founded",
      statusCode: 404,
    },
    SUCCESS:{
        messages:'the notifications sended successfully',
        statusCode:200
    },
    SERVER_ERROR:{
        messages:'some thing issues',
        statusCode:500
    },
    REQUIRED:{
      messages:"all fields are required",
      statusCode:400
    },
    SUCCESS_DELETE:{
      messages:'the notification is deleted successfully',
      statusCode:200
    },
    ERROR_DELETE:{
      messages:'the notification deletion have error',
      statusCode:400
    },
    UPDATED_SUCCESS:{
      messages:"notifications mark as readed",
      statusCode:200
    },
    UPDATE_ERROR:{
      messages:'notifications mark as read have some issues',
      statusCode:400
    }
  },
});
