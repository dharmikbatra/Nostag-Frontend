import React, { useState, useContext, useEffect } from 'react';
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
import * as ImagePicker from 'expo-image-picker'; 
import { useFacesInPhoto } from '@infinitered/react-native-mlkit-face-detection'; // <--- ML Kit Hook
import AsyncStorage from '@react-native-async-storage/async-storage';

import colors from '../../constants/colours'; 
import { API_BASE_URL } from '../../constants/config';
import { UserContext } from '../../context/UserContext'; 

export default function PhotoVerificationScreen({ route, navigation }) {
  const { userRole } = route.params; 
  const { refreshUser } = useContext(UserContext);

  const [pendingPhoto, setPendingPhoto] = useState(null); // Triggers ML Kit scan
  const [localPhoto, setLocalPhoto] = useState(null);     // The successfully verified photo
  const [status, setStatus] = useState('idle');           // 'idle', 'uploading', 'saving', 'success'

  // --- 1. ML KIT FACE DETECTION HOOK ---
  const { faces, status: mlStatus, error: mlError } = useFacesInPhoto(pendingPhoto);

  useEffect(() => {
    if (mlStatus === 'done' && pendingPhoto) {
      if (faces && faces.length === 1) {
        // SUCCESS: Exactly one face found
        setLocalPhoto(pendingPhoto); 
        setPendingPhoto(null); // Clear pending
      } else if (faces && faces.length > 1) {
        // FAILED: Too many faces
        Alert.alert("Too Many People 👯‍♂️", "Your profile picture should only contain you. Please take a solo selfie.");
        setPendingPhoto(null); 
      } else {
        // FAILED: No face detected
        Alert.alert("No Face Detected 🕵️‍♂️", "We couldn't clearly see a face. Please ensure good lighting and try again.");
        setPendingPhoto(null); 
      }
    } else if (mlError) {
      console.error("ML Kit Error:", mlError);
      Alert.alert("Error", "Something went wrong verifying the photo.");
      setPendingPhoto(null);
    }
  }, [mlStatus, faces, mlError, pendingPhoto]);

  // --- 2. TAKE LIVE PHOTO ---
  const handlePickPhoto = async () => {
    // Request Camera Permission
    const { status: camStatus } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (camStatus !== 'granted') {
      Alert.alert(
        "Permission Needed", 
        "We need camera access to verify your profile picture."
      );
      return;
    }

    // Launch Front Camera
    const result = await ImagePicker.launchCameraAsync({
      cameraType: ImagePicker.CameraType.front, // Force selfie camera
      allowsEditing: true,
      aspect: [1, 1], // Square aspect ratio is best for profiles
      quality: 0.7,   // Optimized for quick scanning and uploading
    });

    if (!result.canceled) {
      setLocalPhoto(null); // Clear any old photo
      setPendingPhoto(result.assets[0].uri); // Setting this triggers ML Kit useEffect
    }
  };

  // --- 3. UPLOAD TO S3 HELPER ---
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
    
    return fileUrl; 
  };

  // --- 4. MAIN PROCESS: UPLOAD -> SAVE -> NAVIGATE ---
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
          isVerified: true 
        })
      });

      if (!response.ok) throw new Error("Failed to save profile.");

      // Step C: Success & Refresh
      setStatus('success');
      await refreshUser(); 

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
    if (mlStatus === 'detecting') return "Scanning Face...";
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
        <Text style={styles.subtitle}>Take a clear live selfie to verify your account. No gallery uploads allowed.</Text>
      </View>

      <View style={styles.uploadContainer}>
        {/* If ML Kit is currently scanning */}
        {mlStatus === 'detecting' ? (
           <View style={styles.processingBox}>
             <ActivityIndicator size="large" color={colors.primary} />
             <Text style={styles.processingText}>Scanning for face...</Text>
           </View>
        ) : localPhoto ? (
          /* If a photo has been successfully verified by ML Kit */
          <View style={styles.previewContainer}>
            <Image source={{ uri: localPhoto }} style={styles.previewImage} />
            
            {status === 'idle' && (
              <TouchableOpacity style={styles.retakeBtn} onPress={handlePickPhoto}>
                <Ionicons name="camera-reverse" size={20} color={colors.white} />
                <Text style={styles.retakeText}>Retake</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          /* Initial State: Prompt to take photo */
          <TouchableOpacity style={styles.uploadBox} onPress={handlePickPhoto}>
            <View style={styles.circle}>
              <Ionicons name="camera" size={32} color={colors.primary} />
            </View>
            <Text style={styles.uploadText}>Tap to Take Selfie</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.footer}>
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
            style={[styles.button, (!localPhoto || mlStatus === 'detecting') && styles.buttonDisabled]} 
            onPress={handleVerify}
            disabled={!localPhoto || mlStatus === 'detecting'}
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
  title: { fontSize: 32, fontWeight: '800', color: colors.white, marginBottom: 10 },
  subtitle: { fontSize: 16, color: colors.textSecondary, lineHeight: 24 },
  
  uploadContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  uploadBox: { width: '100%', height: 250, borderWidth: 2, borderColor: colors.surface, borderStyle: 'dashed', borderRadius: 24, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.surfaceLight },
  circle: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primaryBackground, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  uploadText: { color: colors.textSecondary, fontSize: 16, fontWeight: '600' },
  
  processingBox: { width: '100%', height: 250, borderRadius: 24, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.surface },
  processingText: { color: colors.white, marginTop: 15, fontSize: 16, fontWeight: '600' },

  previewContainer: { width: '100%', height: 300, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  previewImage: { width: 250, height: 250, borderRadius: 125, borderWidth: 4, borderColor: colors.primary },
  retakeBtn: { position: 'absolute', bottom: 10, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: colors.borderLight },
  retakeText: { color: colors.white, marginLeft: 6, fontWeight: 'bold' },

  footer: { marginBottom: 20 },
  button: { backgroundColor: colors.primary, paddingVertical: 18, borderRadius: 16, alignItems: 'center', shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  buttonDisabled: { backgroundColor: colors.surface, shadowOpacity: 0, opacity: 0.5 },
  buttonText: { color: colors.white, fontSize: 18, fontWeight: '700' },
  
  loadingBox: { alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 10, padding: 20, backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.primary },
  successBox: { borderColor: '#4ade80', backgroundColor: 'rgba(74, 222, 128, 0.1)' },
  loadingText: { color: colors.white, fontSize: 16, fontWeight: '600' }
});