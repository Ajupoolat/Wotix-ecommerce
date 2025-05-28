import apiUser from "@/api/Api_Instances/userInstance";

// Send OTP API Call
export const sendOtp = async (email) => {
  try {
    const response = await apiUser.post(`/send-otp`, {
      email,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const sendOtpforgot = async (email) => {
  try {
    const response = await apiUser.post(`/sendotpforgot`, {
      email,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Signup apiUser Call (Verify OTP & Create User)
export const usersignup = async (form) => {
  try {
    const response = await apiUser.post(`/signup`, form, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

//login apiUser call
export const userlogin = async (credentials) => {
  try {
    const response = await apiUser.post(`/login`, credentials);

    return response.data;
  } catch (error) {
    throw error;
  }
};
//user verification
export const checkuser = async () => {
  try {
    const response = await apiUser.get(`/verifyuser`);
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
    const response = await apiUser.post(`/verifyotp`, { email, otp });

    return response.data;
  } catch (error) {
    throw error;
  }
};

//reset password

export const resetpassword = async (email, otp, newPassword) => {
  try {
    const response = await apiUser.patch(`/resetpassword`, {
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
    const response = await apiUser.post(`/logoutuser`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
