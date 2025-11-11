import Foundation
import AuthenticationServices
import Combine

class AuthenticationManager: NSObject, ObservableObject {
    @Published var isAuthenticated = false
    @Published var authToken: String?
    @Published var userEmail: String?

    private let keychainManager = KeychainManager()
    private let authTokenKey = "com.spenddial.authToken"

    override init() {
        super.init()
        loadAuthToken()
    }

    private func loadAuthToken() {
        do {
            let key = try keychainManager.load(identifier: authTokenKey)
            let tokenData = key.withUnsafeBytes { Data($0) }
            if let token = String(data: tokenData, encoding: .utf8) {
                self.authToken = token
                self.isAuthenticated = true
            }
        } catch {
            self.isAuthenticated = false
        }
    }

    private func saveAuthToken(_ token: String) {
        guard let tokenData = token.data(using: .utf8) else { return }
        let key = SymmetricKey(data: tokenData)
        try? keychainManager.save(key: key, identifier: authTokenKey)
        self.authToken = token
        self.isAuthenticated = true
    }

    func signOut() {
        keychainManager.delete(identifier: authTokenKey)
        authToken = nil
        userEmail = nil
        isAuthenticated = false
    }

    // Passkey authentication using WebAuthn/AuthenticationServices
    func signInWithPasskey(domain: String, completion: @escaping (Result<String, Error>) -> Void) {
        let provider = ASAuthorizationPlatformPublicKeyCredentialProvider(relyingPartyIdentifier: domain)

        // Create a challenge (in production, fetch this from your server)
        let challenge = Data.random(count: 32)

        let request = provider.createCredentialAssertionRequest(challenge: challenge)

        let controller = ASAuthorizationController(authorizationRequests: [request])
        controller.delegate = self
        controller.presentationContextProvider = self
        controller.performRequests()
    }

    // Register a new passkey
    func registerPasskey(domain: String, userName: String, userID: Data, completion: @escaping (Result<String, Error>) -> Void) {
        let provider = ASAuthorizationPlatformPublicKeyCredentialProvider(relyingPartyIdentifier: domain)

        // Create a challenge (in production, fetch this from your server)
        let challenge = Data.random(count: 32)

        let request = provider.createCredentialRegistrationRequest(
            challenge: challenge,
            name: userName,
            userID: userID
        )

        let controller = ASAuthorizationController(authorizationRequests: [request])
        controller.delegate = self
        controller.presentationContextProvider = self
        controller.performRequests()
    }

    // Email/magic link fallback
    func signInWithMagicLink(email: String, completion: @escaping (Result<Void, Error>) -> Void) {
        // In production, call your backend API to send magic link
        userEmail = email
        completion(.success(()))
    }
}

extension AuthenticationManager: ASAuthorizationControllerDelegate {
    func authorizationController(controller: ASAuthorizationController, didCompleteWithAuthorization authorization: ASAuthorization) {
        if let credential = authorization.credential as? ASAuthorizationPlatformPublicKeyCredentialAssertion {
            // Handle successful passkey assertion
            // In production, send credential to your server for verification
            // For now, we'll generate a mock token
            let token = "mock_jwt_token_\(UUID().uuidString)"
            saveAuthToken(token)
        } else if let credential = authorization.credential as? ASAuthorizationPlatformPublicKeyCredentialRegistration {
            // Handle successful passkey registration
            let token = "mock_jwt_token_\(UUID().uuidString)"
            saveAuthToken(token)
        }
    }

    func authorizationController(controller: ASAuthorizationController, didCompleteWithError error: Error) {
        print("Passkey authentication failed: \(error.localizedDescription)")
    }
}

extension AuthenticationManager: ASAuthorizationControllerPresentationContextProviding {
    func presentationAnchor(for controller: ASAuthorizationController) -> ASPresentationAnchor {
        // Return the key window
        return UIApplication.shared.windows.first { $0.isKeyWindow } ?? UIWindow()
    }
}

extension Data {
    static func random(count: Int) -> Data {
        var data = Data(count: count)
        _ = data.withUnsafeMutableBytes { bytes in
            SecRandomCopyBytes(kSecRandomDefault, count, bytes.baseAddress!)
        }
        return data
    }
}
