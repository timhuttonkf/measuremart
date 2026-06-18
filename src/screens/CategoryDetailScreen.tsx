/**
 * CategoryDetailScreen — 2-column grid of products in a category.
 * Analytics: screen_view and view_item_list on mount.
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';

import { colors, fontSizes, spacing } from '../config/theme';
import { logScreenView, logViewItemList } from '../analytics/events';
import { getProductsByCategory } from '../data/sampleProducts';
import ProductCard from '../components/ProductCard';

type RouteParams = { categoryId: string; categoryName: string };
type Nav = NativeStackNavigationProp<any>;

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - spacing[4] * 2 - spacing[3]) / 2;

const CategoryDetailScreen = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<Record<string, RouteParams>, string>>();
  const { categoryId, categoryName } = route.params;
  const products = getProductsByCategory(categoryId);

  useEffect(() => {
    logScreenView(`Category_${categoryId}`);
    logViewItemList(products, categoryId, categoryName);
  }, [categoryId]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <MaterialIcons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>{categoryName}</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={products}
        numColumns={2}
        keyExtractor={(p) => p.id}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            width={CARD_WIDTH}
            onPress={() =>
              navigation.navigate('ProductDetail', { productId: item.id })
            }
          />
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No products in this category yet.</Text>
        }
      />
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
  title: {
    fontSize: fontSizes.lg,
    color: colors.textPrimary,
    fontFamily: 'Inter_700Bold',
    flex: 1,
    textAlign: 'center',
  },
  list: { paddingHorizontal: spacing[4], paddingBottom: spacing[8] },
  row: { gap: spacing[3] },
  empty: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontFamily: 'Inter_400Regular',
    marginTop: spacing[10],
  },
});

export default CategoryDetailScreen;
