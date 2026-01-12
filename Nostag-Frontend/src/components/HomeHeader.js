import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { UserContext } from '../context/UserContext';
import colors from '../constants/colours'; 

export default function HomeHeader() {
  const navigation = useNavigation();
  const { user } = useContext(UserContext); 

  const displayBalance = user?.walletBalance?.toLocaleString() || '0';
  const profileImage = user?.profilePicUrl;
  
  // You might want to get this from a LocationContext later
  const currentLocation = "Bengaluru, Koramangala"; 

  return (
    <View style={styles.wrapper}>
      {/* 1. Main Row: Wallet & Profile */}
      <View style={styles.container}>
        
        {/* LEFT: Wallet Button */}
        <TouchableOpacity 
          style={styles.walletButton} 
          onPress={() => navigation.navigate('Wallet')}
          activeOpacity={0.7}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="wallet" size={18} color={colors.white} />
          </View>
          <Text style={styles.balanceText}>₹ {displayBalance}</Text>
        </TouchableOpacity>

        {/* RIGHT: User Profile Button */}
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => navigation.navigate('UserProfile')}
          activeOpacity={0.7}
        >
          {profileImage ? (
             <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
             <Ionicons name="person" size={24} color={colors.textSecondary} />
          )}
        </TouchableOpacity>

      </View>

      {/* 2. Sub-Header: Location Bar */}
      <View style={styles.locationBar}>
        <Ionicons name="location-sharp" size={12} color={colors.primary} />
        <Text style={styles.locationText}>
           Detected: <Text style={styles.locationHighlight}>{currentLocation}</Text>
        </Text>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.background,
    zIndex: 10,
    paddingTop: 50, // Safe Area padding
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 15,
  },
  // --- Wallet Styles ---
  walletButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 30, 
    paddingRight: 14,
    paddingLeft: 4,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  iconContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primary, 
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  balanceText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  // --- Profile Styles ---
  profileButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  // --- Location Bar Styles ---
  locationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.03)', // Very subtle difference
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  locationText: {
    color: colors.textSecondary, // e.g., #94a3b8
    fontSize: 12,
    marginLeft: 6,
  },
  locationHighlight: {
    color: colors.white,
    fontWeight: '600',
  },
});