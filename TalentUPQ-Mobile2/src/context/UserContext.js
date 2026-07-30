import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useState } from 'react';

import api from '../services/api';

const UserContext = createContext();

const emptyUser = {
  usuarioID: null,
  email: '',
  tipo: '',
  isLoggedIn: false,
  candidato: {},
  habilidades: [],
  experiencias: [],
  preparaciones: [],
  referencias: [],
  postulaciones: [],
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser debe usarse dentro de UserProvider');
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(emptyUser);
  const [favoritos, setFavoritos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    restoreSession();
    AsyncStorage.getItem('vacantesFavoritas')
      .then((value) => setFavoritos(value ? JSON.parse(value) : []))
      .catch(() => setFavoritos([]));
  }, []);

  const toggleFavorito = async (vacante) => {
    const exists = favoritos.some((item) => item.id === vacante.id);
    const next = exists
      ? favoritos.filter((item) => item.id !== vacante.id)
      : [...favoritos, { ...vacante, guardadaEn: new Date().toISOString() }];
    setFavoritos(next);
    await AsyncStorage.setItem('vacantesFavoritas', JSON.stringify(next));
    return !exists;
  };

  const persistUser = async (nextUser) => {
    setUser(nextUser);
    await AsyncStorage.setItem('userData', JSON.stringify(nextUser));
    return nextUser;
  };

  const toUser = (account, profile = {}, extra = {}) => ({
    ...emptyUser,
    ...extra,
    usuarioID: account.UsuarioID,
    email: account.Email,
    tipo: account.TipoUsuario,
    isLoggedIn: true,
    candidato: profile,
  });

  const restoreSession = async () => {
    try {
      const token = await SecureStore.getItemAsync('access_token');
      if (!token) return;
      const [{ data: account }, { data: profile }, { data: postulaciones }] = await Promise.all([
        api.get('/auth/me'),
        api.get('/perfil'),
        api.get('/postulaciones'),
      ]);
      await persistUser(toUser(account, profile, { postulaciones }));
    } catch {
      await clearSession();
    } finally {
      setLoading(false);
    }
  };

  const saveTokens = async (payload) => {
    await Promise.all([
      SecureStore.setItemAsync('access_token', payload.access_token),
      SecureStore.setItemAsync('refresh_token', payload.refresh_token),
    ]);
  };

  const loadAuthenticatedUser = async (account) => {
    const [{ data: profile }, { data: postulaciones }] = await Promise.all([
      api.get('/perfil'),
      api.get('/postulaciones'),
    ]);
    return persistUser(toUser(account, profile, { postulaciones }));
  };

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    await saveTokens(data);
    return loadAuthenticatedUser(data.usuario);
  };

  const register = async (form) => {
    const { data } = await api.post('/auth/register', form);
    await saveTokens(data);
    let { data: profile } = await api.get('/perfil');
    if (form.apellidoMaterno || form.telefono || form.direccion) {
      const response = await api.put('/perfil', {
        Nombre: form.nombre,
        ApellidoPaterno: form.apellido,
        ApellidoMaterno: form.apellidoMaterno || '',
        Telefono: form.telefono || '',
        Direccion: form.direccion || '',
        Email: form.email,
      });
      profile = response.data;
    }
    const nextUser = await persistUser(toUser(data.usuario, profile));
    return {
      user: nextUser,
      welcomeEmailSent: data.welcome_email_sent,
      welcomeEmail: data.welcome_email || form.email,
    };
  };

  const actualizarCandidato = async (values) => {
    const { data } = await api.put('/perfil', {
      ...values,
      email: values.Email || user.email,
    });
    return persistUser({ ...user, email: data.Email, candidato: data });
  };

  const refreshPostulaciones = async () => {
    const { data } = await api.get('/postulaciones');
    await persistUser({ ...user, postulaciones: data });
    return data;
  };

  const updateList = (key) => async (values) => {
    const next = { ...user, [key]: values };
    await persistUser(next);
    return next;
  };

  const clearSession = async () => {
    await Promise.all([
      SecureStore.deleteItemAsync('access_token'),
      SecureStore.deleteItemAsync('refresh_token'),
      AsyncStorage.removeItem('userData'),
    ]);
    setUser(emptyUser);
  };

  return (
    <UserContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout: clearSession,
      actualizarCandidato,
      actualizarHabilidades: updateList('habilidades'),
      actualizarExperiencias: updateList('experiencias'),
      actualizarPreparaciones: updateList('preparaciones'),
      actualizarReferencias: updateList('referencias'),
      actualizarPostulaciones: updateList('postulaciones'),
      refreshPostulaciones,
      favoritos,
      toggleFavorito,
      guardarDatos: persistUser,
      setUser,
    }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
