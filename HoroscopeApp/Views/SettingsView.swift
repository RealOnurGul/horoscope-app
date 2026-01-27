import SwiftUI

/// Settings screen for managing preferences
struct SettingsView: View {
    @StateObject private var viewModel = SettingsViewModel()
    let onResetOnboarding: () -> Void
    
    var body: some View {
        NavigationStack {
            Form {
                // Preferences Section
                Section {
                    // Sign picker
                    NavigationLink {
                        SignPickerView(selectedSign: $viewModel.selectedSign) { sign in
                            viewModel.updateSign(sign)
                        }
                    } label: {
                        HStack {
                            Text("Zodiac Sign")
                            Spacer()
                            Text(viewModel.signDisplayText)
                                .foregroundColor(.secondary)
                        }
                    }
                    
                    // Style picker
                    NavigationLink {
                        StylePickerView(selectedStyle: $viewModel.selectedStyle) { style in
                            viewModel.updateStyle(style)
                        }
                    } label: {
                        HStack {
                            Text("Style")
                            Spacer()
                            Text(viewModel.styleDisplayText)
                                .foregroundColor(.secondary)
                        }
                    }
                } header: {
                    Text("Horoscope Preferences")
                }
                
                // Update Frequency Section
                Section {
                    Toggle("Three Times Daily", isOn: Binding(
                        get: { viewModel.tripleMode },
                        set: { _ in viewModel.toggleTripleMode() }
                    ))
                } header: {
                    Text("Update Frequency")
                } footer: {
                    Text(viewModel.tripleModeDescription)
                }
                
                // Widget Section
                Section {
                    HStack {
                        Image(systemName: "apps.iphone")
                            .foregroundColor(.purple)
                        Text("Add the Horoscope widget to your Lock Screen for daily updates")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                } header: {
                    Text("Widget")
                }
                
                // About Section
                Section {
                    HStack {
                        Text("Version")
                        Spacer()
                        Text("1.0.0")
                            .foregroundColor(.secondary)
                    }
                } header: {
                    Text("About")
                }
                
                #if DEBUG
                // Debug Section
                Section {
                    Button("Reset Onboarding") {
                        AppGroupStore.shared.clearAll()
                        onResetOnboarding()
                    }
                    .foregroundColor(.red)
                } header: {
                    Text("Debug")
                }
                #endif
            }
            .navigationTitle("Settings")
        }
    }
}

// MARK: - Sign Picker View

struct SignPickerView: View {
    @Binding var selectedSign: ZodiacSign
    @Environment(\.dismiss) private var dismiss
    let onSelect: (ZodiacSign) -> Void
    
    var body: some View {
        List {
            ForEach(ZodiacSign.allCases) { sign in
                Button {
                    selectedSign = sign
                    onSelect(sign)
                    dismiss()
                } label: {
                    HStack {
                        Text(sign.emoji)
                            .font(.title2)
                        
                        VStack(alignment: .leading, spacing: 2) {
                            Text(sign.displayName)
                                .foregroundColor(.primary)
                            Text(sign.dateRange)
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        
                        Spacer()
                        
                        if selectedSign == sign {
                            Image(systemName: "checkmark")
                                .foregroundColor(.purple)
                        }
                    }
                }
            }
        }
        .navigationTitle("Choose Sign")
        .navigationBarTitleDisplayMode(.inline)
    }
}

// MARK: - Style Picker View

struct StylePickerView: View {
    @Binding var selectedStyle: HoroscopeStyle
    @Environment(\.dismiss) private var dismiss
    let onSelect: (HoroscopeStyle) -> Void
    
    var body: some View {
        List {
            ForEach(HoroscopeStyle.allCases) { style in
                Button {
                    selectedStyle = style
                    onSelect(style)
                    dismiss()
                } label: {
                    HStack {
                        Text(style.emoji)
                            .font(.title2)
                        
                        VStack(alignment: .leading, spacing: 2) {
                            Text(style.displayName)
                                .foregroundColor(.primary)
                            Text(style.description)
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        
                        Spacer()
                        
                        if selectedStyle == style {
                            Image(systemName: "checkmark")
                                .foregroundColor(.purple)
                        }
                    }
                }
            }
        }
        .navigationTitle("Choose Style")
        .navigationBarTitleDisplayMode(.inline)
    }
}

// MARK: - Preview

#Preview {
    SettingsView(onResetOnboarding: {})
}
