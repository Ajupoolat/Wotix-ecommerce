import apiUser from "@/api/Api_Instances/userInstance";

export const getdefaultaddress = async (userId, email) => {
  try {
    const response = await apiUser.get(`/defaultaddress/${userId}/${email}`);

    return response.data[0];
  } catch (error) {
    throw error;
  }
};

export const verifyPayment = async ({
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
  orderId,
}) => {
  try {
    const response = await apiUser.post(`/verify-payment`, {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    });
    return response;
  } catch (error) {
    throw error;
  }
};
