import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Animated,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { useUser } from '../context/UserContext';
import { API_URL, apiMessage } from '../services/api';

WebBrowser.maybeCompleteAuthSession();

const LoginScreen = ({ navigation }) => {
  const { login, googleLogin } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  
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
    if (!email) newErrors.email = 'El correo es requerido';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Correo inválido';
    if (!password) newErrors.password = 'La contraseña es requerida';
    else if (password.length < 6) newErrors.password = 'Mínimo 6 caracteres';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password, remember);
      
      navigation.replace('CandidatoDashboard');
    } catch (error) {
      Alert.alert('Error', apiMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const redirectUri = AuthSession.makeRedirectUri({
        scheme: 'talentupq',
        path: 'google-auth',
      });
      const serverOrigin = API_URL.replace(/\/api\/v1\/?$/, '');
      const authUrl = `${serverOrigin}/auth/google?source=mobile&return_to=${encodeURIComponent(redirectUri)}`;
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
      if (result.type !== 'success' || !result.url) {
        if (result.type !== 'cancel' && result.type !== 'dismiss') {
          Alert.alert('Google', 'No fue posible completar el acceso con Google.');
        }
        return;
      }
      const code = new URL(result.url).searchParams.get('code');
      if (!code) throw new Error('Google no devolvió el código de acceso.');
      await googleLogin(code, true);
      navigation.replace('CandidatoDashboard');
    } catch (error) {
      Alert.alert('Acceso con Google', error.response ? apiMessage(error) : error.message);
    } finally {
      setLoading(false);
    }
  };

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
              <Ionicons name="log-in" size={36} color="white" />
            </LinearGradient>
            <Text style={styles.title}>Iniciar Sesión</Text>
            <Text style={styles.subtitle}>Ingresa tus credenciales para acceder</Text>
          </View>

          {/* Formulario */}
          <View style={styles.form}>
            {/* Email */}
            <View style={styles.inputGroup}>
              <View style={styles.inputContainer}>
                <Ionicons 
                  name="mail-outline" 
                  size={20} 
                  color={emailFocused ? '#3498db' : (errors.email ? '#ef4444' : '#94a3b8')} 
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errors.email) {
                      setErrors({ ...errors, email: null });
                    }
                  }}
                  placeholder=" "
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <Text style={[styles.label, (emailFocused || email) && styles.labelFocused, errors.email && styles.labelError]}>
                  Correo Electrónico
                </Text>
                <Animated.View 
                  style={[
                    styles.underline,
                    emailFocused && styles.underlineActive,
                    errors.email && styles.underlineError
                  ]} 
                />
                {errors.email && (
                  <Text style={styles.errorText}>{errors.email}</Text>
                )}
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <View style={styles.inputContainer}>
                <Ionicons 
                  name="lock-closed-outline" 
                  size={20} 
                  color={passwordFocused ? '#3498db' : (errors.password ? '#ef4444' : '#94a3b8')} 
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, errors.password && styles.inputError]}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) {
                      setErrors({ ...errors, password: null });
                    }
                  }}
                  placeholder=" "
                  secureTextEntry={!showPassword}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                />
                <Text style={[styles.label, (passwordFocused || password) && styles.labelFocused, errors.password && styles.labelError]}>
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
                    passwordFocused && styles.underlineActive,
                    errors.password && styles.underlineError
                  ]} 
                />
                {errors.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}
              </View>
            </View>

            {/* Opciones */}
            <View style={styles.options}>
              <TouchableOpacity style={styles.checkboxContainer} onPress={() => setRemember((value) => !value)}>
                <View style={[styles.checkbox, remember && styles.checkboxChecked]}>
                  {remember && <Ionicons name="checkmark" size={12} color="white" />}
                </View>
                <Text style={styles.checkboxLabel}>Recordar sesión</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('RecuperarPassword')}>
                <Text style={styles.forgotPassword}>¿Olvidaste tu contraseña?</Text>
              </TouchableOpacity>
            </View>

            {/* Botón Login */}
            <TouchableOpacity 
              style={styles.loginButton}
              onPress={handleLogin}
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
                    <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
                    <Ionicons name="arrow-forward" size={20} color="white" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.googleDivider}>
              <View style={styles.googleDividerLine} />
              <Text style={styles.googleDividerText}>o continúa con</Text>
              <View style={styles.googleDividerLine} />
            </View>
            <TouchableOpacity
              style={styles.googleButton}
              onPress={handleGoogleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Ionicons name="logo-google" size={22} color="#4285F4" />
              <Text style={styles.googleButtonText}>Continuar con Google</Text>
            </TouchableOpacity>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>¿No tienes una cuenta?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.footerLink}> Regístrate aquí</Text>
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
  options: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#e1e5e9',
    borderRadius: 4,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#5a6c7d',
  },
  forgotPassword: {
    fontSize: 14,
    color: '#3498db',
    fontWeight: '500',
  },
  loginButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },
  gradientButton: {
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    minHeight: 56,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  googleDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  googleDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e1e5e9',
  },
  googleDividerText: {
    marginHorizontal: 14,
    color: '#64748b',
    fontSize: 13,
  },
  googleButton: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: '#dbe2ea',
    borderRadius: 12,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
  },
  googleButtonText: {
    color: '#1e293b',
    fontSize: 15,
    fontWeight: '600',
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

export default LoginScreen;
