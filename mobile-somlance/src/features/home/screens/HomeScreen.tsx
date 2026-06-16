import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, RefreshControl
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadows } from '@/theme';
import { CATEGORIES } from '@/data/mockData';
import { FreelancerCard } from '@/components/cards/FreelancerCard';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { getFreelancers } from '@/api/users';
import { getMyProjects } from '@/api/projects';
import { useAuthStore } from '@/store/authStore';
import { useDarkColors } from '@/store/themeStore';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuthStore();
  const { isDark, bg, cardBg, textPrimary, textSecondary, textMuted, border, statusBar } = useDarkColors();
  const [freelancers, setFreelancers] = useState<any[]>([]);
  const [recentProjects, setRecentProjects] = useState<any[]>([]);

  const [refreshing, setRefreshing] = useState(false);

  const fetchTopFreelancers = async () => {
    try {
      const res = await getFreelancers();
      let liveList = res && res.freelancers ? res.freelancers : [];
      setFreelancers(liveList.slice(0, 4));
    } catch (e) {
      console.log("Failed to fetch freelancers on Home", e);
      setFreelancers([]);
    }
  };
  
  const fetchProjects = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await getMyProjects();
      let list = res && res.projects ? res.projects : [];
      setRecentProjects(list.slice(0, 4)); // Only 4 projects
    } catch (e) {
      console.log("Failed to fetch projects on Home", e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTopFreelancers();
      fetchProjects();
    }, [isAuthenticated])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchTopFreelancers(), fetchProjects()]);
    setRefreshing(false);
  }, [isAuthenticated]);

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: bg }]}>
      <StatusBar barStyle={statusBar} backgroundColor={bg} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary[500]} />}
      >
        {/* ─── Header ─── */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <BrandLogo size={40} showText style={styles.logo} color={isDark ? Colors.white : Colors.primary[900]} />
            <TouchableOpacity
              style={[styles.notifBtn, { backgroundColor: isDark ? '#334155' : Colors.neutral[50] }]}
              onPress={() => router.push('/notifications')}
            >
              <Ionicons name="notifications-outline" size={24} color={textPrimary} />
              {(() => {
                const { unreadCount } = require('@/store/notificationStore').useNotificationStore();
                if (unreadCount > 0) {
                  return (
                    <View style={styles.notifBadge}>
                      <Text style={styles.notifBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                    </View>
                  );
                }
                return null;
              })()}
            </TouchableOpacity>
          </View>

          {/* Search Bar — navigates to Categories on tap */}
          <TouchableOpacity
            style={[styles.searchBar, { backgroundColor: isDark ? '#1E293B' : Colors.neutral[50], borderColor: border }]}
            activeOpacity={0.8}
            onPress={() => router.push('/categories')}
          >
            <Ionicons name="search" size={20} color={textMuted} />
            <Text style={[styles.searchPlaceholder, { color: textMuted }]}>Search skills, freelancers...</Text>
          </TouchableOpacity>
        </View>

        {/* ─── Banner ─── */}
        <View style={styles.banner}>
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>
              Find the best talent{'\n'}for your project
            </Text>
            <Text style={styles.bannerSub}>
              Hire top Somali freelancers trusted by 1000+ clients
            </Text>
            <TouchableOpacity
              style={styles.bannerBtn}
              onPress={() => router.push('/(tabs)/freelancers')}
            >
              <Text style={styles.bannerBtnText}>Explore Now</Text>
              <Ionicons name="arrow-forward" size={16} color={Colors.primary[700]} />
            </TouchableOpacity>
          </View>
          <View style={styles.bannerGraphic}>
            <View style={styles.bannerCircle}>
              <Ionicons name="people" size={40} color={Colors.primary[200]} />
            </View>
          </View>
        </View>

        {/* ─── Top Categories ─── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: textPrimary }]}>Top Categories</Text>
            <TouchableOpacity onPress={() => router.push('/categories')}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesRow}
          >
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={styles.categoryItem}
                onPress={() =>
                  router.push({
                    pathname: '/search-results',
                    params: { query: cat.name, category: cat.name },
                  })
                }
              >
                <View style={[styles.categoryIcon, { backgroundColor: isDark ? '#1E293B' : cat.color + '15' }]}>
                  <Ionicons name={cat.icon} size={32} color={cat.color} />
                </View>
                <Text style={[styles.categoryName, { color: textPrimary }]}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ─── Top Freelancers ─── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: textPrimary }]}>Top Freelancers</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/freelancers')}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.freelancersGrid}>
            {freelancers.map((item) => (
              <FreelancerCard
                key={item.id}
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
            ))}
          </View>
        </View>

        {/* ─── Recent Projects ─── */}
        {isAuthenticated && recentProjects.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: textPrimary }]}>Recent Projects</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/projects')}>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
              {recentProjects.map((p, i) => (
                <TouchableOpacity key={i} style={[styles.projectMini, { backgroundColor: cardBg, borderColor: border }]} activeOpacity={0.7}
                  onPress={() => router.push(p.status === 'IN_PROGRESS' || p.status === 'COMPLETED' ? `/project-dashboard/${p.id}` : `/project/${p.id}`)}>
                  <View style={[styles.projectMiniCat, { backgroundColor: isDark ? '#1E293B' : Colors.primary[50] }]}>
                    <Text style={[styles.projectMiniCatText, { color: Colors.primary[500] }]}>{p.category || 'General'}</Text>
                  </View>
                  <Text style={[styles.projectMiniTitle, { color: textPrimary }]} numberOfLines={1}>{p.title}</Text>

                  {(p.status === 'IN_PROGRESS' || p.status === 'COMPLETED') && (
                    <View style={styles.progressBarSection}>
                      <View style={[styles.progressBarTrack, { backgroundColor: isDark ? '#334155' : Colors.neutral[100] }]}>
                        <View style={[styles.progressBarFill, { width: `${p.progress || 0}%`, backgroundColor: p.status === 'COMPLETED' ? Colors.success : Colors.primary[600] }]} />
                      </View>
                      <Text style={[styles.progressLabel, { color: textSecondary }]}>{p.progress || 0}% Completed</Text>
                    </View>
                  )}

                  <View style={styles.projectMiniRow}>
                    <Text style={[styles.projectMiniBudget, { color: Colors.primary[500] }]}>${p.budget}</Text>
                    <Text style={[styles.projectMiniProposals, { color: textMuted }]}>{p.status.replace('_', ' ')}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  scrollContent: { paddingBottom: 20 },
  header: { paddingHorizontal: Spacing.md, paddingTop: Spacing.sm },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  logo: {
    marginBottom: 0,
  },
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifBadge: {
    position: 'absolute',
    top: 6,
    right: 8,
    backgroundColor: Colors.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
    paddingHorizontal: 4,
  },
  notifBadgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  searchBar: { 
    flexDirection: 'row', alignItems: 'center', 
    borderRadius: 20, 
    paddingHorizontal: 16, height: 56, 
    borderWidth: 1, marginBottom: 20 
  },
  searchPlaceholder: { flex: 1, marginLeft: 10, fontSize: 16 },
  banner: { 
    marginHorizontal: 16, backgroundColor: Colors.primary[900], borderRadius: 28, 
    padding: 24, flexDirection: 'row', alignItems: 'center', marginBottom: 28, 
    overflow: 'hidden', elevation: 8, shadowColor: Colors.primary[700], shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20
  },
  bannerContent: { flex: 1 },
  bannerTitle: { fontSize: 22, fontWeight: '800', color: Colors.white, lineHeight: 28, marginBottom: 8 },
  bannerSub: { fontSize: 13, color: Colors.primary[100], marginBottom: 20, lineHeight: 18, opacity: 0.9 },
  bannerBtn: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, 
    paddingVertical: 12, paddingHorizontal: 20, borderRadius: 14, alignSelf: 'flex-start', gap: 8 
  },
  bannerBtnText: { fontSize: 14, fontWeight: '700', color: Colors.primary[700] },
  bannerGraphic: { marginLeft: 10 },
  bannerCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  section: { paddingHorizontal: 16, marginBottom: 28 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 22, fontWeight: '800' },
  seeAll: { fontSize: 14, color: Colors.primary[700], fontWeight: '700' },
  categoriesRow: { gap: 16, paddingRight: 16 },
  categoryItem: { alignItems: 'center', width: 90 },
  categoryIcon: { width: 80, height: 80, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  categoryName: { fontSize: 12, fontWeight: '700', textAlign: 'center' },
  freelancersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  projectMini: { width: 260, padding: 18, borderRadius: 24, borderWidth: 1 },
  projectMiniCat: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10, alignSelf: 'flex-start', marginBottom: 10 },
  projectMiniCatText: { fontSize: 11, fontWeight: FontWeight.bold },
  projectMiniTitle: { fontSize: 15, fontWeight: '700', marginBottom: 12 },
  projectMiniRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  projectMiniBudget: { fontSize: 16, fontWeight: '800' },
  projectMiniProposals: { fontSize: 12 },
  progressBarSection: { marginBottom: 12 },
  progressBarTrack: { height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: 4 },
  progressBarFill: { height: '100%', borderRadius: 3 },
  progressLabel: { fontSize: 11, fontWeight: '500' },
});
