import api from "@/api/Api_Instances/instance";

export const getWallet = async (userId, page = 1, limit = 10) => {
  const email = localStorage.getItem("email");
  try {
    const response = await api.get(
      `/userapi/user/wallet/${email}/${userId}?page=${page}&limit=${limit}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};