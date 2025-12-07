import axios from "axios";


// ⬇️ Automatically switch between local & deployed
const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://file-share-backend1.onrender.com/api";  // your Render backend


// Axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" }
});

// Token middleware
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// AUTH API
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  getMe: () => api.get("/auth/me"),
  getUsers: () => api.get("/auth/users")
};

// FILE API
export const fileAPI = {
  upload: (formData) =>
    api.post("/files/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    }),

  getMyFiles: () => api.get("/files/my-files"),
  getSharedFiles: () => api.get("/files/shared"),

  // ⬇️ No more blob — backend returns Cloudinary URL
  download: (fileId) => api.get(`/files/download/${fileId}`),

  delete: (fileId) => api.delete(`/files/${fileId}`)
};

// SHARE API
export const shareAPI = {
  shareWithUsers: (data) => api.post("/shares/user", data),
  generateLink: (data) => api.post("/shares/link", data),
  getFileShares: (fileId) => api.get(`/shares/file/${fileId}`),
  deleteShare: (shareId) => api.delete(`/shares/${shareId}`),

  viewSharedFile: (linkId) => api.get(`/shares/view/${linkId}`),

  downloadSharedFile: (linkId) =>
    api.get(`/shares/download/${linkId}`)
};

export default api;
