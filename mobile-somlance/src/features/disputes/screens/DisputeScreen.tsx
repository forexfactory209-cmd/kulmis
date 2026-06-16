import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/theme';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function DisputeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <View style={[s.c, { paddingTop: insets.top }]}><StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <View style={s.nav}><TouchableOpacity onPress={() => router.back()} style={s.back}><Ionicons name="chevron-back" size={24} color={Colors.neutral[900]} /></TouchableOpacity><Text style={s.navTitle}>Dispute Center</Text><View style={{ width: 40 }} /></View>
      <ScrollView contentContainerStyle={s.content}>
        <View style={s.infoCard}><Ionicons name="shield-half" size={40} color={Colors.primary[600]} /><Text style={s.infoTitle}>Dispute #DS-1024</Text><Text style={s.infoDesc}>Our team will review your case within 24-48 hours</Text></View>
        <View style={s.statusCard}>
          <View style={s.statusRow}><View style={[s.statusDot, { backgroundColor: Colors.success }]} /><Text style={s.statusLabel}>Dispute Filed</Text><Text style={s.statusTime}>May 10, 2024</Text></View>
          <View style={s.statusLine} />
          <View style={s.statusRow}><View style={[s.statusDot, { backgroundColor: '#F59E0B' }]} /><Text style={s.statusLabel}>Under Review</Text><Text style={s.statusTime}>In progress</Text></View>
          <View style={s.statusLine} />
          <View style={s.statusRow}><View style={[s.statusDot, { backgroundColor: Colors.neutral[300] }]} /><Text style={[s.statusLabel, { color: Colors.neutral[400] }]}>Resolution</Text><Text style={s.statusTime}>Pending</Text></View>
        </View>
        <Text style={s.sectionTitle}>Add Details</Text>
        <Input label="Reason" placeholder="Describe the issue..." multiline numberOfLines={4} style={{ height: 100, textAlignVertical: 'top', paddingTop: 12 }} />
        <Button title="Submit Evidence" onPress={() => Alert.alert('Upload', 'File upload will be available soon')} variant="outline" icon={<Ionicons name="attach" size={20} color={Colors.primary[700]} />} style={{ marginTop: 8 }} />
        <Button title="Request Resolution" onPress={() => Alert.alert('Submitted', 'Your dispute details have been submitted.')} size="lg" style={{ marginTop: 16 }} />
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
  infoCard: { alignItems: 'center', padding: 24, backgroundColor: Colors.primary[50], borderRadius: 16, marginBottom: 20 },
  infoTitle: { fontSize: 18, fontWeight: '700', color: Colors.neutral[900], marginTop: 12 },
  infoDesc: { fontSize: 14, color: Colors.neutral[500], textAlign: 'center', marginTop: 6 },
  statusCard: { padding: 20, backgroundColor: Colors.neutral[50], borderRadius: 14, marginBottom: 24 },
  statusRow: { flexDirection: 'row', alignItems: 'center' },
  statusDot: { width: 12, height: 12, borderRadius: 6 },
  statusLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: Colors.neutral[800], marginLeft: 12 },
  statusTime: { fontSize: 13, color: Colors.neutral[400] },
  statusLine: { width: 2, height: 20, backgroundColor: Colors.neutral[200], marginLeft: 5, marginVertical: 2 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.neutral[900], marginBottom: 12 },
});
