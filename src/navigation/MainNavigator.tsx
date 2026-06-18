/**
 * Main tab navigator + stack navigators for each tab.
 *
 * Structure:
 *   Bottom Tabs
 *   ├── Home stack (Home → ProductDetail / CategoryDetail / Checkout / OrderConfirmation)
 *   ├── Categories stack (Categories → CategoryDetail → ProductDetail)
 *   ├── Cart stack (Cart → Checkout → OrderConfirmation)
 *   └── Account (single screen)
 *
 * The cart badge on the tab icon is driven by CartContext so it updates
 * in real time without any extra wiring.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import CategoryDetailScreen from '../screens/CategoryDetailScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import CartScreen from '../screens/CartScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import OrderConfirmationScreen from '../screens/OrderConfirmationScreen';
import AccountScreen from '../screens/AccountScreen';

import { useCart } from '../context/CartContext';
import { colors, fontSizes, radii } from '../config/theme';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const CatStack = createNativeStackNavigator();
const CartStack = createNativeStackNavigator();

// ---------------------------------------------------------------------------
// Stack navigators
// ---------------------------------------------------------------------------

const HomeStackNav = () => (
  <HomeStack.Navigator screenOptions={{ headerShown: false }}>
    <HomeStack.Screen name="Home" component={HomeScreen} />
    <HomeStack.Screen name="ProductDetail" component={ProductDetailScreen} />
    <HomeStack.Screen name="CategoryDetail" component={CategoryDetailScreen} />
    <HomeStack.Screen name="Checkout" component={CheckoutScreen} />
    <HomeStack.Screen name="OrderConfirmation" component={OrderConfirmationScreen} />
  </HomeStack.Navigator>
);

const CatStackNav = () => (
  <CatStack.Navigator screenOptions={{ headerShown: false }}>
    <CatStack.Screen name="Categories" component={CategoriesScreen} />
    <CatStack.Screen name="CategoryDetail" component={CategoryDetailScreen} />
    <CatStack.Screen name="ProductDetail" component={ProductDetailScreen} />
    <CatStack.Screen name="Checkout" component={CheckoutScreen} />
    <CatStack.Screen name="OrderConfirmation" component={OrderConfirmationScreen} />
  </CatStack.Navigator>
);

const CartStackNav = () => (
  <CartStack.Navigator screenOptions={{ headerShown: false }}>
    <CartStack.Screen name="Cart" component={CartScreen} />
    <CartStack.Screen name="Checkout" component={CheckoutScreen} />
    <CartStack.Screen name="OrderConfirmation" component={OrderConfirmationScreen} />
  </CartStack.Navigator>
);

// ---------------------------------------------------------------------------
// Cart badge component
// ---------------------------------------------------------------------------

const CartBadge = ({ color }: { color: string }) => {
  const { itemCount } = useCart();
  return (
    <View>
      <MaterialIcons name="shopping-cart" size={24} color={color} />
      {itemCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{itemCount > 99 ? '99+' : itemCount}</Text>
        </View>
      )}
    </View>
  );
};

// ---------------------------------------------------------------------------
// Main tab navigator
// ---------------------------------------------------------------------------

const MainNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: styles.tabBar,
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textSecondary,
      tabBarLabelStyle: styles.tabLabel,
    }}
  >
    <Tab.Screen
      name="HomeTab"
      component={HomeStackNav}
      options={{
        tabBarLabel: 'Home',
        tabBarIcon: ({ color }) => (
          <MaterialIcons name="home" size={24} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="CategoriesTab"
      component={CatStackNav}
      options={{
        tabBarLabel: 'Categories',
        tabBarIcon: ({ color }) => (
          <MaterialIcons name="grid-view" size={24} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="CartTab"
      component={CartStackNav}
      options={{
        tabBarLabel: 'Cart',
        tabBarIcon: ({ color }) => <CartBadge color={color} />,
      }}
    />
    <Tab.Screen
      name="AccountTab"
      component={AccountScreen}
      options={{
        tabBarLabel: 'Account',
        tabBarIcon: ({ color }) => (
          <MaterialIcons name="person" size={24} color={color} />
        ),
      }}
    />
  </Tab.Navigator>
);

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    height: 60,
    paddingBottom: 8,
    paddingTop: 4,
  },
  tabLabel: {
    fontSize: fontSizes.xs,
    fontFamily: 'Inter_500Medium',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: colors.accent,
    borderRadius: radii.full,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
  },
});

export default MainNavigator;
