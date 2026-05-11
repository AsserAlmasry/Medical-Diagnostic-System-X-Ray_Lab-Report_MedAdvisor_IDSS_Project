import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const analyzeLabReport = async (text, isDoctor) => {
  const response = await axios.post(`${API_BASE_URL}/analyze-lab`, { text, isDoctor });
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
