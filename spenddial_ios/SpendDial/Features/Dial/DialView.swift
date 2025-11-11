import SwiftUI

struct DialView: View {
    @EnvironmentObject var networkManager: NetworkManager
    @State private var dialState: DialState?
    @State private var isLoading = false
    @State private var errorMessage: String?

    private let apiClient: DialAPIClient

    init() {
        // This will be properly initialized with the environment object
        self.apiClient = DialAPIClient(networkManager: NetworkManager())
    }

    var body: some View {
        VStack(spacing: 24) {
            if isLoading {
                ProgressView("Loading...")
            } else if let error = errorMessage {
                VStack(spacing: 16) {
                    Image(systemName: "exclamationmark.triangle")
                        .font(.system(size: 48))
                        .foregroundColor(.orange)
                    Text(error)
                        .foregroundColor(.secondary)
                    Button("Retry") {
                        Task {
                            await loadDialState()
                        }
                    }
                    .buttonStyle(.borderedProminent)
                }
            } else if let state = dialState {
                dialContent(state: state)
            } else {
                Text("No data available")
                    .foregroundColor(.secondary)
            }
        }
        .padding()
        .navigationTitle("SpendDial")
        .task {
            await loadDialState()
        }
        .refreshable {
            await loadDialState()
        }
    }

    @ViewBuilder
    private func dialContent(state: DialState) -> some View {
        VStack(spacing: 32) {
            // Main Dial Display
            ZStack {
                // Background circle
                Circle()
                    .stroke(
                        Color.gray.opacity(0.2),
                        lineWidth: 20
                    )
                    .frame(width: 250, height: 250)

                // Progress circle
                Circle()
                    .trim(from: 0, to: progressValue(state: state))
                    .stroke(
                        progressColor(state: state),
                        style: StrokeStyle(lineWidth: 20, lineCap: .round)
                    )
                    .frame(width: 250, height: 250)
                    .rotationEffect(.degrees(-90))
                    .animation(.easeInOut, value: progressValue(state: state))

                // Center content
                VStack(spacing: 8) {
                    Text("$\(state.remaining, specifier: "%.2f")")
                        .font(.system(size: 48, weight: .bold))
                    Text("remaining today")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
            }

            // Stats
            HStack(spacing: 20) {
                statCard(title: "Budget", value: "$\(state.todayBudget, specifier: "%.2f")", color: .blue)
                statCard(title: "Spent", value: "$\(state.spent, specifier: "%.2f")", color: .orange)
            }

            // Last updated
            Text("Updated \(timeAgo(from: state.lastCalculated))")
                .font(.caption)
                .foregroundColor(.secondary)

            Spacer()
        }
    }

    @ViewBuilder
    private func statCard(title: String, value: String, color: Color) -> some View {
        VStack(spacing: 8) {
            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
            Text(value)
                .font(.headline)
                .foregroundColor(color)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(color.opacity(0.1))
        .cornerRadius(12)
    }

    private func progressValue(state: DialState) -> Double {
        guard state.todayBudget > 0 else { return 0 }
        return min(max(state.remaining / state.todayBudget, 0), 1)
    }

    private func progressColor(state: DialState) -> Color {
        let progress = progressValue(state: state)
        if progress > 0.5 {
            return .green
        } else if progress > 0.25 {
            return .orange
        } else {
            return .red
        }
    }

    private func timeAgo(from date: Date) -> String {
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .short
        return formatter.localizedString(for: date, relativeTo: Date())
    }

    private func loadDialState() async {
        isLoading = true
        errorMessage = nil

        do {
            let client = DialAPIClient(networkManager: networkManager)
            dialState = try await client.getDialState()
        } catch {
            errorMessage = "Failed to load dial state: \(error.localizedDescription)"
        }

        isLoading = false
    }
}

#Preview {
    NavigationView {
        DialView()
            .environmentObject(NetworkManager())
    }
}
