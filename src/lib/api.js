import axios from 'axios';

// Backend URL comes from VITE_API_BASE_URL (or VITE_API_URL); local fallback for development.
export const API_BASE_URL = String(import.meta.env?.VITE_API_BASE_URL || import.meta.env?.VITE_API_URL || 'http://localhost:8081').replace(/\/$/, '');

const TOKEN_KEY = 'assetflow_token';

export const tokenStore = {
  get: () => (typeof window === 'undefined' ? null : window.localStorage.getItem(TOKEN_KEY)),
  set: (t) => window.localStorage.setItem(TOKEN_KEY, t),
  clear: () => window.localStorage.removeItem(TOKEN_KEY),
};

export class ApiError extends Error {
  constructor(message, status, fieldErrors) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export const SESSION_EXPIRED_EVENT = 'assetflow:session-expired';

export const api = axios.create({ baseURL: `${API_BASE_URL}/api`, timeout: 15000 });

api.interceptors.request.use(cfg => {
  const t = tokenStore.get();
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

api.interceptors.response.use(
  r => r,
  (err) => {
    if (!err.response) {
      return Promise.reject(new ApiError(`Can't reach the AssetFlow server (${API_BASE_URL}). Make sure it is running.`, 0));
    }
    const { status, data } = err.response;
    const hadToken = !!err.config?.headers?.Authorization;
    if (status === 401 && hadToken) {
      tokenStore.clear();
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
    }
    let message = data?.message || `Request failed (${status})`;
    if (status === 403) message = data?.message || "You don't have permission to do that.";
    if (data?.fieldErrors) {
      message = `${message}: ${Object.entries(data.fieldErrors).map(([k, v]) => `${k} ${v}`).join(', ')}`;
    }
    return Promise.reject(new ApiError(message, status, data?.fieldErrors));
  },
);

export const errorMessage = (e) => (e instanceof Error ? e.message : 'Something went wrong');
