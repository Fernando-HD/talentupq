import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StatusBar,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
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

const MisPostulacionesScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [postulaciones, setPostulaciones] = useState([]);
  /* Datos de demostración eliminados; ahora se consultan desde PostgreSQL.
  const postulacionesDemo = [
    {
      id: 1,
      vacante: {
        id: 1,
        puesto: 'Desarrollador Full Stack',
        empresa: 'Tech Solutions',
      },
      postulacion: {
        id: 1,
        fecha: '2026-07-01',
        estatus: 'aceptado',
        comentarios: 'Excelente perfil, nos encantó tu experiencia en React Native. Te esperamos en nuestras oficinas.',
      },
    },
    {
      id: 2,
      vacante: {
        id: 2,
        puesto: 'Ingeniero de Datos',
        empresa: 'Data Corp',
      },
      postulacion: {
        id: 2,
        fecha: '2026-06-28',
        estatus: 'pendiente',
        comentarios: null,
      },
    },
    {
      id: 3,
      vacante: {
        id: 3,
        puesto: 'Frontend React',
        empresa: 'Innovatech',
      },
      postulacion: {
        id: 3,
        fecha: '2026-06-20',
        estatus: 'rechazado',
        comentarios: 'Gracias por tu interés, pero hemos seleccionado a otro candidato para esta posición.',
      },
    },
  ]; */

  const [filteredPostulaciones, setFilteredPostulaciones] = useState(postulaciones);

  useFocusEffect(useCallback(() => {
    api.get('/postulaciones')
      .then(({ data }) => {
        const normalized = data.map((item) => ({
          id: item.PostulacionID,
          vacante: {
            id: item.VacanteID,
            puesto: item.Puesto,
            empresa: item.EmpresaNombre,
          },
          postulacion: {
            id: item.PostulacionID,
            fecha: item.FechaPostulacion?.slice(0, 10),
            estatus: item.Estatus,
            comentarios: item.Comentarios,
          },
        }));
        setPostulaciones(normalized);
        setFilteredPostulaciones(normalized);
      })
      .catch((error) => Alert.alert('Error', apiMessage(error)));
  }, []));

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text.trim() === '') {
      setFilteredPostulaciones(postulaciones);
    } else {
      const filtered = postulaciones.filter(
        (post) =>
          post.vacante.puesto.toLowerCase().includes(text.toLowerCase()) ||
          post.vacante.empresa.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredPostulaciones(filtered);
    }
  };

  const handleCancelar = (postulacionId) => {
    Alert.alert(
      'Cancelar postulación',
      '¿Estás seguro de que quieres cancelar esta postulación?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/postulaciones/${postulacionId}`);
              const nuevasPostulaciones = postulaciones.filter(
                (post) => post.postulacion.id !== postulacionId
              );
              setPostulaciones(nuevasPostulaciones);
              setFilteredPostulaciones(nuevasPostulaciones);
              Alert.alert('Éxito', 'Postulación cancelada correctamente');
            } catch (error) {
              Alert.alert('Error', apiMessage(error));
            }
          },
        },
      ]
    );
  };

  const handleVerVacante = (vacanteId) => {
    navigation.navigate('DetalleVacante', { vacanteId });
  };

  const getBadgeStyle = (estatus) => {
    switch (estatus.toLowerCase()) {
      case 'aceptado':
        return styles.badgeSuccess;
      case 'rechazado':
        return styles.badgeDanger;
      default:
        return styles.badgePrimary;
    }
  };

  const getBadgeTextStyle = (estatus) => {
    switch (estatus.toLowerCase()) {
      case 'aceptado':
        return styles.badgeTextSuccess;
      case 'rechazado':
        return styles.badgeTextDanger;
      default:
        return styles.badgeTextPrimary;
    }
  };

  const getBadgeIcon = (estatus) => {
    switch (estatus.toLowerCase()) {
      case 'aceptado':
        return 'checkmark-circle-outline';
      case 'rechazado':
        return 'close-circle-outline';
      default:
        return 'time-outline';
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Ionicons name="document-text-outline" size={20} color="#2563eb" />
          <Text style={styles.headerTitle}>Mis Postulaciones</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.content}>
        {/* Barra de búsqueda */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={20} color="#94a3b8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por puesto o empresa..."
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={handleSearch}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => handleSearch('')}>
                <Ionicons name="close-circle" size={20} color="#94a3b8" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {filteredPostulaciones.length > 0 ? (
            <View style={styles.postulacionesList}>
              {filteredPostulaciones.map((post) => (
                <View key={post.id} style={styles.postulacionCard}>
                  <View style={styles.postulacionHeader}>
                    <View style={styles.postulacionInfo}>
                      <Text style={styles.postulacionPuesto}>{post.vacante.puesto}</Text>
                      <View style={styles.empresaContainer}>
                        <Ionicons name="business-outline" size={14} color="#64748b" />
                        <Text style={styles.postulacionEmpresa}>{post.vacante.empresa}</Text>
                      </View>
                    </View>
                    <View style={[styles.badge, getBadgeStyle(post.postulacion.estatus)]}>
                      <Ionicons 
                        name={getBadgeIcon(post.postulacion.estatus)} 
                        size={12} 
                        color={post.postulacion.estatus === 'aceptado' ? '#065f46' : 
                               post.postulacion.estatus === 'rechazado' ? '#991b1b' : '#1e40af'} 
                      />
                      <Text style={[styles.badgeText, getBadgeTextStyle(post.postulacion.estatus)]}>
                        {capitalize(post.postulacion.estatus)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.postulacionBody}>
                    <View style={styles.fechaContainer}>
                      <Ionicons name="calendar-outline" size={14} color="#64748b" />
                      <Text style={styles.postulacionFecha}>
                        Postulado el {formatDate(post.postulacion.fecha)}
                      </Text>
                    </View>

                    {post.postulacion.comentarios && (
                      <View style={styles.comentarioContainer}>
                        <View style={styles.comentarioHeader}>
                          <Ionicons name="chatbubble-outline" size={14} color="#2563eb" />
                          <Text style={styles.comentarioTitle}>Comentarios:</Text>
                        </View>
                        <Text style={styles.comentarioText}>{post.postulacion.comentarios}</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.postulacionFooter}>
                    <TouchableOpacity 
                      style={styles.btnView}
                      onPress={() => handleVerVacante(post.vacante.id)}
                    >
                      <Ionicons name="eye-outline" size={14} color="#2563eb" />
                      <Text style={styles.btnViewText}>Ver vacante</Text>
                    </TouchableOpacity>

                    {post.postulacion.estatus === 'pendiente' && (
                      <TouchableOpacity 
                        style={styles.btnCancel}
                        onPress={() => handleCancelar(post.postulacion.id)}
                      >
                        <Ionicons name="close-outline" size={14} color="#ef4444" />
                        <Text style={styles.btnCancelText}>Cancelar</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="document-text-outline" size={48} color="#94a3b8" />
              </View>
              <Text style={styles.emptyTitle}>No has realizado ninguna postulación aún</Text>
              <Text style={styles.emptyDescription}>
                Comienza a buscar vacantes y postúlate a las que coincidan con tu perfil.
              </Text>
              <TouchableOpacity 
                style={styles.btnPrimary}
                onPress={() => navigation.navigate('Vacantes')}
              >
                <Ionicons name="search-outline" size={18} color="white" />
                <Text style={styles.btnPrimaryText}>Buscar vacantes</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 12,
  },
  // Search
  searchContainer: {
    paddingTop: 12,
    paddingBottom: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1e293b',
    paddingVertical: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  // Postulaciones
  postulacionesList: {
    gap: 12,
  },
  postulacionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  postulacionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#fafcff',
  },
  postulacionInfo: {
    flex: 1,
    marginRight: 8,
  },
  postulacionPuesto: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  empresaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  postulacionEmpresa: {
    fontSize: 13,
    color: '#64748b',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  badgePrimary: {
    backgroundColor: '#dbeafe',
  },
  badgeSuccess: {
    backgroundColor: '#d1fae5',
  },
  badgeDanger: {
    backgroundColor: '#fee2e2',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  badgeTextPrimary: {
    color: '#1e40af',
  },
  badgeTextSuccess: {
    color: '#065f46',
  },
  badgeTextDanger: {
    color: '#991b1b',
  },
  postulacionBody: {
    padding: 14,
  },
  fechaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  postulacionFecha: {
    fontSize: 13,
    color: '#64748b',
  },
  comentarioContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 10,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  comentarioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  comentarioTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e293b',
  },
  comentarioText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
  postulacionFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    padding: 10,
    backgroundColor: '#f8fafc',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  btnView: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
  },
  btnViewText: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '500',
  },
  btnCancel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
  },
  btnCancelText: {
    fontSize: 12,
    color: '#ef4444',
    fontWeight: '500',
  },
  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 20,
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

export default MisPostulacionesScreen;
