import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/theme';
import { useDarkColors } from '@/store/themeStore';

export default function TermsOfServiceScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark, bg, textPrimary, textSecondary, border, statusBar } = useDarkColors();
  const iconBg = isDark ? '#334155' : Colors.neutral[50];

  return (
    <View style={[s.container, { paddingTop: insets.top, backgroundColor: bg }]}>
      <StatusBar barStyle={statusBar} backgroundColor={bg} />
      <View style={[s.nav, { borderBottomColor: border }]}>
        <TouchableOpacity onPress={() => router.back()} style={[s.back, { backgroundColor: iconBg }]}>
          <Ionicons name="chevron-back" size={24} color={textPrimary} />
        </TouchableOpacity>
        <Text style={[s.navTitle, { color: textPrimary }]}>Terms of Service</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={s.content}>
        <Text style={[s.title, { color: textPrimary }]}>Terms and Conditions</Text>
        <Text style={[s.date, { color: textSecondary }]}>Last updated: May 2026</Text>
        
        <Text style={[s.heading, { color: textPrimary }]}>1. Acceptance of Terms</Text>
        <Text style={[s.paragraph, { color: textSecondary }]}>
          By accessing and using Kulmis, you accept and agree to be bound by the terms and provision of this agreement.
        </Text>

        <Text style={[s.heading, { color: textPrimary }]}>2. User Accounts</Text>
        <Text style={[s.paragraph, { color: textSecondary }]}>
          You must be 18 years or older to use this service. You are responsible for maintaining the security of your account and password. The company cannot and will not be liable for any loss or damage from your failure to comply with this security obligation.
        </Text>

        <Text style={[s.heading, { color: textPrimary }]}>3. User Conduct</Text>
        <Text style={[s.paragraph, { color: textSecondary }]}>
          You are solely responsible for your conduct and any data, text, information, usernames, graphics, images, photographs, profiles, audio and video clips, links that you submit, post, and display on the service.
        </Text>

        <Text style={[s.heading, { color: textPrimary }]}>4. Payment Terms</Text>
        <Text style={[s.paragraph, { color: textSecondary }]}>
          All payments made through the platform are subject to our payment processing terms. We reserve the right to change our fee structure with a 30-day notice.
        </Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  back: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  navTitle: { fontSize: 18, fontWeight: '600' },
  content: { padding: 24 },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 8 },
  date: { fontSize: 14, marginBottom: 24 },
  heading: { fontSize: 18, fontWeight: '700', marginTop: 24, marginBottom: 12 },
  paragraph: { fontSize: 15, lineHeight: 24 },
});
