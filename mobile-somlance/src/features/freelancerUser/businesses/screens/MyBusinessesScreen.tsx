import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/theme';
import { useRouter } from 'expo-router';
import apiClient from '@/api/client';

export default function MyBusinessesScreen() {
  const router = useRouter();
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBusinessHub();
  }, []);

  const fetchBusinessHub = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/freelancers/me/business-hub');
      if (res.data.success) {
        setBusinesses(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch business hub', err);
    } finally {
      setLoading(false);
    }
  };

  const renderBusinessCard = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity 
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => router.push({
          pathname: '/business-details',
          params: { id: item.business.id, data: JSON.stringify(item) }
        } as any)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.businessAvatar}>
            <Text style={styles.avatarText}>{item.business.companyName?.charAt(0) || 'B'}</Text>
          </View>
          <View style={styles.businessInfo}>
            <Text style={styles.companyName}>{item.business.companyName}</Text>
            <Text style={styles.industry}>{item.business.industry || 'Business'}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.neutral[400]} />
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Total Earned</Text>
            <Text style={styles.statValue}>${item.stats.totalEarned.toLocaleString()}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Pending</Text>
            <Text style={styles.statValue}>${item.stats.pendingPayroll.toLocaleString()}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Active Projects</Text>
            <Text style={styles.statValue}>{item.stats.activeProjects}</Text>
          </View>
        </View>

        {item.contract && (
          <View style={styles.contractBadge}>
            <Ionicons name="checkmark-circle" size={14} color={Colors.primary[600]} />
            <Text style={styles.contractText}>Active Monthly Contract</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.neutral[800]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Businesses</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary[600]} />
        </View>
      ) : businesses.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="business-outline" size={64} color={Colors.neutral[300]} />
          <Text style={styles.emptyText}>You are not currently contracted with any businesses.</Text>
        </View>
      ) : (
        <FlatList
          data={businesses}
          keyExtractor={(item) => item.business.id}
          renderItem={renderBusinessCard}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.neutral[50] },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16, backgroundColor: Colors.white,
    borderBottomWidth: 1, borderBottomColor: Colors.neutral[200]
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.neutral[900] },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { marginTop: 16, fontSize: 16, color: Colors.neutral[500], textAlign: 'center' },
  listContainer: { padding: 20 },
  card: {
    backgroundColor: Colors.white, borderRadius: 16, padding: 20, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05,
    shadowRadius: 8, elevation: 2, borderWidth: 1, borderColor: Colors.neutral[100]
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  businessAvatar: {
    width: 48, height: 48, borderRadius: 12, backgroundColor: Colors.primary[100],
    justifyContent: 'center', alignItems: 'center', marginRight: 16
  },
  avatarText: { fontSize: 20, fontWeight: '700', color: Colors.primary[700] },
  businessInfo: { flex: 1 },
  companyName: { fontSize: 16, fontWeight: '700', color: Colors.neutral[900] },
  industry: { fontSize: 13, color: Colors.neutral[500], marginTop: 2 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: Colors.neutral[100], paddingTop: 16 },
  statBox: { flex: 1, alignItems: 'center' },
  statLabel: { fontSize: 11, color: Colors.neutral[500], textTransform: 'uppercase', fontWeight: '600', marginBottom: 4 },
  statValue: { fontSize: 16, fontWeight: '700', color: Colors.neutral[900] },
  contractBadge: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primary[50],
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, alignSelf: 'flex-start', marginTop: 16
  },
  contractText: { fontSize: 12, fontWeight: '600', color: Colors.primary[700], marginLeft: 6 }
});
