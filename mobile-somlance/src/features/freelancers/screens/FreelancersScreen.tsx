import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, StatusBar, ScrollView, ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Shadows } from '@/theme';
import { FreelancerCard } from '@/components/cards/FreelancerCard';
import { getFreelancers, getFavorites, toggleFavorite } from '@/api/users';
import { useAuthStore } from '@/store/authStore';
import { useDarkColors } from '@/store/themeStore';

const FILTERS = ['All', 'Design', 'Video', 'Marketing', 'Writing', 'Dev'];

export default function FreelancersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ filter?: string }>();
  const { isAuthenticated } = useAuthStore();
  const { isDark, bg, cardBg, textPrimary, textSecondary, textMuted, border, statusBar } = useDarkColors();
  
  const [filter, setFilter] = useState(params.filter || 'All');
  const [search, setSearch] = useState('');
  const [freelancers, setFreelancers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchFreelancers();
    if (isAuthenticated) {
      fetchFavorites();
    }
  }, [isAuthenticated]);

  const fetchFreelancers = async () => {
    try {
      setLoading(true);
      const res = await getFreelancers();
      let liveList = res && res.freelancers ? res.freelancers : [];
      setFreelancers(liveList);
    } catch (e) {
      console.log("Failed to fetch freelancers", e);
      setFreelancers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const favs = await getFavorites();
      const ids = new Set(favs.map((f: any) => f.id));
      setFavoriteIds(ids);
    } catch (e) {
      console.log("Failed to fetch favorites", e);
    }
  };

  const handleToggleFavorite = async (id: string) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    // Optimistic update
    const newFavs = new Set(favoriteIds);
    if (newFavs.has(id)) {
      newFavs.delete(id);
    } else {
      newFavs.add(id);
    }
    setFavoriteIds(newFavs);

    try {
      const res = await toggleFavorite(id);
      if (res.isFavorite) {
        setFavoriteIds(prev => new Set(prev).add(id));
      } else {
        setFavoriteIds(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    } catch (e) {
      console.log("Failed to toggle favorite", e);
      // Revert if failed
      fetchFavorites();
    }
  };

  const filtered = freelancers.filter(f => {
    const matchSearch = !search || `${f.firstName} ${f.lastName} ${f.freelancerProfile?.title || ''}`.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'All' || 
      (f.freelancerProfile?.skills || []).some((s: any) => s.name.toLowerCase().includes(filter.toLowerCase())) || 
      (f.freelancerProfile?.title || '').toLowerCase().includes(filter.toLowerCase());
    return matchSearch && matchFilter;
  });

  return (
    <View style={[s.container, { paddingTop: insets.top, backgroundColor: bg }]}>
      <StatusBar barStyle={statusBar} backgroundColor={bg} />

      {/* Fixed Header */}
      <View style={s.header}>
        <Text style={[s.title, { color: textPrimary }]}>Freelancers</Text>
        <View style={[s.searchBar, { backgroundColor: isDark ? '#1E293B' : Colors.neutral[50], borderColor: border }]}>
          <Ionicons name="search" size={20} color={textMuted} />
          <TextInput
            style={[s.searchInput, { color: textPrimary }]}
            placeholder="Search freelancers..."
            placeholderTextColor={textMuted}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={20} color={textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Fixed Filter Chips — NOT inside the FlatList */}
      <View style={[s.filterContainer, { borderBottomColor: border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterScroll}>
          {FILTERS.map(item => (
            <TouchableOpacity
              key={item}
              style={[s.chip, { backgroundColor: isDark ? '#1E293B' : Colors.neutral[100] }, filter === item && s.chipActive]}
              onPress={() => setFilter(item)}
              activeOpacity={0.7}
            >
              <Text style={[s.chipText, { color: isDark ? '#94A3B8' : Colors.neutral[600] }, filter === item && s.chipTextActive]}>{item}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Scrollable List */}
      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          loading ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 }}>
              <ActivityIndicator size="large" color={Colors.primary[700]} />
            </View>
          ) : (
            <View style={s.empty}>
              <Ionicons name="people-outline" size={56} color={isDark ? '#334155' : Colors.neutral[300]} />
              <Text style={[s.emptyText, { color: textSecondary }]}>No freelancers found</Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <FreelancerCard
            id={item.id}
            firstName={item.firstName}
            lastName={item.lastName}
            avatarUrl={item.avatarUrl}
            title={item.freelancerProfile?.title || 'Freelancer'}
            bio={item.freelancerProfile?.bio || "Expert in Somali Digital Solutions"}
            avgRating={item.avgRating}
            totalReviews={item.totalReviews}
            skills={item.freelancerProfile?.skills || []}
            onPress={() => router.push(`/freelancer/${item.id}`)}
            isVerified={item.isVerified}
            isFavorite={favoriteIds.has(item.id)}
            onToggleFavorite={handleToggleFavorite}
          />
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: { paddingHorizontal: 16, paddingTop: 8 },
  title: { fontSize: 24, fontWeight: '700', color: Colors.neutral[900], marginBottom: 12 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.neutral[50],
    borderRadius: 12, paddingHorizontal: 14, height: 44,
    borderWidth: 1, borderColor: Colors.neutral[200],
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 16, color: Colors.neutral[900] },
  // FIXED filter container — never inside FlatList
  filterContainer: {
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  filterScroll: { paddingHorizontal: 16, gap: 8 },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 999,
    backgroundColor: Colors.neutral[100],
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipActive: { backgroundColor: Colors.primary[700] },
  chipText: { fontSize: 14, fontWeight: '500', color: Colors.neutral[600] },
  chipTextActive: { color: Colors.white, fontWeight: '600' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 16, fontWeight: '600', color: Colors.neutral[500], marginTop: 12 },
});
