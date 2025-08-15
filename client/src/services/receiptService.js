import authService from './authService';
import api from './api';

const BASE = '/receipts';

// Configure axios with auth token
const configureRequest = () => {
  authService.configureAxiosHeader();
};

// Upload receipt (image or PDF). Server will OCR images and extract text from PDFs instantly.
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
    
  const response = await api.post(`${BASE}/upload`, formData, config);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to upload receipt' };
  }
};

const receiptService = { uploadReceipt };

export default receiptService;