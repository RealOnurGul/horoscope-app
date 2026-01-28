import SwiftUI

/// Vela Today screen: one focused message, tap to expand.
struct TodayView: View {
    @StateObject private var viewModel = HomeViewModel()
    
    var body: some View {
        ZStack {
            Theme.Colors.background
                .ignoresSafeArea()
            
            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    // Breathing room top
                    Spacer()
                        .frame(height: Spacing.xl)
                    
                    // Main message
                    messageBlock(viewModel: viewModel)
                        .padding(.horizontal, Spacing.lg)
                        .onTapGesture {
                            withAnimation(Theme.Animation.sheet) {
                                viewModel.showExpandedDetails = true
                            }
                        }
                    
                    // Slot label + timestamp
                    VStack(alignment: .leading, spacing: Spacing.xxs) {
                        Typography.caption(viewModel.slotLabel)
                        if let updated = viewModel.lastUpdatedText {
                            Typography.captionSmall(updated)
                        }
                    }
                    .padding(.horizontal, Spacing.lg)
                    .padding(.top, Spacing.lg)
                    
                    Spacer()
                        .frame(height: Spacing.xxl)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
            }
            .refreshable {
                await viewModel.refresh()
            }
        }
        .safeAreaInset(edge: .top, spacing: 0) {
            todayTopBar(viewModel: viewModel)
        }
        .sheet(isPresented: $viewModel.showPreferencesSheet) {
            ProfileSheetView(
                currentSign: viewModel.sign ?? .aries,
                currentStyle: viewModel.style ?? .plain,
                onSave: { _, _ in viewModel.onPreferencesChanged() }
            )
        }
        .sheet(isPresented: $viewModel.showExpandedDetails) {
            ExpandedDetailView(
                message: viewModel.displayMessage,
                slotLabel: viewModel.slotLabel,
                lastUpdated: viewModel.lastUpdatedText,
                onDismiss: { viewModel.showExpandedDetails = false }
            )
        }
        .onAppear {
            viewModel.onAppear()
        }
    }
    
    @ViewBuilder
    private func todayTopBar(viewModel: HomeViewModel) -> some View {
        HStack {
            if let sign = viewModel.sign {
                HStack(spacing: Spacing.xxs) {
                    Text(sign.emoji)
                        .font(.system(size: 16))
                    Typography.caption(sign.displayName)
                }
            }
            Spacer()
            Button {
                viewModel.showPreferencesSheet = true
            } label: {
                Image(systemName: "gearshape")
                    .font(.system(size: 18, weight: .regular))
                    .foregroundColor(Theme.Colors.textSecondary)
            }
        }
        .padding(.horizontal, Spacing.lg)
        .padding(.vertical, Spacing.sm)
        .background(Theme.Colors.background)
    }
    
    @ViewBuilder
    private func messageBlock(viewModel: HomeViewModel) -> some View {
        Group {
            if viewModel.isLoading && viewModel.horoscope == nil {
                ProgressView()
                    .scaleEffect(1.1)
                    .tint(Theme.Colors.accent)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, Spacing.xxl)
            } else {
                Typography.message(viewModel.displayMessage)
                    .multilineTextAlignment(.leading)
                    .opacity(viewModel.error != nil && viewModel.horoscope == nil ? 0.7 : 1)
            }
        }
    }
}

// MARK: - Profile Sheet (replaces QuickPreferencesSheet)

