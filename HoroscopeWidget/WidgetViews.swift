import SwiftUI
import WidgetKit

// MARK: - Rectangular Widget View (Lock Screen)

struct RectangularWidgetView: View {
    let entry: HoroscopeWidgetEntry
    
    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            // Header: Sign + Style
            Text(entry.headerText)
                .font(.caption2)
                .fontWeight(.semibold)
                .lineLimit(1)
            
            // Message
            Text(entry.message)
                .font(.caption2)
                .lineLimit(2)
                .opacity(entry.state == .noPreferences ? 0.7 : 1.0)
            
            // Last updated (if space allows)
            if let lastUpdated = entry.lastUpdatedText, entry.state == .normal {
                Text(lastUpdated)
                    .font(.system(size: 8))
                    .opacity(0.6)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

// MARK: - Circular Widget View (Lock Screen)

struct CircularWidgetView: View {
    let entry: HoroscopeWidgetEntry
    
    var body: some View {
        ZStack {
            if let sign = entry.sign {
                VStack(spacing: 2) {
                    // Sign emoji
                    Text(sign.emoji)
                        .font(.system(size: 20))
                    
                    // Energy dots
                    HStack(spacing: 2) {
                        ForEach(1...5, id: \.self) { index in
                            Circle()
                                .fill(index <= entry.energyRating ? Color.primary : Color.primary.opacity(0.3))
                                .frame(width: 4, height: 4)
                        }
                    }
                }
            } else {
                // No preferences set
                Image(systemName: "sparkles")
                    .font(.title2)
            }
        }
    }
}

// MARK: - Small Widget View (Home Screen)

struct SmallWidgetView: View {
    let entry: HoroscopeWidgetEntry
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            // Header
            HStack {
                if let sign = entry.sign {
                    Text(sign.emoji)
                        .font(.title2)
                    Text(sign.displayName)
                        .font(.caption)
                        .fontWeight(.semibold)
                }
                Spacer()
            }
            
            // Message
            Text(entry.message)
                .font(.caption2)
                .lineLimit(4)
                .opacity(entry.state == .noPreferences ? 0.7 : 1.0)
            
            Spacer()
            
            // Footer
            if let lastUpdated = entry.lastUpdatedText {
                Text(lastUpdated)
                    .font(.system(size: 9))
                    .foregroundColor(.secondary)
            } else if let style = entry.style {
                Text(style.displayName)
                    .font(.system(size: 9))
                    .foregroundColor(.secondary)
            }
        }
        .padding()
    }
}

// MARK: - Medium Widget View (Home Screen)

struct MediumWidgetView: View {
    let entry: HoroscopeWidgetEntry
    
    var body: some View {
        HStack(spacing: 16) {
            // Left: Sign info
            VStack(alignment: .center, spacing: 4) {
                if let sign = entry.sign {
                    Text(sign.emoji)
                        .font(.largeTitle)
                    Text(sign.displayName)
                        .font(.caption)
                        .fontWeight(.semibold)
                    
                    // Energy dots
                    HStack(spacing: 3) {
                        ForEach(1...5, id: \.self) { index in
                            Circle()
                                .fill(index <= entry.energyRating ? Color.purple : Color.gray.opacity(0.3))
                                .frame(width: 6, height: 6)
                        }
                    }
                }
            }
            .frame(width: 80)
            
            // Right: Message
            VStack(alignment: .leading, spacing: 4) {
                if let style = entry.style {
                    Text(style.displayName)
                        .font(.caption2)
                        .foregroundColor(.secondary)
                }
                
                Text(entry.message)
                    .font(.caption)
                    .lineLimit(4)
                
                Spacer()
                
                if let lastUpdated = entry.lastUpdatedText {
                    Text(lastUpdated)
                        .font(.system(size: 9))
                        .foregroundColor(.secondary)
                }
            }
        }
        .padding()
    }
}

// MARK: - Preview Helpers

#Preview("Rectangular", as: .accessoryRectangular) {
    HoroscopeWidget()
} timeline: {
    HoroscopeWidgetEntry.snapshot
    HoroscopeWidgetEntry.noPreferences
}

#Preview("Circular", as: .accessoryCircular) {
    HoroscopeWidget()
} timeline: {
    HoroscopeWidgetEntry.snapshot
}

#Preview("Small", as: .systemSmall) {
    HoroscopeWidget()
} timeline: {
    HoroscopeWidgetEntry.snapshot
}

#Preview("Medium", as: .systemMedium) {
    HoroscopeWidget()
} timeline: {
    HoroscopeWidgetEntry.snapshot
}
