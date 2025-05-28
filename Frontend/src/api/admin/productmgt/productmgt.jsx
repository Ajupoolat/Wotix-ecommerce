import apiAdmin from "@/api/Api_Instances/adminInstance";

export const addproduct = async (fromdata) => {
  try {
    const response = await apiAdmin.post(`/addproduct`, fromdata);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getproductdetails = async ({ page, limit, search }) => {
  try {
    const response = await apiAdmin.get(`/productdetails`, {
      params: { page, limit, search },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const allproducts = async () => {
  try {
    const response = await apiAdmin.get(`/allproducts`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getproductforedit = async () => {
  try {
    const response = await apiAdmin.get(`/productdetails`);
    return response.data;
  } catch (error) {}
};

export const deleteproduct = async (userId) => {
  try {
    const response = await apiAdmin.delete(`/removeproduct/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const editproduct = async ({ productId, formData }) => {
  try {
    const response = await apiAdmin.patch(
      `/editproduct/${productId}`,
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
    const response = await apiAdmin.get(`/searchproduct?query=${query}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const handleHide = async ({ productId, isHidden }) => {
  try {
    const response = await apiAdmin.patch(`/toggle-visibility/${productId}`, {
      isHidden,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
