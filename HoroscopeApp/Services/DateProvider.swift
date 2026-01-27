import Foundation

/// Provides date/time utilities
/// Centralized for consistency and testability
protocol DateProviding {
    var today: Date { get }
    var todayString: String { get }
    func dateString(for date: Date) -> String
    func formatTime(_ date: Date) -> String
    func formatDate(_ date: Date) -> String
}

/// Default implementation using device timezone
final class DateProvider: DateProviding {
    static let shared = DateProvider()
    
    private let calendar: Calendar
    private let horoscopeDateFormatter: DateFormatter
    private let timeFormatter: DateFormatter
    private let dateFormatter: DateFormatter
    
    init(calendar: Calendar = .current) {
        self.calendar = calendar
        
        // Formatter for horoscope document IDs
        self.horoscopeDateFormatter = DateFormatter()
        horoscopeDateFormatter.dateFormat = Constants.DateFormats.horoscopeDate
        horoscopeDateFormatter.timeZone = calendar.timeZone
        
        // Formatter for displaying time
        self.timeFormatter = DateFormatter()
        timeFormatter.dateFormat = Constants.DateFormats.displayTime
        timeFormatter.timeZone = calendar.timeZone
        
        // Formatter for displaying date
        self.dateFormatter = DateFormatter()
        dateFormatter.dateFormat = Constants.DateFormats.displayDate
        dateFormatter.timeZone = calendar.timeZone
    }
    
    /// Current date (start of day in device timezone)
    var today: Date {
        calendar.startOfDay(for: Date())
    }
    
    /// Today's date as string for document IDs
    var todayString: String {
        dateString(for: Date())
    }
    
    /// Convert date to string for document IDs
    func dateString(for date: Date) -> String {
        horoscopeDateFormatter.string(from: date)
    }
    
    /// Format time for display
    func formatTime(_ date: Date) -> String {
        timeFormatter.string(from: date)
    }
    
    /// Format date for display
    func formatDate(_ date: Date) -> String {
        dateFormatter.string(from: date)
    }
    
    /// Get date for tomorrow
    func tomorrow(from date: Date = Date()) -> Date {
        calendar.date(byAdding: .day, value: 1, to: calendar.startOfDay(for: date)) ?? date
    }
    
    /// Get date for N days from now
    func date(daysFromNow days: Int, from date: Date = Date()) -> Date {
        calendar.date(byAdding: .day, value: days, to: calendar.startOfDay(for: date)) ?? date
    }
    
    /// Get next refresh date for widget
    func nextWidgetRefreshDate(from date: Date = Date()) -> Date {
        let tomorrow = tomorrow(from: date)
        var components = calendar.dateComponents([.year, .month, .day], from: tomorrow)
        components.hour = Constants.Widget.dailyRefreshHour
        components.minute = Constants.Widget.dailyRefreshMinute
        return calendar.date(from: components) ?? tomorrow
    }
}
