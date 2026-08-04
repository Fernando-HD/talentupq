import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '../context/UserContext';
import api from '../services/api';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#2563eb',
  primaryDark: '#1d4ed8',
  secondary: '#10b981',
  white: '#ffffff',
  dark: '#1e293b',
  gray: '#64748b',
  grayLight: '#e2e8f0',
  grayBg: '#f1f5f9',
  error: '#ef4444',
  success: '#10b981',
  text: '#1e293b',
  textLight: '#64748b',
};

const CandidatoDashboardScreen = ({ navigation, route }) => {
  const { user, logout, refreshUser } = useUser();
  
  // Estado local que se sincroniza con el contexto
  const [candidato, setCandidato] = useState({
    Nombre: user.candidato?.Nombre || 'Usuario',
    ApellidoPaterno: user.candidato?.ApellidoPaterno || '',
    ApellidoMaterno: user.candidato?.ApellidoMaterno || '',
    Correo: user.email || 'usuario@example.com',
    Telefono: user.candidato?.Telefono || '',
    Direccion: user.candidato?.Direccion || '',
    FechaNacimiento: user.candidato?.FechaNacimiento || '',
    PuestoSolicitado: user.candidato?.PuestoSolicitado || 'Sin puesto especificado',
    ResumenProfesional: user.candidato?.ResumenProfesional || 'Agrega un resumen profesional para destacar tus habilidades y objetivos',
    FotoPerfil: user.candidato?.FotoPerfil || null,
    CV: user.candidato?.CV || null,
  });

  // Escuchar cambios en el contexto
  useEffect(() => {
    // Actualizar cuando el usuario cambie (por ejemplo, después de editar)
    setCandidato({
      Nombre: user.candidato?.Nombre || 'Usuario',
      ApellidoPaterno: user.candidato?.ApellidoPaterno || '',
      ApellidoMaterno: user.candidato?.ApellidoMaterno || '',
      Correo: user.email || 'usuario@example.com',
      Telefono: user.candidato?.Telefono || '',
      Direccion: user.candidato?.Direccion || '',
      FechaNacimiento: user.candidato?.FechaNacimiento || '',
      PuestoSolicitado: user.candidato?.PuestoSolicitado || 'Sin puesto especificado',
      ResumenProfesional: user.candidato?.ResumenProfesional || 'Agrega un resumen profesional para destacar tus habilidades y objetivos',
      FotoPerfil: user.candidato?.FotoPerfil || null,
      CV: user.candidato?.CV || null,
    });
  }, [user]); // Se ejecuta cada vez que user cambia

  // Escuchar cuando la pantalla recibe foco (vuelve de editar)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Actualizar datos cuando la pantalla recibe foco
      setCandidato({
        Nombre: user.candidato?.Nombre || 'Usuario',
        ApellidoPaterno: user.candidato?.ApellidoPaterno || '',
        ApellidoMaterno: user.candidato?.ApellidoMaterno || '',
        Correo: user.email || 'usuario@example.com',
        Telefono: user.candidato?.Telefono || '',
        Direccion: user.candidato?.Direccion || '',
        FechaNacimiento: user.candidato?.FechaNacimiento || '',
        PuestoSolicitado: user.candidato?.PuestoSolicitado || 'Sin puesto especificado',
        ResumenProfesional: user.candidato?.ResumenProfesional || 'Agrega un resumen profesional para destacar tus habilidades y objetivos',
        FotoPerfil: user.candidato?.FotoPerfil || null,
        CV: user.candidato?.CV || null,
      });
    });

    return unsubscribe;
  }, [navigation, user]);

  const habilidades = user.habilidades || [];

  const postulaciones = user.postulaciones || [];

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      refreshUser().catch(() => {});
    });
    return unsubscribe;
  }, [navigation]);

  const experienciaLaboral = user.experiencias || [];

  const noLeidos = Number(user.noLeidos || 0);
  const [completed, setCompleted] = useState(60);
  const [vacantesDisponibles, setVacantesDisponibles] = useState([]);

  const descargarCV = async () => {
    try {
      const { data } = await api.get('/perfil/cv', { timeout: 45000 });
      const safeName = String(data.nombre || 'curriculum.pdf').replace(/[^a-zA-Z0-9._-]/g, '_');
      const uri = `${FileSystem.cacheDirectory}${safeName}`;
      await FileSystem.writeAsStringAsync(uri, data.contenido, {
        encoding: FileSystem.EncodingType.Base64,
      });
      if (!(await Sharing.isAvailableAsync())) {
        return Alert.alert('CV descargado', `El archivo quedó disponible en ${uri}`);
      }
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Abrir o compartir CV' });
    } catch (error) {
      Alert.alert('No fue posible descargar el CV', error.response?.data?.error || 'Inténtalo nuevamente.');
    }
  };

  // Recalcular completado cuando candidato cambia
  useEffect(() => {
    let count = 0;
    if (candidato.Nombre && candidato.Nombre !== 'Usuario') count += 20;
    if (candidato.Telefono) count += 10;
    if (candidato.Direccion) count += 10;
    if (candidato.ResumenProfesional && candidato.ResumenProfesional.length > 20) count += 20;
    if (habilidades.length > 0) count += 20;
    if (experienciaLaboral.length > 0) count += 20;
    setCompleted(Math.min(count, 100));
  }, [candidato, habilidades, experienciaLaboral]);

  useEffect(() => {
    const cargarVacantes = async () => {
      try {
        const { data } = await api.get('/vacantes');
        setVacantesDisponibles(Array.isArray(data) ? data.slice(0, 3) : []);
      } catch {
        setVacantesDisponibles([]);
      }
    };
    cargarVacantes();
    const unsubscribe = navigation.addListener('focus', cargarVacantes);
    return unsubscribe;
  }, [navigation]);

  const formatDate = (dateInput) => {
    if (!dateInput) return 'Fecha no disponible';
    try {
      let date;
      if (typeof dateInput === 'string') {
        date = new Date(dateInput);
      } else if (dateInput instanceof Date) {
        date = dateInput;
      } else {
        return 'Fecha inválida';
      }
      if (isNaN(date.getTime())) {
        return 'Fecha inválida';
      }
      return date.toLocaleDateString('es-MX', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  const formatMonthYear = (dateInput) => {
    if (!dateInput) return 'Fecha no disponible';
    try {
      let date;
      if (typeof dateInput === 'string') {
        date = new Date(dateInput);
      } else if (dateInput instanceof Date) {
        date = dateInput;
      } else {
        return 'Fecha inválida';
      }
      if (isNaN(date.getTime())) {
        return 'Fecha inválida';
      }
      return date.toLocaleDateString('es-MX', { 
        month: 'short', 
        year: 'numeric' 
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return 0;
    try {
      const hoy = new Date();
      const nacimiento = new Date(fechaNacimiento);
      if (isNaN(nacimiento.getTime())) return 0;
      let edad = hoy.getFullYear() - nacimiento.getFullYear();
      const mes = hoy.getMonth() - nacimiento.getMonth();
      if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
      }
      return edad;
    } catch (error) {
      return 0;
    }
  };

  const edad = calcularEdad(candidato.FechaNacimiento);
  const nombreCompleto = `${candidato.Nombre} ${candidato.ApellidoPaterno}`.trim();

  const getBadgeColor = (estatus) => {
    switch (estatus) {
      case 'aceptado': return '#10b981';
      case 'rechazado': return '#ef4444';
      default: return '#2563eb';
    }
  };

  const getBadgeText = (estatus) => {
    switch (estatus) {
      case 'aceptado': return 'Aceptado';
      case 'rechazado': return 'Rechazado';
      default: return 'Pendiente';
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Cerrar sesión', 
          onPress: async () => {
            await logout();
            navigation.replace('Home');
          }
        },
      ]
    );
  };

  const navItems = [
    { icon: 'home', label: 'Resumen', active: true },
    { icon: 'person-outline', label: 'Perfil' },
    { icon: 'school-outline', label: 'Preparación' },
    { icon: 'briefcase-outline', label: 'Experiencia' },
    { icon: 'star-outline', label: 'Habilidades' },
    { icon: 'people-outline', label: 'Referencias' },
    { icon: 'document-text-outline', label: 'Postulaciones' },
    { icon: 'bookmark-outline', label: 'Guardadas' },
    { icon: 'chatbubbles-outline', label: 'Mensajes', badge: noLeidos },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoContainer}>
            <Ionicons name="briefcase" size={20} color={COLORS.primary} />
          </View>
          <Text style={styles.headerTitle}>TalentUPQ</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.chatbotButton}
            onPress={() => navigation.navigate('Chatbot')}
            activeOpacity={0.8}
          >
            <Ionicons name="hardware-chip-outline" size={22} color="#0ea5e9" />
            <View style={styles.chatbotBadge}>
              <Text style={styles.chatbotBadgeText}>AI</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={22} color="#64748b" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.profileCard}>
          <View style={styles.profileRow}>
            <View style={styles.profileAvatarContainer}>
              {candidato.FotoPerfil ? (
                <Image source={{ uri: candidato.FotoPerfil }} style={styles.profileAvatar} />
              ) : (
                <View style={styles.profileAvatarPlaceholder}>
                  <Text style={styles.profileAvatarText}>
                    {candidato.Nombre ? candidato.Nombre[0] : 'U'}
                    {candidato.ApellidoPaterno ? candidato.ApellidoPaterno[0] : '?'}
                  </Text>
                </View>
              )}
              <TouchableOpacity 
                style={styles.editAvatarButton}
                onPress={() => navigation.navigate('EditarPerfil')}
              >
                <Ionicons name="camera-outline" size={12} color="white" />
              </TouchableOpacity>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName} numberOfLines={1}>{nombreCompleto || 'Usuario'}</Text>
              <Text style={styles.profileTitle} numberOfLines={1}>
                {candidato.PuestoSolicitado || 'Sin puesto especificado'}
              </Text>
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${completed}%` }]} />
                </View>
                <Text style={styles.progressText}>Perfil {completed}% completo</Text>
              </View>
            </View>
          </View>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.navScroll}
          contentContainerStyle={styles.navContent}
        >
          {navItems.map((item, index) => (
            <TouchableOpacity 
              key={index}
              style={[styles.navItem, item.active && styles.navItemActive]}
              onPress={() => {
                if (item.label === 'Perfil') {
                  navigation.navigate('EditarPerfil');
                } else if (item.label === 'Experiencia') {
                  navigation.navigate('ExperienciaLaboral');
                } else if (item.label === 'Preparación') {
                  navigation.navigate('PreparacionAcademica');
                } else if (item.label === 'Habilidades') {
                  navigation.navigate('MisHabilidades');
                } else if (item.label === 'Referencias') {
                  navigation.navigate('Referencias');
                } else if (item.label === 'Postulaciones') {
                  navigation.navigate('MisPostulaciones');
                } else if (item.label === 'Guardadas') {
                  navigation.navigate('Favoritos');
                } else if (item.label === 'Mensajes') {
                  navigation.navigate('MisConversaciones');
                } else if (item.label === 'Resumen') {
                  // Ya estamos en el dashboard
                } else {
                  Alert.alert('En desarrollo', `La sección "${item.label}" estará disponible pronto.`);
                }
              }}
            >
              <View style={styles.navIconWrapper}>
                <Ionicons 
                  name={item.icon} 
                  size={22} 
                  color={item.active ? '#2563eb' : '#64748b'} 
                />
                {Number(item.badge) > 0 && (
                  <View style={styles.navBadge}>
                    <Text style={styles.navBadgeText}>{item.badge}</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.navText, item.active && styles.navTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.content}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <Ionicons name="document-text-outline" size={18} color={COLORS.primary} />
                <Text style={styles.cardTitle}>Mi Resumen Profesional</Text>
              </View>
              <TouchableOpacity 
                style={styles.cardEditButton}
                onPress={() => navigation.navigate('EditarPerfil')}
              >
                <Ionicons name="create-outline" size={14} color="#2563eb" />
                <Text style={styles.cardEditText}>Editar</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.resumenText}>
                {candidato.ResumenProfesional || 'Agrega un resumen profesional para destacar tus habilidades y objetivos'}
              </Text>
              
              <View style={styles.contactGrid}>
                <View style={styles.infoItem}>
                  <Ionicons name="mail-outline" size={16} color="#2563eb" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Correo</Text>
                    <Text style={styles.infoValue} numberOfLines={1}>{candidato.Correo}</Text>
                  </View>
                </View>
                <View style={styles.infoItem}>
                  <Ionicons name="call-outline" size={16} color="#2563eb" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Teléfono</Text>
                    <Text style={styles.infoValue}>{candidato.Telefono || 'No especificado'}</Text>
                  </View>
                </View>
                <View style={styles.infoItem}>
                  <Ionicons name="location-outline" size={16} color="#2563eb" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Dirección</Text>
                    <Text style={styles.infoValue} numberOfLines={1}>{candidato.Direccion || 'No especificada'}</Text>
                  </View>
                </View>
                <View style={styles.infoItem}>
                  <Ionicons name="calendar-outline" size={16} color="#2563eb" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Fecha Nacimiento</Text>
                    <Text style={styles.infoValue}>
                      {candidato.FechaNacimiento ? `${formatDate(candidato.FechaNacimiento)} (${edad} años)` : 'No especificado'}
                    </Text>
                  </View>
                </View>
              </View>

              {candidato.CV ? (
                <TouchableOpacity style={[styles.btnPrimary, styles.btnBlock]} onPress={descargarCV}>
                  <Ionicons name="download-outline" size={14} color="white" />
                  <Text style={styles.btnPrimaryText}>Descargar CV</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={[styles.btnOutline, styles.btnBlock]}
                  onPress={() => navigation.navigate('EditarPerfil')}
                >
                  <Ionicons name="cloud-upload-outline" size={14} color="#1e293b" />
                  <Text style={styles.btnOutlineText}>Subir CV</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <Ionicons name="search-circle-outline" size={19} color={COLORS.primary} />
                <Text style={styles.cardTitle}>Vacantes disponibles</Text>
              </View>
              <TouchableOpacity style={styles.cardEditButton} onPress={() => navigation.navigate('Vacantes')}>
                <Text style={styles.cardEditText}>Ver todas</Text>
                <Ionicons name="arrow-forward-outline" size={14} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
            <View style={styles.cardBody}>
              {vacantesDisponibles.length ? vacantesDisponibles.map((vacante) => (
                <TouchableOpacity
                  key={vacante.VacanteID}
                  style={styles.vacanteItem}
                  onPress={() => navigation.navigate('DetalleVacante', { vacanteId: vacante.VacanteID })}
                  activeOpacity={0.75}
                >
                  <View style={styles.vacanteIcon}>
                    <Ionicons name="briefcase-outline" size={19} color={COLORS.primary} />
                  </View>
                  <View style={styles.vacanteInfo}>
                    <Text style={styles.vacantePuesto} numberOfLines={1}>{vacante.Puesto}</Text>
                    <Text style={styles.vacanteEmpresa} numberOfLines={1}>{vacante.EmpresaNombre}</Text>
                    <Text style={styles.vacanteMeta} numberOfLines={1}>
                      {[vacante.Modalidad, vacante.Ubicacion].filter(Boolean).join(' · ') || 'Información por definir'}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
                </TouchableOpacity>
              )) : (
                <Text style={styles.emptyState}>No hay vacantes disponibles por el momento.</Text>
              )}
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <Ionicons name="star-outline" size={18} color={COLORS.primary} />
                <Text style={styles.cardTitle}>Mis Habilidades</Text>
              </View>
              <TouchableOpacity 
                style={styles.cardEditButton}
                onPress={() => navigation.navigate('MisHabilidades')}
              >
                <Ionicons name="create-outline" size={14} color="#2563eb" />
                <Text style={styles.cardEditText}>Editar</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.cardBody}>
              {habilidades.length > 0 ? (
                <View style={styles.skillsList}>
                  {habilidades.map((habilidad, index) => (
                    <View key={index} style={styles.skillTag}>
                      <Text style={styles.skillTagText}>{habilidad}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.emptyState}>No has agregado habilidades aún.</Text>
              )}
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <Ionicons name="file-tray-full-outline" size={18} color={COLORS.primary} />
                <Text style={styles.cardTitle}>Mis Postulaciones</Text>
              </View>
              <TouchableOpacity 
                style={styles.cardEditButton}
                onPress={() => navigation.navigate('MisPostulaciones')}
              >
                <Text style={styles.cardEditText}>Ver todas</Text>
                <Ionicons name="arrow-forward-outline" size={14} color="#2563eb" />
              </TouchableOpacity>
            </View>
            <View style={styles.cardBody}>
              {postulaciones.length > 0 ? (
                <>
                  {postulaciones.slice(0, 2).map((post, index) => (
                    <View key={index} style={styles.postulacionItem}>
                      <View style={styles.postulacionHeader}>
                        <Text style={styles.postulacionTitle} numberOfLines={1}>{post.Puesto}</Text>
                        <View style={[styles.badge, { backgroundColor: getBadgeColor(post.Estatus) }]}>
                          <Text style={styles.badgeText}>{getBadgeText(post.Estatus)}</Text>
                        </View>
                      </View>
                      <Text style={styles.postulacionEmpresa}>{post.EmpresaNombre}</Text>
                      <Text style={styles.postulacionFecha}>Postulado el {formatDate(post.FechaPostulacion)}</Text>
                    </View>
                  ))}
                  {postulaciones.length > 2 && (
                    <TouchableOpacity 
                      style={[styles.btnOutline, styles.btnBlock]}
                      onPress={() => navigation.navigate('MisPostulaciones')}
                    >
                      <Text style={styles.btnOutlineText}>Ver {postulaciones.length - 2} más</Text>
                    </TouchableOpacity>
                  )}
                </>
              ) : (
                <View style={styles.emptyStateContainer}>
                  <Text style={styles.emptyState}>No te has postulado a ninguna vacante aún.</Text>
                  <TouchableOpacity 
                    style={[styles.btnPrimary, styles.btnBlock]}
                    onPress={() => navigation.navigate('Vacantes')}
                  >
                    <Ionicons name="search-outline" size={14} color="white" />
                    <Text style={styles.btnPrimaryText}>Buscar vacantes</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <Ionicons name="briefcase-outline" size={18} color={COLORS.primary} />
                <Text style={styles.cardTitle}>Última Experiencia</Text>
              </View>
              <TouchableOpacity 
                style={styles.cardEditButton}
                onPress={() => navigation.navigate('ExperienciaLaboral')}
              >
                <Ionicons name="create-outline" size={14} color="#2563eb" />
                <Text style={styles.cardEditText}>Editar</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.cardBody}>
              {experienciaLaboral.length > 0 ? (
                <View>
                  <Text style={styles.experienciaPuesto}>{experienciaLaboral[0].Puesto}</Text>
                  <Text style={styles.experienciaEmpresa}>{experienciaLaboral[0].Empresa}</Text>
                  <Text style={styles.experienciaPeriodo}>
                    {experienciaLaboral[0].FechaIngreso ? 
                      `${formatMonthYear(experienciaLaboral[0].FechaIngreso)} - ${experienciaLaboral[0].FechaSalida ? formatMonthYear(experienciaLaboral[0].FechaSalida) : 'Presente'}` 
                      : 'Fechas no especificadas'}
                  </Text>
                  <TouchableOpacity 
                    style={[styles.btnOutline, styles.btnBlock]}
                    onPress={() => navigation.navigate('ExperienciaLaboral')}
                  >
                    <Ionicons name="time-outline" size={14} color="#1e293b" />
                    <Text style={styles.btnOutlineText}>Ver toda mi experiencia</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.emptyStateContainer}>
                  <Text style={styles.emptyState}>No has agregado experiencia laboral aún.</Text>
                  <TouchableOpacity 
                    style={[styles.btnPrimary, styles.btnBlock]}
                    onPress={() => navigation.navigate('ExperienciaLaboral')}
                  >
                    <Ionicons name="add-outline" size={14} color="white" />
                    <Text style={styles.btnPrimaryText}>Agregar Experiencia</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    minHeight: 50,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  logoContainer: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  logoutButton: {
    padding: 6,
  },
  chatbotButton: {
    position: 'relative',
    padding: 6,
    marginRight: 2,
  },
  chatbotBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#0ea5e9',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
    minWidth: 16,
    alignItems: 'center',
  },
  chatbotBadgeText: {
    color: 'white',
    fontSize: 7,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  profileCard: {
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  profileAvatarContainer: {
    position: 'relative',
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#2563eb',
  },
  profileAvatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#2563eb',
  },
  profileAvatarText: {
    fontSize: 22,
    fontWeight: '600',
    color: 'white',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#2563eb',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  profileTitle: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  progressContainer: {
    width: '100%',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 10,
    color: '#2563eb',
    marginTop: 2,
    fontWeight: '500',
  },
  navScroll: {
    backgroundColor: 'white',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  navContent: {
    paddingHorizontal: 12,
    gap: 4,
  },
  navItem: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    minWidth: 60,
  },
  navItemActive: {
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
  },
  navIconWrapper: {
    position: 'relative',
    marginBottom: 2,
  },
  navBadge: {
    position: 'absolute',
    top: -6,
    right: -10,
    backgroundColor: '#ef4444',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  navBadgeText: {
    color: 'white',
    fontSize: 9,
    fontWeight: '600',
  },
  navText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
    marginTop: 2,
  },
  navTextActive: {
    color: '#2563eb',
  },
  vacanteItem: {
    flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 11,
    borderBottomWidth: 1, borderBottomColor: '#eef2f7',
  },
  vacanteIcon: {
    width: 38, height: 38, borderRadius: 10, backgroundColor: '#eff6ff',
    alignItems: 'center', justifyContent: 'center',
  },
  vacanteInfo: { flex: 1 },
  vacantePuesto: { fontSize: 14, fontWeight: '700', color: COLORS.dark },
  vacanteEmpresa: { fontSize: 12, color: COLORS.gray, marginTop: 2 },
  vacanteMeta: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  content: {
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#fafcff',
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  cardEditButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardEditText: {
    fontSize: 11,
    color: '#2563eb',
    fontWeight: '500',
  },
  cardBody: {
    padding: 12,
  },
  resumenText: {
    fontSize: 13,
    color: '#1e293b',
    lineHeight: 20,
    marginBottom: 10,
  },
  contactGrid: {
    flexDirection: 'column',
    gap: 6,
    marginBottom: 10,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    width: '100%',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 8,
    textTransform: 'uppercase',
    color: '#64748b',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  infoValue: {
    fontSize: 12,
    color: '#1e293b',
    fontWeight: '500',
  },
  skillsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  skillTag: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  skillTagText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '500',
  },
  postulacionItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  postulacionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  postulacionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
    marginRight: 8,
  },
  postulacionEmpresa: {
    fontSize: 12,
    color: '#64748b',
  },
  postulacionFecha: {
    fontSize: 11,
    color: '#94a3b8',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeText: {
    color: 'white',
    fontSize: 9,
    fontWeight: '600',
  },
  experienciaPuesto: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  experienciaEmpresa: {
    fontSize: 13,
    color: '#64748b',
  },
  experienciaPeriodo: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
    marginBottom: 6,
  },
  emptyState: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: 12,
  },
  emptyStateContainer: {
    alignItems: 'center',
    gap: 6,
  },
  btnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  btnPrimaryText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  btnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 6,
  },
  btnOutlineText: {
    color: '#1e293b',
    fontSize: 12,
    fontWeight: '500',
  },
  btnBlock: {
    width: '100%',
  },
});

export default CandidatoDashboardScreen;
