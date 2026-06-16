import React, { useState } from 'react';
import {
  View,
  TextInput as RNTextInput,
  Text,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, FontSize, FontWeight, Spacing } from '../../theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  secureTextEntry,
  style,
  ...props
}) => {
  const [isSecure, setIsSecure] = useState(secureTextEntry);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputFocused,
          error && styles.inputError,
        ]}
      >
        {leftIcon && (
          <Ionicons name={leftIcon} size={20} color={Colors.neutral[400]} style={styles.leftIcon} />
        )}
        <RNTextInput
          style={[styles.input, style]}
          placeholderTextColor={Colors.neutral[400]}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={isSecure}
          {...props}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setIsSecure(!isSecure)} style={styles.rightIcon}>
            <Ionicons
              name={isSecure ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={Colors.neutral[400]}
            />
          </TouchableOpacity>
        )}
        {rightIcon && !secureTextEntry && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.rightIcon}>
            <Ionicons name={rightIcon} size={20} color={Colors.neutral[400]} />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.neutral[700],
    marginBottom: Spacing.xs + 2,
    marginLeft: Spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral[50],
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
  },
  inputFocused: {
    borderColor: Colors.primary[500],
    backgroundColor: Colors.white,
  },
  inputError: {
    borderColor: Colors.error,
  },
  leftIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    height: 50,
    color: Colors.neutral[900],
    fontSize: FontSize.md,
  },
  rightIcon: {
    marginLeft: Spacing.sm,
    padding: Spacing.xs,
  },
  error: {
    fontSize: FontSize.xs,
    color: Colors.error,
    marginTop: Spacing.xs,
    marginLeft: Spacing.xs,
  },
});
