import SwiftUI

@main
struct SpendDialApp: App {
    @StateObject private var authManager = AuthenticationManager()
    @StateObject private var networkManager = NetworkManager()

    var body: some Scene {
        WindowGroup {
            if authManager.isAuthenticated {
                MainTabView()
                    .environmentObject(authManager)
                    .environmentObject(networkManager)
            } else {
                SignInView()
                    .environmentObject(authManager)
                    .environmentObject(networkManager)
            }
        }
    }
}
