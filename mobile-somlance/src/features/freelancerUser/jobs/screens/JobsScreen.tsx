import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from '../styles/JobsScreen.styles';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/theme';
import { getMyProjects, Project } from '@/api/projects';
import { useRouter, useFocusEffect } from 'expo-router';

export default function JobsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('All');
  const [jobs, setJobs] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const tabs = ['All', 'Ongoing', 'Completed'];

  useFocusEffect(
    useCallback(() => {
      fetchJobs();
    }, [])
  );

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const data = await getMyProjects();
      setJobs(data.projects || []);
    } catch (error) {
      console.log('Failed to fetch proposals', error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Ongoing') return job.status === 'IN_PROGRESS';
    if (activeTab === 'Completed') return job.status === 'COMPLETED';
    return true;
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Jobs</Text>
        <TouchableOpacity style={styles.filterBtn}>
          <Ionicons name="filter-outline" size={24} color={Colors.neutral[900]} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {loading ? (
          <Text style={{ textAlign: 'center', marginTop: 20 }}>Loading...</Text>
        ) : filteredJobs.length === 0 ? (
          <Text style={{ textAlign: 'center', marginTop: 20 }}>No jobs found in this category.</Text>
        ) : (
          filteredJobs.map((job) => (
            <TouchableOpacity 
              key={job.id} 
              style={styles.jobCard}
              onPress={() => router.push({ pathname: '/job-details', params: { id: job.id } })}
            >
              <View style={styles.jobHeader}>
                <View style={styles.jobHeaderLeft}>
                  <View style={styles.companyLogoWrap}>
                    <Ionicons name="briefcase-outline" size={20} color={Colors.primary[600]} />
                  </View>
                  <View>
                    <Text style={styles.jobTitle}>{job.title}</Text>
                    <Text style={styles.companyName}>{job.client?.firstName} {job.client?.lastName}</Text>
                  </View>
                </View>
                <View style={[
                  styles.statusBadge, 
                  job.status === 'COMPLETED' && { backgroundColor: '#DEF7EC' },
                  job.isPlanSubmitted === false && job.status !== 'COMPLETED' && { backgroundColor: '#FEF3C7', paddingHorizontal: 10 }
                ]}>
                  <Text style={[
                    styles.statusText,
                    job.status === 'COMPLETED' && { color: '#03543F' },
                    job.isPlanSubmitted === false && job.status !== 'COMPLETED' && { color: '#D97706', fontWeight: '700' }
                  ]}>
                    {job.status === 'COMPLETED' 
                      ? 'Completed' 
                      : (job.isPlanSubmitted === false 
                        ? 'Waiting for Acceptance' 
                        : 'In Progress')}
                  </Text>
                </View>
              </View>

              <View style={styles.jobDetails}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailValue}>${Number(job.budget).toLocaleString()}</Text>
                  <Text style={styles.detailLabel}>Fixed Price</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailValue}>{new Date(job.createdAt).toLocaleDateString()}</Text>
                  <Text style={styles.detailLabel}>Created</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailValue}>{job.deadline ? new Date(job.deadline).toLocaleDateString() : 'N/A'}</Text>
                  <Text style={styles.detailLabel}>Due</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
