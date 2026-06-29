# Horoscope

A local-first Expo React Native app built with TypeScript. The current build includes:

- A premium, four-step birth-profile onboarding
- Optional estimated birth-time interaction
- Birth date and birthplace collection
- Interactive 3D Earth birthplace targeting with inertial rotation, deep pinch zoom, country/coastline overlays, and offline nearest-city matching
- Automatic sun-sign calculation
- Three local readings throughout the day
- Encrypted on-device profile persistence with Expo SecureStore

The current build contains no login, payment flow, or AI integration. The remote content service is optional; without configuration, bundled readings keep the app fully functional. See `PRODUCT_PLAN.md` for the staged production architecture and iOS widget plan.

The globe uses NASA-derived Earth imagery and a filtered GeoNames city dataset. See `ATTRIBUTIONS.md` for source and license details.

## Optional content service

The app runs entirely from bundled readings when no server is configured. To connect a Supabase project:

1. Run `supabase/migrations/202606280001_create_daily_messages.sql` in the Supabase SQL editor.
2. Run `supabase/seed.sql` to create today's three readings for all signs.
3. Copy `.env.example` to `.env.local`.
4. Add the project URL and **publishable** key from the Supabase Connect dialog.
5. Restart Expo with `npm start -- --clear`.

Never put a Supabase secret key in the app. Mobile environment variables are public in the compiled bundle. The database migration grants clients read-only access to published messages and enables Row Level Security.

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
