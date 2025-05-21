import api from "@/api/Api_Instances/instance";

export const placeOrder = async (userId, orderData) => {
  try {
    const response = await api.post(
      `/userapi/user/placeorder/${userId}`,
      orderData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

//get the orders list

export const getorderslist = async (userId, page = 1, limit = 10) => {
  const email = localStorage.getItem("email");
  try {
    const response = await api.get(
      `/userapi/user/orderslist/${email}/${userId}?page=${page}&limit=${limit}`,
      {}
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const retry_payment = async (orderId) => {
  try {
    const response = await api.get(
      `/userapi/user/retry-payment/${orderId}`,
      {}
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const ordersearch = async (query) => {
  try {
    const response = await api.get(
      `/userapi/user/searchorder?query=${query}`,
      {}
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const applycoupon = async ({ couponcode, currentSubtotal }) => {
  try {
    const response = await api.post(
      `/userapi/user/apply-coupon`,
      { couponcode, currentSubtotal },
      { headers: { "Content-Type": "application/json" } }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return response.data.data;
  } catch (error) {
    if (error.response) {
      throw {
        message: error.response.data.message,
        code: error.response.data.error,
        response: error.response,
      };
    }
    throw error;
  }
};
export const bestCoupon = async (subtotal) => {
  try {
    const response = await api.get(`/userapi/user/bestcoupon`, {
      params: { subtotal },
    });
    return response.data.coupon;
  } catch (error) {
    throw error;
  }
};
