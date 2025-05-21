module.exports = Object.freeze({
  OrderResponses: {
    MISSING_FIELDS: {
      message: "Missing required fields",
      statusCode: 400
    },
    PRODUCT_NOT_FOUND: {
      message: "Product not found: {productName}",
      statusCode: 404
    },
    INSUFFICIENT_STOCK: {
      message: "Insufficient stock for {productName}. Available: {stock}, Requested: {quantity}",
      statusCode: 400
    },
    INVALID_COUPONS: {
      message: "Some coupons are no longer valid",
      statusCode: 400
    },
    SUBTOTAL_MISMATCH: {
      message: "Subtotal mismatch",
      statusCode: 400
    },
    DISCOUNT_MISMATCH: {
      message: "Discount calculation mismatch",
      statusCode: 400
    },
    TOTAL_PRICE_MISMATCH: {
      message: "Total price mismatch",
      statusCode: 400
    },
    FINAL_AMOUNT_MISMATCH: {
      message: "Final amount mismatch",
      statusCode: 400
    },
    INVALID_PAYMENT_AMOUNT: {
      message: "Invalid payment amount",
      statusCode: 400
    },
    RAZORPAY_ORDER_FAILED: {
      message: "Failed to create Razorpay order",
      statusCode: 500
    },
    ORDER_PLACED_SUCCESS: {
      message: "Order placed successfully",
      statusCode: 201
    },
    MISSING_PAYMENT_DETAILS: {
      message: "Missing required payment details",
      statusCode: 400
    },
    INVALID_PAYMENT_SIGNATURE: {
      message: "Invalid payment signature",
      statusCode: 400
    },
    ORDER_NOT_FOUND: {
      message: "Order not found",
      statusCode: 404
    },
    PAYMENT_VERIFIED_SUCCESS: {
      message: "Payment verified successfully",
      statusCode: 200
    },
    UNAUTHORIZED_ACCESS: {
      message: "This order does not exist or you don’t have permission to view it.",
      statusCode: 403
    },
    NO_ORDERS_FOUND: {
      message: "No orders found",
      statusCode: 404
    },
    PAYMENT_ALREADY_COMPLETED: {
      message: "Payment already completed for this order",
      statusCode: 400,
      error: "Payment already completed for this order"
    },
    RETRY_PAYMENT_FAILED: {
      message: "Failed to initiate payment retry",
      statusCode: 500,
      error: "Failed to initiate payment retry"
    },
    ORDER_CANCEL_NOT_ALLOWED: {
      message: "Order cannot be cancelled at this stage",
      statusCode: 400
    },
    ORDER_CANCEL_SUCCESS: {
      message: "Order {status} successfully",
      statusCode: 200
    },
    ORDERS_NOT_FOUND: {
      message: "Orders not found",
      statusCode: 404
    },
    INVALID_RETURN_REASON: {
      message: "Valid return reason is required",
      statusCode: 400,
      error: "Valid return reason is required",
      details: "Reason must be a non-empty string"
    },
    INVALID_RETURN_PRODUCTS: {
      message: "Products to return are required",
      statusCode: 400,
      error: "Products to return are required",
      details: "Must provide an array of product IDs"
    },
    ORDER_NOT_ELIGIBLE_FOR_RETURN: {
      message: "Order not eligible for return",
      statusCode: 400,
      error: "Order not eligible for return",
      details: "Current status: {status}"
    },
    RETURN_WINDOW_EXPIRED: {
      message: "Return window has expired",
      statusCode: 400,
      error: "Return window has expired"
    },
    PRODUCTS_NOT_ELIGIBLE_FOR_RETURN: {
      message: "Some products are not eligible for return",
      statusCode: 400,
      error: "Some products are not eligible for return"
    },
    NO_VALID_RETURN_PRODUCTS: {
      message: "No valid products to return",
      statusCode: 400,
      error: "No valid products to return",
      details: "All provided product IDs are invalid or ineligible"
    },
    RETURN_REQUEST_FAILED: {
      message: "Failed to submit return request",
      statusCode: 500,
      error: "Failed to submit return request"
    },
    RETURN_REQUEST_SUCCESS: {
      message: "Return request submitted successfully",
      statusCode: 201
    },
    SERVER_ERROR: {
      message: "Server error",
      statusCode: 500
    }
  }
});