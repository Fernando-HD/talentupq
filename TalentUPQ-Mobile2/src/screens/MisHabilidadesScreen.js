import React, { useState, useEffect } from 'react';
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
  warning: '#f59e0b',
  danger: '#ef4444',
  dark: '#1e293b',
  gray: '#64748b',
  grayLight: '#f8fafc',
  grayBorder: '#e2e8f0',
  white: '#ffffff',
  text: '#1e293b',
  textLight: '#475569',
};

const MisHabilidadesScreen = ({ navigation }) => {
  // Datos de habilidades técnicas
  const [todasHabilidades, setTodasHabilidades] = useState([]);
  /* Catálogo anterior retirado.
  const habilidadesDemo = [
    { HabilidadID: 1, Nombre: 'Python' },
    { HabilidadID: 2, Nombre: 'JavaScript' },
    { HabilidadID: 3, Nombre: 'React Native' },
    { HabilidadID: 4, Nombre: 'Flask' },
    { HabilidadID: 5, Nombre: 'SQL' },
    { HabilidadID: 6, Nombre: 'Git' },
    { HabilidadID: 7, Nombre: 'Docker' },
    { HabilidadID: 8, Nombre: 'AWS' },
    { HabilidadID: 9, Nombre: 'Node.js' },
    { HabilidadID: 10, Nombre: 'TypeScript' },
  ]; */

  // Datos de competencias organizacionales
  const [todasCompetencias, setTodasCompetencias] = useState([]);
  /* Catálogo anterior retirado.
  const competenciasDemo = [
    { CompetenciaID: 1, Nombre: 'Liderazgo' },
    { CompetenciaID: 2, Nombre: 'Trabajo en equipo' },
    { CompetenciaID: 3, Nombre: 'Comunicación efectiva' },
    { CompetenciaID: 4, Nombre: 'Resolución de problemas' },
    { CompetenciaID: 5, Nombre: 'Pensamiento crítico' },
    { CompetenciaID: 6, Nombre: 'Adaptabilidad' },
    { CompetenciaID: 7, Nombre: 'Gestión del tiempo' },
    { CompetenciaID: 8, Nombre: 'Creatividad' },
  ]; */

  // Habilidades actuales del candidato
  const [habilidadesActuales, setHabilidadesActuales] = useState([]);
  const [competenciasActuales, setCompetenciasActuales] = useState([]);

  useEffect(() => {
    api.get('/perfil/habilidades')
      .then(({ data }) => {
        setTodasHabilidades(data.habilidades);
        setTodasCompetencias(data.competencias);
        setHabilidadesActuales(data.habilidadesActuales);
        setCompetenciasActuales(data.competenciasActuales);
      })
      .catch((error) => Alert.alert('Error', apiMessage(error)));
  }, []);

  // Estados para el contador
  const [techCount, setTechCount] = useState(0);
  const [orgCount, setOrgCount] = useState(0);

  // Actualizar contadores
  useEffect(() => {
    setTechCount(habilidadesActuales.length);
    setOrgCount(competenciasActuales.length);
  }, [habilidadesActuales, competenciasActuales]);

  // Toggle habilidad técnica
  const toggleHabilidad = (habilidadId) => {
    if (habilidadesActuales.includes(habilidadId)) {
      setHabilidadesActuales(habilidadesActuales.filter(id => id !== habilidadId));
    } else {
      setHabilidadesActuales([...habilidadesActuales, habilidadId]);
    }
  };

  // Toggle competencia organizacional
  const toggleCompetencia = (competenciaId) => {
    if (competenciasActuales.includes(competenciaId)) {
      setCompetenciasActuales(competenciasActuales.filter(id => id !== competenciaId));
    } else {
      setCompetenciasActuales([...competenciasActuales, competenciaId]);
    }
  };

  // Guardar habilidades
  const handleGuardar = () => {
    Alert.alert(
      'Guardar habilidades',
      '¿Estás seguro de que quieres guardar los cambios?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Guardar', 
          onPress: async () => {
            try {
              await api.put('/perfil/habilidades', {
                habilidades: habilidadesActuales,
                competencias: competenciasActuales,
              });
              Alert.alert('Éxito', 'Habilidades actualizadas correctamente');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', apiMessage(error));
            }
          }
        },
      ]
    );
  };

  // Obtener nombre de habilidad por ID
  const getHabilidadNombre = (id) => {
    const habilidad = todasHabilidades.find(h => h.HabilidadID === id);
    return habilidad ? habilidad.Nombre : '';
  };

  // Obtener nombre de competencia por ID
  const getCompetenciaNombre = (id) => {
    const competencia = todasCompetencias.find(c => c.CompetenciaID === id);
    return competencia ? competencia.Nombre : '';
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
          <Ionicons name="star-outline" size={20} color="#2563eb" />
          <Text style={styles.headerTitle}>Mis Habilidades</Text>
        </View>
        <TouchableOpacity onPress={handleGuardar} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Guardar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Habilidades Técnicas */}
        <View style={styles.skillsCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderIcon}>
              <Ionicons name="code-outline" size={20} color="#2563eb" />
            </View>
            <Text style={styles.cardTitle}>Habilidades Técnicas</Text>
            <View style={styles.selectedCount}>
              <Text style={styles.selectedCountText}>
                {techCount} seleccionada{techCount !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>

          <View style={styles.cardBody}>
            <View style={styles.skillsGrid}>
              {todasHabilidades.map((habilidad) => (
                <TouchableOpacity
                  key={habilidad.HabilidadID}
                  style={[
                    styles.skillChip,
                    habilidadesActuales.includes(habilidad.HabilidadID) && styles.skillChipActive,
                  ]}
                  onPress={() => toggleHabilidad(habilidad.HabilidadID)}
                >
                  <Ionicons 
                    name="pricetag-outline" 
                    size={14} 
                    color={habilidadesActuales.includes(habilidad.HabilidadID) ? '#ffffff' : '#94a3b8'} 
                  />
                  <Text style={[
                    styles.skillChipText,
                    habilidadesActuales.includes(habilidad.HabilidadID) && styles.skillChipTextActive,
                  ]}>
                    {habilidad.Nombre}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Competencias Organizacionales */}
        <View style={styles.skillsCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderIcon}>
              <Ionicons name="people-outline" size={20} color="#2563eb" />
            </View>
            <Text style={styles.cardTitle}>Competencias Organizacionales</Text>
            <View style={styles.selectedCount}>
              <Text style={styles.selectedCountText}>
                {orgCount} seleccionada{orgCount !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>

          <View style={styles.cardBody}>
            <View style={styles.skillsGrid}>
              {todasCompetencias.map((competencia) => (
                <TouchableOpacity
                  key={competencia.CompetenciaID}
                  style={[
                    styles.skillChip,
                    competenciasActuales.includes(competencia.CompetenciaID) && styles.skillChipActive,
                  ]}
                  onPress={() => toggleCompetencia(competencia.CompetenciaID)}
                >
                  <Ionicons 
                    name="pricetag-outline" 
                    size={14} 
                    color={competenciasActuales.includes(competencia.CompetenciaID) ? '#ffffff' : '#94a3b8'} 
                  />
                  <Text style={[
                    styles.skillChipText,
                    competenciasActuales.includes(competencia.CompetenciaID) && styles.skillChipTextActive,
                  ]}>
                    {competencia.Nombre}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Botón Guardar */}
        <TouchableOpacity style={styles.btnPrimary} onPress={handleGuardar}>
          <Ionicons name="save-outline" size={20} color="white" />
          <Text style={styles.btnPrimaryText}>Guardar Habilidades</Text>
        </TouchableOpacity>

        {/* Vista Previa */}
        <View style={styles.previewCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderIcon}>
              <Ionicons name="eye-outline" size={20} color="#2563eb" />
            </View>
            <Text style={styles.cardTitle}>Vista Previa de tu Perfil</Text>
          </View>

          <View style={styles.cardBody}>
            {(habilidadesActuales.length > 0 || competenciasActuales.length > 0) ? (
              <View style={styles.previewContainer}>
                {/* Habilidades Técnicas */}
                {habilidadesActuales.length > 0 && (
                  <View style={styles.previewSection}>
                    <View style={styles.previewSectionHeader}>
                      <Ionicons name="code-outline" size={16} color="#2563eb" />
                      <Text style={styles.previewSectionTitle}>Habilidades Técnicas</Text>
                      <View style={styles.previewCount}>
                        <Text style={styles.previewCountText}>{habilidadesActuales.length}</Text>
                      </View>
                    </View>
                    <View style={styles.previewGrid}>
                      {habilidadesActuales.map((id) => (
                        <View key={id} style={[styles.previewBadge, styles.techBadge]}>
                          <Ionicons name="pricetag-outline" size={12} color="#2563eb" />
                          <Text style={styles.techBadgeText}>{getHabilidadNombre(id)}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Competencias Organizacionales */}
                {competenciasActuales.length > 0 && (
                  <View style={styles.previewSection}>
                    <View style={styles.previewSectionHeader}>
                      <Ionicons name="people-outline" size={16} color="#065f46" />
                      <Text style={styles.previewSectionTitle}>Competencias Organizacionales</Text>
                      <View style={styles.previewCount}>
                        <Text style={styles.previewCountText}>{competenciasActuales.length}</Text>
                      </View>
                    </View>
                    <View style={styles.previewGrid}>
                      {competenciasActuales.map((id) => (
                        <View key={id} style={[styles.previewBadge, styles.orgBadge]}>
                          <Ionicons name="pricetag-outline" size={12} color="#065f46" />
                          <Text style={styles.orgBadgeText}>{getCompetenciaNombre(id)}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.emptyPreview}>
                <Ionicons name="information-circle-outline" size={32} color="#94a3b8" />
                <Text style={styles.emptyPreviewText}>
                  Aún no has seleccionado habilidades. Selecciona tus habilidades y competencias para verlas aquí.
                </Text>
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
  saveButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 12,
    paddingBottom: 20,
  },
  // Cards
  skillsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
    overflow: 'hidden',
  },
  previewCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginTop: 12,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
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
  selectedCount: {
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  selectedCountText: {
    fontSize: 10,
    color: '#2563eb',
    fontWeight: '500',
  },
  cardBody: {
    padding: 14,
  },
  // Grid de habilidades
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 20,
  },
  skillChipActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  skillChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1e293b',
  },
  skillChipTextActive: {
    color: 'white',
  },
  // Botón Guardar
  btnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 10,
    marginVertical: 8,
  },
  btnPrimaryText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  // Vista Previa
  previewContainer: {
    gap: 12,
  },
  previewSection: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  previewSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  previewSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
  },
  previewCount: {
    backgroundColor: 'white',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
    marginLeft: 'auto',
  },
  previewCountText: {
    fontSize: 10,
    color: '#2563eb',
    fontWeight: '600',
  },
  previewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  previewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  techBadge: {
    backgroundColor: '#dbeafe',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  techBadgeText: {
    fontSize: 11,
    color: '#2563eb',
    fontWeight: '500',
  },
  orgBadge: {
    backgroundColor: '#d1fae5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  orgBadgeText: {
    fontSize: 11,
    color: '#065f46',
    fontWeight: '500',
  },
  // Empty Preview
  emptyPreview: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
  },
  emptyPreviewText: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 6,
  },
});

export default MisHabilidadesScreen;
