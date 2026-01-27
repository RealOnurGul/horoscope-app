import Foundation

/// Shared storage between app and widget using App Group UserDefaults
/// All data stored here is accessible by the widget extension
final class AppGroupStore {
    static let shared = AppGroupStore()
    
    private let defaults: UserDefaults
    private let encoder = JSONEncoder()
    private let decoder = JSONDecoder()
    
    init() {
        // Use App Group shared container
        if let groupDefaults = UserDefaults(suiteName: Constants.appGroupId) {
            self.defaults = groupDefaults
        } else {
            // Fallback to standard defaults (widget won't have access)
            print("⚠️ App Group not available, using standard UserDefaults")
            self.defaults = .standard
        }
    }
    
    // MARK: - Onboarding
    
    var hasCompletedOnboarding: Bool {
        get { defaults.bool(forKey: Constants.StorageKeys.hasCompletedOnboarding) }
        set { defaults.set(newValue, forKey: Constants.StorageKeys.hasCompletedOnboarding) }
    }
    
    // MARK: - Preferences
    
    var preferredSign: ZodiacSign? {
        get {
            guard let rawValue = defaults.string(forKey: Constants.StorageKeys.preferredSign) else {
                return nil
            }
            return ZodiacSign(rawValue: rawValue)
        }
        set {
            defaults.set(newValue?.rawValue, forKey: Constants.StorageKeys.preferredSign)
        }
    }
    
    var preferredStyle: HoroscopeStyle? {
        get {
            guard let rawValue = defaults.string(forKey: Constants.StorageKeys.preferredStyle) else {
                return nil
            }
            return HoroscopeStyle(rawValue: rawValue)
        }
        set {
            defaults.set(newValue?.rawValue, forKey: Constants.StorageKeys.preferredStyle)
        }
    }
    
    var preferredSlotMode: SlotMode {
        get {
            guard let rawValue = defaults.string(forKey: Constants.StorageKeys.preferredSlotMode) else {
                return .daily
            }
            return SlotMode(rawValue: rawValue) ?? .daily
        }
        set {
            defaults.set(newValue.rawValue, forKey: Constants.StorageKeys.preferredSlotMode)
        }
    }
    
    // MARK: - Cached Horoscope
    
    var cachedHoroscope: CachedHoroscope? {
        get {
            guard let data = defaults.data(forKey: Constants.StorageKeys.cachedHoroscope) else {
                return nil
            }
            return try? decoder.decode(CachedHoroscope.self, from: data)
        }
        set {
            if let value = newValue {
                let data = try? encoder.encode(value)
                defaults.set(data, forKey: Constants.StorageKeys.cachedHoroscope)
            } else {
                defaults.removeObject(forKey: Constants.StorageKeys.cachedHoroscope)
            }
        }
    }
    
    var lastFetchDate: String? {
        get { defaults.string(forKey: Constants.StorageKeys.lastFetchDate) }
        set { defaults.set(newValue, forKey: Constants.StorageKeys.lastFetchDate) }
    }
    
    // MARK: - Convenience
    
    /// Save preferences and update cached horoscope sign/style
    func savePreferences(sign: ZodiacSign, style: HoroscopeStyle) {
        preferredSign = sign
        preferredStyle = style
        
        // Clear cached horoscope if preferences changed
        if let cached = cachedHoroscope,
           cached.sign != sign || cached.style != style {
            cachedHoroscope = nil
        }
    }
    
    /// Save a horoscope to cache
    func cacheHoroscope(_ horoscope: Horoscope) {
        cachedHoroscope = CachedHoroscope(from: horoscope)
        lastFetchDate = horoscope.date
    }
    
    /// Check if cached horoscope is for today
    func isCacheValidForToday() -> Bool {
        guard let cached = cachedHoroscope else { return false }
        return cached.date == DateProvider.shared.todayString
    }
    
    /// Clear all stored data
    func clearAll() {
        hasCompletedOnboarding = false
        preferredSign = nil
        preferredStyle = nil
        defaults.set(SlotMode.daily.rawValue, forKey: Constants.StorageKeys.preferredSlotMode)
        cachedHoroscope = nil
        lastFetchDate = nil
    }
    
    /// Synchronize changes
    func synchronize() {
        defaults.synchronize()
    }
}
