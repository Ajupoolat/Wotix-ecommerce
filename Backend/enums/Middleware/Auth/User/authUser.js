const userAuthResponse = {
  TOKEN_MISSING: {
    statusCode: 401,
    message: "Token is missing",
  },
  INVALID_TOKEN: {
    statusCode: 401,
    message: "Invalid or expired token",
  },
  NOT_USER: {
    statusCode: 403,
    message: "Forbidden: Not a user",
  },
};

module.exports = {userAuthResponse}