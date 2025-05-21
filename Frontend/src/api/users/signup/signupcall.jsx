import api from "@/api/Api_Instances/instance";

// Send OTP API Call
export const sendOtp = async (email) => {
  try {
    const response = await api.post(`/userapi/user/send-otp`, {
      email,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const sendOtpforgot = async (email) => {
  try {
    const response = await api.post(`/userapi/user/sendotpforgot`, {
      email,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Signup API Call (Verify OTP & Create User)
export const usersignup = async (form) => {
  try {
    const response = await api.post(`/userapi/user/signup`, form, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

//login api call
export const userlogin = async (credentials) => {
  try {
    const response = await api.post(`/userapi/user/login`, credentials);

    return response.data;
  } catch (error) {
    throw error;
  }
};
//user verification
export const checkuser = async () => {
  try {
    const response = await api.get(`/userapi/user/verifyuser`);
    if (response.status === 401 || !response.data.user) {
      return null;
    }
    return response.data;
  } catch (error) {
    return null;
  }
};

export const checkotp = async ({ email, otp }) => {
  try {
    const response = await api.post(`/userapi/user/verifyotp`, { email, otp });

    return response.data;
  } catch (error) {
    throw error;
  }
};

//reset password

export const resetpassword = async (email, otp, newPassword) => {
  try {
    const response = await api.patch(`/userapi/user/resetpassword`, {
      email,
      otp,
      newPassword,
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logoutuser = async () => {
  try {
    const response = await api.post(`/userapi/user/logoutuser`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
