import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDarkColors } from '@/store/themeStore';
import { Colors } from '@/theme';

export default function TermsScreen() {
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
        <Text style={[s.navTitle, { color: textPrimary }]}>Terms of Service</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.updated}>Last updated: May 28, 2026</Text>

        <Text style={s.heading}>1. Acceptance of Terms</Text>
        <Text style={s.body}>
          By accessing or using Kulmis ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to all terms, do not use the Platform. These terms constitute a binding legal agreement between you and Kulmis.
        </Text>

        <Text style={s.heading}>2. User Accounts</Text>
        <Text style={s.body}>
          You must register for an account to access certain features. You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. You agree to provide accurate and complete information during registration.
        </Text>

        <Text style={s.heading}>3. Freelancer & Client Obligations</Text>
        <Text style={s.body}>
          Freelancers agree to deliver work as described in project agreements. Clients agree to provide clear project requirements and make timely payments through the Platform's escrow system. Both parties agree to communicate professionally and resolve disputes through the Platform's dispute resolution process.
        </Text>

        <Text style={s.heading}>4. Payments & Escrow</Text>
        <Text style={s.body}>
          All project payments are processed through Kulmis's secure escrow system. Funds are held in escrow until project milestones are completed and approved. Kulmis charges a platform fee on each transaction as outlined in our pricing page. Refunds and disputes are handled according to our Dispute Resolution Policy.
        </Text>

        <Text style={s.heading}>5. Intellectual Property</Text>
        <Text style={s.body}>
          Upon full payment, all intellectual property rights for completed work transfer to the Client unless otherwise agreed in writing. Freelancers retain the right to display completed work in their portfolios unless the Client requests confidentiality.
        </Text>

        <Text style={s.heading}>6. Prohibited Conduct</Text>
        <Text style={s.body}>
          Users must not: (a) circumvent the Platform's payment system; (b) share personal contact information to avoid Platform fees; (c) submit fraudulent work or reviews; (d) harass or discriminate against other users; (e) use the Platform for illegal activities; (f) attempt to hack or compromise Platform security.
        </Text>

        <Text style={s.heading}>7. Account Termination</Text>
        <Text style={s.body}>
          Kulmis reserves the right to suspend or terminate accounts that violate these terms. Users may delete their accounts at any time through the Settings page. Upon termination, pending escrow payments will be handled according to our dispute resolution process.
        </Text>

        <Text style={s.heading}>8. Limitation of Liability</Text>
        <Text style={s.body}>
          Kulmis acts as a marketplace connecting freelancers and clients. We are not responsible for the quality of work delivered, missed deadlines, or disputes between users. Our liability is limited to the platform fees collected.
        </Text>

        <Text style={s.heading}>9. Changes to Terms</Text>
        <Text style={s.body}>
          Kulmis may update these terms at any time. Users will be notified of material changes via email or in-app notification. Continued use of the Platform after changes constitutes acceptance of the updated terms.
        </Text>

        <Text style={s.heading}>10. Contact</Text>
        <Text style={s.body}>
          For questions about these Terms, contact us at legal@Kulmis.com or through our in-app support system.
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
