import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Shadows } from '@/theme';
import { Button } from '@/components/ui/Button';

export default function ProjectDashboardScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[s.c, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <View style={s.nav}>
        <TouchableOpacity onPress={() => router.back()} style={s.back}><Ionicons name="chevron-back" size={24} color={Colors.neutral[900]} /></TouchableOpacity>
        <Text style={s.navTitle}>Project Dashboard</Text>
        <TouchableOpacity style={s.back}><Ionicons name="ellipsis-vertical" size={20} color={Colors.neutral[900]} /></TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.projectLabel}>Project</Text>
        <Text style={s.projectTitle}>Design a modern website UI</Text>
        
        <View style={s.freelancerCard}>
          <View style={s.av}><Text style={s.avi}>A</Text></View>
          <Text style={s.fName}>Ahmed Ibrahim</Text>
          <View style={s.badge}><Text style={s.badgeText}>In Progress</Text></View>
        </View>

        <View style={s.progressRow}>
          <Text style={s.progressLabel}>Progress</Text>
          <Text style={s.progressVal}>45%</Text>
        </View>
        <View style={s.progressTrack}>
          <View style={[s.progressFill, { width: '45%' }]} />
        </View>

        <Text style={s.sectionTitle}>Milestones</Text>
        
        <TouchableOpacity style={s.milestoneCard} onPress={() => router.push({ pathname: '/milestones/[id]', params: { id: '1' } })} activeOpacity={0.7}>
          <View style={s.mHeader}>
            <Text style={s.mTitle}>Milestone 1</Text>
            <Text style={[s.mStatus, { color: Colors.success }]}>Completed</Text>
          </View>
          <Text style={s.mDesc}>Research & Wireframes</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[s.milestoneCard, s.milestoneActive]} onPress={() => router.push({ pathname: '/milestones/[id]', params: { id: '2' } })} activeOpacity={0.7}>
          <View style={s.mHeader}>
            <Text style={s.mTitle}>Milestone 2</Text>
            <Text style={[s.mStatus, { color: Colors.primary[600] }]}>In Progress</Text>
          </View>
          <Text style={s.mDesc}>UI Design Concept</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[s.milestoneCard, { opacity: 0.6 }]} activeOpacity={0.7}>
          <View style={s.mHeader}>
            <Text style={s.mTitle}>Milestone 3</Text>
            <Text style={s.mStatus}>Pending</Text>
          </View>
          <Text style={s.mDesc}>Final Design & Assets</Text>
        </TouchableOpacity>

      </ScrollView>

      <View style={[s.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <Button 
          title="Message" 
          onPress={() => router.push({ pathname: '/chat/[id]', params: { id: 'conv_1', name: 'Ahmed Ibrahim' } })} 
          variant="outline" 
          style={{ flex: 1 }} 
        />
        <Button 
          title="View Work" 
          onPress={() => router.push({ pathname: '/milestones/[id]', params: { id: '2' } })} 
          style={{ flex: 1, marginLeft: 12 }} 
        />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: Colors.white },
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.neutral[100] },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.neutral[50], justifyContent: 'center', alignItems: 'center' },
  navTitle: { fontSize: 18, fontWeight: '600', color: Colors.neutral[900] },
  content: { padding: 20, paddingBottom: 100 },
  projectLabel: { fontSize: 13, color: Colors.neutral[500], marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  projectTitle: { fontSize: 22, fontWeight: '800', color: Colors.neutral[900], marginBottom: 20 },
  freelancerCard: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: Colors.neutral[50], borderRadius: 16, marginBottom: 24 },
  av: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary[100], justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avi: { fontSize: 16, fontWeight: '700', color: Colors.primary[700] },
  fName: { flex: 1, fontSize: 16, fontWeight: '600', color: Colors.neutral[900] },
  badge: { backgroundColor: Colors.primary[50], paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  badgeText: { fontSize: 12, fontWeight: '600', color: Colors.primary[700] },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  progressLabel: { fontSize: 15, fontWeight: '600', color: Colors.neutral[800] },
  progressVal: { fontSize: 15, fontWeight: '700', color: Colors.neutral[900] },
  progressTrack: { height: 8, backgroundColor: Colors.neutral[100], borderRadius: 4, overflow: 'hidden', marginBottom: 32 },
  progressFill: { height: '100%', backgroundColor: Colors.success, borderRadius: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.neutral[900], marginBottom: 16 },
  milestoneCard: { padding: 16, borderRadius: 14, borderWidth: 1, borderColor: Colors.neutral[100], marginBottom: 12, backgroundColor: Colors.white, ...Shadows.sm },
  milestoneActive: { borderColor: Colors.primary[200], backgroundColor: Colors.primary[50] + '30' },
  mHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  mTitle: { fontSize: 16, fontWeight: '700', color: Colors.neutral[900] },
  mStatus: { fontSize: 13, fontWeight: '600', color: Colors.neutral[500] },
  mDesc: { fontSize: 14, color: Colors.neutral[500] },
  bottomBar: { flexDirection: 'row', paddingHorizontal: 20, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.neutral[100], backgroundColor: Colors.white, position: 'absolute', bottom: 0, left: 0, right: 0 },
});
