import Foundation
import FirebaseCore
import FirebaseAuth
import FirebaseFirestore

/// Manages Firebase configuration and authentication
/// Singleton pattern ensures Firebase is configured once
final class FirebaseManager {
    static let shared = FirebaseManager()
    
    private(set) var isConfigured = false
    private(set) var configurationError: Error?
    
    /// Current authenticated user ID (nil if not signed in)
    var uid: String? {
        Auth.auth().currentUser?.uid
    }
    
    /// Whether user is authenticated
    var isAuthenticated: Bool {
        Auth.auth().currentUser != nil
    }
    
    /// Firestore database reference
    var db: Firestore {
        Firestore.firestore()
    }
    
    private init() {}
    
    // MARK: - Configuration
    
    /// Configure Firebase - call once at app launch
    /// Safe to call multiple times, will only configure once
    func configure() {
        guard !isConfigured else { return }
        
        // Check if GoogleService-Info.plist exists
        guard Bundle.main.path(forResource: "GoogleService-Info", ofType: "plist") != nil else {
            configurationError = FirebaseError.missingConfiguration
            print("⚠️ Firebase: GoogleService-Info.plist not found. Add it to the project.")
            return
        }
        
        do {
            FirebaseApp.configure()
            isConfigured = true
            print("✅ Firebase configured successfully")
        } catch {
            configurationError = error
            print("❌ Firebase configuration failed: \(error)")
        }
    }
    
    // MARK: - Authentication
    
    /// Sign in anonymously - creates or restores anonymous user
    /// Returns the user ID on success
    @discardableResult
    func signInAnonymously() async throws -> String {
        guard isConfigured else {
            throw FirebaseError.notConfigured
        }
        
        // If already signed in, return existing UID
        if let uid = uid {
            return uid
        }
        
        let result = try await Auth.auth().signInAnonymously()
        print("✅ Signed in anonymously: \(result.user.uid)")
        return result.user.uid
    }
    
    /// Ensure user is signed in before performing operations
    func ensureAuthenticated() async throws -> String {
        if let uid = uid {
            return uid
        }
        return try await signInAnonymously()
    }
    
    /// Sign out the current user
    func signOut() throws {
        try Auth.auth().signOut()
    }
}

// MARK: - Errors

enum FirebaseError: LocalizedError {
    case notConfigured
    case missingConfiguration
    case notAuthenticated
    case documentNotFound
    case invalidData
    
    var errorDescription: String? {
        switch self {
        case .notConfigured:
            return "Firebase is not configured. Please add GoogleService-Info.plist."
        case .missingConfiguration:
            return "GoogleService-Info.plist not found in bundle."
        case .notAuthenticated:
            return "User is not authenticated."
        case .documentNotFound:
            return "Document not found in Firestore."
        case .invalidData:
            return "Invalid data received from Firestore."
        }
    }
}
