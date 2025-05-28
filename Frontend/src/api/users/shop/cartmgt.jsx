import apiUser from "@/api/Api_Instances/userInstance";

export const addToCart = async (userId, cartItem) => {
  const productId =
    typeof cartItem.productId === "object"
      ? cartItem.productId.productId
      : cartItem.productId;
  try {
    const response = await apiUser.post(
      `/addcart/${userId}`,
      {
        productId,
        quantity: cartItem.quantity,
        originalPrice: cartItem.originalPrice,
        price: cartItem.price,
        ...(cartItem.offerId && {
          offerId: cartItem.offerId,
          offerName: cartItem.offerName,
          discountValue: cartItem.discountValue,
        }),
      },
      {}
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get user's cart
export const getCart = async (userId) => {
  const email = localStorage.getItem("email");
  try {
    const response = await apiUser.get(`/cart/${userId}/${email}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Remove item from cart
export const removeFromCart = async (userId, productId) => {
  try {
    const response = await apiUser.delete(
      `/removecart/${productId}/${userId}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update cart item quantity
export const updateCartQuantity = async (userId, productId, action) => {
  try {
    const response = await apiUser.patch(
      `/updatecart/${productId}/${userId}`,
      { action }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Clear entire cart
export const clearCart = async (userId) => {
  try {
    const response = await apiUser.patch(`/clearcart/${userId}`, null);
    return response.data;
  } catch (error) {
    throw error;
  }
};
