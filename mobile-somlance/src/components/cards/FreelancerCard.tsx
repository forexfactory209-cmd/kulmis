import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, BorderRadius, FontSize, FontWeight, Spacing } from '../../theme';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - Spacing.md * 3) / 2; // Reduced gap by using Spacing.md instead of Spacing.lg

interface FreelancerCardProps {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  title?: string | null;
  bio?: string | null;
  price?: number;
  avgRating: number;
  totalReviews: number;
  skills?: { id: string; name: string }[];
  onPress: () => void;
  isVerified?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
}

import { LinearGradient } from 'expo-linear-gradient';
import { useFavoritesStore } from '../../store/favoritesStore';

export const FreelancerCard: React.FC<FreelancerCardProps> = ({
  id,
  firstName,
  lastName,
  avatarUrl,
  title,
  bio,
  price = 45,
  avgRating,
  totalReviews,
  skills = [],
  onPress,
  isVerified = false,
  isFavorite: propIsFavorite,
  onToggleFavorite: propOnToggleFavorite,
}) => {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { favorites, toggleFavorite } = useFavoritesStore();
  const isFavorite = propIsFavorite !== undefined ? propIsFavorite : favorites.includes(id);
  
  const handleToggleFavorite = (e: any) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (propOnToggleFavorite) {
      propOnToggleFavorite(id);
    } else {
      toggleFavorite(id);
    }
  };

  const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.imageContainer}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.placeholder]}>
            <Text style={styles.placeholderText}>{initials}</Text>
          </View>
        )}

        {/* Rating Badge Top Left (outside gradient) */}
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={10} color="#F59E0B" />
          <Text style={styles.ratingText}>{avgRating.toFixed(1)}</Text>
        </View>

        {/* Wishlist Top Right (outside gradient) */}
        <TouchableOpacity 
          style={styles.wishlistBtn} 
          onPress={handleToggleFavorite}
        >
          <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={20} color={isFavorite ? Colors.error : Colors.white} />
        </TouchableOpacity>

        {/* Gradient Overlay for Readability */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.85)']}
          style={styles.overlay}
        >
          <View style={styles.bottomContent}>
            <View style={styles.nameRow}>
              <Text style={styles.name} numberOfLines={1}>{firstName} {lastName}</Text>
              {isVerified && (
                <View style={styles.verifiedBadge}>
                  <MaterialCommunityIcons name="decagram" size={18} color={Colors.white} />
                  <View style={styles.checkIconWrapper}>
                    <Ionicons name="checkmark" size={10} color={Colors.black} />
                  </View>
                </View>
              )}
            </View>

            {title && <Text style={styles.title} numberOfLines={1}>{title}</Text>}
            {bio && <Text style={styles.bio} numberOfLines={1}>{bio}</Text>}

            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Ionicons name="copy-outline" size={14} color={Colors.white} />
                <Text style={styles.statText}>573 Projects</Text>
              </View>

              <View style={styles.priceContainer}>
                <Text style={styles.priceText}>${price}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.57,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#000',
    borderWidth: 2,
    borderColor: Colors.primary[900],
    marginBottom: Spacing.md,
  },
  imageContainer: {
    flex: 1,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholder: {
    backgroundColor: Colors.neutral[800],
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: 'bold',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '65%',
    justifyContent: 'flex-end',
    padding: 12,
  },
  ratingBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  wishlistBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  bottomContent: {
    width: '100%',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    flexShrink: 1,
  },
  verifiedBadge: {
    marginLeft: 6,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIconWrapper: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    marginBottom: 4,
  },
  bio: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '600',
  },
  priceContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  priceText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
});
