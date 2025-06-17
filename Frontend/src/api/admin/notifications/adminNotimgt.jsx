import apiAdmin from "@/api/Api_Instances/adminInstance";

// get the notifcations

export const getNotificationsAdmin = async (page = 1, limit = 10) => {
  try {
    const response = await apiAdmin.get(`/notificationsAdmin`, {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateNoificationsAdmin = async (id) => {
  try {
    const response = await apiAdmin.patch(`/notificationsAdmin/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteNotifactionsAdmin = async (id) => {
  try {
    const response = await apiAdmin.delete(`/notificationsAdmin/${id}`);

    return response.data;
  } catch (error) {
    throw error;
  }
};


