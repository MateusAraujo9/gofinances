import 'react-native-gesture-handler';
import 'intl';
import 'intl/locale-data/jsonp/pt-BR';
import React from 'react';
import { StatusBar } from 'react-native';
import { ThemeProvider } from 'styled-components';
import AppLoading from 'expo-app-loading';

import { 
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_700Bold
} from '@expo-google-fonts/poppins';
import theme from './src/global/styles/theme';
import { Routes } from './src/routes';
import { Approutes } from './src/routes/app.routes';
import { SignIn } from './src/screens/SignIn';

import { AuthProvider, useAuth } from './src/hooks/auth'; 

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_700Bold
  });

  const { userStorageLoading } = useAuth();

  if(!fontsLoaded && userStorageLoading) {
    return <AppLoading />
  }

  return (
    <ThemeProvider theme={theme}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary}/>
      <AuthProvider>
        <Routes />
      </AuthProvider>
    </ThemeProvider>
    
  );
}
