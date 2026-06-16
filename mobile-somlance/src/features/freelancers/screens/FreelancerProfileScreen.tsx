import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Image, Dimensions, Modal, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadows } from '@/theme';
import { Button } from '@/components/ui/Button';
import { getProfile, toggleFavorite, getFavorites } from '@/api/users';
import { createConversation } from '@/api/messages';
import { useAuthStore } from '@/store/authStore';
import { useDarkColors } from '@/store/themeStore';
import { useFavoritesStore } from '@/store/favoritesStore';

const { width } = Dimensions.get('window');

type Tab = 'About' | 'Reviews' | 'Portfolio' | 'Certificates' | 'Projects';

export default function FreelancerProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuthStore();
  const { isDark, bg, cardBg, textPrimary, textSecondary, textMuted, border, statusBar, iconBg } = useDarkColors();
  const { favorites, toggleFavorite: storeToggleFavorite } = useFavoritesStore();
  const [activeTab, setActiveTab] = useState<Tab>('About');
  const [user, setUser] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [selectedPortfolio, setSelectedPortfolio] = useState<any>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<any>(null);
  const [creatingChat, setCreatingChat] = useState(false);

  const isFavorite = favorites.includes(id);

  useEffect(() => {
    if (id) {
      fetchLiveProfile();
    }
  }, [id]);

  const fetchLiveProfile = async () => {
    try {
      setLoadingProfile(true);
      const data = await getProfile(id!);
      setUser(data);
    } catch (e) {
      console.log("Failed to fetch freelancer profile", e);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    await storeToggleFavorite(user.id);
  };

  const handleMessage = async () => {
    if (creatingChat) return;
    try {
      setCreatingChat(true);
      const conv = await createConversation(user.id);
      router.push({
        pathname: '/chat/[id]',
        params: { id: conv.id, name: `${user.firstName} ${user.lastName}` }
      });
    } catch (err) {
      console.log('Error creating conversation', err);
    } finally {
      setCreatingChat(false);
    }
  };

  if (loadingProfile) {
    return (
      <View style={[s.container, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center', backgroundColor: bg }]}>
        <ActivityIndicator size="large" color={Colors.primary[600]} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[s.container, { paddingTop: insets.top, backgroundColor: bg }]}>
        <View style={[s.header, { backgroundColor: bg }]}>
          <TouchableOpacity onPress={() => router.back()} style={[s.iconBtn, { backgroundColor: iconBg }]}>
            <Ionicons name="chevron-back" size={24} color={textPrimary} />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 16, color: textSecondary }}>Freelancer not found.</Text>
        </View>
      </View>
    );
  }

  const fp = user.freelancerProfile || {};
  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();

  return (
    <View style={[s.container, { backgroundColor: bg }]}>
      <StatusBar barStyle={statusBar} />
      
      {/* Custom Header */}
      <View style={[s.header, { paddingTop: insets.top + 10, backgroundColor: bg }]}>
        <TouchableOpacity onPress={() => router.back()} style={[s.iconBtn, { backgroundColor: iconBg }]}>
          <Ionicons name="chevron-back" size={24} color={textPrimary} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: textPrimary }]}>Freelancer Details</Text>
        <TouchableOpacity style={[s.iconBtn, { backgroundColor: iconBg }]} onPress={handleToggleFavorite}>
          <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={22} color={isFavorite ? Colors.error : textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Profile Intro */}
        <View style={s.profileSection}>
          <View style={s.avatarContainer}>
            {user.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={[s.avatar, { borderColor: isDark ? border : Colors.neutral[50] }]} />
            ) : (
              <View style={[s.avatar, s.placeholderAv, { borderColor: isDark ? border : Colors.neutral[50] }]}>
                <Text style={s.placeholderText}>{initials}</Text>
              </View>
            )}
            {user.isVerified && (
              <View style={s.verifiedBadge}>
                <Ionicons name="checkmark" size={12} color={Colors.white} />
              </View>
            )}
          </View>
          
          <Text style={[s.name, { color: textPrimary }]}>{user.firstName} {user.lastName}</Text>
          <Text style={[s.role, { color: textSecondary }]}>{fp.title || 'Freelancer'}</Text>
          
          <View style={s.ratingRow}>
            <Ionicons name="star" size={16} color="#F59E0B" />
            <Text style={[s.ratingVal, { color: textPrimary }]}>{Number(user.avgRating || 0).toFixed(1)}</Text>
            <Text style={[s.ratingCount, { color: textMuted }]}>({user.totalReviews || 0} Reviews)</Text>
          </View>

          {/* Stats Boxes */}
          <View style={s.statsGrid}>
            <View style={[s.statBox, { backgroundColor: iconBg }]}>
              <Text style={s.statValue}>${fp.hourlyRate || 0}</Text>
              <Text style={[s.statLabel, { color: textSecondary }]}>Price</Text>
            </View>
            <View style={[s.statBox, { backgroundColor: iconBg }]}>
              <Text style={s.statValue}>98%</Text>
              <Text style={[s.statLabel, { color: textSecondary }]}>Job Success</Text>
            </View>
            <View style={[s.statBox, { backgroundColor: iconBg }]}>
              <Text style={s.statValue}>{(user.reviewsReceived || []).length}</Text>
              <Text style={[s.statLabel, { color: textSecondary }]}>Projects Done</Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ borderBottomWidth: 1, borderBottomColor: border, marginTop: 30 }} contentContainerStyle={{ paddingHorizontal: 20 }}>
          {(['About', 'Reviews', 'Portfolio', 'Certificates', 'Projects'] as Tab[]).map((tab) => (
            <TouchableOpacity 
              key={tab} 
              onPress={() => setActiveTab(tab)}
              style={[s.tab, activeTab === tab && s.activeTab]}
            >
              <Text style={[s.tabText, { color: textMuted }, activeTab === tab && s.activeTabText]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Tab Content */}
        <View style={s.tabContent}>
          {activeTab === 'About' && (
            <View style={s.aboutContent}>
              <Text style={[s.bioTitle, { color: textPrimary }]}>Biography</Text>
              <Text style={[s.bioText, { color: textSecondary }]}>{fp.bio || 'No biography provided.'}</Text>
              
              <Text style={[s.bioTitle, { marginTop: 20, color: textPrimary }]}>Skills</Text>
              <View style={s.skillsGrid}>
                {fp.skills && fp.skills.length > 0 ? fp.skills.map((skill: any) => (
                  <View key={skill.id || skill.name} style={[s.skillChip, { backgroundColor: iconBg }]}>
                    <Text style={[s.skillChipText, { color: textPrimary }]}>{skill.name}</Text>
                  </View>
                )) : <Text style={[s.bioText, { color: textSecondary }]}>No skills listed.</Text>}
              </View>
            </View>
          )}

          {activeTab === 'Reviews' && (
            <View style={s.reviewsContent}>
              <View style={s.reviewsHeader}>
                <Text style={[s.reviewsTitle, { color: textPrimary }]}>Client Reviews</Text>
              </View>
              {user.reviewsReceived && user.reviewsReceived.length > 0 ? user.reviewsReceived.map((rev: any) => (
                <View key={rev.id} style={[s.reviewCard, { backgroundColor: iconBg }]}>
                  <View style={s.revHeader}>
                    <View style={s.revUser}>
                      <View style={[s.revAvatar, { backgroundColor: isDark ? border : Colors.neutral[200] }]} />
                      <View>
                        <Text style={[s.revName, { color: textPrimary }]}>{rev.reviewer?.firstName} {rev.reviewer?.lastName}</Text>
                        <View style={s.revStars}>
                          {[...Array(5)].map((_, i) => (
                            <Ionicons key={i} name="star" size={12} color={i < rev.rating ? "#F59E0B" : (isDark ? border : "#D1D5DB")} />
                          ))}
                        </View>
                      </View>
                    </View>
                    <Text style={[s.revDate, { color: textMuted }]}>{new Date(rev.createdAt).toLocaleDateString()}</Text>
                  </View>
                  <Text style={[s.revText, { color: textSecondary }]}>{rev.comment}</Text>
                </View>
              )) : (
                <Text style={[s.emptyMsg, { color: textMuted }]}>No reviews yet.</Text>
              )}
            </View>
          )}

          {activeTab === 'Portfolio' && (
            <View style={s.portfolioGrid}>
              {fp.portfolios && fp.portfolios.length > 0 ? (
                fp.portfolios.map((p: any, idx: number) => (
                  <TouchableOpacity key={idx} style={[s.portfolioCard, { backgroundColor: cardBg, borderColor: border }]} onPress={() => setSelectedPortfolio(p)} activeOpacity={0.8}>
                    <Image 
                      source={{ uri: p.imageUrl || 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800' }} 
                      style={s.portfolioImg} 
                    />
                    <View style={s.portfolioInfo}>
                      <Text style={[s.portfolioTitle, { color: textPrimary }]}>{p.title}</Text>
                      {p.description ? <Text style={[s.portfolioDesc, { color: textSecondary }]} numberOfLines={1}>{p.description}</Text> : null}
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={[s.emptyMsg, { color: textMuted }]}>No portfolio items yet.</Text>
              )}
            </View>
          )}

          {activeTab === 'Certificates' && (
            <View style={s.portfolioGrid}>
              {fp.certificates && fp.certificates.length > 0 ? (
                fp.certificates.map((c: any, idx: number) => (
                  <TouchableOpacity key={idx} style={[s.portfolioCard, { backgroundColor: cardBg, borderColor: border }]} onPress={() => setSelectedCertificate(c)} activeOpacity={0.8}>
                    <Image 
                      source={{ uri: c.imageUrl || 'https://images.unsplash.com/photo-1589330694653-efa648338d64?w=800' }} 
                      style={s.portfolioImg} 
                    />
                    <View style={s.portfolioInfo}>
                      <Text style={[s.portfolioTitle, { color: textPrimary }]}>{c.name}</Text>
                      <Text style={[s.portfolioDesc, { color: textSecondary }]} numberOfLines={1}>{c.issuingOrg}</Text>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={[s.emptyMsg, { color: textMuted }]}>No certificates available.</Text>
              )}
            </View>
          )}

          {activeTab === 'Projects' && (
            <View style={{ gap: 15 }}>
              {fp.proposals && fp.proposals.length > 0 ? (
                fp.proposals.map((p: any) => (
                  <TouchableOpacity 
                    key={p.id} 
                    style={[s.reviewCard, { backgroundColor: iconBg }]}
                    onPress={() => router.push({ pathname: '/public-job-details', params: { id: p.project.id } })}
                  >
                    <Text style={[s.portfolioTitle, { color: textPrimary, fontSize: 16, marginBottom: 8 }]}>{p.project.title}</Text>
                    <Text style={[s.revText, { color: textSecondary }]} numberOfLines={2}>
                      {(p.project.description || '').split('---METADATA---')[0].trim()}
                    </Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-start', marginTop: 12, alignItems: 'center' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        {p.project.client?.avatarUrl ? (
                          <Image source={{ uri: p.project.client.avatarUrl }} style={{ width: 24, height: 24, borderRadius: 12 }} />
                        ) : (
                          <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.neutral[200], justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ fontSize: 10, fontWeight: 'bold' }}>{p.project.client?.firstName?.[0]}</Text>
                          </View>
                        )}
                        <Text style={{ color: textMuted, fontSize: 12 }}>{p.project.client?.firstName} {p.project.client?.lastName}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={[s.emptyMsg, { color: textMuted }]}>No completed projects yet.</Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Fixed Bottom Bar */}
      <View style={[s.bottomBar, { paddingBottom: insets.bottom + 12, backgroundColor: bg, borderTopColor: border }]}>
        <TouchableOpacity 
          style={s.msgBtn} 
          onPress={handleMessage}
          disabled={creatingChat}
        >
          {creatingChat ? (
            <ActivityIndicator size="small" color={Colors.primary[700]} />
          ) : (
            <Ionicons name="chatbubble-outline" size={24} color={Colors.primary[700]} />
          )}
        </TouchableOpacity>
        <TouchableOpacity 
          style={s.hireBtn}
          onPress={() => router.push({
            pathname: '/create-project',
            params: { freelancerId: user.id, name: `${user.firstName} ${user.lastName}` }
          })}
        >
          <Text style={s.hireBtnText}>Hire Now</Text>
        </TouchableOpacity>
      </View>

      {/* Portfolio Detail Modal */}
      <Modal visible={!!selectedPortfolio} transparent animationType="fade" onRequestClose={() => setSelectedPortfolio(null)}>
        <View style={s.modalOverlay}>
          <View style={[s.modalContent, { backgroundColor: bg }]}>
            <Image source={{ uri: selectedPortfolio?.imageUrl || 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800' }} style={s.modalImg} />
            <View style={s.modalBody}>
              <Text style={[s.modalTitle, { color: textPrimary }]}>{selectedPortfolio?.title}</Text>
              {selectedPortfolio?.link ? (
                <Text style={s.modalLink}>{selectedPortfolio.link}</Text>
              ) : null}
              <ScrollView style={{ maxHeight: 150, marginVertical: 10 }}>
                <Text style={[s.modalDesc, { color: textSecondary }]}>{selectedPortfolio?.description}</Text>
              </ScrollView>
              <Button title="Close" onPress={() => setSelectedPortfolio(null)} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Certificate Detail Modal */}
      <Modal visible={!!selectedCertificate} transparent animationType="fade" onRequestClose={() => setSelectedCertificate(null)}>
        <View style={s.modalOverlay}>
          <View style={[s.modalContent, { backgroundColor: bg }]}>
            <Image source={{ uri: selectedCertificate?.imageUrl || 'https://images.unsplash.com/photo-1589330694653-efa648338d64?w=800' }} style={[s.modalImg, { resizeMode: 'contain', backgroundColor: isDark ? border : Colors.neutral[100] }]} />
            <View style={s.modalBody}>
              <Text style={[s.modalTitle, { color: textPrimary }]}>{selectedCertificate?.name}</Text>
              <Text style={[s.modalSubtitle, { color: textSecondary }]}>{selectedCertificate?.issuingOrg}</Text>
              {selectedCertificate?.issueDate && (
                <Text style={[s.modalDate, { color: textMuted }]}>Issued: {new Date(selectedCertificate.issueDate).toLocaleDateString()}</Text>
              )}
              <View style={{ marginTop: 20 }}>
                <Button title="Close" onPress={() => setSelectedCertificate(null)} />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: Colors.white,
    paddingBottom: 15,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.neutral[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.neutral[900],
  },
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: Colors.neutral[50],
  },
  placeholderAv: {
    backgroundColor: Colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.primary[700],
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: Colors.primary[600],
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 3,
    borderColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.neutral[900],
  },
  role: {
    fontSize: 16,
    color: Colors.neutral[500],
    marginTop: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  ratingVal: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.neutral[900],
  },
  ratingCount: {
    fontSize: 14,
    color: Colors.neutral[400],
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 25,
    paddingHorizontal: 10,
  },
  statBox: {
    alignItems: 'center',
    backgroundColor: Colors.neutral[50],
    paddingVertical: 15,
    width: (width - 60) / 3,
    borderRadius: 20,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary[700],
  },
  statLabel: {
    fontSize: 11,
    color: Colors.neutral[500],
    marginTop: 4,
  },
  tabsRow: {
    flexDirection: 'row',
    marginTop: 30,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
    paddingHorizontal: 20,
  },
  tab: {
    marginRight: 30,
    paddingBottom: 12,
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: Colors.primary[700],
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.neutral[400],
  },
  activeTabText: {
    color: Colors.primary[700],
  },
  tabContent: {
    padding: 20,
  },
  bioTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.neutral[900],
    marginBottom: 10,
  },
  bioText: {
    fontSize: 15,
    color: Colors.neutral[600],
    lineHeight: 24,
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  skillChip: {
    backgroundColor: Colors.neutral[50],
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 15,
  },
  skillChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.neutral[700],
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  reviewsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.neutral[900],
  },
  seeAll: {
    color: Colors.primary[700],
    fontWeight: '700',
  },
  reviewCard: {
    backgroundColor: Colors.neutral[50],
    padding: 15,
    borderRadius: 20,
    marginBottom: 15,
  },
  revHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  revUser: {
    flexDirection: 'row',
    gap: 10,
  },
  revAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.neutral[200],
  },
  revName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.neutral[900],
  },
  revStars: {
    flexDirection: 'row',
    marginTop: 2,
  },
  revDate: {
    fontSize: 12,
    color: Colors.neutral[400],
  },
  revText: {
    fontSize: 14,
    color: Colors.neutral[600],
    lineHeight: 20,
  },
  emptyMsg: {
    textAlign: 'center',
    color: Colors.neutral[400],
    marginTop: 40,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 15,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[100],
    gap: 15,
  },
  msgBtn: {
    width: 60,
    height: 60,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary[50],
  },
  hireBtn: {
    flex: 1,
    height: 60,
    borderRadius: 20,
    backgroundColor: Colors.primary[700],
    justifyContent: 'center',
    alignItems: 'center',
  },
  hireBtnText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  portfolioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  portfolioCard: {
    width: '48%',
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.neutral[100],
    marginBottom: 12,
    elevation: 2,
    shadowColor: Colors.neutral[300],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  portfolioImg: {
    width: '100%',
    height: 120,
    backgroundColor: Colors.neutral[100],
  },
  portfolioInfo: {
    padding: 10,
  },
  portfolioTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.neutral[900],
  },
  portfolioDesc: {
    fontSize: 11,
    color: Colors.neutral[500],
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: 24,
    overflow: 'hidden',
  },
  modalImg: {
    width: '100%',
    height: 250,
  },
  modalBody: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.neutral[900],
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 16,
    color: Colors.neutral[600],
    marginBottom: 4,
  },
  modalLink: {
    fontSize: 14,
    color: Colors.primary[600],
    textDecorationLine: 'underline',
  },
  modalDesc: {
    fontSize: 15,
    color: Colors.neutral[700],
    lineHeight: 22,
  },
  modalDate: {
    fontSize: 14,
    color: Colors.neutral[500],
    marginTop: 8,
  },
});
