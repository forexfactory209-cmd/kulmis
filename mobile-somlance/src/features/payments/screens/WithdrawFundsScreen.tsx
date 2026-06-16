import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  TextInput,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadows } from '@/theme';
import { Button } from '@/components/ui/Button';

export default function WithdrawFundsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [selectedMethod, setSelectedMethod] = useState<'ZAAD' | 'EDAHAB'>('ZAAD');
  const [amount, setAmount] = useState('500');
  const [isSuccess, setIsSuccess] = useState(false);

  // Wednesday logic
  const today = new Date().getDay();
  const isWednesday = today === 3;
  // For demonstration purposes, I'll allow it but show a notice if it's not Wednesday
  // In a real app, you might disable the button.
  
  const handleWithdraw = () => {
    if (!isWednesday) {
      // You could show an alert here, but I'll proceed for demo and show success
    }
    setIsSuccess(true);
  };

  const SuccessScreen = () => (
    <View style={s.successContainer}>
      <View style={s.successIconBox}>
        <Ionicons name="checkmark-circle" size={80} color={Colors.success} />
      </View>
      <Text style={s.successTitle}>Withdrawal Successful!</Text>
      <Text style={s.successSub}>Your funds are being processed and will arrive in your wallet shortly.</Text>
      
      <View style={s.receipt}>
        <View style={s.receiptRow}>
          <Text style={s.receiptLabel}>Method</Text>
          <Text style={s.receiptVal}>{selectedMethod === 'ZAAD' ? 'Zaad' : 'E-Dahab'}</Text>
        </View>
        <View style={s.receiptRow}>
          <Text style={s.receiptLabel}>Amount</Text>
          <Text style={s.receiptVal}>${amount}.00</Text>
        </View>
        <View style={s.receiptRow}>
          <Text style={s.receiptLabel}>Transaction Fee</Text>
          <Text style={s.receiptVal}>$2.00</Text>
        </View>
        <View style={[s.receiptRow, s.receiptTotal]}>
          <Text style={s.receiptTotalLabel}>Total Withdrawn</Text>
          <Text style={s.receiptTotalVal}>${parseInt(amount) + 2}.00</Text>
        </View>
      </View>

      <Button 
        title="Back to Earnings" 
        onPress={() => router.back()} 
        style={s.backToBtn}
      />
    </View>
  );

  if (isSuccess) return <SuccessScreen />;

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      
      <View style={s.nav}>
        <TouchableOpacity onPress={() => router.back()} style={s.back}>
          <Ionicons name="chevron-back" size={24} color={Colors.neutral[900]} />
        </TouchableOpacity>
        <Text style={s.navTitle}>Withdraw Funds</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
        {/* Balance */}
        <View style={s.balanceCard}>
          <Text style={s.balanceLabel}>Available Balance</Text>
          <Text style={s.balanceValue}>$1,245.50</Text>
        </View>

        {/* Notice */}
        {!isWednesday && (
          <View style={s.notice}>
            <Ionicons name="information-circle" size={20} color="#F59E0B" />
            <Text style={s.noticeText}>Payday is every Wednesday. You can still initiate a request today.</Text>
          </View>
        )}

        <Text style={s.sectionTitle}>Select Method</Text>
        <TouchableOpacity 
          style={[s.methodCard, selectedMethod === 'ZAAD' && s.methodActive]}
          onPress={() => setSelectedMethod('ZAAD')}
        >
          <View style={s.methodInfo}>
            <View style={s.methodIconBox}>
              <Ionicons name="phone-portrait-outline" size={20} color={Colors.primary[900]} />
            </View>
            <View>
              <Text style={s.methodName}>Zaad</Text>
              <Text style={s.methodSub}>*** 1234</Text>
            </View>
          </View>
          <View style={[s.radio, selectedMethod === 'ZAAD' && s.radioActive]}>
            {selectedMethod === 'ZAAD' && <View style={s.radioInner} />}
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[s.methodCard, selectedMethod === 'EDAHAB' && s.methodActive]}
          onPress={() => setSelectedMethod('EDAHAB')}
        >
          <View style={s.methodInfo}>
            <View style={s.methodIconBox}>
              <Ionicons name="wallet-outline" size={20} color={Colors.primary[900]} />
            </View>
            <View>
              <Text style={s.methodName}>E-Dahab</Text>
              <Text style={s.methodSub}>*** 5678</Text>
            </View>
          </View>
          <View style={[s.radio, selectedMethod === 'EDAHAB' && s.radioActive]}>
            {selectedMethod === 'EDAHAB' && <View style={s.radioInner} />}
          </View>
        </TouchableOpacity>

        <Text style={s.sectionTitle}>Amount</Text>
        <View style={s.inputContainer}>
          <Text style={s.currency}>$</Text>
          <TextInput 
            style={s.input}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />
          <Ionicons name="chevron-down" size={20} color={Colors.neutral[400]} />
        </View>
        <Text style={s.minText}>Min. withdrawal $10</Text>

        <View style={s.summary}>
          <View style={s.summaryRow}>
            <Text style={s.summaryLabel}>You will receive</Text>
            <Text style={s.summaryVal}>${amount}.00</Text>
          </View>
          <View style={s.summaryRow}>
            <Text style={s.summaryLabel}>Withdraw Fee</Text>
            <Text style={s.summaryVal}>$2.00</Text>
          </View>
          <View style={s.summaryDivider} />
          <View style={s.summaryRow}>
            <Text style={s.summaryTotalLabel}>Total</Text>
            <Text style={s.summaryTotalVal}>${parseInt(amount || '0') + 2}.00</Text>
          </View>
        </View>

        <Button 
          title="Withdraw Now" 
          onPress={handleWithdraw}
          style={s.withdrawNowBtn}
        />
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16 },
  nav: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 16, 
    paddingVertical: 12,
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
    padding: 20, 
    backgroundColor: Colors.neutral[50], 
    borderRadius: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.neutral[100],
  },
  balanceLabel: { fontSize: 14, color: Colors.neutral[500], fontWeight: '500' },
  balanceValue: { fontSize: 28, fontWeight: '800', color: Colors.neutral[900], marginTop: 4 },

  notice: {
    flexDirection: 'row',
    backgroundColor: '#FFFBEB',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  noticeText: {
    flex: 1,
    fontSize: 13,
    color: '#92400E',
    fontWeight: '500',
    lineHeight: 18,
  },

  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.neutral[900], marginBottom: 16 },
  
  methodCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.neutral[100],
    marginBottom: 12,
  },
  methodActive: {
    borderColor: Colors.primary[900],
    backgroundColor: Colors.primary[50] + '30',
  },
  methodInfo: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  methodIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.neutral[100],
  },
  methodName: { fontSize: 15, fontWeight: '700', color: Colors.neutral[900] },
  methodSub: { fontSize: 12, color: Colors.neutral[400], marginTop: 2 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.neutral[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioActive: { borderColor: Colors.primary[900] },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.primary[900] },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral[50],
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: Colors.neutral[100],
  },
  currency: { fontSize: 18, fontWeight: '700', color: Colors.neutral[900], marginRight: 8 },
  input: { flex: 1, fontSize: 18, fontWeight: '700', color: Colors.neutral[900] },
  minText: { fontSize: 12, color: Colors.neutral[400], marginTop: 8, marginBottom: 24 },

  summary: { marginTop: 8, marginBottom: 32 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  summaryLabel: { fontSize: 14, color: Colors.neutral[500], fontWeight: '500' },
  summaryVal: { fontSize: 15, fontWeight: '700', color: Colors.neutral[900] },
  summaryDivider: { height: 1, backgroundColor: Colors.neutral[100], marginVertical: 12 },
  summaryTotalLabel: { fontSize: 16, fontWeight: '700', color: Colors.neutral[900] },
  summaryTotalVal: { fontSize: 18, fontWeight: '800', color: Colors.primary[900] },

  withdrawNowBtn: { backgroundColor: Colors.primary[900], height: 56, borderRadius: 16 },

  successContainer: { flex: 1, backgroundColor: Colors.white, justifyContent: 'center', alignItems: 'center', padding: 24 },
  successIconBox: { width: 120, height: 120, borderRadius: 60, backgroundColor: Colors.success + '15', justifyContent: 'center', alignItems: 'center', marginBottom: 32 },
  successTitle: { fontSize: 24, fontWeight: '800', color: Colors.neutral[900], marginBottom: 12, textAlign: 'center' },
  successSub: { fontSize: 15, color: Colors.neutral[500], textAlign: 'center', lineHeight: 24, marginBottom: 40 },
  receipt: { width: '100%', backgroundColor: Colors.neutral[50], borderRadius: 24, padding: 24, marginBottom: 40 },
  receiptRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  receiptLabel: { fontSize: 14, color: Colors.neutral[500] },
  receiptVal: { fontSize: 15, fontWeight: '700', color: Colors.neutral[900] },
  receiptTotal: { borderTopWidth: 1, borderTopColor: Colors.neutral[200], paddingTop: 16, marginTop: 4 },
  receiptTotalLabel: { fontSize: 16, fontWeight: '800', color: Colors.neutral[900] },
  receiptTotalVal: { fontSize: 18, fontWeight: '800', color: Colors.primary[900] },
  backToBtn: { width: '100%', borderRadius: 16 },
});
