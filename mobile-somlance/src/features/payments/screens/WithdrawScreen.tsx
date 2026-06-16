import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/theme';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function WithdrawScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'zaad' | 'edahab'>('zaad');
  const [loading, setLoading] = useState(false);

  const handleWithdraw = () => {
    if (!amount || parseFloat(amount) <= 0) { Alert.alert('Error', 'Please enter a valid amount'); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); Alert.alert('Success', `$${amount} withdrawal initiated.`, [{ text: 'OK', onPress: () => router.back() }]); }, 2000);
  };

  return (
    <View style={[s.c, { paddingTop: insets.top }]}><StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <View style={s.nav}><TouchableOpacity onPress={() => router.back()} style={s.back}><Ionicons name="chevron-back" size={24} color={Colors.neutral[900]} /></TouchableOpacity><Text style={s.navTitle}>Withdraw Funds</Text><View style={{ width: 40 }} /></View>
      <View style={s.content}>
        <View style={s.balanceBox}><Text style={s.balLabel}>Available Balance</Text><Text style={s.balVal}>$1,245.50</Text></View>
        <Input label="Amount" placeholder="Enter amount" leftIcon="cash-outline" keyboardType="numeric" value={amount} onChangeText={setAmount} />
        <Text style={s.methodLabel}>Send to</Text>
        <TouchableOpacity style={[s.mCard, method === 'zaad' && s.mActive]} onPress={() => setMethod('zaad')}><View style={[s.radio, method === 'zaad' && s.radioA]}>{method === 'zaad' && <View style={s.radioIn} />}</View><Text style={s.mName}>Zaad</Text></TouchableOpacity>
        <TouchableOpacity style={[s.mCard, method === 'edahab' && s.mActive]} onPress={() => setMethod('edahab')}><View style={[s.radio, method === 'edahab' && s.radioA]}>{method === 'edahab' && <View style={s.radioIn} />}</View><Text style={s.mName}>Edahab</Text></TouchableOpacity>
        <Button title="Withdraw Now" onPress={handleWithdraw} loading={loading} size="lg" style={{ marginTop: 24 }} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: Colors.white },
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.neutral[100] },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.neutral[50], justifyContent: 'center', alignItems: 'center' },
  navTitle: { fontSize: 18, fontWeight: '600', color: Colors.neutral[900] },
  content: { padding: 20 },
  balanceBox: { alignItems: 'center', padding: 20, backgroundColor: Colors.neutral[50], borderRadius: 14, marginBottom: 24 },
  balLabel: { fontSize: 14, color: Colors.neutral[500] },
  balVal: { fontSize: 28, fontWeight: '800', color: Colors.neutral[900], marginTop: 4 },
  methodLabel: { fontSize: 16, fontWeight: '600', color: Colors.neutral[800], marginBottom: 12, marginTop: 8 },
  mCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 14, borderWidth: 1.5, borderColor: Colors.neutral[200], marginBottom: 10, gap: 14 },
  mActive: { borderColor: Colors.primary[600], backgroundColor: Colors.primary[50] + '40' },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: Colors.neutral[300], justifyContent: 'center', alignItems: 'center' },
  radioA: { borderColor: Colors.primary[600] },
  radioIn: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.primary[600] },
  mName: { fontSize: 16, fontWeight: '600', color: Colors.neutral[900] },
});
