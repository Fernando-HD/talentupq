import React, { createContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const FeedbackContext = createContext(null);

const toneFor = (title = '') => {
  const value = String(title || '').toLowerCase();
  if (value.includes('error') || value.includes('no fue posible')) {
    return { color: '#dc2626', soft: '#fef2f2', icon: 'alert-circle' };
  }
  if (value.includes('éxito') || value.includes('exitoso') || value.includes('actualizado')) {
    return { color: '#059669', soft: '#ecfdf5', icon: 'checkmark-circle' };
  }
  if (value.includes('eliminar') || value.includes('cerrar sesión') || value.includes('cancelar')) {
    return { color: '#d97706', soft: '#fffbeb', icon: 'warning' };
  }
  return { color: '#2563eb', soft: '#eff6ff', icon: 'information-circle' };
};

export const FeedbackProvider = ({ children }) => {
  const [dialog, setDialog] = useState(null);
  const scale = useRef(new Animated.Value(0.94)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const close = (button) => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 140, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 0.96, duration: 140, useNativeDriver: true }),
    ]).start(() => {
      setDialog(null);
      button?.onPress?.();
    });
  };

  const showAlert = (title, message, buttons, options) => {
    const normalizedButtons = buttons?.length ? buttons : [{ text: 'Entendido' }];
    setDialog({ title, message, buttons: normalizedButtons, options });
    scale.setValue(0.94);
    opacity.setValue(0);
    requestAnimationFrame(() => {
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, tension: 90, friction: 10, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      ]).start();
    });
  };

  useEffect(() => {
    const nativeAlert = Alert.alert;
    Alert.alert = showAlert;
    return () => { Alert.alert = nativeAlert; };
  });

  const value = useMemo(() => ({ showAlert }), []);
  const tone = toneFor(dialog?.title);
  const cancelButton = dialog?.buttons?.find((button) => button.style === 'cancel');

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      <Modal transparent visible={Boolean(dialog)} animationType="none" statusBarTranslucent>
        <Pressable
          style={styles.backdrop}
          onPress={() => dialog?.options?.cancelable !== false && close(cancelButton)}
        >
          <Animated.View
            style={[styles.dialog, { opacity, transform: [{ scale }] }]}
            onStartShouldSetResponder={() => true}
          >
            <View style={[styles.iconWrap, { backgroundColor: tone.soft }]}> 
              <Ionicons name={tone.icon} size={30} color={tone.color} />
            </View>
            <Text style={styles.title}>{dialog?.title}</Text>
            {Boolean(dialog?.message) && <Text style={styles.message}>{dialog.message}</Text>}
            <View style={styles.actions}>
              {dialog?.buttons?.map((button, index) => {
                const destructive = button.style === 'destructive';
                const cancel = button.style === 'cancel';
                return (
                  <TouchableOpacity
                    key={`${button.text}-${index}`}
                    style={[
                      styles.button,
                      cancel ? styles.secondaryButton : styles.primaryButton,
                      destructive && styles.destructiveButton,
                    ]}
                    onPress={() => close(button)}
                    activeOpacity={0.82}
                  >
                    <Text style={[styles.buttonText, cancel && styles.secondaryButtonText]}>{button.text}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Animated.View>
        </Pressable>
      </Modal>
    </FeedbackContext.Provider>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.58)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  dialog: {
    width: '100%',
    maxWidth: 390,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    padding: 22,
    alignItems: 'center',
    shadowColor: '#0f172a',
    shadowOpacity: 0.25,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 16 },
    elevation: 20,
  },
  iconWrap: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: { fontSize: 20, lineHeight: 26, fontWeight: '800', color: '#0f172a', textAlign: 'center' },
  message: { marginTop: 8, fontSize: 14, lineHeight: 21, color: '#475569', textAlign: 'center' },
  actions: { width: '100%', gap: 9, marginTop: 20 },
  button: { minHeight: 46, borderRadius: 13, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  primaryButton: { backgroundColor: '#2563eb' },
  destructiveButton: { backgroundColor: '#dc2626' },
  secondaryButton: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1' },
  buttonText: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
  secondaryButtonText: { color: '#334155' },
});

export default FeedbackContext;
