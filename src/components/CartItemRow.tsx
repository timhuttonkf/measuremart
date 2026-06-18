import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { CartItem } from '../types';
import { colors, fontSizes, radii, spacing, shadows } from '../config/theme';
import ProductImage from './ProductImage';
import { useCart } from '../context/CartContext';

interface CartItemRowProps {
  item: CartItem;
}

const CartItemRow: React.FC<CartItemRowProps> = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();
  const { product, quantity } = item;

  return (
    <View style={styles.row}>
      <ProductImage
        productId={product.id}
        categoryId={product.category}
        size={72}
        height={72}
      />

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.price}>£{(product.price * quantity).toFixed(2)}</Text>
        <Text style={styles.unitPrice}>£{product.price.toFixed(2)} each</Text>

        <View style={styles.controls}>
          <TouchableOpacity
            onPress={() => updateQuantity(product.id, quantity - 1)}
            style={styles.qtyBtn}
          >
            <MaterialIcons name="remove" size={16} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.qty}>{quantity}</Text>
          <TouchableOpacity
            onPress={() => updateQuantity(product.id, quantity + 1)}
            style={styles.qtyBtn}
          >
            <MaterialIcons name="add" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => removeFromCart(product.id)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={styles.removeBtn}
      >
        <MaterialIcons name="close" size={18} color={colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    overflow: 'hidden',
    marginBottom: spacing[3],
    ...shadows.sm,
  },
  info: {
    flex: 1,
    padding: spacing[3],
  },
  name: {
    fontSize: fontSizes.sm,
    color: colors.textPrimary,
    fontFamily: 'Inter_500Medium',
    marginBottom: spacing[1],
    lineHeight: 18,
  },
  price: {
    fontSize: fontSizes.base,
    color: colors.textPrimary,
    fontFamily: 'Inter_700Bold',
  },
  unitPrice: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    fontFamily: 'Inter_400Regular',
    marginBottom: spacing[2],
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qty: {
    width: 32,
    textAlign: 'center',
    fontSize: fontSizes.base,
    fontFamily: 'Inter_600SemiBold',
    color: colors.textPrimary,
  },
  removeBtn: {
    padding: spacing[2],
  },
});

export default CartItemRow;
