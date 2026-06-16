import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/theme';
import { Button } from '@/components/ui/Button';

export default function HireSuccessScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <View style={s.content}>
        <View style={s.iconWrapper}>
          <Ionicons name="checkmark" size={64} color={Colors.white} />
        </View>
        <Text style={s.title}>Freelancer Hired!</Text>
        <Text style={s.subtitle}>Ahmed Ibrahim</Text>
        <Text style={s.desc}>Has been hired for your project</Text>

        <View style={s.detailsCard}>
          <View style={s.row}>
            <Text style={s.label}>Project</Text>
            <Text style={s.value}>Design a modern website UI</Text>
          </View>
          <View style={s.divider} />
          <View style={s.row}>
            <Text style={s.label}>Amount</Text>
            <Text style={s.valueBold}>$250</Text>
          </View>
          <View style={s.divider} />
          <View style={s.row}>
            <Text style={s.label}>Delivery Time</Text>
            <Text style={s.valueBold}>5 Days</Text>
          </View>
        </View>

        <Button 
          title="Go to Project" 
          onPress={() => router.push({ pathname: '/project-dashboard/[id]', params: { id: '1' } })} 
          size="lg" 
          style={{ width: '100%', marginTop: 32 }} 
        />
        <TouchableOpacity style={s.homeBtn} onPress={() => router.replace('/(tabs)')}>
          <Text style={s.homeBtnText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  content: { flex: 1, alignItems: 'center', padding: 24, paddingTop: 60 },
  iconWrapper: { width: 100, height: 100, borderRadius: 50, backgroundColor: Colors.success, justifyContent: 'center', alignItems: 'center', marginBottom: 24, shadowColor: Colors.success, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  title: { fontSize: 24, fontWeight: '800', color: Colors.neutral[900] },
  subtitle: { fontSize: 20, fontWeight: '700', color: Colors.neutral[800], marginTop: 12 },
  desc: { fontSize: 16, color: Colors.neutral[500], marginTop: 4, marginBottom: 40 },
  detailsCard: { width: '100%', backgroundColor: Colors.neutral[50], borderRadius: 16, padding: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  divider: { height: 1, backgroundColor: Colors.neutral[200] },
  label: { fontSize: 15, color: Colors.neutral[500] },
  value: { fontSize: 15, fontWeight: '500', color: Colors.neutral[800], textAlign: 'right', flex: 1, marginLeft: 16 },
  valueBold: { fontSize: 16, fontWeight: '700', color: Colors.neutral[900] },
  homeBtn: { marginTop: 20, padding: 12 },
  homeBtnText: { fontSize: 16, fontWeight: '600', color: Colors.primary[600] },
});
