import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api, { apiMessage } from '../services/api';

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

const MisConversacionesScreen = ({ navigation }) => {
  // Simular tipo de usuario (candidato o empresa)
  const tipoUsuario = 'candidato';

  const [conversaciones, setConversaciones] = useState([]);
  /* Conversaciones de ejemplo retiradas.
  const conversacionesDemo = [
    {
      ConversacionID: 1,
      VacanteID: 1,
      CandidatoID: 1,
      VacantePuesto: 'Desarrollador Full Stack',
      EmpresaNombre: 'Tech Solutions',
      CandidatoNombre: 'Juan',
      CandidatoApellido: 'Pérez',
      UltimoMensaje: 'Hola, ¿cuándo podríamos tener una entrevista?',
      UltimoMensajeFecha: '2026-07-05 14:30',
      NoLeidos: 2,
    },
    {
      ConversacionID: 2,
      VacanteID: 2,
      CandidatoID: 2,
      VacantePuesto: 'Ingeniero de Datos',
      EmpresaNombre: 'Data Corp',
      CandidatoNombre: 'María',
      CandidatoApellido: 'García',
      UltimoMensaje: 'Gracias por la oportunidad, estaré atenta.',
      UltimoMensajeFecha: '2026-07-03 10:15',
      NoLeidos: 0,
    },
    {
      ConversacionID: 3,
      VacanteID: 3,
      CandidatoID: 3,
      VacantePuesto: 'UX/UI Designer',
      EmpresaNombre: 'Design Studio',
      CandidatoNombre: 'Carlos',
      CandidatoApellido: 'Martínez',
      UltimoMensaje: 'He revisado el proyecto y me parece interesante.',
      UltimoMensajeFecha: '2026-07-01 09:00',
      NoLeidos: 0,
    },
  ]; */

  useEffect(() => {
    api.get('/conversaciones')
      .then(({ data }) => setConversaciones(data))
      .catch((error) => Alert.alert('Error', apiMessage(error)));
  }, []);

  const handleVerConversacion = (conversacionId, vacanteId, candidatoId) => {
    navigation.navigate('Conversacion', { 
      conversacionId, 
      vacanteId, 
      candidatoId 
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getInitials = (nombre, apellido) => {
    if (!nombre) return '?';
    return (nombre[0] + (apellido ? apellido[0] : '')).toUpperCase();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Ionicons name="chatbubbles-outline" size={20} color="#2563eb" />
          <Text style={styles.headerTitle}>Mis Conversaciones</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.conversacionesCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderIcon}>
              <Ionicons name="mail-outline" size={18} color="#2563eb" />
            </View>
            <Text style={styles.cardTitle}>
              Chats Activos
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{conversaciones.length}</Text>
              </View>
            </Text>
          </View>

          <View style={styles.cardBody}>
            {conversaciones.length > 0 ? (
              <View style={styles.conversacionesList}>
                {conversaciones.map((conv) => (
                  <TouchableOpacity
                    key={conv.ConversacionID}
                    style={[styles.conversacionCard, conv.NoLeidos > 0 && styles.conversacionCardNoLeidos]}
                    onPress={() => handleVerConversacion(
                      conv.ConversacionID, 
                      conv.VacanteID, 
                      conv.CandidatoID
                    )}
                  >
                    <View style={styles.conversacionCardHeader}>
                      <View style={styles.conversacionAvatar}>
                        <View style={[
                          styles.avatarCircle,
                          tipoUsuario === 'empresa' ? styles.avatarCandidate : styles.avatarCompany
                        ]}>
                          <Text style={styles.avatarText}>
                            {tipoUsuario === 'empresa' 
                              ? getInitials(conv.CandidatoNombre, conv.CandidatoApellido)
                              : conv.EmpresaNombre.substring(0, 2).toUpperCase()
                            }
                          </Text>
                        </View>
                      </View>
                      <View style={styles.conversacionCardInfo}>
                        <View style={styles.conversacionNombre}>
                          <Text style={styles.conversacionNombreText}>
                            {tipoUsuario === 'empresa' 
                              ? `${conv.CandidatoNombre} ${conv.CandidatoApellido}`
                              : conv.EmpresaNombre
                            }
                          </Text>
                          <View style={styles.conversacionFecha}>
                            <Ionicons name="time-outline" size={12} color="#94a3b8" />
                            <Text style={styles.conversacionFechaText}>
                              {formatDate(conv.UltimoMensajeFecha)}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.conversacionVacante}>
                          <Ionicons name="briefcase-outline" size={12} color="#2563eb" />
                          <Text style={styles.conversacionVacanteText}>{conv.VacantePuesto}</Text>
                        </View>
                        <View style={styles.conversacionUltimoMensaje}>
                          <Ionicons name="chatbubble-outline" size={14} color="#94a3b8" />
                          <Text style={styles.conversacionUltimoMensajeText} numberOfLines={2}>
                            {conv.UltimoMensaje || 'Sin mensajes aún'}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.conversacionCardFooter}>
                      {conv.NoLeidos > 0 && (
                        <View style={styles.noLeidosBadge}>
                          <Ionicons name="mail-outline" size={14} color="white" />
                          <Text style={styles.noLeidosBadgeText}>
                            {conv.NoLeidos} nuevo{conv.NoLeidos > 1 ? 's' : ''}
                          </Text>
                        </View>
                      )}
                      <View style={styles.conversacionAction}>
                        <Text style={styles.btnChat}>
                          Responder
                          <Ionicons name="arrow-forward-outline" size={14} color="#2563eb" />
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconContainer}>
                  <Ionicons name="chatbubbles-outline" size={40} color="#94a3b8" />
                </View>
                <Text style={styles.emptyTitle}>No tienes conversaciones activas</Text>
                <Text style={styles.emptyDescription}>
                  {tipoUsuario === 'candidato' 
                    ? 'Cuando una empresa acepte tu postulación, podrás chatear con ellos aquí.'
                    : 'Cuando aceptes un candidato, podrás chatear con él aquí.'
                  }
                </Text>
                {tipoUsuario === 'candidato' && (
                  <TouchableOpacity 
                    style={styles.btnPrimary}
                    onPress={() => navigation.navigate('Vacantes')}
                  >
                    <Ionicons name="search-outline" size={18} color="white" />
                    <Text style={styles.btnPrimaryText}>Explorar vacantes</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </View>
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
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  headerRight: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 12,
    paddingBottom: 20,
  },
  conversacionesCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#fafcff',
  },
  cardHeaderIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  countBadge: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 12,
    marginLeft: 6,
  },
  countBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  cardBody: {
    padding: 14,
  },
  conversacionesList: {
    gap: 10,
  },
  conversacionCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  conversacionCardNoLeidos: {
    borderLeftWidth: 3,
    borderLeftColor: '#2563eb',
    backgroundColor: '#f8faff',
  },
  conversacionCardHeader: {
    padding: 12,
    flexDirection: 'row',
    gap: 10,
  },
  conversacionAvatar: {
    flexShrink: 0,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCandidate: {
    backgroundColor: '#2563eb',
  },
  avatarCompany: {
    backgroundColor: '#10b981',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  conversacionCardInfo: {
    flex: 1,
  },
  conversacionNombre: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 4,
  },
  conversacionNombreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  conversacionFecha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  conversacionFechaText: {
    fontSize: 10,
    color: '#94a3b8',
  },
  conversacionVacante: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  conversacionVacanteText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '500',
  },
  conversacionUltimoMensaje: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
  },
  conversacionUltimoMensajeText: {
    fontSize: 13,
    color: '#475569',
    flex: 1,
  },
  conversacionCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f8fafc',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    flexWrap: 'wrap',
    gap: 4,
  },
  noLeidosBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#2563eb',
    borderRadius: 12,
  },
  noLeidosBadgeText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
  },
  conversacionAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  btnChat: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '500',
  },
  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  btnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  btnPrimaryText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default MisConversacionesScreen;
