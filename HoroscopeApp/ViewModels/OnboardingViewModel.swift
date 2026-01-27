import Foundation
import SwiftUI

/// ViewModel for the onboarding flow
@MainActor
final class OnboardingViewModel: ObservableObject {
    
    // MARK: - Published Properties
    
    @Published var currentStep: OnboardingStep = .signSelection
    @Published var selectedSign: ZodiacSign?
    @Published var selectedStyle: HoroscopeStyle?
    @Published var isLoading = false
    @Published var error: String?
    
    // MARK: - Dependencies
    
    private let store: AppGroupStore
    private let userRepository: UserRepository
    private let firebase: FirebaseManager
    
    // MARK: - Callbacks
    
    var onComplete: (() -> Void)?
    
    // MARK: - Init
    
    init(
        store: AppGroupStore = .shared,
        userRepository: UserRepository = UserRepository(),
        firebase: FirebaseManager = .shared
    ) {
        self.store = store
        self.userRepository = userRepository
        self.firebase = firebase
    }
    
    // MARK: - Navigation
    
    var canProceed: Bool {
        switch currentStep {
        case .signSelection:
            return selectedSign != nil
        case .styleSelection:
            return selectedStyle != nil
        case .confirmation:
            return true
        }
    }
    
    func proceedToNextStep() {
        switch currentStep {
        case .signSelection:
            currentStep = .styleSelection
        case .styleSelection:
            currentStep = .confirmation
        case .confirmation:
            completeOnboarding()
        }
    }
    
    func goBack() {
        switch currentStep {
        case .signSelection:
            break // Can't go back from first step
        case .styleSelection:
            currentStep = .signSelection
        case .confirmation:
            currentStep = .styleSelection
        }
    }
    
    // MARK: - Selection
    
    func selectSign(_ sign: ZodiacSign) {
        selectedSign = sign
        // Save immediately to local storage for widget access
        store.preferredSign = sign
    }
    
    func selectStyle(_ style: HoroscopeStyle) {
        selectedStyle = style
        // Save immediately to local storage for widget access
        store.preferredStyle = style
    }
    
    // MARK: - Completion
    
    private func completeOnboarding() {
        guard let sign = selectedSign, let style = selectedStyle else { return }
        
        isLoading = true
        error = nil
        
        Task {
            do {
                // Ensure user is signed in anonymously
                if firebase.isConfigured {
                    _ = try await firebase.signInAnonymously()
                    
                    // Save preferences to Firestore
                    let preferences = UserPreferences(
                        preferredSign: sign,
                        preferredStyle: style,
                        preferredSlotMode: .daily
                    )
                    await userRepository.savePreferencesWithLocalUpdate(preferences)
                }
                
                // Ensure local storage is updated
                store.savePreferences(sign: sign, style: style)
                store.synchronize()
                
                isLoading = false
                onComplete?()
            } catch {
                isLoading = false
                self.error = "Failed to save preferences. Please try again."
                print("❌ Onboarding error: \(error)")
            }
        }
    }
}

// MARK: - Onboarding Steps

enum OnboardingStep: Int, CaseIterable {
    case signSelection = 0
    case styleSelection = 1
    case confirmation = 2
    
    var title: String {
        switch self {
        case .signSelection: return "What's your sign?"
        case .styleSelection: return "Choose your style"
        case .confirmation: return "You're all set!"
        }
    }
    
    var subtitle: String {
        switch self {
        case .signSelection: return "Select your zodiac sign"
        case .styleSelection: return "How would you like your horoscopes?"
        case .confirmation: return "Your daily horoscope awaits"
        }
    }
}
