const nodemailer = require("nodemailer");
const crypto = require("crypto");
const { RedisClient } = require("../config/redisUpstash");

// Single unified Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


const generateOtp = (length = 6) => {
  return crypto.randomInt(100000, 999999).toString();
};

const sendAndStoreOtp = async ({
  email,
  purpose = "general",
  ttl = 300,
  subject = "Your WOTIX Verification Code",
  customText,
}) => {
  const otp = generateOtp();
  const minutes = Math.ceil(ttl / 60);

  // Store namespaced OTP in Redis with TTL
  const redisKey = `otp:${purpose}:${email}`;
  await RedisClient.set(redisKey, otp, { ex: ttl });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: subject,
    text:
      customText ||
      `Your WOTIX verification code is: ${otp}. It is valid for ${minutes} minute${minutes > 1 ? "s" : ""}. Do not share this code with anyone.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #1a1a1a; text-align: center; margin-bottom: 20px;">WOTIX Verification</h2>
        <p style="font-size: 15px; color: #4a4a4a;">Hello,</p>
        <p style="font-size: 15px; color: #4a4a4a;">Use the following one-time verification code to proceed:</p>
        <div style="background-color: #f7f7f7; padding: 15px; text-align: center; font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #111; border-radius: 6px; margin: 25px 0;">
          ${otp}
        </div>
        <p style="font-size: 13px; color: #777;">This code is valid for <strong>${minutes} minute${minutes > 1 ? "s" : ""}</strong>. If you did not request this code, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 11px; color: #999; text-align: center;">© WOTIX Haute Horlogerie. All rights reserved.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
  return { success: true, otp };
};


const verifyAndConsumeOtp = async ({ email, otp, purpose = "general" }) => {
  if (!email || !otp) {
    return { isValid: false, message: "Email and OTP are required" };
  }

  const redisKey = `otp:${purpose}:${email}`;
  const storedOtp = await RedisClient.get(redisKey);

  if (!storedOtp || String(storedOtp).trim() !== String(otp).trim()) {
    return { isValid: false, message: "Invalid or expired OTP" };
  }

  // Consume OTP immediately to prevent replay attacks
  await RedisClient.del(redisKey);
  return { isValid: true };
};


const storeResetToken = async (resetToken, email, ttl = 600) => {
  await RedisClient.set(`password-reset:${resetToken}`, email, { ex: ttl });
};


const verifyAndConsumeResetToken = async (resetToken) => {
  if (!resetToken) return null;
  const redisKey = `password-reset:${resetToken}`;
  const email = await RedisClient.get(redisKey);
  if (!email) return null;

  // Consume token
  await RedisClient.del(redisKey);
  return email;
};

module.exports = {
  generateOtp,
  sendAndStoreOtp,
  verifyAndConsumeOtp,
  storeResetToken,
  verifyAndConsumeResetToken,
};

