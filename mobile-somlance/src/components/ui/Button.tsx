import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors, BorderRadius, FontSize, FontWeight, Spacing } from '../../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = true,
  icon,
  style,
  textStyle,
}) => {
  const buttonStyles = [
    styles.base,
    styles[variant],
    styles[`size_${size}`],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`text_${variant}`],
    styles[`textSize_${size}`],
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? Colors.primary[700] : Colors.white} />
      ) : (
        <>
          {icon}
          <Text style={textStyles}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  fullWidth: {
    width: '100%',
  },
  // Variants
  primary: {
    backgroundColor: Colors.primary[700],
  },
  secondary: {
    backgroundColor: Colors.primary[50],
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.primary[700],
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  // Sizes
  size_sm: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  size_md: {
    paddingVertical: Spacing.md - 2,
    paddingHorizontal: Spacing.lg,
  },
  size_lg: {
    paddingVertical: Spacing.md + 2,
    paddingHorizontal: Spacing.xl,
  },
  disabled: {
    opacity: 0.5,
  },
  // Text
  text: {
    fontWeight: FontWeight.semibold,
  },
  text_primary: {
    color: Colors.white,
    fontSize: FontSize.md,
  },
  text_secondary: {
    color: Colors.primary[700],
    fontSize: FontSize.md,
  },
  text_outline: {
    color: Colors.primary[700],
    fontSize: FontSize.md,
  },
  text_ghost: {
    color: Colors.primary[700],
    fontSize: FontSize.md,
  },
  textSize_sm: {
    fontSize: FontSize.sm,
  },
  textSize_md: {
    fontSize: FontSize.md,
  },
  textSize_lg: {
    fontSize: FontSize.lg,
  },
});
