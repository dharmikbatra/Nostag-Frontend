import React, { useEffect, useState, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons'; 
import { SocketContext } from '../../context/SocketContext';
import { UserContext } from '../../context/UserContext';
import colors from '../../constants/colours'; 

export default function WaitingScreen({ route, navigation }) {
  const { clubData, requestData } = route.params || {}; 
  const { socket } = useContext(SocketContext);
  const { user } = useContext(UserContext);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (!socket || !user || !requestData) return;

    const requestId = requestData.id;
    console.log(`🔌 Joining Queue for Request ID: ${requestId}`);

    // Join the queue room
    socket.emit('join_club_queue', { 
        clubId: clubData.id,
        manId: user._id,
        manName: user.name,
        requestId: requestId 
    });

    // --- 🟢 HANDLE BOOKING CONFIRMED (Your Event) ---
    const handleBooking = (data) => {
       console.log("🚀 Booking Confirmed Payload:", data);
       
       // Navigate to OTP Screen with mapped data
       navigation.replace('ManOtpScreen', { 
          bookingId: data.bookingId,
          otp: data.otp,
          clubName: data.clubName,
          // Extract partner details correctly from the nested object
          partnerName: data.partner?.name || "Your Match",
          partnerPhone: data.partner?.phone,
          partnerPic: data.partner?.profilePicUrl
       });
    };

    // Listeners
    socket.on('booking_confirmed', handleBooking);
    
    // Optional: Keep 'request_accepted' if you have a separate chat flow
    // socket.on('request_accepted', (data) => console.log("Chat Match:", data));

    return () => {
        socket.off('booking_confirmed', handleBooking);
        socket.emit('leave_club_queue', { requestId: requestId });
    };
  }, [socket, clubData, requestData, user]);

  // Timer Logic
  useEffect(() => {
    const interval = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCancel = () => navigation.goBack();

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Connecting...</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.circleContainer}>
          <View style={styles.pulseCircle}>
             <ActivityIndicator size="large" color={colors.white} />
          </View>
        </View>

        <Text style={styles.statusText}>You are in the queue for</Text>
        <Text style={styles.clubName}>{clubData?.name || "The Club"}</Text>
        <Text style={styles.timerText}>{formatTime(timer)}</Text>
        
        <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.hintText}>
               Please stay on this screen. We are notifying available matches.
            </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Ionicons name="close-circle-outline" size={24} color={colors.error} />
          <Text style={styles.cancelText}>Cancel Request</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: 20, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.surface },
  headerTitle: { color: colors.white, fontSize: 18, fontWeight: '600' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 },
  circleContainer: { marginBottom: 40, justifyContent: 'center', alignItems: 'center' },
  pulseCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(99, 102, 241, 0.2)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.primary },
  statusText: { color: colors.textSecondary, fontSize: 16, marginBottom: 8 },
  clubName: { color: colors.white, fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 15 },
  timerText: { color: colors.primary, fontSize: 42, fontWeight: 'bold', fontVariant: ['tabular-nums'], marginBottom: 40 },
  infoBox: { flexDirection: 'row', backgroundColor: colors.surface, padding: 15, borderRadius: 12, alignItems: 'center', maxWidth: '90%' },
  hintText: { color: colors.textSecondary, fontSize: 13, marginLeft: 10, flex: 1, lineHeight: 18 },
  footer: { padding: 30, alignItems: 'center' },
  cancelButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(239, 68, 68, 0.1)', paddingVertical: 14, paddingHorizontal: 30, borderRadius: 30, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.3)' },
  cancelText: { color: colors.error, marginLeft: 8, fontWeight: '600', fontSize: 16 },
});