import React, { useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { SocketContext } from '../../context/SocketContext';
import colors from '../../constants/colours';

export default function ManOtpScreen({ route, navigation }) {
  const { bookingId, otp, partnerName, partnerPhone, partnerPic, clubName } = route.params;
  
  const { socket } = useContext(SocketContext);

  useEffect(() => {
    if (!socket) return;

    const handleCompletion = (data) => {
        console.log("✅ Booking Verified/Completed:", data);
        
        navigation.replace('BookingConfirmed', { 
            bookingId: bookingId, 
            clubName: clubName,
            role: 'MAN', 
            otp: data.otp, 
            partner: {
                name: partnerName,
                phone: partnerPhone,
                pic: partnerPic
            }, 
            message: data.message
        });
    };

    socket.on('booking_completed', handleCompletion);

    return () => {
        socket.off('booking_completed', handleCompletion);
    };
  }, [socket, bookingId, clubName]);

  const handleCall = () => {
    if (partnerPhone) {
        Linking.openURL(`tel:${partnerPhone}`);
    } else {
        Alert.alert("Unavailable", "Phone number is hidden.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        
        <Text style={styles.matchTitle}>It's a Match!</Text>
        <Text style={styles.subTitle}>Meet at the entrance of {clubName}</Text>

        <View style={styles.card}>
            {partnerPic ? (
                <Image source={{ uri: partnerPic }} style={styles.avatar} />
            ) : (
                <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>{partnerName ? partnerName.charAt(0).toUpperCase() : "?"}</Text>
                </View>
            )}
            <Text style={styles.partnerName}>{partnerName}</Text>
            
            <TouchableOpacity style={styles.callButton} onPress={handleCall}>
                <Ionicons name="call" size={18} color={colors.white} />
                <Text style={styles.callText}>Call Partner</Text>
            </TouchableOpacity>
        </View>

        <View style={styles.otpContainer}>
            <Text style={styles.otpLabel}>SHOW THIS OTP</Text>
            <View style={styles.otpBox}>
                <Text style={styles.otpText}>{otp}</Text>
            </View>
            <Text style={styles.otpHint}>
                Please show this code to {partnerName} to verify entry.
            </Text>
        </View>

        <View style={styles.footer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.waitingText}>Waiting for verification...</Text>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, padding: 30, alignItems: 'center', justifyContent: 'center' },
  
  matchTitle: { fontSize: 32, fontWeight: 'bold', color: colors.success, marginBottom: 10, textAlign: 'center' },
  subTitle: { fontSize: 16, color: colors.textSecondary, marginBottom: 40, textAlign: 'center' },
  
  card: { alignItems: 'center', marginBottom: 40 },
  avatar: { width: 80, height: 80, borderRadius: 40, marginBottom: 15, borderWidth: 2, borderColor: colors.primary },
  avatarPlaceholder: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', marginBottom: 15, borderWidth: 2, borderColor: colors.primary },
  avatarText: { fontSize: 32, color: colors.primary, fontWeight: 'bold' },
  partnerName: { fontSize: 24, fontWeight: 'bold', color: colors.white, marginBottom: 15 },
  
  // Replaced hardcoded 'rgba' with colors.borderLight
  callButton: { flexDirection: 'row', backgroundColor: colors.surface, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: colors.borderLight },
  callText: { color: colors.white, marginLeft: 8, fontWeight: '600' },
  
  // Replaced hardcoded 'rgba' with primaryBackground and primaryBorder
  otpContainer: { width: '100%', alignItems: 'center', padding: 20, backgroundColor: colors.primaryBackground, borderRadius: 20, borderWidth: 1, borderColor: colors.primaryBorder },
  otpLabel: { color: colors.primary, fontSize: 12, letterSpacing: 2, fontWeight: 'bold', marginBottom: 10 },
  otpBox: { backgroundColor: colors.background, paddingVertical: 10, paddingHorizontal: 40, borderRadius: 10, marginBottom: 15 },
  otpText: { color: colors.white, fontSize: 42, fontWeight: 'bold', letterSpacing: 8 },
  otpHint: { color: colors.textSecondary, fontSize: 12, textAlign: 'center' },
  
  footer: { flexDirection: 'row', marginTop: 50, alignItems: 'center' },
  waitingText: { color: colors.textSecondary, marginLeft: 10, fontSize: 14 }
});