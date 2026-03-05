import React, { useEffect, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';

// Contexts
import { UserProvider } from './src/context/UserContext';
import { SocketProvider } from './src/context/SocketContext';

// Navigation
import Navigation from './src/navigation/Navigation'; 
import { navigationRef } from './src/navigation/navigationRef'; 
import { registerForPushNotificationsAsync } from './src/services/notifications';


export default function App() {
  const responseListener = useRef();
  
  // 1. TRACK NAVIGATION MOUNT STATUS
  const [isNavigationReady, setIsNavigationReady] = useState(false);
  
  // 2. QUEUE THE NOTIFICATION DATA
  const [pendingNotification, setPendingNotification] = useState(null);

  useEffect(() => {
    registerForPushNotificationsAsync();

    // A. COLD START HANDLER: Check if app was opened by a notification
    const checkInitialNotification = async () => {
      const response = await Notifications.getLastNotificationResponseAsync();
      if (response) {
        const data = response.notification.request.content.data;
        console.log("❄️ Cold Start Notification Found:", data);
        setPendingNotification(data);
      }
    };

    checkInitialNotification();

    // B. FOREGROUND/BACKGROUND HANDLER: Listen for new taps while app is running
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      console.log("🔔 Runtime Notification Tapped:", data);
      setPendingNotification(data);
    });

    return () => {
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  // 3. EXECUTIONER: Navigate ONLY when Navigation is ready AND Data exists
  useEffect(() => {
    if (isNavigationReady && pendingNotification) {
      console.log("🚀 Executing Navigation to:", pendingNotification.screen);

      if (pendingNotification.screen === 'Rating') {
        // Optional: Small delay to ensure transition animation is smooth
        setTimeout(() => {
             navigationRef.navigate('RatingScreen', {
                clubName: pendingNotification.clubName,
                bookingId: pendingNotification.bookingId
             });
        }, 100);
      }
      
      // Clear queue
      setPendingNotification(null);
    }
  }, [isNavigationReady, pendingNotification]);

  return (
    <UserProvider>
      <SocketProvider>
        <StatusBar style="light" backgroundColor="#0f172a" />
        
        {/* Pass the onReady callback from your Navigation.js */}
        <Navigation 
           onReady={() => {
             console.log("✅ Navigation Container Ready");
             setIsNavigationReady(true);
           }} 
        />
        
      </SocketProvider>
    </UserProvider>
   
  );
}