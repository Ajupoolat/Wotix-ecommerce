import api from "@/api/Api_Instances/instance";

export const getoffer = async ({ search, status, page, limit }) => {
  try {
    const response = await api.get(`/api/admin/offers`, {
      params: { search, status, page, limit },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getproductlist = async () => {
  try {
    const response = await api.get(`/api/admin/productlist`, {});
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getcategorylist = async () => {
  try {
    const response = await api.get(`/api/admin/categorylist`, {});
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createOffer = async (offerData) => {
  try {
    const response = await api.post(`/api/admin/offers`, offerData, {
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
    const response = await api.patch(
      `/api/admin/offers/${offerId}`,
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
    const response = await api.delete(`/api/admin/offers/${offerId}`, {
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
    const response = await api.get(`/api/admin/offers/${offerId}`, {});
    return response.data;
  } catch (error) {
    throw error;
  }
};
