import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',  // ← certifica que está exatamente assim
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('[API Error]', error?.config?.url, error?.message);
    return Promise.reject(error);
  }
);

export default api;