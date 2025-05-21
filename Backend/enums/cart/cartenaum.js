module.exports = Object.freeze({
  
  CartStatus: {
    SUCCESS: 'success',
    PRODUCT_UNAVAILABLE: 'product_unavailable',
    CATEGORY_UNAVAILABLE: 'category_unavailable',
    MAX_QUANTITY_REACHED: 'max_quantity_reached',
    INSUFFICIENT_STOCK: 'insufficient_stock',
    CART_NOT_FOUND: 'cart_not_found',
    PRODUCT_NOT_IN_CART: 'product_not_in_cart'
  },

  CartActions: {
    INCREASE: 'increase',
    DECREASE: 'decrease'
  },

  CartMessages: {
    ADD_SUCCESS: 'Product added to cart successfully',
    REMOVE_SUCCESS: 'Product removed from cart successfully',
    UPDATE_SUCCESS: 'Cart updated successfully',
    CLEAR_SUCCESS: 'Cart cleared successfully',
    MAX_QUANTITY: 'Maximum quantity limit (3) reached for this product',
    INVALID_ACTION: 'Invalid action',
    INVALID_INPUT: 'Invalid input',
    PRODUCT_EXISTS: 'Product already in cart'
  },

  QuantityLimits: {
    MAX_PER_PRODUCT: 3,
    MIN_PER_PRODUCT: 1
  }
});