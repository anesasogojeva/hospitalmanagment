import { apiLogin, apiRegister } from '../api/api'; // Import API layer functions

// Decode JWT token and verify its expiration
export const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    const decoded = JSON.parse(jsonPayload);
    const currentTime = Date.now() / 1000;

    if (decoded.exp < currentTime) {
      // Token has expired
      return null;
    }

    return decoded;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

// Login service function
export const login = async (username, password) => {
  try {
    const response = await apiLogin(username, password);

    if (response.status === 200) {
      const { token, role } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      return { success: true, role };
    }
    return { success: false };
  } catch (error) {
    console.error('Error during login:', error);
    return { success: false };
  }
};

// Pulls a user-friendly list of messages out of an API error response, since the
// backend may return { errors: [...] }, { message: '...' }, or a plain string.
const extractErrors = (data) => {
  if (!data) return null;
  if (Array.isArray(data.errors) && data.errors.length > 0) return data.errors;
  if (typeof data === 'string' && data.trim().length > 0) return [data];
  if (typeof data.message === 'string' && data.message.trim().length > 0) return [data.message];
  return null;
};

// Register service function
export const register = async (username, email, password) => {
  try {
    const role = 'patient'; // Automatically set the role to "Patient"
    const response = await apiRegister(username, email, password, role);

    if (response.status === 200) {
      return { success: true };
    }

    return {
      success: false,
      errors: extractErrors(response.data) || ['Registration failed. Please check the details and try again.'],
    };
  } catch (error) {
    if (error.response) {
      console.error('Error during registration:', error.response.data);
      return {
        success: false,
        errors: extractErrors(error.response.data) || ['Registration failed. Please check the details and try again.'],
      };
    }

    console.error('Error during registration:', error.message);
    return { success: false, errors: ['Something went wrong. Please try again.'] };
  }
};

