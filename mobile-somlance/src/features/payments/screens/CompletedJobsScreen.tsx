import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Shadows, Spacing, BorderRadius, FontSize } from '@/theme';

const COMPLETED_PROJECTS = [
  { id: '1', title: 'E-commerce UI Refactor', date: 'Oct 24, 2023', earned: 2400, rating: 5.0, image: 'https://picsum.photos/seed/p1/200/200' },
  { id: '2', title: 'Analytics Dashboard', date: 'Oct 18, 2023', earned: 1850, rating: 4.8, image: 'https://picsum.photos/seed/p2/200/200' },
  { id: '3', title: 'Brand Identity Guide', date: 'Oct 12, 2023', earned: 3200, rating: 5.0, image: 'https://picsum.photos/seed/p3/200/200' },
  { id: '4', title: 'SaaS Marketing Site', date: 'Oct 05, 2023', earned: 1200, rating: 4.9, image: 'https://picsum.photos/seed/p4/200/200' },
  { id: '5', title: 'Mobile App Wireframing', date: 'Sep 28, 2023', earned: 950, rating: 5.0, image: 'https://picsum.photos/seed/p5/200/200' },
];

export default function CompletedJobsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      
      <View style={s.nav}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.neutral[900]} />
        </TouchableOpacity>
        <Text style={s.navTitle}>Jobs</Text>
        <View style={s.navIcons}>
          <TouchableOpacity style={s.iconBtn}><Ionicons name="filter-outline" size={22} color={Colors.neutral[500]} /></TouchableOpacity>
          <TouchableOpacity style={s.iconBtn}><Ionicons name="search-outline" size={22} color={Colors.neutral[500]} /></TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
        <View style={s.summaryBox}>
          <Text style={s.summaryTitle}>PORTFOLIO SUMMARY</Text>
          <Text style={s.summaryValue}>68 Projects Completed</Text>
          <View style={s.summaryRow}>
            <View style={s.summaryStat}>
              <Text style={s.statLabel}>Total Earnings</Text>
              <Text style={s.statValue}>$14,250.00</Text>
            </View>
            <View style={s.summaryStat}>
              <Text style={s.statLabel}>Avg. Rating</Text>
              <View style={s.ratingRow}>
                <Text style={s.statValue}>4.9</Text>
                <Ionicons name="star" size={14} color="#F59E0B" />
              </View>
            </View>
          </View>
        </View>

        {COMPLETED_PROJECTS.map((project) => (
          <TouchableOpacity key={project.id} style={s.projectCard} onPress={() => router.push('/earnings/project-details')}>
            <View style={s.cardHeader}>
              <Image source={{ uri: project.image }} style={s.projectThumb} />
              <View style={s.badge}>
                <Text style={s.badgeText}>COMPLETED</Text>
              </View>
            </View>
            <View style={s.cardBody}>
              <Text style={s.projectTitle}>{project.title}</Text>
              <Text style={s.projectDate}>Completed {project.date}</Text>
              <View style={s.cardDivider} />
              <View style={s.cardFooter}>
                <View>
                  <Text style={s.footerLabel}>Earned</Text>
                  <Text style={s.footerVal}>${project.earned.toLocaleString()}.00</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={s.footerLabel}>Rating</Text>
                  <View style={s.ratingRow}>
                    <Text style={s.footerVal}>{project.rating.toFixed(1)}</Text>
                    <Ionicons name="star" size={14} color="#F59E0B" />
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={s.loadMoreBtn}>
          <Text style={s.loadMoreText}>Load More Projects</Text>
          <Ionicons name="chevron-down" size={18} color={Colors.white} />
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.neutral[50] },
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: Colors.white },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  navTitle: { fontSize: 16, fontWeight: '600', color: Colors.neutral[900] },
  navIcons: { flexDirection: 'row', gap: 12 },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  
  content: { padding: 16 },
  summaryBox: { backgroundColor: Colors.white, padding: 20, borderRadius: 24, borderWidth: 1, borderColor: Colors.neutral[100], marginBottom: 24 },
  summaryTitle: { fontSize: 11, color: Colors.neutral[400], fontWeight: '700', letterSpacing: 1 },
  summaryValue: { fontSize: 18, fontWeight: '800', color: Colors.neutral[900], marginTop: 8, marginBottom: 16 },
  summaryRow: { flexDirection: 'row', gap: 12 },
  summaryStat: { flex: 1, backgroundColor: Colors.neutral[50], padding: 12, borderRadius: 16 },
  statLabel: { fontSize: 12, color: Colors.neutral[500], marginBottom: 6 },
  statValue: { fontSize: 15, fontWeight: '800', color: Colors.primary[700] },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },

  projectCard: { backgroundColor: Colors.white, borderRadius: 24, overflow: 'hidden', marginBottom: 16, borderWidth: 1, borderColor: Colors.neutral[100] },
  cardHeader: { flexDirection: 'row', padding: 16, alignItems: 'center', justifyContent: 'space-between' },
  projectThumb: { width: 48, height: 48, borderRadius: 12 },
  badge: { backgroundColor: Colors.primary[50], paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  badgeText: { fontSize: 10, fontWeight: '800', color: Colors.primary[600] },
  cardBody: { paddingHorizontal: 16, paddingBottom: 16 },
  projectTitle: { fontSize: 16, fontWeight: '700', color: Colors.neutral[900] },
  projectDate: { fontSize: 13, color: Colors.neutral[400], marginTop: 4 },
  cardDivider: { height: 1, backgroundColor: Colors.neutral[50], marginVertical: 12 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  footerLabel: { fontSize: 11, color: Colors.neutral[400], marginBottom: 4 },
  footerVal: { fontSize: 15, fontWeight: '800', color: Colors.neutral[800] },

  loadMoreBtn: { backgroundColor: Colors.primary[900], flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 16, gap: 8, marginTop: 8 },
  loadMoreText: { color: Colors.white, fontWeight: '700', fontSize: 15 },
});
