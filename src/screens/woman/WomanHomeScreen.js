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
import { SocketContext } from '../../context/SocketContext'; 
import { UserContext } from '../../context/UserContext'; 

export default function WomanHomeScreen({ navigation }) {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const { socket } = useContext(SocketContext); 
  const { userLocation, exploringLocation } = useContext(UserContext); 

  const loadClubs = async () => {
    if (!exploringLocation) return;
    try {
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

  // LIVE SOCKET UPDATES
  useEffect(() => {
    if (!socket) return;

    const handleQueueUpdate = (data) => {
      setClubs((prevClubs) => 
        prevClubs.map((club) => 
          club.id === data.clubId 
            ? { ...club, waitingQueue: data.count }
            : club
        )
      );
    };

    socket.on('club_queue_updated', handleQueueUpdate);

    return () => {
      socket.off('club_queue_updated', handleQueueUpdate);
    };
  }, [socket]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadClubs();
  }, [exploringLocation]);

  const handleClubPress = (club) => {
    // Prevent joining empty queues
    if (!club.waitingQueue || club.waitingQueue === 0) {
      Alert.alert("Quiet Club", "No men are waiting here right now. Try a busy club!");
      return;
    }

    if (!userLocation) {
      Alert.alert("Location Required", "Please allow GPS access to join a queue.");
      return;
    }
    
    navigation.navigate('WomanLobbyScreen', { 
        clubData: club,
        userLat: userLocation.lat, 
        userLng: userLocation.lng 
    });
  };

  const renderClubItem = ({ item }) => (
    <TouchableOpacity 
      activeOpacity={0.9}
      onPress={() => handleClubPress(item)}
      style={styles.card}
    >
      <Image source={{ uri: item.imageUrl || 'https://via.placeholder.com/400x200' }} style={styles.cardImage} />
      <View style={styles.cardOverlay} />

      <View style={styles.cardContent}>
        
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <Text style={styles.clubName} numberOfLines={2}>{item.name}</Text>
            {item.isPromoted && (
              <View style={styles.promotedBadge}>
                <Ionicons name="sparkles" size={10} color={colors.promoted} style={{ marginRight: 4 }} />
                <Text style={styles.promotedText}>Promoted</Text>
              </View>
            )}
          </View>

          {item.waitingQueue > 0 && (
            <View style={styles.waitingBadge}>
              <Text style={styles.waitingText}>{item.waitingQueue} Waiting</Text>
            </View>
          )}
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.locationContainer}>
             <Ionicons name="location-sharp" size={14} color={colors.textSecondary} />
             <Text style={styles.locationText}>{item.distance || 'Nearby'}</Text>
          </View>

          <View style={styles.priceTag}>
             <Text style={styles.priceLabel}>Earn</Text>
             <Text style={styles.priceValue}>₹{item.currentPrice - item.platformFee}</Text>
          </View>
        </View>

      </View>
    </TouchableOpacity>
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
        <Text style={styles.sectionTitle}>High Demand in {exploringLocation.name}</Text>
        
        {loading ? (
          <View style={styles.loaderContainer}>
             <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : clubs.length === 0 ? (
          <View style={styles.emptyContainer}>
             <Ionicons name="wine-outline" size={48} color={colors.textSecondary} />
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
  sectionTitle: { color: colors.white, fontSize: 18, fontWeight: '700', marginBottom: 15 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  emptyText: { color: colors.textSecondary, marginTop: 15, fontSize: 16 },

  card: { height: 180, backgroundColor: colors.surface, borderRadius: 16, marginBottom: 16, overflow: 'hidden', position: 'relative', borderWidth: 1, borderColor: colors.borderLight },
  cardImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%', opacity: 0.5 },
  cardOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  cardContent: { flex: 1, justifyContent: 'space-between', padding: 16 },
  
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  titleContainer: { flex: 1, paddingRight: 10 },
  clubName: { color: colors.white, fontSize: 20, fontWeight: 'bold', textShadowColor: colors.black, textShadowOffset: { width: -1, height: 1 }, textShadowRadius: 10 },
  
  promotedBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceLight, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6, borderWidth: 1, borderColor: colors.promoted, alignSelf: 'flex-start', marginTop: 6 },
  promotedText: { color: colors.promoted, fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 },

  waitingBadge: { backgroundColor: colors.error, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12, elevation: 5, shadowColor: colors.error, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 4 },
  waitingText: { color: colors.white, fontSize: 12, fontWeight: 'bold' },

  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  locationContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  locationText: { color: colors.textSecondary, fontSize: 13, marginLeft: 4, fontWeight: '500' },

  priceTag: { backgroundColor: colors.success, paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20, alignItems: 'center', flexDirection: 'row', elevation: 3 },
  priceLabel: { color: colors.white, fontSize: 10, marginRight: 4, textTransform: 'uppercase', fontWeight: 'bold', opacity: 0.9 },
  priceValue: { color: colors.white, fontSize: 18, fontWeight: 'bold' },
});