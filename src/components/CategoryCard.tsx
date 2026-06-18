import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Category } from '../types';
import { radii, shadows, spacing, fontSizes } from '../config/theme';

interface CategoryCardProps {
  category: Category;
  onPress: () => void;
  width?: number;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, onPress, width }) => {
  const bg = category.color + '18'; // 10% opacity tint

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.card, width ? { width } : undefined, { backgroundColor: bg }]}
    >
      <View style={[styles.iconWrap, { backgroundColor: category.color + '25' }]}>
        <MaterialIcons name={category.icon as any} size={28} color={category.color} />
      </View>
      <Text style={[styles.name, { color: category.color }]}>{category.name}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.xl,
    padding: spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
    minHeight: 100,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[2],
  },
  name: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
  },
});

export default CategoryCard;
