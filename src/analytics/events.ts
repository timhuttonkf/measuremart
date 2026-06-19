/**
 * GA4 e-commerce event specification.
 *
 * Every public function in this module corresponds to a standard GA4 event.
 * Keeping all analytics calls here means:
 *   - Event names and parameter shapes stay consistent across the app.
 *   - The rest of the codebase never imports from firebase/analytics directly.
 *   - Events are easy to audit, test, or swap for a different provider.
 *
 * GA4 e-commerce docs:
 * https://developers.google.com/analytics/devguides/collection/ga4/ecommerce
 */

import { logEvent } from '../config/firebase';
import { Product, CartItem, Order } from '../types';

/**
 * Converts a Product to the GA4 `items` array entry format.
 */
const toGa4Item = (product: Product, quantity = 1) => ({
  item_id: product.id,
  item_name: product.name,
  item_category: product.categoryName,
  price: product.price,
  quantity,
  currency: 'GBP',
});

/**
 * Logs a screen_view event.
 * Call this in a useEffect on every screen component
 */
export const logScreenView = (screenName: string, screenClass?: string) => {
  logEvent('screen_view', {
    firebase_screen: screenName,
    firebase_screen_class: screenClass ?? screenName,
  });
};

/**
 * view_item_list — fired when a list of products is displayed.
 * Use on home featured sections, category grids, and search results.
 * `listId` and `listName` identify which list was shown (e.g. "featured", "Laser Measures").
 */
export const logViewItemList = (
  products: Product[],
  listId: string,
  listName: string
) => {
  logEvent('view_item_list', {
    item_list_id: listId,
    item_list_name: listName,
    items: products.map((p) => toGa4Item(p)),
  });
};

/**
 * view_item — fired when a single product detail page is opened.
 */
export const logViewItem = (product: Product) => {
  const params: Record<string, unknown> = {
    currency: 'GBP',
    value: product.price,
    items: [toGa4Item(product)],
  };
  if (product.id === 'p11') {
    params.qa_test_param = 'This parameter value is deliberately longer than the one-hundred character maximum that GA4 enforces on custom event parameters, which should cause a truncation warning to appear in Firebase DebugView for QA validation purposes.';
  }
  logEvent('view_item', params);
};

/**
 * search — fired when the user submits a search query.
 */
export const logSearch = (searchTerm: string) => {
  logEvent('search', { search_term: searchTerm });
};


/**
 * add_to_cart — fired when the user adds a product to their cart.
 * `value` should equal price × quantity.
 */
export const logAddToCart = (product: Product, quantity: number) => {
  logEvent('add_to_cart', {
    currency: 'GBP',
    value: product.price * quantity,
    items: [toGa4Item(product, quantity)],
  });
};

/**
 * remove_from_cart — fired when the user removes a product from their cart.
 */
export const logRemoveFromCart = (product: Product, quantity: number) => {
  logEvent('remove_from_cart', {
    currency: 'GBP',
    value: product.price * quantity,
    items: [toGa4Item(product, quantity)],
  });
};

/**
 * view_cart — fired when the user opens the Cart screen.
 */
export const logViewCart = (items: CartItem[]) => {
  const value = items.reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0
  );
  logEvent('view_cart', {
    currency: 'GBP',
    value,
    items: items.map((i) => toGa4Item(i.product, i.quantity)),
  });
};

/**
 * begin_checkout — fired when the user taps "Proceed to Checkout".
a */
export const logBeginCheckout = (items: CartItem[], value: number) => {
  logEvent('begin_checkout', {
    currency: 'GBP',
    value,
    items: items.map((i) => toGa4Item(i.product, i.quantity)),
  });
};

/**
 * add_shipping_info — fired when the user completes step 1 (shipping address).
 * `shippingTier` is a free-form label such as "Standard" or "Express".
 */
export const logAddShippingInfo = (items: CartItem[], value: number, shippingTier: string) => {
  logEvent('add_shipping_info', {
    currency: 'GBP',
    value,
    shipping_tier: shippingTier,
    items: items.map((i) => toGa4Item(i.product, i.quantity)),
  });
};

/**
 * add_payment_info — fired when the user submits payment details.
 * `paymentType` should describe the method, e.g. "credit_card".
 * This fires even if the payment is subsequently declined so we can
 * distinguish "tried to pay" from "successfully paid".
 */
export const logAddPaymentInfo = (
  items: CartItem[],
  value: number,
  paymentType: string
) => {
  logEvent('add_payment_info', {
    currency: 'GBP',
    value,
    payment_type: paymentType,
    items: items.map((i) => toGa4Item(i.product, i.quantity)),
  });
};

/**
 * purchase — fired only after a successful payment.
 * includes:
 *   - transaction_id: unique order ID
 *   - value: order total (excluding tax)
 *   - tax: VAT / sales tax amount
 *   - currency: "GBP"
 *   - items: full product list
 */
export const logPurchase = (order: Order) => {
  logEvent('purchase', {
    transaction_id: order.id,
    currency: 'GBP',
    value: order.subtotal,
    tax: order.tax,
    shipping: 0,
    items: order.items.map((i) => toGa4Item(i.product, i.quantity)),
  });
};

/**
 * login — fired when an existing user signs in.
 * `method` should be "email_password", "google", etc.
 */
export const logLogin = (method: string) => {
  logEvent('login', { method });
};

/**
 * sign_up — fired when a new account is created.
 */
export const logSignUp = (method: string) => {
  logEvent('sign_up', { method });
};
