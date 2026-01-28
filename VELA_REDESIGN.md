# Vela UI Redesign

The app UI has been redesigned around the **Vela** product identity: intimate, calm, personal.

## What changed

- **App name:** Display name "Vela" (Info.plist).
- **Structure:** Single main screen (Today). No tab bar. Profile and Expanded details are sheets.
- **Theme system:** `Theme/` (Colors, Radius, Shadow, Animation), `Typography`, `Spacing`. All views use these.
- **Today screen:** Minimal top bar (sign + settings). Large horoscope message. Slot label + "Updated at …". Tap message → expanded details sheet. Pull to refresh.
- **Onboarding:** Welcome → Personal (sign + tone) → Delivery (once vs morning/afternoon/night) → Widget intro (mock + Skip / Add to Lock Screen).
- **Profile sheet:** Sign, tone, delivery toggle. Debug: Admin, Reset onboarding.
- **Expanded details:** Bottom sheet with message, short expansion line, timestamp.

## What stayed the same

- **Backend:** Firebase, Firestore, App Group, caching, repositories, ViewModels (only small additions: `showExpandedDetails`, `slotLabel`).
- **Widget:** Unchanged. Still reads from App Group; no logic or storage changes.

## Xcode setup

1. **Include `Theme` in the app target**  
   The `HoroscopeApp/Theme/` folder (Theme.swift, Typography.swift, Spacing.swift) must be part of the **HoroscopeApp** target. If you add the whole `HoroscopeApp` group, Theme is included. If you add views/models only, add `Theme` too.

2. **Build and run**  
   Use the **HoroscopeApp** scheme. Onboarding → Today → tap message for details, gear for Profile.

## Widget

Widget code and behavior are unchanged. It continues to use the same App Group and cached horoscope. Optional follow-up: apply Vela colors to widget UI (would require sharing Theme with the widget target).
