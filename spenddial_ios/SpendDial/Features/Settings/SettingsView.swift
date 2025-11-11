import SwiftUI

struct SettingsView: View {
    @EnvironmentObject var authManager: AuthenticationManager
    @State private var notificationsEnabled = true
    @State private var showDeleteConfirmation = false
    @State private var showExportSheet = false

    var body: some View {
        NavigationView {
            List {
                // Account Section
                Section(header: Text("Account")) {
                    if let email = authManager.userEmail {
                        HStack {
                            Text("Email")
                            Spacer()
                            Text(email)
                                .foregroundColor(.secondary)
                        }
                    }

                    NavigationLink(destination: SubscriptionView()) {
                        HStack {
                            Text("Subscription")
                            Spacer()
                            Text("Free")
                                .foregroundColor(.secondary)
                        }
                    }
                }

                // Privacy & Security Section
                Section(header: Text("Privacy & Security")) {
                    NavigationLink(destination: PasskeyManagementView()) {
                        Label("Manage Passkeys", systemImage: "key")
                    }

                    Button(action: {
                        showExportSheet = true
                    }) {
                        Label("Export My Data", systemImage: "square.and.arrow.up")
                    }

                    Button(action: {
                        showDeleteConfirmation = true
                    }) {
                        Label("Delete My Account", systemImage: "trash")
                            .foregroundColor(.red)
                    }
                }

                // Preferences Section
                Section(header: Text("Preferences")) {
                    Toggle(isOn: $notificationsEnabled) {
                        Label("Push Notifications", systemImage: "bell")
                    }

                    NavigationLink(destination: CategoriesView()) {
                        Label("Categories", systemImage: "tag")
                    }

                    NavigationLink(destination: BillsView()) {
                        Label("Bills & Subscriptions", systemImage: "calendar")
                    }
                }

                // About Section
                Section(header: Text("About")) {
                    HStack {
                        Text("Version")
                        Spacer()
                        Text("1.0.0")
                            .foregroundColor(.secondary)
                    }

                    Link(destination: URL(string: "https://spenddial.com/privacy")!) {
                        Label("Privacy Policy", systemImage: "hand.raised")
                    }

                    Link(destination: URL(string: "https://spenddial.com/terms")!) {
                        Label("Terms of Service", systemImage: "doc.text")
                    }
                }

                // Sign Out Section
                Section {
                    Button(action: {
                        authManager.signOut()
                    }) {
                        HStack {
                            Spacer()
                            Text("Sign Out")
                                .foregroundColor(.red)
                            Spacer()
                        }
                    }
                }
            }
            .navigationTitle("Settings")
            .alert("Delete Account", isPresented: $showDeleteConfirmation) {
                Button("Cancel", role: .cancel) { }
                Button("Delete", role: .destructive) {
                    // Handle account deletion
                }
            } message: {
                Text("Are you sure you want to delete your account? This action cannot be undone.")
            }
            .sheet(isPresented: $showExportSheet) {
                DataExportView()
            }
        }
    }
}

// Placeholder views for navigation
struct SubscriptionView: View {
    var body: some View {
        Text("Subscription Management")
            .navigationTitle("Subscription")
    }
}

struct PasskeyManagementView: View {
    var body: some View {
        Text("Passkey Management")
            .navigationTitle("Passkeys")
    }
}

struct CategoriesView: View {
    var body: some View {
        Text("Categories")
            .navigationTitle("Categories")
    }
}

struct BillsView: View {
    var body: some View {
        Text("Bills & Subscriptions")
            .navigationTitle("Bills")
    }
}

struct DataExportView: View {
    @Environment(\.dismiss) var dismiss

    var body: some View {
        NavigationView {
            VStack(spacing: 20) {
                Image(systemName: "arrow.down.doc")
                    .font(.system(size: 64))
                    .foregroundColor(.blue)

                Text("Export Your Data")
                    .font(.title2)
                    .bold()

                Text("Download a copy of all your SpendDial data in JSON format.")
                    .multilineTextAlignment(.center)
                    .foregroundColor(.secondary)
                    .padding(.horizontal)

                Button(action: {
                    // Handle data export
                    dismiss()
                }) {
                    Text("Download Data")
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.blue)
                        .foregroundColor(.white)
                        .cornerRadius(12)
                }
                .padding(.horizontal)

                Spacer()
            }
            .padding()
            .navigationTitle("Export Data")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Close") {
                        dismiss()
                    }
                }
            }
        }
    }
}

#Preview {
    SettingsView()
        .environmentObject(AuthenticationManager())
}
