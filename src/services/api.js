import axios from 'axios';

// ✅ Safe base URL (works in both local + production)
const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const API = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ✅ Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('lostlink_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Handle 401 globally
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('lostlink_token');
      localStorage.removeItem('lostlink_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ================= AUTH =================
export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');

// ================= ITEMS =================
export const createItem = (data) => API.post('/items', data);
export const getItems = (params) => API.get('/items', { params });
export const getItem = (id) => API.get(`/items/${id}`);
export const updateItemStatus = (id, status) =>
  API.patch(`/items/${id}/status`, { status });
export const deleteItem = (id) => API.delete(`/items/${id}`);

// ================= QR =================
export const getItemByQR = (qrCodeId) =>
  API.get(`/qr/${qrCodeId}`);

// ================= MESSAGES =================
export const sendMessage = (data) => API.post('/messages', data);
export const getMessages = (itemId) =>
  API.get(`/messages/${itemId}`);
export const replyMessage = (data) =>
  API.post('/messages/reply', data);

// ================= NOTIFICATIONS =================
export const getNotifications = () => API.get('/notifications');
export const markAllRead = () =>
  API.patch('/notifications/read-all');
export const markRead = (id) =>
  API.patch(`/notifications/${id}/read`);

// ================= ADMIN =================
export const adminGetUsers = () => API.get('/admin/users');
export const adminGetItems = () => API.get('/admin/items');
export const adminGetReports = () => API.get('/admin/reports');
export const adminDeleteUser = (id) =>
  API.delete(`/admin/users/${id}`);

export default API;