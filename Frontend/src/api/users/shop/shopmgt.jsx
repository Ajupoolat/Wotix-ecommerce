import apiUser from "@/api/Api_Instances/userInstance";

export const getshopproduct = async ({
  page = 1,
  limit = 12,
  category = "",
  minPrice = "",
  maxPrice = "",
  strapMaterial = "",
  sortBy = "",
}) => {
  try {
    const response = await apiUser.get(`/shop`, {
      params: {
        page,
        limit,
        category,
        minPrice,
        maxPrice,
        strapMaterial,
        sortBy,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const Searching = async ({ query, page = 1, limit = 12 }) => {
  try {
    const response = await apiUser.get(
      `/search?query=${query}&page=${page}&limit=${limit}`,
      {}
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const details = async (productId) => {
  try {
    const response = await apiUser.get(
      `/viewproduct/${productId}`,
      {}
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const strapdetails = async () => {
  try {
    const response = await apiUser.get(`/straps`, {});
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const recommandation = async (category) => {
  try {
    const response = await apiUser.get(
      `/recommandation/${category}`,
      {}
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const offersdetails = async () => {
  try {
    const response = await apiUser.get(`/offers`, {});
    return response.data;
  } catch (error) {
    throw error;
  }
};
// offers()

export const products = async () => {
  try {
    const response = await apiUser.get(`/products`, {});
    return response.data;
  } catch (error) {
    throw error;
  }
};
// offers()

export const getProductById = async (data) => {
  const id = data?.productId?.productId;
  try {
    const response = await apiUser.get(`/products/${id}`, {});
    return response.data;
  } catch (error) {
    throw error;
  }
};


export const getfiltercategory = async () => {
  try {
    const response = await apiUser.get(`/filtercat`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

