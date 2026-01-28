import Foundation
import FirebaseFirestore

/// Repository for managing user preferences in Firestore
protocol UserRepositoryProtocol {
    func savePreferences(_ preferences: UserPreferences) async throws
    func fetchPreferences() async throws -> UserPreferences?
}

final class UserRepository: UserRepositoryProtocol {
    private let firebase: FirebaseManager
    private let store: AppGroupStore
    
    init(
        firebase: FirebaseManager? = nil,
        store: AppGroupStore? = nil
    ) {
        self.firebase = firebase ?? FirebaseManager.shared
        self.store = store ?? AppGroupStore.shared
    }
    
    // MARK: - Collection Reference
    
    private var collection: CollectionReference {
        firebase.db.collection(Constants.Firestore.usersCollection)
    }
    
    /// Get document reference for current user
    private func userDocument() throws -> DocumentReference {
        guard let uid = firebase.uid else {
            throw FirebaseError.notAuthenticated
        }
        return collection.document(uid)
    }
    
    // MARK: - Save
    
    /// Save user preferences to Firestore
    /// Also updates local storage immediately
    func savePreferences(_ preferences: UserPreferences) async throws {
        guard firebase.isConfigured else {
            throw FirebaseError.notConfigured
        }
        
        // Ensure user is authenticated
        _ = try await firebase.ensureAuthenticated()
        
        let docRef = try userDocument()
        try await docRef.setData(preferences.toFirestoreData(), merge: true)
    }
    
    /// Save preferences with local storage update
    /// Local update happens immediately, Firestore update is best-effort
    func savePreferencesWithLocalUpdate(_ preferences: UserPreferences) async {
        // Update local storage immediately
        store.savePreferences(sign: preferences.preferredSign, style: preferences.preferredStyle)
        store.preferredSlotMode = preferences.preferredSlotMode
        
        // Try to update Firestore (best effort)
        do {
            try await savePreferences(preferences)
        } catch {
            print("⚠️ Failed to save preferences to Firestore: \(error)")
            // Local storage is already updated, so the app continues to work
        }
    }
    
    // MARK: - Fetch
    
    /// Fetch user preferences from Firestore
    func fetchPreferences() async throws -> UserPreferences? {
        guard firebase.isConfigured else {
            throw FirebaseError.notConfigured
        }
        
        guard firebase.isAuthenticated else {
            return nil
        }
        
        let docRef = try userDocument()
        let snapshot = try await docRef.getDocument()
        
        guard snapshot.exists else {
            return nil
        }
        
        return UserPreferences(document: snapshot)
    }
    
    /// Sync local preferences with Firestore
    /// If Firestore has preferences, update local storage
    /// If not, upload local preferences to Firestore
    func syncPreferences() async {
        do {
            if let remotePrefs = try await fetchPreferences() {
                // Update local storage with remote preferences
                store.preferredSign = remotePrefs.preferredSign
                store.preferredStyle = remotePrefs.preferredStyle
                store.preferredSlotMode = remotePrefs.preferredSlotMode
            } else if let sign = store.preferredSign,
                      let style = store.preferredStyle {
                // Upload local preferences to Firestore
                let prefs = UserPreferences(
                    preferredSign: sign,
                    preferredStyle: style,
                    preferredSlotMode: store.preferredSlotMode
                )
                try await savePreferences(prefs)
            }
        } catch {
            print("⚠️ Failed to sync preferences: \(error)")
        }
    }
}
