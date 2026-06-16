import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Shadows } from '@/theme';
import { useDarkColors } from '@/store/themeStore';

const CATEGORIES_LIST = [
  { id: '1', name: 'UI/UX Design', icon: 'layers', color: '#6366F1', count: 1245 },
  { id: '2', name: 'Graphic Design', icon: 'color-palette', color: '#8B5CF6', count: 987 },
  { id: '3', name: 'Video Editing', icon: 'videocam', color: '#EF4444', count: 875 },
  { id: '4', name: 'Social Media', icon: 'megaphone', color: '#F59E0B', count: 642 },
  { id: '5', name: 'Writing & Translation', icon: 'document-text', color: '#3B82F6', count: 521 },
  { id: '6', name: 'AI Services', icon: 'hardware-chip', color: '#10B981', count: 352 },
  { id: '7', name: 'Web Development', icon: 'code-slash', color: '#14B8A6', count: 320 },
  { id: '8', name: 'Virtual Assistant', icon: 'headset', color: '#EC4899', count: 280 },
  { id: '9', name: 'Mobile Development', icon: 'phone-portrait', color: '#0EA5E9', count: 245 },
  { id: '10', name: 'SEO', icon: 'trending-up', color: '#84CC16', count: 198 },
  { id: '11', name: 'Photography', icon: 'camera', color: '#F97316', count: 175 },
  { id: '12', name: 'Music & Audio', icon: 'musical-notes', color: '#D946EF', count: 162 },
  { id: '13', name: 'Accounting', icon: 'calculator', color: '#64748B', count: 145 },
  { id: '14', name: 'Consulting', icon: 'chatbubbles', color: '#06B6D4', count: 132 },
  { id: '15', name: 'Illustration', icon: 'brush', color: '#A855F7', count: 118 },
  { id: '16', name: 'Blockchain', icon: 'link', color: '#475569', count: 95 },
];

export default function CategoriesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark, bg, cardBg, textPrimary, textSecondary, textMuted, border, statusBar, iconBg } = useDarkColors();
  const [search, setSearch] = useState('');

  const filtered = search
    ? CATEGORIES_LIST.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
    : CATEGORIES_LIST;

  return (
    <View style={[s.container, { paddingTop: insets.top, backgroundColor: bg }]}>
      <StatusBar barStyle={statusBar} backgroundColor={bg} />

      {/* Header */}
      <View style={[s.header, { borderBottomColor: border }]}>
        <View style={s.headerRow}>
          <Text style={[s.title, { color: textPrimary }]}>Categories</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={24} color={textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={[s.searchBar, { backgroundColor: isDark ? '#1E293B' : Colors.neutral[50], borderColor: isDark ? '#334155' : Colors.neutral[200] }]}>
          <Ionicons name="search" size={20} color={textMuted} />
          <TextInput
            style={[s.searchInput, { color: textPrimary }]}
            placeholder="Search categories"
            placeholderTextColor={textMuted}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={20} color={textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category List */}
      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[s.catRow, { borderBottomColor: isDark ? '#1E293B' : Colors.neutral[50] }]}
            activeOpacity={0.6}
            onPress={() => router.push({
              pathname: '/search-results',
              params: { query: item.name, category: item.name },
            })}
          >
            <View style={[s.catIcon, { backgroundColor: isDark ? '#1E293B' : item.color + '15' }]}>
              <Ionicons name={item.icon as any} size={22} color={item.color} />
            </View>
            <View style={s.catInfo}>
              <Text style={[s.catName, { color: textPrimary }]}>{item.name}</Text>
              <Text style={[s.catCount, { color: textSecondary }]}>{item.count.toLocaleString()} Freelancers</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={isDark ? '#334155' : Colors.neutral[300]} />
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: Colors.neutral[100] },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 24, fontWeight: '700', color: Colors.neutral[900] },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.neutral[50],
    borderRadius: 12, paddingHorizontal: 14, height: 44,
    borderWidth: 1, borderColor: Colors.neutral[200],
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 16, color: Colors.neutral[900] },
  catRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.neutral[50],
  },
  catIcon: {
    width: 48, height: 48, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
  },
  catInfo: { flex: 1, marginLeft: 14 },
  catName: { fontSize: 16, fontWeight: '600', color: Colors.neutral[900] },
  catCount: { fontSize: 13, color: Colors.neutral[400], marginTop: 2 },
});
