import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../constants/colours';
import { clubApi } from '../../services/ApiService'; 
import { UserContext } from '../../context/UserContext';

export default function WomanOtpScreen({ route, navigation }) {
  const { bookingId, manName, manPhone, clubName } = route.params;
  const [otpInput, setOtpInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { refreshUser } = useContext(UserContext);

  const handleVerify = async () => {
    if (otpInput.length < 4) {
        Alert.alert("Invalid OTP", "Please enter the 4-digit code.");
        return;
    }
    
    setLoading(true);
    try {
        console.log(`Verifying OTP for Booking ID: ${bookingId} with OTP: ${otpInput}`);
        const response = await clubApi.verifyBooking(bookingId, otpInput);
        console.log("OTP Verified Successfully for Booking ID:", bookingId);
        
        // Refresh wallet/user data globally before moving on
        await refreshUser();

        // Navigate to the confirmation screen (which will handle the 9 AM notification)
        navigation.replace('BookingConfirmed', { 
            bookingId: bookingId, 
            clubName: clubName,
            role: 'WOMAN', 
            otp: otpInput, 
            partner: { name: manName, phone: manPhone }, 
            message: response.message || "Entry Confirmed!"
        });

    } catch (error) {
        Alert.alert("Verification Failed", "Incorrect OTP. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <Text style={styles.title}>Verify Entry</Text>
      <Text style={styles.subtitle}>Ask {manName} for the OTP</Text>

      {/* Man's Info */}
      <View style={styles.infoCard}>
         <View>
             <Text style={styles.label}>GUEST</Text>
             <Text style={styles.value}>{manName}</Text>
         </View>
         <TouchableOpacity onPress={() => Linking.openURL(`tel:${manPhone}`)}>
             <Ionicons name="call-outline" size={28} color={colors.primary} />
         </TouchableOpacity>
      </View>

      {/* OTP Input */}
      <TextInput
        style={styles.input}
        placeholder="Enter 4-Digit OTP"
        placeholderTextColor={colors.textSecondary}
        keyboardType="number-pad"
        maxLength={4}
        value={otpInput}
        onChangeText={setOtpInput}
      />

      <TouchableOpacity 
        style={[styles.btn, loading && styles.btnDisabled]} 
        onPress={handleVerify}
        disabled={loading}
      >
        <Text style={styles.btnText}>{loading ? "Verifying..." : "Verify & Start"}</Text>
      </TouchableOpacity>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 30, justifyContent: 'center' },
  title: { color: colors.white, fontSize: 32, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  subtitle: { color: colors.textSecondary, fontSize: 16, marginBottom: 40, textAlign: 'center' },
  infoCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surface, padding: 20, borderRadius: 12, marginBottom: 30 },
  label: { color: colors.textSecondary, fontSize: 10, letterSpacing: 1 },
  value: { color: colors.white, fontSize: 18, fontWeight: 'bold' },
  input: { backgroundColor: colors.surface, color: colors.white, fontSize: 24, textAlign: 'center', padding: 20, borderRadius: 12, letterSpacing: 5, borderWidth: 1, borderColor: colors.primary, marginBottom: 30 },
  btn: { backgroundColor: colors.primary, padding: 18, borderRadius: 30, alignItems: 'center' },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: colors.white, fontSize: 18, fontWeight: 'bold' }
});