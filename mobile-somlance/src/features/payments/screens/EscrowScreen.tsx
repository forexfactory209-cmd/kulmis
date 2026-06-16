import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Shadows, Spacing, BorderRadius, FontSize } from '@/theme';

const ESCROW_JOBS = [
  { id: '1', title: 'Mobile App UI Design', client: 'Marcus Sterling', amount: 150, status: 'Releases Oct 14', avatar: 'https://i.pravatar.cc/150?u=marcus' },
  { id: '2', title: 'Brand Guidelines Update', client: 'Elena Rodriguez', amount: 100, status: 'In Review', avatar: 'https://i.pravatar.cc/150?u=elena' },
  { id: '3', title: 'Q4 Analytics Report', client: 'David Chen', amount: 50, status: 'Pending Start', avatar: 'https://i.pravatar.cc/150?u=david' },
];

export default function EscrowScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      
      <View style={s.nav}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.neutral[900]} />
        </TouchableOpacity>
        <Text style={s.navTitle}>Earnings</Text>
        <TouchableOpacity style={s.moreBtn}><Ionicons name="ellipsis-vertical" size={20} color={Colors.neutral[900]} /></TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
        <View style={s.summaryBox}>
          <Text style={s.summaryLabel}>TOTAL PENDING</Text>
          <View style={s.summaryAmountRow}>
            <Text style={s.summaryAmount}>$300.00</Text>
            <View style={s.trendBadge}>
              <Text style={s.trendText}>+ 12.5% vs last month</Text>
            </View>
          </View>
        </View>

        {/* Secure Banner */}
        <View style={s.secureBanner}>
          <Ionicons name="shield-checkmark" size={18} color={Colors.primary[600]} />
          <Text style={s.secureText}>Funds secured by SafePay Escrow</Text>
        </View>

        {/* Info Box */}
        <View style={s.infoBox}>
          <View style={s.infoIconRow}>
            <Ionicons name="information-circle-outline" size={22} color={Colors.primary[600]} />
            <Text style={s.infoTitle}>What is Escrow?</Text>
          </View>
          <Text style={s.infoDesc}>
            Escrow ensures payment security. Once a client starts a job, the full amount is held by our secure platform. Funds are released to your balance as soon as the client approves the final milestone or the scheduled release date is reached.
          </Text>
        </View>

        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Active Escrow Jobs</Text>
          <Text style={s.itemCount}>3 Items</Text>
        </View>

        {ESCROW_JOBS.map((job) => (
          <TouchableOpacity key={job.id} style={s.jobCard} onPress={() => router.push('/earnings/project-details')}>
            <View style={s.jobMain}>
              <Image source={{ uri: job.avatar }} style={s.avatar} />
              <View style={s.jobInfo}>
                <Text style={s.jobTitle}>{job.title}</Text>
                <View style={s.clientRow}>
                  <Text style={s.clientLabel}>Client:</Text>
                  <Text style={s.clientName}>{job.client}</Text>
                  <Ionicons name="shield-checkmark" size={12} color="#F59E0B" style={{ marginLeft: 4 }} />
                </View>
              </View>
              <View style={s.amountInfo}>
                <Text style={s.amount}>${job.amount.toFixed(2)}</Text>
                <Text style={s.status}>{job.status}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        <View style={s.overviewBox}>
          <Text style={s.overviewTitle}>Overview</Text>
          <View style={s.overviewRow}>
            <Text style={s.overviewLabel}>Processing</Text>
            <Text style={s.overviewVal}>$0.00</Text>
          </View>
          <View style={s.overviewRow}>
            <Text style={s.overviewLabel}>Next Release</Text>
            <Text style={[s.overviewVal, { color: Colors.primary[600] }]}>Oct 14</Text>
          </View>
          <View style={s.overviewRow}>
            <Text style={s.overviewLabel}>Fees (Est.)</Text>
            <Text style={[s.overviewVal, { color: Colors.error }]}>-$15.00</Text>
          </View>
          <TouchableOpacity style={s.historyBtn}>
            <Text style={s.historyBtnText}>View Payout History</Text>
          </TouchableOpacity>
        </View>

        {/* Bank Grade Security */}
        <View style={s.securityNotice}>
          <View style={s.securityHeader}>
            <Ionicons name="shield-outline" size={20} color={Colors.white} />
            <Text style={s.securityTitle}>Bank-Grade Security</Text>
          </View>
          <Text style={s.securityDesc}>
            Your earnings are insured and held in segregated trust accounts. We use industry-standard encryption for all transactions.
          </Text>
          <TouchableOpacity><Text style={s.securityLink}>Read Security Protocol <Ionicons name="open-outline" size={12} /></Text></TouchableOpacity>
        </View>

        <TouchableOpacity style={s.helpBtn}>
          <Ionicons name="help-circle-outline" size={20} color={Colors.primary[600]} />
          <Text style={s.helpText}>Payment Help Center</Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.neutral[300]} />
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
  moreBtn: { width: 40, height: 40, alignItems: 'flex-end', justifyContent: 'center' },
  
  content: { padding: 16 },
  summaryBox: { backgroundColor: Colors.white, padding: 24, borderRadius: 20, borderWidth: 1, borderColor: Colors.neutral[100], marginBottom: 12 },
  summaryLabel: { fontSize: 12, color: Colors.neutral[400], fontWeight: '700', letterSpacing: 1 },
  summaryAmountRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
  summaryAmount: { fontSize: 28, fontWeight: '800', color: Colors.primary[900] },
  trendBadge: { backgroundColor: Colors.success + '15', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  trendText: { fontSize: 11, color: Colors.success, fontWeight: '700' },

  secureBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.primary[50], padding: 14, borderRadius: 12, marginBottom: 16 },
  secureText: { fontSize: 13, fontWeight: '700', color: Colors.primary[700] },

  infoBox: { backgroundColor: Colors.white, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: Colors.neutral[100], borderLeftWidth: 4, borderLeftColor: Colors.primary[600], marginBottom: 24 },
  infoIconRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  infoTitle: { fontSize: 14, fontWeight: '800', color: Colors.neutral[900] },
  infoDesc: { fontSize: 13, color: Colors.neutral[500], lineHeight: 20 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.neutral[900] },
  itemCount: { fontSize: 12, color: Colors.neutral[400] },

  jobCard: { backgroundColor: Colors.white, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: Colors.neutral[100] },
  jobMain: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 44, height: 44, borderRadius: 12 },
  jobInfo: { flex: 1, marginLeft: 12 },
  jobTitle: { fontSize: 15, fontWeight: '700', color: Colors.neutral[900] },
  clientRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  clientLabel: { fontSize: 12, color: Colors.neutral[400] },
  clientName: { fontSize: 12, fontWeight: '700', color: Colors.neutral[700], marginLeft: 4 },
  amountInfo: { alignItems: 'flex-end' },
  amount: { fontSize: 15, fontWeight: '800', color: Colors.primary[600] },
  status: { fontSize: 11, color: '#F59E0B', marginTop: 4, textAlign: 'right' },

  overviewBox: { backgroundColor: Colors.white, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: Colors.neutral[100], marginTop: 12, marginBottom: 24 },
  overviewTitle: { fontSize: 16, fontWeight: '800', color: Colors.neutral[900], marginBottom: 16 },
  overviewRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  overviewLabel: { fontSize: 14, color: Colors.neutral[500] },
  overviewVal: { fontSize: 14, fontWeight: '700', color: Colors.neutral[900] },
  historyBtn: { backgroundColor: Colors.primary[900], paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  historyBtnText: { color: Colors.white, fontWeight: '700', fontSize: 14 },

  securityNotice: { backgroundColor: '#0A192F', padding: 24, borderRadius: 24, marginBottom: 16 },
  securityHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  securityTitle: { color: Colors.white, fontSize: 14, fontWeight: '700' },
  securityDesc: { color: 'rgba(255,255,255,0.7)', fontSize: 12, lineHeight: 18, marginBottom: 16 },
  securityLink: { color: Colors.primary[300], fontSize: 12, fontWeight: '700' },

  helpBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primary[50], padding: 16, borderRadius: 16, gap: 12 },
  helpText: { flex: 1, fontSize: 14, fontWeight: '700', color: Colors.primary[700] },
});
