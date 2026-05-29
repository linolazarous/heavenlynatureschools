import { apiFetch } from '../utils/api';

// Create an axios-like interface using your apiFetch
const axios = {
  get: (url, config) => apiFetch(url, { method: 'GET', ...config }),
  post: (url, data, config) => apiFetch(url, { method: 'POST', body: JSON.stringify(data), ...config }),
  put: (url, data, config) => apiFetch(url, { method: 'PUT', body: JSON.stringify(data), ...config }),
  delete: (url, config) => apiFetch(url, { method: 'DELETE', ...config }),
};

export default axios;
