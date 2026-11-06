const {
  adminAuthResponse,
} = require("../../enums/Middleware/Auth/Admin/authAdmin");
const jwt = require("jsonwebtoken");

const adminAuthorization = (req, res, next) => {
  let admintoken = req.cookies.tokenadmin;
  const TOKENADMIN = process.env.JWT_SECRET_ADMIN;

  if (!admintoken && req.headers.authorization) {
    const parts = req.headers.authorization.split(" ");
    if (parts.length === 2 && parts[0] === "Bearer") {
      admintoken = parts[1];
    }
  }

  if (!admintoken) {
    return res
      .status(adminAuthResponse.TOKEN_MISSING.statusCode)
      .json({ message: adminAuthResponse.TOKEN_MISSING.message });
  }

  try {
    const decocded = jwt.verify(admintoken, TOKENADMIN);

    if (!decocded.isAdmin)
      return res
        .status(adminAuthResponse.NOT_ADMIN.statusCode)
        .json({ message: adminAuthResponse.NOT_ADMIN.message });
    next();
  } catch (error) {
    res.status(adminAuthResponse.INVALID_TOKEN.statusCode).json({
      message: adminAuthResponse.INVALID_TOKEN.message,
    });
  }
};

module.exports = { adminAuthorization };
