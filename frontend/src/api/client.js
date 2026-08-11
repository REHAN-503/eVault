import axios from 'axios';

// ---------------------------------------------------------------------------
// Single point of contact with the Backend API Gateway (Node.js/Express) from
// section 2 of the architecture doc. Every request goes through here so that
// auth headers, base URL, and error handling live in exactly one place.
//
// HOW TO CONNECT THE REAL BACKEND
// 1. Set VITE_API_BASE_URL in .env to the deployed API Gateway URL.
// 2. Set VITE_USE_MOCK=false in .env.
// 3. Nothing else changes — every function in src/api/*.js already calls the
//    REST paths the gateway is expected to expose (see comments in each file).
// ---------------------------------------------------------------------------

export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
  timeout: 15000,
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('evault_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Avoid infinite refresh loops
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

client.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    if (err.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = 'Bearer ' + token;
            return client(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('evault_refresh_token');
      if (!refreshToken) {
        processQueue(err, null);
        isRefreshing = false;
        // Optionally redirect to login or dispatch an event
        return Promise.reject(new Error('Session expired'));
      }

      try {
        const { data } = await axios.post(`${client.defaults.baseURL}/auth/refresh`, {
          refreshToken,
        });

        const newToken = data.token; // Access token
        const newRefreshToken = data.refreshToken; // New refresh token
        
        localStorage.setItem('evault_token', newToken);
        if (newRefreshToken) localStorage.setItem('evault_refresh_token', newRefreshToken);

        client.defaults.headers.common['Authorization'] = 'Bearer ' + newToken;
        originalRequest.headers.Authorization = 'Bearer ' + newToken;

        processQueue(null, newToken);
        return client(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('evault_token');
        localStorage.removeItem('evault_refresh_token');
        localStorage.removeItem('evault_user');
        window.dispatchEvent(new Event('auth:unauthorized'));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    const message =
      err?.response?.data?.message || err?.message || 'Request failed';
    return Promise.reject(new Error(message));
  }
);

// Small helper so mocked functions "feel" like network calls (latency) and so
// swapping USE_MOCK doesn't change how calling code reads.
export const mockDelay = (ms = 450) => new Promise((r) => setTimeout(r, ms));

export default client;
