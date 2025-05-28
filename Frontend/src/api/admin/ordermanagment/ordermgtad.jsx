import apiAdmin from "@/api/Api_Instances/adminInstance";
import apiUser from "@/api/Api_Instances/userInstance";

export const getorders = async ({
  search,
  sortByDate,
  status,
  page,
  limit,
}) => {
  try {
    const response = await apiAdmin.get(`/orders`, {
      params: { search, sortByDate, status, page, limit },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getordersdetails = async (orderId) => {
  try {
    const response = await apiAdmin.get(`/orders/${orderId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateOrderStatus = async (orderId, newStatus) => {
  try {
    const response = await apiAdmin.patch(`/orders/${orderId}/status`, {
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
    const response = await apiAdmin.put(
      `/process/${orderId}/${requestId}`,
      { ...data, socketId: socket?.id } // Send socket ID to backend
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getreturnpending = async () => {
  try {
    const response = await apiAdmin.get(`/pending`);
    return response.data;
  } catch (error) {
    throw error;
  }
};


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
