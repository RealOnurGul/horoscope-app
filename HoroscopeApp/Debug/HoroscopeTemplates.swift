import Foundation

/// Template library for generating horoscopes
/// Uses templates with placeholders that get filled with sign-specific traits
enum HoroscopeTemplates {
    
    // MARK: - Sign Traits
    
    /// Traits for each zodiac sign used in template placeholders
    static func traits(for sign: ZodiacSign) -> SignTraits {
        switch sign {
        case .aries:
            return SignTraits(
                primary: "bold",
                secondary: "energetic",
                action: "charge forward",
                strength: "courage",
                element: "fire"
            )
        case .taurus:
            return SignTraits(
                primary: "steady",
                secondary: "reliable",
                action: "build foundations",
                strength: "patience",
                element: "earth"
            )
        case .gemini:
            return SignTraits(
                primary: "curious",
                secondary: "adaptable",
                action: "explore new ideas",
                strength: "communication",
                element: "air"
            )
        case .cancer:
            return SignTraits(
                primary: "nurturing",
                secondary: "intuitive",
                action: "protect what matters",
                strength: "emotional wisdom",
                element: "water"
            )
        case .leo:
            return SignTraits(
                primary: "confident",
                secondary: "generous",
                action: "shine brightly",
                strength: "leadership",
                element: "fire"
            )
        case .virgo:
            return SignTraits(
                primary: "precise",
                secondary: "thoughtful",
                action: "refine your approach",
                strength: "attention to detail",
                element: "earth"
            )
        case .libra:
            return SignTraits(
                primary: "balanced",
                secondary: "diplomatic",
                action: "seek harmony",
                strength: "fairness",
                element: "air"
            )
        case .scorpio:
            return SignTraits(
                primary: "intense",
                secondary: "passionate",
                action: "dive deep",
                strength: "transformation",
                element: "water"
            )
        case .sagittarius:
            return SignTraits(
                primary: "adventurous",
                secondary: "optimistic",
                action: "expand your horizons",
                strength: "vision",
                element: "fire"
            )
        case .capricorn:
            return SignTraits(
                primary: "ambitious",
                secondary: "disciplined",
                action: "climb higher",
                strength: "determination",
                element: "earth"
            )
        case .aquarius:
            return SignTraits(
                primary: "innovative",
                secondary: "independent",
                action: "break new ground",
                strength: "originality",
                element: "air"
            )
        case .pisces:
            return SignTraits(
                primary: "compassionate",
                secondary: "artistic",
                action: "follow your intuition",
                strength: "empathy",
                element: "water"
            )
        }
    }
    
    // MARK: - Templates by Style
    
    /// Get all templates for a given style
    static func templates(for style: HoroscopeStyle) -> [String] {
        switch style {
        case .plain:
            return plainTemplates
        case .funny:
            return funnyTemplates
        case .mystic:
            return mysticTemplates
        }
    }
    
    // MARK: - Plain Templates
    
    private static let plainTemplates: [String] = [
        "Today favors your {primary} nature. Use your {strength} to {action}.",
        "Your {secondary} side shines today. Focus on what matters most.",
        "A good day to {action}. Your {element} energy supports progress.",
        "Trust your {strength} today. Small steps lead to big results.",
        "Your {primary} approach will serve you well. Stay focused.",
        "Time to {action}. Your natural {secondary} qualities guide the way.",
        "Today calls for your {primary} spirit. Embrace opportunities.",
        "Let your {strength} lead today. Good things are unfolding.",
        "A day for {secondary} decisions. Take your time.",
        "Your {element} sign thrives today. {action} with confidence.",
        "Focus on being {primary}. Results will follow naturally.",
        "Today rewards those who {action}. You're ready for this.",
        "Your {secondary} nature is your superpower today. Use it wisely.",
        "A productive day ahead. Channel your {strength} effectively.",
        "The stars support your {primary} energy. Move forward.",
        "Time to embrace your {secondary} side. Good outcomes await.",
        "Today's energy aligns with your need to {action}.",
        "Your {element} nature finds its flow today. Trust the process.",
        "A day to showcase your {strength}. Others will notice.",
        "Being {primary} pays off today. Keep doing what works.",
        "Your {secondary} qualities attract good opportunities.",
        "Focus energy on what you do best: {action}.",
        "Today amplifies your {primary} traits. Use them well.",
        "A steady day for {element} signs. Progress is happening.",
        "Your natural {strength} opens doors today.",
    ]
    
    // MARK: - Funny Templates
    
