import api from "@/api/Api_Instances/instance";

export const addcategory = async (formdata) => {
  try {
    const response = await api.post("/api/admin/addcategory", formdata);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get categories with search, status, page, and limit
export const getcategory = async ({ search, status, page, limit }) => {
  try {
    const response = await api.get("/api/admin/categorydetails", {
      params: { search, status, page, limit },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getcategories = async () => {
  try {
    const response = await api.get("/api/admin/categorieslists");

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deletecategory = async (categoryId) => {
  try {
    const response = await api.delete(
      `/api/admin/deletecategory/${categoryId}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const editcategory = async (categoryId, updatedata) => {
  try {
    const response = await api.patch(
      `/api/admin/editcategory/${categoryId}`,
      updatedata
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const searchcategory = async (query) => {
  try {
    const response = await api.get(`/api/admin/searchcategory?query=${query}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const handleHideCategoy = async ({ categoryId, isHidden }) => {
  try {
    const response = await api.patch(
      `/api/admin/togglecat-visiblity/${categoryId}`,
      { isHidden }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
