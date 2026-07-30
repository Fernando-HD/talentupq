import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api, { apiMessage } from '../services/api';

const RecuperarPasswordScreen = ({ navigation }) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const run = async () => {
    try {
      setLoading(true);
      if (step === 1) {
        const normalizedEmail = email.trim().toLowerCase();
        if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
          return Alert.alert('Datos incompletos', 'Ingresa un correo válido.');
        }
        const { data } = await api.post('/auth/password/forgot', { email: normalizedEmail });
        Alert.alert('Código solicitado', data.message);
        setStep(2);
      } else if (step === 2) {
        if (!/^\d{6}$/.test(code)) {
          return Alert.alert('Código inválido', 'Ingresa los 6 dígitos recibidos por correo.');
        }
        const { data } = await api.post('/auth/password/verify', {
          email: email.trim().toLowerCase(),
          code,
        });
        setResetToken(data.reset_token);
        setStep(3);
      } else {
        if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
          return Alert.alert('Contraseña insegura', 'Usa 8 caracteres, mayúscula, minúscula y número.');
        }
        if (password !== confirmPassword) {
          return Alert.alert('Revisa los datos', 'Las contraseñas no coinciden.');
        }
        await api.post('/auth/password/reset', { password }, {
          headers: { Authorization: `Bearer ${resetToken}` },
        });
        Alert.alert('Contraseña actualizada', 'Ya puedes iniciar sesión.', [
          { text: 'Continuar', onPress: () => navigation.replace('Login') },
        ]);
      }
    } catch (error) {
      Alert.alert('No fue posible continuar', apiMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const title = ['Recuperar contraseña', 'Verificar código', 'Nueva contraseña'][step - 1];
  const subtitle = [
    'Te enviaremos un código temporal a tu correo.',
    `Ingresa el código enviado a ${email.trim()}.`,
    'Elige una contraseña segura para tu cuenta.',
  ][step - 1];

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.back} onPress={() => step === 1 ? navigation.goBack() : setStep(step - 1)}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <View style={styles.card}>
          <LinearGradient colors={['#3498db', '#2ecc71']} style={styles.icon}>
            <Ionicons name={step === 1 ? 'mail' : step === 2 ? 'key' : 'lock-open'} size={34} color="white" />
          </LinearGradient>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>

          {step === 1 && <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Correo electrónico" keyboardType="email-address" autoCapitalize="none" />}
          {step === 2 && <TextInput style={[styles.input, styles.code]} value={code} onChangeText={(value) => setCode(value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" keyboardType="number-pad" maxLength={6} />}
          {step === 3 && (
            <>
              <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Nueva contraseña" secureTextEntry />
              <TextInput style={styles.input} value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Confirmar contraseña" secureTextEntry />
              <Text style={styles.hint}>Mínimo 8 caracteres, mayúscula, minúscula y número.</Text>
            </>
          )}

          <TouchableOpacity style={styles.button} onPress={run} disabled={loading}>
            <LinearGradient colors={['#3498db', '#2ecc71']} style={styles.buttonGradient}>
              {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>{step === 1 ? 'Enviar código' : step === 2 ? 'Verificar' : 'Guardar contraseña'}</Text>}
            </LinearGradient>
          </TouchableOpacity>
          {step === 2 && <TouchableOpacity onPress={() => setStep(1)}><Text style={styles.link}>Solicitar un código nuevo</Text></TouchableOpacity>}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  back: { position: 'absolute', top: Platform.OS === 'ios' ? 54 : 24, left: 20, padding: 12, zIndex: 2 },
  card: { backgroundColor: 'white', borderRadius: 24, padding: 28, shadowColor: '#0f172a', shadowOpacity: 0.1, shadowRadius: 24, elevation: 5 },
  icon: { width: 72, height: 72, borderRadius: 36, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  title: { fontSize: 27, fontWeight: '800', color: '#1e293b', textAlign: 'center' },
  subtitle: { fontSize: 15, color: '#64748b', lineHeight: 22, textAlign: 'center', marginTop: 8, marginBottom: 26 },
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 12, padding: 15, fontSize: 16, color: '#1e293b', marginBottom: 14, backgroundColor: '#f8fafc' },
  code: { textAlign: 'center', letterSpacing: 10, fontSize: 24, fontWeight: '700' },
  hint: { fontSize: 12, color: '#64748b', marginBottom: 5 },
  button: { borderRadius: 12, overflow: 'hidden', marginTop: 14 },
  buttonGradient: { minHeight: 52, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: 'white', fontSize: 16, fontWeight: '700' },
  link: { color: '#2563eb', textAlign: 'center', marginTop: 18, fontWeight: '600' },
});

export default RecuperarPasswordScreen;
