import React, { useState, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons'; 
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import DateTimePicker from '@react-native-community/datetimepicker';
import colors from '../../constants/colours'; 
import { API_BASE_URL } from '../../constants/config'; 
import { UserContext } from '../../context/UserContext';

export default function ProfileSetupScreen({ navigation }) {
  const {setUser} = useContext(UserContext);
  const [name, setName] = useState('');
  const [height, setHeight] = useState(''); 
  const [gender, setGender] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [dob, setDob] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [dobLabel, setDobLabel] = useState(''); // Text to show in input (e.g. "25/12/1999")

  // Helper: Calculate Age directly from Date Object
  const calculateAge = (birthDate) => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Handle Date Selection
  const onDateChange = (event, selectedDate) => {
    // On Android, dismissing the picker returns undefined date, so we hide picker
    setShowPicker(false);

    if (selectedDate) {
      setDob(selectedDate);
      const formattedDate = `${selectedDate.getDate()}/${selectedDate.getMonth() + 1}/${selectedDate.getFullYear()}`;
      setDobLabel(formattedDate);
    }
  };

  const handleNextStep = async () => {
    if (!name || !height || !dobLabel || !gender) {
      Alert.alert("Missing Details", "Please fill in all details.");
      return;
    }

    const age = calculateAge(dob);
    if (age < 18) {
       Alert.alert("Invalid Age", "You must be 18+ to use this app.");
       return;
    }

    setLoading(true);

    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) throw new Error("No access token found. Please login again.");

      const payload = {
        name: name,
        age: age, 
        role: gender === 'man' ? 'MAN' : 'WOMAN', 
        height: parseInt(height) || 0 
      };

      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        const storedUser = await AsyncStorage.getItem('user');
        const currentUser = storedUser ? JSON.parse(storedUser) : {};
        const updatedUser = { ...currentUser, ...data };
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);

        setLoading(false);
        navigation.navigate('PhotoVerification', { userRole: gender });
      } else {
        throw new Error(data.message || "Failed to update profile.");
      }

    } catch (error) {
      setLoading(false);
      console.error("Profile Update Error:", error);
      Alert.alert("Error", error.message);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <StatusBar style="light" />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.header}>
          <Text style={styles.title}>Create Profile</Text>
          <Text style={styles.subtitle}>Tell us a bit about yourself.</Text>
        </View>

        {/* 1. Name Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput 
            style={styles.input}
            placeholder="John Doe"
            placeholderTextColor={colors.textSecondary}
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* 2. Height Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Height (cm)</Text>
          <TextInput 
            style={styles.input}
            placeholder="e.g. 175"
            placeholderTextColor={colors.textSecondary}
            value={height}
            onChangeText={setHeight}
            keyboardType="numeric"
            maxLength={3}
          />
        </View>

        {/* 3. Gender Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>I am a...</Text>
          <View style={styles.genderContainer}>
            <TouchableOpacity 
              style={[styles.genderCard, gender === 'man' && styles.genderCardActive]}
              onPress={() => setGender('man')}
            >
              <Ionicons name="man" size={28} color={gender === 'man' ? colors.white : colors.textSecondary} />
              <Text style={[styles.genderText, gender === 'man' && styles.genderTextActive]}>Gentleman</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.genderCard, gender === 'woman' && styles.genderCardActive]}
              onPress={() => setGender('woman')}
            >
              <Ionicons name="woman" size={28} color={gender === 'woman' ? colors.white : colors.textSecondary} />
              <Text style={[styles.genderText, gender === 'woman' && styles.genderTextActive]}>Lady</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 4. DOB Input (DATE PICKER) */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date of Birth</Text>
          
          <TouchableOpacity onPress={() => setShowPicker(true)} activeOpacity={0.8}>
            <View pointerEvents="none"> {/* Prevents manual typing */}
              <TextInput 
                style={styles.input}
                placeholder="Select Date"
                placeholderTextColor={colors.textSecondary}
                value={dobLabel}
                editable={false} // Cannot type manually
              />
              <Ionicons 
                name="calendar" 
                size={20} 
                color={colors.textSecondary} 
                style={{ position: 'absolute', right: 16, top: 16 }} 
              />
            </View>
          </TouchableOpacity>

          {/* Render Picker Conditional on State */}
          {showPicker && (
            <DateTimePicker
              value={dob}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDateChange}
              maximumDate={new Date()} // Cannot pick future dates
              themeVariant="dark" // iOS Dark Mode
            />
          )}
        </View>

      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.button, (!name || !height || !gender || !dobLabel || loading) && styles.buttonDisabled]} 
          onPress={handleNextStep}
          disabled={!name || !height || !gender || !dobLabel || loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Text style={styles.buttonText}>Next Step</Text>
              <Ionicons name="arrow-forward" size={20} color={colors.white} style={{marginLeft: 8}}/>
            </>
          )}
        </TouchableOpacity>
      </View>

    </KeyboardAvoidingView>
  );
}

// ... styles remain the same ...
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 24, paddingTop: 80 },
  header: { marginBottom: 30 },
  title: { fontSize: 32, fontWeight: '800', color: colors.textPrimary, marginBottom: 10 },
  subtitle: { fontSize: 16, color: colors.textSecondary },
  inputGroup: { marginBottom: 20 },
  label: { color: colors.textSecondary, fontSize: 14, fontWeight: '600', marginBottom: 8, marginLeft: 4 },
  input: { backgroundColor: colors.surface, borderRadius: 16, paddingHorizontal: 20, paddingVertical: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', color: colors.white, fontSize: 16, fontWeight: '600' },
  genderContainer: { flexDirection: 'row', gap: 16 },
  genderCard: { flex: 1, backgroundColor: colors.surface, borderRadius: 16, paddingVertical: 20, alignItems: 'center', borderWidth: 2, borderColor: 'transparent', gap: 10 },
  genderCardActive: { borderColor: colors.primary, backgroundColor: 'rgba(99, 102, 241, 0.1)' },
  genderText: { color: colors.textSecondary, fontSize: 16, fontWeight: '600' },
  genderTextActive: { color: colors.white },
  footer: { padding: 24, paddingBottom: 40, borderTopWidth: 1, borderTopColor: colors.surface },
  button: { flexDirection: 'row', backgroundColor: colors.primary, paddingVertical: 18, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  buttonDisabled: { backgroundColor: colors.surface, opacity: 0.5 },
  buttonText: { color: colors.white, fontSize: 18, fontWeight: '700' },
});