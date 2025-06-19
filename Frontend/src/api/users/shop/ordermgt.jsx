import apiUser from "@/api/Api_Instances/userInstance";


export const placeOrder = async (userId, orderData) => {
  try {
    const response = await apiUser.post(
      `/placeorder/${userId}`,
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
    const response = await apiUser.get(
      `/orderslist/${email}/${userId}?page=${page}&limit=${limit}`,
      {}
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const retry_payment = async (orderId) => {
  try {
    const response = await apiUser.get(
      `/retry-payment/${orderId}`,
      {}
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const ordersearch = async (query) => {
  try {
    const response = await apiUser.get(
      `/searchorder?query=${query}`,
      {}
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const applycoupon = async ({ couponcode, currentSubtotal }) => {
  try {
    const response = await apiUser.post(
      `/apply-coupon`,
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
    const response = await apiUser.get(`/bestcoupon`, {
      params: { subtotal },
    });
    return response.data.coupon;
  } catch (error) {
    throw error;
  }
};

export const order_details = async (userId,orderId) => {
  try {
    const response = await apiUser.get(`/orders-details/${userId}/${orderId}`);
    return response.data
  } catch (error) {
    throw error
  }
}


export const cancelOrderApi = async (cancelData,orderid) =>{

  try {
    const response = await apiUser.post(`/orderscancel/${orderid}`,cancelData,{
      headers:{"Content-Type" : "application/json"}
    });
    return response.data;
  } catch (error) {
    throw error
  }
}

export const returnOrderApi = async (returnData,orderid,userid) => {
  try {
    const response = await apiUser.post(`/ordersreturn/${orderid}/return-requests/${userid}`,returnData);
    return response.data
  } catch (error) {
    throw error
  }
}


export  const downloadInvoiceApi = async (orderId,userId) =>{

  try {
    const response = await apiUser.get(`/invoice/${userId}/${orderId}`,{
      responseType:'blob'
    })
    return response.data
  } catch (error) {
    throw error
  }
}
