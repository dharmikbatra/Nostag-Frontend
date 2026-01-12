import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import * as Location from 'expo-location'; // Install this package!
import colors from '../../constants/colours';
import HomeHeader from '../../components/HomeHeader'; 
import ClubCard from '../../components/ClubCard'; 
import CustomModal from '../../components/CustomModal';

// --- MOCK DATA (In real app, this comes from backend based on lat/long) ---
const MOCK_NEARBY_CLUBS = [
  {
    id: '1',
    name: 'Club Onyx',
    address: 'Koramangala, 5th Block',
    distance: '0.8', // km
    price: '500',
    images: [
      'https://images.unsplash.com/photo-1570872626485-d8ffea69f463?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=800&auto=format&fit=crop'
    ]
  },
  {
    id: '2',
    name: 'Skyye High',
    address: 'UB City, Vittal Mallya Rd',
    distance: '2.4',
    price: '500',
    images: [
      'https://images.unsplash.com/photo-1514525253440-b393452e8d26?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1576675784201-0e142b423952?q=80&w=800&auto=format&fit=crop'
    ]
  },
];

export default function ManHomeScreen() {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [clubs, setClubs] = useState([]);
  
  // State for Booking Confirmation
  const [selectedClub, setSelectedClub] = useState(null);

  useEffect(() => {
    (async () => {
      console.log("Requesting permissions...");
      let { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        setLoading(false);
        return;
      }
      console.log("Location permission granted.");

      try {
        // 1. Try to get actual location with a 5-second timeout
        // fast: true is much better for testing on android
        let location = await Location.getCurrentPositionAsync({ 
           accuracy: Location.Accuracy.Balanced,
           timeout: 5000 
        });
        
        console.log("User Location:", location);
        setLocation(location);
      } catch (error) {
        console.warn("Could not fetch location (likely emulator issue). Using Mock Location.");
        
        // 2. FALLBACK: If it fails/times out, use a fake Bangalore location
        // This ensures your UI never gets stuck loading!
        const mockLocation = {
          coords: {
            latitude: 12.9716, 
            longitude: 77.5946 
          }
        };
        setLocation(mockLocation);
      }

      // 3. Continue to fetch clubs...
      setTimeout(() => {
        setClubs(MOCK_NEARBY_CLUBS);
        setLoading(false);
      }, 1000);

    })();
  }, []);

  const handleBookPress = (club) => {
    setSelectedClub(club);
  };

  const confirmBooking = () => {
    // TODO: Deduct Wallet Logic
    setSelectedClub(null);
    Alert.alert("Success", "Entry confirmed! Show your QR code at the gate.");
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <HomeHeader/>
      
      {/* Main Content */}
      <View style={styles.content}>
        
        {/* Header Text */}
        <View style={styles.listHeader}>
          <Text style={styles.heading}>Tonight's Vibe</Text>
          {location && <Text style={styles.subHeading}>Showing clubs near you</Text>}
        </View>

        {/* Loading State */}
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Locating nearby hotspots...</Text>
          </View>
        ) : errorMsg ? (
          <View style={styles.centerContainer}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : (
          /* Club List */
          <FlatList
            data={clubs}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ClubCard club={item} onBook={() => handleBookPress(item)} />
            )}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Booking Confirmation Modal */}
      <CustomModal
        visible={!!selectedClub}
        onClose={() => setSelectedClub(null)}
        title="Confirm Entry"
      >
        {selectedClub && (
          <View>
            <Text style={styles.modalText}>
              You are booking a Stag Entry for <Text style={{fontWeight: 'bold', color: colors.white}}>{selectedClub.name}</Text>.
            </Text>
            
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Entry Fee</Text>
              <Text style={styles.billValue}>₹{selectedClub.price}</Text>
            </View>
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Convenience Fee</Text>
              <Text style={styles.billValue}>₹50</Text>
            </View>
            <View style={[styles.billRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>₹{parseInt(selectedClub.price) + 50}</Text>
            </View>

            <TouchableOpacity style={styles.payButton} onPress={confirmBooking}>
              <Text style={styles.payButtonText}>Pay & Book</Text>
            </TouchableOpacity>
          </View>
        )}
      </CustomModal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  listHeader: {
    marginTop: 20,
    marginBottom: 20,
  },
  heading: {
    color: colors.white,
    fontSize: 28,
    fontWeight: '800',
  },
  subHeading: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  listContainer: {
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.textSecondary,
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    color: '#ef4444', // Red
    textAlign: 'center',
    fontSize: 16,
  },
  // Modal Styles
  modalText: {
    color: colors.textSecondary,
    fontSize: 16,
    marginBottom: 24,
    lineHeight: 24,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  billLabel: { color: colors.textSecondary, fontSize: 16 },
  billValue: { color: colors.white, fontSize: 16, fontWeight: '600' },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 12,
    marginTop: 12,
    marginBottom: 30,
  },
  totalLabel: { color: colors.white, fontSize: 18, fontWeight: 'bold' },
  totalValue: { color: colors.primary, fontSize: 20, fontWeight: 'bold' },
  payButton: {
    backgroundColor: colors.primary,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  payButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
});