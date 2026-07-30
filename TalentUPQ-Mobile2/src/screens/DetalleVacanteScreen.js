import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  StatusBar,
  Platform,
  Dimensions,
  Linking,
  ActivityIndicator,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api, { apiMessage } from '../services/api';
import { useUser } from '../context/UserContext';

const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#2563eb',
  primaryDark: '#1d4ed8',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  dark: '#1e293b',
  gray: '#64748b',
  grayLight: '#f8fafc',
  grayBorder: '#e2e8f0',
  white: '#ffffff',
  text: '#1e293b',
  textLight: '#475569',
};

const DetalleVacanteScreen = ({ navigation, route }) => {
  const { favoritos, toggleFavorito } = useUser();
  const [vacante, setVacante] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const vacanteId = route.params?.vacanteId;
  /* Estructura visual de referencia; los datos se cargan desde la API.
  const vacanteDemo = {
    id: 1,
    puesto: 'Desarrollador Full Stack',
    empresa_nombre: 'Tech Solutions',
    empresa_logo: null,
    ubicacion: 'Querétaro, Qro.',
    modalidad: 'remoto',
    fecha_publicacion: '2026-07-01',
    resumen: 'Buscamos un desarrollador Full Stack con experiencia en React Native y Node.js para unirse a nuestro equipo de innovación. Serás responsable del desarrollo de aplicaciones móviles y web de alto impacto.',
    responsabilidades: [
      'Desarrollar y mantener aplicaciones móviles con React Native',
      'Implementar APIs REST con Node.js y Express',
      'Optimizar el rendimiento de las aplicaciones',
      'Colaborar con el equipo de diseño en la implementación de interfaces',
      'Realizar code reviews y mentoría a desarrolladores junior',
    ],
    grado_estudios: 'Licenciatura',
    experiencia_requerida: '3-5 años',
    requisitos: [
      'Título en Ingeniería en Sistemas, Computación o afín',
      'Experiencia comprobable en desarrollo móvil',
      'Conocimiento de metodologías ágiles',
    ],
    habilidades_requeridas: [
      'React Native',
      'Node.js',
      'TypeScript',
      'AWS',
      'Docker',
      'Git',
      'PostgreSQL',
    ],
    habilidades_opcionales: [
      'Flutter',
      'GraphQL',
      'Kubernetes',
      'Redis',
    ],
    beneficios: 'Vales de despensa, seguro de gastos médicos, fondo de ahorro, 15 días de aguinaldo, home office, crecimiento profesional.',
    tipo_contrato: 'Tiempo completo',
    salario: '$35,000 - $45,000 MXN',
    disponibilidad: 'Inmediata',
    plazas: 2,
  }; */

  const [yaPostulado, setYaPostulado] = useState(false);

  useEffect(() => {
    api.get(`/vacantes/${vacanteId}`)
      .then(({ data }) => setVacante({
        id: data.VacanteID,
        puesto: data.Puesto,
        empresa_nombre: data.EmpresaNombre,
        empresa_logo: data.Logo,
        ubicacion: data.Ubicacion || 'Por definir',
        modalidad: (data.Modalidad || '').toLowerCase().replace('í', 'i'),
        fecha_publicacion: data.FechaPublicacion?.slice(0, 10) || '',
        resumen: data.Resumen || '',
        responsabilidades: [],
        grado_estudios: data.GradoEstudios || 'No especificado',
        experiencia_requerida: data.ExperienciaRequerida || 'No especificada',
        requisitos: [],
        habilidades_requeridas: data.HabilidadesRequeridas
          ? data.HabilidadesRequeridas.split(',').map((item) => item.trim()) : [],
        habilidades_opcionales: data.HabilidadesOpcionales
          ? data.HabilidadesOpcionales.split(',').map((item) => item.trim()) : [],
        beneficios: data.Beneficios || '',
        tipo_contrato: data.TipoContrato || 'No especificado',
        salario: data.Salario || 'Por definir',
        disponibilidad: data.PlazasDisponibles > 0 ? 'Disponible' : 'Agotada',
        plazas: data.PlazasDisponibles,
      }))
      .catch((error) => Alert.alert('Error', apiMessage(error)))
      .finally(() => setLoading(false));
  }, [vacanteId]);

  const handlePostular = () => {
    Alert.alert(
      'Confirmar postulación',
      '¿Estás seguro de que deseas postularte a esta vacante?\n\nAsegúrate de tener tu perfil completo y CV actualizado.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Postularme',
          onPress: async () => {
            try {
              setApplying(true);
              const { data } = await api.post(`/vacantes/${vacanteId}/postular`);
              setYaPostulado(true);
              Alert.alert('¡Éxito!', data.message);
            } catch (error) {
              Alert.alert('No fue posible postularte', apiMessage(error));
            } finally {
              setApplying(false);
            }
          }
        },
      ]
    );
  };

  const getModalidadIcon = (modalidad) => {
    switch (modalidad) {
      case 'remoto':
        return 'home-outline';
      case 'hibrido':
        return 'repeat-outline';
      default:
        return 'business-outline';
    }
  };

  const getModalidadColor = (modalidad) => {
    switch (modalidad) {
      case 'remoto':
        return '#0369a1';
      case 'hibrido':
        return '#854d0e';
      default:
        return '#166534';
    }
  };

  const getModalidadBg = (modalidad) => {
    switch (modalidad) {
      case 'remoto':
        return '#e0f2fe';
      case 'hibrido':
        return '#fef9c3';
      default:
        return '#dcfce7';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const capitalize = (text) => {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  const esFavorita = favoritos.some((item) => item.id === vacante?.id);

  const handleFavorito = async () => {
    const added = await toggleFavorito(vacante);
    Alert.alert(
      added ? 'Guardada sin conexión' : 'Eliminada de favoritos',
      added ? 'Podrás consultar esta vacante aunque no tengas internet.' : 'La vacante dejó de estar guardada.'
    );
  };

  const handleCompartir = async () => {
    await Share.share({
      title: vacante.puesto,
      message: `${vacante.puesto} en ${vacante.empresa_nombre}\n${vacante.ubicacion} · ${capitalize(vacante.modalidad)}\nSalario: ${vacante.salario}\n\nVacante disponible en TalentUPQ.`,
    });
  };

  if (loading || !vacante) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" color="#2563eb" />;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Detalle de Vacante</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleFavorito} style={styles.headerAction}>
            <Ionicons name={esFavorita ? 'bookmark' : 'bookmark-outline'} size={22} color={esFavorita ? '#2563eb' : '#64748b'} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleCompartir} style={styles.headerAction}>
            <Ionicons name="share-social-outline" size={22} color="#64748b" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header de la vacante */}
        <View style={styles.vacanteHeader}>
          <View style={styles.vacanteHeaderTop}>
            <Text style={styles.vacanteTitulo}>{vacante.puesto}</Text>
            {!yaPostulado ? (
              <TouchableOpacity style={styles.btnPostular} onPress={handlePostular} disabled={applying}>
                <Ionicons name="paper-plane-outline" size={16} color="white" />
                <Text style={styles.btnPostularText}>{applying ? 'Enviando...' : 'Postularme'}</Text>
                <Ionicons name="arrow-forward-outline" size={16} color="white" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* Info de la empresa */}
        <View style={styles.infoCard}>
          <View style={styles.empresaHeader}>
            <View style={styles.empresaLogoWrapper}>
              {vacante.empresa_logo ? (
                <Image source={{ uri: vacante.empresa_logo }} style={styles.empresaLogo} />
              ) : (
                <Ionicons name="business-outline" size={32} color="#2563eb" />
              )}
            </View>
            <View style={styles.empresaInfo}>
              <Text style={styles.empresaNombre}>{vacante.empresa_nombre}</Text>
              <View style={styles.empresaUbicacion}>
                <Ionicons name="location-outline" size={14} color="#64748b" />
                <Text style={styles.empresaUbicacionText}>{vacante.ubicacion}</Text>
              </View>
            </View>
            <View style={[styles.modalidadBadge, { backgroundColor: getModalidadBg(vacante.modalidad) }]}>
              <Ionicons name={getModalidadIcon(vacante.modalidad)} size={14} color={getModalidadColor(vacante.modalidad)} />
              <Text style={[styles.modalidadBadgeText, { color: getModalidadColor(vacante.modalidad) }]}>
                {capitalize(vacante.modalidad)}
              </Text>
            </View>
          </View>
          <View style={styles.fechaPublicacion}>
            <Ionicons name="calendar-outline" size={14} color="#64748b" />
            <Text style={styles.fechaPublicacionText}>Publicado: {formatDate(vacante.fecha_publicacion)}</Text>
          </View>
        </View>

        {/* Descripción */}
        <View style={styles.detailCard}>
          <View style={styles.cardHeaderMini}>
            <Ionicons name="information-circle-outline" size={18} color="#2563eb" />
            <Text style={styles.cardHeaderTitle}>Descripción de la Vacante</Text>
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardText}>{vacante.resumen}</Text>
          </View>
        </View>

        {/* Responsabilidades */}
        {vacante.responsabilidades && vacante.responsabilidades.length > 0 && (
          <View style={styles.detailCard}>
            <View style={styles.cardHeaderMini}>
              <Ionicons name="list-outline" size={18} color="#2563eb" />
              <Text style={styles.cardHeaderTitle}>Responsabilidades</Text>
            </View>
            <View style={styles.cardContent}>
              {vacante.responsabilidades.map((item, index) => (
                <View key={index} style={styles.listItem}>
                  <Ionicons name="checkmark-circle-outline" size={18} color="#10b981" />
                  <Text style={styles.listItemText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Requisitos */}
        <View style={styles.detailCard}>
          <View style={styles.cardHeaderMini}>
            <Ionicons name="clipboard-outline" size={18} color="#2563eb" />
            <Text style={styles.cardHeaderTitle}>Requisitos</Text>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.requisitosGrid}>
              <View style={styles.requisitoItem}>
                <Ionicons name="school-outline" size={20} color="#2563eb" />
                <View>
                  <Text style={styles.requisitoLabel}>Grado de estudios</Text>
                  <Text style={styles.requisitoValue}>{vacante.grado_estudios}</Text>
                </View>
              </View>
              <View style={styles.requisitoItem}>
                <Ionicons name="stats-chart-outline" size={20} color="#2563eb" />
                <View>
                  <Text style={styles.requisitoLabel}>Experiencia requerida</Text>
                  <Text style={styles.requisitoValue}>{vacante.experiencia_requerida}</Text>
                </View>
              </View>
              {vacante.requisitos && vacante.requisitos.map((item, index) => (
                <View key={index} style={[styles.requisitoItem, styles.requisitoFullWidth]}>
                  <Ionicons name="checkmark-outline" size={20} color="#2563eb" />
                  <View>
                    <Text style={styles.requisitoValue}>{item}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Habilidades Requeridas */}
        <View style={styles.detailCard}>
          <View style={styles.cardHeaderMini}>
            <Ionicons name="star-outline" size={18} color="#2563eb" />
            <Text style={styles.cardHeaderTitle}>Habilidades Requeridas</Text>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.skillsWrapper}>
              {vacante.habilidades_requeridas.map((habilidad, index) => (
                <View key={index} style={styles.skillBadgeRequired}>
                  <Ionicons name="checkmark-circle-outline" size={14} color="white" />
                  <Text style={styles.skillBadgeTextRequired}>{habilidad}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Habilidades Opcionales */}
        {vacante.habilidades_opcionales && vacante.habilidades_opcionales.length > 0 && (
          <View style={styles.detailCard}>
            <View style={styles.cardHeaderMini}>
              <Ionicons name="star-half-outline" size={18} color="#2563eb" />
              <Text style={styles.cardHeaderTitle}>Habilidades Opcionales</Text>
            </View>
            <View style={styles.cardContent}>
              <View style={styles.skillsWrapper}>
                {vacante.habilidades_opcionales.map((habilidad, index) => (
                  <View key={index} style={styles.skillBadgeOptional}>
                    <Ionicons name="add-circle-outline" size={14} color="#1e293b" />
                    <Text style={styles.skillBadgeTextOptional}>{habilidad}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Beneficios */}
        {vacante.beneficios && (
          <View style={styles.detailCard}>
            <View style={styles.cardHeaderMini}>
              <Ionicons name="gift-outline" size={18} color="#2563eb" />
              <Text style={styles.cardHeaderTitle}>Beneficios</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardText}>{vacante.beneficios}</Text>
            </View>
          </View>
        )}

        {/* Sidebar - Detalles del puesto */}
        <View style={styles.sidebarCard}>
          <View style={styles.sidebarTitle}>
            <Ionicons name="information-circle-outline" size={18} color="#2563eb" />
            <Text style={styles.sidebarTitleText}>Detalles del puesto</Text>
          </View>
          <View style={styles.sidebarDetails}>
            <View style={styles.sidebarDetail}>
              <Ionicons name="document-text-outline" size={20} color="#2563eb" />
              <View>
                <Text style={styles.detailLabel}>Tipo de contrato</Text>
                <Text style={styles.detailValue}>{vacante.tipo_contrato}</Text>
              </View>
            </View>
            <View style={styles.sidebarDetail}>
              <Ionicons name="cash-outline" size={20} color="#2563eb" />
              <View>
                <Text style={styles.detailLabel}>Salario</Text>
                <Text style={styles.detailValue}>{vacante.salario}</Text>
              </View>
            </View>
            <View style={styles.sidebarDetail}>
              <Ionicons name="calendar-outline" size={20} color="#2563eb" />
              <View>
                <Text style={styles.detailLabel}>Disponibilidad</Text>
                <Text style={styles.detailValue}>{vacante.disponibilidad}</Text>
              </View>
            </View>
            <View style={styles.sidebarDetail}>
              <Ionicons name="people-outline" size={20} color="#2563eb" />
              <View>
                <Text style={styles.detailLabel}>Plazas disponibles</Text>
                <Text style={styles.detailValue}>{vacante.plazas}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Alert o Action Card */}
        {yaPostulado ? (
          <View style={styles.alertCard}>
            <View style={styles.alertIcon}>
              <Ionicons name="checkmark-circle-outline" size={28} color="#10b981" />
            </View>
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>¡Ya te has postulado!</Text>
              <Text style={styles.alertDescription}>
                Tu solicitud ha sido enviada. La empresa revisará tu perfil.
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.actionCard}>
            <Text style={styles.actionTitle}>¿Listo para postularte?</Text>
            <Text style={styles.actionDescription}>
              Asegúrate de tener tu perfil completo y CV actualizado
            </Text>
            <TouchableOpacity style={styles.btnPostularSidebar} onPress={handlePostular} disabled={applying}>
              <Ionicons name="paper-plane-outline" size={18} color="white" />
              <Text style={styles.btnPostularSidebarText}>{applying ? 'Enviando...' : 'Postularme ahora'}</Text>
            </TouchableOpacity>
            <View style={styles.actionNote}>
              <Ionicons name="shield-checkmark-outline" size={14} color="#64748b" />
              <Text style={styles.actionNoteText}>Tus datos están seguros</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 4,
  },
  headerAction: {
    padding: 5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 12,
    paddingBottom: 20,
  },
  // Header de la vacante
  vacanteHeader: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    marginBottom: 12,
  },
  vacanteHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  vacanteTitulo: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    flex: 1,
  },
  btnPostular: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2563eb',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  btnPostularText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  // Info Card
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    marginBottom: 12,
  },
  empresaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  empresaLogoWrapper: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  empresaLogo: {
    width: 44,
    height: 44,
    resizeMode: 'contain',
  },
  empresaInfo: {
    flex: 1,
  },
  empresaNombre: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  empresaUbicacion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  empresaUbicacionText: {
    fontSize: 12,
    color: '#64748b',
  },
  modalidadBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  modalidadBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  fechaPublicacion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  fechaPublicacionText: {
    fontSize: 12,
    color: '#64748b',
  },
  // Detail Cards
  detailCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
    overflow: 'hidden',
  },
  cardHeaderMini: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  cardHeaderTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  cardContent: {
    padding: 14,
  },
  cardText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
  },
  // List Items
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  listItemText: {
    fontSize: 14,
    color: '#475569',
    flex: 1,
    lineHeight: 20,
  },
  // Requisitos
  requisitosGrid: {
    gap: 10,
  },
  requisitoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  requisitoFullWidth: {
    flex: 1,
  },
  requisitoLabel: {
    fontSize: 11,
    color: '#64748b',
  },
  requisitoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
  },
  // Skills
  skillsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillBadgeRequired: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#2563eb',
    borderRadius: 20,
  },
  skillBadgeTextRequired: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  skillBadgeOptional: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  skillBadgeTextOptional: {
    fontSize: 12,
    color: '#1e293b',
    fontWeight: '500',
  },
  // Sidebar
  sidebarCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    marginBottom: 12,
  },
  sidebarTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    marginBottom: 12,
  },
  sidebarTitleText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  sidebarDetails: {
    gap: 12,
  },
  sidebarDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailLabel: {
    fontSize: 11,
    color: '#64748b',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
  },
  // Alert Card
  alertCard: {
    backgroundColor: '#ecfdf5',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#a7f3d0',
    marginBottom: 12,
  },
  alertIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#d1fae5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  alertDescription: {
    fontSize: 12,
    color: '#64748b',
  },
  // Action Card
  actionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 12,
  },
  btnPostularSidebar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: '100%',
    justifyContent: 'center',
  },
  btnPostularSidebarText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  actionNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  actionNoteText: {
    fontSize: 11,
    color: '#64748b',
  },
});

export default DetalleVacanteScreen;
