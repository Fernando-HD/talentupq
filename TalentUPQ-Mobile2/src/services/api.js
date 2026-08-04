import { create } from 'axios';
import * as SecureStore from 'expo-secure-store';

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL || 'https://talentupq-api.onrender.com/api/v1';

const api = create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshPromise = null;
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const jwtMessage = error.response?.data?.msg;
    if (error.response?.status === 401 && jwtMessage === 'Token has expired' && original && !original._retried) {
      original._retried = true;
      if (!refreshPromise) {
        refreshPromise = (async () => {
          const refreshToken = await SecureStore.getItemAsync('refresh_token');
          if (!refreshToken) throw error;
          const client = create({ baseURL: API_URL, timeout: 15000 });
          const { data } = await client.post('/auth/refresh', {}, {
            headers: { Authorization: `Bearer ${refreshToken}` },
          });
          await SecureStore.setItemAsync('access_token', data.access_token);
          return data.access_token;
        })().finally(() => { refreshPromise = null; });
      }
      const newToken = await refreshPromise;
      original.headers.Authorization = `Bearer ${newToken}`;
      return api(original);
    }
    throw error;
  }
);

export function apiMessage(error) {
  if (error.response?.data?.error) return error.response.data.error;
  if (error.response?.data?.msg) {
    const jwtMessages = {
      'Missing Authorization Header': 'Tu sesión no está disponible. Inicia sesión nuevamente.',
      'Token has expired': 'Tu sesión expiró. Inicia sesión nuevamente.',
      'Signature verification failed': 'La sesión ya no es válida. Inicia sesión nuevamente.',
    };
    return jwtMessages[error.response.data.msg] || error.response.data.msg;
  }
  if (error.code === 'ECONNABORTED') return 'La API tardó demasiado en responder.';
  if (!error.response) return `No fue posible conectar con la API (${API_URL}).`;
  if (error.response.status === 404) {
    return 'La función no existe en la API activa. Reinicia el servidor Flask.';
  }
  if (error.response.status === 429) {
    return 'Se hicieron demasiadas solicitudes. Espera un minuto e inténtalo nuevamente.';
  }
  if (error.response.status === 413) {
    return 'El archivo o la información enviada excede el tamaño permitido.';
  }
  if (error.response.status >= 500) {
    return `El servidor tuvo un error (${error.response.status}). Revisa la terminal de Flask.`;
  }
  return `La API rechazó la solicitud (${error.response.status}).`;
}

export default api;
