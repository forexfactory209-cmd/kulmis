import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDarkColors } from '@/store/themeStore';
import { Colors } from '@/theme';

export default function PrivacyScreen() {
  const { bg, textPrimary, textSecondary, textMuted, border, cardBg, isDark } = useDarkColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <View style={[s.nav, { borderBottomColor: border }]}>
        <TouchableOpacity onPress={() => router.back()} style={[s.back, { backgroundColor: cardBg }]}>
          <Ionicons name="chevron-back" size={24} color={textPrimary} />
        </TouchableOpacity>
        <Text style={[s.navTitle, { color: textPrimary }]}>Privacy Policy</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.updated}>Last updated: May 28, 2026</Text>

        <Text style={s.heading}>1. Information We Collect</Text>
        <Text style={s.body}>
          We collect information you provide directly, including your name, email address, profile information, and payment details. We also automatically collect usage data such as device information, IP addresses, and interaction patterns with the Platform.
        </Text>

        <Text style={s.heading}>2. How We Use Your Information</Text>
        <Text style={s.body}>
          Your information is used to: (a) provide and improve our services; (b) process payments through our escrow system; (c) match freelancers with clients; (d) send notifications and updates; (e) ensure Platform security and prevent fraud; (f) comply with legal obligations.
        </Text>

        <Text style={s.heading}>3. Data Sharing</Text>
        <Text style={s.body}>
          We share your profile information with other users as necessary to facilitate projects. We do not sell your personal data. We may share data with: (a) payment processors for transaction handling; (b) service providers who assist in Platform operations; (c) law enforcement when required by law.
        </Text>

        <Text style={s.heading}>4. Data Security</Text>
        <Text style={s.body}>
          We implement industry-standard security measures including encryption, secure servers, and regular security audits. Passwords are hashed using bcrypt. Financial transactions are processed through secure payment gateways. However, no system is 100% secure, and we cannot guarantee absolute data security.
        </Text>

        <Text style={s.heading}>5. Data Retention</Text>
        <Text style={s.body}>
          We retain your data for as long as your account is active. When you delete your account, we perform a soft-deletion to maintain financial transaction integrity and legal compliance. Personal identifiable information is anonymized within 90 days of account deletion.
        </Text>

        <Text style={s.heading}>6. Your Rights</Text>
        <Text style={s.body}>
          You have the right to: (a) access your personal data; (b) correct inaccurate information; (c) request data deletion; (d) export your data; (e) opt out of marketing communications; (f) withdraw consent at any time. To exercise these rights, contact us through the Support section.
        </Text>

        <Text style={s.heading}>7. Cookies & Tracking</Text>
        <Text style={s.body}>
          Our mobile application may use local storage and analytics tools to improve user experience. We use anonymized analytics to understand usage patterns and improve our services. You can disable analytics through your device settings.
        </Text>

        <Text style={s.heading}>8. Children's Privacy</Text>
        <Text style={s.body}>
          Kulmis is not intended for users under the age of 18. We do not knowingly collect personal information from minors. If we discover that a minor has created an account, we will take steps to delete it promptly.
        </Text>

        <Text style={s.heading}>9. International Data Transfer</Text>
        <Text style={s.body}>
          Your data may be processed in countries other than your own. We ensure appropriate safeguards are in place for international data transfers, including standard contractual clauses and compliance with applicable data protection laws.
        </Text>

        <Text style={s.heading}>10. Changes to This Policy</Text>
        <Text style={s.body}>
          We may update this Privacy Policy periodically. We will notify you of significant changes via email or in-app notification. The "Last updated" date at the top of this policy indicates when it was last revised.
        </Text>

        <Text style={s.heading}>11. Contact Us</Text>
        <Text style={s.body}>
          If you have questions about this Privacy Policy or your personal data, contact our Data Protection Officer at privacy@Kulmis.com or through our in-app support system.
        </Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.neutral[100] },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.neutral[50], justifyContent: 'center', alignItems: 'center' },
  navTitle: { fontSize: 18, fontWeight: '600', color: Colors.neutral[900] },
  content: { padding: 24 },
  updated: { fontSize: 13, color: Colors.neutral[400], marginBottom: 24, fontStyle: 'italic' },
  heading: { fontSize: 17, fontWeight: '700', color: Colors.neutral[900], marginTop: 24, marginBottom: 8 },
  body: { fontSize: 15, lineHeight: 24, color: Colors.neutral[600] },
});
