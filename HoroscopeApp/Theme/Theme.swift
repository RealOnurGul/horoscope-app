import SwiftUI

/// Vela visual identity: colors, corners, shadows.
/// Use these everywhere; avoid hard-coded values in views.
enum Theme {
    
    // MARK: - Colors
    
    enum Colors {
        /// Warm creamy off-white background
        static let background = Color(red: 0.98, green: 0.97, blue: 0.96)
        
        /// Soft charcoal / warm dark gray — primary text
        static let textPrimary = Color(red: 0.24, green: 0.23, blue: 0.21)
        
        /// Secondary text
        static let textSecondary = Color(red: 0.45, green: 0.43, blue: 0.40)
        
        /// Muted lavender / soft indigo — accent
        static let accent = Color(red: 0.55, green: 0.50, blue: 0.65)
        
        /// Accent lighter (for backgrounds, highlights)
        static let accentMuted = Color(red: 0.55, green: 0.50, blue: 0.65).opacity(0.12)
        
        /// Divider / subtle borders
        static let divider = Color(red: 0.85, green: 0.83, blue: 0.80)
        
        /// Card / surface
        static let surface = Color.white.opacity(0.85)
        
        /// Overlay for sheets
        static let overlay = Color.black.opacity(0.15)
    }
    
    // MARK: - Corner Radius
    
    enum Radius {
        static let small: CGFloat = 8
        static let medium: CGFloat = 14
        static let large: CGFloat = 20
        static let card: CGFloat = 20
    }
    
    // MARK: - Shadows
    
    enum Shadow {
        static let subtle = (color: Color.black.opacity(0.06), radius: CGFloat(8), x: CGFloat(0), y: CGFloat(2))
        static let card = (color: Color.black.opacity(0.04), radius: CGFloat(12), x: CGFloat(0), y: CGFloat(4))
    }
    
    // MARK: - Animation
    
    enum Animation {
        static let gentle = SwiftUI.Animation.easeInOut(duration: 0.25)
        static let sheet = SwiftUI.Animation.easeOut(duration: 0.35)
    }
}
