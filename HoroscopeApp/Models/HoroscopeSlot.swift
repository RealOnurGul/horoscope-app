import Foundation

/// Time slots for horoscopes
/// Currently only DAILY is implemented, but architecture supports TRIPLE mode
enum HoroscopeSlot: String, CaseIterable, Codable, Identifiable {
    case daily = "DAILY"
    case morning = "MORNING"
    case afternoon = "AFTERNOON"
    case night = "NIGHT"
    
    var id: String { rawValue }
    
    /// Human-readable display name
    var displayName: String {
        switch self {
        case .daily: return "Daily"
        case .morning: return "Morning"
        case .afternoon: return "Afternoon"
        case .night: return "Night"
        }
    }
    
    /// Icon for display
    var icon: String {
        switch self {
        case .daily: return "calendar"
        case .morning: return "sunrise"
        case .afternoon: return "sun.max"
        case .night: return "moon.stars"
        }
    }
    
    /// Determines the current slot based on hour of day
    /// Used when TRIPLE mode is enabled
    static func current(for date: Date = Date()) -> HoroscopeSlot {
        let hour = Calendar.current.component(.hour, from: date)
        
        switch hour {
        case 5..<12:
            return .morning
        case 12..<17:
            return .afternoon
        default:
            return .night
        }
    }
    
    /// Returns slots for the given mode
    static func slots(for mode: SlotMode) -> [HoroscopeSlot] {
        switch mode {
        case .daily:
            return [.daily]
        case .triple:
            return [.morning, .afternoon, .night]
        }
    }
}

/// User preference for how often horoscopes update
enum SlotMode: String, Codable {
    case daily = "DAILY"
    case triple = "TRIPLE"
    
    var displayName: String {
        switch self {
        case .daily: return "Once daily"
        case .triple: return "Three times daily"
        }
    }
}
