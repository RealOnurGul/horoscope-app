import Foundation
import FirebaseFirestore

/// Repository for fetching and saving horoscopes
/// Handles both Firestore operations and local caching
protocol HoroscopeRepositoryProtocol {
    func fetchHoroscope(date: String, sign: ZodiacSign, style: HoroscopeStyle, slot: HoroscopeSlot) async throws -> Horoscope?
    func fetchTodaysHoroscope(sign: ZodiacSign, style: HoroscopeStyle) async throws -> Horoscope?
    func saveHoroscope(_ horoscope: Horoscope, forceOverwrite: Bool) async throws
    func horoscopeExists(date: String, sign: ZodiacSign, style: HoroscopeStyle, slot: HoroscopeSlot) async throws -> Bool
}

final class HoroscopeRepository: HoroscopeRepositoryProtocol {
    private let firebase: FirebaseManager
    private let store: AppGroupStore
    private let dateProvider: DateProvider
    
    init(
        firebase: FirebaseManager? = nil,
        store: AppGroupStore? = nil,
        dateProvider: DateProvider? = nil
    ) {
        self.firebase = firebase ?? FirebaseManager.shared
        self.store = store ?? AppGroupStore.shared
        self.dateProvider = dateProvider ?? DateProvider.shared
    }
    
    // MARK: - Collection Reference
    
    private var collection: CollectionReference {
        firebase.db.collection(Constants.Firestore.horoscopesCollection)
    }
    
    // MARK: - Fetch
    
    /// Fetch a specific horoscope by its components
    func fetchHoroscope(
        date: String,
        sign: ZodiacSign,
        style: HoroscopeStyle,
        slot: HoroscopeSlot
    ) async throws -> Horoscope? {
        guard firebase.isConfigured else {
            throw FirebaseError.notConfigured
        }
        
        let docId = Horoscope.documentId(date: date, sign: sign, style: style, slot: slot)
        let snapshot = try await collection.document(docId).getDocument()
        
        guard snapshot.exists else {
            return nil
        }
        
        return Horoscope(document: snapshot)
    }
    
    /// Fetch today's horoscope for the user's preferences
    func fetchTodaysHoroscope(sign: ZodiacSign, style: HoroscopeStyle) async throws -> Horoscope? {
        let today = dateProvider.todayString
        let slot: HoroscopeSlot = store.preferredSlotMode == .triple
            ? HoroscopeSlot.current()
            : .daily
        
        return try await fetchHoroscope(date: today, sign: sign, style: style, slot: slot)
    }
    
    /// Fetch today's horoscope with caching
    /// Returns cached version immediately if valid, then fetches fresh data
    func fetchTodaysHoroscopeWithCache(sign: ZodiacSign, style: HoroscopeStyle) async throws -> Horoscope? {
        // Try to fetch from Firestore
        let horoscope = try await fetchTodaysHoroscope(sign: sign, style: style)
        
        // Cache if found
        if let horoscope = horoscope {
            store.cacheHoroscope(horoscope)
        }
        
        return horoscope
    }
    
    // MARK: - Save (for seeding)
    
    /// Save a horoscope to Firestore
    func saveHoroscope(_ horoscope: Horoscope, forceOverwrite: Bool = false) async throws {
        guard firebase.isConfigured else {
            throw FirebaseError.notConfigured
        }
        
        let docRef = collection.document(horoscope.documentId)
        
        if !forceOverwrite {
            // Check if document already exists
            let snapshot = try await docRef.getDocument()
            if snapshot.exists {
                throw HoroscopeRepositoryError.documentAlreadyExists
            }
        }
        
        try await docRef.setData(horoscope.toFirestoreData())
    }
    
    /// Check if a horoscope document exists
    func horoscopeExists(
        date: String,
        sign: ZodiacSign,
        style: HoroscopeStyle,
        slot: HoroscopeSlot
    ) async throws -> Bool {
        guard firebase.isConfigured else {
            throw FirebaseError.notConfigured
        }
        
        let docId = Horoscope.documentId(date: date, sign: sign, style: style, slot: slot)
        let snapshot = try await collection.document(docId).getDocument()
        return snapshot.exists
    }
    
    // MARK: - Batch Operations (for seeding)
    
    /// Save multiple horoscopes in a batch
    func saveHoroscopes(_ horoscopes: [Horoscope], forceOverwrite: Bool = false) async throws -> Int {
        guard firebase.isConfigured else {
            throw FirebaseError.notConfigured
        }
        
        var savedCount = 0
        let batch = firebase.db.batch()
        
        for horoscope in horoscopes {
            let docRef = collection.document(horoscope.documentId)
            
            if !forceOverwrite {
                // Check existence one by one (batch doesn't support conditional writes)
                let snapshot = try await docRef.getDocument()
                if snapshot.exists {
                    continue
                }
            }
            
            batch.setData(horoscope.toFirestoreData(), forDocument: docRef)
            savedCount += 1
        }
        
        if savedCount > 0 {
            try await batch.commit()
        }
        
        return savedCount
    }
}

// MARK: - Errors

enum HoroscopeRepositoryError: LocalizedError {
    case documentAlreadyExists
    case batchWriteFailed
    
    var errorDescription: String? {
        switch self {
        case .documentAlreadyExists:
            return "Horoscope already exists for this date, sign, and style."
        case .batchWriteFailed:
            return "Failed to save horoscopes batch."
        }
    }
}
