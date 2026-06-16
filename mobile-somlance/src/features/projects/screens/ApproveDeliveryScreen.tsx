import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/theme';
import { Button } from '@/components/ui/Button';

export default function ApproveDeliveryScreen() {
  const router = useRouter();

  const handleApprove = () => {
    Alert.alert('Payment Released', 'The escrow payment has been released to the freelancer.', [
      { text: 'OK', onPress: () => router.push({ pathname: '/project-dashboard/[id]', params: { id: '1' } }) }
    ]);
  };

  const handleRevision = () => {
    Alert.alert('Revision Requested', 'The freelancer has been notified.', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <View style={s.nav}>
        <TouchableOpacity onPress={() => router.back()} style={s.back}>
          <Ionicons name="chevron-back" size={24} color={Colors.neutral[900]} />
        </TouchableOpacity>
        <TouchableOpacity style={s.back}>
          <Ionicons name="ellipsis-vertical" size={20} color={Colors.neutral[900]} />
        </TouchableOpacity>
      </View>
      <View style={s.content}>
        <View style={s.illustration}>
          <Ionicons name="medal" size={80} color="#F59E0B" />
        </View>
        <Text style={s.title}>Great Work!</Text>
        <Text style={s.subtitle}>Are you satisfied with this delivery?</Text>

        <View style={s.btnContainer}>
          <Button 
            title="Approve & Release Payment" 
            onPress={handleApprove} 
            size="lg" 
            style={{ width: '100%', marginBottom: 16 }} 
          />
          <Button 
            title="Request Revision" 
            onPress={handleRevision} 
            variant="outline"
            size="lg" 
            style={{ width: '100%', marginBottom: 32 }} 
          />
          
          <Text style={s.helpText}>Need changes?</Text>
          <TouchableOpacity onPress={handleRevision}>
            <Text style={s.linkText}>Request changes from Freelancer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.neutral[50], justifyContent: 'center', alignItems: 'center' },
  content: { flex: 1, alignItems: 'center', padding: 24, paddingTop: 40 },
  illustration: { width: 150, height: 150, borderRadius: 75, backgroundColor: '#FEF3C7', justifyContent: 'center', alignItems: 'center', marginBottom: 32 },
  title: { fontSize: 28, fontWeight: '800', color: Colors.neutral[900], marginBottom: 12 },
  subtitle: { fontSize: 16, color: Colors.neutral[500], textAlign: 'center', marginBottom: 48 },
  btnContainer: { width: '100%', alignItems: 'center' },
  helpText: { fontSize: 14, color: Colors.neutral[500], marginBottom: 4 },
  linkText: { fontSize: 14, fontWeight: '600', color: Colors.primary[600], textDecorationLine: 'underline' },
});
