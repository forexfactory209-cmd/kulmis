import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from '../styles/ProfileScreen.styles';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/theme';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const firstName = user?.firstName || 'Freelancer';
  const lastName = user?.lastName || '';
  
  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => { logout(); router.replace('/login'); } },
    ]);
  };

  const MenuItem = ({ icon, label, route, danger }: { icon: string; label: string; route?: string; danger?: boolean }) => (
    <TouchableOpacity 
      style={styles.menuItem} 
      onPress={route ? () => router.push(route as any) : danger ? handleLogout : undefined}
      activeOpacity={0.7}
    >
      <View style={styles.menuItemLeft}>
        <Ionicons name={icon as any} size={22} color={danger ? Colors.error : Colors.neutral[600]} style={styles.menuIcon} />
        <Text style={[styles.menuLabel, danger && { color: Colors.error }]}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.neutral[300]} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Account Settings</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        {/* Profile Info */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{firstName.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{firstName} {lastName}</Text>
            <Text style={styles.email}>{user?.email}</Text>
          </View>
          <TouchableOpacity style={styles.editBtn} onPress={() => router.push('/edit-profile')}>
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.menuSection}>
          <MenuItem icon="person-outline" label="Personal Information" route="/edit-profile" />
          <MenuItem icon="color-wand-outline" label="Skills" route="/skills" />
          <MenuItem icon="images-outline" label="Portfolio" route="/portfolio" />
          <MenuItem icon="layers-outline" label="Progress Templates" route="/progress-templates" />
          <MenuItem icon="business-outline" label="My Businesses" route="/my-businesses" />
          <MenuItem icon="ribbon-outline" label="Certificates" route="/certificates" />
          <MenuItem icon="link-outline" label="Social Links" route="/social-links" />
          <MenuItem icon="star-outline" label="Reviews" route="/reviews" />
        </View>

        <View style={styles.menuSection}>
          <MenuItem icon="wallet-outline" label="Payout Methods" route="/earnings" />
          <MenuItem icon="notifications-outline" label="Notifications" />
          <MenuItem icon="shield-checkmark-outline" label="Privacy & Security" />
          <MenuItem icon="globe-outline" label="Language" />
        </View>

        <View style={styles.menuSection}>
          <MenuItem icon="help-circle-outline" label="Help & Support" route="/support" />
          <MenuItem icon="log-out-outline" label="Logout" danger />
        </View>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
