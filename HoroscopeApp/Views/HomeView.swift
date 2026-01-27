import SwiftUI

/// Main home screen showing today's horoscope
struct HomeView: View {
    @StateObject private var viewModel = HomeViewModel()
    
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    // Date header
                    DateHeader(dateText: viewModel.todayDateText)
                    
                    // Sign and style badge
                    if let sign = viewModel.sign, let style = viewModel.style {
                        PreferenceBadge(sign: sign, style: style)
                    }
                    
                    // Horoscope card
                    HoroscopeCard(
                        message: viewModel.displayMessage,
                        lastUpdated: viewModel.lastUpdatedText,
                        isLoading: viewModel.isLoading,
                        hasError: viewModel.error != nil && viewModel.horoscope == nil
                    )
                    .padding(.horizontal)
                    
                    // Change preferences button
                    Button {
                        viewModel.showPreferencesSheet = true
                    } label: {
                        Label("Change Sign or Style", systemImage: "slider.horizontal.3")
                            .font(.subheadline)
                    }
                    .buttonStyle(.bordered)
                    .tint(.purple)
                    
                    Spacer()
                }
                .padding(.top)
            }
            .refreshable {
                await viewModel.refresh()
            }
            .navigationTitle("Today")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        Task {
                            await viewModel.refresh()
                        }
                    } label: {
                        Image(systemName: "arrow.clockwise")
                    }
                    .disabled(viewModel.isLoading || viewModel.isRefreshing)
                }
            }
            .sheet(isPresented: $viewModel.showPreferencesSheet) {
                QuickPreferencesSheet(
                    currentSign: viewModel.sign ?? .aries,
                    currentStyle: viewModel.style ?? .plain,
                    onSave: { _, _ in
                        viewModel.onPreferencesChanged()
                    }
                )
            }
        }
        .onAppear {
            viewModel.onAppear()
        }
    }
}

// MARK: - Date Header

struct DateHeader: View {
    let dateText: String
    
    var body: some View {
        Text(dateText)
            .font(.subheadline)
            .foregroundColor(.secondary)
    }
}

// MARK: - Preference Badge

struct PreferenceBadge: View {
    let sign: ZodiacSign
    let style: HoroscopeStyle
    
    var body: some View {
        HStack(spacing: 8) {
            Text(sign.emoji)
            Text(sign.displayName)
                .fontWeight(.semibold)
            
            Text("·")
                .foregroundColor(.secondary)
            
            Text(style.emoji)
            Text(style.displayName)
        }
        .font(.title3)
    }
}

// MARK: - Horoscope Card

struct HoroscopeCard: View {
    let message: String
    let lastUpdated: String?
    let isLoading: Bool
    let hasError: Bool
    
    var body: some View {
        VStack(spacing: 16) {
            if isLoading {
                ProgressView()
                    .scaleEffect(1.2)
                    .frame(minHeight: 100)
            } else {
                // Message
                Text(message)
                    .font(.title3)
                    .multilineTextAlignment(.center)
                    .lineSpacing(6)
                    .foregroundColor(hasError ? .secondary : .primary)
                
                // Last updated
                if let lastUpdated = lastUpdated {
                    Text(lastUpdated)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
        }
        .padding(24)
        .frame(maxWidth: .infinity)
        .background(
            RoundedRectangle(cornerRadius: 20)
                .fill(Color.purple.opacity(0.1))
        )
        .overlay(
            RoundedRectangle(cornerRadius: 20)
                .stroke(Color.purple.opacity(0.2), lineWidth: 1)
        )
    }
}

// MARK: - Quick Preferences Sheet

struct QuickPreferencesSheet: View {
    @Environment(\.dismiss) private var dismiss
    @State private var selectedSign: ZodiacSign
    @State private var selectedStyle: HoroscopeStyle
    @State private var isSaving = false
    
    private let store = AppGroupStore.shared
    private let userRepository = UserRepository()
    
    let onSave: (ZodiacSign, HoroscopeStyle) -> Void
    
    init(currentSign: ZodiacSign, currentStyle: HoroscopeStyle, onSave: @escaping (ZodiacSign, HoroscopeStyle) -> Void) {
        self._selectedSign = State(initialValue: currentSign)
        self._selectedStyle = State(initialValue: currentStyle)
        self.onSave = onSave
    }
    
    var body: some View {
        NavigationStack {
            Form {
                Section("Zodiac Sign") {
                    Picker("Sign", selection: $selectedSign) {
                        ForEach(ZodiacSign.allCases) { sign in
                            Text("\(sign.emoji) \(sign.displayName)")
                                .tag(sign)
                        }
                    }
                    .pickerStyle(.navigationLink)
                }
                
                Section("Style") {
                    Picker("Style", selection: $selectedStyle) {
                        ForEach(HoroscopeStyle.allCases) { style in
                            Text("\(style.emoji) \(style.displayName)")
                                .tag(style)
                        }
                    }
                    .pickerStyle(.navigationLink)
                }
            }
            .navigationTitle("Preferences")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
                
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        saveAndDismiss()
                    }
                    .disabled(isSaving)
                }
            }
        }
        .presentationDetents([.medium])
    }
    
    private func saveAndDismiss() {
        isSaving = true
        
        Task {
            let preferences = UserPreferences(
                preferredSign: selectedSign,
                preferredStyle: selectedStyle,
                preferredSlotMode: store.preferredSlotMode
            )
            
            await userRepository.savePreferencesWithLocalUpdate(preferences)
            store.synchronize()
            
            onSave(selectedSign, selectedStyle)
            dismiss()
        }
    }
}

// MARK: - Preview

#Preview {
    HomeView()
}
