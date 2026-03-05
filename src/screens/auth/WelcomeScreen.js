import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native'; 
import { StatusBar } from 'expo-status-bar';
import colors from '../../constants/colours'; 
import TermsModal from '../../components/TermsModal'; 
import { registerForPushNotificationsAsync } from '../../services/notifications';

// Get device screen dimensions
const { width, height } = Dimensions.get('window');

// Calculate responsive sizes
const LOGO_SIZE = width * 0.6; // Logo takes up 60% of screen width
const HEADER_MARGIN = height * 0.12; // Top margin is 12% of screen height

export default function WelcomeScreen({ navigation }) {
  const [isTermsVisible, setTermsVisible] = useState(false);

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        await registerForPushNotificationsAsync();
        console.log("Permission check completed on Welcome Screen");
      } catch (error) {
        console.log("Error requesting permissions:", error);
      }
    };

    checkPermissions();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* --- Header --- */}
      <View style={styles.header}>
        <Text style={styles.appName}>
          <Text style={styles.highlight2}>No</Text><Text style={styles.highlight}>Stag</Text>
        </Text>
        <Text style={styles.tagline}>Never pay for stag entry</Text>
      </View>

      {/* --- Logo Image --- */}
      <View style={styles.imageContainer}>
        <View style={styles.logoWrapper}>
          <Image 
            source={require('../../../assets/icon2.png')}
            style={styles.logoImage} 
          />
        </View>
      </View>

      {/* --- Footer Actions --- */}
      <View style={styles.footer}>
        
        {/* CLICKABLE TERMS TEXT */}
        <TouchableOpacity onPress={() => setTermsVisible(true)} activeOpacity={0.7}>
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
          activeOpacity={0.8}
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

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.background, 
    justifyContent: 'space-between', 
    padding: 24 
  },
  header: { 
    marginTop: HEADER_MARGIN, // <--- DYNAMIC: 12% of screen height
    alignItems: 'center' 
  },
  appName: { 
    // We can use a slight responsive tweak for font size too, or keep it fixed since text scales well natively
    fontSize: width > 400 ? 64 : 56, 
    fontWeight: '800', 
    color: colors.textPrimary, 
    letterSpacing: -1 
  },
  highlight: { 
    color: colors.primary 
  },
  highlight2: { 
    color: colors.secondary 
  },
  tagline: { 
    fontSize: width > 400 ? 20 : 18, 
    color: colors.textSecondary, 
    marginTop: 8, 
    letterSpacing: 0.5 
  },
  imageContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  
  // Responsive Logo Styles
  logoWrapper: { 
    width: LOGO_SIZE,  // <--- DYNAMIC: 60% of screen width
    height: LOGO_SIZE, // <--- DYNAMIC
    borderRadius: LOGO_SIZE / 3, // <--- Keeps the exact proportion of your curved box
    backgroundColor: colors.surface, 
    justifyContent: 'center', 
    alignItems: 'center', 
    shadowColor: colors.surface, 
    shadowOffset: { width: 0, height: 0 }, 
    shadowOpacity: 0.4, 
    shadowRadius: 20, 
    elevation: 10,
    overflow: 'hidden', 
    borderWidth: 0,
    borderColor: colors.borderLight || 'rgba(255,255,255,0.1)'
  },
  logoImage: { 
    width: '100%', 
    height: '100%', 
    resizeMode: 'cover' 
  },

  footer: { 
    marginBottom: height * 0.05 // <--- DYNAMIC: 5% of screen height from bottom
  },
  disclaimer: { 
    textAlign: 'center', 
    color: colors.textSecondary, 
    fontSize: 12, 
    marginBottom: 20, 
    opacity: 0.8 
  },
  buttonPrimary: { 
    backgroundColor: colors.primary, 
    paddingVertical: 18, 
    borderRadius: 16, 
    alignItems: 'center', 
    shadowColor: colors.primary, 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 8, 
    elevation: 5 
  },
  buttonText: { 
    color: colors.white, 
    fontSize: 18, 
    fontWeight: '700' 
  },
});