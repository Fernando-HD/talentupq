import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
  Platform,
  StatusBar,
  Dimensions,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { useUser } from '../context/UserContext';
import DateField, { toISODate } from '../components/DateField';
import api, { apiMessage } from '../services/api';
import { clean, isDate, isFutureDate, isPhone, maxLength } from '../utils/validation';

const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#2563eb',
  primaryDark: '#1d4ed8',
  white: '#ffffff',
  dark: '#1e293b',
  gray: '#64748b',
  grayLight: '#e2e8f0',
  grayBg: '#f1f5f9',
  text: '#1e293b',
  danger: '#dc2626',
  success: '#10b981',
};

const EditarPerfilScreen = ({ navigation }) => {
  const { user, actualizarCandidato, refreshUser } = useUser();
  
  // Inicializar formData con los datos del usuario
  const [formData, setFormData] = useState({
    nombre: user.candidato?.Nombre || '',
    apellidoPaterno: user.candidato?.ApellidoPaterno || '',
    apellidoMaterno: user.candidato?.ApellidoMaterno || '',
    telefono: user.candidato?.Telefono || '',
    fechaNacimiento: toISODate(user.candidato?.FechaNacimiento),
    sexo: user.candidato?.Sexo || '',
    estadoCivil: user.candidato?.EstadoCivil || '',
    nacionalidad: user.candidato?.Nacionalidad || '',
    rfc: user.candidato?.RFC || '',
    direccion: user.candidato?.Direccion || '',
    modalidad: user.candidato?.ModalidadTrabajo || '',
    puestoActual: user.candidato?.PuestoActual || '',
    puestoSeleccionado: user.candidato?.PuestoSolicitado || '',
    resumen: user.candidato?.ResumenProfesional || '',
    reubicacion: user.candidato?.Reubicacion || false,
    viajar: user.candidato?.Viajar || false,
    licencia: user.candidato?.LicenciaConducir || false,
  });

  const [fotoPerfil, setFotoPerfil] = useState(user.candidato?.FotoPerfil || null);
  const [cvNombre, setCvNombre] = useState(user.candidato?.CV || '');
  const [cvPendiente, setCvPendiente] = useState(null);
  const [edad, setEdad] = useState(29);
  const [guardando, setGuardando] = useState(false);

  const estadosCiviles = ['Soltero/a', 'Casado/a', 'Divorciado/a', 'Viudo/a', 'Unión libre'];
  const generos = ['Masculino', 'Femenino', 'Otro'];
  const modalidades = ['Presencial', 'Remoto', 'Híbrido'];

  useEffect(() => {
    if (formData.fechaNacimiento) {
      const hoy = new Date();
      const nacimiento = new Date(formData.fechaNacimiento);
      let edadCalculada = hoy.getFullYear() - nacimiento.getFullYear();
      const mes = hoy.getMonth() - nacimiento.getMonth();
      if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edadCalculada--;
      }
      setEdad(edadCalculada);
    }
  }, [formData.fechaNacimiento]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSelectPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      const base64Photo = await FileSystem.readAsStringAsync(asset.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const mimeType = asset.mimeType || 'image/jpeg';
      const dataUrl = `data:${mimeType};base64,${base64Photo}`;
      if (dataUrl.length > 2800000) {
        Alert.alert('Foto demasiado grande', 'Selecciona una imagen menor a 2 MB.');
        return;
      }
      setFotoPerfil(dataUrl);
    }
  };

  const handleSelectCV = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      copyToCacheDirectory: true,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      if (asset.size && asset.size > 8 * 1024 * 1024) {
        Alert.alert('CV demasiado grande', 'Selecciona un PDF de máximo 8 MB.');
        return;
      }
      const contenido = await FileSystem.readAsStringAsync(asset.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      setCvNombre(asset.name);
      setCvPendiente({
        nombre: asset.name,
        mimeType: 'application/pdf',
        contenido,
      });
      Alert.alert('CV seleccionado', 'Se cargará al guardar los cambios del perfil.');
    }
  };

  const handleSubmit = () => {
    if (guardando) return;
    if (!clean(formData.nombre) || !clean(formData.apellidoPaterno)) {
      return Alert.alert('Revisa los datos', 'Nombre y apellido paterno son obligatorios.');
    }
    if (!maxLength(formData.nombre, 100) || !maxLength(formData.apellidoPaterno, 100) || !maxLength(formData.apellidoMaterno, 100)) {
      return Alert.alert('Revisa los datos', 'Los nombres y apellidos no pueden exceder 100 caracteres.');
    }
    if (clean(formData.telefono) && !isPhone(formData.telefono)) {
      return Alert.alert('Revisa los datos', 'El teléfono debe contener exactamente 10 dígitos.');
    }
    if (clean(formData.fechaNacimiento) && (!isDate(formData.fechaNacimiento) || isFutureDate(formData.fechaNacimiento))) {
      return Alert.alert('Revisa los datos', 'La fecha de nacimiento debe ser válida, usar AAAA-MM-DD y no estar en el futuro.');
    }
    if (clean(formData.rfc) && !/^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/.test(clean(formData.rfc).toUpperCase())) {
      return Alert.alert('Revisa los datos', 'El RFC no tiene un formato válido.');
    }
    if (!maxLength(formData.direccion, 250) || !maxLength(formData.puestoActual, 150) || !maxLength(formData.puestoSeleccionado, 150) || !maxLength(formData.resumen, 3000)) {
      return Alert.alert('Revisa los datos', 'Dirección, puestos o resumen exceden el tamaño permitido.');
    }
    Alert.alert(
      'Guardar cambios',
      '¿Estás seguro de que quieres guardar los cambios?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Guardar',
          onPress: async () => {
            setGuardando(true);
            try {
              // Guardar en el contexto global
              await actualizarCandidato({
                Nombre: clean(formData.nombre),
                ApellidoPaterno: clean(formData.apellidoPaterno),
                ApellidoMaterno: clean(formData.apellidoMaterno),
                Telefono: clean(formData.telefono),
                FechaNacimiento: formData.fechaNacimiento,
                Sexo: formData.sexo,
                EstadoCivil: formData.estadoCivil,
                Nacionalidad: formData.nacionalidad,
                RFC: formData.rfc,
                Direccion: formData.direccion,
                ModalidadTrabajo: formData.modalidad,
                PuestoActual: formData.puestoActual,
                PuestoSolicitado: formData.puestoSeleccionado,
                ResumenProfesional: formData.resumen,
                Reubicacion: formData.reubicacion,
                Viajar: formData.viajar,
                LicenciaConducir: formData.licencia,
                FotoPerfil: fotoPerfil,
              });
              if (cvPendiente) {
                await api.post('/perfil/cv', cvPendiente, { timeout: 45000 });
                await refreshUser();
              }
              
              Alert.alert('Éxito', 'Perfil actualizado correctamente');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', apiMessage(error));
            } finally {
              setGuardando(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Perfil</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Foto y CV */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="image-outline" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Foto y CV</Text>
          </View>

          <View style={styles.multimediaRow}>
            <View style={styles.uploadCard}>
              <View style={styles.uploadCardHeader}>
                <Ionicons name="camera-outline" size={22} color={COLORS.primary} />
                <Text style={styles.uploadLabel}>Foto de Perfil</Text>
              </View>

              <TouchableOpacity onPress={handleSelectPhoto} style={styles.avatarContainer}>
                {fotoPerfil ? (
                  <Image source={{ uri: fotoPerfil }} style={styles.avatarPreview} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>
                      {formData.nombre?.[0] || 'U'}{formData.apellidoPaterno?.[0] || '?'}
                    </Text>
                  </View>
                )}
                <View style={styles.avatarOverlay}>
                  <Ionicons name="camera" size={16} color="white" />
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.uploadButton} onPress={handleSelectPhoto}>
                <Ionicons name="cloud-upload-outline" size={14} color="white" />
                <Text style={styles.uploadButtonText}>Cambiar foto</Text>
              </TouchableOpacity>
              <Text style={styles.uploadHint}>JPG, PNG. Máx 5MB</Text>
            </View>

            <View style={styles.uploadCard}>
              <View style={styles.uploadCardHeader}>
                <Ionicons name="document-text-outline" size={22} color={COLORS.danger} />
                <Text style={styles.uploadLabel}>Currículum Vitae</Text>
              </View>

              <TouchableOpacity onPress={handleSelectCV} style={styles.cvContainer}>
                <View style={styles.cvIconWrapper}>
                  <Ionicons name="document-text" size={36} color={COLORS.danger} />
                </View>
                <Text style={styles.cvName} numberOfLines={2}>{cvNombre || 'Sin CV cargado'}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.uploadButton} onPress={handleSelectCV}>
                <Ionicons name="cloud-upload-outline" size={14} color="white" />
                <Text style={styles.uploadButtonText}>{cvNombre ? 'Actualizar CV' : 'Subir CV'}</Text>
              </TouchableOpacity>
              <Text style={styles.uploadHint}>PDF. Máx 8MB</Text>
            </View>
          </View>
        </View>

        {/* Información Personal */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-circle-outline" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Información Personal</Text>
          </View>

          <View style={styles.sectionContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                <Ionicons name="person-outline" size={14} color={COLORS.primary} /> Nombre(s)
              </Text>
              <TextInput
                style={styles.input}
                value={formData.nombre}
                onChangeText={(text) => handleInputChange('nombre', text)}
                placeholder="Nombre completo"
                placeholderTextColor="#94a3b8"
              />
            </View>

            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.inputLabel}>
                  <Ionicons name="person-outline" size={14} color={COLORS.primary} /> Apellido Paterno
                </Text>
                <TextInput
                  style={styles.input}
                  value={formData.apellidoPaterno}
                  onChangeText={(text) => handleInputChange('apellidoPaterno', text)}
                  placeholder="Apellido paterno"
                  placeholderTextColor="#94a3b8"
                />
              </View>
              <View style={styles.col}>
                <Text style={styles.inputLabel}>
                  <Ionicons name="person-outline" size={14} color={COLORS.primary} /> Apellido Materno
                </Text>
                <TextInput
                  style={styles.input}
                  value={formData.apellidoMaterno}
                  onChangeText={(text) => handleInputChange('apellidoMaterno', text)}
                  placeholder="Apellido materno"
                  placeholderTextColor="#94a3b8"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.inputLabel}>
                  <Ionicons name="call-outline" size={14} color={COLORS.primary} /> Teléfono
                </Text>
                <TextInput
                  style={styles.input}
                  value={formData.telefono}
                  onChangeText={(text) => handleInputChange('telefono', text)}
                  placeholder="10 dígitos"
                  placeholderTextColor="#94a3b8"
                  keyboardType="phone-pad"
                />
              </View>
              <View style={styles.col}>
                <Text style={styles.inputLabel}>
                  <Ionicons name="calendar-outline" size={14} color={COLORS.primary} /> Fecha Nacimiento
                </Text>
                <DateField
                  value={formData.fechaNacimiento}
                  onChange={(value) => handleInputChange('fechaNacimiento', value)}
                  placeholder="Seleccionar fecha"
                  maximumDate={new Date()}
                  style={styles.input}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.inputLabel}>
                  <Ionicons name="male-female-outline" size={14} color={COLORS.primary} /> Sexo
                </Text>
                <View style={styles.optionsRow}>
                  {generos.map((g) => (
                    <TouchableOpacity
                      key={g}
                      style={[styles.option, formData.sexo === g.toLowerCase() && styles.optionActive]}
                      onPress={() => handleInputChange('sexo', g.toLowerCase())}
                    >
                      <Text style={[styles.optionText, formData.sexo === g.toLowerCase() && styles.optionTextActive]}>
                        {g}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View style={styles.col}>
                <Text style={styles.inputLabel}>
                  <Ionicons name="heart-outline" size={14} color={COLORS.primary} /> Estado Civil
                </Text>
                <View style={styles.optionsRow}>
                  {estadosCiviles.slice(0, 3).map((e) => {
                    const value = e.toLowerCase().replace('/a', '').replace('ó', 'o');
                    return (
                      <TouchableOpacity
                        key={e}
                        style={[styles.option, formData.estadoCivil === value && styles.optionActive]}
                        onPress={() => handleInputChange('estadoCivil', value)}
                      >
                        <Text style={[styles.optionText, formData.estadoCivil === value && styles.optionTextActive]}>
                          {e}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.inputLabel}>
                  <Ionicons name="flag-outline" size={14} color={COLORS.primary} /> Nacionalidad
                </Text>
                <TextInput
                  style={styles.input}
                  value={formData.nacionalidad}
                  onChangeText={(text) => handleInputChange('nacionalidad', text)}
                  placeholder="Nacionalidad"
                  placeholderTextColor="#94a3b8"
                />
              </View>
              <View style={styles.col}>
                <Text style={styles.inputLabel}>
                  <Ionicons name="card-outline" size={14} color={COLORS.primary} /> RFC
                </Text>
                <TextInput
                  style={styles.input}
                  value={formData.rfc}
                  onChangeText={(text) => handleInputChange('rfc', text)}
                  placeholder="RFC"
                  placeholderTextColor="#94a3b8"
                  autoCapitalize="characters"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                <Ionicons name="location-outline" size={14} color={COLORS.primary} /> Dirección
              </Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.direccion}
                onChangeText={(text) => handleInputChange('direccion', text)}
                placeholder="Dirección completa"
                placeholderTextColor="#94a3b8"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>
        </View>

        {/* Disponibilidad */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="checkmark-circle-outline" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Disponibilidad</Text>
          </View>

          <View style={styles.sectionContent}>
            <View style={styles.switchRow}>
              <View style={styles.switchItem}>
                <Switch
                  value={formData.reubicacion}
                  onValueChange={(value) => handleInputChange('reubicacion', value)}
                  trackColor={{ false: '#e2e8f0', true: COLORS.primary }}
                  thumbColor={formData.reubicacion ? '#ffffff' : '#ffffff'}
                  ios_backgroundColor="#e2e8f0"
                />
                <View style={styles.switchLabelContainer}>
                  <Ionicons name="location-outline" size={14} color={COLORS.primary} />
                  <Text style={styles.switchLabel}>Reubicación</Text>
                </View>
              </View>

              <View style={styles.switchItem}>
                <Switch
                  value={formData.viajar}
                  onValueChange={(value) => handleInputChange('viajar', value)}
                  trackColor={{ false: '#e2e8f0', true: COLORS.primary }}
                  thumbColor={formData.viajar ? '#ffffff' : '#ffffff'}
                  ios_backgroundColor="#e2e8f0"
                />
                <View style={styles.switchLabelContainer}>
                  <Ionicons name="airplane-outline" size={14} color={COLORS.primary} />
                  <Text style={styles.switchLabel}>Viajar</Text>
                </View>
              </View>

              <View style={styles.switchItem}>
                <Switch
                  value={formData.licencia}
                  onValueChange={(value) => handleInputChange('licencia', value)}
                  trackColor={{ false: '#e2e8f0', true: COLORS.primary }}
                  thumbColor={formData.licencia ? '#ffffff' : '#ffffff'}
                  ios_backgroundColor="#e2e8f0"
                />
                <View style={styles.switchLabelContainer}>
                  <Ionicons name="car-outline" size={14} color={COLORS.primary} />
                  <Text style={styles.switchLabel}>Licencia</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Información Profesional */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="briefcase-outline" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Información Profesional</Text>
          </View>

          <View style={styles.sectionContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                <Ionicons name="home-outline" size={14} color={COLORS.primary} /> Modalidad
              </Text>
              <View style={styles.optionsRow}>
                {modalidades.map((m) => {
                  const value = m.toLowerCase().replace('í', 'i');
                  return (
                    <TouchableOpacity
                      key={m}
                      style={[styles.option, formData.modalidad === value && styles.optionActive]}
                      onPress={() => handleInputChange('modalidad', value)}
                    >
                      <Text style={[styles.optionText, formData.modalidad === value && styles.optionTextActive]}>
                        {m}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.inputLabel}>
                  <Ionicons name="school-outline" size={14} color={COLORS.primary} /> Puesto Actual
                </Text>
                <TextInput
                  style={styles.input}
                  value={formData.puestoActual}
                  onChangeText={(text) => handleInputChange('puestoActual', text)}
                  placeholder="Puesto actual"
                  placeholderTextColor="#94a3b8"
                />
              </View>
              <View style={styles.col}>
                <Text style={styles.inputLabel}>
                  <Ionicons name="flag-outline" size={14} color={COLORS.primary} /> Puesto Deseado
                </Text>
                <TextInput
                  style={styles.input}
                  value={formData.puestoSeleccionado}
                  onChangeText={(text) => handleInputChange('puestoSeleccionado', text)}
                  placeholder="Puesto deseado"
                  placeholderTextColor="#94a3b8"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                <Ionicons name="document-text-outline" size={14} color={COLORS.primary} /> Resumen Profesional
              </Text>
              <TextInput
                style={[styles.input, styles.textAreaLarge]}
                value={formData.resumen}
                onChangeText={(text) => handleInputChange('resumen', text)}
                placeholder="Describe tu experiencia, habilidades y objetivos..."
                placeholderTextColor="#94a3b8"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              <Text style={styles.fieldHint}>
                Cuéntanos sobre tu experiencia, habilidades destacadas y lo que buscas profesionalmente.
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={[styles.submitButton, guardando && styles.disabledButton]} onPress={handleSubmit} disabled={guardando}>
          <Ionicons name="save-outline" size={20} color="white" />
          <Text style={styles.submitButtonText}>{guardando ? 'Guardando...' : 'Guardar Cambios'}</Text>
        </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerSpacer: { width: 56 },
  disabledButton: { opacity: 0.6 },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 18,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#fafcff',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
  },
  sectionContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  multimediaRow: {
    flexDirection: 'row',
    gap: 14,
    padding: 16,
  },
  uploadCard: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  uploadCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  uploadLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
  },
  avatarContainer: {
    position: 'relative',
    marginVertical: 10,
  },
  avatarPreview: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#2563eb',
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 26,
    fontWeight: '700',
    color: '#ffffff',
  },
  avatarOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#2563eb',
    borderRadius: 14,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  cvContainer: {
    alignItems: 'center',
    paddingVertical: 8,
    marginVertical: 8,
  },
  cvIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cvName: {
    fontSize: 12,
    color: '#1e293b',
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 120,
    lineHeight: 16,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 7,
    backgroundColor: '#2563eb',
    borderRadius: 8,
    marginTop: 6,
  },
  uploadButtonText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
  uploadHint: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 6,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: '#1e293b',
  },
  textArea: {
    minHeight: 80,
    paddingTop: 11,
  },
  textAreaLarge: {
    minHeight: 110,
    paddingTop: 11,
  },
  fieldHint: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  col: {
    flex: 1,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  option: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  optionActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  optionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1e293b',
  },
  optionTextActive: {
    color: '#ffffff',
  },
  switchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingBottom: 10,
  },
  switchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  switchLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  switchLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1e293b',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563eb',
    paddingVertical: 15,
    borderRadius: 12,
    marginTop: 6,
    marginBottom: 10,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
});

export default EditarPerfilScreen;
