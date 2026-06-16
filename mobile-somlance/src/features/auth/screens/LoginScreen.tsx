import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, KeyboardAvoidingView, Platform, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '@/theme';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/store/authStore';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { useDarkColors } from '@/store/themeStore';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();
  const { isDark, bg, textPrimary, textSecondary, textMuted, border, statusBar, iconBg } = useDarkColors();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    try {
      const user = await login(email, password);
      // Route based on user role
      const authUser = useAuthStore.getState().user;
      if (authUser?.role === 'FREELANCER') {
        router.replace('/(freelancer-tabs)');
      } else {
        router.replace('/(tabs)');
      }
    } catch (err: any) {
      Alert.alert('Login Failed', err.message);
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
            <Text style={[styles.title, { color: textPrimary }]}>Welcome Back</Text>
            <Text style={[styles.subtitle, { color: textSecondary }]}>Enter your credentials to sign in</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Your email"
              placeholder="Enter your email"
              leftIcon="mail-outline"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
            <Input
              label="Password"
              placeholder="Enter your password"
              leftIcon="lock-closed-outline"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>

            <Button
              title="Login"
              onPress={handleLogin}
              loading={isLoading}
              size="lg"
              style={styles.loginBtn}
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
            <Text style={[styles.footerText, { color: textSecondary }]}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/register')}>
              <Text style={styles.footerLink}>Sign Up</Text>
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.md,
    marginTop: -Spacing.sm,
  },
  forgotPasswordText: {
    fontSize: FontSize.sm,
    color: Colors.primary[600],
    fontWeight: FontWeight.medium,
  },
  loginBtn: {
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
