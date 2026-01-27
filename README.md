# Horoscope App

A production-ready iOS horoscope app with lock screen widgets. Users pick their zodiac sign and preferred writing style, and receive daily horoscope messages that update automatically.

## Features

- **12 Zodiac Signs** with traits and date ranges
- **3 Writing Styles**: Plain, Funny, Mystic
- **Lock Screen Widgets** (accessoryCircular, accessoryRectangular)
- **Home Screen Widgets** (systemSmall, systemMedium)
- **Offline Support** - Shows last saved horoscope when offline
- **Firebase Backend** - Firestore for data, Anonymous Auth for user preferences
- **Debug Seeder** - Generate demo horoscopes without a server

## Architecture

```
/HoroscopeApp
  /Models          - Data models (ZodiacSign, HoroscopeStyle, etc.)
  /Services        - Firebase, DateProvider, Constants
  /Storage         - AppGroupStore for widget sharing
  /Repositories    - HoroscopeRepository, UserRepository
  /ViewModels      - MVVM ViewModels
  /Views           - SwiftUI Views
  /Debug           - Admin seeder (DEBUG builds only)

/HoroscopeWidget
  - Widget extension files
  - Reads from AppGroupStore (no Firebase dependency)
```

## Prerequisites

- Xcode 15.0+
- iOS 17.0+
- Firebase project with Firestore and Anonymous Auth enabled
- Apple Developer account (for App Groups)

## Setup Instructions

### Step 1: Create Xcode Project

1. Open Xcode and create a new project:
   - Choose **App** template
   - Product Name: `HoroscopeApp`
   - Organization Identifier: `com.yourname` (or your preferred identifier)
   - Interface: **SwiftUI**
   - Language: **Swift**

2. Add Widget Extension:
   - File → New → Target
   - Choose **Widget Extension**
   - Product Name: `HoroscopeWidget`
   - Uncheck "Include Configuration Intent"
   - Click Finish

### Step 2: Add Source Files

1. Delete the auto-generated files in both targets
2. Drag the `HoroscopeApp` folder contents into the HoroscopeApp target
3. Drag the `HoroscopeWidget` folder contents into the HoroscopeWidget target

### Step 3: Configure App Groups

1. Select the HoroscopeApp target
2. Go to **Signing & Capabilities**
3. Click **+ Capability** → **App Groups**
4. Add group: `group.com.horoscope.app`

5. Repeat for HoroscopeWidget target:
   - Select HoroscopeWidget target
   - **Signing & Capabilities** → **App Groups**
   - Add the same group: `group.com.horoscope.app`

> **Note**: If using a different App Group ID, update `Constants.appGroupId` in `Services/Constants.swift`

### Step 4: Add Firebase

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project or use existing
3. Add an iOS app:
   - Bundle ID: Your app's bundle identifier
   - Download `GoogleService-Info.plist`

4. In Firebase Console, enable:
   - **Authentication** → **Sign-in method** → Enable **Anonymous**
   - **Firestore Database** → Create database (start in test mode for development)

