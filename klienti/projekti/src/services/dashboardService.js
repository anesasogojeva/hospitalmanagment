import axios from 'axios';

const API_URL = 'https://localhost:7246/api/PacientiModels/patient';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Fetch reservations for the patient (paginated - upcoming first)
export const fetchReservations = async (page = 1, pageSize = 10) => {
  try {
    const response = await axios.get(`${API_URL}/reservations`, {
      params: { page, pageSize },
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response ? error.response.data : error.message);
  }
};
export const fetchEmergency = async (page = 1, pageSize = 10) => {
  try {
    const response = await axios.get(`${API_URL}/emergency`, {
      params: { page, pageSize },
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response ? error.response.data : error.message);
  }
};


// Fetch medical records for the patient (paginated)
export const fetchRecords = async (page = 1, pageSize = 10) => {
  try {
    const response = await axios.get(`${API_URL}/records`, {
      params: { page, pageSize },
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response ? error.response.data : error.message);
  }
};

// Fetch doctor list
export const fetchDoctors = async () => {
  try {
    const response = await axios.get('https://localhost:7246/api/DoktoriModels', {
      headers: getAuthHeaders(),
    });
    return response.data.reduce((acc, doctor) => {
      acc[doctor.id] = doctor.emri;
      return acc;
    }, {});
  } catch (error) {
    throw new Error(error.response ? error.response.data : error.message);
  }
};

// Fetch full doctor profiles (name, specialization, photo) for the appointment doctor picker
export const fetchDoctorProfiles = async () => {
  try {
    const response = await axios.get('https://localhost:7246/api/DoktoriModels', {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response ? error.response.data : error.message);
  }
};

// Fetch available/booked time slots for a doctor on a given date
export const fetchDoctorAvailability = async (doctorId, date) => {
  try {
    const response = await axios.get(`${API_URL}/reservations/availability`, {
      params: { doctorId, date },
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.response?.data || error.message;
    throw new Error(message);
  }
};

// Create a reservation
export const createReservation = async (reservationData) => {
  try {
    await axios.post(
      `${API_URL}/reservations`,
      {
        reservationDate: reservationData.reservationDate,
        reservationTime: reservationData.reservationTime,
        Doctor: reservationData.doctorId,
      },
      { headers: getAuthHeaders() }
    );
  } catch (error) {
    const message = error.response?.data?.message || error.response?.data || error.message;
    throw new Error(message);
  }
};

export const createEmergency = async (emergencyData) => {
  try {
    await axios.post(
      `${API_URL}/emergency`,
      {
        subject: emergencyData.subject,
        pershkrimi: emergencyData.description,
        numriKontaktit: emergencyData.contactNumber,
        patient: emergencyData.patientId,
        Doctor: emergencyData.doctorId,
      },
      { headers: getAuthHeaders() }
    );
  } catch (error) {
    throw new Error(error.response ? error.response.data : error.message);
  }
};
// Submit a review for a doctor
// Fetch reviews for the patient


// Create a review
export const createReview = async (reviewData) => {
  try {
    await axios.post('https://localhost:7246/api/PacientiModels/patient/reviews', reviewData, {
      headers: getAuthHeaders(),
    });
  } catch (error) {
    throw new Error(error.response ? error.response.data : error.message);
  }
};
