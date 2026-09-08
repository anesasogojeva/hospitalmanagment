import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://localhost:7246/api';
const token = localStorage.getItem('token');

const getDoctors = () => {
  return axios.get(`${API_BASE_URL}/DoktoriModels`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
};

const getDoctorById = (id) => {
  return axios.get(`${API_BASE_URL}/DoktoriModels/${id}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
};

const addDoctor = (doctorData) => {
  return axios.post(`${API_BASE_URL}/DoktoriModels`, doctorData, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
};

const updateDoctor = (id, doctorData) => {
  return axios.put(`${API_BASE_URL}/DoktoriModels/${id}`, doctorData, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
};

const deleteDoctor = (id) => {
  return axios.delete(`${API_BASE_URL}/DoktoriModels/${id}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
};

const searchDoctors = ({ search = '', specialization = '', page = 1, pageSize = 10 } = {}) => {
  const authToken = localStorage.getItem('token');
  return axios.get(`${API_BASE_URL}/DoktoriModels/search`, {
    params: { search: search || undefined, specialization: specialization || undefined, page, pageSize },
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
};

const getSpecializations = () => {
  const authToken = localStorage.getItem('token');
  return axios.get(`${API_BASE_URL}/DoktoriModels/specializations`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
};

export default {
  getDoctors,
  getDoctorById,
  addDoctor,
  updateDoctor,
  deleteDoctor,
  searchDoctors,
  getSpecializations
};
