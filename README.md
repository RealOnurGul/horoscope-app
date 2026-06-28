# Horoscope

A local-first Expo React Native app built with TypeScript. The current build includes:

- A premium, four-step birth-profile onboarding
- Optional estimated birth-time interaction
- Birth date and birthplace collection
- Automatic sun-sign calculation
- Three local readings throughout the day
- On-device profile persistence with AsyncStorage

The current build contains no login, payment flow, AI integration, or backend. See `PRODUCT_PLAN.md` for the staged production architecture and iOS widget plan.

## Run locally

```bash
npm install
npm start
```

Install Expo Go on your iPhone, connect the phone and computer to the same Wi-Fi network, then scan the QR code shown by Expo.

## Verification

```bash
npm run typecheck
npx expo export --platform ios
```
