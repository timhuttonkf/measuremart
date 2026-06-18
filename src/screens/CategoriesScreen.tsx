/**
 * CategoriesScreen — grid of all product categories.
 * Analytics: screen_view on mount.
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { colors, fontSizes, spacing } from '../config/theme';
import { logScreenView, logViewItemList } from '../analytics/events';
import { categories, sampleProducts } from '../data/sampleProducts';
import CategoryCard from '../components/CategoryCard';

const { width } = Dimensions.get('window');
type Nav = NativeStackNavigationProp<any>;

const CategoriesScreen = () => {
  const navigation = useNavigation<Nav>();

  useEffect(() => {
    logScreenView('Categories');
    logViewItemList(sampleProducts, 'all_categories', 'All Categories');
  }, []);

  const cardWidth = (width - spacing[4] * 2 - spacing[3]) / 2;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Categories</Text>
      </View>
      <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        {categories.map((cat) => (
          <CategoryCard
            key={cat.id}
            category={cat}
            width={cardWidth}
            onPress={() =>
              navigation.navigate('CategoryDetail', {
                categoryId: cat.id,
                categoryName: cat.name,
              })
            }
          />
        ))}
        <View style={{ height: spacing[8], width: '100%' }} />
      </ScrollView>
    </SafeAreaView>
  );
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
    gap: spacing[3],
  },
});

export default CategoriesScreen;
