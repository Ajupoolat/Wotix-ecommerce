module.exports = Object.freeze({
  
  WishlistStatus: {
    SUCCESS: 'success',
    PRODUCT_ALREADY_EXISTS: 'product_already_exists',
    PRODUCT_NOT_FOUND: 'product_not_found',
    WISHLIST_NOT_FOUND: 'wishlist_not_found'
  },

  ResponseStatus: {
    SUCCESS: 200,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    SERVER_ERROR: 500
  },

  ErrorMessages: {
    INVALID_INPUT: 'Product ID and User ID are required',
    UNAUTHORIZED_ACCESS: 'You don\'t have permission to view this',
    SERVER_ERROR: 'Server error'
  }
});