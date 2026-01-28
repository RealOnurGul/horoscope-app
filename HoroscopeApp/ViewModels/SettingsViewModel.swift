import Foundation
import SwiftUI
import Combine

/// ViewModel for settings screen
@MainActor
final class SettingsViewModel: ObservableObject {
    
    // MARK: - Published Properties
    
    @Published var selectedSign: ZodiacSign
    @Published var selectedStyle: HoroscopeStyle
    @Published var tripleMode: Bool
    @Published var isSaving = false
    @Published var showSignPicker = false
    @Published var showStylePicker = false
    
    // MARK: - Callbacks
    
    var onPreferencesChanged: (() -> Void)?
    
    // MARK: - Dependencies
    
    private let store: AppGroupStore
    private let userRepository: UserRepository
    
    // MARK: - Init
    
    init(
        store: AppGroupStore? = nil,
        userRepository: UserRepository? = nil
    ) {
        self.store = store ?? AppGroupStore.shared
        self.userRepository = userRepository ?? UserRepository()
        
        // Load current preferences
        self.selectedSign = self.store.preferredSign ?? .aries
        self.selectedStyle = self.store.preferredStyle ?? .plain
        self.tripleMode = self.store.preferredSlotMode == .triple
    }
    
    // MARK: - Actions
    
    func updateSign(_ sign: ZodiacSign) {
        guard sign != selectedSign else { return }
        selectedSign = sign
        savePreferences()
    }
    
    func updateStyle(_ style: HoroscopeStyle) {
        guard style != selectedStyle else { return }
        selectedStyle = style
        savePreferences()
    }
    
    func toggleTripleMode() {
        tripleMode.toggle()
        savePreferences()
    }
    
    private func savePreferences() {
        isSaving = true
        
        let preferences = UserPreferences(
            preferredSign: selectedSign,
            preferredStyle: selectedStyle,
            preferredSlotMode: tripleMode ? .triple : .daily
        )
        
        Task {
            await userRepository.savePreferencesWithLocalUpdate(preferences)
            store.synchronize()
            isSaving = false
            onPreferencesChanged?()
        }
    }
    
    // MARK: - Display
    
    var signDisplayText: String {
        "\(selectedSign.emoji) \(selectedSign.displayName)"
    }
    
    var styleDisplayText: String {
        "\(selectedStyle.emoji) \(selectedStyle.displayName)"
    }
    
    var tripleModeDescription: String {
        if tripleMode {
            return "Horoscopes update morning, afternoon, and night"
        } else {
            return "Horoscopes update once per day"
        }
    }
}
