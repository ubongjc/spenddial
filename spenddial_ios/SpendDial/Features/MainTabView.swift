import SwiftUI

struct MainTabView: View {
    @State private var selectedTab = 0

    var body: some View {
        TabView(selection: $selectedTab) {
            NavigationView {
                DialView()
            }
            .tabItem {
                Label("Dial", systemImage: "gauge")
            }
            .tag(0)

            NavigationView {
                TransactionsView()
            }
            .tabItem {
                Label("Transactions", systemImage: "list.bullet")
            }
            .tag(1)

            NavigationView {
                SettingsView()
            }
            .tabItem {
                Label("Settings", systemImage: "gear")
            }
            .tag(2)
        }
    }
}

struct TransactionsView: View {
    var body: some View {
        List {
            ForEach(0..<10) { index in
                HStack {
                    VStack(alignment: .leading) {
                        Text("Transaction \(index + 1)")
                            .font(.headline)
                        Text("Today")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    Spacer()
                    Text("$\(Double.random(in: 5...100), specifier: "%.2f")")
                        .font(.headline)
                }
            }
        }
        .navigationTitle("Transactions")
    }
}

#Preview {
    MainTabView()
        .environmentObject(AuthenticationManager())
        .environmentObject(NetworkManager())
}
