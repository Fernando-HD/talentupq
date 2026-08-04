import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

const parseDate = (value) => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value || '')) {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day, 12);
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
};

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const toISODate = (value) => (value ? formatDate(parseDate(value)) : '');

export default function DateField({
  value,
  onChange,
  placeholder = 'Seleccionar fecha',
  maximumDate,
  minimumDate,
  optional = false,
  style,
}) {
  const [showIOSPicker, setShowIOSPicker] = useState(false);

  const selectDate = (selectedDate) => {
    if (selectedDate) onChange(formatDate(selectedDate));
  };

  const openPicker = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: parseDate(value),
        mode: 'date',
        maximumDate,
        minimumDate,
        onChange: (event, selectedDate) => {
          if (event.type === 'set') selectDate(selectedDate);
        },
      });
      return;
    }
    setShowIOSPicker((current) => !current);
  };

  return (
    <View>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={value ? `Fecha seleccionada ${value}` : placeholder}
        activeOpacity={0.75}
        style={[styles.field, style]}
        onPress={openPicker}
      >
        <Text style={[styles.value, !value && styles.placeholder]}>{value || placeholder}</Text>
        <Ionicons name="calendar-outline" size={19} color="#2563eb" />
      </TouchableOpacity>
      {optional && value ? (
        <TouchableOpacity style={styles.clearButton} onPress={() => onChange('')}>
          <Ionicons name="close-circle-outline" size={15} color="#64748b" />
          <Text style={styles.clearText}>Dejar sin fecha</Text>
        </TouchableOpacity>
      ) : null}
      {Platform.OS === 'ios' && showIOSPicker ? (
        <View style={styles.iosPicker}>
          <DateTimePicker
            value={parseDate(value)}
            mode="date"
            display="inline"
            maximumDate={maximumDate}
            minimumDate={minimumDate}
            onChange={(_, selectedDate) => selectDate(selectedDate)}
          />
          <TouchableOpacity style={styles.doneButton} onPress={() => setShowIOSPicker(false)}>
            <Text style={styles.doneText}>Listo</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    minHeight: 48,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  value: { color: '#1e293b', fontSize: 14, flexShrink: 1 },
  placeholder: { color: '#94a3b8' },
  clearButton: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 7 },
  clearText: { color: '#64748b', fontSize: 12 },
  iosPicker: { marginTop: 8, borderRadius: 12, backgroundColor: '#f8fafc', overflow: 'hidden' },
  doneButton: { alignSelf: 'flex-end', paddingHorizontal: 18, paddingVertical: 10 },
  doneText: { color: '#2563eb', fontWeight: '700' },
});
