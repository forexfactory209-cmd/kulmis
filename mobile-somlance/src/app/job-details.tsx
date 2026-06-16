import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, StyleSheet, Alert, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getProjectById, updateProject, Project, startProject } from '@/api/projects';
import { createReview } from '@/api/reviews';
import { useAuthStore } from '@/store/authStore';
import { useDarkColors } from '@/store/themeStore';
import { createConversation } from '@/api/messages';
import { getProjectProgress, submitProjectStep, ProjectProgressStep, getTemplates, ProgressTemplate } from '@/api/progress';
import { FlatList, Modal } from 'react-native';

export default function JobDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const { bg, textPrimary, textSecondary, textMuted, border, cardBg, isDark } = useDarkColors();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'details' | 'progress' | 'timeline' | 'files'>('details');

  // Submit work state
  const [selectedStepId, setSelectedStepId] = useState<string>('2'); // default to initial draft
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState('');
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  // Revision submission state
  const [revisionFeedback, setRevisionFeedback] = useState('');
  const [showRevisionForm, setShowRevisionForm] = useState(false);

  // Review response state
  const [responseMsg, setResponseMsg] = useState('');
  const [submittingResponse, setSubmittingResponse] = useState(false);
  const [savedResponse, setSavedResponse] = useState('');

  // Dynamic progress steps from DB
  const [progressSteps, setProgressSteps] = useState<ProjectProgressStep[]>([]);
  const [completingStepId, setCompletingStepId] = useState<string | null>(null);

  // Client Review state
  const [clientRating, setClientRating] = useState<number>(5);
  const [clientComment, setClientComment] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);

  // Accept Modal State
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [templates, setTemplates] = useState<ProgressTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  const fetchTemplatesData = async () => {
    try {
      setLoadingTemplates(true);
      const data = await getTemplates();
      setTemplates(data);
    } catch (e) {
      console.log('Failed to fetch templates', e);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const handleOpenAccept = () => {
    setShowAcceptModal(true);
    fetchTemplatesData();
  };

  const handleConfirmAccept = async () => {
    if (!project || !selectedTemplateId) return;
    try {
      setSubmitLoading(true);
      await startProject(project.id, selectedTemplateId);
      setShowAcceptModal(false);
      Alert.alert('Success', 'Project started and progress tracking initialized.', [
        { text: 'OK', onPress: () => fetchProject() }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error?.message || 'Failed to start project');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!project) return;
    const acceptedProposal = project.proposals?.find((p: any) => p.status === 'ACCEPTED');
    const freelancerId = acceptedProposal?.freelancer?.user?.id;

    if (!freelancerId) {
      Alert.alert('Error', 'No assigned freelancer found to review.');
      return;
    }

    if (!clientComment.trim()) {
      Alert.alert('Required', 'Please enter a review comment.');
      return;
    }

    try {
      setSubmittingReview(true);
      await createReview({
        projectId: project.id,
        revieweeId: freelancerId,
        rating: clientRating,
        comment: clientComment,
      });

      setClientComment('');
      setClientRating(5);

      Alert.alert('Thank You!', 'Your review has been saved successfully.', [
        { text: 'OK', onPress: () => fetchProject() }
      ]);
    } catch (e: any) {
      console.log('Failed to submit review', e);
      Alert.alert('Error', e.response?.data?.error?.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  useEffect(() => {
    if (id) fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const data = await getProjectById(id as string);
      setProject(data);
      
      // Auto-select the first 'In Progress' milestone if available
      if (data.milestones) {
        const inProgressStep = data.milestones.find((m: any) => m.status === 'In Progress');
        if (inProgressStep) {
          setSelectedStepId(inProgressStep.id);
        }
      }

      // Fetch dynamic progress steps
      try {
        const steps = await getProjectProgress(id as string);
        setProgressSteps(steps || []);
      } catch (e) {
        setProgressSteps([]);
      }
    } catch (error) {
      console.error('Failed to load project', error);
      setProject(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSendSubmission = async () => {
    if (!submissionMessage.trim()) {
      Alert.alert('Required', 'Please enter a submission message or note');
      return;
    }
    if (!project) return;

    try {
      setSubmitLoading(true);
      
      // Compute updated milestones list (just for UI optimistic update if needed, or omit if backend handles)
      const oldMilestones = project.milestones || [];
      const selectedMilestone = oldMilestones.find((m: any) => m.id === selectedStepId);

      const newFileUrl = submissionUrl.trim() || 'https://Kulmis-deliveries.s3.amazonaws.com/assets.zip';
      const fileName = newFileUrl.split('/').pop() || 'deliverable.zip';
      const newFileObj = {
        name: fileName,
        size: '8.4 MB',
        type: 'freelancer',
        url: newFileUrl,
      };
      const updatedFiles = [newFileObj, ...(project.files || [])];

      const newEvent = {
        title: `Work Submitted: ${selectedMilestone?.title || 'Milestone'}`,
        time: new Date().toISOString(),
        desc: `Freelancer submitted work: "${submissionMessage}"`,
      };
      const updatedTimeline = [newEvent, ...(project.timeline || [])];

      // Hit the real backend API to submit the step
      await submitProjectStep(project.id, selectedStepId, {
        message: submissionMessage,
        fileUrl: newFileUrl
      });

      // Update remaining metadata for timeline and files
      await updateProject(project.id, {
        timeline: updatedTimeline,
        files: updatedFiles,
      });

      // Trigger notification to Client
      try {
        const { triggerNotification } = require('@/api/notifications');
        await triggerNotification({
          targetUserId: project.clientId,
          title: 'Work Submitted',
          content: `Freelancer submitted work for milestone: ${selectedMilestone?.title}`,
          type: `PROJECT|${project.id}`
        });
      } catch (e) {
        console.warn('Failed to send notification', e);
      }

      // Reset submission states
      setSubmissionMessage('');
      setSubmissionUrl('');
      setShowSubmitForm(false);
      
      Alert.alert('Work Submitted!', 'Your deliverables have been saved and sent to the client for review.', [
        { text: 'OK', onPress: () => fetchProject() }
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to submit milestone work to the backend');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleApproveStep = async () => {
    if (!project) return;
    try {
      setSubmitLoading(true);
      const oldMilestones = project.milestones || [];
      const updatedMilestones = oldMilestones.map(m => {
        if (m.id === selectedStepId) {
          return { ...m, status: 'Approved', feedback: null };
        }
        return m;
      });

      // Auto-set the next step to 'In Progress' if it is pending
      const currentIndex = oldMilestones.findIndex(m => m.id === selectedStepId);
      if (currentIndex !== -1 && currentIndex < oldMilestones.length - 1) {
        const nextMilestone = updatedMilestones[currentIndex + 1];
        if (nextMilestone.status === 'Pending') {
          nextMilestone.status = 'In Progress';
        }
      }

      // Calculate progress percentage
      const approvedCount = updatedMilestones.filter(m => m.status === 'Approved' || m.status === 'Completed').length;
      const newProgress = Math.round((approvedCount / updatedMilestones.length) * 100);

      // Append new timeline event
      const selectedMilestone = oldMilestones.find(m => m.id === selectedStepId);
      const newEvent = {
        title: `Stage Approved: ${selectedMilestone?.title || 'Milestone'}`,
        time: new Date().toISOString(),
        desc: `Client Hamse Ahmed approved the milestone work and released the associated funds.`,
      };
      const updatedTimeline = [newEvent, ...(project.timeline || [])];

      // Update project status if 100% complete
      const finalStatus = newProgress === 100 ? 'COMPLETED' : 'IN_PROGRESS';

      // Save to backend database
      await updateProject(project.id, {
        progress: newProgress,
        milestones: updatedMilestones,
        timeline: updatedTimeline,
        status: finalStatus,
      });

      // Trigger notification to Freelancer
      try {
        const freelancerId = project.proposals?.[0]?.freelancer?.userId;
        if (freelancerId) {
          const { triggerNotification } = require('@/api/notifications');
          await triggerNotification({
            targetUserId: freelancerId,
            title: 'Milestone Approved',
            content: `Client approved your work for milestone: ${selectedMilestone?.title}`,
            type: `PROJECT|${project.id}`
          });
        }
      } catch (e) {
        console.warn('Failed to send notification', e);
      }

      Alert.alert('Stage Approved!', 'The milestone has been approved and funds released successfully.', [
        { text: 'OK', onPress: () => fetchProject() }
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to approve milestone in the database');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleSendResponse = async () => {
    if (!responseMsg.trim()) return;
    setSubmittingResponse(true);
    
    // Auto-update milestone feedback locally for MVP simulation
    setTimeout(async () => {
      setSavedResponse(responseMsg);
      setResponseMsg('');
      setSubmittingResponse(false);
      
      // Trigger notification to Freelancer about revision
      try {
        const freelancerId = project?.proposals?.[0]?.freelancer?.userId;
        if (freelancerId && project) {
          const { triggerNotification } = require('@/api/notifications');
          await triggerNotification({
            targetUserId: freelancerId,
            title: 'Revision Requested',
            content: `Client requested a revision: "${responseMsg.substring(0, 40)}..."`,
            type: `PROJECT|${project.id}`
          });
        }
      } catch (e) {
        console.warn('Failed to send notification', e);
      }
      
      Alert.alert('Success', 'Your response to the feedback was sent successfully.');
    }, 800);
  };

  const handleAcceptAndStartPlan = async () => {
    if (!project) return;
    try {
      setSubmitLoading(true);
      const startMilestones = [
        { id: '1', title: 'Concept & Brief', status: 'In Progress', price: Number(project.budget) * 0.2 },
        { id: '2', title: 'Initial Draft & Wireframes', status: 'Pending', price: Number(project.budget) * 0.4 },
        { id: '3', title: 'UI Design & Prototyping', status: 'Pending', price: Number(project.budget) * 0.3 },
        { id: '4', title: 'Final Delivery', status: 'Pending', price: Number(project.budget) * 0.1 },
      ];

      const startTimeline = [
        { title: 'Project Plan Accepted', time: new Date().toISOString(), desc: 'Freelancer accepted the project and started Stage 1: "Concept & Brief".' },
        { title: 'Contract Initiated', time: project.createdAt || new Date().toISOString(), desc: 'Client and Freelancer successfully connected. Escrow fully deposited.' }
      ];

      await updateProject(project.id, {
        isPlanSubmitted: true,
        progress: 0,
        milestones: startMilestones,
        timeline: startTimeline,
      });

      // Trigger notification to Client
      try {
        const { triggerNotification } = require('@/api/notifications');
        await triggerNotification({
          targetUserId: project.clientId,
          title: 'Project Started',
          content: `Freelancer ${user?.firstName} has accepted the project and initialized the milestone plan.`,
          type: `PROJECT|${project.id}`
        });
      } catch (e) {
        console.warn('Failed to send notification', e);
      }

      Alert.alert('Project Started!', 'You have successfully started the project and initialized the milestone plan.', [
        { text: 'OK', onPress: () => fetchProject() }
      ]);
    } catch (e: any) {
      console.log('Failed to start project', e);
      Alert.alert('Error', 'Failed to start project. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleRequestRevisions = async () => {
    if (!project) return;
    if (!revisionFeedback.trim()) {
      Alert.alert('Required', 'Please enter comments explaining what needs to be changed.');
      return;
    }
    try {
      setSubmitLoading(true);
      const oldMilestones = project.milestones || [];
      const updatedMilestones = oldMilestones.map(m => {
        if (m.id === selectedStepId) {
          return { 
            ...m, 
            status: 'In Progress', 
            feedback: revisionFeedback 
          };
        }
        return m;
      });

      const selectedMilestone = oldMilestones.find(m => m.id === selectedStepId);
      const newEvent = {
        title: `Revisions Requested: ${selectedMilestone?.title || 'Milestone'}`,
        time: new Date().toISOString(),
        desc: `Client requested revisions: "${revisionFeedback}"`,
      };
      const updatedTimeline = [newEvent, ...(project.timeline || [])];

      await updateProject(project.id, {
        milestones: updatedMilestones,
        timeline: updatedTimeline,
      });

      // Trigger notification to Freelancer
      try {
        const freelancerId = project.proposals?.[0]?.freelancer?.userId;
        if (freelancerId) {
          const { triggerNotification } = require('@/api/notifications');
          await triggerNotification({
            targetUserId: freelancerId,
            title: 'Revision Requested',
            content: `Client requested a revision for milestone: ${selectedMilestone?.title}`,
            type: `PROJECT|${project.id}`
          });
        }
      } catch (e) {
        console.warn('Failed to send notification', e);
      }

      setRevisionFeedback('');
      setShowRevisionForm(false);
      Alert.alert('Revision Request Sent', 'The freelancer has been notified of your requested changes.', [
        { text: 'OK', onPress: () => fetchProject() }
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to request milestone revisions in the database');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleStartChat = async (participantId: string, participantName: string) => {
    try {
      setSubmitLoading(true);
      const convo = await createConversation(participantId);
      router.push({
        pathname: '/chat/[id]',
        params: { id: convo.id, name: participantName }
      });
    } catch (e) {
      console.error('Failed to create conversation', e);
      Alert.alert('Error', 'Failed to start conversation. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary[600]} />
        <Text style={styles.loadingText}>Loading job details...</Text>
      </SafeAreaView>
    );
  }

  if (!project) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={Colors.neutral[400]} />
        <Text style={styles.notFoundText}>Job not found</Text>
        <TouchableOpacity style={styles.backHomeBtn} onPress={() => router.back()}>
          <Text style={styles.backHomeText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const milestonesList = project.milestones || [];
  const selectedStepTitle = milestonesList.find(m => m.id === selectedStepId)?.title || 'Milestone';
  const acceptedProposal = project?.proposals?.find((p: any) => p.status === 'ACCEPTED');
  const freelancer = acceptedProposal?.freelancer?.user;
  const freelancerId = freelancer?.id;
  const clientReview = project?.reviews?.find((r: any) => r.reviewerId === project.clientId || r.reviewer?.id === project.clientId);
  const hasReviewed = !!clientReview;

  const freelancerInvitation = project.invitations?.find((inv: any) => inv.freelancerId === user?.userId);
  const isProjectBased = freelancerInvitation?.jobType === 'PROJECT_BASED' || (!freelancerInvitation && project.budget > 0);
  const isEscrowFunded = project.escrow?.status === 'HELD';
  const canStart = !isProjectBased || isEscrowFunded;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary[900]} />
      
      {/* Header section with blue background */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconCircle}>
            <Ionicons name="arrow-back" size={20} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Job Hub</Text>
          <TouchableOpacity style={styles.iconCircle}>
            <Ionicons name="ellipsis-horizontal" size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.jobTitleSection}>
          <View style={styles.jobIconWrap}>
            <Ionicons name="briefcase" size={24} color={Colors.primary[600]} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.jobName, { color: Colors.white }]} numberOfLines={1}>{project.title}</Text>
            <Text style={[styles.companyName, { color: Colors.white }]}>Client: {project.client?.firstName} {project.client?.lastName}</Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>
              {project.status === 'IN_PROGRESS' ? 'Active' : project.status}
            </Text>
          </View>
        </View>

        {/* Tab Selection */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'details' && styles.activeTabButton]}
            onPress={() => setActiveTab('details')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'details' && styles.activeTabButtonText]}>Details</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'progress' && styles.activeTabButton]}
            onPress={() => setActiveTab('progress')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'progress' && styles.activeTabButtonText]}>Progress</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'timeline' && styles.activeTabButton]}
            onPress={() => setActiveTab('timeline')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'timeline' && styles.activeTabButtonText]}>Timeline</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'files' && styles.activeTabButton]}
            onPress={() => setActiveTab('files')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'files' && styles.activeTabButtonText]}>Files</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Tab 1: Details */}
        {activeTab === 'details' && (
          <View style={styles.sectionWrap}>
            {!project.isPlanSubmitted && project.status !== 'COMPLETED' && (
              user?.role === 'FREELANCER' ? (
                <View style={[styles.card, { borderColor: Colors.primary[650], borderWidth: 1.5, backgroundColor: 'rgba(239,246,255,0.4)', marginBottom: 16 }]}>
                  <Text style={[styles.cardHeader, { color: Colors.primary[700], marginBottom: 8 }]}>🚀 Welcome to the Project!</Text>
                  <Text style={{ fontSize: 14, color: Colors.neutral[600], lineHeight: 20, marginBottom: 16 }}>
                    {canStart 
                      ? "You can now accept the project and submit the milestone plan to start working." 
                      : "The client hasn't funded the escrow yet. Don't start until the business pays escrow."}
                  </Text>
                  <TouchableOpacity 
                    style={[styles.primaryActionBtn, !canStart && { backgroundColor: Colors.neutral[400] }]} 
                    onPress={canStart ? handleOpenAccept : () => {
                      Alert.alert('Escrow Required', 'Don\'t start until the project money business will pay escrow');
                    }}
                  >
                    <Ionicons name="rocket-outline" size={20} color={Colors.white} />
                    <Text style={styles.primaryActionText}>{canStart ? 'Accept & Start Project' : 'Waiting for Escrow'}</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={[styles.card, { borderColor: Colors.primary[400], borderWidth: 1.5, backgroundColor: 'rgba(239,246,255,0.6)', marginBottom: 16 }]}>
                  <Text style={[styles.cardHeader, { color: Colors.primary[700], marginBottom: 8 }]}>⏳ Waiting for Freelancer Acceptance</Text>
                  <Text style={{ fontSize: 14, color: Colors.neutral[600], lineHeight: 20 }}>
                    Your escrow payment of ${project.budget} is held securely. We are waiting for the freelancer to review, accept, and start the project.
                  </Text>
                </View>
              )
            )}
            {project.status === 'COMPLETED' && user?.role === 'CLIENT' && !hasReviewed && (
              <TouchableOpacity 
                style={[styles.card, { backgroundColor: '#FEF3C7', borderColor: '#F59E0B', borderWidth: 1.5 }]} 
                onPress={() => setActiveTab('files')}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md }}>
                  <Ionicons name="star" size={32} color="#D97706" />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.cardHeader, { marginBottom: 2, color: '#92400E' }]}>Rate & Review Freelancer</Text>
                    <Text style={{ fontSize: 13, color: '#B45309' }}>
                      This contract is completed! Rate {freelancer?.firstName || 'the freelancer'} now to share your feedback.
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#D97706" />
                </View>
              </TouchableOpacity>
            )}

            <View style={styles.jobStatsRow}>
              <View style={styles.statItem}>
                <Ionicons name="wallet-outline" size={20} color={Colors.primary[600]} />
                <View>
                  <Text style={[styles.statLabel, { color: textSecondary }]}>Budget</Text>
                  <Text style={[styles.statValue, { color: textPrimary }]}>${project.budget}</Text>
                </View>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="calendar-outline" size={20} color={Colors.primary[600]} />
                <View>
                  <Text style={[styles.statLabel, { color: textSecondary }]}>Started</Text>
                  <Text style={[styles.statValue, { color: textPrimary }]}>{new Date(project.createdAt).toLocaleDateString()}</Text>
                </View>
              </View>
            </View>

            {user?.role === 'FREELANCER' ? (
              <View style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
                <Text style={[styles.cardHeader, { color: textPrimary }]}>About the Client</Text>
                <View style={styles.clientCard}>
                  <View style={styles.clientAvatar}>
                    <Text style={styles.clientAvatarText}>
                      {project.client?.firstName?.charAt(0) || 'C'}
                    </Text>
                  </View>
                  <View style={styles.clientInfo}>
                    <Text style={[styles.clientName, { color: textPrimary }]}>{project.client?.firstName} {project.client?.lastName}</Text>
                    <Text style={[styles.clientMeta, { color: textSecondary }]}>Verified Kulmis Partner</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.messageBtn} 
                    onPress={() => handleStartChat(project.clientId, `${project.client?.firstName} ${project.client?.lastName}`)}
                  >
                    <Ionicons name="chatbubble-ellipses" size={20} color={Colors.primary[600]} />
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
                <Text style={[styles.cardHeader, { color: textPrimary }]}>About the Freelancer</Text>
                <View style={styles.clientCard}>
                  <View style={styles.clientAvatar}>
                    <Text style={styles.clientAvatarText}>
                      {freelancer?.firstName?.charAt(0) || 'F'}
                    </Text>
                  </View>
                  <View style={styles.clientInfo}>
                    <Text style={[styles.clientName, { color: textPrimary }]}>{freelancer?.firstName || 'Assigned'} {freelancer?.lastName || 'Freelancer'}</Text>
                    <Text style={[styles.clientMeta, { color: textSecondary }]}>Verified Kulmis Expert</Text>
                  </View>
                  {freelancerId && (
                    <TouchableOpacity 
                      style={styles.messageBtn} 
                      onPress={() => handleStartChat(freelancerId, `${freelancer?.firstName || 'Freelancer'} ${freelancer?.lastName || ''}`)}
                    >
                      <Ionicons name="chatbubble-ellipses" size={20} color={Colors.primary[600]} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            <View style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
              <Text style={[styles.cardHeader, { color: textPrimary }]}>Description</Text>
              <Text style={[styles.descText, { color: textSecondary }]}>{project.description}</Text>
            </View>

            <View style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
              <Text style={[styles.cardHeader, { color: textPrimary }]}>Skills Required</Text>
              <View style={styles.skillsGrid}>
                {['UI Design', 'Figma Mockups', 'Mobile App', 'Wireframes', 'Asset Handoff'].map((sk) => (
                  <View key={sk} style={styles.skillBadge}>
                    <Text style={styles.skillText}>{sk}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Tab 2: Progress */}
        {activeTab === 'progress' && (
          <View style={styles.sectionWrap}>
            {!project.isPlanSubmitted && project.status !== 'COMPLETED' ? (
              <View style={[styles.card, { alignItems: 'center', paddingVertical: 40 }]}>
                <Ionicons name="lock-closed" size={48} color={Colors.neutral[300]} />
                <Text style={[styles.cardHeader, { marginTop: 16, marginBottom: 8 }]}>Progress Plan Locked</Text>
                <Text style={{ fontSize: 14, color: Colors.neutral[500], textAlign: 'center', marginHorizontal: 24, lineHeight: 20 }}>
                  {user?.role === 'FREELANCER' 
                    ? 'Please accept the project on the Details tab first to initialize and unlock the progress plan.' 
                    : 'The progress milestones and status tracking will become visible once the freelancer accepts the project and initializes the plan.'}
                </Text>
              </View>
            ) : (
              <>
                <View style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
                  <Text style={[styles.cardHeader, { color: textPrimary }]}>Overall Progress</Text>
                  {(() => {
                    const approvedMilestones = milestonesList.filter(m => m.status === 'Approved' || m.status === 'Completed').length;
                    const dynamicProgress = milestonesList.length > 0 ? Math.round((approvedMilestones / milestonesList.length) * 100) : 0;
                    return (
                      <>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                          <Text style={[styles.progressPercent, { color: textPrimary }]}>{dynamicProgress}% Complete</Text>
                        </View>
                        <View style={[styles.progressTrack, { backgroundColor: isDark ? '#334155' : Colors.neutral[100] }]}>
                          <View style={[styles.progressFill, { width: `${dynamicProgress}%` }]} />
                        </View>
                      </>
                    );
                  })()}
                </View>

            <Text style={[styles.sectionTitle, { color: textPrimary }]}>Milestone Stages (Tap a stage to submit work)</Text>
            
            {milestonesList.map((m) => {
              const isSelected = selectedStepId === m.id;
              return (
                <TouchableOpacity 
                  key={m.id} 
                  style={[styles.milestoneCard, { backgroundColor: cardBg, borderColor: border }, isSelected && styles.milestoneSelected]}
                  onPress={() => setSelectedStepId(m.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.milestoneIconWrap}>
                    <Ionicons 
                      name={m.status === 'Approved' || m.status === 'Completed' ? 'checkmark-circle' : 'ellipse-outline'} 
                      size={24} 
                      color={m.status === 'Approved' || m.status === 'Completed' ? Colors.success : isSelected ? Colors.primary[600] : Colors.neutral[300]} 
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.milestoneTitle, { color: textPrimary }, isSelected && styles.milestoneTitleSelected]}>{m.title}</Text>
                    <Text style={[styles.milestonePrice, { color: textSecondary }]}>Budget portion: ${m.price}</Text>
                  </View>
                  <View style={[
                    styles.mStatusBadge, 
                    (m.status === 'Approved' || m.status === 'Completed') && styles.statusApproved,
                    (m.status === 'In Review' || m.status === 'Revision Requested') && styles.statusReview,
                    m.status === 'In Progress' && styles.statusProgress
                  ]}>
                    <Text style={[
                      styles.mStatusText,
                      (m.status === 'Approved' || m.status === 'Completed') && styles.textApproved,
                      (m.status === 'In Review' || m.status === 'Revision Requested') && styles.textReview,
                      m.status === 'In Progress' && styles.textProgress
                    ]}>
                      {m.status}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}

            {(() => {
              const selectedMilestone = milestonesList.find(m => m.id === selectedStepId);
              if (!selectedMilestone) return null;

              return (
                <View style={{ marginTop: Spacing.md }}>
                  <Text style={[styles.cardHeader, { fontSize: 16, marginBottom: 8 }]}>
                    Selected Stage Details
                  </Text>
                  <View style={[styles.card, { borderColor: Colors.neutral[200], borderWidth: 1 }]}>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: Colors.neutral[900], marginBottom: 8 }}>
                      {selectedMilestone.title}
                    </Text>
                    
                    {/* Status Indicator */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                      <Text style={{ fontSize: 13, color: Colors.neutral[500], fontWeight: '500' }}>Status:</Text>
                      <View style={[
                        styles.mStatusBadge, 
                        (selectedMilestone.status === 'Approved' || selectedMilestone.status === 'Completed') && styles.statusApproved,
                        (selectedMilestone.status === 'Submitted' || selectedMilestone.status === 'Revision Requested' || selectedMilestone.status === 'In Review') && styles.statusReview,
                        selectedMilestone.status === 'In Progress' && styles.statusProgress
                      ]}>
                        <Text style={[
                          styles.mStatusText,
                          (selectedMilestone.status === 'Approved' || selectedMilestone.status === 'Completed') && styles.textApproved,
                          (selectedMilestone.status === 'Submitted' || selectedMilestone.status === 'Revision Requested' || selectedMilestone.status === 'In Review') && styles.textReview,
                          selectedMilestone.status === 'In Progress' && styles.textProgress
                        ]}>
                          {selectedMilestone.status}
                        </Text>
                      </View>
                    </View>

                    {/* Feedback display (Revision Request) */}
                    {selectedMilestone.feedback && (
                      <View style={{ backgroundColor: '#FEF2F2', borderColor: '#EF4444', borderWidth: 1, borderRadius: BorderRadius.md, padding: 12, marginBottom: 12 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                          <Ionicons name="warning-outline" size={16} color="#DC2626" />
                          <Text style={{ fontSize: 13, fontWeight: '700', color: '#991B1B' }}>Revision Requested by Client</Text>
                        </View>
                        <Text style={{ fontSize: 13, color: '#B91C1C', lineHeight: 18 }}>
                          "{selectedMilestone.feedback}"
                        </Text>
                      </View>
                    )}

                    {/* Submission display */}
                    {(selectedMilestone.submissionMessage || selectedMilestone.submissionUrl) && (
                      <View style={{ backgroundColor: Colors.neutral[50], borderRadius: BorderRadius.md, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: Colors.neutral[200] }}>
                        <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.neutral[800], marginBottom: 6 }}>Freelancer Submission</Text>
                        {selectedMilestone.submissionMessage && (
                          <Text style={{ fontSize: 13, color: Colors.neutral[600], lineHeight: 18, marginBottom: 8 }}>
                            "{selectedMilestone.submissionMessage}"
                          </Text>
                        )}
                        {selectedMilestone.submissionUrl && (
                          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }} onPress={() => Alert.alert('Open Link', `Navigating to: ${selectedMilestone.submissionUrl}`)}>
                            <Ionicons name="link-outline" size={16} color={Colors.primary[600]} />
                            <Text style={{ fontSize: 13, color: Colors.primary[650], fontWeight: '600', textDecorationLine: 'underline' }} numberOfLines={1}>
                              {selectedMilestone.submissionUrl}
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    )}

                    {/* ACTIONS based on role */}
                    {user?.role === 'CLIENT' ? (
                      selectedMilestone.status === 'Submitted' ? (
                        showRevisionForm ? (
                          <View style={{ gap: Spacing.sm, marginTop: Spacing.xs }}>
                            <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.neutral[700] }}>Enter Revision Instructions:</Text>
                            <TextInput
                              style={[styles.input, styles.textArea, { minHeight: 60 }]}
                              placeholder="Explain what changes are needed..."
                              value={revisionFeedback}
                              onChangeText={setRevisionFeedback}
                              multiline
                            />
                            <View style={styles.formButtonsRow}>
                              <TouchableOpacity style={[styles.cancelBtn, { height: 40, justifyContent: 'center' }]} onPress={() => setShowRevisionForm(false)}>
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                              </TouchableOpacity>
                              <TouchableOpacity style={[styles.submitSendBtn, { height: 40, backgroundColor: '#D97706' }]} onPress={handleRequestRevisions} disabled={submitLoading}>
                                {submitLoading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.submitSendText}>Send Request</Text>}
                              </TouchableOpacity>
                            </View>
                          </View>
                        ) : (
                          <View style={{ flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.xs }}>
                            <TouchableOpacity 
                              style={[styles.primaryActionBtn, { flex: 1, backgroundColor: '#D97706' }]} 
                              onPress={() => setShowRevisionForm(true)}
                            >
                              <Ionicons name="refresh-outline" size={18} color={Colors.white} />
                              <Text style={[styles.primaryActionText, { fontSize: 13 }]}>Request Revision</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                              style={[styles.primaryActionBtn, { flex: 1.2, backgroundColor: Colors.success }]} 
                              onPress={handleApproveStep}
                              disabled={submitLoading}
                            >
                              {submitLoading ? (
                                <ActivityIndicator color={Colors.white} />
                              ) : (
                                <>
                                  <Ionicons name="checkmark-done-circle" size={18} color={Colors.white} />
                                  <Text style={[styles.primaryActionText, { fontSize: 13 }]}>Approve Stage</Text>
                                </>
                              )}
                            </TouchableOpacity>
                          </View>
                        )
                      ) : selectedMilestone.status === 'Approved' || selectedMilestone.status === 'Completed' ? (
                        <View style={[styles.primaryActionBtn, { backgroundColor: Colors.success + '20', borderWidth: 1, borderColor: Colors.success, marginTop: Spacing.xs }]}>
                          <Ionicons name="checkmark-done-circle" size={20} color={Colors.success} />
                          <Text style={[styles.primaryActionText, { color: Colors.success }]}>Stage Approved & Released</Text>
                        </View>
                      ) : (
                        <View style={{ padding: 12, backgroundColor: Colors.neutral[50], borderRadius: BorderRadius.md, alignItems: 'center', marginTop: Spacing.xs }}>
                          <Text style={{ fontSize: 13, color: Colors.neutral[500], fontWeight: '500' }}>Waiting for freelancer submission.</Text>
                        </View>
                      )
                    ) : (
                      /* FREELANCER Role actions */
                      selectedMilestone.status === 'Submitted' && !selectedMilestone.feedback ? (
                        <View style={{ padding: 16, backgroundColor: 'rgba(245,158,11,0.06)', borderStyle: 'dashed', borderWidth: 1.5, borderColor: '#F59E0B', borderRadius: BorderRadius.md, alignItems: 'center', marginTop: Spacing.xs }}>
                          <ActivityIndicator color="#F59E0B" size="small" style={{ marginBottom: 6 }} />
                          <Text style={{ fontSize: 13, color: '#D97706', fontWeight: '600' }}>Submitted - Pending Client Review</Text>
                          <Text style={{ fontSize: 11, color: '#B45309', textAlign: 'center', marginTop: 4 }}>
                            The client is reviewing your work. You will be notified once they approve or request changes.
                          </Text>
                        </View>
                      ) : selectedMilestone.status === 'Approved' || selectedMilestone.status === 'Completed' ? (
                        <View style={[styles.primaryActionBtn, { backgroundColor: Colors.success + '20', borderWidth: 1, borderColor: Colors.success, marginTop: Spacing.xs }]}>
                          <Ionicons name="checkmark-done-circle" size={20} color={Colors.success} />
                          <Text style={[styles.primaryActionText, { color: Colors.success }]}>Stage Approved & Paid</Text>
                        </View>
                      ) : showSubmitForm ? (
                        <View style={[styles.submitFormCard, { marginTop: Spacing.xs }]}>
                          <Text style={styles.formHeaderTitle}>Submitting work for: <Text style={{ color: Colors.primary[600] }}>{selectedMilestone.title}</Text></Text>
                          
                          <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Submission Message / Notes *</Text>
                            <TextInput
                              style={[styles.input, styles.textArea]}
                              placeholder="Describe what you completed in this step..."
                              value={submissionMessage}
                              onChangeText={setSubmissionMessage}
                              multiline
                              numberOfLines={4}
                            />
                          </View>

                          <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Deliverable Link (Figma/Drive/GitHub) *</Text>
                            <TextInput
                              style={styles.input}
                              placeholder="https://figma.com/file/... or https://drive.google.com/..."
                              value={submissionUrl}
                              onChangeText={setSubmissionUrl}
                              autoCapitalize="none"
                            />
                          </View>

                          <View style={styles.formButtonsRow}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowSubmitForm(false)}>
                              <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.submitSendBtn} onPress={handleSendSubmission} disabled={submitLoading}>
                              {submitLoading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.submitSendText}>Send to Client</Text>}
                            </TouchableOpacity>
                          </View>
                        </View>
                      ) : (
                        <TouchableOpacity style={[styles.primaryActionBtn, { marginTop: Spacing.xs }]} onPress={() => setShowSubmitForm(true)}>
                          <Ionicons name="cloud-upload-outline" size={20} color={Colors.white} />
                          <Text style={styles.primaryActionText}>
                            {selectedMilestone.feedback ? 'Resubmit Work for Selected Stage' : 'Submit Work for Selected Stage'}
                          </Text>
                        </TouchableOpacity>
                      )
                    )}
                  </View>
                </View>
              );
            })()}
              </>
            )}
          </View>
        )}

        {/* Tab 3: Timeline */}
        {activeTab === 'timeline' && (
          <View style={styles.sectionWrap}>
            <Text style={[styles.sectionTitle, { color: textPrimary }]}>Job Timeline & History</Text>
            {!project.isPlanSubmitted && project.status !== 'COMPLETED' ? (
              <View style={[styles.card, { alignItems: 'center', paddingVertical: 40 }]}>
                <Ionicons name="calendar-outline" size={48} color={Colors.neutral[300]} />
                <Text style={[styles.cardHeader, { marginTop: 16, marginBottom: 8 }]}>Timeline Pending</Text>
                <Text style={{ fontSize: 14, color: Colors.neutral[500], textAlign: 'center', marginHorizontal: 24, lineHeight: 20 }}>
                  Timeline tracking will begin once the project is accepted and started.
                </Text>
              </View>
            ) : (
              <View style={styles.timelineList}>
                {(project.timeline || []).map((t, idx) => (
                  <View key={idx} style={styles.timelineItem}>
                    {idx < (project.timeline || []).length - 1 && <View style={styles.timelineLine} />}
                    <View style={[styles.timelineIcon, { backgroundColor: t.title.includes('Completed') ? Colors.success : Colors.primary[600] }]}>
                      <Ionicons name={t.title.includes('Completed') ? "checkmark" : "notifications-outline"} size={14} color={Colors.white} />
                    </View>
                    <View style={styles.timelineInfo}>
                      <Text style={styles.timelineTitle}>{t.title}</Text>
                      <Text style={styles.timelineTime}>{new Date(t.time).toLocaleDateString()} {new Date(t.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                      <Text style={styles.timelineDesc}>{t.desc}</Text>
                    </View>
                  </View>
                ))}

                {/* Base Timeline Item */}
                <View style={styles.timelineItem}>
                  <View style={[styles.timelineIcon, { backgroundColor: Colors.primary[900] }]}>
                    <Ionicons name="lock-closed" size={14} color={Colors.white} />
                  </View>
                  <View style={styles.timelineInfo}>
                    <Text style={styles.timelineTitle}>Contract Initiated</Text>
                    <Text style={styles.timelineTime}>{new Date(project.createdAt).toLocaleDateString()}</Text>
                    <Text style={styles.timelineDesc}>Client and Freelancer successfully connected. Escrow fully deposited.</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Tab 4: Files */}
        {activeTab === 'files' && (
          <View style={styles.sectionWrap}>
            {!project.isPlanSubmitted && project.status !== 'COMPLETED' ? (
              <View style={[styles.card, { alignItems: 'center', paddingVertical: 40 }]}>
                <Ionicons name="folder-open-outline" size={48} color={Colors.neutral[300]} />
                <Text style={[styles.cardHeader, { marginTop: 16, marginBottom: 8 }]}>No Files Available</Text>
                <Text style={{ fontSize: 14, color: Colors.neutral[500], textAlign: 'center', marginHorizontal: 24, lineHeight: 20 }}>
                  Deliverables will appear here once the freelancer starts the work and submits documents.
                </Text>
              </View>
            ) : (
              <>
                <Text style={[styles.sectionTitle, { color: textPrimary }]}>All Submitted Deliverables ({ (project.files || []).length })</Text>
            
            {(project.files || []).map((f, idx) => (
              <View key={idx} style={[styles.fileItem, { marginBottom: Spacing.md }]}>
                <Ionicons 
                  name={f.type === 'client' ? "document-text" : "archive"} 
                  size={32} 
                  color={f.type === 'client' ? Colors.primary[600] : Colors.success} 
                />
                <View style={{ flex: 1, marginLeft: Spacing.md }}>
                  <Text style={styles.fileName}>{f.name}</Text>
                  <Text style={styles.fileSize}>{f.size} • {f.type === 'client' ? 'Client' : 'Freelancer'} File</Text>
                </View>
                <TouchableOpacity style={styles.downloadBtn}>
                  <Ionicons name="download-outline" size={20} color={f.type === 'client' ? Colors.primary[600] : Colors.success} />
                </TouchableOpacity>
              </View>
            ))}

            {project.status === 'COMPLETED' && (
              <View style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
                <Text style={[styles.cardHeader, { color: textPrimary }]}>Client Review & Rating</Text>
                
                {hasReviewed ? (
                  <View style={styles.reviewContent}>
                    <View style={styles.ratingRow}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Ionicons 
                          key={star} 
                          name="star" 
                          size={24} 
                          color={star <= (clientReview?.rating || 5) ? "#F59E0B" : Colors.neutral[200]} 
                        />
                      ))}
                      <Text style={styles.ratingText}>{(clientReview?.rating || 5.0).toFixed(1)}</Text>
                    </View>
                    <Text style={styles.reviewComment}>
                      "{clientReview?.comment || 'No review comment provided.'}"
                    </Text>
                  </View>
                ) : user?.role === 'CLIENT' ? (
                  <View style={styles.reviewForm}>
                    <Text style={styles.reviewFormTitle}>Rate your experience working with {freelancer?.firstName || 'the freelancer'}</Text>
                    
                    <View style={[styles.ratingRow, { marginVertical: Spacing.md }]}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <TouchableOpacity key={star} onPress={() => setClientRating(star)}>
                          <Ionicons 
                            name={star <= clientRating ? "star" : "star-outline"} 
                            size={32} 
                            color="#F59E0B" 
                            style={{ marginRight: 6 }}
                          />
                        </TouchableOpacity>
                      ))}
                    </View>

                    <TextInput
                      style={[styles.input, styles.textArea, { minHeight: 80, marginBottom: Spacing.md, textAlignVertical: 'top', paddingTop: 8 }]}
                      placeholder={`Tell others how it went working with ${freelancer?.firstName || 'freelancer'}...`}
                      value={clientComment}
                      onChangeText={setClientComment}
                      multiline
                      numberOfLines={3}
                    />

                    <TouchableOpacity 
                      style={[styles.primaryActionBtn, { backgroundColor: Colors.primary[700], marginTop: 0 }]} 
                      onPress={handleSubmitReview}
                      disabled={submittingReview}
                    >
                      {submittingReview ? (
                        <ActivityIndicator color={Colors.white} />
                      ) : (
                        <>
                          <Ionicons name="send" size={16} color={Colors.white} />
                          <Text style={styles.primaryActionText}>Submit Review</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={{ paddingVertical: Spacing.md, alignItems: 'center' }}>
                    <Ionicons name="hourglass-outline" size={32} color={Colors.neutral[400]} />
                    <Text style={{ color: Colors.neutral[500], marginTop: Spacing.sm, fontSize: FontSize.sm, textAlign: 'center' }}>
                      Waiting for client {project.client?.firstName} {project.client?.lastName} to submit a rating & review.
                    </Text>
                  </View>
                )}
              </View>
            )}
              </>
            )}
          </View>
        )}

      </ScrollView>

      {/* Template Selection Modal */}
      <Modal visible={showAcceptModal} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 }}>
          <View style={{ backgroundColor: Colors.white, borderRadius: 16, padding: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: Colors.neutral[900] }}>Choose Progress Tracking</Text>
              <TouchableOpacity onPress={() => {
                setShowAcceptModal(false);
                router.push('/progress-templates');
              }}>
                <Text style={{ color: Colors.primary[600], fontWeight: '600' }}>+ Add</Text>
              </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 14, color: Colors.neutral[600], marginBottom: 16 }}>Select a progress template to apply to this project.</Text>
            
            {loadingTemplates ? (
              <ActivityIndicator size="large" color={Colors.primary[600]} style={{ marginVertical: 40 }} />
            ) : templates.length > 0 ? (
              <FlatList
                data={templates}
                keyExtractor={item => item.id}
                style={{ maxHeight: 300, marginVertical: 12 }}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      { padding: 16, borderRadius: 12, borderWidth: 1, borderColor: Colors.neutral[200], marginBottom: 12 },
                      selectedTemplateId === item.id && { borderColor: Colors.primary[600], backgroundColor: 'rgba(37,99,235,0.05)' }
                    ]}
                    onPress={() => setSelectedTemplateId(item.id)}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={[
                        { fontSize: 16, fontWeight: '600', color: Colors.neutral[900] },
                        selectedTemplateId === item.id && { color: Colors.primary[700] }
                      ]}>{item.name}</Text>
                      {selectedTemplateId === item.id && <Ionicons name="checkmark-circle" size={20} color={Colors.primary[600]} />}
                    </View>
                    <Text style={{ fontSize: 13, color: Colors.neutral[500], marginTop: 4 }}>{item.steps.length} steps</Text>
                  </TouchableOpacity>
                )}
              />
            ) : (
              <View style={{ marginVertical: 20, alignItems: 'center' }}>
                <Text style={{ color: Colors.neutral[500], marginBottom: 12 }}>No templates found.</Text>
                <TouchableOpacity 
                  style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: Colors.primary[600] }}
                  onPress={() => {
                    setShowAcceptModal(false);
                    router.push('/progress-templates');
                  }}
                >
                  <Text style={{ color: Colors.primary[600], fontWeight: '600' }}>Create New Template</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
              <TouchableOpacity 
                style={{ flex: 1, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: Colors.neutral[300], alignItems: 'center' }} 
                onPress={() => { setShowAcceptModal(false); setSelectedTemplateId(null); }}
              >
                <Text style={{ color: Colors.neutral[700], fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  { flex: 1, paddingVertical: 12, borderRadius: 8, backgroundColor: Colors.primary[600], alignItems: 'center' },
                  (!selectedTemplateId || loadingTemplates || submitLoading) && { opacity: 0.5 }
                ]}
                onPress={handleConfirmAccept} 
                disabled={!selectedTemplateId || loadingTemplates || submitLoading} 
              >
                {submitLoading ? <ActivityIndicator color={Colors.white} size="small" /> : <Text style={{ color: Colors.white, fontWeight: '600' }}>Confirm & Start</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: Spacing.xl,
  },
  loadingText: {
    marginTop: Spacing.md,
    color: Colors.neutral[500],
    fontSize: FontSize.md,
  },
  notFoundText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.neutral[700],
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
  backHomeBtn: {
    backgroundColor: Colors.primary[600],
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  backHomeText: {
    color: Colors.white,
    fontWeight: 'bold',
  },
  header: {
    backgroundColor: Colors.primary[900],
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
  jobTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  jobIconWrap: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  jobName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.white,
    marginBottom: 2,
  },
  companyName: {
    fontSize: FontSize.xs,
    color: Colors.neutral[300],
  },
  statusBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    color: Colors.white,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  tabContainer: {
    flexDirection: 'row',
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  tabButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {
    borderBottomColor: Colors.white,
  },
  tabButtonText: {
    color: 'rgba(255,255,255,0.6)',
    fontWeight: FontWeight.semibold,
    fontSize: FontSize.sm,
  },
  activeTabButtonText: {
    color: Colors.white,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  sectionWrap: {
    gap: Spacing.lg,
  },
  jobStatsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.neutral[150],
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: Colors.neutral[400],
  },
  statValue: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.neutral[900],
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.neutral[150],
  },
  cardHeader: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.neutral[900],
    marginBottom: Spacing.md,
  },
  clientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  clientAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  clientAvatarText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.primary[700],
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.neutral[900],
  },
  clientMeta: {
    fontSize: FontSize.xs,
    color: Colors.neutral[400],
    marginTop: 2,
  },
  messageBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  descText: {
    fontSize: FontSize.sm,
    color: Colors.neutral[600],
    lineHeight: 22,
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  skillBadge: {
    backgroundColor: Colors.neutral[100],
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  skillText: {
    fontSize: FontSize.xs,
    color: Colors.neutral[700],
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.neutral[900],
    marginBottom: 4,
  },
  progressPercent: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.neutral[800],
    marginBottom: Spacing.xs,
  },
  progressTrack: {
    height: 8,
    backgroundColor: Colors.neutral[150],
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.success,
  },
  milestoneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.neutral[150],
  },
  milestoneSelected: {
    borderColor: Colors.primary[500],
    borderWidth: 2,
    backgroundColor: Colors.primary[50] + '15',
  },
  milestoneIconWrap: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  milestoneTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.neutral[900],
  },
  milestoneTitleSelected: {
    color: Colors.primary[700],
    fontWeight: FontWeight.bold,
  },
  milestonePrice: {
    fontSize: FontSize.xs,
    color: Colors.neutral[500],
    marginTop: 2,
  },
  mStatusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.neutral[100],
  },
  mStatusText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.neutral[500],
  },
  statusApproved: { backgroundColor: 'rgba(16,185,129,0.1)' },
  textApproved: { color: Colors.success },
  statusReview: { backgroundColor: 'rgba(245,158,11,0.1)' },
  textReview: { color: '#F59E0B' },
  statusProgress: { backgroundColor: 'rgba(37,99,235,0.1)' },
  textProgress: { color: Colors.primary[600] },
  primaryActionBtn: {
    backgroundColor: Colors.primary[600],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
    height: 48,
  },
  primaryActionText: {
    color: Colors.white,
    fontWeight: FontWeight.bold,
    fontSize: FontSize.md,
  },
  submitFormCard: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  formHeaderTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.neutral[800],
  },
  inputGroup: {
    gap: 4,
  },
  inputLabel: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.neutral[600],
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSize.sm,
    color: Colors.neutral[900],
    backgroundColor: Colors.neutral[50],
  },
  textArea: {
    minHeight: 80,
  },
  formButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.neutral[300],
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontWeight: FontWeight.semibold,
    color: Colors.neutral[600],
  },
  submitSendBtn: {
    flex: 1,
    backgroundColor: Colors.primary[600],
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitSendText: {
    color: Colors.white,
    fontWeight: FontWeight.bold,
  },
  timelineList: {
    paddingLeft: Spacing.md,
  },
  timelineItem: {
    flexDirection: 'row',
    paddingBottom: Spacing.xl,
  },
  timelineLine: {
    position: 'absolute',
    left: 12,
    top: 24,
    bottom: 0,
    width: 2,
    backgroundColor: Colors.neutral[200],
  },
  timelineIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
    zIndex: 1,
  },
  timelineInfo: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.neutral[900],
  },
  timelineTime: {
    fontSize: FontSize.xs,
    color: Colors.neutral[400],
    marginTop: 2,
  },
  timelineDesc: {
    fontSize: FontSize.xs,
    color: Colors.neutral[500],
    lineHeight: 16,
    marginTop: 4,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.neutral[150],
  },
  fileName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.neutral[900],
  },
  fileSize: {
    fontSize: FontSize.xs,
    color: Colors.neutral[400],
    marginTop: 2,
  },
  downloadBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.neutral[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewContent: {
    backgroundColor: Colors.neutral[50],
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: Spacing.sm,
  },
  ratingText: {
    marginLeft: Spacing.sm,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.neutral[850],
  },
  reviewComment: {
    fontSize: FontSize.sm,
    color: Colors.neutral[600],
    fontStyle: 'italic',
    lineHeight: 20,
  },
  savedResponseCard: {
    backgroundColor: 'rgba(37,99,235,0.04)',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.primary[100],
  },
  responseLabel: {
    fontSize: FontSize.xs,
    fontWeight: 'bold',
    color: Colors.primary[700],
    marginBottom: 4,
  },
  responseText: {
    fontSize: FontSize.xs,
    color: Colors.neutral[700],
    fontStyle: 'italic',
  },
  responseInputSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  responseInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSize.sm,
    backgroundColor: Colors.neutral[50],
  },
  sendResponseBtn: {
    backgroundColor: Colors.primary[600],
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewForm: {
    paddingVertical: Spacing.sm,
  },
  reviewFormTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.neutral[850],
  },
});
