/**
 * ProductImage — renders a coloured placeholder image for a product.
 * Replace with real <Image> components once I can be bothered t oget images
 * The colour is derived from the category so each category has a consistent look.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const CATEGORY_STYLES: Record<string, { bg: string; icon: string; iconColor: string }> = {
  'tape-measures': { bg: '#EBF5FF', icon: 'straighten', iconColor: '#1A56DB' },
  'laser-measures': { bg: '#F3F0FF', icon: 'highlight', iconColor: '#7E3AF2' },
  'levels':         { bg: '#F0FDF4', icon: 'square_foot', iconColor: '#0E9F6E' },
  'digital-tools':  { bg: '#FFF7ED', icon: 'analytics', iconColor: '#FF8A4C' },
};

const DEFAULT_STYLE = { bg: '#F9FAFB', icon: 'category', iconColor: '#6B7280' };

interface ProductImageProps {
  productId: string;
  categoryId: string;
  size?: number;
  height?: number;
}

const ProductImage: React.FC<ProductImageProps> = ({
  categoryId,
  size = 160,
  height,
}) => {
  const style = CATEGORY_STYLES[categoryId] ?? DEFAULT_STYLE;
  const h = height ?? size * 0.75;

  return (
    <View
      style={[
        styles.container,
        { width: size, height: h, backgroundColor: style.bg },
      ]}
    >
      <MaterialIcons
        name={style.icon as any}
        size={h * 0.4}
        color={style.iconColor}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ProductImage;
