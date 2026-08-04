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
import { SafeAreaView } from 'react-native-safe-area-context';
import api, { apiMessage } from '../services/api';
import DateField, { toISODate } from '../components/DateField';
import { clean, isDate, isFutureDate, isNonNegativeNumber, isPhone, maxLength } from '../utils/validation';

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

const ExperienciaLaboralScreen = ({ navigation }) => {
  const [experiencias, setExperiencias] = useState([]);
  /* Ejemplos locales retirados.
  const experienciasDemo = [
    {
      id: 1,
      Empresa: 'Tech Solutions',
      Puesto: 'Desarrollador Full Stack',
      FechaIngreso: '2023-01-15',
      FechaSalida: null,
      Domicilio: 'Querétaro, Qro.',
      Telefono: '4421234567',
      SueldoInicial: 25000.00,
      SueldoFinal: 35000.00,
      Funciones: 'Desarrollo de aplicaciones web con React y Node.js, implementación de APIs REST, optimización de bases de datos SQL y liderazgo de equipo de 5 desarrolladores.',
      MotivoSeparacion: 'Crecimiento profesional y nuevas oportunidades',
    },
    {
      id: 2,
      Empresa: 'Data Corp',
      Puesto: 'Ingeniero de Datos',
      FechaIngreso: '2021-06-01',
      FechaSalida: '2022-12-31',
      Domicilio: 'CDMX, México',
      Telefono: '5512345678',
      SueldoInicial: 20000.00,
      SueldoFinal: 28000.00,
      Funciones: 'Diseño e implementación de pipelines de datos, ETL con Python y Spark, mantenimiento de bases de datos y generación de reportes ejecutivos.',
      MotivoSeparacion: 'Búsqueda de nuevos retos profesionales',
    },
  ]; */

  const cargarExperiencias = async () => {
    try {
      const { data } = await api.get('/experiencias');
      const rows = Array.isArray(data) ? data : [];
      setExperiencias(rows.map((item, index) => ({
        ...item,
        id: item.ExperienciaID ?? `experiencia-${index}`,
        Empresa: String(item.Empresa ?? 'Empresa no especificada'),
        Puesto: String(item.Puesto ?? 'Puesto no especificado'),
        Domicilio: String(item.Domicilio ?? ''),
        Telefono: String(item.Telefono ?? ''),
        Funciones: String(item.Funciones ?? ''),
        MotivoSeparacion: String(item.MotivoSeparacion ?? ''),
      })));
    } catch (error) {
      Alert.alert('Error', apiMessage(error));
    }
  };

  useEffect(() => { cargarExperiencias(); }, []);

  const [modoEdicion, setModoEdicion] = useState(false);
  const [experienciaEditando, setExperienciaEditando] = useState(null);
  const [formData, setFormData] = useState({
    empresa: '',
    puesto: '',
    fechaIngreso: '',
    fechaSalida: '',
    domicilio: '',
    telefono: '',
    sueldoInicial: '',
    sueldoFinal: '',
    funciones: '',
    motivoSeparacion: '',
  });

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAgregar = () => {
    setModoEdicion(false);
    setExperienciaEditando(null);
    setFormData({
      empresa: '',
      puesto: '',
      fechaIngreso: '',
      fechaSalida: '',
      domicilio: '',
      telefono: '',
      sueldoInicial: '',
      sueldoFinal: '',
      funciones: '',
      motivoSeparacion: '',
    });
    setMostrarFormulario(true);
  };

  const handleEditar = (index) => {
    const exp = experiencias[index];
    setModoEdicion(true);
    setExperienciaEditando(index);
    setFormData({
      empresa: exp.Empresa,
      puesto: exp.Puesto,
      fechaIngreso: toISODate(exp.FechaIngreso),
      fechaSalida: toISODate(exp.FechaSalida),
      domicilio: exp.Domicilio || '',
      telefono: exp.Telefono || '',
      sueldoInicial: exp.SueldoInicial ? exp.SueldoInicial.toString() : '',
      sueldoFinal: exp.SueldoFinal ? exp.SueldoFinal.toString() : '',
      funciones: exp.Funciones || '',
      motivoSeparacion: exp.MotivoSeparacion || '',
    });
    setMostrarFormulario(true);
  };

  const handleCancelar = () => {
    setMostrarFormulario(false);
    setModoEdicion(false);
    setExperienciaEditando(null);
  };

  const handleGuardar = async () => {
    if (guardando) return;
    // Validaciones
    if (!formData.empresa || !formData.puesto || !formData.fechaIngreso || !formData.funciones) {
      Alert.alert('Campos incompletos', 'Por favor completa todos los campos obligatorios (*)');
      return;
    }

    if (!isDate(formData.fechaIngreso) || isFutureDate(formData.fechaIngreso) || (formData.fechaSalida && (!isDate(formData.fechaSalida) || isFutureDate(formData.fechaSalida)))) {
      return Alert.alert('Error de fechas', 'Usa fechas válidas en formato AAAA-MM-DD y no posteriores a hoy.');
    }

    if (formData.fechaSalida && formData.fechaIngreso > formData.fechaSalida) {
      Alert.alert('Error de fechas', 'La fecha de salida no puede ser anterior a la fecha de ingreso');
      return;
    }
    if (clean(formData.telefono) && !isPhone(formData.telefono)) {
      return Alert.alert('Teléfono inválido', 'El teléfono debe contener exactamente 10 dígitos.');
    }
    if (!isNonNegativeNumber(formData.sueldoInicial) || !isNonNegativeNumber(formData.sueldoFinal)) {
      return Alert.alert('Sueldo inválido', 'Los sueldos deben ser números iguales o mayores a cero.');
    }
    if (!maxLength(formData.empresa, 100) || !maxLength(formData.puesto, 100) || !maxLength(formData.domicilio, 250) || !maxLength(formData.funciones, 2000) || !maxLength(formData.motivoSeparacion, 1000)) {
      return Alert.alert('Datos demasiado largos', 'Uno o más campos exceden el tamaño permitido.');
    }

    const nuevaExperiencia = {
      id: modoEdicion ? experiencias[experienciaEditando].id : Date.now(),
      Empresa: clean(formData.empresa),
      Puesto: clean(formData.puesto),
      FechaIngreso: formData.fechaIngreso,
      FechaSalida: formData.fechaSalida || null,
      Domicilio: formData.domicilio,
      Telefono: formData.telefono,
      SueldoInicial: parseFloat(formData.sueldoInicial) || null,
      SueldoFinal: parseFloat(formData.sueldoFinal) || null,
      Funciones: formData.funciones,
      MotivoSeparacion: formData.motivoSeparacion,
    };

    setGuardando(true);
    try {
      if (modoEdicion) {
        await api.put(`/experiencias/${nuevaExperiencia.id}`, nuevaExperiencia);
      } else {
        await api.post('/experiencias', nuevaExperiencia);
      }
      await cargarExperiencias();
      Alert.alert('Éxito', modoEdicion ? 'Experiencia actualizada correctamente' : 'Experiencia agregada correctamente');
      handleCancelar();
    } catch (error) {
      Alert.alert('Error', apiMessage(error));
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = (index) => {
    Alert.alert(
      'Eliminar experiencia',
      '¿Estás seguro de que quieres eliminar esta experiencia laboral?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/experiencias/${experiencias[index].id}`);
              await cargarExperiencias();
              Alert.alert('Eliminado', 'La experiencia ha sido eliminada');
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
    return date.toLocaleDateString('es-MX', { month: 'short', year: 'numeric' });
  };

  const formatCurrency = (amount) => {
    const numericAmount = Number(amount);
    return Number.isFinite(numericAmount) ? numericAmount.toFixed(2) : '0.00';
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
          <Ionicons name="briefcase-outline" size={20} color="#2563eb" />
          <Text style={styles.headerTitle}>Experiencia Laboral</Text>
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
                {modoEdicion ? 'Editar' : 'Agregar'} Experiencia Laboral
              </Text>
            </View>

            <View style={styles.cardBody}>
              <View style={styles.formGrid}>
                <View style={styles.formField}>
                  <Text style={styles.fieldLabel}>
                    <Ionicons name="business-outline" size={14} color="#2563eb" /> Empresa *
                  </Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={formData.empresa}
                    onChangeText={(text) => handleInputChange('empresa', text)}
                    placeholder="Nombre de la empresa"
                    placeholderTextColor="#94a3b8"
                  />
                </View>

                <View style={styles.formField}>
                  <Text style={styles.fieldLabel}>
                    <Ionicons name="person-outline" size={14} color="#2563eb" /> Puesto *
                  </Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={formData.puesto}
                    onChangeText={(text) => handleInputChange('puesto', text)}
                    placeholder="Tu puesto o cargo"
                    placeholderTextColor="#94a3b8"
                  />
                </View>
              </View>

              <View style={styles.formGrid}>
                <View style={styles.formField}>
                  <Text style={styles.fieldLabel}>
                    <Ionicons name="calendar-outline" size={14} color="#2563eb" /> Fecha Ingreso *
                  </Text>
                  <DateField
                    style={styles.fieldInput}
                    value={formData.fechaIngreso}
                    onChange={(value) => handleInputChange('fechaIngreso', value)}
                    maximumDate={new Date()}
                  />
                </View>

                <View style={styles.formField}>
                  <Text style={styles.fieldLabel}>
                    <Ionicons name="calendar-outline" size={14} color="#2563eb" /> Fecha Salida
                  </Text>
                  <DateField
                    style={styles.fieldInput}
                    value={formData.fechaSalida}
                    onChange={(value) => handleInputChange('fechaSalida', value)}
                    placeholder="Actual / seleccionar fecha"
                    maximumDate={new Date()}
                    minimumDate={formData.fechaIngreso ? new Date(`${formData.fechaIngreso}T12:00:00`) : undefined}
                    optional
                  />
                </View>
              </View>

              <View style={styles.formGrid}>
                <View style={styles.formField}>
                  <Text style={styles.fieldLabel}>
                    <Ionicons name="location-outline" size={14} color="#2563eb" /> Ubicación
                  </Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={formData.domicilio}
                    onChangeText={(text) => handleInputChange('domicilio', text)}
                    placeholder="Ciudad o ubicación de la empresa"
                    placeholderTextColor="#94a3b8"
                  />
                </View>

                <View style={styles.formField}>
                  <Text style={styles.fieldLabel}>
                    <Ionicons name="call-outline" size={14} color="#2563eb" /> Teléfono
                  </Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={formData.telefono}
                    onChangeText={(text) => handleInputChange('telefono', text)}
                    placeholder="Teléfono de contacto"
                    placeholderTextColor="#94a3b8"
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              <View style={styles.formGrid}>
                <View style={styles.formField}>
                  <Text style={styles.fieldLabel}>
                    <Ionicons name="cash-outline" size={14} color="#2563eb" /> Sueldo Inicial
                  </Text>
                  <View style={styles.currencyInputContainer}>
                    <Text style={styles.currencySymbol}>$</Text>
                    <TextInput
                      style={[styles.fieldInput, styles.currencyInput]}
                      value={formData.sueldoInicial}
                      onChangeText={(text) => handleInputChange('sueldoInicial', text)}
                      placeholder="0.00"
                      placeholderTextColor="#94a3b8"
                      keyboardType="decimal-pad"
                    />
                  </View>
                </View>

                <View style={styles.formField}>
                  <Text style={styles.fieldLabel}>
                    <Ionicons name="cash-outline" size={14} color="#2563eb" /> Sueldo Final
                  </Text>
                  <View style={styles.currencyInputContainer}>
                    <Text style={styles.currencySymbol}>$</Text>
                    <TextInput
                      style={[styles.fieldInput, styles.currencyInput]}
                      value={formData.sueldoFinal}
                      onChangeText={(text) => handleInputChange('sueldoFinal', text)}
                      placeholder="0.00"
                      placeholderTextColor="#94a3b8"
                      keyboardType="decimal-pad"
                    />
                  </View>
                </View>
              </View>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>
                  <Ionicons name="list-outline" size={14} color="#2563eb" /> Funciones *
                </Text>
                <TextInput
                  style={[styles.fieldInput, styles.textArea]}
                  value={formData.funciones}
                  onChangeText={(text) => handleInputChange('funciones', text)}
                  placeholder="Describe tus principales responsabilidades y logros..."
                  placeholderTextColor="#94a3b8"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>
                  <Ionicons name="log-out-outline" size={14} color="#2563eb" /> Motivo de Separación
                </Text>
                <TextInput
                  style={styles.fieldInput}
                  value={formData.motivoSeparacion}
                  onChangeText={(text) => handleInputChange('motivoSeparacion', text)}
                  placeholder="¿Por qué dejaste este trabajo?"
                  placeholderTextColor="#94a3b8"
                />
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

        {/* Lista de Experiencias */}
        <View style={styles.listCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderIcon}>
              <Ionicons name="time-outline" size={20} color="#2563eb" />
            </View>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.cardTitle}>Mi Historial Laboral</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{experiencias.length}</Text>
              </View>
            </View>
          </View>

          <View style={styles.cardBody}>
            {experiencias.length > 0 ? (
              <View style={styles.experiencesList}>
                {experiencias.map((exp, index) => (
                  <View key={exp.id} style={styles.experienceItem}>
                    <View style={styles.experienceHeader}>
                      <View style={styles.companyInfo}>
                        <Ionicons name="business-outline" size={20} color="#2563eb" />
                        <View>
                          <Text style={styles.companyName}>{exp.Empresa}</Text>
                          <Text style={styles.positionName}>{exp.Puesto}</Text>
                        </View>
                      </View>
                      <View style={styles.periodBadge}>
                        <Ionicons name="calendar-outline" size={12} color="#64748b" />
                        <Text style={styles.periodText}>
                          {formatDate(exp.FechaIngreso)} - {exp.FechaSalida ? formatDate(exp.FechaSalida) : 'Presente'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.experienceBody}>
                      {(exp.Domicilio || exp.Telefono) && (
                        <View style={styles.infoGroup}>
                          {exp.Domicilio && (
                            <View style={styles.infoTag}>
                              <Ionicons name="location-outline" size={12} color="#2563eb" />
                              <Text style={styles.infoTagText}>{exp.Domicilio}</Text>
                            </View>
                          )}
                          {exp.Telefono && (
                            <View style={styles.infoTag}>
                              <Ionicons name="call-outline" size={12} color="#2563eb" />
                              <Text style={styles.infoTagText}>{exp.Telefono}</Text>
                            </View>
                          )}
                        </View>
                      )}

                      {(exp.SueldoInicial || exp.SueldoFinal) && (
                        <View style={styles.salaryInfo}>
                          <Ionicons name="cash-outline" size={14} color="#065f46" />
                          <Text style={styles.salaryText}>
                            ${formatCurrency(exp.SueldoInicial)} - ${formatCurrency(exp.SueldoFinal)}
                          </Text>
                        </View>
                      )}

                      <View style={styles.functionsSection}>
                        <View style={styles.functionsHeader}>
                          <Ionicons name="list-outline" size={14} color="#2563eb" />
                          <Text style={styles.functionsTitle}>Funciones realizadas:</Text>
                        </View>
                        <Text style={styles.functionsText}>{exp.Funciones}</Text>
                      </View>

                      {exp.MotivoSeparacion && (
                        <View style={styles.separationReason}>
                          <Ionicons name="log-out-outline" size={14} color="#f59e0b" />
                          <Text style={styles.separationLabel}>Motivo de separación:</Text>
                          <Text style={styles.separationText}>{exp.MotivoSeparacion}</Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.experienceFooter}>
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
                  <Ionicons name="briefcase-outline" size={40} color="#94a3b8" />
                </View>
                <Text style={styles.emptyTitle}>No hay experiencias laborales registradas</Text>
                <Text style={styles.emptyDescription}>
                  Comienza agregando tu primera experiencia laboral utilizando el formulario superior.
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
  textArea: {
    minHeight: 80,
    paddingTop: 8,
  },
  currencyInputContainer: {
    position: 'relative',
  },
  currencySymbol: {
    position: 'absolute',
    left: 10,
    top: 8,
    color: '#64748b',
    fontWeight: '500',
    zIndex: 1,
    fontSize: 13,
  },
  currencyInput: {
    paddingLeft: 24,
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
  // Lista de experiencias
  experiencesList: {
    gap: 10,
  },
  experienceItem: {
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  experienceHeader: {
    padding: 12,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  companyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  companyName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
  },
  positionName: {
    fontSize: 12,
    color: '#64748b',
  },
  periodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  periodText: {
    fontSize: 10,
    color: '#64748b',
  },
  experienceBody: {
    padding: 12,
  },
  infoGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  infoTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#f8fafc',
    borderRadius: 6,
  },
  infoTagText: {
    fontSize: 11,
    color: '#475569',
  },
  salaryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#d1fae5',
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  salaryText: {
    fontSize: 11,
    color: '#065f46',
  },
  functionsSection: {
    marginTop: 4,
  },
  functionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  functionsTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1e293b',
  },
  functionsText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
  },
  separationReason: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  separationLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748b',
  },
  separationText: {
    fontSize: 11,
    color: '#64748b',
  },
  experienceFooter: {
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
  },
  emptyDescription: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
});

export default ExperienciaLaboralScreen;
