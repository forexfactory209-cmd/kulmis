import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import apiClient from '@/api/client';

export default function InvitationDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [invitation, setInvitation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) fetchInvitation();
  }, [id]);

  const fetchInvitation = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/invitations/${id}`);
      if (res.data.success) setInvitation(res.data.data);
    } catch (err) {
      console.error('Failed to fetch invitation', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    Alert.alert(
      'Accept Invitation',
      `Are you sure you want to accept this invitation from ${invitation?.client?.businessProfile?.companyName || 'this business'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          style: 'default',
          onPress: async () => {
            try {
              setActionLoading(true);
              await apiClient.post(`/invitations/${id}/accept`);
              setInvitation((prev: any) => ({ ...prev, status: 'ACCEPTED' }));
              Alert.alert('✅ Accepted!', 'You have accepted this invitation. The business has been notified and will appear in your "My Businesses" hub.');
            } catch (err: any) {
              Alert.alert('Error', err.response?.data?.error?.message || 'Failed to accept invitation');
            } finally {
              setActionLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleReject = async () => {
    Alert.alert(
      'Reject Invitation',
      'Are you sure you want to decline this invitation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading(true);
              await apiClient.post(`/invitations/${id}/reject`);
              setInvitation((prev: any) => ({ ...prev, status: 'REJECTED' }));
              Alert.alert('Declined', 'You have declined this invitation.');
            } catch (err: any) {
              Alert.alert('Error', err.response?.data?.error?.message || 'Failed to reject invitation');
            } finally {
              setActionLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleWithdraw = async () => {
    Alert.alert(
      'Withdraw from Business',
      'Are you sure you want to terminate your contract with this business? This will remove them from your "My Businesses" hub.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Withdraw',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading(true);
              await apiClient.delete(`/invitations/${id}/withdraw`);
              Alert.alert('Done', 'You have successfully withdrawn from this business.', [
                { text: 'OK', onPress: () => router.back() }
              ]);
            } catch (err: any) {
              Alert.alert('Error', err.response?.data?.error?.message || 'Failed to withdraw');
            } finally {
              setActionLoading(false);
            }
          }
        }
      ]
    );
  };

  const business = invitation?.client?.businessProfile;
  const jobTypeLabel = invitation?.jobType === 'MONTHLY_WORKER' ? 'Monthly Retainer' : 'Project Based';

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'ACCEPTED': return { color: Colors.success, bg: '#ECFDF5', label: 'Accepted', icon: 'checkmark-circle' };
      case 'REJECTED': return { color: Colors.error, bg: '#FEF2F2', label: 'Declined', icon: 'close-circle' };
      default: return { color: Colors.warning, bg: '#FFFBEB', label: 'Pending', icon: 'time' };
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary[600]} />
        </View>
      </SafeAreaView>
    );
  }

  if (!invitation) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={{ color: Colors.neutral[500] }}>Invitation not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const statusCfg = getStatusConfig(invitation.status);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.neutral[900]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Invitation</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Status Banner */}
        <View style={[styles.statusBanner, { backgroundColor: statusCfg.bg }]}>
          <Ionicons name={statusCfg.icon as any} size={20} color={statusCfg.color} />
          <Text style={[styles.statusText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
        </View>

        {/* Business Card */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>FROM</Text>
          <View style={styles.businessRow}>
            <View style={styles.businessAvatar}>
              <Text style={styles.avatarLetter}>{business?.companyName?.charAt(0) || 'B'}</Text>
            </View>
            <View style={styles.businessInfo}>
              <Text style={styles.companyName}>{business?.companyName || 'Business'}</Text>
              <Text style={styles.industry}>{business?.industry || 'Company'}</Text>
              {business?.website && (
                <TouchableOpacity onPress={() => Linking.openURL(business.website)}>
                  <Text style={styles.website}>{business.website}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
          {business?.description && (
            <Text style={styles.businessDesc}>{business.description}</Text>
          )}
        </View>

        {/* Invitation Details */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>INVITATION DETAILS</Text>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons name="briefcase-outline" size={18} color={Colors.primary[600]} />
            </View>
            <View>
              <Text style={styles.detailLabel}>Job Type</Text>
              <Text style={styles.detailValue}>{jobTypeLabel}</Text>
            </View>
          </View>

          {invitation.paymentAmount && (
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons name="cash-outline" size={18} color={Colors.success} />
              </View>
              <View>
                <Text style={styles.detailLabel}>
                  {invitation.jobType === 'MONTHLY_WORKER' ? 'Monthly Salary' : 'Project Amount'}
                </Text>
                <Text style={[styles.detailValue, { color: Colors.success, fontWeight: '700' }]}>
                  ${Number(invitation.paymentAmount).toLocaleString()}
                </Text>
              </View>
            </View>
          )}

          {invitation.project && (
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons name="folder-outline" size={18} color={Colors.info} />
              </View>
              <View>
                <Text style={styles.detailLabel}>Project</Text>
                <Text style={styles.detailValue}>{invitation.project.title}</Text>
              </View>
            </View>
          )}

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons name="calendar-outline" size={18} color={Colors.neutral[500]} />
            </View>
            <View>
              <Text style={styles.detailLabel}>Received</Text>
              <Text style={styles.detailValue}>
                {new Date(invitation.createdAt).toLocaleDateString('en-US', {
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                })}
              </Text>
            </View>
          </View>
        </View>

        {/* Message */}
        {invitation.message && (
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>PERSONAL MESSAGE</Text>
            <View style={styles.messageBox}>
              <Ionicons name="chatbubble-ellipses-outline" size={16} color={Colors.primary[600]} style={{ marginBottom: 8 }} />
              <Text style={styles.messageText}>"{invitation.message}"</Text>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        {invitation.status === 'PENDING' && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.btn, styles.rejectBtn]}
              onPress={handleReject}
              disabled={actionLoading}
            >
              <Ionicons name="close-circle-outline" size={20} color={Colors.error} />
              <Text style={[styles.btnText, { color: Colors.error }]}>Decline</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.acceptBtn]}
              onPress={handleAccept}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={20} color={Colors.white} />
                  <Text style={[styles.btnText, { color: Colors.white }]}>Accept</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {invitation.status === 'ACCEPTED' && (
          <TouchableOpacity
            style={[styles.withdrawBtn]}
            onPress={handleWithdraw}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <ActivityIndicator size="small" color={Colors.error} />
            ) : (
              <>
                <Ionicons name="exit-outline" size={20} color={Colors.error} />
                <Text style={[styles.btnText, { color: Colors.error }]}>Withdraw from Business</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.neutral[50] },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14, backgroundColor: Colors.white,
    borderBottomWidth: 1, borderBottomColor: Colors.neutral[200]
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.neutral[100], justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.neutral[900] },
  scroll: { padding: 20, gap: 16 },
  statusBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: 14, borderRadius: 12
  },
  statusText: { fontSize: 15, fontWeight: '700' },
  card: {
    backgroundColor: Colors.white, borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: Colors.neutral[200],
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1
  },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: Colors.neutral[400],
    letterSpacing: 1, marginBottom: 16, textTransform: 'uppercase'
  },
  businessRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  businessAvatar: {
    width: 56, height: 56, borderRadius: 14, backgroundColor: Colors.primary[100],
    justifyContent: 'center', alignItems: 'center'
  },
  avatarLetter: { fontSize: 22, fontWeight: '800', color: Colors.primary[700] },
  businessInfo: { flex: 1 },
  companyName: { fontSize: 18, fontWeight: '700', color: Colors.neutral[900] },
  industry: { fontSize: 13, color: Colors.neutral[500], marginTop: 2 },
  website: { fontSize: 13, color: Colors.info, marginTop: 4 },
  businessDesc: { fontSize: 14, color: Colors.neutral[600], marginTop: 14, lineHeight: 20 },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 16 },
  detailIcon: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.neutral[50],
    justifyContent: 'center', alignItems: 'center'
  },
  detailLabel: { fontSize: 12, color: Colors.neutral[400], fontWeight: '600', marginBottom: 2 },
  detailValue: { fontSize: 15, color: Colors.neutral[900], fontWeight: '600' },
  messageBox: { backgroundColor: Colors.primary[50], padding: 16, borderRadius: 12 },
  messageText: { fontSize: 15, color: Colors.neutral[700], lineHeight: 22, fontStyle: 'italic' },
  actions: { flexDirection: 'row', gap: 12 },
  btn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14, borderRadius: 12
  },
  rejectBtn: { backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.error },
  acceptBtn: { backgroundColor: Colors.primary[600] },
  withdrawBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 14, borderRadius: 12, backgroundColor: Colors.white,
    borderWidth: 1.5, borderColor: Colors.error
  },
  btnText: { fontSize: 15, fontWeight: '700' },
});