5. Add `GoogleService-Info.plist` to Xcode:
   - Drag file into the HoroscopeApp folder in Xcode
   - Ensure "Copy items if needed" is checked
   - Target: **HoroscopeApp** only (widget doesn't need it)

6. Add Firebase packages:
   - File → Add Package Dependencies
   - URL: `https://github.com/firebase/firebase-ios-sdk`
   - Add these products to HoroscopeApp target:
     - FirebaseAuth
     - FirebaseFirestore

### Step 5: Share Files with Widget

The widget needs access to certain model files. Add these files to **both targets**:

1. Select each file in Xcode
2. In the File Inspector, under "Target Membership", check both:
   - HoroscopeApp
   - HoroscopeWidgetExtension

Files to share:
- `Models/ZodiacSign.swift`
- `Models/HoroscopeStyle.swift`
- `Models/HoroscopeSlot.swift`
- `Models/Horoscope.swift` (for CachedHoroscope)
- `Services/Constants.swift`
- `Services/DateProvider.swift`

### Step 6: Build and Run

1. Select iPhone simulator
2. Build and run (Cmd + R)
3. Complete onboarding (pick sign and style)

## Running the Seeder

To populate Firestore with demo horoscopes:

1. **Build in DEBUG mode** (default in Xcode)
2. Run the app
3. Go to the **Admin** tab (only visible in DEBUG)
4. Tap **"Seed Today's Horoscopes"**
5. Wait for completion

Options:
- **Force Overwrite**: Replace existing horoscopes
- **Seed Next 7/14/30 Days**: Pre-generate future horoscopes

## Adding the Widget

### In Simulator:
1. Long press on home screen
2. Tap the **+** button (top left)
3. Search for "Horoscope"
4. Choose widget size:
   - **Circular**: Shows sign emoji + energy dots
   - **Rectangular**: Shows sign, style, and message
   - **Small/Medium**: Home screen versions

### On Device:
1. Lock screen → Long press
2. Tap "Customize"
3. Select Lock Screen
4. Tap a widget area
5. Find and add Horoscope widget

## Firestore Data Model

### horoscopes (collection)
```
Document ID: 2026-01-26__LEO__PLAIN__DAILY

{
  "date": "2026-01-26",
  "sign": "LEO",
  "style": "PLAIN",
  "slot": "DAILY",
  "message": "Your confident nature shines today...",
  "version": 1,
  "isActive": true,
  "createdAt": Timestamp
}
```

### users (collection)
```
Document ID: <Firebase UID>

{
  "preferredSign": "LEO",
  "preferredStyle": "PLAIN",
  "preferredSlotMode": "DAILY",
  "updatedAt": Timestamp
}
```

## Firestore Security Rules

For production, add these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Horoscopes are readable by anyone
    match /horoscopes/{docId} {
      allow read: if true;
      allow write: if false; // Only admin/cloud functions can write
    }
    
    // Users can only read/write their own document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Extending the App

### Add a New Style

1. Add case to `HoroscopeStyle` enum in `Models/HoroscopeStyle.swift`
2. Add templates array in `Debug/HoroscopeTemplates.swift`
3. Run seeder to generate horoscopes

### Add Triple Mode (3x daily)

1. The `HoroscopeSlot` enum already supports MORNING, AFTERNOON, NIGHT
2. Update seeder to generate all three slots
3. Update widget refresh logic in `WidgetProvider.swift`
4. Enable the toggle in Settings (currently UI-only)

### Add Premium Features

1. Create a `SubscriptionManager` service
2. Gate certain styles behind premium
3. Add in-app purchase handling

### Replace Seeder with Cloud Function

1. Create a Firebase Cloud Function
2. Schedule it to run at midnight in each timezone
3. Use the same template logic from `HoroscopeTemplates.swift`
4. Remove the Admin tab for production builds

## Troubleshooting

### Widget shows "Open app to set up"
- Complete onboarding in the app first
- Check that App Group is configured correctly

### Firebase not working
- Verify `GoogleService-Info.plist` is in the project
- Check Firebase Console for Auth and Firestore enabled
- Look for error messages in Xcode console

### Widget not updating
- Widget refreshes at 12:10 AM daily by default
- Force refresh: Edit widget → Remove → Add again
- Check that App Group ID matches in Constants.swift

### Build errors about missing modules
- Ensure Firebase packages are added correctly
- Clean build folder (Cmd + Shift + K)
- Restart Xcode

## Project Structure

```
horoscope-app/
├── README.md
├── HoroscopeApp.entitlements
├── HoroscopeWidget.entitlements
├── HoroscopeApp/
│   ├── HoroscopeApp.swift
│   ├── Info.plist
│   ├── Models/
│   │   ├── ZodiacSign.swift
│   │   ├── HoroscopeStyle.swift
│   │   ├── HoroscopeSlot.swift
│   │   ├── Horoscope.swift
│   │   └── UserPreferences.swift
│   ├── Services/
│   │   ├── Constants.swift
│   │   ├── FirebaseManager.swift
│   │   └── DateProvider.swift
│   ├── Storage/
│   │   └── AppGroupStore.swift
│   ├── Repositories/
│   │   ├── HoroscopeRepository.swift
│   │   └── UserRepository.swift
│   ├── ViewModels/
│   │   ├── OnboardingViewModel.swift
│   │   ├── HomeViewModel.swift
│   │   └── SettingsViewModel.swift
│   ├── Views/
│   │   ├── OnboardingFlow.swift
│   │   ├── HomeView.swift
│   │   └── SettingsView.swift
│   └── Debug/
│       ├── AdminSeedView.swift
│       ├── HoroscopeSeeder.swift
│       └── HoroscopeTemplates.swift
└── HoroscopeWidget/
    ├── HoroscopeWidget.swift
    ├── WidgetProvider.swift
    ├── WidgetEntry.swift
    ├── WidgetViews.swift
    ├── WidgetStoreReader.swift
    ├── Info.plist
    └── Shared/
        └── SharedModels.swift
```

## License

MIT License - feel free to use this code in your projects.
