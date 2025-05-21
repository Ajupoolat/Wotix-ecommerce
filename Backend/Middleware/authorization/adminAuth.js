const adminAuthorization = (req, res, next) => {
const admintoken = req.cookies.tokenadmin
  if (!admintoken) {
    return res.status(401).json({ message: "token is missing" });
  } else {
    next();
  }
};
module.exports={adminAuthorization}