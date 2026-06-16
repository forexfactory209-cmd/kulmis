import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/theme';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { useDarkColors } from '@/store/themeStore';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { isDark, bg, cardBg, textPrimary, textSecondary, textMuted, border, statusBar } = useDarkColors();

  if (!isAuthenticated || !user) {
    return (
      <View style={[s.container, { paddingTop: insets.top, backgroundColor: bg }]}>
        <StatusBar barStyle={statusBar} backgroundColor={bg} />
        <View style={s.em}>
          <View style={[s.logoLg, { backgroundColor: isDark ? '#10B981' : Colors.primary[700] }]}><Text style={s.logoS}>S</Text></View>
          <Text style={[s.emt, { color: textPrimary }]}>Welcome to Kulmis</Text>
          <Text style={[s.ems, { color: textSecondary }]}>Login to manage your profile</Text>
          <Button title="Login" onPress={() => router.push('/login')} style={{ marginTop: 20, width: 200 }} />
          <Button title="Create Account" onPress={() => router.push('/register')} variant="outline" style={{ marginTop: 10, width: 200 }} />
        </View>
      </View>
    );
  }

  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => { logout(); router.replace('/login'); } },
    ]);
  };

  const MenuItem = ({ icon, label, route, danger }) => (
    <TouchableOpacity
      style={[s.menuItem, { borderBottomColor: isDark ? '#1E293B' : Colors.neutral[50] }]}
      onPress={route ? () => router.push(route) : danger ? handleLogout : undefined}
      activeOpacity={0.7}
    >
      <View style={[s.menuIcon, { backgroundColor: danger ? (isDark ? '#7F1D1D' : '#FEE2E2') : (isDark ? '#1E293B' : Colors.primary[50]) }]}>
        <Ionicons name={icon} size={20} color={danger ? Colors.error : (isDark ? '#10B981' : Colors.primary[700])} />
      </View>
      <Text style={[s.menuLabel, { color: danger ? Colors.error : textPrimary }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={isDark ? '#475569' : Colors.neutral[300]} />
    </TouchableOpacity>
  );

  return (
    <View style={[s.container, { paddingTop: insets.top, backgroundColor: bg }]}>
      <StatusBar barStyle={statusBar} backgroundColor={bg} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[s.header, { borderBottomColor: border }]}>
          <View style={[s.av, { backgroundColor: isDark ? '#1E293B' : Colors.primary[100] }]}>
            <Text style={[s.avi, { color: isDark ? '#10B981' : Colors.primary[700] }]}>{initials}</Text>
          </View>
          <Text style={[s.name, { color: textPrimary }]}>{user.firstName} {user.lastName}</Text>
          <Text style={[s.email, { color: textSecondary }]}>{user.email}</Text>
          <View style={[s.roleBadge, { backgroundColor: isDark ? '#064E3B' : Colors.primary[50] }]}>
            <Text style={[s.roleText, { color: isDark ? '#10B981' : Colors.primary[700] }]}>{user.role}</Text>
          </View>
        </View>
        <View style={s.section}>
          <Text style={[s.sectionTitle, { color: textMuted }]}>Account</Text>
          <MenuItem icon="person-outline" label="Edit Profile" route="/edit-profile" />
          <MenuItem icon="briefcase-outline" label="My Projects" route="/(tabs)/projects" />
          {user.role === 'FREELANCER' && (
            <MenuItem icon="layers-outline" label="Progress Templates" route="/progress-templates" />
          )}
          <MenuItem icon="heart-outline" label="Favorites" route="/favorites" />
        </View>
        <View style={s.section}>
          <Text style={[s.sectionTitle, { color: textMuted }]}>More</Text>
          <MenuItem icon="star-outline" label="Given Reviews" route="/reviews" />
          <MenuItem icon="people-outline" label="Invite & Earn" route="/invite" />
          <MenuItem icon="help-circle-outline" label="Support Center" route="/support" />
          <MenuItem icon="settings-outline" label="Settings" route="/settings" />
        </View>
        <View style={s.section}><MenuItem icon="log-out-outline" label="Logout" danger /></View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: { alignItems: 'center', paddingVertical: 24, borderBottomWidth: 1, borderBottomColor: Colors.neutral[100] },
  av: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primary[100], justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avi: { fontSize: 28, fontWeight: '800', color: Colors.primary[700] },
  name: { fontSize: 22, fontWeight: '700', color: Colors.neutral[900] },
  email: { fontSize: 14, color: Colors.neutral[500], marginTop: 2 },
  roleBadge: { backgroundColor: Colors.primary[50], paddingHorizontal: 14, paddingVertical: 4, borderRadius: 999, marginTop: 8 },
  roleText: { fontSize: 12, fontWeight: '600', color: Colors.primary[700] },
  section: { paddingHorizontal: 16, paddingTop: 20 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: Colors.neutral[400], textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, marginLeft: 4 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.neutral[50] },
  menuIcon: { width: 38, height: 38, borderRadius: 10, backgroundColor: Colors.primary[50], justifyContent: 'center', alignItems: 'center' },
  menuLabel: { flex: 1, fontSize: 16, fontWeight: '500', color: Colors.neutral[800], marginLeft: 14 },
  em: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  logoLg: { width: 72, height: 72, borderRadius: 18, backgroundColor: Colors.primary[700], justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  logoS: { fontSize: 36, fontWeight: '800', color: Colors.white },
  emt: { fontSize: 22, fontWeight: '700', color: Colors.neutral[900] },
  ems: { fontSize: 15, color: Colors.neutral[500], marginTop: 4 },
});
