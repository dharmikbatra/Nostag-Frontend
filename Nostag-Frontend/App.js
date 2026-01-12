import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { UserProvider } from './src/context/UserContext'; // <--- Imports the "Brain"
import Navigation from './src/navigation/Navigation';     // <--- Imports the "Screen Logic"

export default function App() {
  return (
    // 1. Wrap the entire app in UserProvider so every screen can access 'user'
    <UserProvider>
      
      {/* 2. Status Bar Control (Global) */}
      <StatusBar style="light" backgroundColor="#0f172a" />
      
      {/* 3. Render Navigation (Handles Auth vs Home logic internally) */}
      <Navigation />
      
    </UserProvider>
  );
}