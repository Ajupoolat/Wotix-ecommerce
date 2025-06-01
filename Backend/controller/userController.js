const User = require("../models/userSchema");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const userSchema = require("../models/userSchema");
const wallet = require("../models/wallet");

const JWT_USER_SECRET =
  process.env.JWT_USER_SECRET || "your_user_jwt_secret_key";

let otpStore = {};
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: "Email is required" });

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "Email already registered" });
  }

  // Generate OTP
  const otp = crypto.randomInt(100000, 999999).toString();
  otpStore[email] = otp;

  const expiry = Date.now() + 300 * 1000; // 30 seconds
  otpStore[email] = { otp, expiry };

  // Send OTP through Email
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP is: ${otp}. It is valid for 5 minutes.`,
  };

  console.log(otp)

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "OTP sent successfully"});
  } catch (error) {
    res.status(500).json({ message: "Failed to send OTP", error });
  }
};

const sendOtpeditprofile = async (req, res) => {
  const { email, userId } = req.body; // Assuming you're passing userId from frontend

  if (!email || !userId) {
    return res.status(400).json({ message: "Email and userId are required" });
  }

  const existingUser = await User.findOne({ email });

  // If email exists AND it's not the current user's own email
  if (existingUser && existingUser._id.toString() !== userId) {
    return res
      .status(400)
      .json({ message: "Email already registered by another user" });
  }

  // Generate and send OTP
  const otp = crypto.randomInt(100000, 999999).toString();

  otpStore[email] = otp;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP is: ${otp}. It is valid for 30 seconds.`,
  };

  console.log(otp)

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to send OTP", error });
  }
};

//send otp for change password

const sendotpchangepassword = async (req, res) => {
  const { emailId, userId } = req.body; 

  if (!emailId || !userId) {
    return res.status(400).json({ message: "Email and userId are required" });
  }

  const existingUser = await User.findOne({ _id: userId });

  // If email exists AND it's not the current user's own email
  if (existingUser.email !== emailId) {
    return res
      .status(400)
      .json({ message: "please enter your resgistred email" });
  }

  // Generate and send OTP
  const otp = crypto.randomInt(100000, 999999).toString();

  otpStore[emailId] = otp;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: emailId,
    subject: "Your OTP Code",
    text: `Your OTP is: ${otp}. It is valid for 30 seconds.`,
  };

  console.log(otp)

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to send OTP", error });
  }
};

