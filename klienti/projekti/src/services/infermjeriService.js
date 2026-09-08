import axios from "axios";
import { decodeToken } from "./authService";

const API_URL = "https://localhost:7246/api/Infermjeri";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
};

// Validators inside the service
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPervoja = (vitetPune) => {
  if (vitetPune === null) return true;
  const pervojaRegex = /^[0-9]\d*$/;
  return pervojaRegex.test(vitetPune.toString());
};

export const fetchInfermjeriData = async () => {
  const token = localStorage.getItem("token");
  const decoded = decodeToken(token);
  if (!decoded) {
    throw new Error("Token has expired or is invalid");
  }
  const response = await axios.get(API_URL, { headers: getAuthHeader() });
  return response.data;
};

export const fetchSingleInfermjeri = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const createInfermjeri = async (data) => {
  if (!isValidEmail(data.email)) {
    throw new Error("Invalid email format.");
  }
  if (!isValidPervoja(data.vitetPune)) {
    throw new Error("Invalid value for Vitet Pune.");
  }

  const response = await axios.post(API_URL, data, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const updateInfermjeri = async (id, data) => {
  if (!isValidEmail(data.email)) {
    throw new Error("Invalid email format.");
  }
  if (!isValidPervoja(data.vitetPune)) {
    throw new Error("Invalid value for Vitet Pune.");
  }

  const response = await axios.put(`${API_URL}/${id}`, data, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const deleteInfermjeri = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const searchInfermjeri = async ({ search = '', department = '', page = 1, pageSize = 10 } = {}) => {
  const response = await axios.get(`${API_URL}/search`, {
    params: { search: search || undefined, department: department || undefined, page, pageSize },
    headers: getAuthHeader(),
  });
  return response.data;
};

export const fetchDepartments = async () => {
  const response = await axios.get(`${API_URL}/departments`, {
    headers: getAuthHeader(),
  });
  return response.data;
};
