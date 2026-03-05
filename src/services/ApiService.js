import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants/config';

// REPLACE WITH YOUR ACTUAL BACKEND URL

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Automatically add token to every request
api.interceptors.request.use(async (config) => {
  const userData = await AsyncStorage.getItem('userData');
  const userToken = await AsyncStorage.getItem('userToken');
  if (userData) {
    const user = JSON.parse(userData);
    if (userToken) {
      config.headers.Authorization = `Bearer ${userToken}`;
    }
  }
  return config;
});

export const clubApi = {
  // 1. Get List of Clubs (Shared)
  getClubs: async (lat = 12.97, long = 77.64) => {
    const response = await api.get(`/clubs?lat=${lat}&long=${long}`);
    console.log("Fetched clubs:", response.data);
    return response.data; 
  },

  // 2. Man: Join Queue (Create Request)
  joinQueue: async (clubId) => {
    const response = await api.post('/requests', { clubId });
    return response.data; // Returns { id: "REQUEST_ID", ... }
  },

  // 3. Woman: Find Next Match
  getNextMatch: async (clubId) => {
    try {
      console.log(`Fetching next match for Club ID: ${clubId}`);
      const response = await api.get(`/clubs/${clubId}/next-match`);
      console.log("Next match response:", response.data);
      return response.data; // Returns Man's profile or booking request
    } catch (error) {
      // If 404, it means queue is empty
      if (error.response && error.response.status === 404) {
        console.log("Queue is currently empty.");
        return null;
      }
      throw error;
    }
  },

  // 4. Woman: Accept Request
  acceptRequest: async (requestId) => {
    const response = await api.post(`/requests/${requestId}/accept`, {});
    return response.data;
  },

  rateClub: async (bookingId, rating) => {
    console.log(`Submitting rating for Booking ID: ${bookingId} with rating: ${rating}`);
    // POST to /clubs/rate/:bookingId
    const response = await api.post(`/clubs/rate/${bookingId}`, { rating });
    return response.data;
  },

  verifyBooking: async (bookingId, otp) => {
    console.log(`Verifying booking with ID: ${bookingId} using OTP: ${otp}`);
    const response = await api.post(`/bookings/${bookingId}/complete`, { 
      otp: otp 
    });
    console.log(`Booking verification response for Booking ID: ${bookingId}:`, response.data);
    return response.data;
  },

  createRequest: async (clubId, userLat, userLng) => {
    const response = await api.post('/requests', { 
        clubId: clubId,
        lat: userLat, // <-- Send exact GPS to backend
        long: userLng  // <-- Send exact GPS to backend
    });
    return response.data; 
  }
};

export default api;