import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Switch, Alert, useColorScheme, Appearance } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDarkColors } from '@/store/themeStore';
import { Colors } from '@/theme';
import { useAuthStore } from '@/store/authStore';
import { deleteAccount, toggleTwoFactor } from '@/api/users';
import { useThemeStore } from '@/store/themeStore';

export default function SettingsScreen() {
  const { bg, textPrimary, textSecondary, textMuted, border: borderColor, cardBg, isDark } = useDarkColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuthStore();
  const { toggleDarkMode } = useThemeStore();
  
  const [pushNotifs, setPushNotifs] = React.useState(true);
  const [emailNotifs, setEmailNotifs] = React.useState(true);
  const [is2faEnabled, setIs2faEnabled] = React.useState(false);

  const iconBg = isDark ? '#334155' : Colors.neutral[50];
  const iconColor = isDark ? '#94A3B8' : Colors.neutral[600];
  const chevronColor = isDark ? '#475569' : Colors.neutral[300];

  React.useEffect(() => {
    if (user && (user as any).twoFactorEnabled !== undefined) {
      setIs2faEnabled((user as any).twoFactorEnabled);
    }
  }, [user]);

  const handleToggle2FA = async () => {
    try {
      setIs2faEnabled(!is2faEnabled);
      const res = await toggleTwoFactor();
      setIs2faEnabled(res.data.twoFactorEnabled);
    } catch (e) {
      console.log('Failed to toggle 2FA', e);
      setIs2faEnabled(!is2faEnabled);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you absolutely sure you want to delete your account? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount();
              await logout();
              router.replace('/login');
            } catch (e) {
              Alert.alert('Error', 'Failed to delete account.');
            }
          }
        }
      ]
    );
  };

  const SettingRow = ({ icon, label, value, onToggle, isArrow }: any) => (
    <View style={[s.settingRow]}>
      <View style={[s.iconWrap, { backgroundColor: iconBg }]} >
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <Text style={[s.settingLabel, { color: textPrimary }]}>{label}</Text>
      {isArrow ? (
        <Ionicons name="chevron-forward" size={20} color={chevronColor} />
      ) : (
        <Switch 
          value={value} 
          onValueChange={onToggle}
          trackColor={{ false: isDark ? '#475569' : Colors.neutral[200], true: Colors.primary[600] }}
          thumbColor={Colors.white}
        />
      )}
    </View>
  );

  return (
    <View style={[s.container, { paddingTop: insets.top, backgroundColor: bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={bg} />
      <View style={[s.nav, { borderBottomColor: borderColor, backgroundColor: bg }]}>
        <TouchableOpacity onPress={() => router.back()} style={[s.back, { backgroundColor: iconBg }]}>
          <Ionicons name="chevron-back" size={24} color={textPrimary} />
        </TouchableOpacity>
        <Text style={[s.navTitle, { color: textPrimary }]}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <ScrollView contentContainerStyle={s.content}>
        <Text style={[s.sectionTitle, { color: textSecondary }]}>Preferences</Text>
        <View style={[s.card, { backgroundColor: cardBg, borderColor }]}>
          <SettingRow icon="notifications-outline" label="Push Notifications" value={pushNotifs} onToggle={setPushNotifs} />
          <View style={[s.divider, { backgroundColor: borderColor }]} />
          <SettingRow icon="mail-outline" label="Email Notifications" value={emailNotifs} onToggle={setEmailNotifs} />
          <View style={[s.divider, { backgroundColor: borderColor }]} />
          <SettingRow icon="moon-outline" label="Dark Mode" value={isDark} onToggle={toggleDarkMode} />
        </View>

        <Text style={[s.sectionTitle, { color: textSecondary }]}>Security</Text>
        <View style={[s.card, { backgroundColor: cardBg, borderColor }]}>
          <TouchableOpacity onPress={() => router.push('/change-password')}>
            <SettingRow icon="lock-closed-outline" label="Change Password" isArrow />
          </TouchableOpacity>
          <View style={[s.divider, { backgroundColor: borderColor }]} />
          <SettingRow icon="shield-checkmark-outline" label="Two-Factor Authentication" value={is2faEnabled} onToggle={handleToggle2FA} />
        </View>

        <Text style={[s.sectionTitle, { color: textSecondary }]}>About</Text>
        <View style={[s.card, { backgroundColor: cardBg, borderColor }]}>
          <TouchableOpacity onPress={() => router.push('/terms')}>
            <SettingRow icon="document-text-outline" label="Terms of Service" isArrow />
          </TouchableOpacity>
          <View style={[s.divider, { backgroundColor: borderColor }]} />
          <TouchableOpacity onPress={() => router.push('/privacy')}>
            <SettingRow icon="shield-outline" label="Privacy Policy" isArrow />
          </TouchableOpacity>
          <View style={[s.divider, { backgroundColor: borderColor }]} />
          <SettingRow icon="information-circle-outline" label="App Version 1.0.0" />
        </View>
        
        <TouchableOpacity style={s.deleteBtn} onPress={handleDeleteAccount}>
          <Text style={s.deleteText}>Delete Account</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  back: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  navTitle: { fontSize: 18, fontWeight: '600' },
  content: { padding: 16, paddingBottom: 40 },
  sectionTitle: { fontSize: 14, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginLeft: 4, marginTop: 16 },
  card: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  settingRow: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  iconWrap: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  settingLabel: { flex: 1, fontSize: 16, fontWeight: '500' },
  divider: { height: 1, marginLeft: 64 },
  deleteBtn: { marginTop: 32, alignItems: 'center', padding: 16 },
  deleteText: { fontSize: 16, fontWeight: '600', color: Colors.error },
});
