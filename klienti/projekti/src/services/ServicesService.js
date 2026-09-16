import axios from 'axios';
import { API_BASE_URL } from '../config';

const baseURL = `${API_BASE_URL}/Sherbimi`;
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
