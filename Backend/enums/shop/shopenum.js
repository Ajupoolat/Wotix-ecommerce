module.exports = Object.freeze({
  ProductResponses: {
    PRODUCTS_FETCHED_SUCCESS: {
      message: "Products fetched successfully",
      statusCode: 200
    },
    PRODUCTS_NOT_FOUND: {
      message: "Products not found",
      statusCode: 404
    },
    PRODUCT_NOT_FOUND: {
      message: "Product not found: {productId}",
      statusCode: 404
    },
    STRAP_MATERIALS_FETCHED_SUCCESS: {
      message: "Strap materials fetched successfully",
      statusCode: 200
    },
    CATEGORIES_FETCHED_SUCCESS: {
      message: "Categories fetched successfully",
      statusCode: 200
    },
    RECOMMENDATIONS_FETCHED_SUCCESS: {
      message: "Product recommendations fetched successfully",
      statusCode: 200
    },
    SERVER_ERROR: {
      message: "Server error",
      statusCode: 500,
      error: "Server error"
    }
  }
});