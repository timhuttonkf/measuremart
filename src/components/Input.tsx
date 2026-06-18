import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, fontSizes, radii, spacing } from '../config/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  secureToggle?: boolean; // Shows eye icon for password fields
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  secureToggle = false,
  secureTextEntry,
  style,
  ...rest
}) => {
  const [secure, setSecure] = useState(secureTextEntry ?? false);

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputRow, error ? styles.inputError : styles.inputNormal]}>
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={secure}
          {...rest}
        />
        {secureToggle && (
          <TouchableOpacity
            onPress={() => setSecure((v) => !v)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialIcons
              name={secure ? 'visibility-off' : 'visibility'}
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginBottom: spacing[4] },
  label: {
    fontSize: fontSizes.sm,
    color: colors.textPrimary,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
    marginBottom: spacing[1],
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing[3],
    backgroundColor: colors.surface,
    height: 48,
  },
  inputNormal: { borderColor: colors.border },
  inputError: { borderColor: colors.error },
  input: {
    flex: 1,
    fontSize: fontSizes.base,
    color: colors.textPrimary,
    fontFamily: 'Inter_400Regular',
  },
  error: {
    fontSize: fontSizes.xs,
    color: colors.error,
    marginTop: spacing[1],
    fontFamily: 'Inter_400Regular',
  },
  hint: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    marginTop: spacing[1],
    fontFamily: 'Inter_400Regular',
  },
});

export default Input;
