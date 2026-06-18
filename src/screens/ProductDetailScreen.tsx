/**
 * ProductDetailScreen
 *
 * Analytics events:
 *   - screen_view ("ProductDetail") on mount
 *   - view_item on mount
 *   - add_to_cart when the user taps Add to Cart
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';

import { colors, fontSizes, radii, shadows, spacing } from '../config/theme';
import { logScreenView, logViewItem } from '../analytics/events';
import { getProductById, sampleProducts } from '../data/sampleProducts';
import { useCart } from '../context/CartContext';
import ProductImage from '../components/ProductImage';
import StarRating from '../components/StarRating';
import Button from '../components/Button';
import ProductCard from '../components/ProductCard';

type RouteParams = { productId: string };
type Nav = NativeStackNavigationProp<any>;

const { width } = Dimensions.get('window');

const ProductDetailScreen = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<Record<string, RouteParams>, string>>();
  const { productId } = route.params;
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  const product = getProductById(productId);

  useEffect(() => {
    if (!product) return;
    logScreenView('ProductDetail');
    logViewItem(product); // GA4: view_item
  }, [productId]);

  if (!product) {
    return (
      <View style={styles.notFound}>
        <Text>Product not found.</Text>
      </View>
    );
  }

  const discount = product.comparePrice
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : 0;

  // Related products: same category, excluding current product
  const related = sampleProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    addToCart(product, quantity); // fires add_to_cart via CartContext
    Alert.alert('Added to Cart', `${product.name} × ${quantity} added.`, [
      { text: 'Continue Shopping' },
      { text: 'View Cart', onPress: () => navigation.navigate('CartTab') },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Back button */}
        <View style={styles.backRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Product image */}
        <ProductImage
          productId={product.id}
          categoryId={product.category}
          size={width}
          height={280}
        />

        <View style={styles.body}>
          {/* Name & category */}
          <Text style={styles.category}>{product.categoryName}</Text>
          <Text style={styles.name}>{product.name}</Text>

          {/* Rating */}
          <StarRating
            rating={product.rating}
            reviewCount={product.reviewCount}
            size={16}
          />

          {/* Price */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>£{product.price.toFixed(2)}</Text>
            {product.comparePrice && (
              <Text style={styles.comparePrice}>
                £{product.comparePrice.toFixed(2)}
              </Text>
            )}
            {discount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>-{discount}%</Text>
              </View>
            )}
          </View>

          {/* Stock status */}
          <View style={styles.stockRow}>
            <MaterialIcons
              name={product.inStock ? 'check-circle' : 'cancel'}
              size={16}
              color={product.inStock ? colors.success : colors.error}
            />
            <Text
              style={[
                styles.stockText,
                { color: product.inStock ? colors.success : colors.error },
              ]}
            >
              {product.inStock ? 'In Stock' : 'Out of Stock'}
            </Text>
          </View>

          {/* Description */}
          <Text style={styles.descHeader}>About this product</Text>
          <Text style={styles.description}>{product.description}</Text>

          {/* Specifications */}
          <Text style={styles.descHeader}>Specifications</Text>
          <View style={styles.specs}>
            {Object.entries(product.specifications).map(([key, value], i) => (
              <View
                key={key}
                style={[styles.specRow, i % 2 === 0 && styles.specRowAlt]}
              >
                <Text style={styles.specKey}>{key}</Text>
                <Text style={styles.specValue}>{value}</Text>
              </View>
            ))}
          </View>

          {/* Quantity selector */}
          <View style={styles.qtyRow}>
            <Text style={styles.qtyLabel}>Quantity</Text>
            <View style={styles.qtyControls}>
              <TouchableOpacity
                onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                style={styles.qtyBtn}
              >
                <MaterialIcons name="remove" size={18} color={colors.primary} />
              </TouchableOpacity>
              <Text style={styles.qtyValue}>{quantity}</Text>
              <TouchableOpacity
                onPress={() => setQuantity((q) => q + 1)}
                style={styles.qtyBtn}
              >
                <MaterialIcons name="add" size={18} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Add to cart */}
          <Button
            label={product.inStock ? `Add to Cart — £${(product.price * quantity).toFixed(2)}` : 'Out of Stock'}
            onPress={handleAddToCart}
            disabled={!product.inStock}
            style={{ marginBottom: spacing[4] }}
          />

          {/* Related products */}
          {related.length > 0 && (
            <>
              <Text style={[styles.descHeader, { marginTop: spacing[4] }]}>
                Related Products
              </Text>
              <View style={styles.relatedGrid}>
                {related.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    width={(width - spacing[4] * 2 - spacing[3]) / 2}
                    onPress={() =>
                      navigation.push('ProductDetail', { productId: p.id })
                    }
                  />
                ))}
              </View>
            </>
          )}

          <View style={{ height: spacing[8] }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  backRow: {
    position: 'absolute',
    top: spacing[4],
    left: spacing[4],
    zIndex: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  body: { padding: spacing[4] },
  category: {
    fontSize: fontSizes.sm,
    color: colors.primary,
    fontFamily: 'Inter_500Medium',
    marginBottom: spacing[1],
  },
  name: {
    fontSize: fontSizes['2xl'],
    color: colors.textPrimary,
    fontFamily: 'Inter_700Bold',
    marginBottom: spacing[2],
    lineHeight: 30,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing[3],
    marginBottom: spacing[3],
    gap: spacing[2],
  },
  price: {
    fontSize: fontSizes['2xl'],
    color: colors.textPrimary,
    fontFamily: 'Inter_700Bold',
  },
  comparePrice: {
    fontSize: fontSizes.lg,
    color: colors.textMuted,
    fontFamily: 'Inter_400Regular',
    textDecorationLine: 'line-through',
  },
  badge: {
    backgroundColor: colors.accent,
    borderRadius: radii.sm,
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
  },
  badgeText: {
    color: '#fff',
    fontSize: fontSizes.xs,
    fontFamily: 'Inter_700Bold',
  },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    marginBottom: spacing[4],
  },
  stockText: { fontSize: fontSizes.sm, fontFamily: 'Inter_500Medium' },
  descHeader: {
    fontSize: fontSizes.base,
    color: colors.textPrimary,
    fontFamily: 'Inter_700Bold',
    marginBottom: spacing[2],
    marginTop: spacing[2],
  },
  description: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    fontFamily: 'Inter_400Regular',
    lineHeight: 22,
    marginBottom: spacing[4],
  },
  specs: {
    borderRadius: radii.lg,
    overflow: 'hidden',
    marginBottom: spacing[4],
    borderWidth: 1,
    borderColor: colors.border,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing[3],
  },
  specRowAlt: { backgroundColor: colors.background },
  specKey: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    fontFamily: 'Inter_400Regular',
    flex: 1,
  },
  specValue: {
    fontSize: fontSizes.sm,
    color: colors.textPrimary,
    fontFamily: 'Inter_500Medium',
    flex: 1,
    textAlign: 'right',
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[4],
  },
  qtyLabel: {
    fontSize: fontSizes.base,
    color: colors.textPrimary,
    fontFamily: 'Inter_600SemiBold',
  },
  qtyControls: { flexDirection: 'row', alignItems: 'center' },
  qtyBtn: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyValue: {
    width: 44,
    textAlign: 'center',
    fontSize: fontSizes.lg,
    fontFamily: 'Inter_700Bold',
    color: colors.textPrimary,
  },
  relatedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
  },
});

export default ProductDetailScreen;
