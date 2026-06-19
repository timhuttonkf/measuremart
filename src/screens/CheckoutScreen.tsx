/**
 * CheckoutScreen — 3-step checkout wizard.
 *
 * Step 1: Shipping address
 * Step 2: Payment details
 * Step 3: Confirmation (order saved, cart cleared)
 *
 * Analytics events:
 *   - screen_view ("Checkout") on mount
 *   - add_shipping_info after step 1
 *   - add_payment_info after step 2 attempt (even on decline)
 *   - purchase after successful payment
 *
 * Test card behaviour:
 *   Any card number beginning with "1111" is always declined.
 *   All other card numbers succeed regardless of other fields.
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
import { collection, addDoc, Timestamp } from 'firebase/firestore';

import { colors, fontSizes, radii, shadows, spacing } from '../config/theme';
import {
  logScreenView,
  logAddShippingInfo,
  logAddPaymentInfo,
  logPurchase,
} from '../analytics/events';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import { Order, ShippingAddress } from '../types';
import Button from '../components/Button';
import Input from '../components/Input';

const TAX_RATE = 0.20;
type Nav = NativeStackNavigationProp<any>;

// ---------------------------------------------------------------------------
// Progress indicator
// ---------------------------------------------------------------------------

const StepIndicator = ({ current }: { current: number }) => {
  const steps = ['Shipping', 'Payment', 'Confirm'];
  return (
    <View style={stepStyles.row}>
      {steps.map((label, i) => {
        const stepNum = i + 1;
        const done = stepNum < current;
        const active = stepNum === current;
        return (
          <React.Fragment key={label}>
            <View style={stepStyles.step}>
              <View
                style={[
                  stepStyles.circle,
                  done && stepStyles.done,
                  active && stepStyles.active,
                ]}
              >
                {done ? (
                  <MaterialIcons name="check" size={14} color="#fff" />
                ) : (
                  <Text style={[stepStyles.num, active && stepStyles.numActive]}>
                    {stepNum}
                  </Text>
                )}
              </View>
              <Text style={[stepStyles.label, active && stepStyles.labelActive]}>
                {label}
              </Text>
            </View>
            {i < steps.length - 1 && (
              <View style={[stepStyles.line, done && stepStyles.lineDone]} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
};

const stepStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing[4],
  },
  step: { alignItems: 'center', width: 70 },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  done: { backgroundColor: colors.success },
  active: { backgroundColor: colors.primary },
  num: { fontSize: fontSizes.sm, color: colors.textSecondary, fontFamily: 'Inter_600SemiBold' },
  numActive: { color: '#fff' },
  label: { fontSize: fontSizes.xs, color: colors.textSecondary, fontFamily: 'Inter_400Regular' },
  labelActive: { color: colors.primary, fontFamily: 'Inter_600SemiBold' },
  line: { flex: 1, height: 2, backgroundColor: colors.border, marginBottom: 20 },
  lineDone: { backgroundColor: colors.success },
});

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

const CheckoutScreen = () => {
  const navigation = useNavigation<Nav>();
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();

  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState('');

  // Shipping form state
  const [shipping, setShipping] = useState<ShippingAddress>({
    fullName: user?.displayName ?? '',
    email: user?.email ?? '',
    line1: '',
    line2: '',
    city: '',
    postcode: '',
    country: 'United Kingdom',
  });
  const [shippingErrors, setShippingErrors] = useState<Partial<ShippingAddress>>({});

  // Payment form state
  const [payment, setPayment] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    cardHolder: '',
  });
  const [paymentError, setPaymentError] = useState('');

  useEffect(() => {
    logScreenView('Checkout');
  }, []);

  // ── Shipping validation ──────────────────────────────────────────

  const validateShipping = (): boolean => {
    const errors: Partial<ShippingAddress> = {};
    if (!shipping.fullName.trim()) errors.fullName = 'Full name is required';
    if (!shipping.email.trim() || !shipping.email.includes('@'))
      errors.email = 'Valid email is required';
    if (!shipping.line1.trim()) errors.line1 = 'Address line 1 is required';
    if (!shipping.city.trim()) errors.city = 'City is required';
    if (!shipping.postcode.trim()) errors.postcode = 'Postcode is required';
    setShippingErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleShippingNext = () => {
    if (!validateShipping()) return;
    logAddShippingInfo(items, subtotal, 'Standard Free'); // GA4: add_shipping_info
    setStep(2);
  };

  // ── Payment processing ───────────────────────────────────────────

  const formatCardNumber = (text: string) =>
    text
      .replace(/\D/g, '')
      .slice(0, 16)
      .replace(/(\d{4})(?=\d)/g, '$1 ');

  const formatExpiry = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  const handlePayment = async () => {
    setPaymentError('');
    const raw = payment.cardNumber.replace(/\s/g, '');

    if (raw.length < 16) {
      setPaymentError('Please enter a valid 16-digit card number.');
      return;
    }
    if (!payment.expiry || payment.expiry.length < 5) {
      setPaymentError('Please enter a valid expiry date (MM/YY).');
      return;
    }
    if (!payment.cvv || payment.cvv.length < 3) {
      setPaymentError('Please enter a valid CVV.');
      return;
    }
    if (!payment.cardHolder.trim()) {
      setPaymentError('Please enter the cardholder name.');
      return;
    }

    // GA4: add_payment_info — fired on every attempt, including declines
    logAddPaymentInfo(items, subtotal, 'credit_card');

    setLoading(true);

    // Simulate network latency
    await new Promise((r) => setTimeout(r, 1200));

    // Test card: any card number starting with "1111" is always declined.
    // This allows QA teams to reliably test the declined-card error path.
    if (raw.startsWith('1111')) {
      setLoading(false);
      setPaymentError(
        'Your card was declined. Please use a different card.'
      );
      return;
    }

    // All other card numbers succeed
    try {
      await processOrder();
    } catch (e) {
      setLoading(false);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  // ── Order creation ───────────────────────────────────────────────────────

  const processOrder = async () => {
    const order: Omit<Order, 'id'> = {
      userId: user?.uid,
      guestEmail: user ? undefined : shipping.email,
      items,
      subtotal,
      tax,
      total,
      status: 'processing',
      shippingAddress: shipping,
      createdAt: new Date(),
    };

    // Save order to Firestore under /orders/{autoId}
    const docRef = await addDoc(collection(db, 'orders'), {
      ...order,
      createdAt: Timestamp.fromDate(order.createdAt),
    });

    const fullOrder: Order = { ...order, id: docRef.id };

    // GA4: purchase
    logPurchase(fullOrder);

    setOrderId(docRef.id);
    clearCart(); // Empty the cart now that the order is placed
    setLoading(false);
    setStep(3);
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        {step < 3 && (
          <TouchableOpacity
            onPress={() => (step === 1 ? navigation.goBack() : setStep((s) => s - 1))}
            style={styles.back}
          >
            <MaterialIcons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 40 }} />
      </View>

      <StepIndicator current={step} />

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">

        {/* ── Shipping ── */}
        {step === 1 && (
          <View>
            <Text style={styles.sectionTitle}>Shipping Address</Text>
            <Input
              label="Full Name"
              value={shipping.fullName}
              onChangeText={(v) => setShipping({ ...shipping, fullName: v })}
              error={shippingErrors.fullName}
              autoCapitalize="words"
            />
            <Input
              label="Email Address"
              value={shipping.email}
              onChangeText={(v) => setShipping({ ...shipping, email: v })}
              error={shippingErrors.email}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Input
              label="Address Line 1"
              value={shipping.line1}
              onChangeText={(v) => setShipping({ ...shipping, line1: v })}
              error={shippingErrors.line1}
              autoCapitalize="words"
            />
            <Input
              label="Address Line 2 (optional)"
              value={shipping.line2}
              onChangeText={(v) => setShipping({ ...shipping, line2: v })}
              autoCapitalize="words"
            />
            <Input
              label="City"
              value={shipping.city}
              onChangeText={(v) => setShipping({ ...shipping, city: v })}
              error={shippingErrors.city}
              autoCapitalize="words"
            />
            <Input
              label="Postcode"
              value={shipping.postcode}
              onChangeText={(v) => setShipping({ ...shipping, postcode: v.toUpperCase() })}
              error={shippingErrors.postcode}
              autoCapitalize="characters"
            />
            <Input
              label="Country"
              value={shipping.country}
              onChangeText={(v) => setShipping({ ...shipping, country: v })}
              autoCapitalize="words"
            />
            <Button label="Continue to Payment" onPress={handleShippingNext} />
          </View>
        )}

        {/* ── Payment ── */}
        {step === 2 && (
          <View>
            <Text style={styles.sectionTitle}>Payment Details</Text>

            {/* Order summary */}
            <View style={styles.orderSummary}>
              <Text style={styles.summaryLabel}>
                {items.length} item{items.length !== 1 ? 's' : ''} · Total:{' '}
                <Text style={styles.summaryTotal}>£{total.toFixed(2)}</Text>
              </Text>
            </View>

            <Input
              label="Card Number"
              value={payment.cardNumber}
              onChangeText={(v) =>
                setPayment({ ...payment, cardNumber: formatCardNumber(v) })
              }
              keyboardType="number-pad"
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              hint="Test card: 1111 xxxx xxxx xxxx always declines"
            />
            <View style={styles.twoCol}>
              <View style={{ flex: 1, marginRight: spacing[2] }}>
                <Input
                  label="Expiry (MM/YY)"
                  value={payment.expiry}
                  onChangeText={(v) =>
                    setPayment({ ...payment, expiry: formatExpiry(v) })
                  }
                  keyboardType="number-pad"
                  placeholder="MM/YY"
                  maxLength={5}
                />
              </View>
              <View style={{ flex: 1, marginLeft: spacing[2] }}>
                <Input
                  label="CVV"
                  value={payment.cvv}
                  onChangeText={(v) =>
                    setPayment({ ...payment, cvv: v.replace(/\D/g, '').slice(0, 4) })
                  }
                  keyboardType="number-pad"
                  placeholder="123"
                  secureToggle
                  maxLength={4}
                />
              </View>
            </View>
            <Input
              label="Cardholder Name"
              value={payment.cardHolder}
              onChangeText={(v) => setPayment({ ...payment, cardHolder: v })}
              autoCapitalize="characters"
              placeholder="AS ON CARD"
            />

            {paymentError ? (
              <View style={styles.errorBox}>
                <MaterialIcons name="error-outline" size={16} color={colors.error} />
                <Text style={styles.errorText}>{paymentError}</Text>
              </View>
            ) : null}

            <Button
              label="Pay Now"
              onPress={handlePayment}
              loading={loading}
            />

            {/* Security assurance */}
            <View style={styles.secureRow}>
              <MaterialIcons name="lock" size={14} color={colors.textMuted} />
              <Text style={styles.secureText}>
                Payments are encrypted and secure. This is a demo — no real transaction occurs.
              </Text>
            </View>
          </View>
        )}

        {/* ── Confirmation ── */}
        {step === 3 && (
          <View style={styles.confirmation}>
            <View style={styles.successIcon}>
              <MaterialIcons name="check-circle" size={64} color={colors.success} />
            </View>
            <Text style={styles.successTitle}>Order Placed!</Text>
            <Text style={styles.successSub}>
              Thank you{shipping.fullName ? `, ${shipping.fullName.split(' ')[0]}` : ''}! Your order has been confirmed.
            </Text>
            <View style={styles.orderRef}>
              <Text style={styles.refLabel}>Order reference</Text>
              <Text style={styles.refValue}>{orderId.slice(0, 8).toUpperCase()}</Text>
            </View>
            <View style={styles.orderRef}>
              <Text style={styles.refLabel}>Confirmation sent to</Text>
              <Text style={styles.refValue}>{shipping.email}</Text>
            </View>
            <View style={styles.orderRef}>
              <Text style={styles.refLabel}>Order total</Text>
              <Text style={[styles.refValue, { color: colors.primary }]}>
                £{total.toFixed(2)}
              </Text>
            </View>
            <Button
              label="Continue Shopping"
              onPress={() => navigation.navigate('HomeTab')}
              style={{ marginTop: spacing[6] }}
            />
          </View>
        )}

        <View style={{ height: spacing[8] }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  back: { width: 40, height: 40, alignItems: 'flex-start', justifyContent: 'center' },
  headerTitle: {
    fontSize: fontSizes.lg,
    color: colors.textPrimary,
    fontFamily: 'Inter_700Bold',
  },
  body: { paddingHorizontal: spacing[4] },
  sectionTitle: {
    fontSize: fontSizes.xl,
    color: colors.textPrimary,
    fontFamily: 'Inter_700Bold',
    marginBottom: spacing[4],
  },
  twoCol: { flexDirection: 'row' },
  orderSummary: {
    backgroundColor: colors.primaryLight,
    borderRadius: radii.lg,
    padding: spacing[3],
    marginBottom: spacing[4],
  },
  summaryLabel: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    fontFamily: 'Inter_400Regular',
  },
  summaryTotal: {
    color: colors.primary,
    fontFamily: 'Inter_700Bold',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF5F5',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.error,
    padding: spacing[3],
    marginBottom: spacing[4],
    gap: spacing[2],
  },
  errorText: {
    flex: 1,
    fontSize: fontSizes.sm,
    color: colors.error,
    fontFamily: 'Inter_400Regular',
  },
  secureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[2],
    marginTop: spacing[3],
  },
  secureText: {
    flex: 1,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    fontFamily: 'Inter_400Regular',
    lineHeight: 18,
  },
  confirmation: { alignItems: 'center', paddingTop: spacing[6] },
  successIcon: { marginBottom: spacing[4] },
  successTitle: {
    fontSize: fontSizes['3xl'],
    color: colors.textPrimary,
    fontFamily: 'Inter_700Bold',
    marginBottom: spacing[2],
  },
  successSub: {
    fontSize: fontSizes.base,
    color: colors.textSecondary,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    marginBottom: spacing[6],
    lineHeight: 24,
  },
  orderRef: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing[4],
    marginBottom: spacing[3],
    ...shadows.sm,
  },
  refLabel: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    fontFamily: 'Inter_400Regular',
    marginBottom: spacing[1],
  },
  refValue: {
    fontSize: fontSizes.base,
    color: colors.textPrimary,
    fontFamily: 'Inter_700Bold',
  },
});

export default CheckoutScreen;
