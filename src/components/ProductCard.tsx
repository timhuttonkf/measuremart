/**
 * ProductCard — reusable card used in grids and horizontal lists.
 * Tapping the card fires a navigation event; the add-to-cart button
 * fires an add_to_cart analytics event via CartContext.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Product } from '../types';
import { colors, fontSizes, radii, shadows, spacing } from '../config/theme';
import StarRating from './StarRating';
import { useCart } from '../context/CartContext';
import ProductImage from './ProductImage';

const COLUMN_GAP = spacing[3];
const CARD_WIDTH = (Dimensions.get('window').width - spacing[4] * 2 - COLUMN_GAP) / 2;

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  width?: number;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  width = CARD_WIDTH,
}) => {
  const { addToCart } = useCart();
  const discount = product.comparePrice
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : 0;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.card, { width }]}
    >
      {/* Product image placeholder */}
      <View style={styles.imageContainer}>
        <ProductImage productId={product.id} categoryId={product.category} size={width} />
        {discount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>-{discount}%</Text>
          </View>
        )}
        {!product.inStock && (
          <View style={styles.outOfStock}>
            <Text style={styles.outOfStockText}>Out of stock</Text>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        <StarRating rating={product.rating} reviewCount={product.reviewCount} size={12} />

        <View style={styles.priceRow}>
          <Text style={styles.price}>£{product.price.toFixed(2)}</Text>
          {product.comparePrice && (
            <Text style={styles.comparePrice}>
              £{product.comparePrice.toFixed(2)}
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={[styles.addButton, !product.inStock && styles.addButtonDisabled]}
          onPress={() => product.inStock && addToCart(product, 1)}
          disabled={!product.inStock}
          activeOpacity={0.8}
        >
          <MaterialIcons name="add-shopping-cart" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    overflow: 'hidden',
    ...shadows.md,
    marginBottom: spacing[3],
  },
  imageContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: spacing[2],
    left: spacing[2],
    backgroundColor: colors.accent,
    borderRadius: radii.sm,
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
  },
  badgeText: {
    color: '#fff',
    fontSize: fontSizes.xs,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  outOfStock: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    padding: spacing[1],
    alignItems: 'center',
  },
  outOfStockText: {
    color: '#fff',
    fontSize: fontSizes.xs,
    fontFamily: 'Inter_500Medium',
  },
  info: {
    padding: spacing[3],
  },
  name: {
    fontSize: fontSizes.sm,
    color: colors.textPrimary,
    fontFamily: 'Inter_500Medium',
    marginBottom: spacing[1],
    lineHeight: 18,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing[2],
    marginBottom: spacing[2],
  },
  price: {
    fontSize: fontSizes.base,
    color: colors.textPrimary,
    fontFamily: 'Inter_700Bold',
    marginRight: spacing[2],
  },
  comparePrice: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    fontFamily: 'Inter_400Regular',
    textDecorationLine: 'line-through',
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    height: 32,
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  addButtonDisabled: { backgroundColor: colors.textMuted },
});

export default ProductCard;
