import SwiftUI

/// Main onboarding flow container
struct OnboardingFlow: View {
    @StateObject private var viewModel = OnboardingViewModel()
    let onComplete: () -> Void
    
    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // Progress indicator
                ProgressView(value: Double(viewModel.currentStep.rawValue + 1), total: 3)
                    .tint(.purple)
                    .padding(.horizontal)
                    .padding(.top)
                
                // Content
                TabView(selection: $viewModel.currentStep) {
                    SignSelectionView(viewModel: viewModel)
                        .tag(OnboardingStep.signSelection)
                    
                    StyleSelectionView(viewModel: viewModel)
                        .tag(OnboardingStep.styleSelection)
                    
                    ConfirmationView(viewModel: viewModel)
                        .tag(OnboardingStep.confirmation)
                }
                .tabViewStyle(.page(indexDisplayMode: .never))
                .animation(.easeInOut, value: viewModel.currentStep)
                
                // Navigation buttons
                OnboardingNavigationButtons(viewModel: viewModel)
                    .padding()
            }
            .navigationBarTitleDisplayMode(.inline)
        }
        .onAppear {
            viewModel.onComplete = onComplete
        }
        .alert("Error", isPresented: .constant(viewModel.error != nil)) {
            Button("OK") { viewModel.error = nil }
        } message: {
            Text(viewModel.error ?? "")
        }
    }
}

// MARK: - Navigation Buttons

struct OnboardingNavigationButtons: View {
    @ObservedObject var viewModel: OnboardingViewModel
    
    var body: some View {
        HStack(spacing: 16) {
            // Back button
            if viewModel.currentStep != .signSelection {
                Button {
                    viewModel.goBack()
                } label: {
                    Text("Back")
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.secondary.opacity(0.2))
                        .foregroundColor(.primary)
                        .cornerRadius(12)
                }
            }
            
            // Continue/Finish button
            Button {
                viewModel.proceedToNextStep()
            } label: {
                Group {
                    if viewModel.isLoading {
                        ProgressView()
                            .tint(.white)
                    } else {
                        Text(viewModel.currentStep == .confirmation ? "Get Started" : "Continue")
                    }
                }
                .frame(maxWidth: .infinity)
                .padding()
                .background(viewModel.canProceed ? Color.purple : Color.gray)
                .foregroundColor(.white)
                .cornerRadius(12)
            }
            .disabled(!viewModel.canProceed || viewModel.isLoading)
        }
    }
}

// MARK: - Sign Selection

struct SignSelectionView: View {
    @ObservedObject var viewModel: OnboardingViewModel
    
    private let columns = [
        GridItem(.flexible()),
        GridItem(.flexible()),
        GridItem(.flexible())
    ]
    
    var body: some View {
        VStack(spacing: 24) {
            // Header
            VStack(spacing: 8) {
                Text(OnboardingStep.signSelection.title)
                    .font(.largeTitle.bold())
                
                Text(OnboardingStep.signSelection.subtitle)
                    .font(.body)
                    .foregroundColor(.secondary)
            }
            .padding(.top, 32)
            
            // Grid of signs
            ScrollView {
                LazyVGrid(columns: columns, spacing: 16) {
                    ForEach(ZodiacSign.allCases) { sign in
                        SignCard(
                            sign: sign,
                            isSelected: viewModel.selectedSign == sign
                        ) {
                            viewModel.selectSign(sign)
                        }
                    }
                }
                .padding(.horizontal)
            }
            
            Spacer()
        }
    }
}

struct SignCard: View {
    let sign: ZodiacSign
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            VStack(spacing: 8) {
                Text(sign.emoji)
                    .font(.system(size: 36))
                
                Text(sign.displayName)
                    .font(.caption.bold())
                    .foregroundColor(isSelected ? .white : .primary)
                
                Text(sign.dateRange)
                    .font(.caption2)
                    .foregroundColor(isSelected ? .white.opacity(0.8) : .secondary)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 16)
            .background(isSelected ? Color.purple : Color.secondary.opacity(0.1))
            .cornerRadius(12)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(isSelected ? Color.purple : Color.clear, lineWidth: 2)
            )
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Style Selection

struct StyleSelectionView: View {
    @ObservedObject var viewModel: OnboardingViewModel
    
    var body: some View {
        VStack(spacing: 24) {
            // Header
            VStack(spacing: 8) {
                Text(OnboardingStep.styleSelection.title)
                    .font(.largeTitle.bold())
                
                Text(OnboardingStep.styleSelection.subtitle)
                    .font(.body)
                    .foregroundColor(.secondary)
            }
            .padding(.top, 32)
            
            // Style options
            VStack(spacing: 16) {
                ForEach(HoroscopeStyle.allCases) { style in
                    StyleCard(
                        style: style,
                        isSelected: viewModel.selectedStyle == style
                    ) {
                        viewModel.selectStyle(style)
                    }
                }
            }
            .padding(.horizontal)
            
            Spacer()
        }
    }
}

struct StyleCard: View {
    let style: HoroscopeStyle
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: 16) {
                Text(style.emoji)
                    .font(.system(size: 32))
                
                VStack(alignment: .leading, spacing: 4) {
                    Text(style.displayName)
                        .font(.headline)
                        .foregroundColor(isSelected ? .white : .primary)
                    
                    Text(style.description)
                        .font(.subheadline)
                        .foregroundColor(isSelected ? .white.opacity(0.8) : .secondary)
                }
                
                Spacer()
                
                if isSelected {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundColor(.white)
                        .font(.title2)
                }
            }
            .padding()
            .background(isSelected ? Color.purple : Color.secondary.opacity(0.1))
            .cornerRadius(12)
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Confirmation

struct ConfirmationView: View {
    @ObservedObject var viewModel: OnboardingViewModel
    
    var body: some View {
        VStack(spacing: 32) {
            Spacer()
            
            // Celebration icon
            Text("✨")
                .font(.system(size: 80))
            
            // Header
            VStack(spacing: 8) {
                Text(OnboardingStep.confirmation.title)
                    .font(.largeTitle.bold())
                
                Text(OnboardingStep.confirmation.subtitle)
                    .font(.body)
                    .foregroundColor(.secondary)
            }
            
            // Selected preferences
            if let sign = viewModel.selectedSign, let style = viewModel.selectedStyle {
                VStack(spacing: 16) {
                    ConfirmationRow(
                        icon: sign.emoji,
                        title: "Your Sign",
                        value: sign.displayName
                    )
                    
                    ConfirmationRow(
                        icon: style.emoji,
                        title: "Your Style",
                        value: style.displayName
                    )
                }
                .padding()
                .background(Color.secondary.opacity(0.1))
                .cornerRadius(16)
                .padding(.horizontal)
            }
            
            Spacer()
            Spacer()
        }
    }
}

struct ConfirmationRow: View {
    let icon: String
    let title: String
    let value: String
    
    var body: some View {
        HStack {
            Text(icon)
                .font(.title)
            
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.caption)
                    .foregroundColor(.secondary)
                
                Text(value)
                    .font(.headline)
            }
            
            Spacer()
        }
    }
}

// MARK: - Preview

#Preview {
    OnboardingFlow {
        print("Onboarding complete")
    }
}
