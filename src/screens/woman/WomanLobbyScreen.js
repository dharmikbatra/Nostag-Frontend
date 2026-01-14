import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function WomanLobbyScreen({ route, navigation }) {
  const { clubData } = route.params;
  const [modalVisible, setModalVisible] = useState(false);
  const [incomingRequest, setIncomingRequest] = useState(null);

  // SIMULATION: Simulate receiving a request after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
        // This data would usually come from Socket.io
        setIncomingRequest({
            manName: "User #9921",
            amount: clubData.earning
        });
        setModalVisible(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleAccept = () => {
      setModalVisible(false);
      // 1. Send signal to backend that we accepted
    // socket.emit('request_accepted', { requestId: incomingRequest.id });

    // 2. Navigate immediately
    navigation.navigate('ChatScreen', { 
        channelId: incomingRequest.id, // The Room ID
        otherUserName: incomingRequest.manName,
        isVideoCall: false 
    });
      Alert.alert("Connected!", "Starting video call...");
  };

  const handleReject = () => {
      setModalVisible(false);
      setIncomingRequest(null);
      // Resume searching...
  };

  const handleGoOffline = () => {
    // Logic to leave the queue
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      
      {/* 1. Header Area */}
      <View style={styles.header}>
        <Text style={styles.statusTitle}>You are Live in</Text>
        <Text style={styles.clubName}>{clubData.name}</Text>
        <View style={styles.tag}>
             <Text style={styles.tagText}>Earning: ₹{clubData.earning}/call</Text>
        </View>
      </View>

      {/* 2. Pulse Animation / Searching UI */}
      <View style={styles.centerContent}>
        <View style={styles.pulseCircle}>
            <ActivityIndicator size="large" color="#ffffff" />
        </View>
        <Text style={styles.waitingText}>Matching you with a client...</Text>
        <Text style={styles.hintText}>Stay on this screen to receive requests.</Text>
      </View>

      {/* 3. Leave Button */}
      <TouchableOpacity style={styles.leaveButton} onPress={handleGoOffline}>
        <Text style={styles.leaveText}>Go Back</Text>
      </TouchableOpacity>

      {/* 4. INCOMING REQUEST MODAL */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
      >
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Incoming Request! 🎉</Text>
                
                <Text style={styles.modalSub}>
                    Client is ready to connect.
                </Text>

                <View style={styles.earningsBox}>
                    <Text style={styles.earningsLabel}>YOU WILL EARN</Text>
                    <Text style={styles.earningsValue}>₹{incomingRequest?.amount}</Text>
                </View>

                <View style={styles.modalButtons}>
                    <TouchableOpacity style={styles.rejectBtn} onPress={handleReject}>
                        <Text style={styles.rejectText}>Decline</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.acceptBtn} onPress={handleAccept}>
                        <Text style={styles.acceptText}>Accept & Call</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', padding: 20 },
  header: { alignItems: 'center', marginTop: 20 },
  statusTitle: { color: '#94a3b8', fontSize: 16 },
  clubName: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginVertical: 5 },
  tag: { backgroundColor: '#1e293b', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, marginTop: 5 },
  tagText: { color: '#10b981', fontWeight: 'bold' },

  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  pulseCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(99, 102, 241, 0.3)', justifyContent: 'center', alignItems: 'center', marginBottom: 30 },
  waitingText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  hintText: { color: '#64748b', fontSize: 14, marginTop: 10 },

  leaveButton: { backgroundColor: '#334155', padding: 15, borderRadius: 30, alignItems: 'center', marginBottom: 20 },
  leaveText: { color: '#fff', fontWeight: 'bold' },

  // Modal Styles
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalContent: { backgroundColor: '#1e293b', padding: 25, borderTopLeftRadius: 25, borderTopRightRadius: 25, alignItems: 'center' },
  modalTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  modalSub: { color: '#94a3b8', marginBottom: 20 },
  earningsBox: { backgroundColor: 'rgba(16, 185, 129, 0.15)', width: '100%', alignItems: 'center', padding: 15, borderRadius: 12, marginBottom: 25, borderWidth: 1, borderColor: '#10b981' },
  earningsLabel: { color: '#10b981', fontSize: 12, fontWeight: 'bold', letterSpacing: 1 },
  earningsValue: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  
  modalButtons: { flexDirection: 'row', width: '100%', justifyContent: 'space-between' },
  rejectBtn: { flex: 1, padding: 16, alignItems: 'center', marginRight: 10 },
  rejectText: { color: '#ef4444', fontWeight: 'bold', fontSize: 16 },
  acceptBtn: { flex: 2, backgroundColor: '#6366f1', borderRadius: 12, padding: 16, alignItems: 'center' },
  acceptText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});