import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/theme';
import { Button } from '@/components/ui/Button';
import { createProject } from '@/api/projects';

export default function SecurePaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    title?: string;
    description?: string;
    budget?: string;
    category?: string;
    freelancerId?: string;
  }>();
  
  const insets = useSafeAreaInsets();
  const [method, setMethod] = useState<'zaad' | 'edahab'>('zaad');
  const [loading, setLoading] = useState(false);

  const displayBudget = params.budget ? parseFloat(params.budget).toFixed(2) : '250.00';

  const handlePay = async () => {
    setLoading(true);
    try {
      if (params.title && params.description && params.budget) {
        await createProject({
          title: params.title,
          description: params.description,
          budget: parseFloat(params.budget),
          category: params.category || 'Development',
          freelancerId: params.freelancerId || undefined,
        });
      }
      setLoading(false);
      router.replace('/hire-success');
    } catch (e: any) {
      setLoading(false);
      console.log('Failed to pay & create project', e);
      Alert.alert('Payment Failed', e.response?.data?.error?.message || 'Something went wrong during payment escrow funding.');
    }
  };

  return (
    <View style={[s.c, { paddingTop: insets.top }]}><StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <View style={s.nav}>
        <TouchableOpacity onPress={() => router.back()} style={s.back}><Ionicons name="chevron-back" size={24} color={Colors.neutral[900]} /></TouchableOpacity>
        <Text style={s.navTitle}>Secure Payment</Text><View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={s.content}>
        <View style={s.escrowCard}><Ionicons name="shield-checkmark" size={40} color={Colors.primary[600]} /><Text style={s.escrowTitle}>Safe & Secure Escrow</Text><Text style={s.escrowDesc}>Your payment is held securely by Kulmis. It will be released only after you approve the work.</Text></View>
        <View style={s.amountRow}><Text style={s.amountLabel}>Project Amount</Text><Text style={s.amountValue}>${displayBudget}</Text></View>
        <Text style={s.sectionTitle}>Payment Method</Text>
        <TouchableOpacity style={[s.methodCard, method === 'zaad' && s.methodActive]} onPress={() => setMethod('zaad')}>
          <View style={s.methodLeft}><View style={[s.radioOuter, method === 'zaad' && s.radioOuterActive]}>{method === 'zaad' && <View style={s.radioInner} />}</View><View><Text style={s.methodName}>Zaad</Text><Text style={s.methodDesc}>Mobile Money</Text></View></View>
          <Ionicons name="phone-portrait-outline" size={24} color={Colors.primary[600]} />
        </TouchableOpacity>
        <TouchableOpacity style={[s.methodCard, method === 'edahab' && s.methodActive]} onPress={() => setMethod('edahab')}>
          <View style={s.methodLeft}><View style={[s.radioOuter, method === 'edahab' && s.radioOuterActive]}>{method === 'edahab' && <View style={s.radioInner} />}</View><View><Text style={s.methodName}>Edahab</Text><Text style={s.methodDesc}>Mobile Money</Text></View></View>
          <Ionicons name="phone-portrait-outline" size={24} color={Colors.primary[600]} />
        </TouchableOpacity>
        <Button title="Continue to Pay" onPress={handlePay} loading={loading} size="lg" style={{ marginTop: 24 }} />
        <Text style={s.secureTxt}>🔒 Your payment is 100% secure</Text>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: Colors.white },
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.neutral[100] },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.neutral[50], justifyContent: 'center', alignItems: 'center' },
  navTitle: { fontSize: 18, fontWeight: '600', color: Colors.neutral[900] },
  content: { padding: 20 },
  escrowCard: { alignItems: 'center', padding: 24, backgroundColor: Colors.primary[50], borderRadius: 16, marginBottom: 24 },
  escrowTitle: { fontSize: 18, fontWeight: '700', color: Colors.neutral[900], marginTop: 12 },
  escrowDesc: { fontSize: 14, color: Colors.neutral[500], textAlign: 'center', marginTop: 8, lineHeight: 20 },
  amountRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: Colors.neutral[100], marginBottom: 24 },
  amountLabel: { fontSize: 16, color: Colors.neutral[600] },
  amountValue: { fontSize: 24, fontWeight: '800', color: Colors.neutral[900] },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: Colors.neutral[800], marginBottom: 12 },
  methodCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 14, borderWidth: 1.5, borderColor: Colors.neutral[200], marginBottom: 12 },
  methodActive: { borderColor: Colors.primary[600], backgroundColor: Colors.primary[50] + '40' },
  methodLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  radioOuter: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: Colors.neutral[300], justifyContent: 'center', alignItems: 'center' },
  radioOuterActive: { borderColor: Colors.primary[600] },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.primary[600] },
  methodName: { fontSize: 16, fontWeight: '600', color: Colors.neutral[900] },
  methodDesc: { fontSize: 13, color: Colors.neutral[500], marginTop: 1 },
  secureTxt: { textAlign: 'center', fontSize: 13, color: Colors.neutral[400], marginTop: 16 },
});
