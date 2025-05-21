const userAuthorization = (req, res, next) => {
    const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "token is missing" });
  } else {
    next();
  }
};
module.exports={userAuthorization}