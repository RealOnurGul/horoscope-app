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
                MainTabView()
            } else {
                OnboardingFlow {
                    appState.completeOnboarding()
                }
            }
        }
        .animation(.easeInOut, value: appState.hasCompletedOnboarding)
    }
}

// MARK: - Main Tab View

struct MainTabView: View {
    @EnvironmentObject var appState: AppState
    @State private var selectedTab = 0
    
    var body: some View {
        TabView(selection: $selectedTab) {
            HomeView()
                .tabItem {
                    Label("Today", systemImage: "sparkles")
                }
                .tag(0)
            
            SettingsView(onResetOnboarding: {
                appState.resetOnboarding()
            })
            .tabItem {
                Label("Settings", systemImage: "gear")
            }
            .tag(1)
            
            #if DEBUG
            AdminSeedView()
                .tabItem {
                    Label("Admin", systemImage: "wrench.and.screwdriver")
                }
                .tag(2)
            #endif
        }
    }
}
