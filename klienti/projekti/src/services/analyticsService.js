import axios from 'axios';

const API_URL = 'https://localhost:7246/api/Dashboard';

const authHeaders = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const fetchSummary = async () => {
  const response = await axios.get(`${API_URL}/summary`, { headers: authHeaders() });
  return response.data;
};

export const fetchUpcomingAppointments = async (limit = 8) => {
  const response = await axios.get(`${API_URL}/upcoming-appointments`, {
    params: { limit },
    headers: authHeaders(),
  });
  return response.data;
};

export const fetchAppointmentsByDoctor = async () => {
  const response = await axios.get(`${API_URL}/appointments-by-doctor`, { headers: authHeaders() });
  return response.data;
};

export const fetchAppointmentsBySpecialty = async () => {
  const response = await axios.get(`${API_URL}/appointments-by-specialty`, { headers: authHeaders() });
  return response.data;
};

export const fetchAppointmentTrends = async (days = 30) => {
  const response = await axios.get(`${API_URL}/appointment-trends`, {
    params: { days },
    headers: authHeaders(),
  });
  return response.data;
};

export const fetchPatientDemographics = async () => {
  const response = await axios.get(`${API_URL}/patient-demographics`, { headers: authHeaders() });
  return response.data;
};
