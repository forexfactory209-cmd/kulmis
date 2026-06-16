import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/theme';
import { useAuthStore } from '@/store/authStore';
import { getProfile, updateFreelancerProfile } from '@/api/users';
import { useRouter } from 'expo-router';

export default function SocialLinksScreen() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [socials, setSocials] = useState({
    linkedin: '',
    github: '',
    twitter: '',
    facebook: '',
    instagram: '',
    tiktok: '',
    youtube: '',
    behance: '',
    dribbble: '',
  });

  useEffect(() => {
    if (user?.id) {
      loadSocials();
    }
  }, [user]);

  const loadSocials = async () => {
    try {
      setFetching(true);
      const data = await getProfile(user!.id);
      const rawUrl = data.freelancerProfile?.portfolioUrl || '';
      
      if (rawUrl.startsWith('{')) {
        try {
          const parsed = JSON.parse(rawUrl);
          setSocials({
            linkedin: parsed.linkedin || '',
            github: parsed.github || '',
            twitter: parsed.twitter || '',
            facebook: parsed.facebook || '',
            instagram: parsed.instagram || '',
            tiktok: parsed.tiktok || '',
            youtube: parsed.youtube || '',
            behance: parsed.behance || '',
            dribbble: parsed.dribbble || '',
          });
        } catch (e) {
          // fallback
        }
      } else {
        setSocials(prev => ({ ...prev, github: rawUrl }));
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to load social links');
    } finally {
      setFetching(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const serializedSocials = JSON.stringify(socials);
      await updateFreelancerProfile({
        portfolioUrl: serializedSocials,
      });
      Alert.alert('Success', 'Social links updated successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save social links');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.neutral[900]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Social Links</Text>
        <View style={{ width: 24 }} />
      </View>

      {fetching ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary[600]} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.subtitle}>
            Add links to your public profiles to build credibility and showcase your creative brand.
          </Text>

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Ionicons name="logo-linkedin" size={20} color="#0A66C2" />
              <Text style={styles.label}>LinkedIn Profile URL</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="https://linkedin.com/in/username"
              value={socials.linkedin}
              onChangeText={(txt) => setSocials({ ...socials, linkedin: txt })}
              autoCapitalize="none"
              keyboardType="url"
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Ionicons name="logo-github" size={20} color="#181717" />
              <Text style={styles.label}>GitHub Profile URL</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="https://github.com/username"
              value={socials.github}
              onChangeText={(txt) => setSocials({ ...socials, github: txt })}
              autoCapitalize="none"
              keyboardType="url"
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Ionicons name="logo-facebook" size={20} color="#1877F2" />
              <Text style={styles.label}>Facebook Page/Profile URL</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="https://facebook.com/username"
              value={socials.facebook}
              onChangeText={(txt) => setSocials({ ...socials, facebook: txt })}
              autoCapitalize="none"
              keyboardType="url"
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Ionicons name="logo-instagram" size={20} color="#E1306C" />
              <Text style={styles.label}>Instagram Profile URL</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="https://instagram.com/username"
              value={socials.instagram}
              onChangeText={(txt) => setSocials({ ...socials, instagram: txt })}
              autoCapitalize="none"
              keyboardType="url"
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Ionicons name="logo-tiktok" size={20} color="#000000" />
              <Text style={styles.label}>TikTok Profile URL</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="https://tiktok.com/@username"
              value={socials.tiktok}
              onChangeText={(txt) => setSocials({ ...socials, tiktok: txt })}
              autoCapitalize="none"
              keyboardType="url"
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Ionicons name="logo-youtube" size={20} color="#FF0000" />
              <Text style={styles.label}>YouTube Channel URL</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="https://youtube.com/@channel"
              value={socials.youtube}
              onChangeText={(txt) => setSocials({ ...socials, youtube: txt })}
              autoCapitalize="none"
              keyboardType="url"
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Ionicons name="logo-behance" size={20} color="#1769FF" />
              <Text style={styles.label}>Behance Portfolio URL</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="https://behance.net/username"
              value={socials.behance}
              onChangeText={(txt) => setSocials({ ...socials, behance: txt })}
              autoCapitalize="none"
              keyboardType="url"
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Ionicons name="logo-dribbble" size={20} color="#EA4C89" />
              <Text style={styles.label}>Dribbble Portfolio URL</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="https://dribbble.com/username"
              value={socials.dribbble}
              onChangeText={(txt) => setSocials({ ...socials, dribbble: txt })}
              autoCapitalize="none"
              keyboardType="url"
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Ionicons name="logo-twitter" size={20} color="#1DA1F2" />
              <Text style={styles.label}>Twitter / X Profile URL</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="https://twitter.com/username"
              value={socials.twitter}
              onChangeText={(txt) => setSocials({ ...socials, twitter: txt })}
              autoCapitalize="none"
              keyboardType="url"
            />
          </View>
        </ScrollView>
      )}

      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.saveBtnText}>Save All Links</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  backBtn: {
    padding: Spacing.xs,
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.neutral[900],
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: Spacing.lg,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.neutral[500],
    marginBottom: Spacing.xl,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: Spacing.xl,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.neutral[700],
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.neutral[900],
  },
  footer: {
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[100],
  },
  saveBtn: {
    backgroundColor: Colors.primary[600],
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  saveBtnText: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
});
