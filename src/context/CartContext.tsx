/**
 * Shopping cart context.
 *
 * Cart state lives in memory and is synced to Firestore for logged-in users.
 * Guest carts are held in memory only (they are cleared on app restart).
 *
 * All cart mutations fire the appropriate GA4 e-commerce events so that
 * cart abandonment, add-to-cart rate, and checkout funnel can be tracked
 * in Firebase Analytics.
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  ReactNode,
} from 'react';
import { doc, setDoc, onSnapshot, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { CartItem, Product } from '../types';
import { logAddToCart, logRemoveFromCart } from '../analytics/events';
import { useAuth } from './AuthContext';

// ---------------------------------------------------------------------------
// State & reducer
// ---------------------------------------------------------------------------

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: 'SET_CART'; items: CartItem[] }
  | { type: 'ADD_ITEM'; product: Product; quantity: number }
  | { type: 'REMOVE_ITEM'; productId: string }
  | { type: 'UPDATE_QUANTITY'; productId: string; quantity: number }
  | { type: 'CLEAR_CART' };

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'SET_CART':
      return { items: action.items };

    case 'ADD_ITEM': {
      const existing = state.items.find(
        (i) => i.product.id === action.product.id
      );
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.product.id === action.product.id
              ? { ...i, quantity: i.quantity + action.quantity }
              : i
          ),
        };
      }
      return {
        items: [...state.items, { product: action.product, quantity: action.quantity }],
      };
    }

    case 'REMOVE_ITEM':
      return {
        items: state.items.filter((i) => i.product.id !== action.productId),
      };

    case 'UPDATE_QUANTITY':
      if (action.quantity <= 0) {
        return {
          items: state.items.filter((i) => i.product.id !== action.productId),
        };
      }
      return {
        items: state.items.map((i) =>
          i.product.id === action.productId
            ? { ...i, quantity: action.quantity }
            : i
        ),
      };

    case 'CLEAR_CART':
      return { items: [] };

    default:
      return state;
  }
};

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

// ---------------------------------------------------------------------------
// Firestore persistence
// ---------------------------------------------------------------------------

// Cart documents are stored at /carts/{userId} in Firestore.
const cartDocRef = (uid: string) => doc(db, 'carts', uid);

// CartItem[] to a plain structure for Firestore storage because
// Firestore does not understand class instances.
const serializeCart = (items: CartItem[]) =>
  items.map((i) => ({ product: { ...i.product }, quantity: i.quantity }));


export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });
  const { user } = useAuth();

  // When the user signs in, subscribe to their Firestore cart document so
  // the cart reflects any changes made on other devices.
  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(cartDocRef(user.uid), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data?.items) {
          dispatch({ type: 'SET_CART', items: data.items as CartItem[] });
        }
      }
    });

    return unsubscribe;
  }, [user]);

  // Persist the cart to Firestore whenever items change (authenticated only).
  useEffect(() => {
    if (!user) return;
    if (state.items.length === 0) {
      // Delete the document rather than writing an empty array to save reads.
      deleteDoc(cartDocRef(user.uid)).catch(() => {});
      return;
    }
    setDoc(cartDocRef(user.uid), { items: serializeCart(state.items) }).catch(
      () => {}
    );
  }, [state.items, user]);

  const addToCart = (product: Product, quantity = 1) => {
    dispatch({ type: 'ADD_ITEM', product, quantity });
    logAddToCart(product, quantity);
  };

  const removeFromCart = (productId: string) => {
    const item = state.items.find((i) => i.product.id === productId);
    if (item) {
      logRemoveFromCart(item.product, item.quantity);
    }
    dispatch({ type: 'REMOVE_ITEM', productId });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', productId, quantity });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = state.items.reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        itemCount,
        subtotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextValue => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
};
