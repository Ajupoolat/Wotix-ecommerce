
import apiAdmin from "@/api/Api_Instances/adminInstance";
export const adminLogin = async (credentials) => {
  try {
    const response = await apiAdmin.post(`/adminlogin`, credentials);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const checkauth = async () => {
  try {
    const response = await apiAdmin.get(`/verifyadmin`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const adminLogout = async () => {
  try {
    const response = await apiAdmin.post(`/adminlogout`, {});
    return response.data;
  } catch (error) {
    throw error;
  }
};
