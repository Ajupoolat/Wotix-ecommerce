const bycrpt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const adminSchema = require("../models/adminSchema");
const userSchema = require("../models/userSchema");

const JWT_SECRET_ADMIN =
  process.env.JWT_SECRET_ADMIN;

//admin intialization
const intialization = async () => {
  try {
    const existadmin = await adminSchema.findOne({ email: "admin@gmail.com" });

    if (!existadmin) {
      const hasspassword = await bycrpt.hash("admin@8848", 10);
      await new adminSchema({
        email: "admin@gmail.com",
        password: hasspassword,
      }).save();
    }
  } catch (erorr) {}
};

//verify the admin

const verrifyadmin = (req, res) => {
  const admintoken = req.cookies.tokenadmin;

    
  if (!admintoken) return res.status(401).json({ message: "Unauthorized" });

  jwt.verify(admintoken, process.env.JWT_SECRET_ADMIN, (err, admin) => {
    if (err) return res.status(403).json({ message: "Invalid admin" });
    res.json({ admin });
  });
};

//admin login

const adminlogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const adminfind = await adminSchema.findOne({ email });
    if (!adminfind) {
      return res.status(404).json({ message: "the admin is not found" });
    }
    const checkcre = await bycrpt.compare(password, adminfind.password);

    if (!checkcre) {
      return res
        .status(404)
        .json({ message: "the credentails is not correct" });
    }
    const tokenadmin = jwt.sign(
      { adminId: adminfind._id ,isAdmin:true},
      process.env.JWT_SECRET_ADMIN,
      { expiresIn: "1d" }
    );

    res.cookie("tokenadmin", tokenadmin, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      Domain:'wotix.myftp.org',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res
      .status(200)
      .json({ message: "Login successful", tokenadmin: tokenadmin });
  } catch (error) {
    res.status(500).json({ message: "something error" });
  }
};

//logout

const logout = (req, res) => {
  res.clearCookie("tokenadmin");
  res.json({ message: "logged out successfully" });
};

const getuser = async (req, res) => {
  try {
    const { page , limit, search = "" } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    const query = search
      ? {
          $or: [
            { firstName: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    // Get total count for pagination metadata
    const totalUsers = await userSchema.countDocuments(query);

    // Fetch paginated users
    const users = await userSchema
      .find(query)
      .sort({ _id: -1 }) // Sort by _id descending (newest first)
      .skip(skip)
      .limit(limitNum);

    // Calculate total pages
    const totalPages = Math.ceil(totalUsers / limitNum);

    // Send response
    res.status(200).json({
      users,
      totalUsers,
      totalPages,
      currentPage: pageNum,
      limit: limitNum,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch users" });
  }
};

//block user

const blockuser = async (req, res) => {
  const userId = req.params.id;
  const { isBlocked } = req.body;

  // Access WebSocket instances from middleware
  const { io, connectedUsers } = req;

  try {
    const user = await userSchema.findByIdAndUpdate(
      userId,
      { isBlocked },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (isBlocked) {
      res.clearCookie("token", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        path: "/",
      });

      // Notify user via WebSocket if connected
      if (connectedUsers && io) {
        const userSocketId = connectedUsers.get(userId);
        if (userSocketId) {
          io.to(userSocketId).emit("account_blocked");
        } else {
        }
      }
    }

    res.status(200).json({
      message: user.isBlocked
        ? "User blocked successfully"
        : "User unblocked successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error while blocking/unblocking user",
      error: error.message,
    });
  }
};
const searchuser = async (req, res) => {
  const { query } = req.query;

  try {
    const users = await userSchema.find({
      email: { $regex: query, $options: "i" },
    });
    res.status(200).json({ users });
  } catch (error) {
    res.status(404).json({ message: "the user is not found" });
  }
};

module.exports = {
  intialization,
  adminlogin,
  logout,
  verrifyadmin,
  getuser,
  blockuser,
  searchuser,
};
