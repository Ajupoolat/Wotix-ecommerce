const couponSchema = require("../../models/couponSchema");
const {CouponResponses} = require('../../enums/coupon/user/couponuseEnum')
// Get all coupons
const getAllCoupons = async (req, res) => {
  try {
    const { search = "", status = "all", page = 1, limit = 5 } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    let query = {};
    if (search.trim()) {
      query.code = { $regex: search, $options: "i" };
    }

    if (status !== "all") {
      const now = new Date();
      if (status === "active") {
        query.startDate = { $lte: now };
        query.endDate = { $gte: now };
        query.isActive = true;
      } else if (status === "upcoming") {
        query.startDate = { $gt: now };
      } else if (status === "expired") {
        query.endDate = { $lt: now };
      } else if (status === "unactive") {
        query.isActive = false;
      }
    }

    const totalCoupons = await couponSchema.countDocuments(query);
    const coupons = await couponSchema
      .find(query)
      .sort({createdAt:-1})
      .skip(skip)
      .limit(limitNum)
      .lean();

    const totalPages = Math.ceil(totalCoupons / limitNum);

    res.status(200).json({
      coupons,
      totalCoupons,
      totalPages,
      currentPage: pageNum,
      limit: limitNum,
    });
  } catch (error) {
    res.status(CouponResponses.FETCH_ERROR.statusCode).json({
      message: CouponResponses.FETCH_ERROR.message
    });
  }
};

// Get coupon by ID
const getCouponById = async (req, res) => {
  const couponId = req.params.id;

  if (!couponId) {
    return res.status(CouponResponses.ID_REQUIRED.statusCode).json({
      message: CouponResponses.ID_REQUIRED.message
    });
  }

  try {
    const coupon = await couponSchema.findById(couponId);

    if (!coupon) {
      return res.status(CouponResponses.COUPON_NOT_FOUND.statusCode).json({
        message: CouponResponses.COUPON_NOT_FOUND.message
      });
    }

    res.status(200).json(coupon);
  } catch (error) {
    res.status(CouponResponses.FETCH_COUPON_ERROR.statusCode).json({
      message: CouponResponses.FETCH_COUPON_ERROR.message
    });
  }
};

// Create a new coupon
const createCoupon = async (req, res) => {
  const {
    code,
    discountType,
    discountValue,
    minPurchaseAmount,
    startDate,
    endDate,
  } = req.body;

  if (!code || !discountType || !discountValue || !startDate || !endDate) {
    return res.status(CouponResponses.REQUIRED_FIELDS_MISSING.statusCode).json({
      message: CouponResponses.REQUIRED_FIELDS_MISSING.message
    });
  }

  try {
    const newCoupon = new couponSchema({
      code,
      discountType,
      discountValue,
      minPurchaseAmount: minPurchaseAmount || 0,
      startDate,
      endDate,
      isActive: true,
    });

    const savedCoupon = await newCoupon.save();
    res.status(201).json(savedCoupon);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(CouponResponses.COUPON_CODE_EXISTS.statusCode).json({
        message: CouponResponses.COUPON_CODE_EXISTS.message
      });
    }
    res.status(CouponResponses.CREATE_ERROR.statusCode).json({
      message: CouponResponses.CREATE_ERROR.message
    });
  }
};

// Update a coupon
const updateCoupon = async (req, res) => {
  const couponId = req.params.id;
  const updateData = req.body;

  if (!couponId) {
    return res.status(CouponResponses.ID_REQUIRED.statusCode).json({
      message: CouponResponses.ID_REQUIRED.message
    });
  }

  try {
    const updatedCoupon = await couponSchema.findByIdAndUpdate(
      couponId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedCoupon) {
      return res.status(CouponResponses.COUPON_NOT_FOUND.statusCode).json({
        message: CouponResponses.COUPON_NOT_FOUND.message
      });
    }

    res.status(200).json(updatedCoupon);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(CouponResponses.COUPON_CODE_EXISTS.statusCode).json({
        message: CouponResponses.COUPON_CODE_EXISTS.message
      });
    }
    res.status(CouponResponses.UPDATE_ERROR.statusCode).json({
      message: CouponResponses.UPDATE_ERROR.message
    });
  }
};

// Delete a coupon
const deleteCoupon = async (req, res) => {
  const couponId = req.params.id;

  if (!couponId) {
    return res.status(CouponResponses.ID_REQUIRED.statusCode).json({
      message: CouponResponses.ID_REQUIRED.message
    });
  }

  try {
    const deletedCoupon = await couponSchema.findByIdAndDelete(couponId);

    if (!deletedCoupon) {
      return res.status(CouponResponses.COUPON_NOT_FOUND.statusCode).json({
        message: CouponResponses.COUPON_NOT_FOUND.message
      });
    }

    res.status(CouponResponses.DELETE_SUCCESS.statusCode).json({
      message: CouponResponses.DELETE_SUCCESS.message
    });
  } catch (error) {
    res.status(CouponResponses.SERVER_ERROR.statusCode).json({
      message: CouponResponses.SERVER_ERROR.message
    });
  }
};

// Apply a coupon
const applyCoupon = async (req, res) => {
  try {
    const { couponcode, currentSubtotal } = req.body;

    const coupon = await couponSchema.findOne({
      code: couponcode,
      isActive: true,
    });

    if (!coupon) {
      return res.status(CouponResponses.INVALID_COUPON_CODE.statusCode).json({
        success: false,
        message: CouponResponses.INVALID_COUPON_CODE.message,
        error: CouponResponses.INVALID_COUPON_CODE.errorCode
      });
    }

    // Validity check
    const now = new Date();
    if (now < new Date(coupon.startDate) || now > new Date(coupon.endDate)) {
      return res.status(CouponResponses.COUPON_EXPIRED.statusCode).json({
        success: false,
        message: CouponResponses.COUPON_EXPIRED.message,
        error: CouponResponses.COUPON_EXPIRED.errorCode
      });
    }

    if (currentSubtotal < coupon.minPurchaseAmount) {
      return res.status(CouponResponses.MIN_PURCHASE_NOT_MET.statusCode).json({
        success: false,
        message: CouponResponses.MIN_PURCHASE_NOT_MET.message.replace("{amount}", coupon.minPurchaseAmount),
        error: CouponResponses.MIN_PURCHASE_NOT_MET.errorCode
      });
    }

    res.status(200).json({
      success: true,
      data: {
        _id: coupon._id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minPurchaseAmount: coupon.minPurchaseAmount,
      },
    });
  } catch (error) {
    res.status(CouponResponses.SERVER_ERROR.statusCode).json({
      success: false,
      message: CouponResponses.SERVER_ERROR.message,
      error: CouponResponses.SERVER_ERROR.errorCode
    });
  }
};

// Find eligible coupons
const eligiblecoupon = async (req, res) => {
  try {
    const { subtotal } = req.query;
    const numericSubtotal = parseFloat(subtotal);

    const bestCoupon = await couponSchema.find({
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
      minPurchaseAmount: { $lte: subtotal }
    });

    res.status(200).json({
      success: true,
      coupon: bestCoupon || null,
    });
  } catch (error) {
    res.status(CouponResponses.ELIGIBLE_FETCH_ERROR.statusCode).json({
      success: false,
      message: CouponResponses.ELIGIBLE_FETCH_ERROR.message
    });
  }
};

module.exports = {
  getAllCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  applyCoupon,
  eligiblecoupon,
};