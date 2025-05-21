import api from "@/api/Api_Instances/instance";

export const viewprofile = async (userId, email) => {
  try {
    const response = await api.get(`/userapi/user/profile/${userId}/${email}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const editprofile = async (formData) => {
  try {
    const response = await api.patch(`/userapi/user/updateprofile/`, formData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const sendotpedit = async (email, userId) => {
  try {
    const response = await api.post(`/userapi/user/otpediting`, {
      email,
      userId,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const sendotpchangepassword = async ({ emailId, userId }) => {
  try {
    const response = await api.post(`/userapi/user/sendotpchangepassword`, {
      emailId,
      userId,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// address code

export const getaddress = async (userId) => {
  const email = localStorage.getItem("email");
  try {
    const response = await api.get(
      `/userapi/user/alladdress/${userId}/${email}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const addaddress = async (fromdata) => {
  const userId = localStorage.getItem("userId");
  try {
    const response = await api.post(
      `/userapi/user/newaddress/${userId}`,
      fromdata
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteaddress = async (categoryId) => {
  const userId = localStorage.getItem("userId");

  try {
    const response = await api.delete(
      `/userapi/user/removeaddress/${categoryId}/${userId}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const changePassword = async (updatedata) => {
  const userId = localStorage.getItem("userId");

  try {
    const response = await api.patch(
      `/userapi/user/changepassword/${userId}`,
      updatedata
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const editaddress = async (categoryId, updatedata) => {
  const userId = localStorage.getItem("userId");

  try {
    const response = await api.patch(
      `/userapi/user/updateaddress/${categoryId}/${userId}`,
      updatedata
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const setdefaultadress = async (addressid) => {
  const userId = localStorage.getItem("userId");

  try {
    const response = await api.put(
      `/userapi/user/setdefault/${addressid}/${userId}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
