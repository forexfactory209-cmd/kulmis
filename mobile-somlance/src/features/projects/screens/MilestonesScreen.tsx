import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/theme';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function MilestonesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [feedback, setFeedback] = useState('');

  return (
    <View style={[s.c, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <View style={s.nav}>
        <TouchableOpacity onPress={() => router.back()} style={s.back}><Ionicons name="chevron-back" size={24} color={Colors.neutral[900]} /></TouchableOpacity>
        <Text style={s.navTitle}>Milestone 2</Text>
        <TouchableOpacity style={s.back}><Ionicons name="ellipsis-vertical" size={20} color={Colors.neutral[900]} /></TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.subtitle}>UI Design Concept</Text>
        
        <View style={s.progressRow}>
          <Text style={s.progressLabel}>60% Completed</Text>
          <Text style={s.progressVal}>60%</Text>
        </View>
        <View style={s.progressTrack}>
          <View style={[s.progressFill, { width: '60%' }]} />
        </View>

        <Text style={s.sectionTitle}>Deliverables (3)</Text>
        
        <TouchableOpacity style={s.fileCard} activeOpacity={0.7} onPress={() => router.push('/file-preview')}>
          <View style={[s.fileIcon, { backgroundColor: Colors.success + '15' }]}><Ionicons name="image" size={20} color={Colors.success} /></View>
          <Text style={s.fileName}>Home Page Design</Text>
          <Text style={[s.fileStatus, { color: Colors.success }]}>Completed</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.fileCard} activeOpacity={0.7}>
          <View style={[s.fileIcon, { backgroundColor: Colors.success + '15' }]}><Ionicons name="image" size={20} color={Colors.success} /></View>
          <Text style={s.fileName}>About Page Design</Text>
          <Text style={[s.fileStatus, { color: Colors.success }]}>Completed</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.fileCard} activeOpacity={0.7} onPress={() => router.push({ pathname: '/approve-delivery/[id]', params: { id: '2' } })}>
          <View style={[s.fileIcon, { backgroundColor: Colors.primary[50] }]}><Ionicons name="image" size={20} color={Colors.primary[600]} /></View>
          <Text style={s.fileName}>Contact Page Design</Text>
          <Text style={[s.fileStatus, { color: Colors.primary[600] }]}>In Review</Text>
        </TouchableOpacity>

        <Text style={[s.sectionTitle, { marginTop: 24 }]}>Add Feedback</Text>
        <Input 
          placeholder="Great work! Please continue..." 
          value={feedback} 
          onChangeText={setFeedback} 
          multiline 
          numberOfLines={4} 
          style={{ height: 100, textAlignVertical: 'top', paddingTop: 12 }} 
        />
        
        <Button 
          title="Submit Feedback" 
          onPress={() => Alert.alert('Submitted', 'Feedback sent to freelancer.')} 
          size="lg" 
          style={{ marginTop: 12 }} 
        />
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
  subtitle: { fontSize: 16, color: Colors.neutral[500], marginBottom: 24 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  progressLabel: { fontSize: 14, fontWeight: '600', color: Colors.neutral[700] },
  progressVal: { fontSize: 14, fontWeight: '700', color: Colors.neutral[900] },
  progressTrack: { height: 6, backgroundColor: Colors.neutral[100], borderRadius: 3, overflow: 'hidden', marginBottom: 32 },
  progressFill: { height: '100%', backgroundColor: Colors.primary[600], borderRadius: 3 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.neutral[900], marginBottom: 16 },
  fileCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderWidth: 1, borderColor: Colors.neutral[100], borderRadius: 14, marginBottom: 12, backgroundColor: Colors.white },
  fileIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  fileName: { flex: 1, fontSize: 15, fontWeight: '600', color: Colors.neutral[900] },
  fileStatus: { fontSize: 13, fontWeight: '600' },
});
