/**
 * CartScreen
 *
 * Analytics events:
 *   - screen_view ("Cart") on mount
 *   - view_cart on mount (GA4 funnel step 1)
 *   - begin_checkout when user taps Proceed to Checkout
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { colors, fontSizes, radii, shadows, spacing } from '../config/theme';
import { logScreenView, logViewCart, logBeginCheckout } from '../analytics/events';
import { useCart } from '../context/CartContext';
import CartItemRow from '../components/CartItemRow';
import Button from '../components/Button';

const TAX_RATE = 0.20; // 20% VAT
type Nav = NativeStackNavigationProp<any>;

const CartScreen = () => {
  const navigation = useNavigation<Nav>();
  const { items, subtotal, clearCart } = useCart();
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  useEffect(() => {
    logScreenView('Cart');
    if (items.length > 0) {
      logViewCart(items); // GA4: view_cart
    }
  }, []);

  const handleCheckout = () => {
    logBeginCheckout(items, subtotal); // GA4: begin_checkout
    navigation.navigate('Checkout');
  };

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySub}>
            Browse our products and add something to your cart.
          </Text>
          <Button
            label="Shop Now"
            onPress={() => navigation.navigate('HomeTab')}
            style={{ width: 200, marginTop: spacing[4] }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Cart</Text>
        <TouchableOpacity onPress={clearCart}>
          <Text style={styles.clearText}>Clear all</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.product.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <CartItemRow item={item} />}
        ListFooterComponent={
          <View style={styles.summary}>
            <Text style={styles.summaryTitle}>Order Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>£{subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>VAT (20%)</Text>
              <Text style={styles.summaryValue}>£{tax.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping</Text>
              <Text style={[styles.summaryValue, { color: colors.success }]}>FREE</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>£{total.toFixed(2)}</Text>
            </View>
          </View>
        }
      />

      <View style={styles.footer}>
        <Button label={`Proceed to Checkout — £${total.toFixed(2)}`} onPress={handleCheckout} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
    paddingBottom: spacing[2],
  },
  title: {
    fontSize: fontSizes['2xl'],
    color: colors.textPrimary,
    fontFamily: 'Inter_700Bold',
  },
  clearText: {
    fontSize: fontSizes.sm,
    color: colors.error,
    fontFamily: 'Inter_500Medium',
  },
  list: { paddingHorizontal: spacing[4], paddingBottom: spacing[4] },
  summary: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing[4],
    marginTop: spacing[2],
    ...shadows.sm,
  },
  summaryTitle: {
    fontSize: fontSizes.base,
    color: colors.textPrimary,
    fontFamily: 'Inter_700Bold',
    marginBottom: spacing[3],
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[2],
  },
  summaryLabel: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    fontFamily: 'Inter_400Regular',
  },
  summaryValue: {
    fontSize: fontSizes.sm,
    color: colors.textPrimary,
    fontFamily: 'Inter_500Medium',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing[3],
    marginTop: spacing[2],
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: fontSizes.base,
    color: colors.textPrimary,
    fontFamily: 'Inter_700Bold',
  },
  totalValue: {
    fontSize: fontSizes.base,
    color: colors.primary,
    fontFamily: 'Inter_700Bold',
  },
  footer: {
    padding: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[8],
  },
  emptyIcon: { fontSize: 64, marginBottom: spacing[4] },
  emptyTitle: {
    fontSize: fontSizes.xl,
    color: colors.textPrimary,
    fontFamily: 'Inter_700Bold',
    marginBottom: spacing[2],
  },
  emptySub: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default CartScreen;
