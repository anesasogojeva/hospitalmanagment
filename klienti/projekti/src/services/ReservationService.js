import axios from 'axios';

const baseURL = 'https://localhost:7246/api/Reservation';
const token = localStorage.getItem('token');
const authHeaders = {
  headers: {
    Authorization: `Bearer ${token}`
  }
};

const ReservationService = {
  getReservations: () => axios.get(baseURL, authHeaders),

  getReservationById: (id) => axios.get(`${baseURL}/${id}`, authHeaders),

  addReservation: (data) => axios.post(baseURL, data, authHeaders),

  updateReservation: (id, data) => axios.put(`${baseURL}/${id}`, data, authHeaders),

  updateReservationStatus: (id, status) => axios.patch(`${baseURL}/${id}/status`, { status }, authHeaders),

  deleteReservation: (id) => axios.delete(`${baseURL}/${id}`, authHeaders),

  searchReservations: ({ search = '', doctorId = '', dateFrom = '', dateTo = '', page = 1, pageSize = 10 } = {}) => {
    const authToken = localStorage.getItem('token');
    return axios.get(`${baseURL}/search`, {
      params: {
        search: search || undefined,
        doctorId: doctorId || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        page,
        pageSize,
      },
      headers: { Authorization: `Bearer ${authToken}` },
    });
  },
};

export default ReservationService;
