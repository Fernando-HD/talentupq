import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import api, { apiMessage } from '../services/api';
import { useUser } from '../context/UserContext';

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

const ConversacionScreen = ({ navigation, route }) => {
  const { conversacionId } = route.params || {};
  const { user } = useUser();

  const [tipoUsuario] = useState('candidato');
  const [mensaje, setMensaje] = useState('');
  const [mensajes, setMensajes] = useState([]);
  /* Mensajes de ejemplo retirados.
  const mensajesDemo = [
    {
      id: 1,
      Mensaje: 'Hola, me interesa mucho esta vacante. ¿Cuándo podríamos tener una entrevista?',
      FechaEnvio: '2026-07-05 10:00',
      RemitenteTipo: 'candidato',
      Leido: true,
      FechaLectura: '2026-07-05 10:05',
    },
    {
      id: 2,
      Mensaje: '¡Hola! Gracias por tu interés. Podemos agendar una entrevista para el próximo lunes a las 10 am. ¿Te parece bien?',
      FechaEnvio: '2026-07-05 10:30',
      RemitenteTipo: 'empresa',
      Leido: true,
      FechaLectura: '2026-07-05 10:35',
    },
    {
      id: 3,
      Mensaje: 'Perfecto, el lunes a las 10 am me queda bien. ¿Me podrías enviar la ubicación?',
      FechaEnvio: '2026-07-05 11:00',
      RemitenteTipo: 'candidato',
      Leido: false,
      FechaLectura: null,
    },
  ]; */

  const scrollViewRef = useRef();
  const [mensajeEnviando, setMensajeEnviando] = useState(false);

  // Datos de la vacante y el otro usuario
  const [vacante, setVacante] = useState({ Puesto: '', EmpresaNombre: '' });

  const candidato = user.candidato || {};

  const cargarMensajes = useCallback(async (showError = false) => {
    try {
      const { data } = await api.get(`/conversaciones/${conversacionId}`);
        setVacante({
          Puesto: data.conversacion.Puesto,
          EmpresaNombre: data.conversacion.EmpresaNombre,
        });
        setMensajes(data.mensajes.map((item) => ({ ...item, id: item.MensajeID })));
        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (error) {
      if (showError) Alert.alert('Error', apiMessage(error));
    }
  }, [conversacionId]);

  useEffect(() => {
    cargarMensajes(true);
    const interval = setInterval(() => cargarMensajes(false), 2500);
    return () => clearInterval(interval);
  }, [cargarMensajes]);

  const handleEnviarMensaje = async () => {
    if (!mensaje.trim()) {
      Alert.alert('Error', 'Escribe un mensaje antes de enviar');
      return;
    }

    if (mensaje.length > 2000) {
      Alert.alert('Error', 'El mensaje no puede exceder los 2000 caracteres');
      return;
    }

    const text = mensaje.trim();
    const optimisticId = `pending-${Date.now()}`;
    setMensaje('');
    setMensajes((current) => [...current, {
      id: optimisticId,
      MensajeID: optimisticId,
      Mensaje: text,
      RemitenteTipo: 'candidato',
      FechaEnvio: new Date().toISOString(),
      Leido: false,
      pending: true,
    }]);
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 50);
    setMensajeEnviando(true);

    try {
      const { data } = await api.post(`/conversaciones/${conversacionId}/mensajes`, { mensaje: text });
      setMensajes((current) => current.map((item) => (
        item.id === optimisticId ? { ...data, id: data.MensajeID } : item
      )));
    } catch (error) {
      setMensajes((current) => current.filter((item) => item.id !== optimisticId));
      setMensaje(text);
      Alert.alert('Error', apiMessage(error));
    } finally {
      setMensajeEnviando(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('es-MX', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isMyMessage = (remitenteTipo) => {
    return remitenteTipo === tipoUsuario;
  };

  const getNombreRemitente = (remitenteTipo) => {
    if (remitenteTipo === 'empresa') {
      return vacante.EmpresaNombre;
    }
    return `${candidato.Nombre} ${candidato.ApellidoPaterno}`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <View style={styles.headerAvatar}>
            <View style={[
              styles.headerAvatarCircle,
              tipoUsuario === 'candidato' ? styles.headerAvatarCompany : styles.headerAvatarCandidate
            ]}>
              <Ionicons 
                name={tipoUsuario === 'candidato' ? 'business-outline' : 'person-outline'} 
                size={20} 
                color="white" 
              />
            </View>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.headerNombre} numberOfLines={1}>
              {tipoUsuario === 'candidato' ? vacante.EmpresaNombre : `${candidato.Nombre} ${candidato.ApellidoPaterno}`}
            </Text>
            <View style={styles.headerSubtitle}>
              <Ionicons name="briefcase-outline" size={12} color="#64748b" />
              <Text style={styles.headerSubtitleText}>{vacante.Puesto}</Text>
            </View>
          </View>
        </View>
        <View style={styles.headerRight} />
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.chatContainer}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
        >
          {mensajes.length > 0 ? (
            <View style={styles.messagesList}>
              {mensajes.map((msg) => {
                const esMio = isMyMessage(msg.RemitenteTipo);
                return (
                  <View
                    key={msg.id}
                    style={[styles.message, esMio ? styles.messageSent : styles.messageReceived]}
                  >
                    <View style={[styles.messageBubble, esMio ? styles.messageBubbleSent : styles.messageBubbleReceived]}>
                      <View style={styles.messageHeader}>
                        <View style={styles.senderInfo}>
                          <View style={[
                            styles.senderAvatar,
                            esMio ? styles.senderAvatarSent : styles.senderAvatarReceived
                          ]}>
                            <Ionicons 
                              name={msg.RemitenteTipo === 'empresa' ? 'business-outline' : 'person-outline'} 
                              size={12} 
                              color={esMio ? 'rgba(255,255,255,0.9)' : '#1e293b'} 
                            />
                          </View>
                          <Text style={[
                            styles.senderName,
                            esMio ? styles.senderNameSent : styles.senderNameReceived
                          ]}>
                            {getNombreRemitente(msg.RemitenteTipo)}
                          </Text>
                        </View>
                        <View style={styles.messageTime}>
                          <Ionicons name="time-outline" size={10} color={esMio ? 'rgba(255,255,255,0.7)' : '#94a3b8'} />
                          <Text style={[
                            styles.messageTimeText,
                            esMio ? styles.messageTimeTextSent : styles.messageTimeTextReceived
                          ]}>
                            {formatDate(msg.FechaEnvio)}
                          </Text>
                        </View>
                      </View>
                      <Text style={[
                        styles.messageBody,
                        esMio ? styles.messageBodySent : styles.messageBodyReceived
                      ]}>
                        {msg.Mensaje}
                      </Text>
                      {msg.pending && <Text style={styles.messageStatusText}>Enviando…</Text>}
                      {msg.Leido && esMio && (
                        <View style={styles.messageStatus}>
                          <Ionicons name="checkmark-done-outline" size={12} color="rgba(255,255,255,0.6)" />
                          <Text style={styles.messageStatusText}>Leído</Text>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyChat}>
              <View style={styles.emptyChatIcon}>
                <Ionicons name="chatbubbles-outline" size={48} color="#94a3b8" />
              </View>
              <Text style={styles.emptyChatTitle}>No hay mensajes aún</Text>
              <Text style={styles.emptyChatDescription}>
                ¡Envía el primer mensaje para iniciar la conversación!
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Formulario de mensaje */}
        <View style={styles.messageFormContainer}>
          <View style={styles.inputWrapper}>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.messageInput}
                placeholder="Escribe tu mensaje aquí..."
                placeholderTextColor="#94a3b8"
                value={mensaje}
                onChangeText={setMensaje}
                multiline
                maxLength={2000}
                editable={!mensajeEnviando}
                textAlignVertical="center"
              />
              <TouchableOpacity 
                style={[styles.btnSend, (!mensaje.trim() || mensajeEnviando) && styles.btnSendDisabled]}
                onPress={handleEnviarMensaje}
                disabled={!mensaje.trim() || mensajeEnviando}
              >
                <Ionicons name="send-outline" size={20} color="white" />
              </TouchableOpacity>
            </View>
            <View style={styles.inputFooter}>
              <Text style={[styles.charCounter, mensaje.length > 1800 && styles.charCounterWarning]}>
                {mensaje.length}/2000
              </Text>
              <Text style={styles.inputHint}>
                <Ionicons name="return-up-back-outline" size={12} color="#94a3b8" />
                {' '}Enter para enviar
              </Text>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    padding: 4,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  headerAvatar: {
    flexShrink: 0,
  },
  headerAvatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatarCandidate: {
    backgroundColor: '#2563eb',
  },
  headerAvatarCompany: {
    backgroundColor: '#10b981',
  },
  headerText: {
    flex: 1,
  },
  headerNombre: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  headerSubtitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerSubtitleText: {
    fontSize: 12,
    color: '#64748b',
  },
  headerRight: {
    width: 32,
  },
  keyboardContainer: {
    flex: 1,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  chatContent: {
    padding: 12,
    paddingBottom: 8,
    flexGrow: 1,
  },
  messagesList: {
    gap: 10,
  },
  message: {
    flexDirection: 'row',
  },
  messageSent: {
    justifyContent: 'flex-end',
  },
  messageReceived: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 10,
  },
  messageBubbleSent: {
    backgroundColor: '#2563eb',
    borderBottomRightRadius: 4,
  },
  messageBubbleReceived: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderBottomLeftRadius: 4,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
    flexWrap: 'wrap',
  },
  senderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  senderAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  senderAvatarSent: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  senderAvatarReceived: {
    backgroundColor: '#e2e8f0',
  },
  senderName: {
    fontSize: 11,
    fontWeight: '600',
  },
  senderNameSent: {
    color: 'rgba(255,255,255,0.9)',
  },
  senderNameReceived: {
    color: '#1e293b',
  },
  messageTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  messageTimeText: {
    fontSize: 9,
  },
  messageTimeTextSent: {
    color: 'rgba(255,255,255,0.7)',
  },
  messageTimeTextReceived: {
    color: '#94a3b8',
  },
  messageBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  messageBodySent: {
    color: 'white',
  },
  messageBodyReceived: {
    color: '#1e293b',
  },
  messageStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 2,
    marginTop: 4,
  },
  messageStatusText: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.6)',
  },
  emptyChat: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyChatIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyChatTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  emptyChatDescription: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
  },
  messageFormContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  inputWrapper: {
    gap: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#1e293b',
    maxHeight: 100,
    backgroundColor: '#f8fafc',
    minHeight: 40,
  },
  btnSend: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSendDisabled: {
    backgroundColor: '#94a3b8',
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  charCounter: {
    fontSize: 10,
    color: '#94a3b8',
  },
  charCounterWarning: {
    color: '#f59e0b',
  },
  inputHint: {
    fontSize: 10,
    color: '#94a3b8',
  },
});

export default ConversacionScreen;
