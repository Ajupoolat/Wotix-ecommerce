import apiAdmin from "@/api/Api_Instances/adminInstance";

export const getSalesStatistics = async ({ status, search, page = 1, limit = 10 }) => {
  try {
    const { data } = await apiAdmin.get(`/sales-statistics`, {
      params: { status, search, page, limit }
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const generateSalesReport = async (params) => {
  try {
    const { data } = await apiAdmin.get(`/sales-report`, {
      params,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const updateOrderStatus = async (orderId, status) => {
  try {
    const { data } = await apiAdmin.put(`/orders/${orderId}/status`, { status });
    return data;
  } catch (error) {
    throw error;
  }
};

