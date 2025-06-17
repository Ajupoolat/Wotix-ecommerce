import apiUser from "@/api/Api_Instances/userInstance";

//get notfications

export const getNotificationsUser = async (page = 1, limit = 10) => {
  try {
    const userId = localStorage.getItem("userId");
    const response = await apiUser.get(`/noficationsusers/${userId}`, {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateNotificationsUser = async (id) => {
  try {
    const response = await apiUser.patch(`/notificationsusers/${id}`);

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteNotifactionsUser = async (id) => {
  try {
    const response = await apiUser.delete(`/notificationsusers/${id}`);

    return response.data;
  } catch (error) {
    throw error;
  }
};
