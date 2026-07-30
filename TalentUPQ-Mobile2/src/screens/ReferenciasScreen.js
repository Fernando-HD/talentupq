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
import * as DocumentPicker from 'expo-document-picker';
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

const ReferenciasScreen = ({ navigation }) => {
  const [referencias, setReferencias] = useState([]);
  /* Ejemplos locales retirados.
  const referenciasDemo = [
    {
      id: 1,
      Nombre: 'Ing. María Pérez',
      Ocupacion: 'Gerente de Desarrollo',
      Telefono: '4421234567',
      AnosConocer: 5,
      Empresa: 'Tech Solutions',
      Documento: 'referencia_maria.pdf',
    },
    {
      id: 2,
      Nombre: 'Lic. Carlos Martínez',
      Ocupacion: 'Director de Proyectos',
      Telefono: '4429876543',
      AnosConocer: 3,
      Empresa: 'Innovatech',
      Documento: null,
    },
  ]; */

  const cargarReferencias = async () => {
    try {
      const { data } = await api.get('/referencias');
      setReferencias(data.map((item) => ({ ...item, id: item.ReferenciaID })));
    } catch (error) {
      Alert.alert('Error', apiMessage(error));
    }
  };

  useEffect(() => { cargarReferencias(); }, []);

  const [modoEdicion, setModoEdicion] = useState(false);
  const [referenciaEditando, setReferenciaEditando] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    ocupacion: '',
    telefono: '',
    anosConocer: '',
    empresa: '',
    documento: null,
  });

  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAgregar = () => {
    setModoEdicion(false);
    setReferenciaEditando(null);
    setFormData({
      nombre: '',
      ocupacion: '',
      telefono: '',
      anosConocer: '',
      empresa: '',
      documento: null,
    });
    setMostrarFormulario(true);
  };

  const handleEditar = (index) => {
    const ref = referencias[index];
    setModoEdicion(true);
    setReferenciaEditando(index);
    setFormData({
      nombre: ref.Nombre,
      ocupacion: ref.Ocupacion,
      telefono: ref.Telefono,
      anosConocer: ref.AnosConocer ? ref.AnosConocer.toString() : '',
      empresa: ref.Empresa || '',
      documento: ref.Documento || null,
    });
    setMostrarFormulario(true);
  };

  const handleCancelar = () => {
    setMostrarFormulario(false);
    setModoEdicion(false);
    setReferenciaEditando(null);
  };

  const handleSeleccionarDocumento = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setFormData(prev => ({ 
          ...prev, 
          documento: { 
            uri: asset.uri, 
            name: asset.name, 
            size: asset.size 
          } 
        }));
        Alert.alert('Documento seleccionado', `Archivo: ${asset.name}`);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo seleccionar el archivo');
    }
  };

  const handleGuardar = async () => {
    // Validaciones
    if (!formData.nombre || !formData.ocupacion || !formData.telefono || !formData.anosConocer) {
      Alert.alert('Campos incompletos', 'Por favor completa todos los campos obligatorios (*)');
      return;
    }

    if (parseInt(formData.anosConocer) < 1) {
      Alert.alert('Error', 'Los años de conocer deben ser al menos 1');
      return;
    }

    const nuevaReferencia = {
      id: modoEdicion ? referencias[referenciaEditando].id : Date.now(),
      Nombre: formData.nombre,
      Ocupacion: formData.ocupacion,
      Telefono: formData.telefono,
      AnosConocer: parseInt(formData.anosConocer),
      Empresa: formData.empresa,
      Documento: formData.documento ? formData.documento.name : (modoEdicion ? referencias[referenciaEditando].Documento : null),
    };

    try {
      if (modoEdicion) await api.put(`/referencias/${nuevaReferencia.id}`, nuevaReferencia);
      else await api.post('/referencias', nuevaReferencia);
      await cargarReferencias();
      Alert.alert('Éxito', modoEdicion ? 'Referencia actualizada correctamente' : 'Referencia agregada correctamente');
      handleCancelar();
    } catch (error) {
      Alert.alert('Error', apiMessage(error));
    }
  };

  const handleEliminar = (index) => {
    Alert.alert(
      'Eliminar referencia',
      '¿Estás seguro de que quieres eliminar esta referencia profesional?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/referencias/${referencias[index].id}`);
              await cargarReferencias();
              Alert.alert('Eliminado', 'La referencia ha sido eliminada');
            } catch (error) {
              Alert.alert('Error', apiMessage(error));
            }
          },
        },
      ]
    );
  };

  const getInitials = (nombre) => {
    if (!nombre) return '?';
    const parts = nombre.split(' ');
    if (parts.length >= 2) {
      return parts[0][0] + parts[1][0];
    }
    return nombre.substring(0, 2).toUpperCase();
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
          <Ionicons name="people-outline" size={20} color="#2563eb" />
          <Text style={styles.headerTitle}>Referencias Profesionales</Text>
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
                {modoEdicion ? 'Editar' : 'Agregar'} Referencia Profesional
              </Text>
            </View>

            <View style={styles.cardBody}>
              <View style={styles.formGrid}>
                <View style={styles.formField}>
                  <Text style={styles.fieldLabel}>
                    <Ionicons name="person-outline" size={14} color="#2563eb" /> Nombre Completo *
                  </Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={formData.nombre}
                    onChangeText={(text) => handleInputChange('nombre', text)}
                    placeholder="Nombre completo de la referencia"
                    placeholderTextColor="#94a3b8"
                  />
                </View>

                <View style={styles.formField}>
                  <Text style={styles.fieldLabel}>
                    <Ionicons name="briefcase-outline" size={14} color="#2563eb" /> Ocupación *
                  </Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={formData.ocupacion}
                    onChangeText={(text) => handleInputChange('ocupacion', text)}
                    placeholder="Cargo o profesión"
                    placeholderTextColor="#94a3b8"
                  />
                </View>
              </View>

              <View style={styles.formGrid}>
                <View style={styles.formField}>
                  <Text style={styles.fieldLabel}>
                    <Ionicons name="call-outline" size={14} color="#2563eb" /> Teléfono *
                  </Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={formData.telefono}
                    onChangeText={(text) => handleInputChange('telefono', text)}
                    placeholder="Número de contacto"
                    placeholderTextColor="#94a3b8"
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.formField}>
                  <Text style={styles.fieldLabel}>
                    <Ionicons name="time-outline" size={14} color="#2563eb" /> Años de conocerlo *
                  </Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={formData.anosConocer}
                    onChangeText={(text) => handleInputChange('anosConocer', text)}
                    placeholder="Ej: 3"
                    placeholderTextColor="#94a3b8"
                    keyboardType="number-pad"
                  />
                </View>
              </View>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>
                  <Ionicons name="business-outline" size={14} color="#2563eb" /> Empresa donde trabaja
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
                  <Ionicons name="document-text-outline" size={14} color="#2563eb" /> Documento de Referencia
                </Text>
                
                {formData.documento && (
                  <View style={styles.currentDocument}>
                    <Ionicons name="document-text" size={20} color="#10b981" />
                    <Text style={styles.currentDocumentText} numberOfLines={1}>
                      {formData.documento.name}
                    </Text>
                    <TouchableOpacity 
                      style={styles.btnView}
                      onPress={() => Alert.alert('Documento', `Archivo: ${formData.documento.name}`)}
                    >
                      <Ionicons name="eye-outline" size={14} color="#2563eb" />
                      <Text style={styles.btnViewText}>Ver</Text>
                    </TouchableOpacity>
                  </View>
                )}

                <TouchableOpacity style={styles.uploadButton} onPress={handleSeleccionarDocumento}>
                  <Ionicons name="cloud-upload-outline" size={20} color="#2563eb" />
                  <Text style={styles.uploadButtonText}>
                    {formData.documento ? 'Seleccionar nuevo archivo' : 'Seleccionar archivo PDF'}
                  </Text>
                </TouchableOpacity>
                <Text style={styles.fieldHint}>Formatos aceptados: PDF (Tamaño máximo: 5MB)</Text>
              </View>

              <View style={styles.formActions}>
                <TouchableOpacity style={styles.btnPrimary} onPress={handleGuardar}>
                  <Ionicons name="save-outline" size={18} color="white" />
                  <Text style={styles.btnPrimaryText}>
                    {modoEdicion ? 'Actualizar' : 'Guardar'}
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

        {/* Lista de Referencias */}
        <View style={styles.listCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderIcon}>
              <Ionicons name="people-outline" size={20} color="#2563eb" />
            </View>
            <Text style={styles.cardTitle}>
              Mis Referencias
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{referencias.length}</Text>
              </View>
            </Text>
          </View>

          <View style={styles.cardBody}>
            {referencias.length > 0 ? (
              <View style={styles.referencesList}>
                {referencias.map((ref, index) => (
                  <View key={ref.id} style={styles.referenceItem}>
                    <View style={styles.referenceItemHeader}>
                      <View style={styles.personInfo}>
                        <View style={styles.personIcon}>
                          <Text style={styles.personInitials}>{getInitials(ref.Nombre)}</Text>
                        </View>
                        <View style={styles.personDetails}>
                          <Text style={styles.personName}>{ref.Nombre}</Text>
                          <Text style={styles.personOccupation}>{ref.Ocupacion}</Text>
                        </View>
                      </View>
                      <View style={styles.yearsBadge}>
                        <Ionicons name="calendar-outline" size={12} color="#64748b" />
                        <Text style={styles.yearsBadgeText}>{ref.AnosConocer} años</Text>
                      </View>
                    </View>

                    <View style={styles.referenceItemBody}>
                      <View style={styles.contactInfo}>
                        <View style={styles.contactItem}>
                          <Ionicons name="call-outline" size={14} color="#2563eb" />
                          <Text style={styles.contactItemText}>{ref.Telefono}</Text>
                        </View>
                        {ref.Empresa && (
                          <View style={styles.contactItem}>
                            <Ionicons name="business-outline" size={14} color="#2563eb" />
                            <Text style={styles.contactItemText}>{ref.Empresa}</Text>
                          </View>
                        )}
                      </View>

                      {ref.Documento && (
                        <TouchableOpacity 
                          style={styles.documentLink}
                          onPress={() => Alert.alert('Documento', `Documento: ${ref.Documento}`)}
                        >
                          <Ionicons name="document-text" size={16} color="#ef4444" />
                          <Text style={styles.documentLinkText}>Ver documento de referencia</Text>
                          <Ionicons name="open-outline" size={14} color="#2563eb" />
                        </TouchableOpacity>
                      )}
                    </View>

                    <View style={styles.referenceItemFooter}>
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
                  <Ionicons name="people-outline" size={40} color="#94a3b8" />
                </View>
                <Text style={styles.emptyTitle}>No hay referencias registradas</Text>
                <Text style={styles.emptyDescription}>
                  Agrega tu primera referencia profesional utilizando el formulario superior.
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
  fieldHint: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
  },
  // Documento actual
  currentDocument: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    backgroundColor: '#ecfdf5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#a7f3d0',
    marginBottom: 6,
  },
  currentDocumentText: {
    flex: 1,
    fontSize: 12,
    color: '#1e293b',
  },
  btnView: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'white',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  btnViewText: {
    fontSize: 10,
    color: '#2563eb',
  },
  // Upload
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 10,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    borderRadius: 8,
    marginTop: 2,
  },
  uploadButtonText: {
    fontSize: 13,
    color: '#1e293b',
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
  // Lista de referencias
  referencesList: {
    gap: 10,
  },
  referenceItem: {
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  referenceItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  personInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  personIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  personInitials: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
  },
  personDetails: {
    flex: 1,
  },
  personName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  personOccupation: {
    fontSize: 11,
    color: '#64748b',
  },
  yearsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  yearsBadgeText: {
    fontSize: 10,
    color: '#1e293b',
  },
  referenceItemBody: {
    padding: 12,
  },
  contactInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  contactItemText: {
    fontSize: 12,
    color: '#475569',
  },
  documentLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 6,
  },
  documentLinkText: {
    fontSize: 12,
    color: '#2563eb',
    flex: 1,
  },
  referenceItemFooter: {
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

export default ReferenciasScreen;
