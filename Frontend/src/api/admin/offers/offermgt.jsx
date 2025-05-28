import apiAdmin from "@/api/Api_Instances/adminInstance";
export const getoffer = async ({ search, status, page, limit }) => {
  try {
    const response = await apiAdmin.get(`/offers`, {
      params: { search, status, page, limit },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getproductlist = async () => {
  try {
    const response = await apiAdmin.get(`/productlist`, {});
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getcategorylist = async () => {
  try {
    const response = await apiAdmin.get(`/categorylist`, {});
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createOffer = async (offerData) => {
  try {
    const response = await apiAdmin.post(`/offers`, offerData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const editoffer = async (offerData, offerId) => {
  try {
    const response = await apiAdmin.patch(
      `/offers/${offerId}`,
      offerData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteoffer = async (offerId) => {
  try {
    const response = await apiAdmin.delete(`/offers/${offerId}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getofferbyId = async (offerId) => {
  try {
    const response = await apiAdmin.get(`/offers/${offerId}`, {});
    return response.data;
  } catch (error) {
    throw error;
  }
};
