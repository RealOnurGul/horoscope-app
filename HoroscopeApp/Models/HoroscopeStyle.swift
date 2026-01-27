import Foundation

/// Available horoscope writing styles
/// Easily extendable - just add new cases and update templates
enum HoroscopeStyle: String, CaseIterable, Codable, Identifiable {
    case plain = "PLAIN"
    case funny = "FUNNY"
    case mystic = "MYSTIC"
    
    var id: String { rawValue }
    
    /// Human-readable display name
    var displayName: String {
        switch self {
        case .plain: return "Plain"
        case .funny: return "Funny"
        case .mystic: return "Mystic"
        }
    }
    
    /// Description for onboarding
    var description: String {
        switch self {
        case .plain: return "Clear, straightforward daily guidance"
        case .funny: return "Light-hearted with a touch of humor"
        case .mystic: return "Deep, cosmic wisdom and mystery"
        }
    }
    
    /// Icon for display
    var icon: String {
        switch self {
        case .plain: return "text.alignleft"
        case .funny: return "face.smiling"
        case .mystic: return "sparkles"
        }
    }
    
    /// Emoji representation
    var emoji: String {
        switch self {
        case .plain: return "📝"
        case .funny: return "😄"
        case .mystic: return "🔮"
        }
    }
}
