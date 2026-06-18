/**
 * App.tsx — root entry point for MeasureMart.
 *
 * Responsibilities:
 *   1. Load Inter fonts via expo-google-fonts
 *   2. Hide the splash screen once fonts are ready
 *   3. Wrap the component tree in context providers:
 *        AuthProvider  — Firebase Authentication state
 *        CartProvider  — Shopping cart state + Firestore sync
 *   4. Render RootNavigator, which switches between Auth and Main stacks
 */

import React, { useCallback, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

import { AuthProvider } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import RootNavigator from './src/navigation/RootNavigator';

// Keep the splash screen visible while fonts are loading
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
        <StatusBar style="auto" />
        {/* AuthProvider must wrap CartProvider because CartProvider reads auth state */}
        <AuthProvider>
          <CartProvider>
            <RootNavigator />
          </CartProvider>
        </AuthProvider>
      </View>
    </GestureHandlerRootView>
  );
}
