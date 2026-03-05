import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { clubApi } from '../../services/ApiService';
import colors from '../../constants/colours';

export default function WomanLobbyScreen({ route, navigation }) {
  // We receive the exact GPS coordinates passed from the Home Screen
  const { clubData, userLat, userLng } = route.params;

  const [matchData, setMatchData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [queueEmpty, setQueueEmpty] = useState(false);

  // --- 1. FETCH NEXT MATCH ---
  const fetchNextMatch = useCallback(async () => {
    setLoading(true);
    setMatchData(null);
    try {
      // Call backend to get the guy at the front of the queue
      const data = await clubApi.getNextMatch(clubData.id);
      console.log("Fetched Next Match:", data);
      
      // Check for requestId from your new JSON payload
      if (data && data.requestId) {
        setMatchData(data);
        // Dynamically set the timer based on backend lock
        setTimeLeft(data.lockExpiresInSeconds || 20); 
        setQueueEmpty(false);
      } else {
        setQueueEmpty(true);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setQueueEmpty(true); // 404 means no one is currently in the queue
      } else {
        Alert.alert("Error", "Could not fetch next match.");
        navigation.goBack();
      }
    } finally {
      setLoading(false);
    }
  }, [clubData.id, userLat, userLng, navigation]);

  // Initial fetch on screen load
  useEffect(() => {
    fetchNextMatch();
  }, [fetchNextMatch]);

  // --- 2. THE COUNTDOWN TIMER ---
  useEffect(() => {
    // If no match is loaded, an action is processing, or time is up, stop the timer
    if (!matchData || actionLoading || timeLeft <= 0) return;

    const timerInterval = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerInterval);
          handleReject();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [matchData, timeLeft, actionLoading]);

  // --- 3. ACTIONS: REJECT & ACCEPT ---
  const handleReject = () => {
    // Timer ran out or she manually rejected. Fetch the next person in line.
    fetchNextMatch();
  };

  const handleAccept = async () => {
    setActionLoading(true);
    try {
      const response = await clubApi.acceptRequest(matchData.requestId, userLat, userLng);
      console.log("Accept Match Response:", response);
      
      navigation.replace('WomanOtpScreen', { 
        bookingId: response.bookingId,
        manName: matchData.man.name,
        manPhone: matchData.man.phoneNumber,
        clubName: clubData.clubName
      });

    } catch (error) {
      const msg = error.response?.data?.message || "Could not accept match. He might have cancelled.";
      Alert.alert("Match Failed", msg);
      fetchNextMatch(); // Try to get the next person instead
    } finally {
      setActionLoading(false);
    }
  };

  // --- UI RENDERS ---
  
  // 1. Loading State
  if (loading && !matchData) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Finding the next match...</Text>
      </SafeAreaView>
    );
  }

  // 2. Empty Queue State
  if (queueEmpty) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Ionicons name="sad-outline" size={60} color={colors.textSecondary} />
        <Text style={styles.emptyText}>No more men waiting at {clubData.name}.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
           <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Calculate timer color (turns red when 5 seconds or less remain)
  const timerColor = timeLeft > 5 ? colors.primary : colors.error;

  // 3. Match Card State
  return (
    <SafeAreaView style={styles.container}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIcon}>
          <Ionicons name="arrow" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{clubData.name}</Text>
        <View style={{ width: 24 }} /> 
      </View>

      {/* MATCH CARD */}
      {matchData && matchData.man && (
        <View style={styles.cardContainer}>
          
          <View style={[styles.timerHeader, { borderColor: timerColor }]}>
             <Ionicons name="timer-outline" size={20} color={timerColor} />
             <Text style={[styles.timerText, { color: timerColor }]}>
               {timeLeft}s remaining
             </Text>
          </View>

          <Image 
            source={{ uri: matchData.man.profilePicUrl || 'https://via.placeholder.com/300' }} 
            style={styles.profileImage} 
          />
          
          <View style={styles.infoBox}>
            {/* Displaying Name and Height from payload */}
            <Text style={styles.nameText}>{matchData.man.name}</Text>
            {matchData.man.height ? (
              <Text style={styles.subText}>Height: {matchData.man.height} cm</Text>
            ) : null}
            
            <View style={styles.earningsBox}>
                <Text style={styles.earningsLabel}>YOU WILL EARN</Text>
                <Text style={styles.earningsValue}>₹{clubData.currentPrice - clubData.platformFee}</Text>
            </View>
          </View>

          <View style={styles.actionButtons}>
            {/* DECLINE BUTTON */}
            <TouchableOpacity 
              style={[styles.btn, styles.rejectBtn]} 
              onPress={handleReject}
              disabled={actionLoading}
            >
              <Ionicons name="close" size={36} color={colors.error} />
            </TouchableOpacity>

            {/* ACCEPT BUTTON */}
            <TouchableOpacity 
              style={[styles.btn, styles.acceptBtn]} 
              onPress={handleAccept}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator color={colors.white} size="large" />
              ) : (
                <Ionicons name="heart" size={36} color={colors.white} />
              )}
            </TouchableOpacity>
          </View>

        </View>
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background, padding: 20 },
  loadingText: { color: colors.textSecondary, marginTop: 15, fontSize: 16 },
  
  emptyText: { color: colors.white, marginTop: 15, fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  backBtn: { marginTop: 25, paddingVertical: 12, paddingHorizontal: 24, backgroundColor: colors.surface, borderRadius: 30, borderWidth: 1, borderColor: colors.borderLight },
  backBtnText: { color: colors.white, fontSize: 16, fontWeight: 'bold' },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 20 },
  backIcon: { padding: 5 },
  headerTitle: { color: colors.white, fontSize: 18, fontWeight: 'bold' },

  cardContainer: { flex: 1, padding: 20, alignItems: 'center' },
  
  timerHeader: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 25, marginBottom: 20, borderWidth: 1 },
  timerText: { fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  
  profileImage: { width: '100%', height: 320, borderRadius: 24, backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.borderLight },
  
  infoBox: { marginTop: 20, alignItems: 'center', width: '100%' },
  nameText: { color: colors.white, fontSize: 32, fontWeight: '800', marginBottom: 5 },
  subText: { color: colors.textSecondary, fontSize: 16, fontWeight: '500', marginBottom: 15 },
  
  earningsBox: { backgroundColor: 'rgba(16, 185, 129, 0.15)', width: '100%', alignItems: 'center', padding: 15, borderRadius: 16, borderWidth: 1, borderColor: colors.success },
  earningsLabel: { color: colors.success, fontSize: 12, fontWeight: 'bold', letterSpacing: 1 },
  earningsValue: { color: colors.white, fontSize: 32, fontWeight: 'bold' },

  actionButtons: { flexDirection: 'row', marginTop: 30, width: '100%', justifyContent: 'space-around' },
  btn: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  rejectBtn: { backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.borderLight },
  acceptBtn: { backgroundColor: colors.primary, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8 },
});