import React, { useEffect, useState, useCallback, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  TouchableOpacity,
  ActivityIndicator, 
  RefreshControl,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import HomeHeader from '../../components/HomeHeader'; 
import { clubApi } from '../../services/ApiService';
import colors from '../../constants/colours'; 
import { UserContext } from '../../context/UserContext'; 

export default function ManHomeScreen({ navigation }) {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Pull locations from context
  const { userLocation, exploringLocation } = useContext(UserContext);

  const loadClubs = async () => {
    if (!exploringLocation) return;
    try {
      // Fetch clubs using the coordinates of the selected operational area
      const data = await clubApi.getClubs(exploringLocation.lat, exploringLocation.lng);
      
      const sortedClubs = data.sort((a, b) => {
        if (a.isPromoted && !b.isPromoted) return -1; 
        if (!a.isPromoted && b.isPromoted) return 1;  
        return 0; 
      });

      setClubs(sortedClubs);
    } catch (error) {
      console.error("Failed to load clubs", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadClubs();
  }, [exploringLocation]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadClubs();
  }, [exploringLocation]);

  const handleClubPress = async (club) => {
    // 1. Ensure GPS is available before allowing a booking request
    if (!userLocation) {
      Alert.alert("Location Required", "Please allow GPS access to join a queue.");
      return;
    }

    try {
      console.log(`Creating request for Club ID: ${club.id}`);
      
      // 2. Pass EXACT GPS location to the backend for distance validation
      const response = await clubApi.createRequest(club.id, userLocation.lat, userLocation.lng);
      
      navigation.navigate('WaitingScreen', { 
        clubData: club, 
        requestData: response 
      });
      
    } catch (error) {
      if (error.response && error.response.status === 400) {
        const serverMessage = error.response.data?.message || "Request failed.";
        
        if (serverMessage.toLowerCase().includes("funds") || serverMessage.toLowerCase().includes("balance")) {
            Alert.alert("Payment Failed", serverMessage, [
                { text: "Add Money", onPress: () => navigation.navigate('Wallet') },
                { text: "Cancel", style: "cancel" }
            ]);
        } else {
            // General backend rejection (like distance validation failure)
            Alert.alert("Cannot Join", serverMessage);
        }
      } else {
        Alert.alert("Error", "Could not connect to the server.");
      }
    }
  };

  const renderClubItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.imageUrl || 'https://via.placeholder.com/400x200' }} style={styles.cardImage} />
      <View style={styles.cardOverlay} />

      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.clubName} numberOfLines={2}>{item.name}</Text>
          {item.isPromoted && (
            <View style={styles.promotedBadge}>
              <Ionicons name="sparkles" size={10} color={colors.promoted} style={{ marginRight: 4 }} />
              <Text style={styles.promotedText}>Promoted</Text>
            </View>
          )}
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.leftFooter}>
            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>Entry</Text>
              <Text style={styles.priceValue}>₹{item.currentPrice}</Text>
            </View>
            <View style={styles.distanceContainer}>
               <Ionicons name="location-sharp" size={14} color={colors.textSecondary} />
               <Text style={styles.distanceText}>{item.distance || 'Nearby'}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.joinButton} activeOpacity={0.7} onPress={() => handleClubPress(item)}>
             <Text style={styles.joinText}>Join</Text>
             <Ionicons name="arrow-forward" size={16} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // Show loading state if Context is still initializing
  if (!exploringLocation) {
     return (
       <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
         <ActivityIndicator size="large" color={colors.primary} />
       </View>
     );
  }

  return (
    <View style={styles.container}>
      <HomeHeader />
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Clubs in {exploringLocation.name}</Text>
        
        {loading ? (
          <View style={styles.loaderContainer}>
             <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : clubs.length === 0 ? (
          <View style={styles.emptyContainer}>
             <Ionicons name="beer-outline" size={48} color={colors.textSecondary} />
             <Text style={styles.emptyText}>No clubs found in {exploringLocation.name}</Text>
          </View>
        ) : (
          <FlatList
            data={clubs}
            keyExtractor={(item) => item.id}
            renderItem={renderClubItem}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 15 },
  sectionTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: '700', marginBottom: 15 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  emptyText: { color: colors.textSecondary, marginTop: 15, fontSize: 16 },

  card: { height: 180, backgroundColor: colors.surface, borderRadius: 16, marginBottom: 16, overflow: 'hidden', position: 'relative', borderWidth: 1, borderColor: colors.borderLight },
  cardImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%', opacity: 0.5 },
  cardOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  cardContent: { flex: 1, justifyContent: 'space-between', padding: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  clubName: { color: colors.textPrimary, fontSize: 20, fontWeight: 'bold', maxWidth: '70%', textShadowColor: colors.black, textShadowOffset: { width: -1, height: 1 }, textShadowRadius: 10 },
  promotedBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceLight, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6, borderWidth: 1, borderColor: colors.promoted },
  promotedText: { color: colors.promoted, fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  leftFooter: { justifyContent: 'flex-end' },
  priceContainer: { marginBottom: 4 },
  priceLabel: { color: colors.textSecondary, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 },
  priceValue: { color: colors.white, fontSize: 22, fontWeight: 'bold' },
  distanceContainer: { flexDirection: 'row', alignItems: 'center' },
  distanceText: { color: colors.textSecondary, fontSize: 13, marginLeft: 4, fontWeight: '500' },
  joinButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 30, elevation: 3, borderWidth: 1, borderColor: colors.borderLight },
  joinText: { color: colors.white, fontWeight: 'bold', fontSize: 14, marginRight: 6 },
});