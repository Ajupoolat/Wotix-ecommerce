module.exports = Object.freeze({
userNotiResponse: {
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
    }
  },
});
