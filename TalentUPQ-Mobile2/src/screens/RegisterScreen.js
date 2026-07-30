import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TextInput,
  Animated,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from '../context/UserContext';
import { apiMessage } from '../services/api';

const RegisterScreen = ({ navigation }) => {
  const { register } = useUser();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    email: '',
    password: '',
    confirmPassword: '',
    telefono: '',
    direccion: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Estados de focus para cada campo
  const [focusedFields, setFocusedFields] = useState({});

  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 80,
        friction: 12,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();
  }, []);

  const floatY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  });

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nombre) newErrors.nombre = 'El nombre es requerido';
    if (!formData.apellidoPaterno) newErrors.apellidoPaterno = 'El apellido paterno es requerido';
    if (!formData.email) newErrors.email = 'El correo es requerido';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Correo inválido';
    if (!formData.password) newErrors.password = 'La contraseña es requerida';
    else if (formData.password.length < 8 || !/[A-Za-z]/.test(formData.password) || !/\d/.test(formData.password)) {
      newErrors.password = 'Mínimo 8 caracteres, una letra y un número';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }
    if (formData.telefono && formData.telefono.length !== 10) {
      newErrors.telefono = 'El teléfono debe tener 10 dígitos';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const result = await register({
        nombre: formData.nombre.trim(),
        apellido: formData.apellidoPaterno.trim(),
        apellidoMaterno: formData.apellidoMaterno.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        telefono: formData.telefono.trim(),
        direccion: formData.direccion.trim(),
      });
      
      Alert.alert(
        '¡Registro exitoso!',
        result.welcomeEmailSent
          ? `Enviamos tu correo de bienvenida a ${result.welcomeEmail}. Revisa también Spam y Promociones.`
          : 'Tu cuenta fue creada, pero el correo de bienvenida no pudo enviarse. Puedes iniciar sesión normalmente.'
      );
      navigation.replace('CandidatoDashboard');
    } catch (error) {
      Alert.alert('Error', apiMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleFocus = (field) => {
    setFocusedFields({ ...focusedFields, [field]: true });
  };

  const handleBlur = (field) => {
    setFocusedFields({ ...focusedFields, [field]: false });
  };

  const isFocused = (field) => focusedFields[field] || false;
  const hasValue = (field) => formData[field] && formData[field].length > 0;
  const hasError = (field) => errors[field] || false;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="dark" />
      
      {/* Fondo con formas flotantes */}
      <View style={styles.background}>
        <Animated.View style={[styles.floatingShape, styles.shape1, { transform: [{ translateY: floatY }] }]} />
        <Animated.View style={[styles.floatingShape, styles.shape2, { transform: [{ translateY: floatY }] }]} />
        <Animated.View style={[styles.floatingShape, styles.shape3, { transform: [{ translateY: floatY }] }]} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>

        <Animated.View 
          style={[
            styles.card,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            }
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <LinearGradient
              colors={['#3498db', '#2ecc71']}
              style={styles.iconContainer}
            >
              <Ionicons name="person-add" size={36} color="white" />
            </LinearGradient>
            <Text style={styles.title}>Crear Cuenta</Text>
            <Text style={styles.subtitle}>Completa el formulario para registrarte</Text>
          </View>

          {/* Formulario */}
          <View style={styles.form}>
            {/* Nombre */}
            <View style={styles.inputGroup}>
              <View style={styles.inputContainer}>
                <Ionicons 
                  name="person-outline" 
                  size={20} 
                  color={isFocused('nombre') ? '#3498db' : (hasError('nombre') ? '#ef4444' : '#94a3b8')} 
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, hasError('nombre') && styles.inputError]}
                  value={formData.nombre}
                  onChangeText={(text) => {
                    setFormData({...formData, nombre: text});
                    if (errors.nombre) {
                      setErrors({...errors, nombre: null});
                    }
                  }}
                  placeholder=" "
                  onFocus={() => handleFocus('nombre')}
                  onBlur={() => handleBlur('nombre')}
                />
                <Text style={[styles.label, (isFocused('nombre') || hasValue('nombre')) && styles.labelFocused, hasError('nombre') && styles.labelError]}>
                  Nombre(s)
                </Text>
                <Animated.View 
                  style={[
                    styles.underline,
                    isFocused('nombre') && styles.underlineActive,
                    hasError('nombre') && styles.underlineError
                  ]} 
                />
                {hasError('nombre') && (
                  <Text style={styles.errorText}>{errors.nombre}</Text>
                )}
              </View>
            </View>

            {/* Apellido Paterno */}
            <View style={styles.inputGroup}>
              <View style={styles.inputContainer}>
                <Ionicons 
                  name="person-outline" 
                  size={20} 
                  color={isFocused('apellidoPaterno') ? '#3498db' : (hasError('apellidoPaterno') ? '#ef4444' : '#94a3b8')} 
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, hasError('apellidoPaterno') && styles.inputError]}
                  value={formData.apellidoPaterno}
                  onChangeText={(text) => {
                    setFormData({...formData, apellidoPaterno: text});
                    if (errors.apellidoPaterno) {
                      setErrors({...errors, apellidoPaterno: null});
                    }
                  }}
                  placeholder=" "
                  onFocus={() => handleFocus('apellidoPaterno')}
                  onBlur={() => handleBlur('apellidoPaterno')}
                />
                <Text style={[styles.label, (isFocused('apellidoPaterno') || hasValue('apellidoPaterno')) && styles.labelFocused, hasError('apellidoPaterno') && styles.labelError]}>
                  Apellido Paterno
                </Text>
                <Animated.View 
                  style={[
                    styles.underline,
                    isFocused('apellidoPaterno') && styles.underlineActive,
                    hasError('apellidoPaterno') && styles.underlineError
                  ]} 
                />
                {hasError('apellidoPaterno') && (
                  <Text style={styles.errorText}>{errors.apellidoPaterno}</Text>
                )}
              </View>
            </View>

            {/* Apellido Materno */}
            <View style={styles.inputGroup}>
              <View style={styles.inputContainer}>
                <Ionicons 
                  name="person-outline" 
                  size={20} 
                  color={isFocused('apellidoMaterno') ? '#3498db' : '#94a3b8'} 
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={formData.apellidoMaterno}
                  onChangeText={(text) => setFormData({...formData, apellidoMaterno: text})}
                  placeholder=" "
                  onFocus={() => handleFocus('apellidoMaterno')}
                  onBlur={() => handleBlur('apellidoMaterno')}
                />
                <Text style={[styles.label, (isFocused('apellidoMaterno') || hasValue('apellidoMaterno')) && styles.labelFocused]}>
                  Apellido Materno
                </Text>
                <Animated.View 
                  style={[
                    styles.underline,
                    isFocused('apellidoMaterno') && styles.underlineActive
                  ]} 
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <View style={styles.inputContainer}>
                <Ionicons 
                  name="mail-outline" 
                  size={20} 
                  color={isFocused('email') ? '#3498db' : (hasError('email') ? '#ef4444' : '#94a3b8')} 
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, hasError('email') && styles.inputError]}
                  value={formData.email}
                  onChangeText={(text) => {
                    setFormData({...formData, email: text});
                    if (errors.email) {
                      setErrors({...errors, email: null});
                    }
                  }}
                  placeholder=" "
                  onFocus={() => handleFocus('email')}
                  onBlur={() => handleBlur('email')}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <Text style={[styles.label, (isFocused('email') || hasValue('email')) && styles.labelFocused, hasError('email') && styles.labelError]}>
                  Correo Electrónico
                </Text>
                <Animated.View 
                  style={[
                    styles.underline,
                    isFocused('email') && styles.underlineActive,
                    hasError('email') && styles.underlineError
                  ]} 
                />
                {hasError('email') && (
                  <Text style={styles.errorText}>{errors.email}</Text>
                )}
              </View>
            </View>

            {/* Teléfono */}
            <View style={styles.inputGroup}>
              <View style={styles.inputContainer}>
                <Ionicons 
                  name="call-outline" 
                  size={20} 
                  color={isFocused('telefono') ? '#3498db' : (hasError('telefono') ? '#ef4444' : '#94a3b8')} 
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, hasError('telefono') && styles.inputError]}
                  value={formData.telefono}
                  onChangeText={(text) => {
                    setFormData({...formData, telefono: text});
                    if (errors.telefono) {
                      setErrors({...errors, telefono: null});
                    }
                  }}
                  placeholder=" "
                  onFocus={() => handleFocus('telefono')}
                  onBlur={() => handleBlur('telefono')}
                  keyboardType="phone-pad"
                />
                <Text style={[styles.label, (isFocused('telefono') || hasValue('telefono')) && styles.labelFocused, hasError('telefono') && styles.labelError]}>
                  Teléfono
                </Text>
                <Animated.View 
                  style={[
                    styles.underline,
                    isFocused('telefono') && styles.underlineActive,
                    hasError('telefono') && styles.underlineError
                  ]} 
                />
                {hasError('telefono') && (
                  <Text style={styles.errorText}>{errors.telefono}</Text>
                )}
              </View>
            </View>

            {/* Contraseña */}
            <View style={styles.inputGroup}>
              <View style={styles.inputContainer}>
                <Ionicons 
                  name="lock-closed-outline" 
                  size={20} 
                  color={isFocused('password') ? '#3498db' : (hasError('password') ? '#ef4444' : '#94a3b8')} 
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, hasError('password') && styles.inputError]}
                  value={formData.password}
                  onChangeText={(text) => {
                    setFormData({...formData, password: text});
                    if (errors.password) {
                      setErrors({...errors, password: null});
                    }
                  }}
                  placeholder=" "
                  secureTextEntry={!showPassword}
                  onFocus={() => handleFocus('password')}
                  onBlur={() => handleBlur('password')}
                />
                <Text style={[styles.label, (isFocused('password') || hasValue('password')) && styles.labelFocused, hasError('password') && styles.labelError]}>
                  Contraseña
                </Text>
                <TouchableOpacity 
                  style={styles.passwordToggle}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons 
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
                    size={22} 
                    color="#94a3b8" 
                  />
                </TouchableOpacity>
                <Animated.View 
                  style={[
                    styles.underline,
                    isFocused('password') && styles.underlineActive,
                    hasError('password') && styles.underlineError
                  ]} 
                />
                {hasError('password') && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}
              </View>
            </View>

            {/* Confirmar Contraseña */}
            <View style={styles.inputGroup}>
              <View style={styles.inputContainer}>
                <Ionicons 
                  name="lock-closed-outline" 
                  size={20} 
                  color={isFocused('confirmPassword') ? '#3498db' : (hasError('confirmPassword') ? '#ef4444' : '#94a3b8')} 
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, hasError('confirmPassword') && styles.inputError]}
                  value={formData.confirmPassword}
                  onChangeText={(text) => {
                    setFormData({...formData, confirmPassword: text});
                    if (errors.confirmPassword) {
                      setErrors({...errors, confirmPassword: null});
                    }
                  }}
                  placeholder=" "
                  secureTextEntry={!showConfirmPassword}
                  onFocus={() => handleFocus('confirmPassword')}
                  onBlur={() => handleBlur('confirmPassword')}
                />
                <Text style={[styles.label, (isFocused('confirmPassword') || hasValue('confirmPassword')) && styles.labelFocused, hasError('confirmPassword') && styles.labelError]}>
                  Confirmar Contraseña
                </Text>
                <TouchableOpacity 
                  style={styles.passwordToggle}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons 
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} 
                    size={22} 
                    color="#94a3b8" 
                  />
                </TouchableOpacity>
                <Animated.View 
                  style={[
                    styles.underline,
                    isFocused('confirmPassword') && styles.underlineActive,
                    hasError('confirmPassword') && styles.underlineError
                  ]} 
                />
                {hasError('confirmPassword') && (
                  <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                )}
              </View>
            </View>

            {/* Dirección */}
            <View style={styles.inputGroup}>
              <View style={styles.inputContainer}>
                <Ionicons 
                  name="location-outline" 
                  size={20} 
                  color={isFocused('direccion') ? '#3498db' : '#94a3b8'} 
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.direccion}
                  onChangeText={(text) => setFormData({...formData, direccion: text})}
                  placeholder=" "
                  multiline
                  numberOfLines={2}
                  onFocus={() => handleFocus('direccion')}
                  onBlur={() => handleBlur('direccion')}
                />
                <Text style={[styles.label, (isFocused('direccion') || hasValue('direccion')) && styles.labelFocused]}>
                  Dirección (Opcional)
                </Text>
                <Animated.View 
                  style={[
                    styles.underline,
                    isFocused('direccion') && styles.underlineActive
                  ]} 
                />
              </View>
            </View>

            {/* Botón Registro */}
            <TouchableOpacity 
              style={styles.registerButton}
              onPress={handleRegister}
              disabled={loading}
            >
              <LinearGradient
                colors={['#3498db', '#2ecc71']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientButton}
              >
                {loading ? (
                  <View style={styles.loader}>
                    <View style={styles.loaderDot} />
                    <View style={[styles.loaderDot, styles.loaderDot2]} />
                    <View style={[styles.loaderDot, styles.loaderDot3]} />
                  </View>
                ) : (
                  <>
                    <Text style={styles.registerButtonText}>Registrarse</Text>
                    <Ionicons name="arrow-forward" size={20} color="white" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>¿Ya tienes una cuenta?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.footerLink}> Inicia sesión aquí</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  floatingShape: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.08,
  },
  shape1: {
    width: 150,
    height: 150,
    backgroundColor: '#3498db',
    top: '10%',
    left: '5%',
  },
  shape2: {
    width: 100,
    height: 100,
    backgroundColor: '#2ecc71',
    top: '70%',
    right: '10%',
  },
  shape3: {
    width: 80,
    height: 80,
    backgroundColor: '#9b59b6',
    bottom: '20%',
    left: '15%',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
  },
  backButton: {
    padding: 8,
    marginBottom: 16,
    alignSelf: 'flex-start',
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    zIndex: 10,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.12,
    shadowRadius: 80,
    elevation: 12,
    borderWidth: 1,
    borderColor: '#f1f3f4',
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#5a6c7d',
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputContainer: {
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 0,
    top: 14,
    zIndex: 2,
  },
  input: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 0,
    paddingLeft: 32,
    fontSize: 16,
    color: '#2c3e50',
    borderBottomWidth: 2,
    borderBottomColor: '#e1e5e9',
    backgroundColor: 'transparent',
  },
  textArea: {
    minHeight: 60,
    paddingTop: 14,
    textAlignVertical: 'top',
  },
  inputError: {
    borderBottomColor: '#ef4444',
  },
  label: {
    position: 'absolute',
    top: 14,
    left: 32,
    fontSize: 16,
    color: '#5a6c7d',
    fontWeight: '500',
  },
  labelFocused: {
    top: -10,
    fontSize: 12,
    color: '#3498db',
    fontWeight: '600',
  },
  labelError: {
    color: '#ef4444',
  },
  underline: {
    position: 'absolute',
    bottom: 0,
    left: 32,
    right: 0,
    height: 2,
    backgroundColor: 'transparent',
  },
  underlineActive: {
    backgroundColor: '#3498db',
  },
  underlineError: {
    backgroundColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
    paddingLeft: 32,
  },
  passwordToggle: {
    position: 'absolute',
    right: 0,
    top: 12,
    padding: 4,
    zIndex: 2,
  },
  registerButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 20,
  },
  gradientButton: {
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    minHeight: 56,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  loader: {
    flexDirection: 'row',
    gap: 6,
  },
  loaderDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
    opacity: 0.8,
  },
  loaderDot2: {
    opacity: 0.5,
  },
  loaderDot3: {
    opacity: 0.3,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e1e5e9',
  },
  footerText: {
    fontSize: 14,
    color: '#5a6c7d',
  },
  footerLink: {
    fontSize: 14,
    color: '#3498db',
    fontWeight: '600',
  },
});

export default RegisterScreen;
