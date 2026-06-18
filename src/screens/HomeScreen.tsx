/**
 * HomeScreen
 *
 * Analytics events fired here:
 *   - screen_view ("Home") on mount
 *   - view_item_list for featured products and new arrivals
 *   - search when the user submits the search bar
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { colors, fontSizes, radii, shadows, spacing } from '../config/theme';
import { logScreenView, logViewItemList, logSearch } from '../analytics/events';
import {
  getFeaturedProducts,
  sampleProducts,
  categories,
} from '../data/sampleProducts';
import ProductCard from '../components/ProductCard';
import CategoryCard from '../components/CategoryCard';
import { useCart } from '../context/CartContext';

const { width } = Dimensions.get('window');

type Nav = NativeStackNavigationProp<any>;

const HomeScreen = () => {
  const navigation = useNavigation<Nav>();
  const { itemCount } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const featured = getFeaturedProducts();
  const newArrivals = sampleProducts.slice(-4).reverse();

  useEffect(() => {
    // GA4: screen_view — tell Analytics the user is on the Home screen
    logScreenView('Home');
    // GA4: view_item_list — featured products are visible on mount
    logViewItemList(featured, 'home_featured', 'Featured Products');
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      logSearch(searchQuery.trim()); // GA4: search event
      // Navigate to categories with search context (simplified)
      navigation.navigate('CategoriesTab');
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back 👋</Text>
            <Text style={styles.title}>MeasureMart</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('CartTab')}
            style={styles.cartBtn}
          >
            <MaterialIcons name="shopping-cart" size={24} color={colors.primary} />
            {itemCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{itemCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* ── Search bar ── */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <MaterialIcons name="search" size={20} color={colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search tools & equipment..."
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
          </View>
        </View>

        {/* ── Hero banner ── */}
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <Text style={styles.heroEyebrow}>PROFESSIONAL GRADE</Text>
          <Text style={styles.heroTitle}>Measure with{'\n'}Confidence</Text>
          <Text style={styles.heroSub}>
            Precision instruments for every job
          </Text>
          <TouchableOpacity
            style={styles.heroBtn}
            onPress={() => navigation.navigate('CategoriesTab')}
          >
            <Text style={styles.heroBtnText}>Shop All</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* ── Category quick links ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <TouchableOpacity onPress={() => navigation.navigate('CategoriesTab')}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.categoryGrid}>
          {categories.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              width={(width - spacing[4] * 2 - spacing[3]) / 2}
              onPress={() =>
                navigation.navigate('CategoryDetail', {
                  categoryId: cat.id,
                  categoryName: cat.name,
                })
              }
            />
          ))}
        </View>

        {/* ── Featured products ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured</Text>
        </View>
        <FlatList
          data={featured}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(p) => p.id}
          contentContainerStyle={styles.hList}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              width={160}
              onPress={() =>
                navigation.navigate('ProductDetail', { productId: item.id })
              }
            />
          )}
        />

        {/* ── New arrivals ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>New Arrivals</Text>
        </View>
        <View style={styles.grid}>
          {newArrivals.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onPress={() =>
                navigation.navigate('ProductDetail', { productId: p.id })
              }
            />
          ))}
        </View>

        <View style={{ height: spacing[8] }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
    paddingBottom: spacing[2],
  },
  greeting: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    fontFamily: 'Inter_400Regular',
  },
  title: {
    fontSize: fontSizes['2xl'],
    color: colors.textPrimary,
    fontFamily: 'Inter_700Bold',
  },
  cartBtn: { position: 'relative', padding: spacing[2] },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.accent,
    borderRadius: 99,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontSize: 9, fontFamily: 'Inter_700Bold' },
  searchRow: { paddingHorizontal: spacing[4], marginBottom: spacing[4] },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.full,
    paddingHorizontal: spacing[4],
    height: 44,
    ...shadows.sm,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing[2],
    fontSize: fontSizes.base,
    color: colors.textPrimary,
    fontFamily: 'Inter_400Regular',
  },
  hero: {
    marginHorizontal: spacing[4],
    borderRadius: radii['2xl'],
    padding: spacing[6],
    marginBottom: spacing[6],
  },
  heroEyebrow: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: fontSizes.xs,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 1.5,
    marginBottom: spacing[2],
  },
  heroTitle: {
    color: '#fff',
    fontSize: fontSizes['3xl'],
    fontFamily: 'Inter_700Bold',
    lineHeight: 36,
    marginBottom: spacing[2],
  },
  heroSub: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: fontSizes.sm,
    fontFamily: 'Inter_400Regular',
    marginBottom: spacing[4],
  },
  heroBtn: {
    backgroundColor: '#fff',
    borderRadius: radii.full,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[6],
    alignSelf: 'flex-start',
  },
  heroBtnText: {
    color: colors.primary,
    fontSize: fontSizes.sm,
    fontFamily: 'Inter_700Bold',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    marginBottom: spacing[3],
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    color: colors.textPrimary,
    fontFamily: 'Inter_700Bold',
  },
  seeAll: {
    fontSize: fontSizes.sm,
    color: colors.primary,
    fontFamily: 'Inter_500Medium',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing[4],
    gap: spacing[3],
    marginBottom: spacing[6],
  },
  hList: { paddingHorizontal: spacing[4], gap: spacing[3] },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing[4],
    gap: spacing[3],
  },
});

export default HomeScreen;
