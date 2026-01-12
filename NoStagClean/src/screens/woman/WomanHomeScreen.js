import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  Image, 
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import HomeHeader from '../../components/HomeHeader'; 

// Mock Data: Added 'earning' field
const CLUB_QUEUES = [
  { id: '1', name: 'The Velvet Room', menWaiting: 5, earning: 450, location: 'Downtown, 0.5km', image: 'https://via.placeholder.com/150' },
  { id: '2', name: 'Midnight Lounge', menWaiting: 12, earning: 500, location: 'West End, 1.2km', image: 'https://via.placeholder.com/150' },
  { id: '3', name: 'Club Neon', menWaiting: 0, earning: 450, location: 'Sector 4, 3.0km', image: 'https://via.placeholder.com/150' },
  { id: '4', name: 'Sapphire Sky', menWaiting: 3, earning: 600, location: 'Uptown, 5.0km', image: 'https://via.placeholder.com/150' },
];

export default function WomanHomeScreen({ navigation }) {
  
  const handleClubPress = (club) => {
    if (club.menWaiting === 0) {
      Alert.alert("Quiet Club", "No men are waiting here right now. Try a busy club!");
      return;
    }
    // Navigate to the Lobby Screen where she waits for the alert
    navigation.navigate('WomanLobbyScreen', { clubData: club });
  };

  const renderClubItem = ({ item }) => (
    <TouchableOpacity 
      activeOpacity={0.9}
      onPress={() => handleClubPress(item)}
      style={styles.card}
    >
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      <View style={styles.cardOverlay} />

      <View style={styles.cardContent}>
        
        {/* HEADER: Name + Waiting Count */}
        <View style={styles.cardHeader}>
          <Text style={styles.clubName}>{item.name}</Text>
          {item.menWaiting > 0 && (
            <View style={styles.waitingBadge}>
              <Text style={styles.waitingText}>{item.menWaiting} Waiting</Text>
            </View>
          )}
        </View>

        {/* FOOTER: Location + MONEY */}
        <View style={styles.cardFooter}>
          
          {/* Left: Location */}
          <View style={styles.locationContainer}>
             <Ionicons name="location-sharp" size={14} color="#94a3b8" />
             <Text style={styles.locationText}>{item.location}</Text>
          </View>

          {/* Right: EARNING PRICE TAG */}
          <View style={styles.priceTag}>
             <Text style={styles.priceLabel}>Earn</Text>
             <Text style={styles.priceValue}>₹{item.earning}</Text>
          </View>

        </View>

      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <HomeHeader />
      
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>High Demand Clubs</Text>
        <FlatList
          data={CLUB_QUEUES}
          keyExtractor={(item) => item.id}
          renderItem={renderClubItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 15 },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 15 },
  
  // Card
  card: {
    height: 150,
    backgroundColor: '#1e293b',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardImage: { width: '100%', height: '100%', position: 'absolute', opacity: 0.5 },
  cardOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  
  cardContent: { flex: 1, justifyContent: 'space-between', padding: 16 },
  
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  clubName: { color: '#fff', fontSize: 20, fontWeight: 'bold', maxWidth: '65%' },
  
  waitingBadge: {
    backgroundColor: '#dc2626', // Red for urgency
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  waitingText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },

  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  locationContainer: { flexDirection: 'row', alignItems: 'center' },
  locationText: { color: '#e2e8f0', fontSize: 13, marginLeft: 4 },

  // THE MONEY BADGE
  priceTag: {
    backgroundColor: '#10b981', // Emerald Green
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignItems: 'center',
    flexDirection: 'row',
  },
  priceLabel: { color: '#ecfdf5', fontSize: 10, marginRight: 4 },
  priceValue: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});