struct ProfileSheetView: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject private var appState: AppState
    @State private var selectedSign: ZodiacSign
    @State private var selectedStyle: HoroscopeStyle
    @State private var tripleMode: Bool
    @State private var isSaving = false
    @State private var showAdmin = false
    
    private let store = AppGroupStore.shared
    private let userRepository = UserRepository()
    
    let onSave: (ZodiacSign, HoroscopeStyle) -> Void
    
    init(currentSign: ZodiacSign, currentStyle: HoroscopeStyle, onSave: @escaping (ZodiacSign, HoroscopeStyle) -> Void) {
        _selectedSign = State(initialValue: currentSign)
        _selectedStyle = State(initialValue: currentStyle)
        _tripleMode = State(initialValue: AppGroupStore.shared.preferredSlotMode == .triple)
        self.onSave = onSave
    }
    
    var body: some View {
        NavigationStack {
            ZStack {
                Theme.Colors.background.ignoresSafeArea()
                Form {
                    Section {
                        Picker("Zodiac sign", selection: $selectedSign) {
                            ForEach(ZodiacSign.allCases) { sign in
                                Text("\(sign.emoji) \(sign.displayName)").tag(sign)
                            }
                        }
                        .pickerStyle(.navigationLink)
                        .listRowBackground(Theme.Colors.surface)
                        
                        Picker("Tone", selection: $selectedStyle) {
                            ForEach(HoroscopeStyle.allCases) { style in
                                Text("\(style.emoji) \(style.displayName)").tag(style)
                            }
                        }
                        .pickerStyle(.navigationLink)
                        .listRowBackground(Theme.Colors.surface)
                    } header: {
                        Text("Profile")
                            .foregroundColor(Theme.Colors.textSecondary)
                    }
                    .listSectionSeparatorTint(Theme.Colors.divider)
                    
                    Section {
                        Toggle("Morning, afternoon & night", isOn: $tripleMode)
                            .listRowBackground(Theme.Colors.surface)
                    } header: {
                        Text("Delivery")
                            .foregroundColor(Theme.Colors.textSecondary)
                    } footer: {
                        Text("Turn off for one message per day.")
                            .foregroundColor(Theme.Colors.textSecondary)
                    }
                    .listSectionSeparatorTint(Theme.Colors.divider)
                    
                    #if DEBUG
                    Section {
                        Button("Admin / Seed horoscopes") {
                            showAdmin = true
                        }
                        .foregroundColor(Theme.Colors.accent)
                        .listRowBackground(Theme.Colors.surface)
                        
                        Button("Reset onboarding") {
                            store.clearAll()
                            appState.resetOnboarding()
                            dismiss()
                        }
                        .foregroundColor(Theme.Colors.textSecondary)
                        .listRowBackground(Theme.Colors.surface)
                    } header: {
                        Text("Debug")
                            .foregroundColor(Theme.Colors.textSecondary)
                    }
                    .listSectionSeparatorTint(Theme.Colors.divider)
                    #endif
                }
                .scrollContentBackground(.hidden)
            }
            .navigationTitle("Profile")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                        .foregroundColor(Theme.Colors.accent)
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") { saveAndDismiss() }
                        .fontWeight(.semibold)
                        .foregroundColor(Theme.Colors.accent)
                        .disabled(isSaving)
                }
            }
            .sheet(isPresented: $showAdmin) {
                AdminSeedView()
            }
        }
        .presentationDetents([.medium, .large])
    }
    
    private func saveAndDismiss() {
        isSaving = true
        Task {
            let mode: SlotMode = tripleMode ? .triple : .daily
            let prefs = UserPreferences(
                preferredSign: selectedSign,
                preferredStyle: selectedStyle,
                preferredSlotMode: mode
            )
            await userRepository.savePreferencesWithLocalUpdate(prefs)
            store.synchronize()
            onSave(selectedSign, selectedStyle)
            dismiss()
        }
    }
}

// MARK: - Expanded Detail (bottom sheet)

struct ExpandedDetailView: View {
    let message: String
    let slotLabel: String
    let lastUpdated: String?
    let onDismiss: () -> Void
    
    var body: some View {
        NavigationStack {
            ZStack {
                Theme.Colors.background.ignoresSafeArea()
                ScrollView {
                    VStack(alignment: .leading, spacing: Spacing.lg) {
                        Typography.caption(slotLabel)
                        Typography.body(message)
                            .padding(.bottom, Spacing.sm)
                        Typography.bodySecondary("Take a moment to let this sit with you.")
                        if let u = lastUpdated {
                            Typography.captionSmall(u)
                                .padding(.top, Spacing.md)
                        }
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(Spacing.lg)
                }
            }
            .navigationTitle("Details")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Done") { onDismiss() }
                        .foregroundColor(Theme.Colors.accent)
                }
            }
        }
    }
}

#Preview {
    TodayView()
}
