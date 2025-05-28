import apiAdmin from "@/api/Api_Instances/adminInstance";

export const getuserdetails = async ({ page, limit, search }) => {
  try {
    const response = await apiAdmin.get(`/getuserdetails`, {
      params: { page, limit, search },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const blockuser = async ({ userId, isBlocked }) => {
  try {
    const response = await apiAdmin.patch(`/blockuser/${userId}`, {
      isBlocked,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const searchuser = async (query) => {
  try {
    const response = await apiAdmin.get(`/searchuser?query=${query}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
