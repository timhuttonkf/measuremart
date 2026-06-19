# MeasureMart

A sample retail app for testing Firebase Analytics e-commerce tracking, built with React Native (Expo) and Firebase. Covers the full GA4 e-commerce funnel from product browsing through to purchase.

---

## Live web app

Hosted on Firebase Hosting — use the below URL for browser based testing

[Firebase URL](https://measuremart.web.app/)

To test analytics in real time, append `?debug_mode=true` to the URL and open **Firebase Console → Analytics → DebugView**.

To test it as an actual app - either deploy through Expo or deploy to an emulator in Android Studio

---

## Tech stack

- React Native with Expo (SDK 51)
- TypeScript
- Firebase (Auth, Firestore, Analytics)
- React Navigation v6

---

## Prerequisites

- Node.js 18+
- Expo CLI: `npm install -g expo-cli`

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Enable Firebase services

| Service | Setup |
|---------|-------|
| **Authentication** | Firebase Console → Authentication → Sign-in method → Email/Password → Enable |
| **Firestore** | Firebase Console → Firestore → Create database |
| **Analytics** | Enabled by default |

### 3. Firestore security rules

Paste these into Firebase Console → Firestore → Rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /orders/{orderId} {
      allow create: if true;
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

### 4. Run locally as an app

```bash
npx expo start --offline
```

### 5. Deploy web version (if app won't work)

```bash
npx expo export --platform web
firebase deploy --only hosting:measuremart
```

---

## Testing analytics

### Test card
Any card number starting with **1111** always declines — e.g. `1111 2222 3333 4444`.
All other card numbers succeed.

### QA test product
The **Bosch GLM 50 C Laser Distance Measurer** intentionally sends an oversized `qa_test_param` (>100 characters) on the `view_item` event to test GA4 parameter truncation behaviour. Open the product page and check DebugView to see the truncated value.

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

### Viewing events in Firebase
- **Real time**: Add `?debug_mode=true` to the hosted URL → Firebase Console → Analytics → DebugView
- **Reports**: Events appear in the Analytics dashboard within 24 hours

---

## Project structure

```
src/
├── analytics/
│   └── events.ts          GA4 events
├── components/            Reusable UI components
├── config/
│   ├── firebase.ts        Firebase init + logEvent wrapper
│   └── theme.ts           Design tokens (colours, spacing, typography)
├── context/
│   ├── AuthContext.tsx    Firebase Auth state
│   └── CartContext.tsx    Cart state + Firestore sync
├── data/
│   └── sampleProducts.ts  18 sample products across 4 categories
├── navigation/            React Navigation stack + tab navigators
├── screens/               One file per screen
└── types/
    └── index.ts           Shared TypeScript interfaces
```
