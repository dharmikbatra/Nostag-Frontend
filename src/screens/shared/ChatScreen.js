import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  FlatList, KeyboardAvoidingView, Platform, SafeAreaView, Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ChatScreen({ route, navigation }) {
  // Get params passed from Lobby/Home (e.g., the other person's name, room ID)
  const { channelId, otherUserName, isVideoCall } = route.params || {};
  
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef();
  
  // --- 1. SESSION TIMER LOGIC ---
  const [secondsLeft, setSecondsLeft] = useState(300); // e.g., 5 minutes for demo
  
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleEndChat(); // Auto-end when time is up
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // --- 2. SEND MESSAGE LOGIC ---
  const handleSend = () => {
    if (inputText.trim().length === 0) return;

    const newMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'me', // 'me' or 'them'
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // UI Update (Optimistic)
    setMessages((prev) => [...prev, newMessage]);
    setInputText('');

    // TODO: EMIT SOCKET EVENT HERE
    // socket.emit('send_message', { roomId: channelId, message: newMessage });
  };

  // --- 3. RECEIVE MESSAGE LOGIC (Mock) ---
  useEffect(() => {
    // TODO: LISTEN FOR SOCKET EVENTS HERE
    // socket.on('receive_message', (msg) => setMessages(prev => [...prev, msg]));
  }, []);


  const handleEndChat = () => {
    Alert.alert("End Chat", "Are you sure you want to end this session?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "End Now", 
        style: 'destructive', 
        onPress: () => {
           // socket.emit('leave_room');
           navigation.reset({ index: 0, routes: [{ name: 'WomanHome' }] }); // Or ManHome
        } 
      }
    ]);
  };

  // Render a single message bubble
  const renderItem = ({ item }) => {
    const isMe = item.sender === 'me';
    return (
      <View style={[styles.msgRow, isMe ? styles.msgRowRight : styles.msgRowLeft]}>
        {!isMe && <View style={styles.avatarPlaceholder}><Text style={styles.avatarText}>{otherUserName?.charAt(0)}</Text></View>}
        <View style={[styles.bubble, isMe ? styles.bubbleRight : styles.bubbleLeft]}>
          <Text style={isMe ? styles.textRight : styles.textLeft}>{item.text}</Text>
          <Text style={styles.timestamp}>{item.timestamp}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerName}>{otherUserName || "Unknown User"}</Text>
          <Text style={styles.headerStatus}>Connected • Session Active</Text>
        </View>
        <View style={styles.timerContainer}>
            <Text style={[styles.timerText, secondsLeft < 60 && { color: '#ef4444' }]}>
                {formatTime(secondsLeft)}
            </Text>
        </View>
        <TouchableOpacity style={styles.endBtn} onPress={handleEndChat}>
           <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* CHAT LIST */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* INPUT AREA */}
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor="#94a3b8"
            value={inputText}
            onChangeText={setInputText}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, borderBottomWidth: 1, borderBottomColor: '#334155', backgroundColor: '#1e293b'
  },
  headerName: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  headerStatus: { color: '#10b981', fontSize: 12 },
  timerContainer: { backgroundColor: '#334155', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  timerText: { color: '#fff', fontWeight: 'bold', fontVariant: ['tabular-nums'] },
  endBtn: { backgroundColor: '#ef4444', padding: 8, borderRadius: 20 },
  
  // List
  listContent: { padding: 16, paddingBottom: 20 },
  msgRow: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-end' },
  msgRowRight: { justifyContent: 'flex-end' },
  msgRowLeft: { justifyContent: 'flex-start' },
  
  avatarPlaceholder: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#475569', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  avatarText: { color: '#fff', fontWeight: 'bold' },
  
  bubble: { maxWidth: '75%', padding: 12, borderRadius: 16 },
  bubbleRight: { backgroundColor: '#6366f1', borderBottomRightRadius: 2 },
  bubbleLeft: { backgroundColor: '#334155', borderBottomLeftRadius: 2 },
  
  textRight: { color: '#fff', fontSize: 15 },
  textLeft: { color: '#e2e8f0', fontSize: 15 },
  timestamp: { fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 4, alignSelf: 'flex-end' },

  // Input
  inputContainer: { flexDirection: 'row', padding: 12, backgroundColor: '#1e293b', alignItems: 'center' },
  input: { flex: 1, backgroundColor: '#334155', color: '#fff', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 10, marginRight: 10, fontSize: 16 },
  sendBtn: { backgroundColor: '#6366f1', width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
});