import apiAdmin from "@/api/Api_Instances/adminInstance";
// Get all coupons
export const getAllCoupons = async ({ search, status, page, limit }) => {
  try {
    const response = await apiAdmin.get(`/coupon`, {
      params: { search, status, page, limit },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get coupon by ID
export const getCouponById = async (id) => {
  try {
    const response = await apiAdmin.get(`/coupon/${id}`, {});
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Create new coupon
export const createCoupon = async (couponData) => {
  try {
    const response = await apiAdmin.post(`/coupon`, couponData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update coupon
export const updateCoupon = async (id, updateData) => {
  try {
    const response = await apiAdmin.patch(`/coupon/${id}`, updateData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete coupon
export const deleteCoupon = async (id) => {
  try {
    const response = await apiAdmin.delete(`/coupon/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
