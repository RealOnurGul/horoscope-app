# Horoscope product plan

## Product direction

The app is a calm, premium daily ritual rather than a feed of generic horoscope copy. Onboarding collects only the birth details needed for personalization, explains why each detail matters, and permits users to skip uncertain or sensitive information.

The daily experience contains three editorial readings:

1. Morning intention
2. Midday perspective
3. Evening reflection

## Phase 1 — local experience

Status: implemented in the current Expo Go build.

- Four-step onboarding
- Local profile storage
- Sun-sign calculation
- Three time-based mock readings
- Polished celestial visual system
- No account or server dependency

## Phase 2 — production content service

Use a small hosted PostgreSQL service such as Supabase. Authentication is not required initially. The app should send only the minimum delivery context, not the user's full birth details.

Suggested `daily_messages` fields:

- `id`
- `publish_date`
- `zodiac_sign`
- `slot` (`morning`, `afternoon`, `evening`)
- `title`
- `message`
- `reflection`
- `published_at`

The app downloads a day's readings, validates them, and caches them locally. A bundled fallback guarantees that the app still works offline.

Birth date, estimated birth time, and birthplace should remain on-device until a real natal-chart feature makes server processing necessary. If that feature is added, it needs a clear consent screen and deletion controls.

## Phase 3 — iOS widget build

The lock-screen widget requires `expo-widgets`, a newer Expo SDK, and a custom development build. It cannot run in Expo Go.

Planned families:

- `accessoryRectangular`: short current message
- `accessoryInline`: one-line reading
- `systemSmall`: home-screen reading card

The main app downloads daily content and schedules a widget timeline for the three message times. Widget taps use the `horoscope://` URL scheme to open the matching reading in the app.

This phase should use EAS Build so the generated iOS extension can be tested without maintaining hand-written Xcode project files.

## Phase 4 — production quality

- Real content-authoring workflow
- Time-zone-aware message delivery
- Offline and stale-content handling
- Accessibility review and Dynamic Type support
- Privacy policy and birth-data controls
- Analytics limited to product health and reading engagement
- TestFlight testing across supported iPhone sizes and lock-screen styles

## Explicit non-goals for the current build

- User accounts
- Payments or subscriptions
- AI-generated production readings
- Social features
- Full natal-chart calculations
- Push-updated Live Activities
