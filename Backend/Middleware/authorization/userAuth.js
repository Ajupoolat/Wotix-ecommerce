const {
  userAuthResponse,
} = require("../../enums/Middleware/Auth/User/authUser");
const jwt = require("jsonwebtoken");

const userAuthorization = (req, res, next) => {
  let token = req.cookies.token;
  const TOKENUSER = process.env.JWT_USER_SECRET;

  if (!token && req.headers.authorization) {
    const parts = req.headers.authorization.split(" ");
    if (parts.length === 2 && parts[0] === "Bearer") {
      token = parts[1];
    }
  }

  if (!token) {
    return res
      .status(userAuthResponse.TOKEN_MISSING.statusCode)
      .json({ message: userAuthResponse.TOKEN_MISSING.message });
  }

  try {
    const decoded = jwt.verify(token, TOKENUSER);

    if (!decoded.isUser) {
      return res
        .status(userAuthResponse.NOT_USER.statusCode)
        .json({ message: userAuthResponse.NOT_USER.message });
    }

    req.user = decoded;
    next();
  } catch (error) {
    res.status(userAuthResponse.INVALID_TOKEN.statusCode).json({
      message: userAuthResponse.INVALID_TOKEN.message,
    });
  }
};

module.exports = { userAuthorization };
