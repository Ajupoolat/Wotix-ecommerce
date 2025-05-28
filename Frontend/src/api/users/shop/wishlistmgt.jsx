import apiUser from "@/api/Api_Instances/userInstance";

export const addToWishlist = async (productId, userId) => {
  try {
    const response = await apiUser.post(
      `/wishlistadd/${productId}/${userId}`,
      null
    );
    return response.data;
  } catch (error) { 
    throw error;
  }
};

export const removeFromWishlist = async (productId, userId) => {
  try {
    const response = await apiUser.delete(
      `/wishlistremove/${productId}/${userId}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getWishlist = async (userId) => {
  const email = localStorage.getItem("email");

  try {
    const response = await apiUser.get(`/wishlist/${userId}/${email}`);

    return response.data;
  } catch (error) {
    throw error;
  }
};
