import Foundation

/// Reads data from App Group storage for the widget
/// This is a simplified version that doesn't require Firebase
struct WidgetStoreReader {
    private let defaults: UserDefaults?
    private let decoder = JSONDecoder()
    
    init() {
        self.defaults = UserDefaults(suiteName: Constants.appGroupId)
    }
    
    // MARK: - Preferences
    
    var preferredSign: ZodiacSign? {
        guard let rawValue = defaults?.string(forKey: Constants.StorageKeys.preferredSign) else {
            return nil
        }
        return ZodiacSign(rawValue: rawValue)
    }
    
    var preferredStyle: HoroscopeStyle? {
        guard let rawValue = defaults?.string(forKey: Constants.StorageKeys.preferredStyle) else {
            return nil
        }
        return HoroscopeStyle(rawValue: rawValue)
    }
    
    var hasCompletedOnboarding: Bool {
        defaults?.bool(forKey: Constants.StorageKeys.hasCompletedOnboarding) ?? false
    }
    
    // MARK: - Cached Horoscope
    
    var cachedHoroscope: CachedHoroscope? {
        guard let data = defaults?.data(forKey: Constants.StorageKeys.cachedHoroscope) else {
            return nil
        }
        return try? decoder.decode(CachedHoroscope.self, from: data)
    }
    
    /// Check if cached horoscope is for today
    func isCacheValidForToday() -> Bool {
        guard let cached = cachedHoroscope else { return false }
        return cached.date == DateProvider.shared.todayString
    }
    
    // MARK: - Create Entry
    
    /// Create a widget entry from current stored data
    func createEntry() -> HoroscopeWidgetEntry {
        // Check if user has set preferences
        guard let sign = preferredSign, let style = preferredStyle else {
            return .noPreferences
        }
        
        // Check for cached horoscope
        if let cached = cachedHoroscope {
            let isToday = cached.date == DateProvider.shared.todayString
            return HoroscopeWidgetEntry(
                date: Date(),
                sign: cached.sign,
                style: cached.style,
                message: cached.message,
                horoscopeDate: cached.date,
                lastUpdated: cached.updatedAt,
                state: isToday ? .normal : .cached
            )
        }
        
        // No cached horoscope
        return .noHoroscope(sign: sign, style: style)
    }
}
