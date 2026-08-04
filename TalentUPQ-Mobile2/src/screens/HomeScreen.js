import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../styles/theme';

const { width, height } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const openExternalPage = async (url) => {
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('No fue posible abrir el enlace', 'Inténtalo nuevamente desde tu navegador.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* HEADER - Con más padding superior */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <Ionicons name="briefcase" size={24} color={theme.colors.primary} />
          </View>
          <Text style={styles.logoText}>TalentUPQ</Text>
        </View>
        <TouchableOpacity 
          onPress={() => navigation.replace('Login')}
          style={styles.logoutButton}
        >
          <Ionicons name="log-out-outline" size={22} color={theme.colors.gray} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        automaticallyAdjustContentInsets={true}
        keyboardShouldPersistTaps="handled"
      >
        
        {/* HERO SECTION - Con padding superior reducido */}
        <View style={styles.heroSection}>
          <View style={styles.heroBackground}>
            <View style={[styles.floatingShape, styles.shape1]} />
            <View style={[styles.floatingShape, styles.shape2]} />
            <View style={[styles.floatingShape, styles.shape3]} />
          </View>
          
          <View style={styles.heroContent}>
            <View style={styles.heroBadge}>
              <Ionicons name="rocket" size={14} color={theme.colors.primary} />
              <Text style={styles.heroBadgeText}>Plataforma líder en empleo</Text>
            </View>
            
            <Text style={styles.heroTitle}>
              Encuentra el trabajo {'\n'}
              <Text style={styles.gradientText}>de tus sueños</Text>
            </Text>
            
            <Text style={styles.heroSubtitle}>
              Conectamos a los mejores talentos con las empresas más innovadoras de la región
            </Text>
            
            <View style={styles.heroButtons}>
              <TouchableOpacity 
                style={styles.btnPrimary}
                onPress={() => navigation.navigate('Register')}
              >
                <LinearGradient
                  colors={[theme.colors.primary, theme.colors.primaryDark]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientButton}
                >
                  <Ionicons name="person-add" size={18} color="white" />
                  <Text style={styles.btnPrimaryText}>Crear cuenta gratuita</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.btnSecondary}
                onPress={() => navigation.navigate('Login')}
              >
                <Ionicons name="log-in" size={18} color={theme.colors.dark} />
                <Text style={styles.btnSecondaryText}>Iniciar sesión</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>500+</Text>
                <Text style={styles.statLabel}>Empresas</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>2500+</Text>
                <Text style={styles.statLabel}>Candidatos</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>98%</Text>
                <Text style={styles.statLabel}>Satisfacción</Text>
              </View>
            </View>
          </View>
        </View>

        {/* FEATURES SECTION */}
        <View style={styles.featuresSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>¿Cómo funciona?</Text>
            </View>
            <Text style={styles.sectionTitle}>
              Una plataforma diseñada para {'\n'}
              <Text style={styles.gradientText}>conectar talento</Text>
              {' '}con oportunidades
            </Text>
            <Text style={styles.sectionSubtitle}>
              TalentUPQ es el puente entre profesionales destacados y empresas que buscan lo mejor
            </Text>
          </View>

          <View style={styles.featuresGrid}>
            <View style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <Ionicons name="person" size={28} color="white" />
              </View>
              <Text style={styles.featureTitle}>Para Candidatos</Text>
              <Text style={styles.featureDescription}>
                Crea tu perfil profesional, destaca tus habilidades y encuentra oportunidades acordes a tus metas.
              </Text>
              <View style={styles.featureUnderline} />
              <TouchableOpacity style={styles.featureLink} onPress={() => navigation.navigate('Register')}>
                <Text style={styles.featureLinkText}>Regístrate como candidato</Text>
                <Ionicons name="arrow-forward" size={16} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: theme.colors.secondary }]}>
                <Ionicons name="business" size={28} color="white" />
              </View>
              <Text style={styles.featureTitle}>Para Empresas</Text>
              <Text style={styles.featureDescription}>
                Publica vacantes, gestiona postulaciones y encuentra al talento que tu empresa necesita.
              </Text>
              <View style={styles.featureUnderline} />
              <TouchableOpacity
                style={styles.featureLink}
                onPress={() => openExternalPage('https://talentupq-api.onrender.com/registro?tipo=empresa')}
              >
                <Text style={styles.featureLinkText}>Regístrate como empresa</Text>
                <Ionicons name="arrow-forward" size={16} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: '#8b5cf6' }]}>
                <Ionicons name="school" size={28} color="white" />
              </View>
              <Text style={styles.featureTitle}>Para la UPQ</Text>
              <Text style={styles.featureDescription}>
                Nuestros egresados acceden a las mejores oportunidades laborales del mercado.
              </Text>
              <View style={styles.featureUnderline} />
              <TouchableOpacity
                style={styles.featureLink}
                onPress={() => openExternalPage('https://www.upq.mx/')}
              >
                <Text style={styles.featureLinkText}>Conoce más</Text>
                <Ionicons name="arrow-forward" size={16} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* BENEFITS SECTION */}
        <LinearGradient
          colors={['#f8fafc', '#eff6ff']}
          style={styles.benefitsSection}
        >
          <View style={styles.benefitsContent}>
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>Ventajas exclusivas</Text>
            </View>
            <Text style={styles.benefitsTitle}>
              ¿Por qué elegir {'\n'}
              <Text style={styles.gradientText}>TalentUPQ</Text>?
            </Text>
            <Text style={styles.benefitsSubtitle}>
              Descubre los beneficios que nos hacen la plataforma preferida por profesionales y empresas
            </Text>
          </View>

          <View style={styles.benefitsGrid}>
            <View style={styles.benefitItem}>
              <View style={styles.benefitIcon}>
                <Ionicons name="flash" size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.benefitInfo}>
                <Text style={styles.benefitTitle}>Proceso rápido</Text>
                <Text style={styles.benefitDescription}>Postulaciones ágiles y seguimiento en tiempo real</Text>
              </View>
            </View>

            <View style={styles.benefitItem}>
              <View style={styles.benefitIcon}>
                <Ionicons name="shield-checkmark" size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.benefitInfo}>
                <Text style={styles.benefitTitle}>Seguridad garantizada</Text>
                <Text style={styles.benefitDescription}>Tus datos están protegidos con los más altos estándares</Text>
              </View>
            </View>

            <View style={styles.benefitItem}>
              <View style={styles.benefitIcon}>
                <Ionicons name="stats-chart" size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.benefitInfo}>
                <Text style={styles.benefitTitle}>Match inteligente</Text>
                <Text style={styles.benefitDescription}>Algoritmo que conecta talento con oportunidades ideales</Text>
              </View>
            </View>

            <View style={styles.benefitItem}>
              <View style={styles.benefitIcon}>
                <Ionicons name="headset" size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.benefitInfo}>
                <Text style={styles.benefitTitle}>Soporte dedicado</Text>
                <Text style={styles.benefitDescription}>Equipo siempre disponible para ayudarte</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* CTA SECTION */}
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.ctaSection}
        >
          <View style={styles.ctaContent}>
            <Text style={styles.ctaTitle}>
              ¿Listo para comenzar tu {'\n'}
              <Text style={styles.ctaGradientText}>nuevo camino</Text>
              {' '}profesional?
            </Text>
            <Text style={styles.ctaSubtitle}>
              Únete a miles de profesionales que ya encontraron su oportunidad ideal
            </Text>
            <View style={styles.ctaButtons}>
              <TouchableOpacity 
                style={styles.ctaPrimaryBtn}
                onPress={() => navigation.navigate('Register')}
              >
                <Ionicons name="person-add" size={20} color={theme.colors.dark} />
                <Text style={styles.ctaPrimaryText}>Crear cuenta ahora</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.ctaSecondaryBtn}
                onPress={() => navigation.navigate('Login')}
              >
                <Ionicons name="log-in" size={20} color="white" />
                <Text style={styles.ctaSecondaryText}>Iniciar sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.bottomSpacer} />

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: 'white',
    // Aumentamos el padding superior para bajar el contenido
    paddingTop: Platform.OS === 'ios' ? 40 : 30,
    paddingBottom: 16,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: `${theme.colors.primary}10`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
  },
  logoutButton: {
    padding: 4,
  },
  heroSection: {
    position: 'relative',
    minHeight: height * 0.7,
    paddingHorizontal: theme.spacing.lg,
    // Reducimos el padding vertical superior
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
    backgroundColor: '#f8fafc',
    overflow: 'hidden',
  },
  heroBackground: {
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
    width: 200,
    height: 200,
    backgroundColor: theme.colors.primary,
    top: -60,
    left: -60,
  },
  shape2: {
    width: 160,
    height: 160,
    backgroundColor: theme.colors.secondary,
    bottom: 80,
    right: -40,
  },
  shape3: {
    width: 120,
    height: 120,
    backgroundColor: '#8b5cf6',
    bottom: 200,
    left: 20,
  },
  heroContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: `${theme.colors.primary}10`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  heroBadgeText: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    color: theme.colors.dark,
    marginBottom: 12,
    lineHeight: 40,
  },
  gradientText: {
    color: theme.colors.primary,
  },
  heroSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: theme.colors.gray,
    marginBottom: 24,
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  heroButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  btnPrimary: {
    borderRadius: 8,
    overflow: 'hidden',
    minWidth: 160,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  btnPrimaryText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  btnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: theme.colors.grayLight,
    minWidth: 140,
  },
  btnSecondaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.dark,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.grayLight,
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.gray,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: theme.colors.grayLight,
  },
  featuresSection: {
    paddingVertical: 48,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: 'white',
  },
  sectionHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  sectionBadge: {
    backgroundColor: `${theme.colors.primary}10`,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  sectionBadgeText: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: theme.colors.dark,
    marginBottom: 8,
    lineHeight: 32,
  },
  sectionSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    color: theme.colors.gray,
    lineHeight: 22,
  },
  featuresGrid: {
    gap: 16,
  },
  featureCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: theme.colors.grayLight,
    marginBottom: 16,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.dark,
    marginBottom: 6,
  },
  featureDescription: {
    fontSize: 14,
    color: theme.colors.gray,
    lineHeight: 20,
    marginBottom: 12,
  },
  featureUnderline: {
    width: 40,
    height: 2,
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
    marginBottom: 12,
  },
  featureLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featureLinkText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  benefitsSection: {
    paddingVertical: 48,
    paddingHorizontal: theme.spacing.lg,
  },
  benefitsContent: {
    alignItems: 'center',
    marginBottom: 32,
  },
  benefitsTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: theme.colors.dark,
    marginBottom: 8,
    lineHeight: 32,
  },
  benefitsSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    color: theme.colors.gray,
    lineHeight: 22,
  },
  benefitsGrid: {
    gap: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: 'white',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.grayLight,
  },
  benefitIcon: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: `${theme.colors.primary}10`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitInfo: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.dark,
    marginBottom: 2,
  },
  benefitDescription: {
    fontSize: 13,
    color: theme.colors.gray,
  },
  ctaSection: {
    paddingVertical: 48,
    paddingHorizontal: theme.spacing.lg,
  },
  ctaContent: {
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: 'white',
    marginBottom: 12,
    lineHeight: 32,
  },
  ctaGradientText: {
    color: '#fcd34d',
  },
  ctaSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 24,
    lineHeight: 22,
  },
  ctaButtons: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  ctaPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  ctaPrimaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.dark,
  },
  ctaSecondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  ctaSecondaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  bottomSpacer: {
    height: 20,
  },
});

export default HomeScreen;
