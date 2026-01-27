import Foundation

/// All 12 zodiac signs with their properties
enum ZodiacSign: String, CaseIterable, Codable, Identifiable {
    case aries = "ARIES"
    case taurus = "TAURUS"
    case gemini = "GEMINI"
    case cancer = "CANCER"
    case leo = "LEO"
    case virgo = "VIRGO"
    case libra = "LIBRA"
    case scorpio = "SCORPIO"
    case sagittarius = "SAGITTARIUS"
    case capricorn = "CAPRICORN"
    case aquarius = "AQUARIUS"
    case pisces = "PISCES"
    
    var id: String { rawValue }
    
    /// Human-readable display name
    var displayName: String {
        switch self {
        case .aries: return "Aries"
        case .taurus: return "Taurus"
        case .gemini: return "Gemini"
        case .cancer: return "Cancer"
        case .leo: return "Leo"
        case .virgo: return "Virgo"
        case .libra: return "Libra"
        case .scorpio: return "Scorpio"
        case .sagittarius: return "Sagittarius"
        case .capricorn: return "Capricorn"
        case .aquarius: return "Aquarius"
        case .pisces: return "Pisces"
        }
    }
    
    /// Emoji representation
    var emoji: String {
        switch self {
        case .aries: return "♈️"
        case .taurus: return "♉️"
        case .gemini: return "♊️"
        case .cancer: return "♋️"
        case .leo: return "♌️"
        case .virgo: return "♍️"
        case .libra: return "♎️"
        case .scorpio: return "♏️"
        case .sagittarius: return "♐️"
        case .capricorn: return "♑️"
        case .aquarius: return "♒️"
        case .pisces: return "♓️"
        }
    }
    
    /// Date range string for display
    var dateRange: String {
        switch self {
        case .aries: return "Mar 21 - Apr 19"
        case .taurus: return "Apr 20 - May 20"
        case .gemini: return "May 21 - Jun 20"
        case .cancer: return "Jun 21 - Jul 22"
        case .leo: return "Jul 23 - Aug 22"
        case .virgo: return "Aug 23 - Sep 22"
        case .libra: return "Sep 23 - Oct 22"
        case .scorpio: return "Oct 23 - Nov 21"
        case .sagittarius: return "Nov 22 - Dec 21"
        case .capricorn: return "Dec 22 - Jan 19"
        case .aquarius: return "Jan 20 - Feb 18"
        case .pisces: return "Feb 19 - Mar 20"
        }
    }
    
    /// Element (Fire, Earth, Air, Water)
    var element: String {
        switch self {
        case .aries, .leo, .sagittarius: return "Fire"
        case .taurus, .virgo, .capricorn: return "Earth"
        case .gemini, .libra, .aquarius: return "Air"
        case .cancer, .scorpio, .pisces: return "Water"
        }
    }
    
    /// Primary personality traits used in horoscope generation
    var traits: [String] {
        switch self {
        case .aries: return ["bold", "energetic", "pioneering", "confident", "passionate"]
        case .taurus: return ["steady", "reliable", "patient", "practical", "devoted"]
        case .gemini: return ["curious", "adaptable", "witty", "communicative", "versatile"]
        case .cancer: return ["nurturing", "intuitive", "protective", "emotional", "loyal"]
        case .leo: return ["confident", "dramatic", "generous", "warm-hearted", "creative"]
        case .virgo: return ["precise", "analytical", "helpful", "observant", "thoughtful"]
        case .libra: return ["balanced", "diplomatic", "graceful", "harmonious", "fair-minded"]
        case .scorpio: return ["intense", "passionate", "resourceful", "determined", "mysterious"]
        case .sagittarius: return ["adventurous", "optimistic", "honest", "philosophical", "freedom-loving"]
        case .capricorn: return ["ambitious", "disciplined", "responsible", "patient", "strategic"]
        case .aquarius: return ["innovative", "independent", "humanitarian", "original", "visionary"]
        case .pisces: return ["compassionate", "artistic", "intuitive", "gentle", "wise"]
        }
    }
    
    /// Primary trait for templates
    var primaryTrait: String {
        traits.first ?? "unique"
    }
}
