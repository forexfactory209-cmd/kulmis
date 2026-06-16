import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/theme';
import { changePassword } from '@/api/users';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useDarkColors } from '@/store/themeStore';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark, bg, textPrimary, border, statusBar } = useDarkColors();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert('Error', 'Please fill in both fields.');
      return;
    }
    try {
      setLoading(true);
      await changePassword({ currentPassword, newPassword });
      Alert.alert('Success', 'Your password has been changed.');
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.error?.message || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[s.container, { paddingTop: insets.top, backgroundColor: bg }]}>
      <StatusBar barStyle={statusBar} backgroundColor={bg} />
      <View style={[s.nav, { borderBottomColor: border }]}>
        <TouchableOpacity onPress={() => router.back()} style={[s.back, { backgroundColor: isDark ? '#1E293B' : Colors.neutral[50] }]}>
          <Ionicons name="chevron-back" size={24} color={textPrimary} />
        </TouchableOpacity>
        <Text style={[s.navTitle, { color: textPrimary }]}>Change Password</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <View style={s.content}>
        <Input 
          label="Current Password" 
          placeholder="Enter current password" 
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry
        />
        <View style={{ height: 16 }} />
        <Input 
          label="New Password" 
          placeholder="Enter new password" 
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
        />
        <View style={{ height: 32 }} />
        <Button 
          title="Update Password" 
          onPress={handleSubmit}
          isLoading={loading}
        />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.neutral[100] },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.neutral[50], justifyContent: 'center', alignItems: 'center' },
  navTitle: { fontSize: 18, fontWeight: '600', color: Colors.neutral[900] },
  content: { padding: 24 },
});
