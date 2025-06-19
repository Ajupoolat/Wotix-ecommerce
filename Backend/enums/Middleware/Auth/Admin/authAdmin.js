// utils/responseEnum.js

const adminAuthResponse = {
  TOKEN_MISSING: {
    statusCode: 401,
    message: "Token is missing",
  },
  INVALID_TOKEN: {
    statusCode: 401,
    message: "Invalid or expired token",
  },
  NOT_ADMIN: {
    statusCode: 403,
    message: "Forbidden: Not an admin",
  }
};

module.exports = { adminAuthResponse };
