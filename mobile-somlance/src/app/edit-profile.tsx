import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, TextInput, StyleSheet, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/theme';
import { useAuthStore } from '@/store/authStore';
import { updateProfile, updateFreelancerProfile, getProfile } from '@/api/users';
import { uploadFile } from '@/api/users';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

export default function EditProfileScreen() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    title: '',
    location: '',
    bio: '',
    avatarUrl: '',
  });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadProfileData();
    }
  }, [user]);

  const loadProfileData = async () => {
    try {
      const data = await getProfile(user!.id);
      setFormData({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        title: data.freelancerProfile?.title || '',
        location: 'Hargeisa, Somaliland', // Mock as there's no location field currently
        bio: data.freelancerProfile?.bio || '',
        avatarUrl: data.avatarUrl || '',
      });
    } catch (error) {
      console.error(error);
    } finally {
      setFetching(false);
    }
  };

  const handlePickAvatar = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      try {
        setUploadingAvatar(true);
        const url = await uploadFile(result.assets[0].uri);
        setFormData(prev => ({ ...prev, avatarUrl: url }));
      } catch (error) {
        Alert.alert('Upload Error', 'Failed to upload profile picture');
      } finally {
        setUploadingAvatar(false);
      }
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        avatarUrl: formData.avatarUrl,
      });
      if (user?.role === 'FREELANCER') {
        await updateFreelancerProfile({
          title: formData.title,
          bio: formData.bio,
        });
      }
      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ textAlign: 'center', marginTop: 40 }}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.neutral[900]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={handlePickAvatar} disabled={uploadingAvatar}>
            <View style={styles.avatar}>
              {formData.avatarUrl ? (
                <View style={{ width: 80, height: 80, borderRadius: 40, overflow: 'hidden' }}>
                  <Image source={{ uri: formData.avatarUrl }} style={{ width: 80, height: 80, borderRadius: 40 }} />
                </View>
              ) : (
                <Text style={styles.avatarText}>{formData.firstName.charAt(0).toUpperCase()}</Text>
              )}
            </View>
            <View style={styles.cameraBtn}>
              <Ionicons name="camera" size={16} color={Colors.white} />
            </View>
          </TouchableOpacity>
          {uploadingAvatar && <Text style={{ marginTop: 8, color: Colors.primary[600], fontSize: 12 }}>Uploading...</Text>}
        </View>

        <Text style={styles.sectionTitle}>Basic Information</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>First Name</Text>
          <TextInput
            style={styles.input}
            value={formData.firstName}
            onChangeText={(text) => setFormData({...formData, firstName: text})}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Last Name</Text>
          <TextInput
            style={styles.input}
            value={formData.lastName}
            onChangeText={(text) => setFormData({...formData, lastName: text})}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            value={formData.title}
            onChangeText={(text) => setFormData({...formData, title: text})}
            placeholder="e.g. Graphic Designer"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Location</Text>
          <TextInput
            style={styles.input}
            value={formData.location}
            onChangeText={(text) => setFormData({...formData, location: text})}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.bio}
            onChangeText={(text) => setFormData({...formData, bio: text})}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
          <Text style={styles.saveBtnText}>{loading ? 'Saving...' : 'Save Changes'}</Text>
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
  content: {
    padding: Spacing.lg,
  },
  avatarSection: {
    alignItems: 'center',
    marginVertical: Spacing.xl,
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.primary[700],
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary[600],
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.neutral[900],
    marginBottom: Spacing.md,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: FontSize.sm,
    color: Colors.neutral[600],
    marginBottom: Spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.neutral[900],
  },
  textArea: {
    minHeight: 100,
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
  },
  saveBtnText: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
});
