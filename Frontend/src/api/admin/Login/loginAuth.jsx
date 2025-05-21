// import axios from "axios";

// const API_BASE_URL = "http://localhost:5000"; // Change this based on your backend URL

// export const adminLogin = async (credentials) => {
//   const response = await axios.post(
//     `${API_BASE_URL}/api/admin/adminlogin`,
//     credentials,
//     {
//       withCredentials: true,
//     }
//   );
//   return response.data;
// };

// export const checkauth = async () => {
//   try {
//     const response = await axios.get(`${API_BASE_URL}/api/admin/verifyadmin`, {
//       withCredentials: true,
//     });
//     return response.data;
//   } catch (error) {}
// };

// export const adminLogout = async () => {
//   const response = await axios.post(
//     `${API_BASE_URL}/api/admin/adminlogout`,
//     {},
//     { withCredentials: true }
//   );
//   return response.data;
// };

import api from "@/api/Api_Instances/instance";


export const adminLogin = async (credentials) => {

try {
   const response = await api.post(
    `/api/admin/adminlogin`,
    credentials,
  );
  return response.data;
} catch (error) {
  throw error
}

};


export const checkauth = async () => {
  try {
    const response = await api.get(`/api/admin/verifyadmin`
    );
    return response.data;
  } catch (error) {
    throw error
  }
};


 export const adminLogout = async () => {
try {
    const response = await api.post(
    `/api/admin/adminlogout`,
    {},
  );
  return response.data;
} catch (error) {
  throw error
}
 };
