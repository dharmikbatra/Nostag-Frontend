import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as Location from 'expo-location'; 
import { API_BASE_URL } from '../constants/config';

export const UserContext = createContext();

export const OPERATIONAL_AREAS = [
  { id: '1', name: 'Indiranagar', lat: 12.9784, lng: 77.6408 },
  { id: '2', name: 'Koramangala', lat: 12.9352, lng: 77.6245 },
  { id: '3', name: 'MG Road / Central', lat: 12.9738, lng: 77.6082 },
  { id: '4', name: 'Sarjapur Road', lat: 12.9234, lng: 77.6804 },
  { id: '5', name: 'Bellandur', lat: 12.9304, lng: 77.6784 },
  { id: '6', name: 'Whitefield / Marathahalli', lat: 12.9650, lng: 77.7150 },
  { id: '7', name: 'Hebbal / Hennur', lat: 13.0358, lng: 77.5970 },
  { id: '8', name: 'Jayanagar / JP Nagar', lat: 12.9200, lng: 77.5800 },
  { id: '9', name: 'Testing', lat: 12.9058, lng: 77.5711 },
];

const DEFAULT_LOCATION = {
  lat: 12.939484,
  lng: 77.695155
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Locations
  const [userLocation, setUserLocation] = useState(DEFAULT_LOCATION);
  const [exploringLocation, setExploringLocation] = useState(DEFAULT_LOCATION); // Starts null until loaded

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('userToken');
        const storedUser = await AsyncStorage.getItem('userData');
        if (storedToken && storedUser) {
          setToken(storedToken); 
          setUser(JSON.parse(storedUser));
        }
        await fetchUserLocation();
      } catch (error) {
        console.error("Failed to load initial data", error);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, []);

  const fetchUserLocation = async () => {
    let coords = DEFAULT_LOCATION;
    let isDefault = true;

    try {
      // 1. Try to get actual GPS coordinates
      let { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status === 'granted') {
        let currentPosition = await Location.getCurrentPositionAsync({});
        console.log("GPS coordinates fetched:", currentPosition.coords);
        coords = {
          lat: currentPosition.coords.latitude,
          lng: currentPosition.coords.longitude
        };
        isDefault = false;
      } else {
        console.log('Location permission denied. Falling back to default location.');
      }
    } catch (error) {
      console.error("Error fetching GPS, using default:", error);
    }

    // 2. Reverse Geocode whatever coordinates we ended up with
    let areaName = "Unknown Area";
    try {
      const geocodeResult = await Location.reverseGeocodeAsync({
        latitude: coords.lat,
        longitude: coords.lng,
      });

      if (geocodeResult && geocodeResult.length > 0) {
        const place = geocodeResult[0];
        // Grab the most relevant local area name
        areaName = place.district || place.city || place.subregion || "Bengaluru";
      }
    } catch (geoError) {
      console.error("Reverse geocoding failed:", geoError);
      areaName = "Bengaluru";
    }

    // 3. Save coordinates AND the extracted name
    const fullLocationData = {
       ...coords,
       name: areaName
    };

    setUserLocation(fullLocationData);
    
    // Change prefix based on whether it's their real GPS or the default fallback
    const locationPrefix = isDefault ? "📍 Default" : "📍 My Location";
    
    setExploringLocation({
      id: isDefault ? 'default' : 'current',
      name: `${locationPrefix} (${areaName})`,
      lat: coords.lat,
      lng: coords.lng
    });

    console.log(`${locationPrefix} fetched: ${areaName}`);
  };

  const login = async (newToken, newUser) => {
    setToken(newToken); setUser(newUser);
    await AsyncStorage.setItem('userToken', newToken);
    await AsyncStorage.setItem('userData', JSON.stringify(newUser));
  };
  
  const logout = async () => {
    await AsyncStorage.removeItem('userToken'); await AsyncStorage.removeItem('userData');
    setToken(null); setUser(null);
  };

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
      user, token, loading,
      userLocation, exploringLocation, setExploringLocation, fetchUserLocation,
      OPERATIONAL_AREAS, setUser, login, logout, refreshUser 
    }}>
      {children}
    </UserContext.Provider>
  );
};