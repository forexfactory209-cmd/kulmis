import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/theme';
import { Button } from '@/components/ui/Button';

const FEATURES = [
  { icon: 'star', label: 'Priority in Search Results' },
  { icon: 'shield-checkmark', label: 'Verified Pro Badge' },
  { icon: 'analytics', label: 'Advanced Analytics' },
  { icon: 'cash', label: 'Lower Commission Fees' },
  { icon: 'people', label: 'Priority Support' },
  { icon: 'ribbon', label: 'Exclusive Projects' },
];

export default function BecomeProScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <View style={s.nav}>
        <TouchableOpacity onPress={() => router.back()} style={s.back}><Ionicons name="chevron-back" size={24} color={Colors.neutral[900]} /></TouchableOpacity>
        <Text style={s.navTitle}>Become a Pro</Text><View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={s.content}>
        <View style={s.heroCard}>
          <View style={s.crownCircle}><Ionicons name="trophy" size={36} color="#F59E0B" /></View>
          <Text style={s.heroTitle}>Kulmis Pro</Text>
          <Text style={s.heroDesc}>Unlock premium features and stand out</Text>
        </View>
        <View style={s.priceCard}>
          <Text style={s.priceLabel}>Monthly</Text>
          <View style={s.priceRow}><Text style={s.priceCurrency}>$</Text><Text style={s.priceVal}>9</Text><Text style={s.priceCents}>.99</Text><Text style={s.priceUnit}>/month</Text></View>
        </View>
        <Text style={s.sectionTitle}>What you get</Text>
        {FEATURES.map((f, i) => (
          <View key={i} style={s.featureRow}>
            <View style={s.featureIcon}><Ionicons name={f.icon as any} size={20} color={Colors.primary[600]} /></View>
            <Text style={s.featureLabel}>{f.label}</Text>
            <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
          </View>
        ))}
        <Button title="Upgrade to Pro" onPress={() => Alert.alert('Coming Soon', 'Premium subscriptions will be available soon!')} size="lg" style={{ marginTop: 24 }} />
        <Text style={s.terms}>Cancel anytime. No hidden fees.</Text>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.neutral[100] },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.neutral[50], justifyContent: 'center', alignItems: 'center' },
  navTitle: { fontSize: 18, fontWeight: '600', color: Colors.neutral[900] },
  content: { padding: 20, paddingBottom: 40 },
  heroCard: { alignItems: 'center', padding: 28, backgroundColor: Colors.primary[50], borderRadius: 20, marginBottom: 20 },
  crownCircle: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#FEF3C7', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  heroTitle: { fontSize: 24, fontWeight: '800', color: Colors.neutral[900] },
  heroDesc: { fontSize: 14, color: Colors.neutral[500], textAlign: 'center', marginTop: 6 },
  priceCard: { alignItems: 'center', padding: 20, backgroundColor: Colors.primary[700], borderRadius: 16, marginBottom: 24 },
  priceLabel: { fontSize: 14, color: Colors.primary[200] },
  priceRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 4 },
  priceCurrency: { fontSize: 20, fontWeight: '700', color: Colors.white, marginTop: 8 },
  priceVal: { fontSize: 48, fontWeight: '800', color: Colors.white },
  priceCents: { fontSize: 20, fontWeight: '700', color: Colors.white, marginTop: 8 },
  priceUnit: { fontSize: 14, color: Colors.primary[200], marginTop: 28, marginLeft: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.neutral[900], marginBottom: 16 },
  featureRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.neutral[50] },
  featureIcon: { width: 38, height: 38, borderRadius: 10, backgroundColor: Colors.primary[50], justifyContent: 'center', alignItems: 'center' },
  featureLabel: { flex: 1, fontSize: 15, fontWeight: '500', color: Colors.neutral[800], marginLeft: 14 },
  terms: { textAlign: 'center', fontSize: 13, color: Colors.neutral[400], marginTop: 12 },
});
