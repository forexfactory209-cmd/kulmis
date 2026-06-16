import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, KeyboardAvoidingView, Platform, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '@/theme';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/store/authStore';
import { Ionicons } from '@expo/vector-icons';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { useDarkColors } from '@/store/themeStore';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading } = useAuthStore();
  const { isDark, bg, textPrimary, textSecondary, textMuted, border, statusBar, iconBg } = useDarkColors();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    try {
      await register({ email, password, firstName, lastName, role: 'CLIENT' });
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Registration Failed', err.message);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
      <StatusBar barStyle={statusBar} backgroundColor={bg} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <BrandLogo size={64} style={styles.logoRow} color={isDark ? Colors.white : Colors.primary[900]} />
            <Text style={[styles.title, { color: textPrimary }]}>Create Account</Text>
            <Text style={[styles.subtitle, { color: textSecondary }]}>Sign up as a client to hire top talent</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.nameRow}>
              <View style={{ flex: 1 }}>
                <Input
                  label="First Name"
                  placeholder="First name"
                  leftIcon="person-outline"
                  value={firstName}
                  onChangeText={setFirstName}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Input
                  label="Last Name"
                  placeholder="Last name"
                  value={lastName}
                  onChangeText={setLastName}
                />
              </View>
            </View>
            <Input
              label="Email"
              placeholder="Enter your email"
              leftIcon="mail-outline"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
            <Input
              label="Password"
              placeholder="Create a password"
              leftIcon="lock-closed-outline"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <Button
              title="Create Account"
              onPress={handleRegister}
              loading={isLoading}
              size="lg"
              style={styles.registerBtn}
            />
          </View>

          {/* Social Login */}
          <View style={styles.socialSection}>
            <View style={styles.dividerRow}>
              <View style={[styles.divider, { backgroundColor: border }]} />
              <Text style={[styles.dividerText, { color: textMuted }]}>Or continue with</Text>
              <View style={[styles.divider, { backgroundColor: border }]} />
            </View>

            <View style={styles.socialButtons}>
              <TouchableOpacity style={[styles.socialBtn, { backgroundColor: iconBg, borderColor: border }]}>
                <Ionicons name="logo-apple" size={24} color={textPrimary} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.socialBtn, { backgroundColor: iconBg, borderColor: border }]}>
                <Ionicons name="logo-google" size={24} color={textPrimary} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.socialBtn, { backgroundColor: iconBg, borderColor: border }]}>
                <Ionicons name="logo-facebook" size={24} color="#1877F2" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: textSecondary }]}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={styles.footerLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.neutral[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  logoRow: {
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.xxl + 4,
    fontWeight: FontWeight.extrabold,
    color: Colors.neutral[900],
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.neutral[500],
  },
  form: {
    marginBottom: Spacing.lg,
  },
  nameRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  registerBtn: {
    marginTop: Spacing.sm,
  },
  socialSection: {
    marginBottom: Spacing.lg,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.neutral[200],
  },
  dividerText: {
    marginHorizontal: Spacing.md,
    fontSize: FontSize.sm,
    color: Colors.neutral[400],
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  socialBtn: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.md,
  },
  footerText: {
    fontSize: FontSize.md,
    color: Colors.neutral[500],
  },
  footerLink: {
    fontSize: FontSize.md,
    color: Colors.primary[600],
    fontWeight: FontWeight.bold,
  },
});
