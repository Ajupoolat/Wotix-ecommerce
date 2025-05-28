import apiUser from "@/api/Api_Instances/userInstance";
export const viewprofile = async (userId, email) => {
  try {
    const response = await apiUser.get(`/profile/${userId}/${email}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const editprofile = async (formData) => {
  try {
    const response = await apiUser.patch(`/updateprofile/`, formData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const sendotpedit = async (email, userId) => {
  try {
    const response = await apiUser.post(`/otpediting`, {
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
    const response = await apiUser.post(`/sendotpchangepassword`, {
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
    const response = await apiUser.get(
      `/alladdress/${userId}/${email}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const addaddress = async (fromdata) => {
  const userId = localStorage.getItem("userId");
  try {
    const response = await apiUser.post(
      `/newaddress/${userId}`,
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
    const response = await apiUser.delete(
      `/removeaddress/${categoryId}/${userId}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const changePassword = async (updatedata) => {
  const userId = localStorage.getItem("userId");

  try {
    const response = await apiUser.patch(
      `/changepassword/${userId}`,
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
    const response = await apiUser.patch(
      `/updateaddress/${categoryId}/${userId}`,
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
      `/setdefault/${addressid}/${userId}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
