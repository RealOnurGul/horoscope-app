import Foundation
import SwiftUI

/// ViewModel for the home screen
@MainActor
final class HomeViewModel: ObservableObject {
    
    // MARK: - Published Properties
    
    @Published var horoscope: CachedHoroscope?
    @Published var isLoading = false
    @Published var isRefreshing = false
    @Published var error: String?
    @Published var showPreferencesSheet = false
    
    // MARK: - Computed Properties
    
    var sign: ZodiacSign? {
        store.preferredSign
    }
    
    var style: HoroscopeStyle? {
        store.preferredStyle
    }
    
    var displayMessage: String {
        horoscope?.message ?? Constants.Fallback.noHoroscope
    }
    
    var lastUpdatedText: String? {
        guard let horoscope = horoscope else { return nil }
        let timeString = dateProvider.formatTime(horoscope.updatedAt)
        return "Updated \(timeString)"
    }
    
    var todayDateText: String {
        dateProvider.formatDate(Date())
    }
    
    var hasValidHoroscope: Bool {
        horoscope != nil && store.isCacheValidForToday()
    }
    
    // MARK: - Dependencies
    
    private let store: AppGroupStore
    private let horoscopeRepository: HoroscopeRepository
    private let dateProvider: DateProvider
    private let firebase: FirebaseManager
    
    // MARK: - Init
    
    init(
        store: AppGroupStore = .shared,
        horoscopeRepository: HoroscopeRepository = HoroscopeRepository(),
        dateProvider: DateProvider = .shared,
        firebase: FirebaseManager = .shared
    ) {
        self.store = store
        self.horoscopeRepository = horoscopeRepository
        self.dateProvider = dateProvider
        self.firebase = firebase
        
        // Load cached horoscope immediately
        loadCachedHoroscope()
    }
    
    // MARK: - Loading
    
    /// Load cached horoscope from local storage
    func loadCachedHoroscope() {
        horoscope = store.cachedHoroscope
    }
    
    /// Fetch today's horoscope from Firestore
    func fetchHoroscope() async {
        guard let sign = sign, let style = style else {
            error = "Please set your preferences first"
            return
        }
        
        isLoading = horoscope == nil
        error = nil
        
        do {
            if let fetched = try await horoscopeRepository.fetchTodaysHoroscopeWithCache(sign: sign, style: style) {
                horoscope = CachedHoroscope(from: fetched)
            } else {
                // No horoscope found for today
                if horoscope == nil {
                    error = Constants.Fallback.noHoroscope
                }
            }
        } catch {
            print("❌ Failed to fetch horoscope: \(error)")
            // Keep showing cached horoscope if available
            if horoscope == nil {
                self.error = "Unable to fetch horoscope. Please try again."
            }
        }
        
        isLoading = false
    }
    
    /// Pull to refresh
    func refresh() async {
        isRefreshing = true
        await fetchHoroscope()
        isRefreshing = false
    }
    
    /// Called when view appears
    func onAppear() {
        loadCachedHoroscope()
        
        Task {
            // Ensure authenticated
            if firebase.isConfigured {
                try? await firebase.ensureAuthenticated()
            }
            
            // Fetch fresh horoscope if cache is stale or missing
            if !store.isCacheValidForToday() || horoscope == nil {
                await fetchHoroscope()
            }
        }
    }
    
    /// Called after preferences are changed
    func onPreferencesChanged() {
        // Clear old horoscope since preferences changed
        horoscope = nil
        
        Task {
            await fetchHoroscope()
        }
    }
}
