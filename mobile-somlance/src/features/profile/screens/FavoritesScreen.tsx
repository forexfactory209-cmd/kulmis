import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, StatusBar } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/theme';
import { getFavorites, toggleFavorite } from '@/api/users';
import { FreelancerCard } from '@/components/cards/FreelancerCard';
import { useDarkColors } from '@/store/themeStore';
import { useFavoritesStore } from '@/store/favoritesStore';

export default function FavoritesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark, bg, textPrimary, textSecondary, textMuted, border, statusBar, iconBg } = useDarkColors();
  const { favorites: favoriteIds } = useFavoritesStore();
  const [favoritesData, setFavoritesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchFavorites();
    }, [])
  );

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const data = await getFavorites();
      setFavoritesData(data || []);
    } catch (e) {
      console.log('Error fetching favorites', e);
    } finally {
      setLoading(false);
    }
  };

  // Keep data synced with store's IDs so un-hearting removes it from view
  const displayFavorites = favoritesData.filter(f => favoriteIds.includes(f.id));

  return (
    <View style={[s.container, { paddingTop: insets.top, backgroundColor: bg }]}>
      <StatusBar barStyle={statusBar} backgroundColor={bg} />
      {/* Header */}
      <View style={[s.header, { borderBottomColor: border, backgroundColor: bg }]}>
        <TouchableOpacity onPress={() => router.back()} style={[s.iconBtn, { backgroundColor: iconBg }]}>
          <Ionicons name="chevron-back" size={24} color={textPrimary} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: textPrimary }]}>Favorites</Text>
        <View style={{ width: 44 }} />
      </View>

      {loading ? (
        <View style={s.loader}>
          <ActivityIndicator size="large" color={Colors.primary[600]} />
        </View>
      ) : (
        <FlatList
          data={displayFavorites}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={s.listContent}
          columnWrapperStyle={s.listColumn}
          ListEmptyComponent={
            <View style={s.empty}>
              <Ionicons name="heart-outline" size={64} color={isDark ? '#334155' : Colors.neutral[300]} />
              <Text style={[s.emptyText, { color: textSecondary }]}>No favorites yet</Text>
              <Text style={[s.emptySubText, { color: textMuted }]}>Save freelancers you want to hire later.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <FreelancerCard
              id={item.id}
              firstName={item.firstName}
              lastName={item.lastName}
              avatarUrl={item.avatarUrl}
              title={item.freelancerProfile?.title}
              bio={item.freelancerProfile?.bio}
              price={item.freelancerProfile?.hourlyRate}
              avgRating={item.avgRating}
              totalReviews={item.totalReviews}
              isVerified={item.isVerified}
              onPress={() => router.push(`/freelancer/${item.id}`)}
            />
          )}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 16 },
  listColumn: { justifyContent: 'space-between' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
  emptyText: { fontSize: 20, fontWeight: '700', marginTop: 16 },
  emptySubText: { fontSize: 14, marginTop: 8 },
});
