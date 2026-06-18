/**
 * RegisterScreen
 *
 * Creates a new Firebase Auth account.
 * Analytics: sign_up event fired on success (via AuthContext).
 *
 * Also accessible from LoginScreen's "Continue as Guest" path —
 * in that case users can tap "Skip, browse as guest" to go straight
 * to the main app without an account. Guest orders capture email at checkout.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';

import { colors, fontSizes, radii, spacing } from '../config/theme';
import { useAuth } from '../context/AuthContext';
import { logScreenView } from '../analytics/events';
import Input from '../components/Input';
import Button from '../components/Button';

type Nav = NativeStackNavigationProp<any>;

const RegisterScreen = () => {
  const navigation = useNavigation<Nav>();
  const { signUp } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    logScreenView('Register');
  }, []);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    setError('');
    if (!name.trim()) { setError('Please enter your full name.'); return; }
    if (!email.trim() || !email.includes('@')) { setError('Please enter a valid email address.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }

    setLoading(true);
    try {
      await signUp(email.trim(), password, name.trim());
      // Auth state change triggers RootNavigator to show MainNavigator
    } catch (e: any) {
      const code = e?.code ?? '';
      if (code === 'auth/email-already-in-use') {
        setError('An account with this email already exists. Please sign in instead.');
      } else if (code === 'auth/weak-password') {
        setError('Password is too weak. Please use at least 8 characters.');
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
              <MaterialIcons name="arrow-back" size={22} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.sub}>
              Join MeasureMart to track orders and get personalised recommendations.
            </Text>

            <Input
              label="Full Name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              placeholder="Jane Smith"
            />
            <Input
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="you@example.com"
            />
            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureToggle
              secureTextEntry
              placeholder="Min. 8 characters"
            />
            <Input
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureToggle
              secureTextEntry
              placeholder="Repeat password"
            />

            {error ? (
              <View style={styles.errorBox}>
                <MaterialIcons name="error-outline" size={16} color={colors.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Button
              label="Create Account"
              onPress={handleRegister}
              loading={loading}
              style={{ marginBottom: spacing[3] }}
            />

            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLink}>Sign in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1 },
  header: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
  },
  back: { width: 40, height: 40, alignItems: 'flex-start', justifyContent: 'center' },
  form: {
    flex: 1,
    padding: spacing[6],
  },
  title: {
    fontSize: fontSizes['2xl'],
    color: colors.textPrimary,
    fontFamily: 'Inter_700Bold',
    marginBottom: spacing[1],
  },
  sub: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    fontFamily: 'Inter_400Regular',
    marginBottom: spacing[6],
    lineHeight: 20,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF5F5',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.error,
    padding: spacing[3],
    marginBottom: spacing[3],
    gap: spacing[2],
  },
  errorText: {
    flex: 1,
    fontSize: fontSizes.sm,
    color: colors.error,
    fontFamily: 'Inter_400Regular',
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing[2],
  },
  loginText: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    fontFamily: 'Inter_400Regular',
  },
  loginLink: {
    fontSize: fontSizes.sm,
    color: colors.primary,
    fontFamily: 'Inter_600SemiBold',
  },
});

export default RegisterScreen;
