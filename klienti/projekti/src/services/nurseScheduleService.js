import axios from 'axios';

const API_URL = 'https://localhost:7246/api/NurseSchedule';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

// Full weekly schedule as a flat list (both the Admin management page and the doctor
// dashboard's read-only view build their own grouping from this).
export const fetchSchedule = async () => {
  const response = await axios.get(API_URL, { headers: getAuthHeader() });
  return response.data;
};

export const createScheduleEntry = async (entry) => {
  const response = await axios.post(API_URL, entry, { headers: getAuthHeader() });
  return response.data;
};

export const updateScheduleEntry = async (id, entry) => {
  const response = await axios.put(`${API_URL}/${id}`, entry, { headers: getAuthHeader() });
  return response.data;
};

export const deleteScheduleEntry = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`, { headers: getAuthHeader() });
  return response.data;
};
