import WidgetKit
import SwiftUI

/// Main widget configuration
struct HoroscopeWidget: Widget {
    let kind: String = Constants.Widget.kind
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: HoroscopeWidgetProvider()) { entry in
            HoroscopeWidgetEntryView(entry: entry)
                .containerBackground(.fill.tertiary, for: .widget)
        }
        .configurationDisplayName("Daily Horoscope")
        .description("Your daily horoscope at a glance")
        .supportedFamilies([
            .accessoryCircular,
            .accessoryRectangular,
            .systemSmall,
            .systemMedium
        ])
    }
}

// MARK: - Widget Entry View

struct HoroscopeWidgetEntryView: View {
    @Environment(\.widgetFamily) var family
    let entry: HoroscopeWidgetEntry
    
    var body: some View {
        switch family {
        case .accessoryCircular:
            CircularWidgetView(entry: entry)
        case .accessoryRectangular:
            RectangularWidgetView(entry: entry)
        case .systemSmall:
            SmallWidgetView(entry: entry)
        case .systemMedium:
            MediumWidgetView(entry: entry)
        default:
            SmallWidgetView(entry: entry)
        }
    }
}

// MARK: - Widget Bundle

@main
struct HoroscopeWidgetBundle: WidgetBundle {
    var body: some Widget {
        HoroscopeWidget()
    }
}
