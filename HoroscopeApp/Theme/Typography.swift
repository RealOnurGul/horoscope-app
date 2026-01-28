import SwiftUI

/// Vela typography: title, body, caption.
/// Use system fonts only (SF Pro); calm hierarchy, generous spacing.
enum Typography {
    
    // MARK: - Titles
    
    /// Large screen title
    static func title(_ text: String) -> some View {
        Text(text)
            .font(.system(size: 26, weight: .semibold))
            .foregroundColor(Theme.Colors.textPrimary)
    }
    
    /// Section / card title
    static func titleSmall(_ text: String) -> some View {
        Text(text)
            .font(.system(size: 18, weight: .semibold))
            .foregroundColor(Theme.Colors.textPrimary)
    }
    
    // MARK: - Body
    
    /// Main horoscope message — large, readable
    static func message(_ text: String) -> some View {
        Text(text)
            .font(.system(size: 22, weight: .regular))
            .lineSpacing(10)
            .foregroundColor(Theme.Colors.textPrimary)
    }
    
    /// Body copy
    static func body(_ text: String) -> some View {
        Text(text)
            .font(.system(size: 16, weight: .regular))
            .lineSpacing(6)
            .foregroundColor(Theme.Colors.textPrimary)
    }
    
    /// Body secondary
    static func bodySecondary(_ text: String) -> some View {
        Text(text)
            .font(.system(size: 16, weight: .regular))
            .lineSpacing(6)
            .foregroundColor(Theme.Colors.textSecondary)
    }
    
    // MARK: - Caption
    
    static func caption(_ text: String) -> some View {
        Text(text)
            .font(.system(size: 13, weight: .regular))
            .foregroundColor(Theme.Colors.textSecondary)
    }
    
    static func captionSmall(_ text: String) -> some View {
        Text(text)
            .font(.system(size: 11, weight: .regular))
            .foregroundColor(Theme.Colors.textSecondary)
    }
}
