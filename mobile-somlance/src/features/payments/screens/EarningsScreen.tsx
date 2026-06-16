import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Shadows } from '@/theme';
import { Button } from '@/components/ui/Button';

const TXS = [
  { id: '1', title: 'Website Redesign', amount: 350, type: 'earned', date: 'May 10, 2024' },
  { id: '2', title: 'Logo Design', amount: 150, type: 'earned', date: 'May 8, 2024' },
  { id: '3', title: 'Withdrawal to Zaad', amount: -200, type: 'withdrawn', date: 'May 5, 2024' },
  { id: '4', title: 'App UI Design', amount: 500, type: 'earned', date: 'May 1, 2024' },
];

export default function EarningsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const StatItem = ({ 
    label, 
    value, 
    trend,
    onPress 
  }: { 
    label: string; 
    value: string; 
    trend?: string;
    onPress?: () => void;
  }) => (
    <TouchableOpacity 
      style={s.statItem} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View>
        <Text style={s.statItemLabel}>{label}</Text>
        <Text style={s.statItemValue}>{value}</Text>
        {trend && (
          <View style={s.trendRow}>
            <Ionicons name="caret-up" size={12} color={Colors.success} />
            <Text style={s.trendText}>{trend}</Text>
          </View>
        )}
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.neutral[300]} />
    </TouchableOpacity>
  );

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      
      {/* Navigation */}
      <View style={s.nav}>
        <TouchableOpacity onPress={() => router.back()} style={s.back}>
          <Ionicons name="chevron-back" size={24} color={Colors.neutral[900]} />
        </TouchableOpacity>
        <Text style={s.navTitle}>Earnings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
      >
        {/* Available Balance Card */}
        <View style={s.balanceCard}>
          <View>
            <Text style={s.balanceLabel}>Available Balance</Text>
            <Text style={s.balanceValue}>$1,245.50</Text>
          </View>
          <TouchableOpacity 
            style={s.withdrawBtn}
            onPress={() => router.push('/withdraw')}
          >
            <Text style={s.withdrawBtnText}>Withdraw</Text>
          </TouchableOpacity>
        </View>

        {/* Monthly Performance */}
        <View style={s.statsGrid}>
          <View style={s.miniCard}>
            <Text style={s.miniLabel}>This Month</Text>
            <Text style={s.miniValue}>$2,450.00</Text>
            <View style={s.trendRow}>
              <Ionicons name="caret-up" size={12} color={Colors.success} />
              <Text style={s.trendText}>18.4%</Text>
            </View>
          </View>
          <View style={s.miniCard}>
            <Text style={s.miniLabel}>Last Month</Text>
            <Text style={s.miniValue}>$2,070.00</Text>
          </View>
        </View>

        {/* Career Stats */}
        <View style={s.statsList}>
          <StatItem 
            label="Total Earnings" 
            value="$12,540.00" 
            onPress={() => router.push('/earnings/history')}
          />
          <StatItem 
            label="Completed Jobs" 
            value="68" 
            onPress={() => router.push('/earnings/completed-jobs')}
          />
          <StatItem 
            label="Pending (Escrow)" 
            value="$300.00" 
            onPress={() => router.push('/earnings/escrow')}
          />
          <StatItem 
            label="Average Rating" 
            value="4.9" 
            onPress={() => router.push('/reviews')}
          />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.neutral[50] },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16 },
  nav: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 16, 
    paddingVertical: 12,
    backgroundColor: Colors.white,
  },
  back: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: Colors.neutral[50], 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  navTitle: { fontSize: 18, fontWeight: '700', color: Colors.neutral[900] },
  
  balanceCard: { 
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24, 
    backgroundColor: Colors.white, 
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.neutral[100],
    ...Shadows.sm,
    marginBottom: 20,
  },
  balanceLabel: { fontSize: 14, color: Colors.neutral[500], fontWeight: '500' },
  balanceValue: { fontSize: 28, fontWeight: '800', color: Colors.neutral[900], marginTop: 4 },
  withdrawBtn: {
    backgroundColor: Colors.primary[900],
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  withdrawBtnText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },

  statsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  miniCard: {
    flex: 1,
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.neutral[100],
    ...Shadows.sm,
  },
  miniLabel: {
    fontSize: 13,
    color: Colors.neutral[500],
    fontWeight: '500',
    marginBottom: 10,
  },
  miniValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.neutral[900],
    marginBottom: 4,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.success,
  },

  statsList: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.neutral[100],
    ...Shadows.sm,
    overflow: 'hidden',
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[50],
  },
  statItemLabel: {
    fontSize: 14,
    color: Colors.neutral[500],
    fontWeight: '500',
    marginBottom: 8,
  },
  statItemValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.neutral[900],
  },
});
