import SwiftUI

/// Vela onboarding: Welcome → Personal → Delivery → Widget intro
struct OnboardingFlow: View {
    @StateObject private var viewModel = OnboardingViewModel()
    let onComplete: () -> Void
    
    var body: some View {
        ZStack {
            Theme.Colors.background.ignoresSafeArea()
            
            VStack(spacing: 0) {
                progressBar
                
                TabView(selection: $viewModel.currentStep) {
                    WelcomeOnboardingView()
                        .tag(OnboardingStep.welcome)
                    PersonalDetailsOnboardingView(viewModel: viewModel)
                        .tag(OnboardingStep.personalDetails)
                    DeliveryOnboardingView(viewModel: viewModel)
                        .tag(OnboardingStep.delivery)
                    WidgetIntroOnboardingView(viewModel: viewModel)
                        .tag(OnboardingStep.widgetIntro)
                }
                .tabViewStyle(.page(indexDisplayMode: .never))
                .animation(Theme.Animation.gentle, value: viewModel.currentStep)
                
                onboardingNavigationButtons
            }
        }
        .onAppear { viewModel.onComplete = onComplete }
        .alert("Error", isPresented: .constant(viewModel.error != nil)) {
            Button("OK") { viewModel.error = nil }
        } message: {
            Text(viewModel.error ?? "")
        }
    }
    
    private var progressBar: some View {
        ProgressView(value: Double(viewModel.currentStep.rawValue + 1), total: 4)
            .tint(Theme.Colors.accent)
            .padding(.horizontal, Spacing.lg)
            .padding(.top, Spacing.md)
    }
    
    private var onboardingNavigationButtons: some View {
        HStack(spacing: Spacing.md) {
            if viewModel.currentStep != .welcome {
                Button {
                    viewModel.goBack()
                } label: {
                    Text("Back")
                        .font(.system(size: 16, weight: .medium))
                        .foregroundColor(Theme.Colors.textSecondary)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, Spacing.md)
                        .background(Theme.Colors.accentMuted)
                        .cornerRadius(Theme.Radius.medium)
                }
            }
            
            Button {
                viewModel.proceedToNextStep()
            } label: {
                Group {
                    if viewModel.isLoading {
                        ProgressView().tint(.white)
                    } else {
                        Text(buttonTitle)
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundColor(.white)
                    }
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, Spacing.md)
                .background(viewModel.canProceed ? Theme.Colors.accent : Theme.Colors.divider)
                .cornerRadius(Theme.Radius.medium)
            }
            .disabled(!viewModel.canProceed || viewModel.isLoading)
        }
        .padding(.horizontal, Spacing.lg)
        .padding(.vertical, Spacing.md)
    }
    
    private var buttonTitle: String {
        switch viewModel.currentStep {
        case .welcome: return "Continue"
        case .personalDetails: return "Continue"
        case .delivery: return "Continue"
        case .widgetIntro: return "Add to Lock Screen"
        default: return "Continue"
        }
    }
}

// MARK: - Welcome

struct WelcomeOnboardingView: View {
    var body: some View {
        VStack(spacing: Spacing.xl) {
            Spacer()
            VStack(spacing: Spacing.lg) {
                Text(Constants.Vela.appName)
                    .font(.system(size: 32, weight: .semibold))
                    .foregroundColor(Theme.Colors.textPrimary)
                Text("Vela is a personal daily horoscope, delivered when you want it.")
                    .font(.system(size: 17, weight: .regular))
                    .foregroundColor(Theme.Colors.textSecondary)
                    .multilineTextAlignment(.center)
                    .lineSpacing(6)
                    .padding(.horizontal, Spacing.xl)
            }
            Spacer()
            Spacer()
        }
    }
}

// MARK: - Personal details (sign + style)

