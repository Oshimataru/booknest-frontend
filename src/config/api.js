const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8082';

export const API_BASE_URL = rawApiUrl.replace(/\/+$/, '');
export const API_ROOT = `${API_BASE_URL}/api`;
export const HOME_API_ROOT = `${API_ROOT}/home`;
