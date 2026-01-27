import WidgetKit
import SwiftUI

/// Timeline provider for the horoscope widget
struct HoroscopeWidgetProvider: TimelineProvider {
    private let storeReader = WidgetStoreReader()
    private let dateProvider = DateProvider.shared
    
    // MARK: - Placeholder
    
    /// Placeholder shown while widget loads or in gallery
    func placeholder(in context: Context) -> HoroscopeWidgetEntry {
        .placeholder
    }
    
    // MARK: - Snapshot
    
    /// Quick snapshot for widget gallery preview
    func getSnapshot(in context: Context, completion: @escaping (HoroscopeWidgetEntry) -> Void) {
        if context.isPreview {
            completion(.snapshot)
        } else {
            completion(storeReader.createEntry())
        }
    }
    
    // MARK: - Timeline
    
    /// Generate timeline of entries
    func getTimeline(in context: Context, completion: @escaping (Timeline<HoroscopeWidgetEntry>) -> Void) {
        // Get current entry from local storage
        let currentEntry = storeReader.createEntry()
        
        // Calculate next refresh time
        let nextRefresh = calculateNextRefreshDate()
        
        // Create timeline with single entry, refresh at next scheduled time
        let timeline = Timeline(
            entries: [currentEntry],
            policy: .after(nextRefresh)
        )
        
        completion(timeline)
    }
    
    // MARK: - Refresh Calculation
    
    /// Calculate when the widget should next refresh
    private func calculateNextRefreshDate() -> Date {
        let calendar = Calendar.current
        let now = Date()
        
        // Get tomorrow at 12:10 AM for daily refresh
        var components = calendar.dateComponents([.year, .month, .day], from: now)
        components.day! += 1
        components.hour = Constants.Widget.dailyRefreshHour
        components.minute = Constants.Widget.dailyRefreshMinute
        
        if let nextRefresh = calendar.date(from: components) {
            return nextRefresh
        }
        
        // Fallback: refresh in 1 hour
        return calendar.date(byAdding: .hour, value: 1, to: now) ?? now
    }
}