struct PersonalDetailsOnboardingView: View {
    @ObservedObject var viewModel: OnboardingViewModel
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Spacing.lg) {
                VStack(alignment: .leading, spacing: Spacing.xs) {
                    Text("About you")
                        .font(.system(size: 22, weight: .semibold))
                        .foregroundColor(Theme.Colors.textPrimary)
                    Text("Zodiac sign and tone.")
                        .font(.system(size: 15))
                        .foregroundColor(Theme.Colors.textSecondary)
                }
                .padding(.horizontal, Spacing.lg)
                .padding(.top, Spacing.xl)
                
                signSection
                styleSection
            }
            .padding(.bottom, Spacing.xxl)
        }
    }
    
    private var signSection: some View {
        VStack(alignment: .leading, spacing: Spacing.sm) {
            Text("Zodiac sign")
                .font(.system(size: 13, weight: .medium))
                .foregroundColor(Theme.Colors.textSecondary)
            
            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible()), GridItem(.flexible())], spacing: Spacing.sm) {
                ForEach(ZodiacSign.allCases) { sign in
                    onboardingSignCard(sign: sign)
                }
            }
        }
        .padding(.horizontal, Spacing.lg)
    }
    
    private func onboardingSignCard(sign: ZodiacSign) -> some View {
        let selected = viewModel.selectedSign == sign
        return Button {
            viewModel.selectSign(sign)
        } label: {
            VStack(spacing: Spacing.xxs) {
                Text(sign.emoji).font(.system(size: 28))
                Text(sign.displayName)
                    .font(.system(size: 11, weight: .medium))
                    .foregroundColor(selected ? .white : Theme.Colors.textPrimary)
                    .lineLimit(1)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, Spacing.sm)
            .background(selected ? Theme.Colors.accent : Theme.Colors.accentMuted)
            .cornerRadius(Theme.Radius.medium)
        }
        .buttonStyle(.plain)
    }
    
    private var styleSection: some View {
        VStack(alignment: .leading, spacing: Spacing.sm) {
            Text("Tone")
                .font(.system(size: 13, weight: .medium))
                .foregroundColor(Theme.Colors.textSecondary)
            
            VStack(spacing: Spacing.xs) {
                ForEach(HoroscopeStyle.allCases) { style in
                    onboardingStyleCard(style: style)
                }
            }
        }
        .padding(.horizontal, Spacing.lg)
    }
    
    private func onboardingStyleCard(style: HoroscopeStyle) -> some View {
        let selected = viewModel.selectedStyle == style
        return Button {
            viewModel.selectStyle(style)
        } label: {
            HStack(spacing: Spacing.md) {
                Text(style.emoji).font(.system(size: 24))
                VStack(alignment: .leading, spacing: 2) {
                    Text(style.displayName)
                        .font(.system(size: 16, weight: .medium))
                        .foregroundColor(selected ? .white : Theme.Colors.textPrimary)
                    Text(style.description)
                        .font(.system(size: 12))
                        .foregroundColor(selected ? .white.opacity(0.85) : Theme.Colors.textSecondary)
                }
                Spacer()
                if selected {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundColor(.white)
                        .font(.system(size: 18))
                }
            }
            .padding(Spacing.md)
            .background(selected ? Theme.Colors.accent : Theme.Colors.accentMuted)
            .cornerRadius(Theme.Radius.medium)
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Delivery

struct DeliveryOnboardingView: View {
    @ObservedObject var viewModel: OnboardingViewModel
    
    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.lg) {
            VStack(alignment: .leading, spacing: Spacing.xs) {
                Text("When should your horoscope arrive?")
                    .font(.system(size: 22, weight: .semibold))
                    .foregroundColor(Theme.Colors.textPrimary)
                Text("Choose one or more.")
                    .font(.system(size: 15))
                    .foregroundColor(Theme.Colors.textSecondary)
            }
            .padding(.horizontal, Spacing.lg)
            .padding(.top, Spacing.xxl)
            
            VStack(spacing: Spacing.sm) {
                deliveryCard(
                    title: "Once a day",
                    subtitle: "A single message each day.",
                    selected: !viewModel.deliveryTripleMode
                ) {
                    viewModel.deliveryTripleMode = false
                }
                deliveryCard(
                    title: "Morning, afternoon & night",
                    subtitle: "Three messages throughout the day.",
                    selected: viewModel.deliveryTripleMode
                ) {
                    viewModel.deliveryTripleMode = true
                }
            }
            .padding(.horizontal, Spacing.lg)
            
            Spacer()
        }
    }
    
    private func deliveryCard(title: String, subtitle: String, selected: Bool, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(title)
                        .font(.system(size: 16, weight: .medium))
                        .foregroundColor(selected ? .white : Theme.Colors.textPrimary)
                    Text(subtitle)
                        .font(.system(size: 13))
                        .foregroundColor(selected ? .white.opacity(0.85) : Theme.Colors.textSecondary)
                }
                Spacer()
                if selected {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundColor(.white)
                        .font(.system(size: 20))
                }
            }
            .padding(Spacing.lg)
            .background(selected ? Theme.Colors.accent : Theme.Colors.accentMuted)
            .cornerRadius(Theme.Radius.medium)
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Widget intro

struct WidgetIntroOnboardingView: View {
    @ObservedObject var viewModel: OnboardingViewModel
    
    var body: some View {
        VStack(spacing: Spacing.xl) {
            Spacer()
            VStack(spacing: Spacing.lg) {
                RoundedRectangle(cornerRadius: Theme.Radius.medium)
                    .fill(Theme.Colors.accentMuted)
                    .frame(height: 120)
                    .overlay(
                        VStack(spacing: Spacing.xs) {
                            Image(systemName: "lock.rectangle.stack")
                                .font(.system(size: 36))
                                .foregroundColor(Theme.Colors.accent)
                            Text("Lock screen widget")
                                .font(.system(size: 13, weight: .medium))
                                .foregroundColor(Theme.Colors.textSecondary)
                        }
                    )
                    .padding(.horizontal, Spacing.xl)
                
                Text("Vela lives on your lock screen. The app is here when you want more.")
                    .font(.system(size: 17, weight: .regular))
                    .foregroundColor(Theme.Colors.textSecondary)
                    .multilineTextAlignment(.center)
                    .lineSpacing(6)
                    .padding(.horizontal, Spacing.xl)
                
                Button("Skip for now") {
                    viewModel.proceedToNextStep()
                }
                .font(.system(size: 15, weight: .medium))
                .foregroundColor(Theme.Colors.accent)
            }
            Spacer()
            Spacer()
        }
    }
}

#Preview {
    OnboardingFlow { }
}
