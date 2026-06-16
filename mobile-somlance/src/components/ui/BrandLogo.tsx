import React from 'react';
import { View, Text, Image, StyleSheet, ViewStyle } from 'react-native';
import { Colors, FontSize, FontWeight } from '@/theme';

interface BrandLogoProps {
  size?: number;
  showText?: boolean;
  style?: ViewStyle;
  color?: string;
}

import { Ionicons } from '@expo/vector-icons';

export const BrandLogo: React.FC<BrandLogoProps> = ({ size = 48, showText = false, style, color }) => {
  return (
    <View style={[styles.container, style]}>
      <View style={[styles.logoContainer, { width: size, height: size, borderRadius: size * 0.3 }]}>
        <Ionicons name="leaf" size={size * 0.6} color={Colors.white} />
      </View>
      {showText && (
        <Text style={[styles.brandName, { fontSize: size * 0.6, color: color || Colors.neutral[900] }]}>Somlance</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoContainer: {
    backgroundColor: Colors.primary[900],
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  brandName: {
    fontWeight: FontWeight.bold,
    color: Colors.neutral[900],
    letterSpacing: -0.5,
  },
});
