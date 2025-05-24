import api from "@/api/Api_Instances/instance";

export const adminLogin = async (credentials) => {
  try {
    const response = await api.post(`/api/admin/adminlogin`, credentials);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const checkauth = async () => {
  try {
    const response = await api.get(`/api/admin/verifyadmin`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const adminLogout = async () => {
  try {
    const response = await api.post(`/api/admin/adminlogout`, {});
    return response.data;
  } catch (error) {
    throw error;
  }
};
