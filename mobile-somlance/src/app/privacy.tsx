import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/theme';
import { useDarkColors } from '@/store/themeStore';

export default function PrivacyPolicyScreen() {
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
        <Text style={[s.navTitle, { color: textPrimary }]}>Privacy Policy</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={s.content}>
        <Text style={[s.title, { color: textPrimary }]}>Privacy Policy</Text>
        <Text style={[s.date, { color: textSecondary }]}>Last updated: May 2026</Text>
        
        <Text style={[s.heading, { color: textPrimary }]}>1. Information We Collect</Text>
        <Text style={[s.paragraph, { color: textSecondary }]}>
          We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us. This information may include: name, email, phone number, postal address, profile picture, payment method, items requested, delivery notes, and other information you choose to provide.
        </Text>

        <Text style={[s.heading, { color: textPrimary }]}>2. How We Use Information</Text>
        <Text style={[s.paragraph, { color: textSecondary }]}>
          We may use the information we collect about you to provide, maintain, and improve our Services, including, for example, to facilitate payments, send receipts, provide products and services you request, develop new features, provide customer support to Users and Drivers, develop safety features, authenticate users, and send product updates and administrative messages.
        </Text>

        <Text style={[s.heading, { color: textPrimary }]}>3. Sharing of Information</Text>
        <Text style={[s.paragraph, { color: textSecondary }]}>
          We may share the information we collect about you with third parties for the purposes described in this policy, including with vendors, consultants, marketing partners, and other service providers who need access to such information to carry out work on our behalf.
        </Text>

        <Text style={[s.heading, { color: textPrimary }]}>4. Security</Text>
        <Text style={[s.paragraph, { color: textSecondary }]}>
          We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.
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
