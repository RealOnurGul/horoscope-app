import WidgetKit

/// Entry containing data for the widget to display
struct HoroscopeWidgetEntry: TimelineEntry {
    let date: Date
    let sign: ZodiacSign?
    let style: HoroscopeStyle?
    let message: String
    let horoscopeDate: String?
    let lastUpdated: Date?
    let state: WidgetState
    
    /// Energy rating derived from message hash (1-5)
    var energyRating: Int {
        guard let message = message.isEmpty ? nil : message else {
            return 3
        }
        let hash = abs(message.hashValue)
        return (hash % 5) + 1
    }
    
    /// Display text for sign
    var signDisplayText: String {
        guard let sign = sign else { return "No sign" }
        return "\(sign.emoji) \(sign.displayName)"
    }
    
    /// Display text for style
    var styleDisplayText: String {
        guard let style = style else { return "" }
        return style.displayName
    }
    
    /// Combined header text
    var headerText: String {
        guard let sign = sign, let style = style else {
            return "Horoscope"
        }
        return "\(sign.emoji) \(sign.displayName) · \(style.displayName)"
    }
    
    /// Formatted last updated time
    var lastUpdatedText: String? {
        guard let lastUpdated = lastUpdated else { return nil }
        let formatter = DateFormatter()
        formatter.dateFormat = Constants.DateFormats.widgetTimestamp
        return "Updated \(formatter.string(from: lastUpdated))"
    }
}

// MARK: - Widget State

enum WidgetState {
    case normal           // Has valid horoscope
    case placeholder      // Preview/placeholder state
    case noPreferences    // User hasn't set up preferences
    case noHoroscope      // No horoscope available for today
    case cached           // Showing cached data (possibly stale)
}

// MARK: - Sample Entries

extension HoroscopeWidgetEntry {
    /// Placeholder entry for widget gallery
    static var placeholder: HoroscopeWidgetEntry {
        HoroscopeWidgetEntry(
            date: Date(),
            sign: .leo,
            style: .plain,
            message: "Your cosmic energy is aligned today. Trust your instincts and embrace new opportunities.",
            horoscopeDate: DateProvider.shared.todayString,
            lastUpdated: Date(),
            state: .placeholder
        )
    }
    
    /// Snapshot entry for widget preview
    static var snapshot: HoroscopeWidgetEntry {
        HoroscopeWidgetEntry(
            date: Date(),
            sign: .leo,
            style: .plain,
            message: "Your confident nature shines today. Use your leadership to move forward.",
            horoscopeDate: DateProvider.shared.todayString,
            lastUpdated: Date(),
            state: .normal
        )
    }
    
    /// Entry for when no preferences are set
    static var noPreferences: HoroscopeWidgetEntry {
        HoroscopeWidgetEntry(
            date: Date(),
            sign: nil,
            style: nil,
            message: Constants.Fallback.widgetNoData,
            horoscopeDate: nil,
            lastUpdated: nil,
            state: .noPreferences
        )
    }
    
    /// Entry for when no horoscope is available
    static func noHoroscope(sign: ZodiacSign, style: HoroscopeStyle) -> HoroscopeWidgetEntry {
        HoroscopeWidgetEntry(
            date: Date(),
            sign: sign,
            style: style,
            message: Constants.Fallback.noHoroscope,
            horoscopeDate: nil,
            lastUpdated: nil,
            state: .noHoroscope
        )
    }
}
