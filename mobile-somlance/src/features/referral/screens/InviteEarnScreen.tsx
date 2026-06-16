import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Share, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/theme';
import { useDarkColors } from '@/store/themeStore';
import { Button } from '@/components/ui/Button';

export default function InviteEarnScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { bg, textPrimary, textSecondary, textMuted, border, cardBg, isDark } = useDarkColors();
  const handleShare = async () => {
    try { await Share.share({ message: 'Join Kulmis!\nhttps://Kulmis.com/invite' }); }
    catch (e) { Alert.alert('Error', 'Unable to share'); }
  };

  return (
    <View style={[s.c, { paddingTop: insets.top, backgroundColor: bg }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={bg} />
      <View style={[s.nav, { borderBottomColor: border }]}>
        <TouchableOpacity onPress={() => router.back()} style={[s.back, { backgroundColor: cardBg }]}><Ionicons name="chevron-back" size={24} color={textPrimary} /></TouchableOpacity>
        <Text style={[s.navTitle, { color: textPrimary }]}>Invite & Earn</Text><View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={s.content}>
        <View style={[s.hero, { backgroundColor: isDark ? '#1E293B' : Colors.primary[50] }]}><Ionicons name="gift" size={56} color={Colors.primary[600]} /><Text style={[s.heroT, { color: textPrimary }]}>Invite & Earn</Text><Text style={[s.heroD, { color: textSecondary }]}>Share Kulmis with friends!</Text></View>
        <Text style={[s.st, { color: textPrimary }]}>How it works</Text>
        <View style={s.steps}>
          <View style={s.step}><View style={s.sn}><Text style={s.snt}>1</Text></View><Text style={[s.sl, { color: textSecondary }]}>Share link</Text></View>
          <View style={s.line} />
          <View style={s.step}><View style={s.sn}><Text style={s.snt}>2</Text></View><Text style={[s.sl, { color: textSecondary }]}>Friend signs up</Text></View>
          <View style={s.line} />
          <View style={s.step}><View style={s.sn}><Text style={s.snt}>3</Text></View><Text style={[s.sl, { color: textSecondary }]}>You get paid!</Text></View>
        </View>
        <View style={[s.code, { backgroundColor: cardBg, borderColor: border }]}><Text style={[s.cl, { color: textMuted }]}>Your Referral Code</Text><Text style={s.cv}>Kulmis2024</Text></View>
        <Button title="Share Invite Link" onPress={handleShare} size="lg" style={{ marginTop: 20 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: Colors.white },
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.neutral[100] },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.neutral[50], justifyContent: 'center', alignItems: 'center' },
  navTitle: { fontSize: 18, fontWeight: '600', color: Colors.neutral[900] },
  content: { padding: 20, paddingBottom: 40 },
  hero: { alignItems: 'center', padding: 28, backgroundColor: Colors.primary[50], borderRadius: 20, marginBottom: 24 },
  heroT: { fontSize: 24, fontWeight: '800', color: Colors.neutral[900], marginTop: 12 },
  heroD: { fontSize: 14, color: Colors.neutral[500], marginTop: 6 },
  st: { fontSize: 18, fontWeight: '700', color: Colors.neutral[900], marginBottom: 16 },
  steps: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 28 },
  step: { alignItems: 'center', width: 80 },
  sn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primary[700], justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  snt: { fontSize: 16, fontWeight: '700', color: Colors.white },
  sl: { fontSize: 12, color: Colors.neutral[600], textAlign: 'center', fontWeight: '500' },
  line: { width: 30, height: 2, backgroundColor: Colors.primary[200], marginBottom: 20 },
  code: { alignItems: 'center', padding: 20, backgroundColor: Colors.neutral[50], borderRadius: 14, borderWidth: 1, borderColor: Colors.neutral[200], borderStyle: 'dashed' },
  cl: { fontSize: 13, color: Colors.neutral[500] },
  cv: { fontSize: 24, fontWeight: '800', color: Colors.primary[700], marginTop: 4, letterSpacing: 2 },
});
