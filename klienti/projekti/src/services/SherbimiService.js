import axios from 'axios';

const BASE_URL = 'https://localhost:7246/api/Sherbimi';

const SherbimiService = {
  getAll: () => {
    return axios.get(BASE_URL, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
  },

  getById: (id) => {
    return axios.get(`${BASE_URL}/${id}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
  },

  create: (data) => {
    return axios.post(BASE_URL, data, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
  },

  update: (id, data) => {
    return axios.put(`${BASE_URL}/${id}`, data, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
  },

  delete: (id) => {
    return axios.delete(`${BASE_URL}/${id}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
  },

  search: ({ search = '', page = 1, pageSize = 10 } = {}) => {
    return axios.get(`${BASE_URL}/search`, {
      params: { search: search || undefined, page, pageSize },
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
  }
};

export default SherbimiService;
