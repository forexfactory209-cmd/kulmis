import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Shadows } from '@/theme';
import { Button } from '@/components/ui/Button';
import { getProjectById, Project } from '@/api/projects';
import { useDarkColors } from '@/store/themeStore';

const STATUS_COLORS: Record<string, string> = { OPEN: Colors.primary[600], IN_PROGRESS: '#F59E0B', COMPLETED: Colors.success };
const STATUS_LABELS: Record<string, string> = { OPEN: 'Open', IN_PROGRESS: 'In Progress', COMPLETED: 'Completed' };

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark, bg, cardBg, textPrimary, textSecondary, textMuted, border, statusBar, iconBg } = useDarkColors();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const data = await getProjectById(id as string);
        setProject(data);
      } catch (e) {
        console.error('Failed to load project details', e);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProject();
  }, [id]);

  if (loading) {
    return (
      <View style={[s.container, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center', backgroundColor: bg }]}>
        <ActivityIndicator size="large" color={Colors.primary[600]} />
      </View>
    );
  }

  if (!project) {
    return (
      <View style={[s.container, { paddingTop: insets.top, backgroundColor: bg }]}>
        <View style={[s.nav, { borderBottomColor: border }]}>
          <TouchableOpacity onPress={() => router.back()} style={[s.back, { backgroundColor: iconBg }]}><Ionicons name="chevron-back" size={24} color={textPrimary} /></TouchableOpacity>
          <Text style={[s.navTitle, { color: textPrimary }]}>Job Details</Text>
          <View style={[s.back, { backgroundColor: iconBg }]}><Ionicons name="ellipsis-vertical" size={20} color={textPrimary} /></View>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: textPrimary }}>Project not found.</Text>
        </View>
      </View>
    );
  }

  const proposals = project.proposals || [];

  return (
    <View style={[s.container, { paddingTop: insets.top, backgroundColor: bg }]}>
      <StatusBar barStyle={statusBar} backgroundColor={bg} />
      <View style={[s.nav, { borderBottomColor: border }]}>
        <TouchableOpacity onPress={() => router.back()} style={[s.back, { backgroundColor: iconBg }]}><Ionicons name="chevron-back" size={24} color={textPrimary} /></TouchableOpacity>
        <Text style={[s.navTitle, { color: textPrimary }]}>Job Details</Text>
        <View style={[s.back, { backgroundColor: iconBg }]}><Ionicons name="ellipsis-vertical" size={20} color={textPrimary} /></View>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={[s.header, { borderBottomColor: border }]}>
          <Text style={[s.title, { color: textPrimary }]}>{project.title}</Text>
          <Text style={[s.postedBy, { color: textSecondary }]}>Posted by {project.client?.firstName} {project.client?.lastName}</Text>
          <View style={[s.catBadge, { backgroundColor: isDark ? '#064E3B' : Colors.primary[50] }]}><Text style={[s.catText, { color: isDark ? '#10B981' : Colors.primary[700] }]}>{project.category || 'General'}</Text></View>
        </View>

        <View style={s.section}>
          <View style={[s.detailGrid, { backgroundColor: isDark ? '#1E293B' : Colors.neutral[50] }]}>
            <View style={s.detailRow}>
              <Text style={[s.detailLabel, { color: textSecondary }]}>Budget</Text>
              <Text style={[s.detailValue, { color: textPrimary }]}>${project.budget}</Text>
            </View>
            <View style={[s.divider, { backgroundColor: border }]} />
            <View style={s.detailRow}>
              <Text style={[s.detailLabel, { color: textSecondary }]}>Delivery Time</Text>
              <Text style={[s.detailValue, { color: textPrimary }]}>Flexible</Text>
            </View>
            <View style={[s.divider, { backgroundColor: border }]} />
            <View style={s.detailRow}>
              <Text style={[s.detailLabel, { color: textSecondary }]}>Experience Level</Text>
              <Text style={[s.detailValue, { color: textPrimary }]}>Intermediate</Text>
            </View>
          </View>
        </View>

        <View style={s.section}>
          <Text style={[s.sectionTitle, { color: textPrimary }]}>Project Overview</Text>
          <Text style={[s.desc, { color: textSecondary }]}>{project.description}</Text>
        </View>

        <View style={s.section}>
          <Text style={[s.sectionTitle, { color: textPrimary }]}>Skills Requirements</Text>
          <View style={s.skillsWrap}>
            {['Figma', 'UI Design', 'UX Research', 'Wireframing', 'Prototyping'].map(skill => (
              <View key={skill} style={[s.skillBadge, { backgroundColor: isDark ? '#1E293B' : Colors.neutral[100], borderColor: border }]}><Text style={[s.skillText, { color: textPrimary }]}>{skill}</Text></View>
            ))}
          </View>
        </View>

        {/* Proposals List (Visible to Client or if it's their project) */}
        {proposals.length > 0 && (
          <View style={s.section}>
            <Text style={[s.sectionTitle, { color: textPrimary }]}>Proposals ({proposals.length})</Text>
            {proposals.map((p: any) => (
              <View key={p.id} style={[s.proposalCard, { borderColor: border, backgroundColor: isDark ? '#1E293B' : Colors.white }]}>
                <View style={s.proposalRow}>
                  <View style={[s.pAv, { backgroundColor: isDark ? '#064E3B' : Colors.primary[100] }]}><Text style={[s.pAvi, { color: isDark ? '#10B981' : Colors.primary[700] }]}>{p.freelancer?.user?.firstName?.[0] || 'U'}</Text></View>
                  <View style={s.pInfo}>
                    <Text style={[s.pName, { color: textPrimary }]}>{p.freelancer?.user?.firstName} {p.freelancer?.user?.lastName}</Text>
                    <Text style={[s.pBid, { color: isDark ? '#10B981' : Colors.primary[600] }]}>${Math.round(p.bidAmount || project.budget)} • {p.duration || 'Flexible'}</Text>
                  </View>
                  <View style={[s.pStatus, { backgroundColor: p.status === 'ACCEPTED' ? (isDark ? '#064E3B' : Colors.success + '20') : (isDark ? '#334155' : Colors.neutral[100]) }]}>
                    <Text style={[s.pStatusText, { color: p.status === 'ACCEPTED' ? Colors.success : textSecondary }]}>{p.status}</Text>
                  </View>
                </View>
                <Text style={[s.pLetter, { color: textSecondary }]} numberOfLines={2}>{p.coverLetter || 'No cover letter provided.'}</Text>
                
                {p.status === 'PENDING' && (
                  <View style={[s.pActions, { borderTopColor: border }]}>
                    <Button 
                      title="Message" 
                      onPress={() => router.push({ pathname: '/chat/[id]', params: { id: `conv_${p.freelancer?.user?.id}`, name: `${p.freelancer?.user?.firstName} ${p.freelancer?.user?.lastName}` } })} 
                      variant="outline" 
                      size="sm" 
                      style={{ flex: 1, marginRight: 8 }} 
                    />
                    <Button 
                      title="Hire" 
                      onPress={() => router.push('/secure-payment')} 
                      size="sm" 
                      style={{ flex: 1 }} 
                    />
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
      {project.status === 'OPEN' && (
        <View style={[s.bottomBar, { paddingBottom: insets.bottom + 12, backgroundColor: bg, borderTopColor: border }]}>
          <Button title="Send Proposal" onPress={() => Alert.alert('Submit', 'Proposal submitted!')} size="lg" style={{ width: '100%' }} />
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.neutral[100] },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.neutral[50], justifyContent: 'center', alignItems: 'center' },
  navTitle: { fontSize: 18, fontWeight: '600', color: Colors.neutral[900] },
  header: { paddingHorizontal: 20, paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: Colors.neutral[100] },
  title: { fontSize: 22, fontWeight: '700', color: Colors.neutral[900], marginBottom: 8 },
  postedBy: { fontSize: 14, color: Colors.neutral[500], marginBottom: 12 },
  catBadge: { alignSelf: 'flex-start', backgroundColor: Colors.primary[50], paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 },
  catText: { fontSize: 13, color: Colors.primary[700], fontWeight: '600' },
  section: { paddingHorizontal: 20, paddingTop: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.neutral[900], marginBottom: 12 },
  desc: { fontSize: 15, color: Colors.neutral[600], lineHeight: 22 },
  
  detailGrid: { backgroundColor: Colors.neutral[50], borderRadius: 16, padding: 16 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  detailLabel: { fontSize: 14, color: Colors.neutral[500] },
  detailValue: { fontSize: 14, fontWeight: '600', color: Colors.neutral[900] },
  divider: { height: 1, backgroundColor: Colors.neutral[200], marginVertical: 4 },
  
  skillsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  skillBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: Colors.neutral[100], borderWidth: 1, borderColor: Colors.neutral[200] },
  skillText: { fontSize: 13, color: Colors.neutral[700], fontWeight: '500' },

  proposalCard: { padding: 14, borderWidth: 1, borderColor: Colors.neutral[100], borderRadius: 12, marginBottom: 10, ...Shadows.sm },
  proposalRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  pAv: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primary[100], justifyContent: 'center', alignItems: 'center' },
  pAvi: { fontSize: 14, fontWeight: '700', color: Colors.primary[700] },
  pInfo: { flex: 1, marginLeft: 10 },
  pName: { fontSize: 15, fontWeight: '600', color: Colors.neutral[900] },
  pBid: { fontSize: 13, color: Colors.primary[600], fontWeight: '600', marginTop: 1 },
  pStatus: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999 },
  pStatusText: { fontSize: 11, fontWeight: '600' },
  pLetter: { fontSize: 14, color: Colors.neutral[500], lineHeight: 20 },
  pActions: { flexDirection: 'row', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.neutral[50] },
  bottomBar: { paddingHorizontal: 20, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.neutral[100], backgroundColor: Colors.white, position: 'absolute', bottom: 0, left: 0, right: 0 },
});
