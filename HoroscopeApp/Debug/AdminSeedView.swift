import SwiftUI

/// Admin screen for seeding horoscopes (DEBUG builds only)
struct AdminSeedView: View {
    @StateObject private var seeder = HoroscopeSeeder()
    @State private var forceOverwrite = false
    @State private var daysToSeed = 7
    
    var body: some View {
        NavigationStack {
            List {
                // Status Section
                Section {
                    VStack(alignment: .leading, spacing: 8) {
                        HStack {
                            Circle()
                                .fill(statusColor)
                                .frame(width: 10, height: 10)
                            Text(seeder.progress.displayText)
                                .font(.headline)
                        }
                        
                        if let progress = seeder.progress.progressValue {
                            ProgressView(value: progress)
                                .tint(.purple)
                        }
                        
                        if let error = seeder.lastError {
                            Text(error)
                                .font(.caption)
                                .foregroundColor(.red)
                        }
                    }
                    .padding(.vertical, 4)
                } header: {
                    Text("Status")
                }
                
                // Actions Section
                Section {
                    // Seed today button
                    Button {
                        Task {
                            await seeder.seedToday(forceOverwrite: forceOverwrite)
                        }
                    } label: {
                        Label("Seed Today's Horoscopes", systemImage: "calendar")
                    }
                    .disabled(seeder.isSeeding)
                    
                    // Seed multiple days
                    HStack {
                        Text("Days to seed:")
                        Spacer()
                        Picker("", selection: $daysToSeed) {
                            Text("7").tag(7)
                            Text("14").tag(14)
                            Text("30").tag(30)
                        }
                        .pickerStyle(.segmented)
                        .frame(width: 150)
                    }
                    
                    Button {
                        Task {
                            await seeder.seedNextDays(daysToSeed, forceOverwrite: forceOverwrite)
                        }
                    } label: {
                        Label("Seed Next \(daysToSeed) Days", systemImage: "calendar.badge.plus")
                    }
                    .disabled(seeder.isSeeding)
                    
                    // Force overwrite toggle
                    Toggle("Force Overwrite", isOn: $forceOverwrite)
                } header: {
                    Text("Seed Actions")
                } footer: {
                    Text("Force overwrite will replace existing horoscopes. Use carefully.")
                }
                
                // Info Section
                Section {
                    VStack(alignment: .leading, spacing: 8) {
                        InfoRow(label: "Signs", value: "\(ZodiacSign.allCases.count)")
                        InfoRow(label: "Styles", value: "\(HoroscopeStyle.allCases.count)")
                        InfoRow(label: "Per Day", value: "\(ZodiacSign.allCases.count * HoroscopeStyle.allCases.count)")
                    }
                } header: {
                    Text("Info")
                } footer: {
                    Text("Each day generates \(ZodiacSign.allCases.count) × \(HoroscopeStyle.allCases.count) = \(ZodiacSign.allCases.count * HoroscopeStyle.allCases.count) horoscopes (one per sign/style combination)")
                }
                
                // Log Section
                if !seeder.seedLog.isEmpty {
                    Section {
                        ForEach(seeder.seedLog.reversed(), id: \.self) { entry in
                            Text(entry)
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    } header: {
                        HStack {
                            Text("Log")
                            Spacer()
                            Button("Clear") {
                                seeder.seedLog = []
                            }
                            .font(.caption)
                        }
                    }
                }
            }
            .navigationTitle("Admin")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    if seeder.isSeeding {
                        ProgressView()
                    }
                }
            }
        }
    }
    
    private var statusColor: Color {
        switch seeder.progress {
        case .idle:
            return .gray
        case .seeding:
            return .orange
        case .complete(_, _, let failed):
            return failed > 0 ? .yellow : .green
        }
    }
}

// MARK: - Info Row

struct InfoRow: View {
    let label: String
    let value: String
    
    var body: some View {
        HStack {
            Text(label)
                .foregroundColor(.secondary)
            Spacer()
            Text(value)
                .fontWeight(.medium)
        }
    }
}

// MARK: - Preview

#Preview {
    AdminSeedView()
}
