import axios from 'axios';

// Base URL for the API
const API_URL = 'https://localhost:7246/api/DoktoriModels/doctor';

// Function to create headers with the Authorization token
const getHeaders = (token) => {
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  };
};

// Reusable function to handle GET requests with authorization
const fetchData = async (url, token, params) => {
  try {
    const response = await axios.get(url, { ...getHeaders(token), params });
    return response.data;
  } catch (error) {
    // Handle error: check for specific status codes
    if (error.response) {
      if (error.response.status === 401) {
        // Unauthorized error (token might be expired)
        throw new Error('Unauthorized: Please log in again.');
      }
      if (error.response.status === 403) {
        // Forbidden error (permissions issue)
        throw new Error('Forbidden: You do not have permission to access this resource.');
      }
      console.error('API Error:', error.response);
      throw new Error('An error occurred while fetching data.');
    }
    console.error('Network Error:', error);
    throw new Error('Network error: Unable to reach the server.');
  }
};

// API calls

// Paginated/searchable/filterable "My Appointments" - scoped server-side to the
// authenticated doctor, same {items, page, pageSize, totalCount, totalPages} shape the
// admin dashboard's search endpoints already use.
export const searchDoctorReservations = async (token, { search = '', status = '', date = '', page = 1, pageSize = 10 } = {}) => {
  return await fetchData(`${API_URL}/reservations`, token, {
    search: search || undefined,
    status: status || undefined,
    date: date || undefined,
    page,
    pageSize,
  });
};

// Paginated/searchable "My Patients" - only patients who have an appointment with the
// authenticated doctor (derived from the existing ReservationModel relationship).
export const searchDoctorPatients = async (token, { search = '', page = 1, pageSize = 10 } = {}) => {
  return await fetchData(`${API_URL}/patients`, token, {
    search: search || undefined,
    page,
    pageSize,
  });
};

export const fetchEmergency = async (token) => {
  return await fetchData(`${API_URL}/emergency`, token);
};

export const fetchRecords = async (token) => {
  return await fetchData(`${API_URL}/records`, token);
};

export const fetchNurses = async (token) => {
  return await fetchData(`${API_URL}/nurses`, token);
};

// The authenticated doctor's own profile (name, email, specialization, phone, experience).
export const fetchDoctorProfile = async (token) => {
  return await fetchData(`${API_URL}/profile`, token);
};

// Update the status of one of the doctor's own appointments. Reuses the same
// PATCH /api/Reservation/{id}/status endpoint the admin dashboard uses - the backend now
// also accepts the "doktor" role there and verifies server-side that the appointment
// actually belongs to the authenticated doctor before allowing the change.
export const updateAppointmentStatus = async (token, reservationId, status) => {
  try {
    await axios.patch(`https://localhost:7246/api/Reservation/${reservationId}/status`, { status }, getHeaders(token));
  } catch (error) {
    if (error.response) {
      if (error.response.status === 401) {
        throw new Error('Unauthorized: Please log in again.');
      }
      if (error.response.status === 403) {
        throw new Error("You can only change the status of your own patients' appointments.");
      }
      if (error.response.status === 404) {
        throw new Error('Appointment not found.');
      }
      throw new Error(error.response.data?.message || 'Error updating appointment status.');
    }
    throw new Error('Network error: Unable to reach the server.');
  }
};

// Function to add a new record
export const addRecord = async (newRecord, token) => {
  try {
    const response = await axios.post(`https://localhost:7246/api/Dashboard/doctor/records`, newRecord, getHeaders(token));
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('API Error:', error.response);
      throw new Error('Error adding record.');
    }
    console.error('Network Error:', error);
    throw new Error('Network error: Unable to reach the server.');
  }
};
