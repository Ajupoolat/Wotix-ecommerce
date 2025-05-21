import api from "@/api/Api_Instances/instance";

export const addToWishlist = async (productId, userId) => {
  try {
    const response = await api.post(
      `/userapi/user/wishlistadd/${productId}/${userId}`,
      null
    );
    return response.data;
  } catch (error) { 
    throw error;
  }
};

export const removeFromWishlist = async (productId, userId) => {
  try {
    const response = await api.delete(
      `/userapi/user/wishlistremove/${productId}/${userId}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getWishlist = async (userId) => {
  const email = localStorage.getItem("email");

  try {
    const response = await api.get(`/userapi/user/wishlist/${userId}/${email}`);

    return response.data;
  } catch (error) {
    throw error;
  }
};
