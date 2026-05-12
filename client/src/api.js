import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const analyzeLabReport = async (imageFile, isDoctor) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('isDoctor', isDoctor);
  const response = await axios.post(`${API_BASE_URL}/analyze-lab-image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const getMedAdvisorAdvice = async (query, conditions, isPharmacist) => {
  const response = await axios.post(`${API_BASE_URL}/medadvisor`, { query, conditions, isPharmacist });
  return response.data;
};

export const analyzeXRay = async (imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  const response = await axios.post(`${API_BASE_URL}/analyze-xray`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};
