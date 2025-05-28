import apiUser from "@/api/Api_Instances/userInstance";

export const getWallet = async (userId, page = 1, limit = 10) => {
  const email = localStorage.getItem("email");
  try {
    const response = await apiUser.get(
      `/wallet/${email}/${userId}?page=${page}&limit=${limit}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};