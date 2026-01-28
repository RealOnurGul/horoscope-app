import Foundation
import Combine

/// Handles seeding horoscopes to Firestore
/// Only used in debug builds for demo/testing purposes
final class HoroscopeSeeder: ObservableObject {
    
    // MARK: - Published Properties
    
    @Published var isSeeding = false
    @Published var progress: SeedProgress = .idle
    @Published var lastError: String?
    @Published var seedLog: [String] = []
    
    // MARK: - Dependencies
    
    private let horoscopeRepository: HoroscopeRepository
    private let dateProvider: DateProvider
    private let firebase: FirebaseManager
    
    // MARK: - Init
    
    init(
        horoscopeRepository: HoroscopeRepository? = nil,
        dateProvider: DateProvider? = nil,
        firebase: FirebaseManager? = nil
    ) {
        self.horoscopeRepository = horoscopeRepository ?? HoroscopeRepository()
        self.dateProvider = dateProvider ?? DateProvider.shared
        self.firebase = firebase ?? FirebaseManager.shared
    }
    
    // MARK: - Seeding
    
    /// Seed horoscopes for today
    func seedToday(forceOverwrite: Bool = false) async {
        await seed(dates: [dateProvider.todayString], forceOverwrite: forceOverwrite)
    }
    
    /// Seed horoscopes for the next N days
    func seedNextDays(_ days: Int, forceOverwrite: Bool = false) async {
        var dates: [String] = []
        for i in 0..<days {
            let date = dateProvider.date(daysFromNow: i)
            dates.append(dateProvider.dateString(for: date))
        }
        await seed(dates: dates, forceOverwrite: forceOverwrite)
    }
    
    /// Main seeding function
    @MainActor
    func seed(dates: [String], forceOverwrite: Bool) async {
        guard !isSeeding else { return }
        
        // Check Firebase configuration
        guard firebase.isConfigured else {
            lastError = "Firebase is not configured. Please add GoogleService-Info.plist."
            log("❌ Firebase not configured")
            return
        }
        
        isSeeding = true
        lastError = nil
        seedLog = []
        
        log("🚀 Starting seed for \(dates.count) date(s)")
        log("Force overwrite: \(forceOverwrite)")
        
        // Ensure authenticated
        do {
            _ = try await firebase.ensureAuthenticated()
            log("✅ Authenticated")
        } catch {
            lastError = "Authentication failed: \(error.localizedDescription)"
            log("❌ Auth failed: \(error)")
            isSeeding = false
            return
        }
        
        // Calculate total horoscopes to create
        let totalHoroscopes = dates.count * ZodiacSign.allCases.count * HoroscopeStyle.allCases.count
        var created = 0
        var skipped = 0
        var failed = 0
        
        progress = .seeding(created: 0, total: totalHoroscopes)
        
        // Generate and save horoscopes
        for date in dates {
            log("📅 Processing date: \(date)")
            
            for sign in ZodiacSign.allCases {
                for style in HoroscopeStyle.allCases {
                    let slot = HoroscopeSlot.daily
                    
                    // Generate message from templates
                    let message = HoroscopeTemplates.generateMessage(
                        sign: sign,
                        style: style,
                        date: date
                    )
                    
                    // Create horoscope object
                    let horoscope = Horoscope(
                        id: Horoscope.documentId(date: date, sign: sign, style: style, slot: slot),
                        date: date,
                        sign: sign,
                        style: style,
                        slot: slot,
                        message: message,
                        title: nil,
                        createdAt: nil,
                        version: 1,
                        isActive: true
                    )
                    
                    do {
                        try await horoscopeRepository.saveHoroscope(horoscope, forceOverwrite: forceOverwrite)
                        created += 1
                    } catch HoroscopeRepositoryError.documentAlreadyExists {
                        skipped += 1
                    } catch {
                        failed += 1
                        log("❌ Failed: \(sign.displayName)/\(style.displayName) - \(error)")
                    }
                    
                    progress = .seeding(created: created + skipped, total: totalHoroscopes)
                }
            }
        }
        
        // Done
        let summary = "Created: \(created), Skipped: \(skipped), Failed: \(failed)"
        log("✅ Seed complete! \(summary)")
        progress = .complete(created: created, skipped: skipped, failed: failed)
        isSeeding = false
    }
    
    // MARK: - Helpers
    
    @MainActor
    private func log(_ message: String) {
        let timestamp = DateFormatter.localizedString(from: Date(), dateStyle: .none, timeStyle: .medium)
        seedLog.append("[\(timestamp)] \(message)")
    }
}

// MARK: - Seed Progress

enum SeedProgress: Equatable {
    case idle
    case seeding(created: Int, total: Int)
    case complete(created: Int, skipped: Int, failed: Int)
    
    var displayText: String {
        switch self {
        case .idle:
            return "Ready to seed"
        case .seeding(let created, let total):
            return "Seeding... \(created)/\(total)"
        case .complete(let created, let skipped, let failed):
            return "Done! Created: \(created), Skipped: \(skipped), Failed: \(failed)"
        }
    }
    
    var progressValue: Double? {
        switch self {
        case .seeding(let created, let total):
            return total > 0 ? Double(created) / Double(total) : 0
        default:
            return nil
        }
    }
}
