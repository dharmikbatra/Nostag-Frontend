import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ScrollView, 
  Dimensions, 
  TouchableOpacity 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colours';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 48; // Full width minus padding

export default function ClubCard({ club, onBook }) {
  return (
    <View style={styles.card}>
      
      {/* 1. Horizontal Image Scroll */}
      <View style={styles.imageContainer}>
        <ScrollView 
          horizontal 
          pagingEnabled 
          showsHorizontalScrollIndicator={false}
          style={styles.scrollView}
        >
          {club.images.map((img, index) => (
            <Image 
              key={index} 
              source={{ uri: img }} 
              style={styles.image} 
              resizeMode="cover"
            />
          ))}
        </ScrollView>
        
        {/* Live Badge */}
        <View style={styles.liveBadge}>
          <View style={styles.dot} />
          <Text style={styles.liveText}>OPEN NOW</Text>
        </View>

        {/* Distance Badge */}
        <View style={styles.distanceBadge}>
          <Ionicons name="location-sharp" size={12} color={colors.white} />
          <Text style={styles.distanceText}>{club.distance} km</Text>
        </View>
      </View>

      {/* 2. Club Details & Action */}
      <View style={styles.footer}>
        <View style={styles.info}>
          <Text style={styles.name}>{club.name}</Text>
          <Text style={styles.location}>{club.address}</Text>
        </View>

        <TouchableOpacity style={styles.bookButton} onPress={onBook} activeOpacity={0.8}>
          <View>
            <Text style={styles.priceLabel}>Entry Fee</Text>
            <Text style={styles.price}>₹{club.price}</Text>
          </View>
          <Ionicons name="arrow-forward-circle" size={32} color={colors.white} />
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    marginBottom: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  imageContainer: {
    height: 220,
    width: '100%',
    position: 'relative',
  },
  scrollView: {
    width: '100%',
    height: '100%',
  },
  image: {
    width: CARD_WIDTH, // Ensures image takes full card width
    height: 220,
  },
  // Badges
  liveBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4ade80', // Green border
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ade80',
    marginRight: 6,
  },
  liveText: {
    color: '#4ade80',
    fontSize: 10,
    fontWeight: 'bold',
  },
  distanceBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  distanceText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  // Footer
  footer: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginRight: 10,
  },
  name: {
    color: colors.white,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  location: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    gap: 12,
  },
  priceLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    textTransform: 'uppercase',
  },
  price: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});