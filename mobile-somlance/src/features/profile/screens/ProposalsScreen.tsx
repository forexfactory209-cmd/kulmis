import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar, ActivityIndicator, Modal, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/theme';
import { getMyProposals, Proposal } from '@/api/proposals';
import { getTemplates, acceptJobWithTemplate, ProgressTemplate } from '@/api/progress';
import { Button } from '@/components/ui/Button';

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#F59E0B',
  ACCEPTED: Colors.success,
  REJECTED: Colors.error
};

export default function ProposalsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);

  // Template Modal State
  const [acceptingProjectId, setAcceptingProjectId] = useState<string | null>(null);
  const [templates, setTemplates] = useState<ProgressTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      const data = await getMyProposals();
      setProposals(data);
    } catch (error) {
      console.log('Failed to fetch proposals', error);
      setProposals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAccept = async (projectId: string) => {
    setAcceptingProjectId(projectId);
    try {
      setLoadingTemplates(true);
      const data = await getTemplates();
      setTemplates(data);
      if (data.length === 0) {
        Alert.alert(
          'Setup Required',
          'You need to create a Progress Template in your Profile before accepting a job.',
          [
            { text: 'Cancel', onPress: () => setAcceptingProjectId(null), style: 'cancel' },
            { text: 'Go to Profile', onPress: () => { setAcceptingProjectId(null); router.push('/progress-templates'); } }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load templates');
      setAcceptingProjectId(null);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const confirmAcceptJob = async () => {
    if (!selectedTemplateId || !acceptingProjectId) return;
    try {
      setLoadingTemplates(true);
      await acceptJobWithTemplate(acceptingProjectId, selectedTemplateId);
      Alert.alert('Success', 'Job accepted and progress tracking setup successfully!');
      setAcceptingProjectId(null);
      setSelectedTemplateId(null);
      fetchProposals();
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.error?.message || 'Failed to accept job');
    } finally {
      setLoadingTemplates(false);
    }
  };
  
  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <View style={s.nav}>
        <TouchableOpacity onPress={() => router.back()} style={s.back}>
          <Ionicons name="chevron-back" size={24} color={Colors.neutral[900]} />
        </TouchableOpacity>
        <Text style={s.navTitle}>My Proposals</Text>
        <View style={{ width: 40 }} />
      </View>
      
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.primary[600]} />
        </View>
      ) : (
        <FlatList
          data={proposals}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={s.card}
              onPress={() => router.push({ pathname: '/job-details', params: { id: item.projectId } })}
            >
              <View style={s.header}>
                <Text style={s.title}>{item.project?.title || 'Unknown Project'}</Text>
                <View style={[s.badge, { backgroundColor: (STATUS_COLORS[item.status] || Colors.neutral[500]) + '20' }]}>
                  <Text style={[s.badgeText, { color: STATUS_COLORS[item.status] || Colors.neutral[500] }]}>{item.status}</Text>
                </View>
              </View>
              <View style={s.row}>
                <Text style={s.label}>Project Budget:</Text>
                <Text style={s.value}>${item.project?.budget || 0}</Text>
              </View>
              <View style={s.row}>
                <Text style={s.label}>Your Bid:</Text>
                <Text style={[s.value, { color: Colors.primary[700], fontWeight: '700' }]}>${item.bidAmount}</Text>
              </View>
              <Text style={s.date}>Submitted on {new Date(item.createdAt).toLocaleDateString()}</Text>

              {item.status === 'ACCEPTED' && item.project?.status !== 'IN_PROGRESS' && (
                <Button 
                  title="Accept Job & Start" 
                  onPress={() => handleOpenAccept(item.projectId)} 
                  style={{ marginTop: 12 }} 
                />
              )}
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={s.empty}>
              <Ionicons name="document-text-outline" size={64} color={Colors.neutral[300]} />
              <Text style={s.emptyTitle}>No proposals yet</Text>
              <Text style={s.emptyDesc}>Start bidding on projects to see them here.</Text>
            </View>
          }
        />
      )}

      {/* Template Selection Modal */}
      <Modal visible={!!acceptingProjectId} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text style={s.modalTitle}>Choose Progress Tracking</Text>
              <TouchableOpacity onPress={() => {
                setAcceptingProjectId(null);
                router.push('/progress-templates');
              }}>
                <Text style={{ color: Colors.primary[600], fontWeight: '600' }}>+ Add</Text>
              </TouchableOpacity>
            </View>
            <Text style={s.modalDesc}>Select a progress template to apply to this project.</Text>
            
            {loadingTemplates ? (
              <ActivityIndicator size="large" color={Colors.primary[600]} style={{ marginVertical: 40 }} />
            ) : templates.length > 0 ? (
              <FlatList
                data={templates}
                keyExtractor={item => item.id}
                style={{ maxHeight: 300, marginVertical: 12 }}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[s.templateCard, selectedTemplateId === item.id && s.templateCardSelected]}
                    onPress={() => setSelectedTemplateId(item.id)}
                  >
                    <View style={s.templateHeader}>
                      <Text style={[s.templateName, selectedTemplateId === item.id && { color: Colors.primary[700] }]}>{item.name}</Text>
                      {selectedTemplateId === item.id && <Ionicons name="checkmark-circle" size={20} color={Colors.primary[600]} />}
                    </View>
                    <Text style={s.templateStepsCount}>{item.steps.length} steps</Text>
                  </TouchableOpacity>
                )}
              />
            ) : (
              <View style={{ marginVertical: 20, alignItems: 'center' }}>
                <Text style={{ color: Colors.neutral[500], marginBottom: 12 }}>No templates found.</Text>
                <Button 
                  title="Create New Template" 
                  onPress={() => {
                    setAcceptingProjectId(null);
                    router.push('/progress-templates');
                  }} 
                  variant="outline" 
                />
              </View>
            )}

            <View style={s.modalActions}>
              <Button title="Cancel" variant="outline" onPress={() => { setAcceptingProjectId(null); setSelectedTemplateId(null); }} style={{ flex: 1, marginRight: 8 }} />
              <Button 
                title="Confirm & Start" 
                onPress={confirmAcceptJob} 
                disabled={!selectedTemplateId || loadingTemplates} 
                style={{ flex: 1 }} 
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.neutral[100] },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.neutral[50], justifyContent: 'center', alignItems: 'center' },
  navTitle: { fontSize: 18, fontWeight: '600', color: Colors.neutral[900] },
  card: { padding: 16, backgroundColor: Colors.white, borderRadius: 12, borderWidth: 1, borderColor: Colors.neutral[100], marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  title: { flex: 1, fontSize: 16, fontWeight: '600', color: Colors.neutral[900], marginRight: 12 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  label: { fontSize: 14, color: Colors.neutral[500] },
  value: { fontSize: 14, fontWeight: '600', color: Colors.neutral[800] },
  date: { fontSize: 12, color: Colors.neutral[400], marginTop: 8, fontStyle: 'italic' },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: Colors.neutral[800], marginTop: 16 },
  emptyDesc: { fontSize: 14, color: Colors.neutral[500], marginTop: 8 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: Colors.white, borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 8 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: Colors.neutral[900], marginBottom: 8 },
  modalDesc: { fontSize: 14, color: Colors.neutral[500], marginBottom: 16 },
  templateCard: { padding: 16, borderRadius: 12, borderWidth: 1, borderColor: Colors.neutral[200], marginBottom: 10 },
  templateCardSelected: { borderColor: Colors.primary[600], backgroundColor: Colors.primary[50] },
  templateHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  templateName: { fontSize: 16, fontWeight: '600', color: Colors.neutral[900] },
  templateStepsCount: { fontSize: 13, color: Colors.neutral[500], marginTop: 4 },
  modalActions: { flexDirection: 'row', marginTop: 16 },
});
