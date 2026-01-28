import Foundation
import SwiftUI
import Combine

/// ViewModel for the Vela onboarding flow
@MainActor
final class OnboardingViewModel: ObservableObject {
    
    @Published var currentStep: OnboardingStep = .welcome
    @Published var selectedSign: ZodiacSign?
    @Published var selectedStyle: HoroscopeStyle?
    @Published var deliveryTripleMode: Bool = false
    @Published var isLoading = false
    @Published var error: String?
    
    private let store: AppGroupStore
    private let userRepository: UserRepository
    private let firebase: FirebaseManager
    
    var onComplete: (() -> Void)?
    
    init(
        store: AppGroupStore? = nil,
        userRepository: UserRepository? = nil,
        firebase: FirebaseManager? = nil
    ) {
        self.store = store ?? AppGroupStore.shared
        self.userRepository = userRepository ?? UserRepository()
        self.firebase = firebase ?? FirebaseManager.shared
    }
    
    var canProceed: Bool {
        switch currentStep {
        case .welcome, .delivery, .widgetIntro:
            return true
        case .personalDetails:
            return selectedSign != nil && selectedStyle != nil
        }
    }
    
    func proceedToNextStep() {
        switch currentStep {
        case .welcome:
            currentStep = .personalDetails
        case .personalDetails:
            currentStep = .delivery
        case .delivery:
            currentStep = .widgetIntro
        case .widgetIntro:
            completeOnboarding()
        case .signSelection, .styleSelection, .confirmation:
            currentStep = .personalDetails
        }
    }
    
    func goBack() {
        switch currentStep {
        case .welcome:
            break
        case .personalDetails:
            currentStep = .welcome
        case .delivery:
            currentStep = .personalDetails
        case .widgetIntro:
            currentStep = .delivery
        case .signSelection, .styleSelection, .confirmation:
            currentStep = .welcome
        }
    }
    
    func selectSign(_ sign: ZodiacSign) {
        selectedSign = sign
        store.preferredSign = sign
    }
    
    func selectStyle(_ style: HoroscopeStyle) {
        selectedStyle = style
        store.preferredStyle = style
    }
    
    private func completeOnboarding() {
        guard let sign = selectedSign, let style = selectedStyle else { return }
        
        isLoading = true
        error = nil
        
        Task {
            do {
                if firebase.isConfigured {
                    _ = try await firebase.signInAnonymously()
                }
                
                let mode: SlotMode = deliveryTripleMode ? .triple : .daily
                let preferences = UserPreferences(
                    preferredSign: sign,
                    preferredStyle: style,
                    preferredSlotMode: mode
                )
                await userRepository.savePreferencesWithLocalUpdate(preferences)
                store.synchronize()
                
                isLoading = false
                onComplete?()
            } catch {
                isLoading = false
                self.error = "Something went wrong. Please try again."
            }
        }
    }
}

// MARK: - Onboarding Steps

enum OnboardingStep: Int, CaseIterable {
    case welcome = 0
    case personalDetails = 1
    case delivery = 2
    case widgetIntro = 3
    case signSelection = 4
    case styleSelection = 5
    case confirmation = 6
}
