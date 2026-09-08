import axios from "axios";
import { toast } from "react-toastify";

const BASE_URL = "https://localhost:7246/api/Contact";
const token = localStorage.getItem("token");

const headers = {
  Authorization: `Bearer ${token}`,
};

// Fetch all contacts
export const getContacts = async () => {
  try {
    const response = await axios.get(BASE_URL, { headers });
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching data:",
      error.response ? error.response.data : error.message
    );
    toast.error("Error fetching data");
    throw error;
  }
};

// Add a new contact
export const addContact = async (contact) => {
  try {
    await axios.post(BASE_URL, contact, { headers });
    toast.success("Contact added successfully!");
  } catch (error) {
    console.error(
      "Error adding contact:",
      error.response ? error.response.data : error.message
    );
    toast.error("Error adding contact");
    throw error;
  }
};

// Search contacts (server-side search + pagination)
export const searchContacts = async ({ search = '', page = 1, pageSize = 10 } = {}) => {
  try {
    const authToken = localStorage.getItem('token');
    const response = await axios.get(`${BASE_URL}/search`, {
      params: { search: search || undefined, page, pageSize },
      headers: { Authorization: `Bearer ${authToken}` },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error searching contacts:",
      error.response ? error.response.data : error.message
    );
    toast.error("Error fetching data");
    throw error;
  }
};

// Delete a contact
export const deleteContact = async (id) => {
  try {
    await axios.delete(`${BASE_URL}/${id}`, { headers });
    toast.success("Contact deleted successfully!");
  } catch (error) {
    console.error(
      "Error deleting contact:",
      error.response ? error.response.data : error.message
    );
    toast.error("Error deleting contact");
    throw error;
  }
};
