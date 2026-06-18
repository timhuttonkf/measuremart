import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, fontSizes } from '../config/theme';

interface StarRatingProps {
  rating: number;      // 0–5
  reviewCount?: number;
  size?: number;
  showCount?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  reviewCount,
  size = 14,
  showCount = true,
}) => {
  const stars = [1, 2, 3, 4, 5];

  return (
    <View style={styles.row}>
      {stars.map((star) => {
        const filled = rating >= star;
        const half = !filled && rating >= star - 0.5;
        return (
          <MaterialIcons
            key={star}
            name={filled ? 'star' : half ? 'star-half' : 'star-border'}
            size={size}
            color={filled || half ? '#F59E0B' : colors.border}
            style={{ marginRight: 1 }}
          />
        );
      })}
      {showCount && reviewCount !== undefined && (
        <Text style={[styles.count, { fontSize: size - 2 }]}>
          {' '}({reviewCount})
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  count: {
    color: colors.textSecondary,
    fontFamily: 'Inter_400Regular',
  },
});

export default StarRating;
