import api from "@/api/Api_Instances/instance";
export const getdefaultaddress = async (userId) => {
  try {
    const response = await api.get(`/userapi/user/defaultaddress/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
