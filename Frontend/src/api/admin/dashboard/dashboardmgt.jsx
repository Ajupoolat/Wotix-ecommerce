// dashboardmgt.js
import api from "@/api/Api_Instances/instance";

export const getSalesStatistics = async ({ status, search, page = 1, limit = 10 }) => {
  try {
    const { data } = await api.get(`/api/admin/sales-statistics`, {
      params: { status, search, page, limit }
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const generateSalesReport = async (params) => {
  try {
    const { data } = await api.get(`/api/admin/sales-report`, {
      params,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const updateOrderStatus = async (orderId, status) => {
  try {
    const { data } = await api.put(`/api/admin/orders/${orderId}/status`, { status });
    return data;
  } catch (error) {
    throw error;
  }
};

