import React, { useState, useRef, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  Alert
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons'; 
import AsyncStorage from '@react-native-async-storage/async-storage';

import colors from '../../constants/colours'; 
import { API_BASE_URL } from '../../constants/config';
import { UserContext } from '../../context/UserContext';
import CustomModal from '../../components/CustomModal'; 

export default function LoginScreen({ navigation }) {
  // --- STATE MANAGEMENT ---
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isOtpVisible, setOtpVisible] = useState(false);
  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);
  
  const { login } = useContext(UserContext);
  
  // Ref to auto-focus OTP input when modal opens
  const otpInputRef = useRef(null);

  const handleGetOtp = async () => {
    if (phoneNumber.length < 10) {
      Alert.alert("Invalid Number", "Please enter a valid 10-digit phone number.");
      return;
    }

    // 1. OPTIMISTIC UI UPDATE: Open modal and disable button immediately
    Keyboard.dismiss();
    setOtpVisible(true);
    setVerifying(true); 

    try {
      const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: `+91${phoneNumber}` })
      });

      const data = await response.json(); 

      // 2. CHECK FOR FAILURE
      if (!response.ok) {
        // If it failed to send, close the modal so they can try again
        setOtpVisible(false);
        Alert.alert("Error", data.message || "Failed to send OTP. Please try again.");
      }
      // If successful, do nothing! They are already in the modal typing.

    } catch (error) {
        console.error("OTP Request Error:", error);
        setOtpVisible(false); // Close modal on network error
        Alert.alert("Network Error", "Please check your internet connection.");
    } finally {
        setVerifying(false); // Unlock the button
    }
  };

  const handleVerifyOtp = async () => {
    setVerifying(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: `+91${phoneNumber}`,
          code: otp 
        })
      });

      const data = await response.json();
      console.log("OTP Verification Response:", data);

      if (response.ok) {
        // STORE TOKEN
        await AsyncStorage.setItem('accessToken', data.data.accessToken);
        console.log("Login Successful. Token saved.");

        // CLEAN UP UI
        setVerifying(false);
        setOtpVisible(false);
        setOtp(''); 

        // NAVIGATE BASED ON BACKEND DATA
        if (data.data.isNewUser) {
           navigation.replace('ProfileSetup');
        } else {
           await AsyncStorage.setItem('user', JSON.stringify(data.data.user));
           login(data.data.accessToken, data.data.user); 
        }
      } else {
        setVerifying(false);
        Alert.alert("Verification Failed", data.message || "Invalid OTP. Please try again.");
      }
    } catch (error) {
      setVerifying(false);
      console.error("Verification Error:", error);
      Alert.alert("Network Error", "Could not verify OTP. Please check your connection.");
    }
  };

  // Auto-focus the OTP input when the modal appears
  useEffect(() => {
    if (isOtpVisible) {
      setTimeout(() => otpInputRef.current?.focus(), 100);
    }
  }, [isOtpVisible]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* --- MAIN LOGIN FORM --- */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.innerContainer}
        >
          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Let's get started.</Text>
            <Text style={styles.subtitle}>Enter your phone number to receive a verification code.</Text>
          </View>

          {/* Phone Input */}
          <View style={styles.form}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.countryCode}>+91</Text>
              <View style={styles.verticalDivider} />
              <TextInput 
                style={styles.input}
                placeholder="98765 43210"
                placeholderTextColor={colors.textSecondary}
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                maxLength={10}
                selectionColor={colors.primary}
              />
            </View>
          </View>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <TouchableOpacity 
              // Disable button if phone is incomplete OR if we are currently verifying/requesting
              style={[styles.button, (phoneNumber.length < 10 || verifying) && styles.buttonDisabled]} 
              onPress={handleGetOtp}
              disabled={phoneNumber.length < 10 || verifying}
            >
              <Text style={styles.buttonText}>Get OTP</Text>
              <Ionicons name="chatbubble-ellipses-outline" size={20} color={colors.white} style={{marginLeft: 8}}/>
            </TouchableOpacity>
            <Text style={styles.disclaimer}>Standard message rates may apply.</Text>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>

      {/* --- REUSABLE OTP MODAL --- */}
      <CustomModal 
        visible={isOtpVisible} 
        onClose={() => setOtpVisible(false)}
        title="Verification"
      >
        <Text style={styles.modalSubtitle}>
           Enter the code sent to <Text style={{color: colors.white}}>+91 {phoneNumber}</Text>
        </Text>

        <TextInput 
          ref={otpInputRef}
          style={styles.otpInput}
          placeholder="- - - -"
          placeholderTextColor="rgba(255,255,255,0.2)"
          keyboardType="number-pad"
          maxLength={4}
          value={otp}
          onChangeText={setOtp}
          textAlign="center"
          selectionColor={colors.primary}
        />

        <TouchableOpacity 
          style={[styles.modalButton, (otp.length < 4 || verifying) && styles.buttonDisabled]} 
          onPress={handleVerifyOtp}
          disabled={otp.length < 4 || verifying}
        >
           {verifying ? (
             <ActivityIndicator color={colors.white} />
           ) : (
             <Text style={styles.buttonText}>Verify & Enter</Text>
           )}
        </TouchableOpacity>
      </CustomModal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  innerContainer: { flex: 1, padding: 24, justifyContent: 'space-between' },
  
  // Navigation & Header
  backButton: { marginTop: 40, width: 40, height: 40, justifyContent: 'center' },
  header: { marginBottom: 40 },
  title: { fontSize: 32, fontWeight: '800', color: colors.textPrimary, marginBottom: 12 },
  subtitle: { fontSize: 16, color: colors.textSecondary, lineHeight: 24 },
  
  // Form Area
  form: { flex: 1, marginTop: 20 },
  label: { color: colors.textSecondary, fontSize: 14, fontWeight: '600', marginBottom: 12, marginLeft: 4 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 16, paddingHorizontal: 20, paddingVertical: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  countryCode: { color: colors.white, fontSize: 18, fontWeight: '600' },
  verticalDivider: { width: 1, height: 24, backgroundColor: colors.textSecondary, marginHorizontal: 16, opacity: 0.3 },
  input: { flex: 1, color: colors.white, fontSize: 18, fontWeight: '600' },
  
  // Footer Area
  footer: { marginBottom: 20 },
  button: { flexDirection: 'row', backgroundColor: colors.primary, paddingVertical: 18, borderRadius: 16, alignItems: 'center', justifyContent: 'center', shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  buttonDisabled: { backgroundColor: colors.surface, shadowOpacity: 0, opacity: 0.5 },
  buttonText: { color: colors.white, fontSize: 18, fontWeight: '700' },
  disclaimer: { textAlign: 'center', color: colors.textSecondary, fontSize: 12, marginTop: 16, opacity: 0.6 },

  // Modal Specific Styles
  modalSubtitle: { fontSize: 16, color: colors.textSecondary, marginBottom: 30 },
  otpInput: { backgroundColor: colors.background, color: colors.white, fontSize: 32, fontWeight: 'bold', letterSpacing: 10, paddingVertical: 20, borderRadius: 16, borderWidth: 1, borderColor: colors.primary, marginBottom: 30 },
  modalButton: { backgroundColor: colors.primary, paddingVertical: 18, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
});