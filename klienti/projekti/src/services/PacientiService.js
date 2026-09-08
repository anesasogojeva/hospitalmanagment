import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://localhost:7246/api';
const token = localStorage.getItem('token');

const getPatients = () => {
  return axios.get(`${API_BASE_URL}/PacientiModels`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
};

const getPatientById = (id_P) => {
  return axios.get(`${API_BASE_URL}/PacientiModels/${id_P}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
};

const addPatient = (patientData) => {
  return axios.post(`${API_BASE_URL}/PacientiModels`, patientData, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
};

const updatePatient = (id_P, patientData) => {
  return axios.put(`${API_BASE_URL}/PacientiModels/${id_P}`, patientData, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
};

const deletePatient = (id_P) => {
  return axios.delete(`${API_BASE_URL}/PacientiModels/${id_P}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
};

const searchPatients = ({ search = '', gender = '', page = 1, pageSize = 10 } = {}) => {
  const authToken = localStorage.getItem('token');
  return axios.get(`${API_BASE_URL}/PacientiModels/search`, {
    params: { search: search || undefined, gender: gender || undefined, page, pageSize },
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
};

export default {
  getPatients,
  getPatientById,
  addPatient,
  updatePatient,
  deletePatient,
  searchPatients
};
