import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, StatusBar, ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Shadows } from '@/theme';
import { MOCK_FREELANCERS } from '@/data/mockData';
import { FreelancerCard } from '@/components/cards/FreelancerCard';
import { getFreelancers } from '@/api/users';
import { useDarkColors } from '@/store/themeStore';

import { Modal, ScrollView as RNScrollView } from 'react-native';

export default function SearchResultsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ query?: string; category?: string }>();
  const { isDark, bg, cardBg, textPrimary, textSecondary, textMuted, border, statusBar, iconBg } = useDarkColors();
  
  const [searchQuery, setSearchQuery] = useState(params.query || params.category || '');
  const [sortBy, setSortBy] = useState<'rating' | 'price'>('rating');
  const [showFilter, setShowFilter] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [freelancers, setFreelancers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFreelancers();
  }, []);

  const fetchFreelancers = async () => {
    try {
      setLoading(true);
      const res = await getFreelancers();
      let liveList = res && res.freelancers ? res.freelancers : [];
      setFreelancers(liveList);
    } catch (e) {
      console.log("Failed to fetch search freelancers", e);
      setFreelancers([]);
    } finally {
      setLoading(false);
    }
  };

  const results = freelancers
    .filter(f => {
      const q = searchQuery.toLowerCase();
      const matchSearch = !searchQuery || (
        `${f.firstName} ${f.lastName}`.toLowerCase().includes(q) ||
        (f.freelancerProfile?.title || '').toLowerCase().includes(q) ||
        (f.freelancerProfile?.skills || []).some((s: any) => s.name.toLowerCase().includes(q))
      );
      const hourlyRate = f.freelancerProfile?.hourlyRate || 35;
      const matchPrice = hourlyRate >= priceRange[0] && hourlyRate <= priceRange[1];
      return matchSearch && matchPrice;
    })
    .sort((a, b) => {
      const rateA = a.freelancerProfile?.hourlyRate || 35;
      const rateB = b.freelancerProfile?.hourlyRate || 35;
      return sortBy === 'rating'
        ? (b.avgRating || 0) - (a.avgRating || 0)
        : rateA - rateB;
    });

  return (
    <View style={[s.container, { paddingTop: insets.top, backgroundColor: bg }]}>
      <StatusBar barStyle={statusBar} backgroundColor={bg} />

      {/* Search Header */}
      <View style={[s.header, { backgroundColor: bg }]}>
        <TouchableOpacity onPress={() => router.back()} style={[s.backBtn, { backgroundColor: iconBg }]}>
          <Ionicons name="chevron-back" size={24} color={textPrimary} />
        </TouchableOpacity>
        <View style={[s.searchBar, { backgroundColor: isDark ? '#1E293B' : Colors.neutral[50] }]}>
          <Ionicons name="search" size={18} color={textMuted} />
          <TextInput
            style={[s.searchInput, { color: textPrimary }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search..."
            placeholderTextColor={textMuted}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={textMuted} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={[s.filterIcon, { backgroundColor: isDark ? '#064E3B' : Colors.primary[50] }]} onPress={() => setShowFilter(true)}>
          <Ionicons name="options-outline" size={22} color={isDark ? '#10B981' : Colors.primary[700]} />
        </TouchableOpacity>
      </View>

      {/* Results Count */}
      <View style={s.resultsBar}>
        <Text style={[s.resultsCount, { color: textPrimary }]}>{results.length} Professionals found</Text>
      </View>

      {/* Results List */}
      <FlatList
        data={results}
        keyExtractor={i => i.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 16 }}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={s.empty}>
            <Ionicons name="search-outline" size={56} color={isDark ? '#334155' : Colors.neutral[300]} />
            <Text style={[s.emptyText, { color: textPrimary }]}>No results found</Text>
            <Text style={[s.emptySub, { color: textMuted }]}>Try adjusting your filters or search term</Text>
          </View>
        }
        renderItem={({ item }) => (
          <FreelancerCard
            id={item.id}
            firstName={item.firstName}
            lastName={item.lastName}
            avatarUrl={item.avatarUrl}
            title={item.freelancerProfile?.title || 'Freelancer'}
            bio={item.freelancerProfile?.bio || 'Expert in Somali Digital Solutions'}
            avgRating={item.avgRating}
            totalReviews={item.totalReviews}
            skills={item.freelancerProfile?.skills || []}
            onPress={() => router.push(`/freelancer/${item.id}`)}
            isVerified={item.isVerified}
          />
        )}
      />

      {/* Bottom Filter/Sort Bar */}
      <View style={[s.bottomBar, { paddingBottom: insets.bottom + 12, backgroundColor: bg, borderTopColor: border }]}>
        <TouchableOpacity style={[s.bottomBtn, { backgroundColor: isDark ? '#1E293B' : Colors.neutral[50] }]} activeOpacity={0.7} onPress={() => setShowFilter(true)}>
          <Ionicons name="filter-outline" size={18} color={textPrimary} />
          <Text style={[s.bottomBtnText, { color: textPrimary }]}>Filter</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.bottomBtn, { backgroundColor: isDark ? '#1E293B' : Colors.neutral[50] }]}
          activeOpacity={0.7}
          onPress={() => setSortBy(sortBy === 'rating' ? 'price' : 'rating')}
        >
          <Ionicons name="swap-vertical-outline" size={18} color={textPrimary} />
          <Text style={[s.bottomBtnText, { color: textPrimary }]}>Sort: {sortBy === 'rating' ? 'Rating' : 'Price'}</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Modal */}
      <Modal visible={showFilter} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={[s.modalContent, { paddingBottom: insets.bottom + 20, backgroundColor: cardBg }]}>
            <View style={s.modalHeader}>
              <Text style={[s.modalTitle, { color: textPrimary }]}>Filters</Text>
              <TouchableOpacity onPress={() => setShowFilter(false)}>
                <Ionicons name="close" size={24} color={textPrimary} />
              </TouchableOpacity>
            </View>
            
            <RNScrollView showsVerticalScrollIndicator={false}>
              <Text style={[s.filterLabel, { color: textPrimary }]}>Price Range (${priceRange[0]} - ${priceRange[1]})</Text>
              <View style={s.priceOptions}>
                {[20, 50, 100, 200].map(val => (
                  <TouchableOpacity 
                    key={val} 
                    onPress={() => setPriceRange([0, val])}
                    style={[
                      s.priceBtn, 
                      { borderColor: border },
                      priceRange[1] === val && s.priceBtnActive
                    ]}
                  >
                    <Text style={[s.priceBtnText, { color: textSecondary }, priceRange[1] === val && s.priceBtnTextActive]}>Up to ${val}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[s.filterLabel, { color: textPrimary }]}>Rating</Text>
              <View style={s.ratingOptions}>
                {[4.5, 4.0, 3.5].map(r => (
                  <TouchableOpacity key={r} style={[s.ratingOption, { backgroundColor: isDark ? '#1E293B' : Colors.neutral[50] }]}>
                    <Ionicons name="star" size={16} color="#F59E0B" />
                    <Text style={[s.ratingOptionText, { color: textPrimary }]}>{r}+ Stars</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </RNScrollView>

            <TouchableOpacity style={s.applyBtn} onPress={() => setShowFilter(false)}>
              <Text style={s.applyBtnText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12, gap: 10,
    backgroundColor: Colors.white,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.neutral[50], justifyContent: 'center', alignItems: 'center',
  },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.neutral[50], borderRadius: 15,
    paddingHorizontal: 12, height: 46,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 15, color: Colors.neutral[900] },
  filterIcon: {
    width: 46, height: 46, borderRadius: 15,
    backgroundColor: Colors.primary[50], justifyContent: 'center', alignItems: 'center',
  },
  resultsBar: {
    paddingHorizontal: 20, paddingVertical: 10,
  },
  resultsCount: { fontSize: 16, fontWeight: '700', color: Colors.neutral[900] },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', gap: 15,
    paddingHorizontal: 20, paddingTop: 15,
    backgroundColor: Colors.white,
    borderTopWidth: 1, borderTopColor: Colors.neutral[50],
  },
  bottomBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    height: 54, borderRadius: 18,
    backgroundColor: Colors.neutral[50],
  },
  bottomBtnText: { fontSize: 14, fontWeight: '700', color: Colors.neutral[800] },
  empty: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 40 },
  emptyText: { fontSize: 20, fontWeight: '700', color: Colors.neutral[900], marginTop: 15 },
  emptySub: { fontSize: 14, color: Colors.neutral[400], marginTop: 8, textAlign: 'center' },
  
  // Modal Styles
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white, borderTopLeftRadius: 30, borderTopRightRadius: 30,
    padding: 24, maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 25,
  },
  modalTitle: { fontSize: 22, fontWeight: '800', color: Colors.neutral[900] },
  filterLabel: { fontSize: 16, fontWeight: '700', color: Colors.neutral[900], marginBottom: 15, marginTop: 10 },
  priceOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  priceBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: Colors.neutral[200] },
  priceBtnActive: { backgroundColor: Colors.primary[700], borderColor: Colors.primary[700] },
  priceBtnText: { color: Colors.neutral[600], fontWeight: '600' },
  priceBtnTextActive: { color: Colors.white },
  ratingOptions: { gap: 12, marginBottom: 30 },
  ratingOption: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 12, backgroundColor: Colors.neutral[50] },
  ratingOptionText: { fontSize: 14, fontWeight: '600', color: Colors.neutral[800] },
  applyBtn: { backgroundColor: Colors.primary[700], height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  applyBtnText: { color: Colors.white, fontSize: 18, fontWeight: '700' },
});
