/**
 * OrderConfirmationScreen — standalone screen if navigated to directly with orderId.
 * The inline confirmation in CheckoutScreen (step 3) is the primary flow.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, fontSizes, spacing } from '../config/theme';
import Button from '../components/Button';

type Nav = NativeStackNavigationProp<any>;

const OrderConfirmationScreen = () => {
  const navigation = useNavigation<Nav>();
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <MaterialIcons name="check-circle" size={80} color={colors.success} />
        <Text style={styles.title}>Order Confirmed</Text>
        <Text style={styles.sub}>
          Your order has been placed successfully. You'll receive a confirmation shortly.
        </Text>
        <Button
          label="Continue Shopping"
          onPress={() => navigation.navigate('HomeTab')}
          style={{ marginTop: spacing[6] }}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[8],
  },
  title: {
    fontSize: fontSizes['2xl'],
    color: colors.textPrimary,
    fontFamily: 'Inter_700Bold',
    marginTop: spacing[4],
    marginBottom: spacing[2],
  },
  sub: {
    fontSize: fontSizes.base,
    color: colors.textSecondary,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default OrderConfirmationScreen;
