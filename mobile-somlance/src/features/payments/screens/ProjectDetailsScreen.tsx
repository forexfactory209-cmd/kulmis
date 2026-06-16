import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Shadows, Spacing, BorderRadius, FontSize } from '@/theme';
import { useDarkColors } from '@/store/themeStore';

export default function ProjectDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark, bg, cardBg, textPrimary, textSecondary, textMuted, border, statusBar, iconBg } = useDarkColors();

  return (
    <View style={[s.container, { paddingTop: insets.top, backgroundColor: bg }]}>
      <StatusBar barStyle={statusBar} backgroundColor={bg} />
      
      <View style={[s.nav, { backgroundColor: bg, borderBottomColor: border, borderBottomWidth: 1 }]}>
        <TouchableOpacity onPress={() => router.back()} style={[s.backBtn, { backgroundColor: iconBg, borderRadius: 20, alignItems: 'center' }]}>
          <Ionicons name="arrow-back" size={24} color={textPrimary} />
        </TouchableOpacity>
        <Text style={[s.navTitle, { color: textPrimary }]}>Earnings</Text>
        <View style={[s.badge, { backgroundColor: isDark ? '#1E293B' : Colors.neutral[100] }]}>
          <Text style={[s.badgeText, { color: textSecondary }]}>Completed</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
        <View style={[s.mainCard, { backgroundColor: cardBg, borderColor: border }]}>
          <View style={s.cardHeader}>
            <View>
              <Text style={s.label}>PROJECT NAME</Text>
              <Text style={[s.projectTitle, { color: textPrimary }]}>E-commerce{'\n'}UI Refactor</Text>
            </View>
            <View style={s.deliveredBadge}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.white} />
              <Text style={s.deliveredText}>Delivered</Text>
            </View>
          </View>

          <View style={s.statsRow}>
            <View style={s.statCol}>
              <Text style={s.label}>COMPLETION DATE</Text>
              <Text style={[s.statVal, { color: textPrimary }]}>Oct 24, 2023</Text>
            </View>
            <View style={s.statCol}>
              <Text style={s.label}>TOTAL DURATION</Text>
              <Text style={[s.statVal, { color: textPrimary }]}>6 Weeks</Text>
            </View>
          </View>

          <View style={s.idRow}>
            <Text style={s.label}>JOB ID</Text>
            <Text style={[s.statVal, { color: textPrimary }]}>#KE-99284</Text>
          </View>

          <View style={[s.divider, { backgroundColor: border }]} />

          <Text style={s.label}>PROJECT OVERVIEW</Text>
          <Text style={[s.description, { color: textSecondary }]}>
            Comprehensive overhaul of the core shopping experience for a global retail client. The scope included redesigning the product discovery engine, implementing a headless checkout flow, and optimizing the mobile conversion funnel. Leveraged the Kinetic Design System to ensure brand consistency across 42 high-fidelity screens and interactive prototypes.
          </Text>
        </View>

        {/* Payment Summary */}
        <View style={[s.summaryCard, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC' }]}>
          <Text style={[s.summaryTitle, { color: textPrimary }]}>Payment Summary</Text>
          <View style={s.summaryRow}>
            <Text style={[s.summaryLabel, { color: textSecondary }]}>Base Rate</Text>
            <Text style={[s.summaryVal, { color: textPrimary }]}>$2,200.00</Text>
          </View>
          <View style={s.summaryRow}>
            <Text style={[s.summaryLabel, { color: textSecondary }]}>Milestone Bonuses</Text>
            <Text style={[s.summaryVal, { color: textPrimary }]}>$200.00</Text>
          </View>
          <View style={[s.summaryDivider, { backgroundColor: border }]} />
          <View style={s.summaryRow}>
            <Text style={[s.totalLabel, { color: textPrimary }]}>Total Earned</Text>
            <Text style={[s.totalVal, { color: isDark ? '#10B981' : Colors.primary[900] }]}>$2,400.00</Text>
          </View>
        </View>

        <TouchableOpacity style={[s.supportBtn, { backgroundColor: cardBg, borderColor: border }]}>
          <Ionicons name="help-circle-outline" size={20} color={isDark ? '#10B981' : Colors.primary[600]} />
          <Text style={[s.supportBtnText, { color: textPrimary }]}>Support for this project</Text>
          <Ionicons name="chevron-forward" size={18} color={isDark ? '#334155' : Colors.neutral[300]} />
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
  navTitle: { fontSize: 16, fontWeight: '600', color: Colors.neutral[900], flex: 1, marginLeft: 8 },
  badge: { backgroundColor: Colors.neutral[100], paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  badgeText: { fontSize: 12, color: Colors.neutral[500], fontWeight: '600' },
  
  content: { padding: 16 },
  mainCard: { backgroundColor: Colors.white, borderRadius: 24, padding: 24, borderWidth: 1, borderColor: Colors.neutral[100], marginBottom: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  label: { fontSize: 10, fontWeight: '700', color: Colors.neutral[400], letterSpacing: 1, marginBottom: 8 },
  projectTitle: { fontSize: 24, fontWeight: '800', color: Colors.neutral[900], lineHeight: 30 },
  deliveredBadge: { backgroundColor: Colors.success, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  deliveredText: { color: Colors.white, fontSize: 12, fontWeight: '700' },

  statsRow: { flexDirection: 'row', marginBottom: 24 },
  statCol: { flex: 1 },
  statVal: { fontSize: 15, fontWeight: '700', color: Colors.neutral[800] },
  idRow: { marginBottom: 24 },

  divider: { height: 1, backgroundColor: Colors.neutral[50], marginVertical: 24 },
  description: { fontSize: 14, color: Colors.neutral[500], lineHeight: 22 },

  summaryCard: { backgroundColor: '#F8FAFC', borderRadius: 20, padding: 20, marginBottom: 16 },
  summaryTitle: { fontSize: 16, fontWeight: '800', color: Colors.neutral[900], marginBottom: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  summaryLabel: { fontSize: 14, color: Colors.neutral[500] },
  summaryVal: { fontSize: 14, fontWeight: '700', color: Colors.neutral[900] },
  summaryDivider: { height: 1, backgroundColor: Colors.neutral[200], marginVertical: 12 },
  totalLabel: { fontSize: 16, fontWeight: '800', color: Colors.neutral[900] },
  totalVal: { fontSize: 18, fontWeight: '800', color: Colors.primary[900] },

  supportBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, padding: 16, borderRadius: 16, gap: 12, borderWidth: 1, borderColor: Colors.neutral[100] },
  supportBtnText: { flex: 1, fontSize: 14, fontWeight: '700', color: Colors.neutral[700] },
});
