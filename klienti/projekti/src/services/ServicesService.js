import axios from 'axios';

const baseURL = 'https://localhost:7246/api/Sherbimi';
const token = localStorage.getItem('token');
const authHeaders = {
  headers: {
    Authorization: `Bearer ${token}`,
  },
};

const ServicesService = {
  getServices: () => axios.get(baseURL, authHeaders),
};

export default ServicesService;
