import Foundation

/// Centralized constants to avoid hard-coded strings scattered across codebase
enum Constants {
    
    // MARK: - App Group
    
    /// App Group identifier for sharing data between app and widget
    /// IMPORTANT: Update this to match your actual App Group ID in Xcode
    static let appGroupId = "group.com.horoscope.app"
    
    // MARK: - Firestore Collections
    
    enum Firestore {
        static let horoscopesCollection = "horoscopes"
        static let usersCollection = "users"
    }
    
    // MARK: - Date Formats
    
    enum DateFormats {
        /// Format for horoscope document IDs and date fields
        static let horoscopeDate = "yyyy-MM-dd"
        
        /// Format for displaying time to users
        static let displayTime = "h:mm a"
        
        /// Format for displaying date to users
        static let displayDate = "EEEE, MMMM d"
        
        /// Format for widget timestamp
        static let widgetTimestamp = "h:mm a"
    }
    
    // MARK: - Storage Keys
    
    enum StorageKeys {
        static let preferredSign = "preferredSign"
        static let preferredStyle = "preferredStyle"
        static let preferredSlotMode = "preferredSlotMode"
        static let cachedHoroscope = "cachedHoroscope"
        static let hasCompletedOnboarding = "hasCompletedOnboarding"
        static let lastFetchDate = "lastFetchDate"
    }
    
    // MARK: - Widget
    
    enum Widget {
        /// Widget kind identifier
        static let kind = "HoroscopeWidget"
        
        /// How often the widget timeline refreshes (in hours)
        static let refreshIntervalHours = 1
        
        /// Time of day for daily refresh (hour in 24h format)
        static let dailyRefreshHour = 0
        static let dailyRefreshMinute = 10
    }
    
    // MARK: - UI
    
    enum UI {
        static let maxMessageLines = 4
        static let animationDuration = 0.3
    }
    
    // MARK: - Fallback Messages
    
    enum Fallback {
        static let noHoroscope = "Your horoscope isn't ready yet. Pull to refresh later."
        static let widgetPlaceholder = "Add this widget to see your daily horoscope"
        static let widgetNoData = "Open app to set up"
        static let offlineMessage = "Last saved horoscope (offline)"
    }
}
