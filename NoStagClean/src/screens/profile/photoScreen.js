import React, { useState, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons'; 
import * as ImagePicker from 'expo-image-picker'; // <--- 1. Import Picker
import AsyncStorage from '@react-native-async-storage/async-storage';

import colors from '../../constants/colours'; 
import { API_BASE_URL } from '../../constants/config';
import { UserContext } from '../../context/UserContext'; // <--- 2. Import Context

export default function PhotoVerificationScreen({ route, navigation }) {
  const { userRole } = route.params; 
  const { refreshUser } = useContext(UserContext); // We need this to update the app state on success

  const [localPhoto, setLocalPhoto] = useState(null); // Local URI for preview
  const [status, setStatus] = useState('idle'); // 'idle', 'uploading', 'saving', 'success'

  // --- 1. PICK IMAGE ---
  const handlePickPhoto = async () => {
    // Request Permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission Needed", "Please allow access to your gallery.");
      return;
    }

    // Pick Image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Square aspect ratio is best for profiles
      quality: 0.8,
    });

    if (!result.canceled) {
      setLocalPhoto(result.assets[0].uri);
    }
  };

  // --- 2. UPLOAD TO S3 HELPER ---
  const uploadToS3 = async (uri) => {
    const token = await AsyncStorage.getItem('accessToken');
    
    // A. Get Presigned URL
    const typeResponse = await fetch(`${API_BASE_URL}/users/upload-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ fileType: 'image/jpeg' }) 
    });

    const { uploadUrl, fileUrl } = await typeResponse.json();
    if (!uploadUrl) throw new Error("Failed to initialize upload.");

    // B. Upload Binary
    const imgResponse = await fetch(uri);
    const blob = await imgResponse.blob();

    const s3Response = await fetch(uploadUrl, {
      method: 'PUT',
      body: blob,
      headers: { 'Content-Type': 'image/jpeg' }
    });

    if (s3Response.status !== 200) throw new Error("Cloud upload failed.");
    
    return fileUrl; // Return the permanent public link
  };

  // --- 3. MAIN PROCESS: UPLOAD -> SAVE -> NAVIGATE ---
  const handleVerify = async () => {
    if (!localPhoto) return;
    
    setStatus('uploading');

    try {
      const token = await AsyncStorage.getItem('accessToken');

      // Step A: Upload to Cloud
      const s3Url = await uploadToS3(localPhoto);

      setStatus('saving');

      // Step B: Save URL to Backend
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          profilePicUrl: s3Url,
          isVerified: true // Optional: Mark them verified since they uploaded a photo
        })
      });

      if (!response.ok) throw new Error("Failed to save profile.");

      // Step C: Success & Refresh
      setStatus('success');
      await refreshUser(); // IMPORTANT: Updates Global User Context

      // Wait a moment so user sees the "Success" checkmark
      setTimeout(() => {
        if (userRole === 'man' || userRole === 'MAN') {
            navigation.reset({ index: 0, routes: [{ name: 'ManHome' }] });
        } else {
            navigation.reset({ index: 0, routes: [{ name: 'WomanHome' }] });
        }
      }, 1500);

    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Something went wrong. Please try again.");
      setStatus('idle');
    }
  };

  // --- HELPER: GET STATUS TEXT ---
  const getStatusText = () => {
    if (status === 'uploading') return "Uploading photo...";
    if (status === 'saving') return "Finalizing profile...";
    if (status === 'success') return "You are verified!";
    return "Verify & Finish";
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Photo Verification</Text>
        <Text style={styles.subtitle}>Upload a clear photo of yourself to finish setting up your account.</Text>
      </View>

      <View style={styles.uploadContainer}>
        {localPhoto ? (
          <View style={styles.previewContainer}>
            <Image source={{ uri: localPhoto }} style={styles.previewImage} />
            
            {/* Show "Remove" button only if not currently uploading */}
            {status === 'idle' && (
              <TouchableOpacity style={styles.removeBtn} onPress={() => setLocalPhoto(null)}>
                <Ionicons name="close-circle" size={30} color={colors.white} />
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <TouchableOpacity style={styles.uploadBox} onPress={handlePickPhoto}>
            <View style={styles.circle}>
              <Ionicons name="camera" size={32} color={colors.primary} />
            </View>
            <Text style={styles.uploadText}>Tap to Upload Photo</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.footer}>
        {/* CONDITIONAL RENDERING FOR STATUS */}
        {status !== 'idle' ? (
           <View style={[styles.loadingBox, status === 'success' && styles.successBox]}>
             {status === 'success' ? (
               <Ionicons name="checkmark-circle" size={40} color="#4ade80" />
             ) : (
               <ActivityIndicator size="large" color={colors.primary} />
             )}
             <Text style={[styles.loadingText, status === 'success' && { color: '#4ade80' }]}>
               {getStatusText()}
             </Text>
           </View>
        ) : (
          <TouchableOpacity 
            style={[styles.button, !localPhoto && styles.buttonDisabled]} 
            onPress={handleVerify}
            disabled={!localPhoto}
          >
            <Text style={styles.buttonText}>Verify & Finish</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 24, justifyContent: 'space-between' },
  header: { marginTop: 60 },
  title: { fontSize: 32, fontWeight: '800', color: colors.textPrimary, marginBottom: 10 },
  subtitle: { fontSize: 16, color: colors.textSecondary, lineHeight: 24 },
  
  uploadContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  uploadBox: { width: '100%', height: 250, borderWidth: 2, borderColor: colors.surface, borderStyle: 'dashed', borderRadius: 24, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)' },
  circle: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(99, 102, 241, 0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  uploadText: { color: colors.textSecondary, fontSize: 16, fontWeight: '600' },
  
  previewContainer: { width: '100%', height: 300, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  previewImage: { width: 250, height: 250, borderRadius: 125, borderWidth: 4, borderColor: colors.primary },
  removeBtn: { position: 'absolute', top: 10, right: 20, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 15 },

  footer: { marginBottom: 20 },
  button: { backgroundColor: colors.primary, paddingVertical: 18, borderRadius: 16, alignItems: 'center', shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  buttonDisabled: { backgroundColor: colors.surface, shadowOpacity: 0, opacity: 0.5 },
  buttonText: { color: colors.white, fontSize: 18, fontWeight: '700' },
  
  loadingBox: { alignItems: 'center', gap: 10, padding: 20, backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.primary },
  successBox: { borderColor: '#4ade80' },
  loadingText: { color: colors.white, fontSize: 16, fontWeight: '600' }
});