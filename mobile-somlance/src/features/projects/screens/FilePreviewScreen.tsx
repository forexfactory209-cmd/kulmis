import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Image, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/theme';
import { Button } from '@/components/ui/Button';

export default function FilePreviewScreen() {
  const router = useRouter();

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
      
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.fileName}>Home_Page_Design.png</Text>
        <Text style={s.fileSize}>1.4 MB</Text>

        <View style={s.previewContainer}>
          {/* Placeholder for the actual image */}
          <View style={s.previewPlaceholder}>
            <Ionicons name="image-outline" size={64} color={Colors.neutral[300]} />
            <Text style={s.previewText}>Preview not available for mock data</Text>
          </View>
        </View>

        <View style={s.versionCard}>
          <View style={s.versionRow}>
            <View>
              <Text style={s.versionTitle}>Version 1</Text>
              <Text style={s.versionDate}>Uploaded May 12, 2024</Text>
            </View>
            <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
          </View>
          <View style={s.divider} />
          <View style={s.versionRow}>
            <View>
              <Text style={s.versionTitle}>Version 2</Text>
              <Text style={s.versionDate}>Uploaded May 14, 2024</Text>
            </View>
            <View style={s.currentBadge}><Text style={s.currentBadgeText}>Current</Text></View>
          </View>
        </View>
      </ScrollView>

      <View style={s.bottomBar}>
        <Button 
          title="Download" 
          onPress={() => Alert.alert('Downloading', 'File download started.')} 
          icon={<Ionicons name="download-outline" size={20} color={Colors.white} />}
          size="lg" 
          style={{ width: '100%' }} 
        />
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.neutral[50], justifyContent: 'center', alignItems: 'center' },
  content: { padding: 20, paddingBottom: 100 },
  fileName: { fontSize: 20, fontWeight: '700', color: Colors.neutral[900], marginBottom: 4 },
  fileSize: { fontSize: 14, color: Colors.neutral[500], marginBottom: 24 },
  previewContainer: { width: '100%', height: 300, backgroundColor: Colors.neutral[100], borderRadius: 16, overflow: 'hidden', marginBottom: 24 },
  previewPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  previewText: { fontSize: 14, color: Colors.neutral[400], marginTop: 12 },
  versionCard: { backgroundColor: Colors.neutral[50], borderRadius: 16, padding: 16 },
  versionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  versionTitle: { fontSize: 16, fontWeight: '600', color: Colors.neutral[900], marginBottom: 4 },
  versionDate: { fontSize: 13, color: Colors.neutral[500] },
  divider: { height: 1, backgroundColor: Colors.neutral[200] },
  currentBadge: { backgroundColor: Colors.primary[100], paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  currentBadgeText: { fontSize: 12, fontWeight: '600', color: Colors.primary[700] },
  bottomBar: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32, borderTopWidth: 1, borderTopColor: Colors.neutral[100], backgroundColor: Colors.white },
});
