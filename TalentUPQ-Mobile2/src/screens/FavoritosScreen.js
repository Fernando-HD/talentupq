import React from 'react';
import {
  FlatList,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';

const FavoritosScreen = ({ navigation }) => {
  const { favoritos, toggleFavorito } = useUser();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Ionicons name="cloud-offline-outline" size={20} color="#2563eb" />
          <Text style={styles.title}>Vacantes sin conexión</Text>
        </View>
        <View style={styles.iconButton} />
      </View>

      <View style={styles.notice}>
        <Ionicons name="phone-portrait-outline" size={20} color="#0369a1" />
        <Text style={styles.noticeText}>Estas vacantes están guardadas en tu teléfono y puedes consultarlas sin internet.</Text>
      </View>

      <FlatList
        data={favoritos}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={favoritos.length ? styles.list : styles.emptyList}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('DetalleVacante', { vacanteId: item.id })}>
            <View style={styles.cardTop}>
              <View style={styles.companyIcon}><Ionicons name="business-outline" size={22} color="#2563eb" /></View>
              <View style={styles.cardText}>
                <Text style={styles.position}>{item.puesto}</Text>
                <Text style={styles.company}>{item.empresa_nombre}</Text>
              </View>
              <TouchableOpacity onPress={() => toggleFavorito(item)} style={styles.remove}>
                <Ionicons name="bookmark" size={22} color="#2563eb" />
              </TouchableOpacity>
            </View>
            <View style={styles.meta}>
              <Text style={styles.metaText}>{item.ubicacion}</Text>
              <Text style={styles.metaText}>{item.modalidad}</Text>
              <Text style={styles.salary}>{item.salario}</Text>
            </View>
            <Text style={styles.summary} numberOfLines={3}>{item.resumen}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="bookmark-outline" size={62} color="#94a3b8" />
            <Text style={styles.emptyTitle}>Todavía no guardas vacantes</Text>
            <Text style={styles.emptyText}>Abre una vacante y toca el marcador para tenerla disponible sin conexión.</Text>
            <TouchableOpacity style={styles.searchButton} onPress={() => navigation.navigate('Vacantes')}>
              <Text style={styles.searchText}>Explorar vacantes</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  iconButton: { width: 38, padding: 6 },
  headerTitle: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  title: { fontSize: 17, fontWeight: '700', color: '#1e293b' },
  notice: { flexDirection: 'row', gap: 10, margin: 14, padding: 13, borderRadius: 12, backgroundColor: '#e0f2fe' },
  noticeText: { flex: 1, color: '#075985', fontSize: 13, lineHeight: 19 },
  list: { padding: 14, paddingTop: 0 },
  emptyList: { flexGrow: 1 },
  card: { backgroundColor: 'white', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  cardTop: { flexDirection: 'row', alignItems: 'center' },
  companyIcon: { width: 42, height: 42, borderRadius: 12, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center' },
  cardText: { flex: 1, marginLeft: 11 },
  position: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  company: { fontSize: 13, color: '#64748b', marginTop: 3 },
  remove: { padding: 8 },
  meta: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  metaText: { fontSize: 12, color: '#475569', backgroundColor: '#f1f5f9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, textTransform: 'capitalize' },
  salary: { fontSize: 12, color: '#166534', backgroundColor: '#dcfce7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  summary: { color: '#64748b', fontSize: 13, lineHeight: 19, marginTop: 12 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 36 },
  emptyTitle: { fontSize: 19, fontWeight: '700', color: '#1e293b', marginTop: 16 },
  emptyText: { color: '#64748b', textAlign: 'center', lineHeight: 20, marginTop: 8 },
  searchButton: { backgroundColor: '#2563eb', borderRadius: 10, paddingHorizontal: 22, paddingVertical: 12, marginTop: 20 },
  searchText: { color: 'white', fontWeight: '700' },
});

export default FavoritosScreen;
