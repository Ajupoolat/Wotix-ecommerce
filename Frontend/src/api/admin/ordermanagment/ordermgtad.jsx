import api from "@/api/Api_Instances/instance";

export const getorders = async ({
  search,
  sortByDate,
  status,
  page,
  limit,
}) => {
  try {
    const response = await api.get(`/api/admin/orders`, {
      params: { search, sortByDate, status, page, limit },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getordersdetails = async (orderId) => {
  try {
    const response = await api.get(`/api/admin/orders/${orderId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateOrderStatus = async (orderId, newStatus) => {
  try {
    const response = await api.patch(`/api/admin/orders/${orderId}/status`, {
      status: newStatus,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const processReturnRequest = async (
  orderId,
  requestId,
  data,
  { socket, connectedUsers }
) => {
  try {
    const response = await api.put(
      `/api/admin/process/${orderId}/${requestId}`,
      { ...data, socketId: socket?.id } // Send socket ID to backend
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getreturnpending = async () => {
  try {
    const response = await api.get(`/api/admin/pending`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
