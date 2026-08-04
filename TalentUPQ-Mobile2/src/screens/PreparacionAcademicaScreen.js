import React, { useEffect, useState } from 'react';
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
import api, { apiMessage } from '../services/api';
import DateField, { toISODate } from '../components/DateField';
import { clean, isDate, isFutureDate, maxLength } from '../utils/validation';

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

const PreparacionAcademicaScreen = ({ navigation }) => {
  const [preparaciones, setPreparaciones] = useState([]);
  /* Ejemplos locales retirados.
  const preparacionesDemo = [
    {
      id: 1,
      Grado: 'Licenciatura',
      Institucion: 'Universidad Autónoma de Querétaro',
      Cedula: '1234567890',
      Estatus: 'Completo',
      Pais: 'México',
      FechaInicio: '2018-08-15',
      FechaFin: '2022-06-30',
    },
    {
      id: 2,
      Grado: 'Maestría',
      Institucion: 'Tecnológico de Monterrey',
      Cedula: '',
      Estatus: 'En curso',
      Pais: 'México',
      FechaInicio: '2023-01-10',
      FechaFin: null,
    },
  ]; */

  const cargarPreparaciones = async () => {
    try {
      const { data } = await api.get('/preparaciones');
      const rows = Array.isArray(data) ? data : [];
      setPreparaciones(rows.map((item, index) => ({
        ...item,
        id: item.PreparacionID ?? `preparacion-${index}`,
        Grado: String(item.Grado ?? 'Sin grado'),
        Institucion: String(item.Institucion ?? 'Institución no especificada'),
        Cedula: String(item.Cedula ?? ''),
        Estatus: String(item.Estatus ?? 'Incompleto'),
        Pais: String(item.Pais ?? ''),
      })));
    } catch (error) {
      Alert.alert('Error', apiMessage(error));
    }
  };

  useEffect(() => { cargarPreparaciones(); }, []);

  const [modoEdicion, setModoEdicion] = useState(false);
  const [preparacionEditando, setPreparacionEditando] = useState(null);
  const [formData, setFormData] = useState({
    grado: '',
    institucion: '',
    cedula: '',
    estatus: '',
    pais: '',
    fechaInicio: '',
    fechaFin: '',
  });

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const nivelesEstudios = ['Primaria', 'Secundaria', 'Bachillerato', 'Licenciatura', 'Maestría', 'Doctorado'];
  const estatusOptions = ['Completo', 'Incompleto', 'En curso'];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAgregar = () => {
    setModoEdicion(false);
    setPreparacionEditando(null);
    setFormData({
      grado: '',
      institucion: '',
      cedula: '',
      estatus: '',
      pais: '',
      fechaInicio: '',
      fechaFin: '',
    });
    setMostrarFormulario(true);
  };

  const handleEditar = (index) => {
    const prep = preparaciones[index];
    setModoEdicion(true);
    setPreparacionEditando(index);
    setFormData({
      grado: prep.Grado,
      institucion: prep.Institucion,
      cedula: prep.Cedula || '',
      estatus: prep.Estatus,
      pais: prep.Pais,
      fechaInicio: toISODate(prep.FechaInicio),
      fechaFin: toISODate(prep.FechaFin),
    });
    setMostrarFormulario(true);
  };

  const handleCancelar = () => {
    setMostrarFormulario(false);
    setModoEdicion(false);
    setPreparacionEditando(null);
  };

  const handleGuardar = async () => {
    if (guardando) return;
    // Validaciones
    if (!formData.grado || !formData.institucion || !formData.estatus || !formData.pais || !formData.fechaInicio) {
      Alert.alert('Campos incompletos', 'Por favor completa todos los campos obligatorios (*)');
      return;
    }

    if (!isDate(formData.fechaInicio) || isFutureDate(formData.fechaInicio) || (formData.fechaFin && !isDate(formData.fechaFin))) {
      return Alert.alert('Error de fechas', 'Usa fechas válidas en formato AAAA-MM-DD; el inicio no puede estar en el futuro.');
    }

    if (formData.fechaFin && formData.fechaInicio > formData.fechaFin) {
      Alert.alert('Error de fechas', 'La fecha de finalización no puede ser anterior a la fecha de inicio');
      return;
    }
    if (formData.estatus === 'Completo' && (!formData.fechaFin || isFutureDate(formData.fechaFin))) {
      return Alert.alert('Error de fechas', 'Los estudios completos requieren una fecha de finalización no posterior a hoy.');
    }
    if (formData.estatus === 'Incompleto' && formData.fechaFin && isFutureDate(formData.fechaFin)) {
      return Alert.alert('Error de fechas', 'La fecha de finalización de estudios incompletos no puede estar en el futuro.');
    }
    if (clean(formData.cedula) && !/^[A-Za-z0-9-]{4,30}$/.test(clean(formData.cedula))) {
      return Alert.alert('Cédula inválida', 'La cédula sólo puede contener letras, números y guiones (4 a 30 caracteres).');
    }
    if (!maxLength(formData.grado, 100) || !maxLength(formData.institucion, 150) || !maxLength(formData.pais, 80)) {
      return Alert.alert('Datos demasiado largos', 'Grado, institución o país exceden el tamaño permitido.');
    }

    const nuevaPreparacion = {
      id: modoEdicion ? preparaciones[preparacionEditando].id : Date.now(),
      Grado: clean(formData.grado),
      Institucion: clean(formData.institucion),
      Cedula: formData.cedula,
      Estatus: formData.estatus,
      Pais: formData.pais,
      FechaInicio: formData.fechaInicio,
      FechaFin: formData.fechaFin || null,
    };

    setGuardando(true);
    try {
      if (modoEdicion) await api.put(`/preparaciones/${nuevaPreparacion.id}`, nuevaPreparacion);
      else await api.post('/preparaciones', nuevaPreparacion);
      await cargarPreparaciones();
      Alert.alert('Éxito', modoEdicion ? 'Preparación académica actualizada correctamente' : 'Preparación académica agregada correctamente');
      handleCancelar();
    } catch (error) {
      Alert.alert('Error', apiMessage(error));
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = (index) => {
    Alert.alert(
      'Eliminar registro',
      '¿Estás seguro de que quieres eliminar esta preparación académica?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/preparaciones/${preparaciones[index].id}`);
              await cargarPreparaciones();
              Alert.alert('Eliminado', 'El registro ha sido eliminado');
            } catch (error) {
              Alert.alert('Error', apiMessage(error));
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const normalized = toISODate(dateString);
    if (!normalized) return 'Fecha no disponible';
    const date = new Date(`${normalized}T12:00:00`);
    return date.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getStatusStyle = (estatus) => {
    switch (String(estatus || '').toLowerCase()) {
      case 'completo':
        return styles.statusCompleto;
      case 'en curso':
        return styles.statusEnCurso;
      case 'incompleto':
        return styles.statusIncompleto;
      default:
        return styles.statusDefault;
    }
  };

  const getStatusTextStyle = (estatus) => {
    switch (String(estatus || '').toLowerCase()) {
      case 'completo':
        return styles.statusTextCompleto;
      case 'en curso':
        return styles.statusTextEnCurso;
      case 'incompleto':
        return styles.statusTextIncompleto;
      default:
        return styles.statusTextDefault;
    }
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
          <Ionicons name="school-outline" size={20} color="#2563eb" />
          <Text style={styles.headerTitle}>Preparación Académica</Text>
        </View>
        <TouchableOpacity onPress={handleAgregar} style={styles.addButton}>
          <Ionicons name="add-circle-outline" size={28} color="#2563eb" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Formulario */}
        {mostrarFormulario && (
          <View style={styles.formCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderIcon}>
                <Ionicons 
                  name={modoEdicion ? 'create-outline' : 'add-circle-outline'} 
                  size={20} 
                  color="#2563eb" 
                />
              </View>
              <Text style={styles.cardTitle}>
                {modoEdicion ? 'Editar' : 'Agregar'} Preparación Académica
              </Text>
            </View>

            <View style={styles.cardBody}>
              <View style={styles.formGrid}>
                <View style={styles.formField}>
                  <Text style={styles.fieldLabel}>
                    <Ionicons name="school-outline" size={14} color="#2563eb" /> Nivel de Estudios *
                  </Text>
                  <View style={styles.optionsContainer}>
                    {nivelesEstudios.slice(0, 4).map((nivel) => (
                      <TouchableOpacity
                        key={nivel}
                        style={[
                          styles.optionChip,
                          formData.grado === nivel && styles.optionChipActive,
                        ]}
                        onPress={() => handleInputChange('grado', nivel)}
                      >
                        <Text style={[
                          styles.optionChipText,
                          formData.grado === nivel && styles.optionChipTextActive,
                        ]}>
                          {nivel}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <View style={styles.optionsContainer}>
                    {nivelesEstudios.slice(4).map((nivel) => (
                      <TouchableOpacity
                        key={nivel}
                        style={[
                          styles.optionChip,
                          formData.grado === nivel && styles.optionChipActive,
                        ]}
                        onPress={() => handleInputChange('grado', nivel)}
                      >
                        <Text style={[
                          styles.optionChipText,
                          formData.grado === nivel && styles.optionChipTextActive,
                        ]}>
                          {nivel}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.formField}>
                  <Text style={styles.fieldLabel}>
                    <Ionicons name="business-outline" size={14} color="#2563eb" /> Institución *
                  </Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={formData.institucion}
                    onChangeText={(text) => handleInputChange('institucion', text)}
                    placeholder="Nombre de la institución"
                    placeholderTextColor="#94a3b8"
                  />
                </View>
              </View>

              <View style={styles.formGrid}>
                <View style={styles.formField}>
                  <Text style={styles.fieldLabel}>
                    <Ionicons name="card-outline" size={14} color="#2563eb" /> Cédula Profesional
                  </Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={formData.cedula}
                    onChangeText={(text) => handleInputChange('cedula', text)}
                    placeholder="Número de cédula (si aplica)"
                    placeholderTextColor="#94a3b8"
                  />
                </View>

                <View style={styles.formField}>
                  <Text style={styles.fieldLabel}>
                    <Ionicons name="stats-chart-outline" size={14} color="#2563eb" /> Estatus *
                  </Text>
                  <View style={styles.optionsContainer}>
                    {estatusOptions.map((estatus) => (
                      <TouchableOpacity
                        key={estatus}
                        style={[
                          styles.optionChip,
                          formData.estatus === estatus && styles.optionChipActive,
                        ]}
                        onPress={() => handleInputChange('estatus', estatus)}
                      >
                        <Text style={[
                          styles.optionChipText,
                          formData.estatus === estatus && styles.optionChipTextActive,
                        ]}>
                          {estatus}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <View style={styles.formGrid}>
                <View style={styles.formField}>
                  <Text style={styles.fieldLabel}>
                    <Ionicons name="globe-outline" size={14} color="#2563eb" /> País *
                  </Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={formData.pais}
                    onChangeText={(text) => handleInputChange('pais', text)}
                    placeholder="País donde estudiaste"
                    placeholderTextColor="#94a3b8"
                  />
                </View>
              </View>

              <View style={styles.formGrid}>
                <View style={styles.formField}>
                  <Text style={styles.fieldLabel}>
                    <Ionicons name="calendar-outline" size={14} color="#2563eb" /> Fecha Inicio *
                  </Text>
                  <DateField
                    style={styles.fieldInput}
                    value={formData.fechaInicio}
                    onChange={(value) => handleInputChange('fechaInicio', value)}
                    maximumDate={new Date()}
                  />
                </View>

                <View style={styles.formField}>
                  <Text style={styles.fieldLabel}>
                    <Ionicons name="calendar-outline" size={14} color="#2563eb" /> Fecha Finalización
                  </Text>
                  <DateField
                    style={styles.fieldInput}
                    value={formData.fechaFin}
                    onChange={(value) => handleInputChange('fechaFin', value)}
                    placeholder="En curso / seleccionar fecha"
                    minimumDate={formData.fechaInicio ? new Date(`${formData.fechaInicio}T12:00:00`) : undefined}
                    optional
                  />
                </View>
              </View>

              <View style={styles.formActions}>
                <TouchableOpacity style={styles.btnPrimary} onPress={handleGuardar} disabled={guardando}>
                  <Ionicons name="save-outline" size={18} color="white" />
                  <Text style={styles.btnPrimaryText}>
                    {guardando ? 'Guardando...' : (modoEdicion ? 'Actualizar' : 'Guardar')}
                  </Text>
                </TouchableOpacity>
                {modoEdicion && (
                  <TouchableOpacity style={styles.btnSecondary} onPress={handleCancelar}>
                    <Ionicons name="close-outline" size={18} color="#1e293b" />
                    <Text style={styles.btnSecondaryText}>Cancelar</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Lista de Estudios */}
        <View style={styles.listCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderIcon}>
              <Ionicons name="book-outline" size={20} color="#2563eb" />
            </View>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.cardTitle}>Mis Estudios</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{preparaciones.length}</Text>
              </View>
            </View>
          </View>

          <View style={styles.cardBody}>
            {preparaciones.length > 0 ? (
              <View style={styles.studiesList}>
                {preparaciones.map((prep, index) => (
                  <View key={prep.id} style={styles.studyCard}>
                    <View style={styles.studyCardHeader}>
                      <View style={styles.studyDegreeIcon}>
                        <Ionicons name="school-outline" size={20} color="#2563eb" />
                        <Text style={styles.studyDegreeText}>{prep.Grado}</Text>
                      </View>
                      <View style={[styles.statusBadge, getStatusStyle(prep.Estatus)]}>
                        <Text style={[styles.statusBadgeText, getStatusTextStyle(prep.Estatus)]}>
                          {prep.Estatus}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.studyCardBody}>
                      <View style={styles.infoLine}>
                        <Ionicons name="business-outline" size={14} color="#2563eb" />
                        <Text style={styles.infoLabel}>Institución:</Text>
                        <Text style={styles.infoValue}>{prep.Institucion}</Text>
                      </View>

                      <View style={styles.infoLine}>
                        <Ionicons name="globe-outline" size={14} color="#2563eb" />
                        <Text style={styles.infoLabel}>País:</Text>
                        <Text style={styles.infoValue}>{prep.Pais}</Text>
                      </View>

                      {prep.Cedula && (
                        <View style={styles.infoLine}>
                          <Ionicons name="card-outline" size={14} color="#2563eb" />
                          <Text style={styles.infoLabel}>Cédula:</Text>
                          <Text style={styles.infoValue}>{prep.Cedula}</Text>
                        </View>
                      )}

                      <View style={styles.infoLine}>
                        <Ionicons name="calendar-outline" size={14} color="#2563eb" />
                        <Text style={styles.infoLabel}>Periodo:</Text>
                        <Text style={styles.infoValue}>
                          {formatDate(prep.FechaInicio)} - {prep.FechaFin ? formatDate(prep.FechaFin) : 'Presente'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.studyCardFooter}>
                      <TouchableOpacity 
                        style={styles.btnEdit} 
                        onPress={() => handleEditar(index)}
                      >
                        <Ionicons name="create-outline" size={14} color="#2563eb" />
                        <Text style={styles.btnEditText}>Editar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.btnDelete} 
                        onPress={() => handleEliminar(index)}
                      >
                        <Ionicons name="trash-outline" size={14} color="#ef4444" />
                        <Text style={styles.btnDeleteText}>Eliminar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconContainer}>
                  <Ionicons name="school-outline" size={40} color="#94a3b8" />
                </View>
                <Text style={styles.emptyTitle}>No has agregado información académica aún</Text>
                <Text style={styles.emptyDescription}>
                  Comienza agregando tu primer registro académico utilizando el formulario superior.
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
  addButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 12,
    paddingBottom: 20,
  },
  // Form Card
  formCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
    overflow: 'hidden',
  },
  listCard: {
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
  // Formulario
  formGrid: {
    marginBottom: 10,
  },
  formField: {
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 4,
  },
  fieldInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: '#1e293b',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  optionChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: 'white',
  },
  optionChipActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  optionChipText: {
    fontSize: 11,
    color: '#1e293b',
  },
  optionChipTextActive: {
    color: 'white',
  },
  formActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  btnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
  },
  btnPrimaryText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  btnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flex: 1,
  },
  btnSecondaryText: {
    color: '#1e293b',
    fontSize: 13,
    fontWeight: '500',
  },
  // Lista de estudios
  studiesList: {
    gap: 10,
  },
  studyCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  studyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  studyDegreeIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  studyDegreeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusCompleto: {
    backgroundColor: '#d1fae5',
  },
  statusEnCurso: {
    backgroundColor: '#dbeafe',
  },
  statusIncompleto: {
    backgroundColor: '#fed7aa',
  },
  statusDefault: {
    backgroundColor: '#e2e8f0',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  statusTextCompleto: {
    color: '#065f46',
  },
  statusTextEnCurso: {
    color: '#1e40af',
  },
  statusTextIncompleto: {
    color: '#92400e',
  },
  statusTextDefault: {
    color: '#64748b',
  },
  studyCardBody: {
    padding: 12,
  },
  infoLine: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1e293b',
  },
  infoValue: {
    fontSize: 12,
    color: '#475569',
  },
  studyCardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    padding: 10,
    backgroundColor: '#f8fafc',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  btnEdit: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    minWidth: 80,
  },
  btnEditText: {
    fontSize: 11,
    color: '#2563eb',
    fontWeight: '500',
  },
  btnDelete: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    minWidth: 80,
  },
  btnDeleteText: {
    fontSize: 11,
    color: '#ef4444',
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
  },
});

export default PreparacionAcademicaScreen;
