/**
 * LoginScreen
 *
 * Analytics: login event fired on successful sign-in (via AuthContext).
 * Users can also continue as a guest by tapping the guest button.
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
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

import { colors, fontSizes, radii, spacing } from '../config/theme';
import { useAuth } from '../context/AuthContext';
import { logScreenView } from '../analytics/events';
import Input from '../components/Input';
import Button from '../components/Button';

type Nav = NativeStackNavigationProp<any>;

const LoginScreen = () => {
  const navigation = useNavigation<Nav>();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    logScreenView('Login');
  }, []);

  const handleSignIn = async () => {
    setError('');
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      await signIn(email.trim(), password);
    } catch (e: any) {
      const code = e?.code ?? '';
      if (
        code === 'auth/user-not-found' ||
        code === 'auth/wrong-password' ||
        code === 'auth/invalid-credential'
      ) {
        setError('Incorrect email or password. Please try again.');
      } else if (code === 'auth/too-many-requests') {
        setError('Too many attempts. Please try again later.');
      } else {
        setError('Sign-in failed. Please check your connection and try again.');
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
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            style={styles.brand}
          >
            <MaterialIcons name="straighten" size={40} color="#fff" />
            <Text style={styles.brandName}>MeasureMart</Text>
            <Text style={styles.brandTagline}>Precision tools for every job</Text>
          </LinearGradient>

          <View style={styles.form}>
            <Text style={styles.title}>Sign In</Text>
            <Text style={styles.sub}>
              Welcome back! Sign in to your account or continue as a guest.
            </Text>

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
              placeholder="••••••••"
            />

            {error ? (
              <View style={styles.errorBox}>
                <MaterialIcons name="error-outline" size={16} color={colors.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Button
              label="Sign In"
              onPress={handleSignIn}
              loading={loading}
              style={{ marginBottom: spacing[3] }}
            />

            <Button
              label="Continue as Guest"
              onPress={() => navigation.navigate('Register')}
              variant="outline"
              style={{ marginBottom: spacing[6] }}
            />

            <View style={styles.registerRow}>
              <Text style={styles.registerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.registerLink}>Create account</Text>
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
  brand: {
    paddingTop: spacing[10],
    paddingBottom: spacing[8],
    alignItems: 'center',
  },
  brandName: {
    color: '#fff',
    fontSize: fontSizes['3xl'],
    fontFamily: 'Inter_700Bold',
    marginTop: spacing[2],
  },
  brandTagline: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: fontSizes.sm,
    fontFamily: 'Inter_400Regular',
    marginTop: spacing[1],
  },
  form: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: radii['2xl'],
    borderTopRightRadius: radii['2xl'],
    marginTop: -spacing[6],
    padding: spacing[6],
    paddingTop: spacing[8],
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
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    fontFamily: 'Inter_400Regular',
  },
  registerLink: {
    fontSize: fontSizes.sm,
    color: colors.primary,
    fontFamily: 'Inter_600SemiBold',
  },
});

export default LoginScreen;
