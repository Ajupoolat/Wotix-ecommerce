import api from "@/api/Api_Instances/instance";

export const getuserdetails = async ({ page, limit, search }) => {
  try {
    const response = await api.get(`/api/admin/getuserdetails`, {
      params: { page, limit, search },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const blockuser = async ({ userId, isBlocked }) => {
  try {
    const response = await api.patch(`/api/admin/blockuser/${userId}`, {
      isBlocked,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const searchuser = async (query) => {
  try {
    const response = await api.get(`/api/admin/searchuser?query=${query}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
