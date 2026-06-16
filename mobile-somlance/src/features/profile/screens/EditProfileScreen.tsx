import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDarkColors } from '@/store/themeStore';
import { Colors } from '@/theme';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/store/authStore';
import { updateProfile, uploadImage } from '@/api/users';

export default function EditProfileScreen() {
  const { bg, textPrimary, textSecondary, textMuted, border, cardBg, isDark } = useDarkColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, getMe } = useAuthStore();
  
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [loading, setLoading] = useState(false);

  const [avatarUri, setAvatarUri] = useState<string | null>(user?.avatarUrl || null);

  const handlePickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      let avatarUrl = user?.avatarUrl;
      // If a new image was picked (it's a local file URI), upload it first
      if (avatarUri && avatarUri !== user?.avatarUrl && avatarUri.startsWith('file://')) {
        avatarUrl = await uploadImage(avatarUri);
      }
      
      await updateProfile({ firstName, lastName, avatarUrl });
      await getMe(); // Refresh global user state
      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase() || 'U';

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <View style={[s.nav, { borderBottomColor: border }]}>
        <TouchableOpacity onPress={() => router.back()} style={[s.back, { backgroundColor: cardBg }]}>
          <Ionicons name="chevron-back" size={24} color={textPrimary} />
        </TouchableOpacity>
        <Text style={[s.navTitle, { color: textPrimary }]}>Edit Profile</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={s.content}>
        <View style={s.avContainer}>
          <View style={s.av}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={s.avatarImage} />
            ) : (
              <Text style={s.avi}>{initials}</Text>
            )}
            <TouchableOpacity style={s.editAvBtn} onPress={handlePickImage}>
              <Ionicons name="camera" size={16} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={[s.sectionTitle, { color: textPrimary }]}>Personal Information</Text>
        <Input 
          label="First Name" 
          value={firstName} 
          onChangeText={setFirstName} 
          placeholder="Enter first name" 
        />
        <Input 
          label="Last Name" 
          value={lastName} 
          onChangeText={setLastName} 
          placeholder="Enter last name" 
        />
        <Input 
          label="Email Address" 
          value={user?.email || ''} 
          editable={false} 
          style={{ backgroundColor: Colors.neutral[50], color: Colors.neutral[500] }}
        />

        <Button 
          title="Save Changes" 
          onPress={handleSave} 
          loading={loading} 
          size="lg" 
          style={{ marginTop: 24 }} 
        />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.neutral[100] },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.neutral[50], justifyContent: 'center', alignItems: 'center' },
  navTitle: { fontSize: 18, fontWeight: '600', color: Colors.neutral[900] },
  content: { padding: 20, paddingBottom: 40 },
  avContainer: { alignItems: 'center', marginBottom: 32, marginTop: 10 },
  av: { width: 100, height: 100, borderRadius: 50, backgroundColor: Colors.primary[100], justifyContent: 'center', alignItems: 'center' },
  avatarImage: { width: 100, height: 100, borderRadius: 50 },
  avi: { fontSize: 36, fontWeight: '800', color: Colors.primary[700] },
  editAvBtn: { position: 'absolute', bottom: -5, right: -5, width: 34, height: 34, borderRadius: 17, backgroundColor: Colors.primary[600], justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: Colors.white, zIndex: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.neutral[900], marginBottom: 16 },
});
