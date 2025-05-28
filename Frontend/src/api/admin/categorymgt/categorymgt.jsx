import apiAdmin from "@/api/Api_Instances/adminInstance";
export const addcategory = async (formdata) => {
  try {
    const response = await apiAdmin.post("/addcategory", formdata);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get categories with search, status, page, and limit
export const getcategory = async ({ search, status, page, limit }) => {
  try {
    const response = await apiAdmin.get("/categorydetails", {
      params: { search, status, page, limit },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getcategories = async () => {
  try {
    const response = await apiAdmin.get("/categorieslists");

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deletecategory = async (categoryId) => {
  try {
    const response = await apiAdmin.delete(
      `/deletecategory/${categoryId}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const editcategory = async (categoryId, updatedata) => {
  try {
    const response = await apiAdmin.patch(
      `/editcategory/${categoryId}`,
      updatedata
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const searchcategory = async (query) => {
  try {
    const response = await apiAdmin.get(`/searchcategory?query=${query}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const handleHideCategoy = async ({ categoryId, isHidden }) => {
  try {
    const response = await apiAdmin.patch(
      `/togglecat-visiblity/${categoryId}`,
      { isHidden }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
