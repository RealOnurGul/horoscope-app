// This file re-exports the shared models from the main app
// In Xcode, add the original model files to both targets instead of duplicating

import Foundation

// MARK: - NOTE
// The Models (ZodiacSign, HoroscopeStyle, HoroscopeSlot, CachedHoroscope)
// should be shared between the app and widget.
// 
// In Xcode, you have two options:
// 1. Add the model files to both targets (App and Widget)
// 2. Create a shared framework
//
// For simplicity, add these files to both targets:
// - Models/ZodiacSign.swift
// - Models/HoroscopeStyle.swift
// - Models/HoroscopeSlot.swift
// - Models/Horoscope.swift (only CachedHoroscope struct)
// - Services/Constants.swift
// - Services/DateProvider.swift
//
// The widget does NOT need Firebase, so it only imports the minimal required files.
