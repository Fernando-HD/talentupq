import React, { useState, useRef, useEffect } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api, { apiMessage } from '../services/api';

const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#0ea5e9',
  primaryDark: '#0284c7',
  primaryLight: '#38bdf8',
  secondary: '#2dd4bf',
  dark: '#0f172a',
  darkBg: '#020617',
  grayLight: '#f1f5f9',
  grayBorder: '#e2e8f0',
  gray: '#64748b',
  white: '#ffffff',
  text: '#1e293b',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
};

// ============================================================
// 🧠 CHATBOT LOCAL - SIN BACKEND
// ============================================================

const ChatbotScreen = ({ navigation }) => {
  const [mensaje, setMensaje] = useState('');
  const [mensajes, setMensajes] = useState([
    {
      id: 1,
      texto: `Bienvenido al sistema de asistencia inteligente de TalentUPQ.\n\nSistema listo. ¿En qué puedo asistirle?`,
      esUsuario: false,
      timestamp: new Date(),
    },
  ]);

  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef();

  // 📚 Base de conocimientos del chatbot
  const respuestas = [
    {
      palabras: ['hola', 'buenas', 'que tal', 'hey', 'saludos', 'ola', 'hi'],
      respuesta: '¡Hola! Soy el asistente virtual de TalentUPQ. ¿En qué puedo ayudarte hoy? 😊'
    },
    {
      palabras: ['postular', 'aplicar', 'candidatar', 'como aplicar', 'como postular', 'postulación'],
      respuesta: 'Para postularte a una vacante:\n\n1️⃣ Inicia sesión en tu cuenta\n2️⃣ Ve a la sección "Vacantes"\n3️⃣ Busca la vacante que te interesa\n4️⃣ Haz clic en "Postular"\n5️⃣ Completa tu perfil si no lo has hecho\n\n¿Necesitas ayuda con algún paso específico?'
    },
    {
      palabras: ['crear vacante', 'publicar vacante', 'nueva vacante', 'como publicar', 'vacante nueva'],
      respuesta: 'Para publicar una vacante:\n\n1️⃣ Ve a tu panel de empresa\n2️⃣ Haz clic en "Nueva Vacante"\n3️⃣ Completa todos los campos (puesto, requisitos, etc.)\n4️⃣ Espera la aprobación del administrador\n\n¿Te ayudo con algún campo específico?'
    },
    {
      palabras: ['requisitos', 'necesito', 'necesario', 'que se necesita', 'requisito'],
      respuesta: 'Los requisitos básicos son:\n✅ Tener un perfil completo\n✅ CV actualizado\n✅ Cumplir con los requisitos de la vacante\n✅ Ser estudiante o egresado UPQ\n\n¿Te gustaría saber más sobre algún requisito específico?'
    },
    {
      palabras: ['estado postulacion', 'como va mi postulacion', 'revisar postulacion', 'mi postulacion', 'estado'],
      respuesta: 'Puedes revisar el estado de tus postulaciones en la sección "Mis Postulaciones" de tu panel.\n\n📌 Estados posibles:\n• ⏳ Pendiente: La empresa aún no la revisa\n• ✅ Aceptado: ¡Felicidades! Te contactarán pronto\n• ❌ Rechazado: No te desanimes, hay más oportunidades'
    },
    {
      palabras: ['entrevista', 'como prepararme', 'consejos entrevista', 'preparar entrevista', 'entrevistas'],
      respuesta: '🎯 Consejos para tu entrevista:\n\n📌 Investiga sobre la empresa\n📌 Prepara respuestas sobre tu experiencia\n📌 Viste apropiadamente\n📌 Llega puntual\n📌 Prepara preguntas para el entrevistador\n\n¿Necesitas más consejos específicos?'
    },
    {
      palabras: ['curriculum', 'cv', 'hoja de vida', 'mejorar cv', 'como hacer cv', 'curriculo'],
      respuesta: '📄 Consejos para tu CV:\n\n• Manténlo de 1-2 páginas\n• Destaca logros, no solo tareas\n• Usa palabras clave de la industria\n• Revisa ortografía\n• Incluye habilidades técnicas y blandas\n\n¿Quieres que revise tu CV?'
    },
    {
      palabras: ['habilidades', 'que habilidades', 'competencias', 'skills', 'habilidad'],
      respuesta: '💻 Las habilidades más demandadas actualmente:\n\n• Python, Java, SQL\n• Análisis de datos\n• Trabajo en equipo\n• Comunicación efectiva\n• Gestión de proyectos\n\n¿Te gustaría agregar habilidades a tu perfil?'
    },
    {
      palabras: ['completar perfil', 'actualizar perfil', 'mi perfil', 'editar perfil', 'perfil'],
      respuesta: '📝 Para completar tu perfil:\n\n1️⃣ Ve a "Mi Perfil"\n2️⃣ Completa tus datos personales\n3️⃣ Agrega tu experiencia laboral\n4️⃣ Sube tu CV y foto\n5️⃣ Añade tus habilidades\n\n¡Un perfil completo atrae más oportunidades!'
    },
    {
      palabras: ['vacantes disponibles', 'que vacantes hay', 'buscar trabajo', 'oportunidades', 'vacante', 'empleo'],
      respuesta: '🔍 Puedes ver todas las vacantes disponibles en la sección "Vacantes".\n\nFiltros disponibles:\n• Modalidad (presencial/remoto/híbrido)\n• Tipo de contrato\n• Grado de estudios\n\n¿Te ayudo a buscar algo específico?'
    },
    {
      palabras: ['salario', 'sueldo', 'cuanto pagan', 'rango salarial', 'pagan'],
      respuesta: '💰 El salario varía según la empresa y el puesto. Puedes ver el rango salarial en cada vacante.\n\n¿Te gustaría que te ayude a buscar vacantes dentro de tu rango esperado?'
    },
    {
      palabras: ['tiempo respuesta', 'cuanto tardan', 'demoran', 'cuanto tiempo', 'respuesta'],
      respuesta: '⏱️ El tiempo de respuesta varía por empresa. Generalmente, las empresas responden entre 1-3 semanas.\n\nPuedes dar seguimiento desde "Mis Postulaciones".'
    },
    {
      palabras: ['gracias', 'muchas gracias', 'ok', 'excelente', 'perfecto', 'graciass'],
      respuesta: '¡De nada! ¿Necesitas ayuda con algo más? Estoy aquí para ti. 🤗'
    },
    {
      palabras: ['ayuda', 'que puedes hacer', 'comandos', 'funciones', 'que haces', 'puedes hacer'],
      respuesta: '💡 Puedo ayudarte con:\n\n💬 Preguntas sobre postulación\n📝 Consejos para entrevistas\n📄 Mejora de tu CV\n🔍 Información de vacantes\n📊 Estado de tus postulaciones\n\n¿Qué te gustaría saber?'
    },
    {
      palabras: ['contacto', 'soporte', 'quejas', 'problemas', 'contactar', 'email', 'teléfono'],
      respuesta: '📧 Puedes contactar a soporte:\n\nEmail: bolsa.trabajo@upq.edu.mx\nTeléfono: (773) 108-7368\n\n¿Hay algo específico en lo que pueda ayudarte?'
    },
    {
      palabras: ['adios', 'chao', 'bye', 'nos vemos', 'hasta luego'],
      respuesta: '¡Hasta luego! Fue un placer ayudarte. Recuerda que estoy aquí cuando me necesites. 👋\n\n¡Mucho éxito en tu búsqueda de empleo!'
    },
  ];

  // Sugerencias rápidas
  const sugerencias = [
    '¿Cómo me postulo a una vacante?',
    'Consejos para entrevistas',
    '¿Cómo mejorar mi CV?',
    '¿Qué vacantes hay disponibles?',
    '¿Cómo actualizo mi perfil?',
  ];

  useEffect(() => {
    scrollToBottom();
  }, [mensajes]);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // 🔍 Buscar respuesta según el mensaje
  const buscarRespuesta = (texto) => {
    const textoLower = texto.toLowerCase().trim();
    
    // Buscar coincidencias con las palabras clave
    for (const item of respuestas) {
      for (const palabra of item.palabras) {
        if (textoLower.includes(palabra)) {
          return item.respuesta;
        }
      }
    }
    
    // Si no hay coincidencia, respuesta por defecto
    return `Lo siento, no entendí tu pregunta. 😅\n\nPuedo ayudarte con:\n• Proceso de postulación\n• Consejos para entrevistas\n• Mejora de tu CV\n• Información de vacantes\n\nEscribe "ayuda" para ver más opciones.`;
  };

  const enviarMensaje = async (valor) => {
    const texto = valor.trim();
    if (!texto) return;

    if (texto.length > 500) {
      Alert.alert('Error', 'El mensaje no puede exceder los 500 caracteres');
      return;
    }

    const nuevoMensaje = {
      id: Date.now(),
      texto: texto,
      esUsuario: true,
      timestamp: new Date(),
    };
    setMensajes(prev => [...prev, nuevoMensaje]);
    setMensaje('');
    setIsTyping(true);
    try {
      const { data } = await api.post('/chatbot', { mensaje: texto });
      const respuestaBot = {
        id: Date.now() + 1,
        texto: data.respuesta,
        esUsuario: false,
        timestamp: new Date(),
      };
      setMensajes(prev => [...prev, respuestaBot]);
    } catch (error) {
      Alert.alert('No fue posible consultar al asistente', apiMessage(error));
      setMensajes(prev => [...prev, {
        id: Date.now() + 1,
        texto: 'No pude conectarme con el asistente. Comprueba tu conexión e inténtalo nuevamente.',
        esUsuario: false,
        timestamp: new Date(),
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleEnviarMensaje = () => {
    enviarMensaje(mensaje);
  };

  const handleLimpiarChat = () => {
    Alert.alert(
      'Limpiar conversación',
      '¿Estás seguro de que quieres limpiar el historial?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpiar',
          onPress: () => {
            setMensajes([
              {
                id: 1,
                texto: '⟫ Historial limpiado. Sistema listo para nueva consulta.',
                esUsuario: false,
                timestamp: new Date(),
              },
            ]);
          },
        },
      ]
    );
  };

  const handleSugerencia = (sugerencia) => {
    enviarMensaje(sugerencia);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.botAvatar}>
            <Ionicons name="hardware-chip-outline" size={22} color="white" />
            <View style={styles.onlineDot} />
          </View>
          <View style={styles.botInfo}>
            <Text style={styles.botName}>⟫ Asistente Virtual AI</Text>
            <View style={styles.botStatus}>
              <Ionicons name="ellipse" size={8} color="#2dd4bf" />
              <Text style={styles.botStatusText}>Conectado · 24/7</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity onPress={handleLimpiarChat} style={styles.clearButton}>
          <Ionicons name="trash-outline" size={18} color="rgba(255,255,255,0.6)" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        {/* Mensajes */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {mensajes.map((msg) => (
            <View key={msg.id} style={[styles.message, msg.esUsuario ? styles.userMessage : styles.botMessage]}>
              <View style={[styles.messageAvatar, msg.esUsuario ? styles.userAvatar : styles.botAvatar]}>
                <Ionicons 
                  name={msg.esUsuario ? 'person-outline' : 'hardware-chip-outline'} 
                  size={16} 
                  color="white" 
                />
              </View>
              <View style={[styles.messageContent, msg.esUsuario ? styles.userContent : styles.botContent]}>
                <View style={[styles.messageText, msg.esUsuario ? styles.userText : styles.botText]}>
                  <Text style={msg.esUsuario ? styles.userTextStyle : styles.botTextStyle}>
                    {msg.texto}
                  </Text>
                </View>
                <Text style={[styles.messageTime, msg.esUsuario && styles.userTime]}>
                  {formatTime(msg.timestamp)}
                </Text>
              </View>
            </View>
          ))}

          {/* Indicador de escritura */}
          {isTyping && (
            <View style={[styles.message, styles.botMessage]}>
              <View style={[styles.messageAvatar, styles.botAvatar]}>
                <Ionicons name="hardware-chip-outline" size={16} color="white" />
              </View>
              <View style={[styles.messageContent, styles.botContent]}>
                <View style={[styles.messageText, styles.botText]}>
                  <View style={styles.typingIndicator}>
                    <View style={styles.typingDot} />
                    <View style={[styles.typingDot, styles.typingDotDelay]} />
                    <View style={[styles.typingDot, styles.typingDotDelay2]} />
                  </View>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Sugerencias */}
        <View style={styles.sugerenciasContainer}>
          <View style={styles.sugerenciasHeader}>
            <Ionicons name="hardware-chip-outline" size={14} color="#0ea5e9" />
            <Text style={styles.sugerenciasTitle}>Comandos rápidos</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sugerenciasScroll}>
            <View style={styles.sugerenciasButtons}>
              {sugerencias.map((sug, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.sugerenciaBtn}
                  onPress={() => handleSugerencia(sug)}
                >
                  <Ionicons name="terminal-outline" size={12} color="#0ea5e9" />
                  <Text style={styles.sugerenciaBtnText}>{sug}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <Ionicons name="code-outline" size={18} color="#0ea5e9" style={styles.inputIcon} />
            <TextInput
              style={styles.chatInput}
              placeholder="Ingrese su consulta..."
              placeholderTextColor="#94a3b8"
              value={mensaje}
              onChangeText={setMensaje}
              multiline
              maxLength={500}
              returnKeyType="send"
              onSubmitEditing={handleEnviarMensaje}
            />
            <TouchableOpacity 
              style={[styles.sendBtn, !mensaje.trim() && styles.sendBtnDisabled]}
              onPress={handleEnviarMensaje}
              disabled={!mensaje.trim()}
            >
              {isTyping ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="send-outline" size={18} color="white" />
              )}
            </TouchableOpacity>
          </View>
          <View style={styles.inputFooter}>
            <View style={styles.inputFooterLeft}>
              <Ionicons name="shield-checkmark-outline" size={12} color="#94a3b8" />
              <Text style={styles.inputFooterText}>Encriptado · Respuesta inmediata</Text>
            </View>
            <Text style={[styles.charCounter, mensaje.length > 450 && styles.charCounterWarning]}>
              {mensaje.length}/500
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#0f172a',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(14, 165, 233, 0.3)',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  backButton: {
    padding: 4,
  },
  botAvatar: {
    position: 'relative',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0ea5e9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2dd4bf',
    borderWidth: 2,
    borderColor: '#0f172a',
  },
  botInfo: {
    flex: 1,
  },
  botName: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
    letterSpacing: -0.5,
  },
  botStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  botStatusText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
  },
  clearButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  keyboardContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
    flexGrow: 1,
  },
  message: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  botMessage: {
    justifyContent: 'flex-start',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  botAvatar: {
    backgroundColor: '#0ea5e9',
  },
  userAvatar: {
    backgroundColor: '#475569',
  },
  messageContent: {
    maxWidth: '78%',
  },
  botContent: {
    alignItems: 'flex-start',
  },
  userContent: {
    alignItems: 'flex-end',
  },
  messageText: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  botText: {
    backgroundColor: 'white',
    borderLeftWidth: 2,
    borderLeftColor: '#0ea5e9',
    borderBottomLeftRadius: 4,
  },
  userText: {
    backgroundColor: '#0ea5e9',
    borderBottomRightRadius: 4,
  },
  botTextStyle: {
    fontSize: 14,
    color: '#1e293b',
    lineHeight: 20,
  },
  userTextStyle: {
    fontSize: 14,
    color: 'white',
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 4,
  },
  userTime: {
    textAlign: 'right',
  },
  typingIndicator: {
    flexDirection: 'row',
    gap: 4,
    paddingVertical: 2,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0ea5e9',
    opacity: 0.5,
  },
  typingDotDelay: {
    opacity: 0.7,
  },
  typingDotDelay2: {
    opacity: 1,
  },
  sugerenciasContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  sugerenciasHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  sugerenciasTitle: {
    fontSize: 11,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '600',
  },
  sugerenciasScroll: {
    flexDirection: 'row',
  },
  sugerenciasButtons: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  sugerenciaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  sugerenciaBtnText: {
    fontSize: 12,
    color: '#1e293b',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  inputWrapper: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
    opacity: 0.7,
  },
  chatInput: {
    flex: 1,
    paddingHorizontal: 44,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    fontSize: 14,
    color: '#1e293b',
    backgroundColor: '#f8fafc',
    maxHeight: 80,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  sendBtn: {
    position: 'absolute',
    right: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: '#0ea5e9',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 36,
    minHeight: 36,
  },
  sendBtnDisabled: {
    backgroundColor: '#94a3b8',
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingHorizontal: 4,
  },
  inputFooterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  inputFooterText: {
    fontSize: 10,
    color: '#94a3b8',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  charCounter: {
    fontSize: 10,
    color: '#94a3b8',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  charCounterWarning: {
    color: '#f59e0b',
  },
});

export default ChatbotScreen;
