import React, { useContext } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { UserContext } from '../context/UserContext';
import { navigationRef } from './navigationRef'; // Your ref helper

// --- SCREENS ---
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import ProfileSetupScreen from '../screens/profile/profileSetupScreen';
import PhotoVerificationScreen from '../screens/profile/photoScreen';
import ManHomeScreen from '../screens/man/ManHomeScreen';
import WomanHomeScreen from '../screens/woman/WomanHomeScreen';
import WalletScreen from '../screens/wallet/WalletScreen';
import UserProfileScreen from '../screens/profile/UserProfileScreen';
import WomanLobbyScreen from '../screens/woman/WomanLobbyScreen';

const Stack = createNativeStackNavigator();

export default function Navigation() {
  const { user, loading } = useContext(UserContext);

  // 1. LOADING STATE: Show Spinner while Context checks storage
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' }}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  // 2. MAIN NAVIGATION
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        
        {user ? (
          // --- AUTHENTICATED STACK (If User Exists) ---
          <>
            {/* Route based on Role */}
            {user.role === 'WOMAN' ? (
              <Stack.Screen name="WomanHome" component={WomanHomeScreen} />
            ) : (
              <Stack.Screen name="ManHome" component={ManHomeScreen} />
            )}

            {/* Shared Protected Screens */}
            <Stack.Screen name="WomanLobbyScreen" component={WomanLobbyScreen} />
            <Stack.Screen name="Wallet" component={WalletScreen} />
            <Stack.Screen name="UserProfile" component={UserProfileScreen} />
            
            {/* You might want these accessible if user needs to finish setup */}
            <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
            <Stack.Screen name="PhotoVerification" component={PhotoVerificationScreen} />
          </>
        ) : (
          // --- GUEST STACK (If No User) ---
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            {/* Some users might get stuck in setup, so we keep these here too just in case */}
            <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
          </>
        )}

      </Stack.Navigator>
    </NavigationContainer>
  );
}