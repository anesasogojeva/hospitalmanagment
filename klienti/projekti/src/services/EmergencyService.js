import axios from 'axios';

const baseURL = 'https://localhost:7246/api/Emergency';
const token = localStorage.getItem('token');
const authHeaders = {
  headers: {
    Authorization: `Bearer ${token}`
  }
};

const EmergencyService = {
  getEmergencies: () => axios.get(baseURL, authHeaders),
  getEmergencyById: (id_E) => axios.get(`${baseURL}/${id_E}`, authHeaders),
  addEmergency: (data) => axios.post(baseURL, data, authHeaders),
  deleteEmergency: (id_E) => axios.delete(`${baseURL}/${id_E}`, authHeaders),

  searchEmergencies: ({ search = '', doctorId = '', page = 1, pageSize = 10 } = {}) => {
    const authToken = localStorage.getItem('token');
    return axios.get(`${baseURL}/search`, {
      params: { search: search || undefined, doctorId: doctorId || undefined, page, pageSize },
      headers: { Authorization: `Bearer ${authToken}` },
    });
  },
};

export default EmergencyService;
