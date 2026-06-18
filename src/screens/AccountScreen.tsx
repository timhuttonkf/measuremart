/**
 * AccountScreen
 *
 * Shows user profile and order history for authenticated users.
 * Prompts sign-in for guests.
 * Analytics: screen_view on mount.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  limit,
} from 'firebase/firestore';

import { colors, fontSizes, radii, shadows, spacing } from '../config/theme';
import { logScreenView } from '../analytics/events';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import { Order } from '../types';
import Button from '../components/Button';

type Nav = NativeStackNavigationProp<any>;

const AccountScreen = () => {
  const navigation = useNavigation<Nav>();
  const { user, signOut } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    logScreenView('Account');
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;
    setLoadingOrders(true);
    try {
      const q = query(
        collection(db, 'orders'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      const snap = await getDocs(q);
      const fetched: Order[] = snap.docs.map((d) => ({
        ...(d.data() as Omit<Order, 'id' | 'createdAt'>),
        id: d.id,
        createdAt: d.data().createdAt?.toDate() ?? new Date(),
      }));
      setOrders(fetched);
    } catch {
      // Silently fail — orders are non-critical
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => signOut(),
      },
    ]);
  };

  // ── Guest view ──────────────────────────────────────────────────────────

  if (!user) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Account</Text>
        </View>
        <View style={styles.guestContainer}>
          <MaterialIcons name="account-circle" size={80} color={colors.border} />
          <Text style={styles.guestTitle}>You're not signed in</Text>
          <Text style={styles.guestSub}>
            Sign in or create an account to view your orders and save your details.
          </Text>
          <Button
            label="Sign In"
            onPress={() => navigation.navigate('Auth')}
            style={{ marginBottom: spacing[3] }}
          />
          <Button
            label="Create Account"
            variant="outline"
            onPress={() => navigation.navigate('Auth')}
          />
        </View>
      </SafeAreaView>
    );
  }

  // ── Authenticated view ──────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Account</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(user.displayName ?? user.email ?? '?')[0].toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.displayName}>
              {user.displayName ?? 'MeasureMart User'}
            </Text>
            <Text style={styles.email}>{user.email}</Text>
          </View>
        </View>

        {/* Order history */}
        <Text style={styles.sectionTitle}>Order History</Text>
        {loadingOrders ? (
          <Text style={styles.loadingText}>Loading orders…</Text>
        ) : orders.length === 0 ? (
          <View style={styles.emptyOrders}>
            <MaterialIcons name="shopping-bag" size={40} color={colors.border} />
            <Text style={styles.emptyOrdersText}>No orders yet</Text>
          </View>
        ) : (
          orders.map((order) => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderRef}>#{order.id.slice(0, 8).toUpperCase()}</Text>
                <View style={[styles.statusBadge, statusColor(order.status)]}>
                  <Text style={styles.statusText}>{order.status}</Text>
                </View>
              </View>
              <Text style={styles.orderDate}>
                {order.createdAt.toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
              <Text style={styles.orderItems}>
                {order.items.length} item{order.items.length !== 1 ? 's' : ''}
              </Text>
              <Text style={styles.orderTotal}>£{order.total.toFixed(2)}</Text>
            </View>
          ))
        )}

        {/* Settings / actions */}
        <Text style={styles.sectionTitle}>Settings</Text>
        <View style={styles.settingsCard}>
          <TouchableOpacity style={styles.settingsRow} onPress={handleSignOut}>
            <MaterialIcons name="logout" size={20} color={colors.error} />
            <Text style={[styles.settingsLabel, { color: colors.error }]}>
              Sign Out
            </Text>
            <MaterialIcons name="chevron-right" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={{ height: spacing[8] }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const statusColor = (status: Order['status']): object => {
  const map: Record<Order['status'], object> = {
    pending: { backgroundColor: '#FEF3C7' },
    processing: { backgroundColor: colors.primaryLight },
    shipped: { backgroundColor: '#F0FDF4' },
    delivered: { backgroundColor: '#F0FDF4' },
    cancelled: { backgroundColor: '#FFF5F5' },
  };
  return map[status] ?? {};
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
    paddingBottom: spacing[2],
  },
  title: {
    fontSize: fontSizes['2xl'],
    color: colors.textPrimary,
    fontFamily: 'Inter_700Bold',
  },
  guestContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[8],
  },
  guestTitle: {
    fontSize: fontSizes.xl,
    color: colors.textPrimary,
    fontFamily: 'Inter_700Bold',
    marginTop: spacing[4],
    marginBottom: spacing[2],
  },
  guestSub: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing[6],
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    margin: spacing[4],
    borderRadius: radii.xl,
    padding: spacing[4],
    gap: spacing[3],
    ...shadows.sm,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: fontSizes.xl,
    fontFamily: 'Inter_700Bold',
  },
  displayName: {
    fontSize: fontSizes.base,
    color: colors.textPrimary,
    fontFamily: 'Inter_700Bold',
  },
  email: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    fontFamily: 'Inter_400Regular',
  },
  sectionTitle: {
    fontSize: fontSizes.base,
    color: colors.textPrimary,
    fontFamily: 'Inter_700Bold',
    paddingHorizontal: spacing[4],
    marginBottom: spacing[3],
    marginTop: spacing[2],
  },
  loadingText: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontFamily: 'Inter_400Regular',
    padding: spacing[4],
  },
  emptyOrders: {
    alignItems: 'center',
    padding: spacing[8],
    gap: spacing[2],
  },
  emptyOrdersText: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    fontFamily: 'Inter_400Regular',
  },
  orderCard: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing[4],
    marginBottom: spacing[3],
    borderRadius: radii.lg,
    padding: spacing[4],
    ...shadows.sm,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[1],
  },
  orderRef: {
    fontSize: fontSizes.sm,
    color: colors.textPrimary,
    fontFamily: 'Inter_700Bold',
  },
  statusBadge: {
    borderRadius: radii.full,
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
  },
  statusText: {
    fontSize: fontSizes.xs,
    color: colors.textPrimary,
    fontFamily: 'Inter_500Medium',
    textTransform: 'capitalize',
  },
  orderDate: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    fontFamily: 'Inter_400Regular',
    marginBottom: spacing[1],
  },
  orderItems: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    fontFamily: 'Inter_400Regular',
  },
  orderTotal: {
    fontSize: fontSizes.base,
    color: colors.primary,
    fontFamily: 'Inter_700Bold',
    marginTop: spacing[1],
  },
  settingsCard: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing[4],
    borderRadius: radii.lg,
    ...shadows.sm,
    overflow: 'hidden',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    gap: spacing[3],
  },
  settingsLabel: {
    flex: 1,
    fontSize: fontSizes.base,
    fontFamily: 'Inter_500Medium',
  },
});

export default AccountScreen;
