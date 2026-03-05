import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { scheduleMorningRating } from '../../services/notifications'; 
import colors from '../../constants/colours';

export default function BookingConfirmedScreen({ route, navigation }) {
  const { otp, role, clubName, bookingId, message, partner } = route.params;

  useEffect(() => {
    // Schedule the 9 AM morning notification
    scheduleMorningRating(clubName || "The Club", bookingId || "123", role);
  }, [clubName, bookingId, role]);

  const handleDone = () => {
    // Navigate back to the main home screens based on role
    if (role === 'WOMAN') {
        navigation.reset({ index: 0, routes: [{ name: 'WomanHome' }] });
    } else {
        navigation.reset({ index: 0, routes: [{ name: 'ManHome' }] });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
         <Ionicons name="checkmark-circle" size={100} color={colors.success} />
      </View>
      
      <Text style={styles.title}>{message || "Booking Confirmed!"}</Text>
      
      <Text style={styles.sub}>You and {partner?.name || "your partner"} are verified.</Text>
      
      {otp && (
          <>
             <Text style={styles.label}>MATCH OTP</Text>
             <View style={styles.otpBox}>
                <Text style={styles.otp}>{otp}</Text>
             </View>
          </>
      )}

      {/* Updated Hint Text! */}
      <Text style={styles.hint}>Head to {clubName} and Enjoy your night!</Text>

      <TouchableOpacity style={styles.btn} onPress={handleDone}>
        <Text style={styles.btnText}>Done</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: 20 },
  iconContainer: { marginBottom: 10 },
  title: { color: colors.white, fontSize: 28, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  sub: { color: colors.textSecondary, fontSize: 16, marginBottom: 40, textAlign: 'center' },
  label: { color: colors.success, letterSpacing: 2, fontSize: 12, fontWeight: 'bold' },
  otpBox: { backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingVertical: 15, paddingHorizontal: 40, borderRadius: 16, marginVertical: 15, borderWidth: 1, borderColor: colors.success },
  otp: { color: colors.success, fontSize: 36, fontWeight: 'bold', letterSpacing: 8 },
  hint: { color: colors.textSecondary, fontSize: 14, marginBottom: 50, textAlign: 'center', paddingHorizontal: 20 },
  btn: { backgroundColor: colors.primary, paddingVertical: 18, paddingHorizontal: 60, borderRadius: 30, elevation: 5, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  btnText: { color: colors.white, fontSize: 18, fontWeight: 'bold' }
});