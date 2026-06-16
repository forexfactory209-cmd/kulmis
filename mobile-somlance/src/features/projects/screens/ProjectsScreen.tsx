import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, ScrollView, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Shadows } from '@/theme';
import { useAuthStore } from '@/store/authStore';
import { getMyProjects, Project } from '@/api/projects';
import { useDarkColors } from '@/store/themeStore';

const STATUS_TABS = ['All', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
const STATUS_LABELS: Record<string, string> = { IN_PROGRESS: 'In Progress', COMPLETED: 'Completed', CANCELLED: 'Cancelled' };
const STATUS_COLORS: Record<string, string> = { IN_PROGRESS: '#F59E0B', COMPLETED: Colors.success, CANCELLED: Colors.error };

export default function ProjectsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuthStore();
  const { isDark, bg, cardBg, textPrimary, textSecondary, textMuted, border, statusBar } = useDarkColors();
  const [tab, setTab] = useState('All');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, [isAuthenticated]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      if (isAuthenticated) {
        const res = await getMyProjects();
        let list = res && res.projects ? res.projects : [];
        setProjects(list);
      } else {
        setProjects([]);
      }
    } catch (e) {
      console.log("Failed to fetch projects", e);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = tab === 'All' ? projects : projects.filter(p => p.status === tab);

  return (
    <View style={[s.container, { paddingTop: insets.top, backgroundColor: bg }]}>
      <StatusBar barStyle={statusBar} backgroundColor={bg} />

      {/* Fixed Header */}
      <View style={s.header}>
        <View style={s.headerRow}>
          <Text style={[s.title, { color: textPrimary }]}>Projects</Text>
        </View>
      </View>

      {/* Fixed Filter Chips */}
      <View style={[s.filterContainer, { borderBottomColor: border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterScroll}>
          {STATUS_TABS.map(item => (
            <TouchableOpacity
              key={item}
              style={[s.chip, { backgroundColor: isDark ? '#1E293B' : Colors.neutral[100] }, tab === item && s.chipActive]}
              onPress={() => setTab(item)}
              activeOpacity={0.7}
            >
              <Text style={[s.chipText, { color: isDark ? '#94A3B8' : Colors.neutral[600] }, tab === item && s.chipTextActive]}>
                {item === 'All' ? 'All' : STATUS_LABELS[item]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Scrollable Project List */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.primary[700]} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={i => i.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={s.empty}>
              <Ionicons name="briefcase-outline" size={56} color={isDark ? '#334155' : Colors.neutral[300]} />
              <Text style={[s.emptyText, { color: textSecondary }]}>No projects yet</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[s.card, { backgroundColor: cardBg, borderColor: border }]}
              onPress={() => {
                if (item.status === 'IN_PROGRESS' || item.status === 'COMPLETED') {
                  router.push({ pathname: '/project-dashboard/[id]', params: { id: item.id } });
                } else {
                  router.push(`/project/${item.id}`);
                }
              }}
              activeOpacity={0.7}
            >
              <View style={s.cardTop}>
                <Text style={[s.cardTitle, { color: textPrimary }]} numberOfLines={2}>{item.title}</Text>
                <View style={[s.badge, { backgroundColor: (STATUS_COLORS[item.status] || Colors.neutral[400]) + '20' }]}>
                  <Text style={[s.badgeText, { color: STATUS_COLORS[item.status] }]}>
                    {STATUS_LABELS[item.status]}
                  </Text>
                </View>
              </View>
              <Text style={[s.desc, { color: textSecondary }]} numberOfLines={2}>{(item.description || '').replace(/\s*---METADATA---[\s\S]*/g, '').trim()}</Text>
              {(item.status === 'IN_PROGRESS' || item.status === 'COMPLETED') && (
                <View style={s.progressBarSection}>
                  <View style={[s.progressBarTrack, { backgroundColor: isDark ? '#334155' : Colors.neutral[100] }]}>
                    <View style={[s.progressBarFill, { width: `${item.progress || 0}%`, backgroundColor: item.status === 'COMPLETED' ? Colors.success : Colors.primary[700] }]} />
                  </View>
                  <Text style={[s.progressLabel, { color: textSecondary }]}>{item.progress || 0}% Completed</Text>
                </View>
              )}
              <View style={s.cardBottom}>
                <View style={s.stat}>
                  <Ionicons name="cash-outline" size={16} color={Colors.primary[600]} />
                  <Text style={s.budget}>${item.budget}</Text>
                </View>
                <View style={[s.catBadge, { backgroundColor: isDark ? '#1E293B' : Colors.neutral[100] }]}>
                  <Text style={[s.catText, { color: isDark ? '#94A3B8' : Colors.neutral[600] }]}>{item.category}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: { paddingHorizontal: 16, paddingTop: 8 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', color: Colors.neutral[900] },
  addBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.primary[700], justifyContent: 'center', alignItems: 'center' },
  filterContainer: {
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  filterScroll: { paddingHorizontal: 16, gap: 8 },
  chip: {
    paddingVertical: 10, paddingHorizontal: 20, borderRadius: 999,
    backgroundColor: Colors.neutral[100], height: 40,
    justifyContent: 'center', alignItems: 'center',
  },
  chipActive: { backgroundColor: Colors.primary[700] },
  chipText: { fontSize: 14, fontWeight: '500', color: Colors.neutral[600] },
  chipTextActive: { color: Colors.white, fontWeight: '600' },
  card: { backgroundColor: Colors.white, borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: Colors.neutral[100], ...Shadows.sm },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: Colors.neutral[900], flex: 1, marginRight: 8 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  desc: { fontSize: 14, color: Colors.neutral[500], lineHeight: 20, marginBottom: 12 },
  cardBottom: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  budget: { fontSize: 14, fontWeight: '700', color: Colors.primary[700] },
  proposals: { fontSize: 13, color: Colors.neutral[500] },
  catBadge: { marginLeft: 'auto', backgroundColor: Colors.neutral[100], paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999 },
  catText: { fontSize: 12, color: Colors.neutral[600], fontWeight: '500' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 16, fontWeight: '600', color: Colors.neutral[500], marginTop: 12 },
  progressBarSection: {
    marginBottom: 12,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: Colors.neutral[100],
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressLabel: {
    fontSize: 11,
    color: Colors.neutral[500],
    fontWeight: '500',
  },
});
