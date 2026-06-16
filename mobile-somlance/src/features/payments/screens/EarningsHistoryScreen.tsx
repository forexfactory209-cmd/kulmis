import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Shadows, Spacing, BorderRadius, FontSize } from '@/theme';

const TRANSACTIONS = [
  { id: '1', title: 'Senior Project Lead -- Phase 2', amount: 1450, status: 'COMPLETED', date: 'Oct 24, 2023', icon: 'briefcase', type: 'Income' },
  { id: '2', title: 'UI Design System Audit', amount: 850, status: 'COMPLETED', date: 'Oct 22, 2023', icon: 'color-palette', type: 'Income' },
  { id: '3', title: 'API Documentation Refresh', amount: 1200, status: 'PENDING', date: 'Oct 21, 2023', icon: 'document-text', type: 'Pending' },
  { id: '4', title: 'Marketing Performance Report', amount: 2100, status: 'COMPLETED', date: 'Oct 18, 2023', icon: 'bar-chart', type: 'Income' },
  { id: '5', title: 'Withdrawal to Zaad', amount: 3400, status: 'COMPLETED', date: 'Oct 15, 2023', icon: 'wallet', type: 'Withdrawals' },
];

export default function EarningsHistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [activeFilter, setActiveFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredTransactions = TRANSACTIONS.filter(tx => 
    activeFilter === 'All' || tx.type === activeFilter
  );

  return (
    <View style={s.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={[s.header, { paddingTop: insets.top + 10 }]}>
        <View style={s.navRow}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.neutral[900]} />
          </TouchableOpacity>
          <Text style={s.navTitle}>Earnings</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
        {/* Available Balance Card */}
        <View style={s.balanceCard}>
          <Text style={s.balanceLabel}>AVAILABLE BALANCE</Text>
          <Text style={s.balanceValue}>$12,540.00</Text>
          <TouchableOpacity style={s.withdrawBtn} onPress={() => router.push('/withdraw')}>
            <Ionicons name="wallet-outline" size={20} color={Colors.white} />
            <Text style={s.withdrawBtnText}>Withdraw Funds</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Card */}
        <View style={s.summaryCard}>
          <Text style={s.summaryTitle}>LAST 30 DAYS</Text>
          <View style={s.summaryRow}>
            <Text style={s.summaryLabel}>Net Income</Text>
            <Text style={[s.summaryVal, { color: Colors.success }]}>+$3,240.12</Text>
          </View>
          <View style={s.summaryRow}>
            <Text style={s.summaryLabel}>Pending</Text>
            <Text style={[s.summaryVal, { color: Colors.warning }]}>$850.00</Text>
          </View>
          <View style={s.divider} />
          <View style={s.trendRow}>
            <Ionicons name="trending-up" size={16} color={Colors.success} />
            <Text style={s.trendText}>12% increase from last month</Text>
          </View>
        </View>

        {/* Filters */}
        <View style={s.filterRow}>
          {['All', 'Income', 'Pending', 'Withdrawals'].map((f) => (
            <TouchableOpacity 
              key={f} 
              style={[s.filterChip, activeFilter === f && s.filterActive]}
              onPress={() => setActiveFilter(f)}
            >
              <Text style={[s.filterText, activeFilter === f && s.filterTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Transaction History */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Transaction History</Text>
          <Text style={s.sectionSub}>Showing {filteredTransactions.length} items</Text>
        </View>

        {filteredTransactions.map((tx) => (
          <View key={tx.id} style={s.txItem}>
            <View style={s.txDateRow}>
              <Text style={s.txLabel}>DATE</Text>
              <Text style={s.txDate}>{tx.date}</Text>
            </View>
            <View style={s.txMain}>
              <View style={s.txIconBox}>
                <Ionicons name={tx.icon as any} size={20} color={Colors.primary[600]} />
              </View>
              <View style={s.txInfo}>
                <Text style={s.txTitle}>{tx.title}</Text>
                <Text style={s.txSub}>Contract #88291</Text>
              </View>
            </View>
            <View style={s.txFooter}>
              <View style={[s.statusBadge, tx.status === 'PENDING' && s.statusPending]}>
                <Text style={[s.statusText, tx.status === 'PENDING' && s.statusTextPending]}>{tx.status}</Text>
              </View>
              <View style={s.txAmountRow}>
                <Text style={s.txLabel}>AMOUNT</Text>
                <Text style={s.txAmount}>${tx.amount.toLocaleString()}</Text>
              </View>
            </View>
          </View>
        ))}

        {/* Pagination */}
        <View style={s.pagination}>
          <TouchableOpacity 
            onPress={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            <Text style={[s.pageLink, currentPage === 1 && { opacity: 0.5 }]}>Previous</Text>
          </TouchableOpacity>
          <View style={s.pageNums}>
            {[1, 2, 3].map(p => (
              <TouchableOpacity 
                key={p} 
                style={[s.pageItem, currentPage === p && s.pageActive]}
                onPress={() => setCurrentPage(p)}
              >
                <Text style={[s.pageNum, currentPage === p && s.pageActiveText]}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity 
            onPress={() => setCurrentPage(prev => Math.min(3, prev + 1))}
            disabled={currentPage === 3}
          >
            <Text style={[s.pageLink, currentPage === 3 && { opacity: 0.5 }]}>Next</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.neutral[50] },
  header: { 
    backgroundColor: Colors.neutral[50], 
    paddingHorizontal: 16, 
    paddingBottom: 20,
  },
  navRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  navTitle: { color: Colors.neutral[900], fontSize: 18, fontWeight: '700' },
  
  balanceCard: {
    backgroundColor: Colors.primary[900],
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    ...Shadows.sm,
  },
  balanceLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  balanceValue: { color: Colors.white, fontSize: 36, fontWeight: '800', marginBottom: 20, marginTop: 12 },
  withdrawBtn: { 
    backgroundColor: Colors.success, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 14, 
    borderRadius: 12,
    gap: 8,
  },
  withdrawBtnText: { color: Colors.white, fontWeight: '700', fontSize: 15 },

  content: { paddingHorizontal: 16, marginTop: 0 },
  summaryCard: { 
    backgroundColor: Colors.white, 
    borderRadius: 24, 
    padding: 20, 
    borderWidth: 1, 
    borderColor: Colors.neutral[100],
    ...Shadows.sm,
    marginBottom: 24,
  },
  summaryTitle: { fontSize: 12, color: Colors.neutral[400], fontWeight: '700', marginBottom: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { fontSize: 14, color: Colors.neutral[500] },
  summaryVal: { fontSize: 16, fontWeight: '700' },
  divider: { height: 1, backgroundColor: Colors.neutral[50], marginVertical: 16 },
  trendRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  trendText: { fontSize: 13, color: Colors.success, fontWeight: '600' },

  filterRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.neutral[200] },
  filterActive: { backgroundColor: Colors.primary[900], borderColor: Colors.primary[900] },
  filterText: { fontSize: 13, fontWeight: '600', color: Colors.neutral[600] },
  filterTextActive: { color: Colors.white },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: Colors.neutral[900] },
  sectionSub: { fontSize: 12, color: Colors.neutral[400] },

  txItem: { 
    backgroundColor: Colors.white, 
    borderRadius: 20, 
    padding: 16, 
    marginBottom: 12, 
    borderWidth: 1, 
    borderColor: Colors.neutral[100] 
  },
  txDateRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  txLabel: { fontSize: 10, fontWeight: '700', color: Colors.neutral[300], letterSpacing: 0.5 },
  txDate: { fontSize: 12, color: Colors.neutral[500], fontWeight: '500' },
  txMain: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  txIconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: Colors.primary[50], alignItems: 'center', justifyContent: 'center' },
  txInfo: { flex: 1 },
  txTitle: { fontSize: 15, fontWeight: '700', color: Colors.neutral[900] },
  txSub: { fontSize: 12, color: Colors.neutral[400], marginTop: 2 },
  txFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', borderTopWidth: 1, borderTopColor: Colors.neutral[50], paddingTop: 12 },
  statusBadge: { backgroundColor: Colors.success + '15', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusPending: { backgroundColor: Colors.warning + '15' },
  statusText: { fontSize: 10, fontWeight: '800', color: Colors.success },
  statusTextPending: { color: Colors.warning },
  txAmountRow: { alignItems: 'flex-end' },
  txAmount: { fontSize: 16, fontWeight: '800', color: Colors.neutral[900], marginTop: 2 },

  pagination: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 },
  pageLink: { fontSize: 14, color: Colors.neutral[400], fontWeight: '600' },
  pageNums: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  pageItem: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  pageActive: { backgroundColor: Colors.primary[900] },
  pageActiveText: { color: Colors.white, fontWeight: '700' },
  pageNum: { color: Colors.neutral[500], fontWeight: '600' },
});
