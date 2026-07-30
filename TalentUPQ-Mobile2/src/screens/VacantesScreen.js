import React, { useState, useEffect } from 'react';
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
  Modal,
  FlatList,
  ActivityIndicator,
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

const VacantesScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedModalidad, setSelectedModalidad] = useState('');
  const [selectedGrado, setSelectedGrado] = useState('');
  const [vacantes, setVacantes] = useState([]);
  const [loading, setLoading] = useState(true);
  /* Datos anteriores eliminados: las vacantes provienen de PostgreSQL.
  const vacantesDemo = [
    {
      id: 1,
      puesto: 'Desarrollador Full Stack',
      empresa_nombre: 'Tech Solutions',
      modalidad: 'remoto',
      grado_estudios: 'Licenciatura',
      ubicacion: 'Querétaro, Qro.',
      tipo_contrato: 'Tiempo completo',
      salario: '$35,000 - $45,000 MXN',
      resumen: 'Buscamos un desarrollador Full Stack con experiencia en React Native y Node.js para unirse a nuestro equipo de innovación.',
      habilidades_requeridas: ['React Native', 'Node.js', 'TypeScript', 'AWS', 'Docker', 'Git', 'PostgreSQL'],
      fecha_publicacion: '2026-07-01',
    },
    {
      id: 2,
      puesto: 'Ingeniero de Datos',
      empresa_nombre: 'Data Corp',
      modalidad: 'presencial',
      grado_estudios: 'Maestría',
      ubicacion: 'CDMX',
      tipo_contrato: 'Tiempo completo',
      salario: '$40,000 - $55,000 MXN',
      resumen: 'Ingeniero de datos con experiencia en pipelines de datos, ETL y herramientas cloud.',
      habilidades_requeridas: ['Python', 'SQL', 'Spark', 'Airflow', 'AWS', 'ETL', 'Redshift'],
      fecha_publicacion: '2026-06-28',
    },
    {
      id: 3,
      puesto: 'Frontend React',
      empresa_nombre: 'Innovatech',
      modalidad: 'hibrido',
      grado_estudios: 'Licenciatura',
      ubicacion: 'Guadalajara, Jal.',
      tipo_contrato: 'Tiempo completo',
      salario: '$30,000 - $40,000 MXN',
      resumen: 'Desarrollador Frontend con experiencia en React, TypeScript y diseño de interfaces.',
      habilidades_requeridas: ['React', 'TypeScript', 'CSS', 'Tailwind', 'Redux', 'Jest'],
      fecha_publicacion: '2026-06-20',
    },
    {
      id: 4,
      puesto: 'DevOps Engineer',
      empresa_nombre: 'Cloud Solutions',
      modalidad: 'remoto',
      grado_estudios: 'Licenciatura',
      ubicacion: 'Remoto',
      tipo_contrato: 'Tiempo completo',
      salario: '$50,000 - $65,000 MXN',
      resumen: 'Ingeniero DevOps con experiencia en CI/CD, Kubernetes y automatización de infraestructura.',
      habilidades_requeridas: ['Kubernetes', 'Docker', 'Jenkins', 'AWS', 'Terraform', 'Linux', 'Ansible'],
      fecha_publicacion: '2026-06-15',
    },
    {
      id: 5,
      puesto: 'UX/UI Designer',
      empresa_nombre: 'Design Studio',
      modalidad: 'hibrido',
      grado_estudios: 'Licenciatura',
      ubicacion: 'Monterrey, NL',
      tipo_contrato: 'Tiempo completo',
      salario: '$28,000 - $38,000 MXN',
      resumen: 'Diseñador UX/UI con experiencia en Figma, investigación de usuarios y prototipado.',
      habilidades_requeridas: ['Figma', 'Sketch', 'Adobe XD', 'UX Research', 'Prototyping', 'Design Systems'],
      fecha_publicacion: '2026-06-10',
    },
  ]; */

  const [filteredVacantes, setFilteredVacantes] = useState(vacantes);
  const [filtroActivo, setFiltroActivo] = useState(false);

  useEffect(() => {
    const cargarVacantes = async () => {
      try {
        const { data } = await api.get('/vacantes');
        const normalized = data.map((item) => ({
          id: item.VacanteID,
          puesto: item.Puesto,
          empresa_nombre: item.EmpresaNombre,
          modalidad: (item.Modalidad || '').toLowerCase().replace('í', 'i'),
          grado_estudios: item.GradoEstudios || '',
          ubicacion: item.Ubicacion || 'Por definir',
          tipo_contrato: item.TipoContrato || '',
          salario: item.Salario || 'Por definir',
          resumen: item.Resumen || '',
          habilidades_requeridas: [],
          fecha_publicacion: item.FechaPublicacion?.slice(0, 10) || '',
        }));
        setVacantes(normalized);
      } catch (error) {
        Alert.alert('No fue posible cargar las vacantes', apiMessage(error));
      } finally {
        setLoading(false);
      }
    };
    cargarVacantes();
  }, []);

  // Opciones para filtros
  const modalidades = [
    { label: 'Presencial', value: 'presencial' },
    { label: 'Remoto', value: 'remoto' },
    { label: 'Híbrido', value: 'hibrido' },
  ];

  const grados = [
    { label: 'Licenciatura', value: 'Licenciatura' },
    { label: 'Maestría', value: 'Maestría' },
    { label: 'Doctorado', value: 'Doctorado' },
    { label: 'Técnico', value: 'Técnico' },
    { label: 'Bachillerato', value: 'Bachillerato' },
  ];

  useEffect(() => {
    aplicarFiltros();
  }, [searchQuery, selectedModalidad, selectedGrado, vacantes]);

  const aplicarFiltros = () => {
    let filtered = vacantes;

    // Búsqueda por texto
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (v) =>
          v.puesto.toLowerCase().includes(query) ||
          v.empresa_nombre.toLowerCase().includes(query) ||
          v.ubicacion.toLowerCase().includes(query)
      );
    }

    // Filtro por modalidad
    if (selectedModalidad) {
      filtered = filtered.filter((v) => v.modalidad === selectedModalidad);
    }

    // Filtro por grado de estudios
    if (selectedGrado) {
      filtered = filtered.filter((v) => v.grado_estudios === selectedGrado);
    }

    setFilteredVacantes(filtered);
    setFiltroActivo(!!selectedModalidad || !!selectedGrado || searchQuery.trim() !== '');
  };

  const limpiarFiltros = () => {
    setSearchQuery('');
    setSelectedModalidad('');
    setSelectedGrado('');
    setFilterModalVisible(false);
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

  const renderVacante = ({ item }) => (
    <View style={styles.vacanteCard}>
      {/* Header */}
      <View style={styles.vacanteHeader}>
        <View style={styles.vacanteHeaderLeft}>
          <View style={styles.empresaAvatar}>
            <Ionicons name="business-outline" size={20} color="#2563eb" />
          </View>
          <View style={styles.vacanteTitulo}>
            <Text style={styles.vacantePuesto}>{item.puesto}</Text>
            <View style={styles.empresaNombre}>
              <Ionicons name="business-outline" size={12} color="#64748b" />
              <Text style={styles.empresaNombreText}>{item.empresa_nombre}</Text>
            </View>
          </View>
        </View>
        <View style={[styles.modalidadBadge, { backgroundColor: getModalidadBg(item.modalidad) }]}>
          <Ionicons name={getModalidadIcon(item.modalidad)} size={12} color={getModalidadColor(item.modalidad)} />
          <Text style={[styles.modalidadBadgeText, { color: getModalidadColor(item.modalidad) }]}>
            {capitalize(item.modalidad)}
          </Text>
        </View>
      </View>

      {/* Body */}
      <View style={styles.vacanteBody}>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Ionicons name="school-outline" size={14} color="#2563eb" />
            <Text style={styles.infoItemText}>{item.grado_estudios}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="location-outline" size={14} color="#2563eb" />
            <Text style={styles.infoItemText}>{item.ubicacion}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="briefcase-outline" size={14} color="#2563eb" />
            <Text style={styles.infoItemText}>{item.tipo_contrato}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="cash-outline" size={14} color="#2563eb" />
            <Text style={styles.infoItemText}>{item.salario}</Text>
          </View>
        </View>

        <View style={styles.descripcionContainer}>
          <Text style={styles.descripcionText} numberOfLines={3}>
            {item.resumen}
          </Text>
        </View>

        {item.habilidades_requeridas && item.habilidades_requeridas.length > 0 && (
          <View style={styles.skillsContainer}>
            <View style={styles.skillsHeader}>
              <Ionicons name="construct-outline" size={14} color="#64748b" />
              <Text style={styles.skillsHeaderText}>Habilidades requeridas</Text>
            </View>
            <View style={styles.skillsList}>
              {item.habilidades_requeridas.slice(0, 6).map((skill, idx) => (
                <View key={idx} style={styles.skillTag}>
                  <Text style={styles.skillTagText}>{skill}</Text>
                </View>
              ))}
              {item.habilidades_requeridas.length > 6 && (
                <View style={[styles.skillTag, styles.skillTagMore]}>
                  <Text style={styles.skillTagTextMore}>+{item.habilidades_requeridas.length - 6}</Text>
                </View>
              )}
            </View>
          </View>
        )}
      </View>

      {/* Footer */}
      <View style={styles.vacanteFooter}>
        <View style={styles.postDate}>
          <Ionicons name="calendar-outline" size={14} color="#64748b" />
          <Text style={styles.postDateText}>Publicado: {formatDate(item.fecha_publicacion)}</Text>
        </View>
         <TouchableOpacity 
  style={styles.btnDetails}
  onPress={() => navigation.navigate('DetalleVacante', { vacanteId: item.id })}
>
  <Text style={styles.btnDetailsText}>Ver detalles</Text>
  <Ionicons name="arrow-forward-outline" size={16} color="white" />
</TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Ionicons name="briefcase-outline" size={20} color="#2563eb" />
          <Text style={styles.headerTitle}>Vacantes Disponibles</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por puesto, empresa o ubicación..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filtros */}
      <View style={styles.filtersSection}>
        <TouchableOpacity style={styles.filterButton} onPress={() => setFilterModalVisible(true)}>
          <Ionicons name="options-outline" size={18} color="#2563eb" />
          <Text style={styles.filterButtonText}>Filtrar</Text>
        </TouchableOpacity>

        {filtroActivo && (
          <TouchableOpacity style={styles.clearFiltersButton} onPress={limpiarFiltros}>
            <Ionicons name="close-outline" size={16} color="#ef4444" />
            <Text style={styles.clearFiltersText}>Limpiar</Text>
          </TouchableOpacity>
        )}

        <View style={styles.filterStats}>
          <View style={styles.statsBadge}>
            <Text style={styles.statsBadgeText}>{filteredVacantes.length}</Text>
          </View>
          <Text style={styles.statsText}>vacantes encontradas</Text>
        </View>
      </View>

      {/* Filtros activos */}
      {(selectedModalidad || selectedGrado) && (
        <View style={styles.activeFiltersContainer}>
          {selectedModalidad && (
            <View style={styles.activeFilter}>
              <Text style={styles.activeFilterLabel}>Modalidad:</Text>
              <Text style={styles.activeFilterValue}>{capitalize(selectedModalidad)}</Text>
              <TouchableOpacity onPress={() => setSelectedModalidad('')}>
                <Ionicons name="close-circle" size={16} color="#64748b" />
              </TouchableOpacity>
            </View>
          )}
          {selectedGrado && (
            <View style={styles.activeFilter}>
              <Text style={styles.activeFilterLabel}>Grado:</Text>
              <Text style={styles.activeFilterValue}>{selectedGrado}</Text>
              <TouchableOpacity onPress={() => setSelectedGrado('')}>
                <Ionicons name="close-circle" size={16} color="#64748b" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Lista de Vacantes */}
      {loading ? (
        <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }} />
      ) : filteredVacantes.length > 0 ? (
        <FlatList
          data={filteredVacantes}
          renderItem={renderVacante}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.vacantesList}
        />
      ) : (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="briefcase-outline" size={48} color="#94a3b8" />
          </View>
          <Text style={styles.emptyTitle}>No hay vacantes disponibles</Text>
          <Text style={styles.emptyDescription}>
            {filtroActivo 
              ? 'No encontramos vacantes que coincidan con tu búsqueda o filtros actuales.'
              : 'No hay vacantes disponibles en este momento.'}
          </Text>
          {filtroActivo && (
            <TouchableOpacity style={styles.btnPrimary} onPress={limpiarFiltros}>
              <Ionicons name="refresh-outline" size={18} color="white" />
              <Text style={styles.btnPrimaryText}>Limpiar filtros</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Modal de Filtros */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={filterModalVisible}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtrar vacantes</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Ionicons name="close-outline" size={24} color="#1e293b" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalSectionTitle}>
                <Ionicons name="business-outline" size={16} color="#2563eb" /> Modalidad
              </Text>
              <View style={styles.modalOptions}>
                <TouchableOpacity
                  style={[styles.modalOption, selectedModalidad === '' && styles.modalOptionActive]}
                  onPress={() => setSelectedModalidad('')}
                >
                  <Text style={[styles.modalOptionText, selectedModalidad === '' && styles.modalOptionTextActive]}>
                    Todas
                  </Text>
                </TouchableOpacity>
                {modalidades.map((item) => (
                  <TouchableOpacity
                    key={item.value}
                    style={[styles.modalOption, selectedModalidad === item.value && styles.modalOptionActive]}
                    onPress={() => setSelectedModalidad(item.value)}
                  >
                    <Text style={[styles.modalOptionText, selectedModalidad === item.value && styles.modalOptionTextActive]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.modalSectionTitle, { marginTop: 16 }]}>
                <Ionicons name="school-outline" size={16} color="#2563eb" /> Grado de Estudios
              </Text>
              <View style={styles.modalOptions}>
                <TouchableOpacity
                  style={[styles.modalOption, selectedGrado === '' && styles.modalOptionActive]}
                  onPress={() => setSelectedGrado('')}
                >
                  <Text style={[styles.modalOptionText, selectedGrado === '' && styles.modalOptionTextActive]}>
                    Todos
                  </Text>
                </TouchableOpacity>
                {grados.map((item) => (
                  <TouchableOpacity
                    key={item.value}
                    style={[styles.modalOption, selectedGrado === item.value && styles.modalOptionActive]}
                    onPress={() => setSelectedGrado(item.value)}
                  >
                    <Text style={[styles.modalOptionText, selectedGrado === item.value && styles.modalOptionTextActive]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.modalBtnClear} onPress={limpiarFiltros}>
                <Text style={styles.modalBtnClearText}>Limpiar todo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnApply} onPress={() => setFilterModalVisible(false)}>
                <Text style={styles.modalBtnApplyText}>Aplicar filtros</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  searchContainer: {
    paddingHorizontal: 12,
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
  filtersSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    flexWrap: 'wrap',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#2563eb',
  },
  clearFiltersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  clearFiltersText: {
    fontSize: 12,
    color: '#ef4444',
    fontWeight: '500',
  },
  filterStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 'auto',
  },
  statsBadge: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 12,
  },
  statsBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  statsText: {
    fontSize: 11,
    color: '#64748b',
  },
  activeFiltersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  activeFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  activeFilterLabel: {
    fontSize: 10,
    color: '#64748b',
  },
  activeFilterValue: {
    fontSize: 11,
    fontWeight: '500',
    color: '#1e293b',
  },
  vacantesList: {
    padding: 12,
    paddingBottom: 20,
    gap: 12,
  },
  vacanteCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    marginBottom: 12,
  },
  vacanteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#fafcff',
    gap: 8,
  },
  vacanteHeaderLeft: {
    flexDirection: 'row',
    gap: 10,
    flex: 1,
  },
  empresaAvatar: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vacanteTitulo: {
    flex: 1,
  },
  vacantePuesto: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  empresaNombre: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  empresaNombreText: {
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
    fontSize: 10,
    fontWeight: '600',
  },
  vacanteBody: {
    padding: 14,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    width: '48%',
  },
  infoItemText: {
    fontSize: 12,
    color: '#475569',
  },
  descripcionContainer: {
    marginVertical: 6,
  },
  descripcionText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
  skillsContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  skillsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  skillsHeaderText: {
    fontSize: 11,
    color: '#64748b',
  },
  skillsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  skillTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  skillTagText: {
    fontSize: 10,
    color: '#1e293b',
  },
  skillTagMore: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  skillTagTextMore: {
    color: 'white',
    fontSize: 10,
  },
  vacanteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    flexWrap: 'wrap',
    gap: 8,
  },
  postDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  postDateText: {
    fontSize: 11,
    color: '#64748b',
  },
  btnDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2563eb',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },
  btnDetailsText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  // Empty State
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
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
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1e293b',
  },
  modalBody: {
    padding: 16,
  },
  modalSectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 8,
  },
  modalOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  modalOption: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: 'white',
  },
  modalOptionActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  modalOptionText: {
    fontSize: 13,
    color: '#1e293b',
  },
  modalOptionTextActive: {
    color: 'white',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  modalBtnClear: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  modalBtnClearText: {
    fontSize: 14,
    color: '#64748b',
  },
  modalBtnApply: {
    flex: 2,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#2563eb',
    alignItems: 'center',
  },
  modalBtnApplyText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
  },
});

export default VacantesScreen;
