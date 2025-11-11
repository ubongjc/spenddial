import SwiftUI

struct SignInView: View {
    @EnvironmentObject var authManager: AuthenticationManager
    @State private var email = ""
    @State private var showMagicLinkSent = false

    var body: some View {
        VStack(spacing: 24) {
            Spacer()

            // App Logo/Title
            VStack(spacing: 8) {
                Text("SpendDial")
                    .font(.system(size: 48, weight: .bold))
                Text("Live dial of discretionary spend left today")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
            }
            .padding(.bottom, 40)

            // Passkey Sign In
            Button(action: {
                authManager.signInWithPasskey(domain: "spenddial.com") { result in
                    switch result {
                    case .success(let token):
                        print("Signed in with token: \(token)")
                    case .failure(let error):
                        print("Sign in failed: \(error)")
                    }
                }
            }) {
                HStack {
                    Image(systemName: "faceid")
                    Text("Sign in with Passkey")
                }
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color.blue)
                .foregroundColor(.white)
                .cornerRadius(12)
            }

            // Divider
            HStack {
                Rectangle()
                    .frame(height: 1)
                    .foregroundColor(.gray.opacity(0.3))
                Text("or")
                    .foregroundColor(.secondary)
                Rectangle()
                    .frame(height: 1)
                    .foregroundColor(.gray.opacity(0.3))
            }
            .padding(.vertical, 8)

            // Magic Link Fallback
            VStack(spacing: 12) {
                TextField("Email", text: $email)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .textContentType(.emailAddress)
                    .autocapitalization(.none)
                    .keyboardType(.emailAddress)

                Button(action: {
                    authManager.signInWithMagicLink(email: email) { result in
                        switch result {
                        case .success:
                            showMagicLinkSent = true
                        case .failure(let error):
                            print("Failed to send magic link: \(error)")
                        }
                    }
                }) {
                    Text("Send Magic Link")
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.gray.opacity(0.2))
                        .foregroundColor(.primary)
                        .cornerRadius(12)
                }
                .disabled(email.isEmpty)
            }

            if showMagicLinkSent {
                Text("Check your email for a magic link to sign in")
                    .font(.caption)
                    .foregroundColor(.green)
            }

            Spacer()

            // Privacy Notice
            Text("By signing in, you agree to our Terms of Service and Privacy Policy")
                .font(.caption)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal)
        }
        .padding(24)
    }
}

#Preview {
    SignInView()
        .environmentObject(AuthenticationManager())
}
