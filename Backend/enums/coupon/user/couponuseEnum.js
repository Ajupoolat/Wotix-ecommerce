module.exports = Object.freeze({
  CouponResponses: {
    ID_REQUIRED: {
      message: "Coupon ID is required",
      statusCode: 400
    },
    COUPON_NOT_FOUND: {
      message: "Coupon not found",
      statusCode: 404
    },
    REQUIRED_FIELDS_MISSING: {
      message: "Required fields are missing",
      statusCode: 400
    },
    COUPON_CODE_EXISTS: {
      message: "Coupon code already exists",
      statusCode: 400
    },
    INVALID_COUPON_CODE: {
      message: "Invalid coupon code",
      statusCode: 400,
      errorCode: "COUPON_INVALID"
    },
    COUPON_EXPIRED: {
      message: "Coupon is not valid at this time",
      statusCode: 400,
      errorCode: "COUPON_EXPIRED"
    },
    MIN_PURCHASE_NOT_MET: {
      message: "Minimum purchase of ₹{amount} required",
      statusCode: 400,
      errorCode: "MIN_PURCHASE_NOT_MET"
    },
    FETCH_ERROR: {
      message: "Failed to fetch coupons",
      statusCode: 500
    },
    FETCH_COUPON_ERROR: {
      message: "Something went wrong while fetching the coupon",
      statusCode: 500
    },
    CREATE_ERROR: {
      message: "Something went wrong while creating the coupon",
      statusCode: 500
    },
    UPDATE_ERROR: {
      message: "Something went wrong while updating the coupon",
      statusCode: 500
    },
    DELETE_SUCCESS: {
      message: "Coupon deleted successfully",
      statusCode: 200
    },
    SERVER_ERROR: {
      message: "Server error",
      statusCode: 500,
      errorCode: "SERVER_ERROR"
    },
    ELIGIBLE_FETCH_ERROR: {
      message: "Error fetching coupons",
      statusCode: 500
    }
  }
});