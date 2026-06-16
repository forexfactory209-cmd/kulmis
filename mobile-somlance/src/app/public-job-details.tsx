import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getProjectById, Project } from '@/api/projects';
import { useDarkColors } from '@/store/themeStore';

export default function PublicJobDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { bg, textPrimary, textSecondary, textMuted, border, cardBg, isDark } = useDarkColors();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const data = await getProjectById(id as string);
      setProject(data);
    } catch (error) {
      console.error('Failed to load project', error);
      setProject(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary[600]} />
          <Text style={{ marginTop: 10, color: textSecondary }}>Loading project details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!project) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={48} color={textMuted} />
          <Text style={{ marginTop: 10, color: textSecondary }}>Project not found.</Text>
          <TouchableOpacity style={{ marginTop: 20 }} onPress={() => router.back()}>
            <Text style={{ color: Colors.primary[600] }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Determine accepted freelancer
  const acceptedProposal = project.proposals?.find((p: any) => p.status === 'ACCEPTED');
  const freelancer = acceptedProposal?.freelancer?.user;

  // Clean description
  const cleanDescription = (project.description || '').split('---METADATA---')[0].trim();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={isDark ? Colors.neutral[900] : Colors.primary[900]} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: isDark ? Colors.neutral[900] : Colors.primary[900] }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Project Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.titleSection, { backgroundColor: isDark ? Colors.neutral[900] : Colors.primary[900] }]}>
          <View style={styles.titleRow}>
            <View style={styles.iconBox}>
              <Ionicons name="briefcase-outline" size={28} color={Colors.primary[700]} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.projectTitle}>{project.title}</Text>
              <Text style={styles.clientName}>Client: {project.client?.firstName} {project.client?.lastName}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: project.status === 'COMPLETED' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.2)' }]}>
              <Text style={styles.statusText}>{project.status}</Text>
            </View>
          </View>
        </View>

        <View style={styles.mainBody}>
          <View style={styles.infoCardsRow}>
            <View style={[styles.infoCard, { backgroundColor: cardBg, borderColor: border }]}>
              <Ionicons name="calendar-outline" size={20} color={Colors.primary[600]} />
              <View style={{ marginLeft: 10 }}>
                <Text style={[styles.infoLabel, { color: textMuted }]}>Posted</Text>
                <Text style={[styles.infoValue, { color: textPrimary }]}>
                  {new Date(project.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </View>
            <View style={[styles.infoCard, { backgroundColor: cardBg, borderColor: border }]}>
              <Ionicons name="checkmark-done-circle-outline" size={20} color={Colors.primary[600]} />
              <View style={{ marginLeft: 10 }}>
                <Text style={[styles.infoLabel, { color: textMuted }]}>Type</Text>
                <Text style={[styles.infoValue, { color: textPrimary }]}>{project.type || 'Fixed Price'}</Text>
              </View>
            </View>
          </View>

          {freelancer && (
            <View style={[styles.freelancerCard, { backgroundColor: cardBg, borderColor: border }]}>
              <Text style={[styles.sectionTitle, { color: textPrimary }]}>Completed By</Text>
              <View style={styles.freelancerRow}>
                <View style={styles.freelancerAvatar}>
                  <Text style={styles.freelancerInitials}>{freelancer.firstName.charAt(0)}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.freelancerName, { color: textPrimary }]}>{freelancer.firstName} {freelancer.lastName}</Text>
                  <Text style={[styles.freelancerTitle, { color: textSecondary }]}>Kulmis Freelancer</Text>
                </View>
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={24} color={Colors.primary[600]} />
                </View>
              </View>
            </View>
          )}

          <View style={[styles.descCard, { backgroundColor: cardBg, borderColor: border }]}>
            <Text style={[styles.sectionTitle, { color: textPrimary }]}>Description</Text>
            <Text style={[styles.descText, { color: textSecondary }]}>{cleanDescription}</Text>
          </View>

          {project.skills && project.skills.length > 0 && (
            <View style={[styles.descCard, { backgroundColor: cardBg, borderColor: border }]}>
              <Text style={[styles.sectionTitle, { color: textPrimary }]}>Skills Required</Text>
              <View style={styles.skillsRow}>
                {project.skills.map((skill: string, idx: number) => (
                  <View key={idx} style={[styles.skillBadge, { backgroundColor: isDark ? border : Colors.neutral[100] }]}>
                    <Text style={[styles.skillText, { color: textPrimary }]}>{skill}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
  },
  backBtn: { padding: Spacing.xs },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.white },
  content: { paddingBottom: Spacing.xxl },
  titleSection: {
    padding: Spacing.lg,
    paddingTop: 0,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  iconBox: {
    width: 60, height: 60,
    backgroundColor: Colors.white,
    borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
    marginRight: 15,
  },
  projectTitle: { fontSize: 20, fontWeight: '800', color: Colors.white, marginBottom: 4 },
  clientName: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  statusBadge: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: { color: Colors.white, fontSize: 10, fontWeight: 'bold' },
  mainBody: { padding: Spacing.lg, marginTop: Spacing.md },
  infoCardsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.lg },
  infoCard: {
    flexDirection: 'row', alignItems: 'center',
    width: '48%', padding: Spacing.md,
    borderRadius: 16, borderWidth: 1,
  },
  infoLabel: { fontSize: 11 },
  infoValue: { fontSize: 14, fontWeight: '700' },
  freelancerCard: {
    padding: Spacing.lg,
    borderRadius: 16, borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  freelancerRow: { flexDirection: 'row', alignItems: 'center' },
  freelancerAvatar: {
    width: 48, height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary[100],
    justifyContent: 'center', alignItems: 'center',
  },
  freelancerInitials: { fontSize: 18, fontWeight: 'bold', color: Colors.primary[700] },
  freelancerName: { fontSize: 16, fontWeight: '700' },
  freelancerTitle: { fontSize: 13, marginTop: 2 },
  verifiedBadge: { marginLeft: 'auto' },
  descCard: {
    padding: Spacing.lg,
    borderRadius: 16, borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  descText: { fontSize: 14, lineHeight: 22 },
  skillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  skillBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  skillText: { fontSize: 12, fontWeight: '600' },
});
