import axios from 'axios';
import authService from './authService';

const API_BASE = process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}` : '';
const API_URL = `${API_BASE}/api/receipts`;

// Configure axios with auth token
const configureRequest = () => {
  authService.configureAxiosHeader();
};

// Upload receipt image for OCR processing
const uploadReceipt = async (file) => {
  try {
    configureRequest();
    
    // Create form data
    const formData = new FormData();
    formData.append('receipt', file);
    
    // Set headers for multipart/form-data
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
    
    const response = await axios.post(`${API_URL}/upload`, formData, config);
    return response.data;
  } catch (error) {
    console.error('Receipt upload error:', error);
    throw error.response?.data || { message: 'Failed to upload receipt' };
  }
};

export default {
  uploadReceipt
};