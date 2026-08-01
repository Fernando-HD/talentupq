import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { UserProvider, useUser } from './src/context/UserContext';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import CandidatoDashboardScreen from './src/screens/CandidatoDashboardScreen';
import EditarPerfilScreen from './src/screens/EditarPerfilScreen';
import ExperienciaLaboralScreen from './src/screens/ExperienciaLaboralScreen';
import PreparacionAcademicaScreen from './src/screens/PreparacionAcademicaScreen';
import MisHabilidadesScreen from './src/screens/MisHabilidadesScreen';
import ReferenciasScreen from './src/screens/ReferenciasScreen';
import MisPostulacionesScreen from './src/screens/MisPostulacionesScreen';
import VacantesScreen from './src/screens/VacantesScreen';
import DetalleVacanteScreen from './src/screens/DetalleVacanteScreen';
import MisConversacionesScreen from './src/screens/MisConversacionesScreen';
import ConversacionScreen from './src/screens/ConversacionScreen';
import ChatbotScreen from './src/screens/ChatbotScreen';
import RecuperarPasswordScreen from './src/screens/RecuperarPasswordScreen';
import FavoritosScreen from './src/screens/FavoritosScreen';

const Stack = createStackNavigator();

function AppNavigation() {
  const { user, loading } = useUser();
  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <NavigationContainer>
        <Stack.Navigator
          initialRouteName={user.isLoggedIn ? 'CandidatoDashboard' : 'Home'}
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: '#ffffff' },
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="RecuperarPassword" component={RecuperarPasswordScreen} />
          <Stack.Screen name="CandidatoDashboard" component={CandidatoDashboardScreen} />
          <Stack.Screen name="EditarPerfil" component={EditarPerfilScreen} />
          <Stack.Screen name="ExperienciaLaboral" component={ExperienciaLaboralScreen} />
          <Stack.Screen name="PreparacionAcademica" component={PreparacionAcademicaScreen} />
          <Stack.Screen name="MisHabilidades" component={MisHabilidadesScreen} />
          <Stack.Screen name="Referencias" component={ReferenciasScreen} />
          <Stack.Screen name="MisPostulaciones" component={MisPostulacionesScreen} />
          <Stack.Screen name="Vacantes" component={VacantesScreen} />
          <Stack.Screen name="DetalleVacante" component={DetalleVacanteScreen} />
          <Stack.Screen name="MisConversaciones" component={MisConversacionesScreen} />
          <Stack.Screen name="Conversacion" component={ConversacionScreen} />
          <Stack.Screen name="Chatbot" component={ChatbotScreen} />
          <Stack.Screen name="Favoritos" component={FavoritosScreen} />
        </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <UserProvider>
        <AppNavigation />
      </UserProvider>
    </SafeAreaProvider>
  );
}
