import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '@/theme';
import { Button } from '@/components/ui/Button';
import { Ionicons } from '@expo/vector-icons';

import { BrandLogo } from '@/components/ui/BrandLogo';

export default function SplashScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary[900]} />

      <View style={styles.content}>
        {/* Brand Logo & Name */}
        <BrandLogo size={80} style={styles.logo} />
        <Text style={styles.brandName}>Somlance</Text>
        <Text style={styles.tagline}>Leading Somali Marketplace{'\n'}Hire Top Talent Instantly</Text>
      </View>

      {/* Bottom Actions */}
      <View style={styles.bottomSection}>
        <Button
          title="Get Started"
          onPress={() => router.push('/login')}
          variant="secondary"
          size="lg"
          style={styles.getStartedBtn}
          textStyle={styles.getStartedBtnText}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary[900],
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  logo: {
    marginBottom: Spacing.md,
  },
  brandName: {
    fontSize: 56,
    fontWeight: 'bold',
    color: Colors.white,
    letterSpacing: -1.5,
    marginBottom: Spacing.xs,
  },
  tagline: {
    fontSize: FontSize.lg,
    color: Colors.primary[100],
    textAlign: 'center',
    lineHeight: 28,
    opacity: 0.9,
  },
  bottomSection: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl + 20,
    gap: Spacing.md,
  },
  getStartedBtn: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    height: 64,
  },
  getStartedBtnText: {
    color: Colors.primary[900],
    fontSize: 18,
    fontWeight: 'bold',
  },
});
