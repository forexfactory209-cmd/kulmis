import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar, ScrollView, ActivityIndicator, Alert, Modal, TextInput, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '@/theme';
import { getMyReviews, getMyGivenReviews, deleteReview, updateReview, Review } from '@/api/reviews';
import { useDarkColors } from '@/store/themeStore';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';

export default function ReviewsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { bg, textPrimary, textSecondary, textMuted, border, cardBg, isDark } = useDarkColors();
  const { user } = useAuthStore();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filter, setFilter] = useState<string>('All');

  const isClient = user?.role === 'CLIENT';

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = isClient ? await getMyGivenReviews() : await getMyReviews();
      setReviews(data);
    } catch (e) {
      console.log('Failed to fetch reviews', e);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Review', 'Are you sure you want to delete this review?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await deleteReview(id);
            fetchReviews();
          } catch (e) {
            Alert.alert('Error', 'Failed to delete review');
          }
      }}
    ]);
  };

  const handleUpdate = async () => {
    if (!editingReview) return;
    setIsSubmitting(true);
    try {
      await updateReview(editingReview.id, { rating: editRating, comment: editComment });
      setEditingReview(null);
      fetchReviews();
    } catch (e) {
      Alert.alert('Error', 'Failed to update review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  const distribution = [5, 4, 3, 2, 1].map(stars => {
    const count = reviews.filter(r => Math.round(r.rating) === stars).length;
    const pct = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
    return { stars, count, pct: `${pct}%` };
  });

  const filteredReviews = reviews.filter(r => {
    if (filter === 'All') return true;
    const starStr = filter.split(' ')[0];
    return Math.round(r.rating) === Number(starStr);
  });

  return (
    <View style={[s.container, { backgroundColor: bg, paddingTop: insets.top }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={bg} />
      
      {/* Header */}
      <View style={[s.header, { borderBottomColor: border }]}>
        <TouchableOpacity onPress={() => router.back()} style={[s.backBtn, { backgroundColor: cardBg }]}>
          <Ionicons name="chevron-back" size={24} color={textPrimary} />
        </TouchableOpacity>
        <Text style={[s.title, { color: textPrimary }]}>{isClient ? 'My Given Reviews' : 'All Reviews'}</Text>
        <View style={{ width: 44 }} />
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.primary[600]} />
        </View>
      ) : (
        <FlatList
          data={filteredReviews}
          keyExtractor={item => item.id}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={[s.ratingOverview, { borderBottomColor: border }]}>
              <View style={s.ratingRow}>
                <Text style={[s.bigRating, { color: textPrimary }]}>{avgRating}</Text>
                <View style={s.ratingInfo}>
                  <View style={s.starsRow}>
                    {[...Array(5)].map((_, i) => (
                      <Ionicons key={i} name="star" size={18} color={i < Number(avgRating) ? "#F59E0B" : (isDark ? "#334155" : "#D1D5DB")} />
                    ))}
                  </View>
                  <Text style={[s.totalReviews, { color: textMuted }]}>({reviews.length} Reviews)</Text>
                </View>
              </View>

              <View style={s.distribution}>
                {distribution.map((item) => (
                  <View key={item.stars} style={s.distRow}>
                    <Text style={[s.distLabel, { color: textPrimary }]}>{item.stars}</Text>
                    <Ionicons name="star" size={12} color="#F59E0B" />
                    <View style={[s.progressBg, { backgroundColor: isDark ? '#334155' : Colors.neutral[50] }]}>
                      <View style={[s.progressFill, { width: item.pct, backgroundColor: item.stars >= 4 ? (isDark ? Colors.primary[500] : '#0D3B25') : '#F59E0B' }]} />
                    </View>
                    <Text style={[s.distCount, { color: textMuted }]}>{item.count}</Text>
                  </View>
                ))}
              </View>

              <View style={s.filters}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                  {['All', '5 Stars', '4 Stars', '3 Stars', '2 Stars', '1 Star'].map((f) => {
                    const isActive = filter === f;
                    return (
                      <TouchableOpacity 
                        key={f} 
                        onPress={() => setFilter(f)}
                        style={[s.filterChip, { backgroundColor: cardBg, borderColor: border }, isActive && { backgroundColor: Colors.primary[600], borderColor: Colors.primary[600] }]}
                      >
                        <Text style={[s.filterText, { color: textSecondary }, isActive && s.activeFilterText]}>{f}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </View>
          }
          renderItem={({ item }: any) => {
            // For given reviews, display the reviewee. For received, display reviewer.
            const displayUser = isClient ? item.reviewee : item.reviewer;
            return (
            <View style={[s.reviewCard, { borderBottomColor: border }]}>
              <View style={s.revHeader}>
                <View style={s.revUser}>
                  <View style={[s.revAvatar, { backgroundColor: isDark ? '#1E293B' : Colors.primary[50] }]}>
                     <Text style={s.revInitials}>{displayUser?.firstName?.[0] || 'U'}{displayUser?.lastName?.[0] || ''}</Text>
                  </View>
                  <View>
                    <Text style={[s.revName, { color: textPrimary }]}>{displayUser?.firstName} {displayUser?.lastName}</Text>
                    <View style={s.revStars}>
                      {[...Array(5)].map((_, i) => (
                        <Ionicons key={i} name="star" size={12} color={i < item.rating ? "#F59E0B" : (isDark ? "#334155" : "#D1D5DB")} />
                      ))}
                    </View>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[s.revDate, { color: textMuted }]}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                  {isClient && (
                    <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
                      <TouchableOpacity onPress={() => { setEditingReview(item); setEditRating(item.rating); setEditComment(item.comment); }}>
                        <MaterialIcons name="edit" size={16} color={Colors.primary[500]} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDelete(item.id)}>
                        <MaterialIcons name="delete" size={16} color={Colors.error} />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
              {isClient && item.project?.title && (
                <Text style={{ fontSize: 12, color: Colors.primary[500], marginBottom: 6, fontWeight: '600' }}>Project: {item.project.title}</Text>
              )}
              <Text style={[s.revText, { color: textSecondary }]}>{item.comment}</Text>
            </View>
            );
          }}
        />
      )}

      {/* Edit Review Modal */}
      <Modal visible={!!editingReview} transparent animationType="slide">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 }}>
              <View style={{ backgroundColor: cardBg, padding: 24, borderRadius: 16 }}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: textPrimary, marginBottom: 16 }}>Edit Review</Text>
                
                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <TouchableOpacity key={star} onPress={() => setEditRating(star)}>
                      <Ionicons name="star" size={32} color={star <= editRating ? "#F59E0B" : (isDark ? "#334155" : "#D1D5DB")} />
                    </TouchableOpacity>
                  ))}
                </View>

                <TextInput
                  style={{ backgroundColor: bg, color: textPrimary, borderRadius: 8, padding: 12, height: 100, textAlignVertical: 'top', borderColor: border, borderWidth: 1, marginBottom: 20 }}
                  value={editComment}
                  onChangeText={setEditComment}
                  multiline
                  placeholder="Write your review..."
                  placeholderTextColor={textMuted}
                  blurOnSubmit={true}
                  onSubmitEditing={Keyboard.dismiss}
                />

                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <Button title="Cancel" variant="outline" onPress={() => { Keyboard.dismiss(); setEditingReview(null); }} style={{ flex: 1 }} />
                  <Button title="Update" onPress={() => { Keyboard.dismiss(); handleUpdate(); }} loading={isSubmitting} style={{ flex: 1 }} />
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.neutral[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.neutral[900],
  },
  listContent: {
    paddingBottom: 40,
  },
  ratingOverview: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[50],
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 24,
  },
  bigRating: {
    fontSize: 56,
    fontWeight: '800',
    color: Colors.neutral[900],
  },
  ratingInfo: {
    gap: 4,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  totalReviews: {
    fontSize: 14,
    color: Colors.neutral[400],
    fontWeight: '500',
  },
  distribution: {
    gap: 8,
  },
  distRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  distLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.neutral[900],
    width: 10,
  },
  progressBg: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.neutral[50],
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  distCount: {
    fontSize: 13,
    color: Colors.neutral[400],
    width: 30,
    textAlign: 'right',
  },
  filters: {
    marginTop: 30,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.neutral[50],
    borderWidth: 1,
    borderColor: Colors.neutral[100],
  },
  activeFilter: {
    backgroundColor: Colors.primary[900],
    borderColor: Colors.primary[900],
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.neutral[600],
  },
  activeFilterText: {
    color: Colors.white,
  },
  reviewCard: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[50],
  },
  revHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  revUser: {
    flexDirection: 'row',
    gap: 12,
  },
  revAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  revInitials: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.primary[700],
  },
  revName: {
    fontSize: 15,
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
    lineHeight: 22,
  },
});
