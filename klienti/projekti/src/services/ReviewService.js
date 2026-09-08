import axios from "axios";const API_URL = "https://localhost:7246/api/Review";
const PATIENTS_API_URL = "https://localhost:7246/api/PacientiModels";  // Assuming this is the correct URL for the patients endpoint

const headers = {
  Authorization: `Bearer ${localStorage.getItem("token")}`,
};

const ReviewService = {
  getAll: async () => {
    return await axios.get(API_URL, { headers });
  },

  getById: async (id_R) => {
    return await axios.get(`${API_URL}/${id_R}`, { headers });
  },

  create: async (data) => {
    return await axios.post(API_URL, data, { headers });
  },

  update: async (id_R, data) => {
    return await axios.put(`${API_URL}/${id_R}`, data, { headers });
  },

  delete: async (id_R) => {
    return await axios.delete(`${API_URL}/${id_R}`, { headers });
  },

  search: async ({ search = '', rating = '', page = 1, pageSize = 10 } = {}) => {
    const authHeaders = { Authorization: `Bearer ${localStorage.getItem('token')}` };
    return await axios.get(`${API_URL}/search`, {
      params: { search: search || undefined, rating: rating || undefined, page, pageSize },
      headers: authHeaders,
    });
  },

  // New method to get patients
  getPatients: async () => {
    try {
      const response = await axios.get(PATIENTS_API_URL, { headers });
      return response.data;  // Assuming the backend returns a list of patients
    } catch (error) {
      console.error("Error fetching patients:", error);
      throw error;
    }
  },
};

export default ReviewService;
