import apiUser from "@/api/Api_Instances/userInstance";

export const requestOtpApi = async ({ email, type = "signup", userId }) => {
  const endpoints = {
    signup: "/send-otp",
    forgot: "/sendotpforgot",
    editprofile: "/otpediting",
    changepassword: "/sendotpchangepassword",
  };

  const endpoint = endpoints[type] || "/send-otp";
  const payload =
    type === "changepassword"
      ? { emailId: email, userId }
      : type === "editprofile"
      ? { email, userId }
      : { email };

  const response = await apiUser.post(endpoint, payload);
  return response.data;
};

export const verifyOtpApi = async ({ email, otp }) => {
  const response = await apiUser.post("/verifyotp", { email, otp });
  return response.data;
};

