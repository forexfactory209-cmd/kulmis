import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from '../styles/HomeScreen.styles';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/theme';
import { useAuthStore } from '@/store/authStore';
import { getMyProjects, Project } from '@/api/projects';
import { getProfile } from '@/api/users';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const firstName = user?.firstName || 'Freelancer';
  const [jobs, setJobs] = useState<Project[]>([]);
  const [profileStrength, setProfileStrength] = useState(0);
  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchJobs();
      fetchUserProfile();
    }, [user])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchJobs(), fetchUserProfile()]);
    setRefreshing(false);
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user?.id) return;
    try {
      const p = await getProfile(user.id);
      let calc = 0;
      if (p.firstName && p.lastName) calc += 20;
      if (p.freelancerProfile?.title && p.freelancerProfile?.bio) calc += 20;
      if (p.freelancerProfile?.skills && p.freelancerProfile.skills.length > 0) calc += 20;
      if (p.freelancerProfile?.portfolios && p.freelancerProfile.portfolios.length > 0) calc += 20;
      
      const rawSocial = p.freelancerProfile?.portfolioUrl || '';
      let hasSocial = false;
      if (rawSocial.startsWith('{')) {
        try {
          const parsed = JSON.parse(rawSocial);
          if (parsed.linkedin || parsed.github || parsed.twitter) {
            hasSocial = true;
          }
        } catch (e) {}
      } else if (rawSocial) {
        hasSocial = true;
      }
      if (hasSocial) calc += 20;

      setProfileStrength(calc);
    } catch (error) {
      console.log('Failed to fetch profile', error);
    }
  };

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const data = await getMyProjects();
      setJobs(data.projects || []);
    } catch (error) {
      console.error('Failed to fetch jobs for home', error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const activeJobs = jobs.length;
  const inProgress = jobs.filter(j => j.status === 'IN_PROGRESS').length;
  const completed = jobs.filter(j => j.status === 'COMPLETED').length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary[900]} />
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary[500]} />}
      >
        
        {/* Header Section (Blue/Navy background) */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Hello, {firstName} 👋</Text>
              <Text style={styles.subtitle}>Welcome back! Let's do great work today.</Text>
            </View>
            <TouchableOpacity
              style={styles.notifBtn}
              onPress={() => router.push('/notifications')}
            >
              <Ionicons name="notifications-outline" size={24} color={Colors.white} />
              {(() => {
                const { unreadCount } = require('@/store/notificationStore').useNotificationStore();
                if (unreadCount > 0) {
                  return (
                    <View style={styles.notifBadge}>
                      <Text style={styles.notifBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                    </View>
                  );
                }
                return null;
              })()}
            </TouchableOpacity>
          </View>

          {/* Profile Strength Card */}
          <View style={styles.profileCard}>
            <View style={styles.profileCardHeader}>
              <View style={styles.progressCircle}>
                <Text style={styles.progressText}>{profileStrength}%</Text>
              </View>
              <View style={styles.profileCardTexts}>
                <Text style={styles.profileCardTitle}>Profile Strength</Text>
                <Text style={styles.profileCardDesc}>
                  {profileStrength === 100 
                    ? "Outstanding! Your profile is complete and ready to win jobs." 
                    : "Great job! Complete your profile to build more trust."}
                </Text>
              </View>
            </View>
            {profileStrength < 100 && (
              <TouchableOpacity style={styles.improveBtn} onPress={() => router.push('/edit-profile')}>
                <Text style={styles.improveBtnText}>Improve Profile</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Overview Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsRow}>
            <TouchableOpacity style={styles.statCard} onPress={() => router.push('/(freelancer-tabs)/jobs')}>
              <Ionicons name="briefcase-outline" size={24} color={Colors.primary[600]} />
              <Text style={styles.statValue}>{activeJobs}</Text>
              <Text style={styles.statLabel}>Active Jobs</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.statCard} onPress={() => router.push('/(freelancer-tabs)/jobs')}>
              <Ionicons name="time-outline" size={24} color={Colors.warning} />
              <Text style={styles.statValue}>{inProgress}</Text>
              <Text style={styles.statLabel}>In Progress</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.statCard} onPress={() => router.push('/(freelancer-tabs)/jobs')}>
              <Ionicons name="checkmark-circle-outline" size={24} color={Colors.success} />
              <Text style={styles.statValue}>{completed}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Jobs */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Jobs</Text>
            <TouchableOpacity onPress={() => router.push('/(freelancer-tabs)/jobs')}>
              <Text style={styles.viewAll}>View all</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.jobsList}>
            {loading ? (
              <Text style={{ textAlign: 'center', marginTop: 10 }}>Loading...</Text>
            ) : jobs.length === 0 ? (
              <Text style={{ textAlign: 'center', marginTop: 10 }}>No recent jobs.</Text>
            ) : (
              jobs.slice(0, 3).map(job => (
                <TouchableOpacity 
                  key={job.id} 
                  style={styles.jobItem}
                  onPress={() => router.push({ pathname: '/job-details', params: { id: job.id } })}
                >
                  <View style={styles.jobIconWrap}>
                    <Ionicons name="briefcase-outline" size={24} color={Colors.primary[600]} />
                  </View>
                  <View style={styles.jobInfo}>
                    <Text style={styles.jobTitle}>{job.title}</Text>
                    <Text style={styles.jobCompany}>{job.client?.firstName} {job.client?.lastName}</Text>
                  </View>
                  <View style={styles.jobStatus}>
                    <Text style={job.status === 'COMPLETED' ? styles.statusTextGreen : styles.statusTextBlue}>
                      {job.status === 'IN_PROGRESS' ? 'In Progress' : job.status}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
