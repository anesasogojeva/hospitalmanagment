// services/RekordService.js
import axios from "axios";

const API_URL = "https://localhost:7246/api/Rekord";
const headers = {
  Authorization: `Bearer ${localStorage.getItem("token")}`,
};

const RekordService = {
  getAll: async () => {
    return await axios.get(API_URL, { headers });
  },

  getById: async (id_Rek) => {
    return await axios.get(`${API_URL}/${id_Rek}`, { headers });
  },

  create: async (data) => {
    return await axios.post(API_URL, data, { headers });
  },

  update: async (id_Rek, data) => {
    return await axios.put(`${API_URL}/${id_Rek}`, data, { headers });
  },

  delete: async (id_Rek) => {
    return await axios.delete(`${API_URL}/${id_Rek}`, { headers });
  },

  search: async ({ search = '', doctorId = '', page = 1, pageSize = 10 } = {}) => {
    const authHeaders = { Authorization: `Bearer ${localStorage.getItem('token')}` };
    return await axios.get(`${API_URL}/search`, {
      params: { search: search || undefined, doctorId: doctorId || undefined, page, pageSize },
      headers: authHeaders,
    });
  },
};

export default RekordService;
