import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import colors from '../../constants/colours'; 
import TermsModal from '../../components/TermsModal'; // <--- IMPORT

export default function WelcomeScreen({ navigation }) {
  // State for Terms Modal
  const [isTermsVisible, setTermsVisible] = useState(false);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* ... Header & Logo Code Remains Same ... */}
      <View style={styles.header}>
        <Text style={styles.appName}>
          No<Text style={styles.highlight}>Stag</Text>
        </Text>
        <Text style={styles.tagline}>Never pay for stag entry</Text>
      </View>

      <View style={styles.imageContainer}>
        <View style={styles.placeholderCircle}>
          <Text style={styles.placeholderText}>LOGO</Text>
        </View>
      </View>

      {/* Footer Actions */}
      <View style={styles.footer}>
        
        {/* CLICKABLE TERMS TEXT */}
        <TouchableOpacity onPress={() => setTermsVisible(true)}>
          <Text style={styles.disclaimer}>
            By continuing, you agree to our{' '}
            <Text style={{textDecorationLine: 'underline', color: colors.white}}>
              Terms & Safety Guidelines.
            </Text>
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.buttonPrimary} 
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>

      {/* --- RENDER MODAL --- */}
      <TermsModal 
        visible={isTermsVisible} 
        onClose={() => setTermsVisible(false)} 
      />
      
    </View>
  );
}

// ... styles remain the same ...
const styles = StyleSheet.create({
  // Copy your existing styles here or keep them if you are just editing the file
  container: { flex: 1, backgroundColor: colors.background, justifyContent: 'space-between', padding: 24 },
  header: { marginTop: 80, alignItems: 'center' },
  appName: { fontSize: 42, fontWeight: '800', color: colors.textPrimary, letterSpacing: -1 },
  highlight: { color: colors.primary },
  tagline: { fontSize: 16, color: colors.textSecondary, marginTop: 8, letterSpacing: 0.5 },
  imageContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  placeholderCircle: { width: 180, height: 180, borderRadius: 90, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.surface, justifyContent: 'center', alignItems: 'center', shadowColor: colors.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 20, elevation: 10 },
  placeholderText: { color: colors.textSecondary, fontWeight: 'bold' },
  footer: { marginBottom: 50 },
  disclaimer: { textAlign: 'center', color: colors.textSecondary, fontSize: 12, marginBottom: 20, opacity: 0.8 },
  buttonPrimary: { backgroundColor: colors.primary, paddingVertical: 18, borderRadius: 16, alignItems: 'center', shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  buttonText: { color: colors.white, fontSize: 18, fontWeight: '700' },
});