const sendOtpforgot = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: "Email is required" });

  const userfind = await userSchema.findOne({ email });

  // Generate OTP
  const otp = crypto.randomInt(100000, 999999).toString();
  otpStore[email] = otp;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP is: ${otp}. It is valid for 5 minutes.`,
  };

  console.log(otp)

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "OTP sent successfully"});
  } catch (error) {
    res.status(500).json({ message: "Failed to send OTP", error });
  }
};

//reset password password

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!otpStore[email] || otpStore[email] !== otp) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    delete otpStore[email];

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      message:
        "Password reset successful. You can now log in with the new password.",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error during password reset" });
  }
};

//editing profile
const verifyOtpAndUpdateProfile = async (req, res) => {
  try {
    const { email, otp, firstName, lastName, userId } = req.body;

    // Validate required fields
    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required",
      });
    }

    // Verify OTP first
    if (!otpStore[email] || otpStore[email] !== otp) {
      return res.status(400).json({
        message: "Invalid or expired OTP",
      });
    }

    delete otpStore[email];

    // Find the existing user
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const updates = {};

    if (firstName && firstName !== user.firstName) {
      updates.firstName = firstName;
    }

    if (lastName && lastName !== user.lastName) {
      updates.lastName = lastName;
    }

    if (email && email !== user.email) {
      updates.email = email;
    }

    if (Object.keys(updates).length > 0) {
      const updatedUser = await User.findOneAndUpdate(
        { _id: userId },
        { $set: updates },
        { new: true, runValidators: true }
      );

      return res.status(200).json({
        message: "Profile updated successfully",
        user: {
          id: updatedUser._id,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          email: updatedUser.email,
        },
      });
    }

    return res.status(200).json({
      message: "No changes detected",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation failed",
        errors: error.errors,
      });
    }

    res.status(500).json({
      message: "Server error during profile update",
    });
  }
};

const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!otpStore[email] || otpStore[email] !== otp) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  res.status(200).json({ message: "OTP verified successfully" });
};

//new signup logic

const signup = async (req, res) => {
  try {
    const { firstName, lastName, email, password, otp, refferalId } = req.body;

    // OTP Verification
    if (!otpStore[email] || otpStore[email].otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (Date.now() > otpStore[email].expiry) {
      delete otpStore[email];
      return res.status(400).json({ message: "OTP has expired" });
    }
    delete otpStore[email];

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate referral ID for this user
    const generatedReferralId = crypto.randomBytes(6).toString("hex");

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      refferalId: generatedReferralId,
    });
    await newUser.save();

    const newWallet = new wallet({
      userID: newUser._id,
      balance: 0,
      transactions: [],
    });

    if (refferalId) {
      const referringUser = await User.findOne({ refferalId: refferalId });
      if (referringUser) {
        const referrerWallet = await wallet.findOne({
          userID: referringUser._id,
        });
        if (referrerWallet) {
          referrerWallet.balance += 100;
          referrerWallet.transactions.push({
            type: "credit",
            amount: 100,
            description: "Referral reward for inviting a new user",
            referenceType: "topup",
            status: "completed",
          });
          await referrerWallet.save();
        }

        newWallet.balance += 50;
        newWallet.transactions.push({
          type: "credit",
          amount: 50,
          description: "Referral bonus for signing up with a referral code",
          referenceType: "topup",
          status: "completed",
        });
      }
    }

    await newWallet.save();

    return res.status(201).json({
      message: "User registered successfully",
      userId: newUser._id,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error during signup" });
  }
};

const googleauth = async (req, res) => {
  try {
    const email = req.user.email;
    const profilePicture = req.user.photos?.[0]?.value || "";

    // Use the structured name data from Google
    const firstName = req.user?.name?.givenName || "";
    const lastName = req.user?.name?.familyName || "User";

    let userfind = await userSchema.findOne({ email });

    if (userfind && userfind.isBlocked) {
      return res.redirect("http://localhost:5173/login?error=blocked");
    }

    if (!userfind) {
      userfind = new userSchema({
        googleId: req.user.id,
        email: email,
        profileImage: profilePicture,
        firstName: firstName,
        lastName: lastName,
      });
      await userfind.save();
    } else {
      if (!userfind.googleId) {
        userfind.googleId = req.user.id;
      }
      if (profilePicture && !userfind.profileImage) {
        userfind.profileImage = profilePicture;
      }
      // Only update names if they're empty and we have new data
      if (!userfind.firstName && firstName) userfind.firstName = firstName;
      if (!userfind.lastName && lastName) userfind.lastName = lastName;
      await userfind.save();
    }

    const token = jwt.sign(
      { userId: userfind._id },
      process.env.JWT_USER_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.redirect(
      `${process.env.FRONTEND_URL}?success=true&name=${encodeURIComponent(
        userfind.firstName || ""
      )}&id=${userfind._id || ""}`
    );
  } catch (error) {
    res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
  }
};

//login

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const userfind = await userSchema.findOne({ email });

    if (!userfind) {
      return res.status(404).json({ message: "the user is not found" });
    }

    if (userfind.isBlocked) {
      return res
        .status(403)
        .json({ message: "Your account has been blocked by the admin" });
    }
    const matching = await bcrypt.compare(password, userfind.password);
    if (!matching)
      return res.status(404).json({ message: "invalid username and password" });

    const token = jwt.sign(
      { userId: userfind._id },
      process.env.JWT_USER_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ message: "Login successful", userfind });
  } catch (error) {
    res.status(500).json({ message: "something error" });
  }
};

const verifyToken = async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_USER_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: "Account blocked" });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(403).json({ message: "Invalid token" });
  }
};

const logoutuser = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
  });
  res.json({ message: "logged out successfully" });
};

//profile details

const profiledetails = async (req, res) => {
  try {
    const userId = req.params.id;
    const email = req.params.email
   
    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User not authenticated" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if(user.email !== email){
      return res.status(403).json({message:'Oops this page is not get !'})
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: "Account blocked" });
    }

    res.status(200).json(user);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error while fetching profile details" });
  }
};

// change password

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const userId = req.params.id;

  try {
    if (!userId)
      return res.status(400).json({ message: "the userid is needed" });
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Current password and new password are required" });
    }
    const user = await userSchema.findById({ _id: userId });

    if (!user)
      return res.status(404).json({ message: "the user not founded!" });

    //checking

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch)
      return res.status(401).json({ message: "Current password is incorrect" });

    if (currentPassword === newPassword) {
      return res
        .status(400)
        .json({
          message: "New password must be different from current password",
        });
    }

    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

module.exports = {
  sendOtp,
  signup,
  login,
  verifyToken,
  logoutuser,
  googleauth,
  sendOtpforgot,
  resetPassword,
  verifyOtp,
  profiledetails,
  verifyOtpAndUpdateProfile,
  sendOtpeditprofile,
  sendotpchangepassword,
  changePassword,
};