    private static let funnyTemplates: [String] = [
        "Your {primary} vibe is strong today—maybe too strong? Dial it to 85%.",
        "Time to {action}, but maybe have coffee first. Lots of coffee.",
        "Your {strength} is showing. Try not to be smug about it.",
        "Today's forecast: {primary} with a chance of snacks.",
        "The universe says {action}. Your couch says otherwise. Choose wisely.",
        "Being {secondary} is great and all, but have you tried napping?",
        "Your {element} energy is lit today. Literally. Stay hydrated.",
        "Stars say: {action}. Translation: you've got this, probably.",
        "Today you're extra {primary}. Everyone will either love it or hide.",
        "Your {strength} is on fire! Not literally. That would be bad.",
        "Perfect day to {action}. Or binge-watch TV. The stars won't judge.",
        "Channel your inner {primary}. Just don't be extra about it.",
        "Your {secondary} side wants to come out and play. Let it.",
        "Today's vibe: {primary} energy meets leftover pizza. A winning combo.",
        "The cosmos whisper: '{action}.' Also: 'check your texts.'",
        "Being {secondary} today will either save you or... wait, it'll save you.",
        "Your {element} sign is vibing. Don't overthink it. Seriously.",
        "Today's mission: {action}. Side quest: find matching socks.",
        "Your {strength} is your secret weapon. Keep it only slightly secret.",
        "Feeling extra {primary}? Good. The world needs more of that energy.",
        "The stars align for you to {action}. Mercury is minding its business.",
        "Your {secondary} nature is chef's kiss today. Accept the compliment.",
        "{primary} mode: activated. Snack mode: also activated.",
        "Today you'll {action} like a boss. A slightly caffeinated boss.",
        "Your {element} energy is giving main character vibes today.",
    ]
    
    // MARK: - Mystic Templates
    
    private static let mysticTemplates: [String] = [
        "The celestial tides favor your {primary} essence. {action} under the cosmic light.",
        "Ancient {element} wisdom flows through you today. Your {strength} awakens.",
        "The stars whisper of {secondary} transformations. Listen to the void.",
        "Your soul's {strength} resonates with the universe. Embrace the mystery.",
        "As above, so below—your {primary} nature aligns with cosmic truth.",
        "The {element} spirits guide you to {action}. Trust the unseen path.",
        "In the tapestry of fate, your {secondary} thread shines brightest today.",
        "Ancient energies stir. Your {strength} becomes your sacred compass.",
        "The moon's gaze empowers your {primary} spirit. Magic is near.",
        "Cosmic currents carry you toward destiny. {action} with reverence.",
        "The veil thins for {element} souls today. Secrets reveal themselves.",
        "Your {secondary} essence attracts mystical favor. Be open to signs.",
        "The universe conspires in your favor. Your {strength} is your talisman.",
        "Star-born wisdom guides your {primary} heart. Follow the celestial map.",
        "Deep {element} mysteries unfold. Today you {action} with purpose.",
        "The cosmic web pulses with your {secondary} energy. Feel its rhythm.",
        "Ancient ones recognize your {strength}. Walk your path with power.",
        "Between worlds, your {primary} spirit finds clarity. Trust the vision.",
        "The {element} realm opens its gates. {action} in sacred space.",
        "Mystic forces amplify your {secondary} gifts. Channel them wisely.",
        "The stars have written: today you {action}. So it shall be.",
        "Your {strength} echoes across dimensions. The universe responds.",
        "Cosmic {element} energy swirls around your {primary} soul today.",
        "The oracle speaks of {secondary} revelations. Stay alert to omens.",
        "In the dance of planets, your {strength} finds its true expression.",
    ]
    
    // MARK: - Generate Message
    
    /// Generate a horoscope message for the given parameters
    static func generateMessage(
        sign: ZodiacSign,
        style: HoroscopeStyle,
        date: String
    ) -> String {
        let traits = traits(for: sign)
        let templates = templates(for: style)
        
        // Use date + sign + style to deterministically pick a template
        // This ensures the same message for the same day/sign/style
        let seed = "\(date)_\(sign.rawValue)_\(style.rawValue)"
        let hash = seed.hashValue
        let index = abs(hash) % templates.count
        
        let template = templates[index]
        return fillTemplate(template, with: traits)
    }
    
    /// Fill template placeholders with sign traits
    private static func fillTemplate(_ template: String, with traits: SignTraits) -> String {
        var result = template
        result = result.replacingOccurrences(of: "{primary}", with: traits.primary)
        result = result.replacingOccurrences(of: "{secondary}", with: traits.secondary)
        result = result.replacingOccurrences(of: "{action}", with: traits.action)
        result = result.replacingOccurrences(of: "{strength}", with: traits.strength)
        result = result.replacingOccurrences(of: "{element}", with: traits.element)
        return result
    }
}

// MARK: - Sign Traits

struct SignTraits {
    let primary: String      // Main personality trait
    let secondary: String    // Supporting trait
    let action: String       // What they should do
    let strength: String     // Their superpower
    let element: String      // Fire, Earth, Air, Water
}
