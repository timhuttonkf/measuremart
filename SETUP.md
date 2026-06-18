# MeasureMart — Setup Guide

Sample retail app for testing Firebase Analytics e-commerce tracking.  
Built with React Native (Expo) + Firebase.

---

## Prerequisites

- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- Expo Go app on your iOS or Android device (for quick testing)
- A Firebase project: **kingfisher-group-measurement**

---

## 1. Install dependencies

```bash
npm install
```

---

## 2. Configure Firebase

### 2a. Get your web app config

1. Open [Firebase Console](https://console.firebase.google.com/) → **kingfisher-group-measurement**
2. Project Settings → Your apps → Web app (create one if needed)
3. Copy the `firebaseConfig` object

### 2b. Add config to the app

Edit `src/config/firebase.ts` and replace the placeholder values:

```ts
const firebaseConfig = {
  apiKey: "YOUR_REAL_API_KEY",
  authDomain: "kingfisher-group-measurement.firebaseapp.com",
  projectId: "kingfisher-group-measurement",
  storageBucket: "kingfisher-group-measurement.appspot.com",
  messagingSenderId: "YOUR_REAL_SENDER_ID",
  appId: "YOUR_REAL_APP_ID",
  measurementId: "G-XXXXXXXXXX",   // ← critical for Analytics
};
```

### 2c. Enable Firebase services

In the Firebase Console, enable:

| Service | Notes |
|---------|-------|
| **Authentication** | Enable Email/Password sign-in method |
| **Firestore** | Create database in production mode |
| **Analytics** | Should be enabled by default for mobile apps |

### 2d. Firestore security rules (minimum for testing)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /orders/{orderId} {
      allow create: if true;           // guests + users can place orders
      allow read: if request.auth != null
                  && request.auth.uid == resource.data.userId;
    }
    match /carts/{userId} {
      allow read, write: if request.auth != null
                         && request.auth.uid == userId;
    }
  }
}
```

### 2e. Native Firebase config files (for standalone builds only)

For **Expo Go** testing, the JS config in `firebase.ts` is sufficient.

For standalone builds (EAS Build / Xcode / Android Studio):
- Download `google-services.json` (Android) from Firebase Console → Project Settings → Android app
- Download `GoogleService-Info.plist` (iOS) from Firebase Console → Project Settings → iOS app
- Place them in the project root (they are git-ignored)

---

## 3. Run the app

```bash
# Start Expo dev server
npm start

# Or target a specific platform
npm run ios
npm run android
```

Scan the QR code with Expo Go on your device.

---

## 4. Testing analytics

### Test card (always declines)
Use any card number starting with **1111** at checkout — e.g. `1111 2222 3333 4444`.  
All other card numbers succeed.

### GA4 events implemented

| Event | Trigger |
|-------|---------|
| `screen_view` | Every screen on mount |
| `view_item_list` | Home featured section, category pages |
| `view_item` | Product detail page |
| `search` | Search bar submission |
| `add_to_cart` | Add to Cart button |
| `remove_from_cart` | Remove item from cart |
| `view_cart` | Cart screen open |
| `begin_checkout` | Proceed to Checkout button |
| `add_shipping_info` | Shipping form submitted |
| `add_payment_info` | Payment form submitted (including declines) |
| `purchase` | Successful payment |
| `login` | User signs in |
| `sign_up` | New account created |

### Verify events in Firebase
- **DebugView**: Enable Analytics debug mode in your app and watch events in real time at Firebase Console → Analytics → DebugView
- **Events report**: Events appear in the Analytics dashboard within 24 hours

---

## 5. Project structure

```
src/
├── analytics/
│   └── events.ts          GA4 event helpers
├── components/
│   ├── Button.tsx
│   ├── CartItemRow.tsx
│   ├── CategoryCard.tsx
│   ├── Input.tsx
│   ├── ProductCard.tsx
│   ├── ProductImage.tsx
│   └── StarRating.tsx
├── config/
│   ├── firebase.ts        Firebase init + logEvent wrapper
│   └── theme.ts           Design tokens
├── context/
│   ├── AuthContext.tsx     Firebase Auth state
│   └── CartContext.tsx     Cart state + Firestore sync
├── data/
│   └── sampleProducts.ts  15 sample products across 4 categories
├── navigation/
│   ├── AuthNavigator.tsx
│   ├── MainNavigator.tsx
│   ├── RootNavigator.tsx
│   └── types.ts
├── screens/
│   ├── AccountScreen.tsx
│   ├── CartScreen.tsx
│   ├── CategoryDetailScreen.tsx
│   ├── CategoriesScreen.tsx
│   ├── CheckoutScreen.tsx
│   ├── HomeScreen.tsx
│   ├── LoginScreen.tsx
│   ├── OrderConfirmationScreen.tsx
│   ├── ProductDetailScreen.tsx
│   └── RegisterScreen.tsx
└── types/
    └── index.ts
```
