import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/theme';

const FAQ = [
  { id: '1', q: 'How does escrow work?', a: 'Funds are held securely until the project is completed and approved.' },
  { id: '2', q: 'How do I withdraw funds?', a: 'Go to Earnings > Withdraw and select your payment method.' },
  { id: '3', q: 'How to file a dispute?', a: 'Navigate to Project > Dispute Center and fill out the form.' },
  { id: '4', q: 'Can I cancel a project?', a: 'Yes, before the freelancer starts. Escrow will be refunded.' },
  { id: '5', q: 'How do ratings work?', a: 'Both clients and freelancers rate each other after completion.' },
];

export default function SupportScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [expanded, setExpanded] = React.useState<string | null>(null);

  return (
    <View style={[s.c, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <View style={s.nav}>
        <TouchableOpacity onPress={() => router.back()} style={s.back}><Ionicons name="chevron-back" size={24} color={Colors.neutral[900]} /></TouchableOpacity>
        <Text style={s.navTitle}>Support Center</Text><View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={s.content}>
        <View style={s.hero}><Ionicons name="help-circle" size={48} color={Colors.primary[600]} /><Text style={s.heroT}>How can we help?</Text><Text style={s.heroD}>Browse our FAQ or contact support</Text></View>
        <Text style={s.st}>Frequently Asked Questions</Text>
        {FAQ.map(item => (
          <TouchableOpacity key={item.id} style={s.faq} onPress={() => setExpanded(expanded === item.id ? null : item.id)} activeOpacity={0.7}>
            <View style={s.faqH}><Text style={s.faqQ}>{item.q}</Text><Ionicons name={expanded === item.id ? 'chevron-up' : 'chevron-down'} size={20} color={Colors.neutral[400]} /></View>
            {expanded === item.id && <Text style={s.faqA}>{item.a}</Text>}
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={s.contactCard}>
          <View style={s.contactIcon}><Ionicons name="chatbubble-ellipses" size={24} color={Colors.primary[600]} /></View>
          <View style={s.contactInfo}><Text style={s.contactT}>Live Chat Support</Text><Text style={s.contactD}>Available 24/7</Text></View>
          <Ionicons name="chevron-forward" size={20} color={Colors.neutral[300]} />
        </TouchableOpacity>
        <TouchableOpacity style={s.contactCard}>
          <View style={s.contactIcon}><Ionicons name="mail" size={24} color={Colors.primary[600]} /></View>
          <View style={s.contactInfo}><Text style={s.contactT}>Email Support</Text><Text style={s.contactD}>support@Kulmis.com</Text></View>
          <Ionicons name="chevron-forward" size={20} color={Colors.neutral[300]} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: Colors.white },
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.neutral[100] },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.neutral[50], justifyContent: 'center', alignItems: 'center' },
  navTitle: { fontSize: 18, fontWeight: '600', color: Colors.neutral[900] },
  content: { padding: 16, paddingBottom: 40 },
  hero: { alignItems: 'center', padding: 28, backgroundColor: Colors.primary[50], borderRadius: 20, marginBottom: 24 },
  heroT: { fontSize: 22, fontWeight: '700', color: Colors.neutral[900], marginTop: 12 },
  heroD: { fontSize: 14, color: Colors.neutral[500], marginTop: 4 },
  st: { fontSize: 18, fontWeight: '700', color: Colors.neutral[900], marginBottom: 12 },
  faq: { padding: 16, borderWidth: 1, borderColor: Colors.neutral[100], borderRadius: 14, marginBottom: 10 },
  faqH: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQ: { fontSize: 15, fontWeight: '600', color: Colors.neutral[800], flex: 1, marginRight: 8 },
  faqA: { fontSize: 14, color: Colors.neutral[500], marginTop: 10, lineHeight: 20 },
  contactCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderWidth: 1, borderColor: Colors.neutral[100], borderRadius: 14, marginTop: 10 },
  contactIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: Colors.primary[50], justifyContent: 'center', alignItems: 'center' },
  contactInfo: { flex: 1, marginLeft: 14 },
  contactT: { fontSize: 16, fontWeight: '600', color: Colors.neutral[900] },
  contactD: { fontSize: 13, color: Colors.neutral[500], marginTop: 2 },
});
