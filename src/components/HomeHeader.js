import React, { useContext, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  Modal, 
  FlatList 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { UserContext } from '../context/UserContext';
import colors from '../constants/colours'; 

export default function HomeHeader() {
  const navigation = useNavigation();
  const { 
    user, 
    userLocation, 
    exploringLocation, 
    setExploringLocation, 
    OPERATIONAL_AREAS 
  } = useContext(UserContext); 

  const [dropdownVisible, setDropdownVisible] = useState(false);

  const displayBalance = user?.walletBalance?.toLocaleString() || '0';
  const profileImage = user?.profilePicUrl;

  // Check if the userLocation matches the DEFAULT_LOCATION coordinates
  const isDefaultLocation = userLocation?.lat === 12.97 && userLocation?.lng === 77.64;
  const locationPrefix = isDefaultLocation ? "📍 Default" : "📍 My Location";

  // Prepend the dynamic location to the dropdown
  const dropdownOptions = userLocation 
    ? [
        { 
          id: isDefaultLocation ? 'default' : 'current', 
          name: `${locationPrefix} (${userLocation.name || 'Bengaluru'})`, 
          lat: userLocation.lat, 
          lng: userLocation.lng 
        },
        ...OPERATIONAL_AREAS
      ]
    : OPERATIONAL_AREAS;

  const handleSelectArea = (area) => {
    setExploringLocation(area);
    setDropdownVisible(false);
  };

  // Safe fallback if exploringLocation hasn't loaded yet
  const exploringName = exploringLocation?.name || "Locating...";

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

      {/* 2. Sub-Header: Clickable Location Dropdown */}
      <TouchableOpacity 
        style={styles.locationBar} 
        activeOpacity={0.7}
        onPress={() => setDropdownVisible(true)}
      >
        <Ionicons name="location-sharp" size={14} color={colors.primary} />
        <Text style={styles.locationText}>Exploring: </Text>
        <Text style={styles.locationHighlight}>{exploringName}</Text>
        <Ionicons name="chevron-down" size={14} color={colors.textSecondary} style={{ marginLeft: 4 }} />
      </TouchableOpacity>

      {/* 3. Dropdown Modal */}
      <Modal visible={dropdownVisible} transparent={true} animationType="fade">
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setDropdownVisible(false)}
        >
          <View style={styles.dropdownMenu}>
            <Text style={styles.dropdownTitle}>Select Area</Text>
            
            <FlatList
              data={dropdownOptions}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const isActive = exploringLocation?.id === item.id;
                return (
                  <TouchableOpacity 
                    style={[
                      styles.dropdownItem, 
                      isActive && styles.dropdownItemActive
                    ]}
                    onPress={() => handleSelectArea(item)}
                  >
                    <Text style={[
                      styles.dropdownItemText,
                      isActive && styles.dropdownItemTextActive
                    ]}>
                      {item.name}
                    </Text>
                    {isActive && (
                       <Ionicons name="checkmark" size={18} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.background,
    zIndex: 10,
    paddingTop: 50, 
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 15,
  },
  walletButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 30, 
    paddingRight: 14,
    paddingLeft: 4,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.borderLight,
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
  profileButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
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
    paddingVertical: 12,
    backgroundColor: colors.surfaceLight, 
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.borderExtraLight, 
  },
  locationText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginLeft: 6,
  },
  locationHighlight: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  // --- Modal Dropdown Styles ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownMenu: {
    width: '80%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
    maxHeight: '70%', 
  },
  dropdownTitle: {
    color: colors.textSecondary,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 15,
    fontWeight: 'bold',
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderExtraLight,
  },
  dropdownItemActive: {
    backgroundColor: colors.primaryBackground,
    borderRadius: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 0,
  },
  dropdownItemText: {
    color: colors.white,
    fontSize: 16,
  },
  dropdownItemTextActive: {
    color: colors.primary,
    fontWeight: 'bold',
  }
});