import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '../constants/config';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null); // <--- ADD THIS
  const [loading, setLoading] = useState(true);

  // 1. Load User & Token on App Start
  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('userToken');
        const storedUser = await AsyncStorage.getItem('userData');

        if (storedToken && storedUser) {
          setToken(storedToken); // <--- Save to state
          setUser(JSON.parse(storedUser));
          
          // Optional: Verify token/fetch fresh user data from backend
          // await refreshUser(storedToken); 
        }
      } catch (error) {
        console.error("Failed to load auth data", error);
      } finally {
        setLoading(false);
      }
    };

    loadAuthData();
  }, []);

  // 2. Helper to Login (Save Token)
  const login = async (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    await AsyncStorage.setItem('userToken', newToken);
    await AsyncStorage.setItem('userData', JSON.stringify(newUser));
  };

  // 3. Helper to Logout (Clear Token)
  const logout = async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userData');
    setToken(null);
    setUser(null);
  };

  // 4. Helper to Refresh User Data from Backend
  const refreshUser = async () => {
    if (!token) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
      await AsyncStorage.setItem('userData', JSON.stringify(response.data));
    } catch (error) {
      console.error("Error refreshing user:", error);
    }
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      token, // <--- EXPORT THIS so WalletScreen can use it
      loading,
      setUser,
      login, 
      logout, 
      refreshUser 
    }}>
      {children}
    </UserContext.Provider>
  );
};