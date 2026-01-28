import SwiftUI
import FirebaseCore
import Combine

@main
struct HoroscopeApp: App {
    @StateObject private var appState = AppState()
    
    init() {
        FirebaseManager.shared.configure()
    }
    
    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(appState)
        }
    }
}

// MARK: - App State

/// Central app state that determines which flow to show
@MainActor
final class AppState: ObservableObject {
    @Published var hasCompletedOnboarding: Bool
    @Published var showDebugMenu: Bool = false
    
    private let store = AppGroupStore.shared
    
    init() {
        self.hasCompletedOnboarding = store.hasCompletedOnboarding
    }
    
    func completeOnboarding() {
        store.hasCompletedOnboarding = true
        hasCompletedOnboarding = true
    }
    
    func resetOnboarding() {
        store.hasCompletedOnboarding = false
        hasCompletedOnboarding = false
    }
}

// MARK: - Root View

struct RootView: View {
    @EnvironmentObject var appState: AppState
    
    var body: some View {
        Group {
            if appState.hasCompletedOnboarding {
                TodayView()
            } else {
                OnboardingFlow {
                    appState.completeOnboarding()
                }
            }
        }
        .animation(Theme.Animation.gentle, value: appState.hasCompletedOnboarding)
    }
}
