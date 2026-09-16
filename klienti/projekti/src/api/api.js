import axios from 'axios';
import { API_BASE_URL as BASE_URL } from '../config';

const API_BASE_URL = `${BASE_URL}/authentication`;

// Handle HTTP request for login
export const apiLogin = async (username, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/login`, { username, password });
    return response;
  } catch (error) {
    console.error('Error during login:', error);
    throw error;
  }
};

// Handle HTTP request for registration
export const apiRegister = async (username, email, password, role = "patient") => {
  try {
    const response = await axios.post(`${API_BASE_URL}/register`, { username, email, password, role });
    return response;
  } catch (error) {
    console.error('Error during registration:', error);
    throw error;
  }
};
