// Project.swift
// This file documents the Xcode project configuration
// Use this as a reference when setting up the project in Xcode

/*
 XCODE PROJECT CONFIGURATION
 ===========================
 
 1. PROJECT SETTINGS
 -------------------
 - Deployment Target: iOS 17.0
 - Swift Language Version: Swift 5
 
 2. TARGETS
 ----------
 
 A) HoroscopeApp (iOS App)
    - Bundle Identifier: com.yourcompany.horoscopeapp
    - Entitlements: HoroscopeApp.entitlements
    - Info.plist: HoroscopeApp/Info.plist
    - Dependencies:
      - FirebaseAuth
      - FirebaseFirestore
 
 B) HoroscopeWidgetExtension (Widget Extension)
    - Bundle Identifier: com.yourcompany.horoscopeapp.widget
    - Entitlements: HoroscopeWidget.entitlements
    - Info.plist: HoroscopeWidget/Info.plist
    - Dependencies: None (reads from App Group)
 
 3. SHARED FILES (add to both targets)
 -------------------------------------
 - Models/ZodiacSign.swift
 - Models/HoroscopeStyle.swift
 - Models/HoroscopeSlot.swift
 - Models/Horoscope.swift
 - Services/Constants.swift
 - Services/DateProvider.swift
 
 4. APP GROUP
 ------------
 Identifier: group.com.horoscope.app
 (Update in Constants.swift if using different ID)
 
 5. FIREBASE SETUP
 -----------------
 - Add GoogleService-Info.plist to HoroscopeApp target only
 - Package URL: https://github.com/firebase/firebase-ios-sdk
 - Products: FirebaseAuth, FirebaseFirestore
 
 6. BUILD PHASES
 ---------------
 HoroscopeApp:
   - Embed App Extensions: HoroscopeWidgetExtension.appex
 
 7. WIDGET CONFIGURATION
 -----------------------
 Supported Widget Families:
   - accessoryCircular (Lock Screen)
   - accessoryRectangular (Lock Screen)
   - systemSmall (Home Screen)
   - systemMedium (Home Screen)
 */

// This file is for documentation only and is not compiled
