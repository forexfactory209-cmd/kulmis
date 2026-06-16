import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function BusinessDetailsScreen() {
  const router = useRouter();
  const { data } = useLocalSearchParams();
  const businessData = data ? JSON.parse(data as string) : null;

  if (!businessData) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ padding: 20 }}>No data available.</Text>
      </SafeAreaView>
    );
  }

  const { business, stats, contract, projects } = businessData;

  const renderProjectItem = (project: any) => {
    // Parse metadata to extract documentUrl if it exists
    let documentUrl = null;
    if (project.description && project.description.includes('---METADATA---')) {
      const parts = project.description.split('---METADATA---');
      try {
        const metadata = JSON.parse(parts[1].trim());
        documentUrl = metadata.documentUrl;
      } catch (e) {}
    }

    return (
      <TouchableOpacity 
        key={project.id} 
        style={styles.projectCard}
        onPress={() => router.push({ pathname: '/job-details', params: { id: project.id } })}
      >
        <View style={styles.projectHeader}>
          <Text style={styles.projectTitle}>{project.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: project.status === 'COMPLETED' ? Colors.success : Colors.primary[100] }]}>
            <Text style={[styles.statusText, { color: project.status === 'COMPLETED' ? Colors.white : Colors.primary[700] }]}>
              {project.status.replace('_', ' ')}
            </Text>
          </View>
        </View>
        
        <View style={styles.projectDetails}>
          <Text style={styles.projectCategory}>{project.category || 'Uncategorized'}</Text>
          <Text style={styles.projectBudget}>${project.budget.toLocaleString()}</Text>
        </View>
        
        {documentUrl && (
          <View style={styles.docRow}>
            <Ionicons name="document-text-outline" size={16} color={Colors.primary[600]} />
            <Text style={styles.docText}>Roles Document Attached</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <View style={styles.businessAvatar}>
            <Text style={styles.avatarText}>{business.companyName?.charAt(0) || 'B'}</Text>
          </View>
          <Text style={styles.companyName}>{business.companyName}</Text>
          <Text style={styles.industry}>{business.industry || 'Business'}</Text>
          
          {contract && (
            <View style={styles.contractBadge}>
              <Ionicons name="shield-checkmark" size={16} color={Colors.white} />
              <Text style={styles.contractText}>Active Retainer</Text>
            </View>
          )}
        </View>

        {/* Analytics Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity & Analytics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCardContainer}>
              <View style={styles.statCard}>
                <Ionicons name="cash-outline" size={24} color={Colors.primary[600]} />
                <Text style={styles.statValue}>${stats.totalEarned.toLocaleString()}</Text>
                <Text style={styles.statLabel}>Total Earned</Text>
              </View>
            </View>
            <View style={styles.statCardContainer}>
              <View style={styles.statCard}>
                <Ionicons name="time-outline" size={24} color={Colors.warning} />
                <Text style={styles.statValue}>${stats.pendingPayroll.toLocaleString()}</Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
            </View>
            <View style={styles.statCardContainer}>
              <View style={styles.statCard}>
                <Ionicons name="briefcase-outline" size={24} color={Colors.secondary} />
                <Text style={styles.statValue}>{stats.activeProjects}</Text>
                <Text style={styles.statLabel}>Active Projects</Text>
              </View>
            </View>
            <View style={styles.statCardContainer}>
              <View style={styles.statCard}>
                <Ionicons name="checkmark-circle-outline" size={24} color={Colors.success} />
                <Text style={styles.statValue}>{stats.completedProjects}</Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Assigned Projects Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Assigned Projects</Text>
          {projects && projects.length > 0 ? (
            projects.map(renderProjectItem)
          ) : (
            <View style={styles.emptyProjects}>
              <Ionicons name="folder-open-outline" size={48} color={Colors.neutral[300]} />
              <Text style={styles.emptyProjectsText}>No projects assigned yet.</Text>
            </View>
          )}
        </View>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.neutral[50] },
  header: { 
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 10
  },
  backButton: { 
    width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center', alignItems: 'center'
  },
  hero: {
    backgroundColor: Colors.primary[700], paddingTop: 100, paddingBottom: 40,
    alignItems: 'center', borderBottomLeftRadius: 24, borderBottomRightRadius: 24
  },
  businessAvatar: {
    width: 80, height: 80, borderRadius: 20, backgroundColor: Colors.white,
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12
  },
  avatarText: { fontSize: 32, fontWeight: '800', color: Colors.primary[700] },
  companyName: { fontSize: 24, fontWeight: '700', color: Colors.white, marginBottom: 4 },
  industry: { fontSize: 15, color: Colors.primary[100], marginBottom: 16 },
  contractBadge: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20
  },
  contractText: { fontSize: 14, fontWeight: '600', color: Colors.white, marginLeft: 8 },
  
  section: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.neutral[900], marginBottom: 16 },
  
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 },
  statCardContainer: { width: '50%', padding: 6 },
  statCard: {
    backgroundColor: Colors.white, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: Colors.neutral[200],
    alignItems: 'center'
  },
  statValue: { fontSize: 20, fontWeight: '700', color: Colors.neutral[900], marginTop: 8 },
  statLabel: { fontSize: 12, color: Colors.neutral[500], marginTop: 4 },
  projectCard: {
    backgroundColor: Colors.white, borderRadius: 16, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: Colors.neutral[200]
  },
  projectHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  projectTitle: { fontSize: 16, fontWeight: '700', color: Colors.neutral[900], flex: 1, marginRight: 12 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: '700' },
  projectDetails: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  projectCategory: { fontSize: 13, color: Colors.neutral[500] },
  projectBudget: { fontSize: 15, fontWeight: '700', color: Colors.neutral[900] },
  docRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.neutral[100] },
  docText: { fontSize: 13, color: Colors.primary[600], fontWeight: '600', marginLeft: 8 },
  emptyProjects: { alignItems: 'center', padding: 40, backgroundColor: Colors.white, borderRadius: 16, borderWidth: 1, borderColor: Colors.neutral[200], borderStyle: 'dashed' },
  emptyProjectsText: { marginTop: 12, fontSize: 14, color: Colors.neutral[500] }
});
