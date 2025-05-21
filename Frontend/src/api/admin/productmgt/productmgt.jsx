import api from "@/api/Api_Instances/instance";

export const addproduct = async (fromdata) => {
  try {
    const response = await api.post(`/api/admin/addproduct`, fromdata);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getproductdetails = async ({ page, limit, search }) => {
  try {
    const response = await api.get(`/api/admin/productdetails`, {
      params: { page, limit, search },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const allproducts = async () => {
  try {
    const response = await api.get(`/api/admin/allproducts`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getproductforedit = async () => {
  try {
    const response = await api.get(`/api/admin/productdetails`);
    return response.data;
  } catch (error) {}
};

export const deleteproduct = async (userId) => {
  try {
    const response = await api.delete(`/api/admin/removeproduct/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const editproduct = async ({ productId, formData }) => {
  try {
    const response = await api.patch(
      `/api/admin/editproduct/${productId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const searchproduct = async (query) => {
  try {
    const response = await api.get(`/api/admin/searchproduct?query=${query}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const handleHide = async ({ productId, isHidden }) => {
  try {
    const response = await api.patch(
      `/api/admin/toggle-visibility/${productId}`,
      { isHidden }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
