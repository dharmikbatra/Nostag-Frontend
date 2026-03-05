import React, { useState, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserContext } from '../../context/UserContext'; 
import colors from '../../constants/colours';
import { clubApi } from '../../services/ApiService'; // <--- Import your API

export default function RatingScreen({ route, navigation }) {
  const { clubName, bookingId } = route.params || { clubName: 'The Club', bookingId: '0' };
  
  const { user } = useContext(UserContext);

  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false); // <--- Add loading state

  // Helper to go home 
  const goHome = () => {
    const targetScreen = user?.role === 'WOMAN' ? 'WomanHome' : 'ManHome';
    
    navigation.reset({
      index: 0,
      routes: [{ name: targetScreen }],
    });
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert("Rate us", "Please select a star rating to continue.");
      return;
    }

    try {
      setLoading(true);
      console.log(`Submitting Rating: ${rating}/5 for Booking ${bookingId}`);
      
      // 🚀 Make the API Call
      await clubApi.rateClub(bookingId, rating);
      
      // Success
      Alert.alert("Thank You!", "Your feedback helps us improve.", [
        { text: "OK", onPress: goHome }
      ]);

    } catch (error) {
      console.error("Failed to submit rating:", error);
      Alert.alert(
        "Submission Failed", 
        "We couldn't submit your rating right now. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      {/* --- CLOSE BUTTON --- */}
      <TouchableOpacity 
        style={styles.closeButton} 
        onPress={goHome} 
        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        disabled={loading} // Prevent closing while submitting
      >
         <Ionicons name="close" size={28} color={colors.textSecondary} />
      </TouchableOpacity>
      
      <View style={styles.content}>
        <Text style={styles.title}>How was your night?</Text>
        <Text style={styles.subtitle}>Rate your experience at {clubName}</Text>

        {/* Star Rating System */}
        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity 
              key={star} 
              activeOpacity={0.7}
              onPress={() => setRating(star)}
              disabled={loading}
            >
              <Ionicons 
                name={star <= rating ? "star" : "star-outline"} 
                size={42} 
                color="#FFD700" // Kept gold for stars, as it's standard UX
                style={{ marginHorizontal: 6 }}
              />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Write a review</Text>
        <TextInput
          style={styles.input}
          placeholder="Tell us what you liked (optional)..."
          placeholderTextColor={colors.textSecondary}
          multiline
          value={review}
          onChangeText={setReview}
          editable={!loading}
        />

        {/* Submit Button with Loading State */}
        <TouchableOpacity 
           style={[styles.submitBtn, loading && styles.submitBtnDisabled]} 
           onPress={handleSubmit}
           disabled={loading}
        >
          {loading ? (
             <ActivityIndicator color={colors.white} />
          ) : (
             <Text style={styles.submitText}>Submit Review</Text>
          )}
        </TouchableOpacity>

        {/* Skip Button */}
        <TouchableOpacity style={styles.skipBtn} onPress={goHome} disabled={loading}>
           <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </View>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.background, 
    padding: 30,
  },
  closeButton: {
    position: 'absolute',
    top: 50, 
    right: 25,
    zIndex: 10,
    backgroundColor: colors.borderLight, // Using theme color
    borderRadius: 20,
    padding: 5,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: { 
    color: colors.white, 
    fontSize: 28, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    marginBottom: 10 
  },
  subtitle: { 
    color: colors.textSecondary, 
    fontSize: 16, 
    textAlign: 'center', 
    marginBottom: 40 
  },
  starsContainer: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    marginBottom: 40 
  },
  label: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 8,
    marginLeft: 4,
  },
  input: { 
    backgroundColor: colors.surface, 
    color: colors.white, 
    padding: 15, 
    borderRadius: 12, 
    height: 120, 
    textAlignVertical: 'top', 
    borderWidth: 1, 
    borderColor: colors.borderLight, // Using theme color
    marginBottom: 30 
  },
  submitBtn: { 
    backgroundColor: colors.primary, 
    padding: 16, 
    borderRadius: 30, 
    alignItems: 'center',
    elevation: 3,
    marginBottom: 15
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitText: { 
    color: colors.white, 
    fontWeight: 'bold', 
    fontSize: 18 
  },
  skipBtn: {
    alignItems: 'center',
    padding: 10
  },
  skipText: {
    color: colors.textSecondary,
    fontSize: 14
  }
});