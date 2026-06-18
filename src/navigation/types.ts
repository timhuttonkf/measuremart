/**
 * Navigation type definitions.
 * Typed params for every route so TypeScript catches navigation mistakes.
 */

export type RootStackParamList = {
  Main: undefined;
  Auth: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  HomeTab: undefined;
  CategoriesTab: undefined;
  CartTab: undefined;
  AccountTab: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  ProductDetail: { productId: string };
  CategoryDetail: { categoryId: string; categoryName: string };
  Checkout: undefined;
  OrderConfirmation: { orderId: string };
};

export type CategoriesStackParamList = {
  Categories: undefined;
  CategoryDetail: { categoryId: string; categoryName: string };
  ProductDetail: { productId: string };
};
