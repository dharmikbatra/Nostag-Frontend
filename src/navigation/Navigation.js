import React, { useContext } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { UserContext } from '../context/UserContext';
import { navigationRef } from './navigationRef'; // Your ref helper

// --- AUTH SCREENS ---
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import ProfileSetupScreen from '../screens/profile/profileSetupScreen';
import PhotoVerificationScreen from '../screens/profile/photoScreen';

// --- MAIN APP SCREENS ---
import ManHomeScreen from '../screens/man/ManHomeScreen';
import WomanHomeScreen from '../screens/woman/WomanHomeScreen';
import WalletScreen from '../screens/wallet/WalletScreen';
import UserProfileScreen from '../screens/profile/UserProfileScreen';
import WomanLobbyScreen from '../screens/woman/WomanLobbyScreen';
import WaitingScreen from '../screens/man/WaitingScreen';
import RatingScreen from '../screens/shared/RatingScreen';
import BookingConfirmedScreen from '../screens/shared/BookingConfirmedScreen';
import ManOtpScreen from '../screens/man/ManOtpScreen';
import WomanOtpScreen from '../screens/woman/WomanOtpScreen';

const Stack = createNativeStackNavigator();

export default function Navigation({ onReady }) {
  const { user, loading } = useContext(UserContext);

  // 1. LOADING STATE
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' }}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  // 2. MAIN NAVIGATION
  return (
    <NavigationContainer 
        ref={navigationRef} 
        onReady={onReady}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        
        {user ? (
          // ==================================================
          // 🟢 AUTHENTICATED STACK (User is Logged In)
          // ==================================================
          <>
            {/* 1. Home Screen (Based on Role) */}
            {user.role === 'WOMAN' ? (
              <Stack.Screen name="WomanHome" component={WomanHomeScreen} />
            ) : (
              <Stack.Screen name="ManHome" component={ManHomeScreen} />
            )}

            {/* 2. Core App Screens */}
            <Stack.Screen name="WaitingScreen" component={WaitingScreen} />
            <Stack.Screen name="WomanLobbyScreen" component={WomanLobbyScreen} />
            <Stack.Screen name="Wallet" component={WalletScreen} />
            <Stack.Screen name="UserProfile" component={UserProfileScreen} />
            <Stack.Screen name="BookingConfirmed" component={BookingConfirmedScreen} />

            {/* 3. Setup Screens (Accessible if user needs to edit profile) */}
            <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
            <Stack.Screen name="PhotoVerification" component={PhotoVerificationScreen} />
            
            {/* 4. Rating Screen (Special) */}
            <Stack.Screen 
              name="RatingScreen" 
              component={RatingScreen}
              options={{ 
                  gestureEnabled: false, 
                  headerShown: false 
              }} 
            />
            <Stack.Screen name="ManOtpScreen" component={ManOtpScreen} />
            <Stack.Screen name="WomanOtpScreen" component={WomanOtpScreen} />
          </>
        ) : (
          // =============================
          // ⚪ GUEST STACK (No User)
          // =============================
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            
            {/* We keep setup screens here too, in case they are part of signup flow */}
            <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
            <Stack.Screen name="PhotoVerification" component={PhotoVerificationScreen} />
          </>
        )}

      </Stack.Navigator>
    </NavigationContainer>
  );
}