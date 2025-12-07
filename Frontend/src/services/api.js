import axios from 'axios';

const API_URL = 'https://file-share-backend1.onrender.com/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  getUsers: () => api.get('/auth/users')
};

// File APIs
export const fileAPI = {
  upload: (formData) => {
    return api.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getMyFiles: () => api.get('/files/my-files'),
  getSharedFiles: () => api.get('/files/shared'),
  download: (fileId) => {
    return api.get(`/files/download/${fileId}`, {
      responseType: 'blob'
    });
  },
  delete: (fileId) => api.delete(`/files/${fileId}`)
};

// Share APIs
export const shareAPI = {
  shareWithUsers: (data) => api.post('/shares/user', data),
  generateLink: (data) => api.post('/shares/link', data),
  getFileShares: (fileId) => api.get(`/shares/file/${fileId}`),
  deleteShare: (shareId) => api.delete(`/shares/${shareId}`),

  viewSharedFile: (linkId) => api.get(`/shares/view/${linkId}`),
  downloadSharedFile: (linkId) => {
    return api.get(`/shares/download/${linkId}`, {
      responseType: 'blob'
    });
  }
};

export default api;
