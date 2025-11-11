# SpendDial iOS

Live dial of discretionary spend left today - iOS Application

## Overview

SpendDial iOS is a native iOS application built with SwiftUI that provides a beautiful, haptic-enabled interface for tracking discretionary spending.

## Tech Stack

- **Framework:** SwiftUI
- **Language:** Swift 5.0+
- **Architecture:** MVVM with Combine
- **Security:** CryptoKit for client-side encryption
- **Authentication:** Passkeys (AuthenticationServices)
- **Payments:** StoreKit 2
- **Minimum iOS:** 17.0+

## Features

- Passkey authentication (WebAuthn)
- Real-time spending dial
- Client-side encryption for sensitive data
- Haptic feedback
- Widget support (planned)
- Push notifications

## Getting Started

### Prerequisites

- Xcode 15+
- iOS 17+ device or simulator
- Apple Developer account (for device testing)

### Installation

1. Open the project in Xcode:
```bash
cd spenddial_ios
open SpendDial.xcodeproj
```

2. Configure your development team:
   - Select the SpendDial target
   - Go to "Signing & Capabilities"
   - Select your development team

3. Update the API base URL in `NetworkManager.swift` if needed

4. Build and run the project (⌘R)

## Project Structure

```
SpendDial/
├── App/
│   └── SpendDialApp.swift        # Main app entry point
├── Features/
│   ├── Auth/                     # Authentication flow
│   │   ├── AuthenticationManager.swift
│   │   └── SignInView.swift
│   ├── Dial/                     # Main dial feature
│   │   └── DialView.swift
│   ├── Settings/                 # Settings screen
│   │   └── SettingsView.swift
│   └── MainTabView.swift         # Tab navigation
├── Networking/
│   ├── NetworkManager.swift      # HTTP client
│   └── DialAPIClient.swift       # API client for dial endpoints
├── Crypto/
│   └── CryptoManager.swift       # Client-side encryption
├── Models/
│   └── DialState.swift           # Data models
└── Resources/
    └── Assets.xcassets           # Images and colors
```

## Architecture

The app follows MVVM architecture with the following key components:

- **Views:** SwiftUI views for UI
- **ViewModels:** ObservableObject classes for business logic
- **Managers:** Shared services (Auth, Network, Crypto)
- **Models:** Codable structs for data

## Security Features

### Client-Side Encryption

The app uses AES-GCM encryption for sensitive data:

```swift
let cryptoManager = CryptoManager()
let key = try cryptoManager.generateKey()
let encrypted = try cryptoManager.encrypt(data: sensitiveData, using: key)
```

Keys are stored securely in the iOS Keychain.

### Passkey Authentication

Authentication uses Apple's AuthenticationServices framework for WebAuthn/passkey support:

```swift
authManager.signInWithPasskey(domain: "spenddial.com") { result in
    // Handle authentication result
}
```

## API Integration

The app communicates with the SpendDial backend API. See `NetworkManager.swift` for details.

Base URL: `http://localhost:3000/api` (development)

## Building for Production

1. Update the API base URL to production
2. Configure proper code signing
3. Set up push notification certificates
4. Configure StoreKit for in-app purchases
5. Archive and upload to App Store Connect

## Testing

Run tests in Xcode:
- Unit tests: ⌘U
- UI tests: Included in test target

## Privacy & Data

The app implements:
- Minimal data collection
- Client-side encryption for sensitive data
- Data export functionality
- Account deletion support

## Requirements

- iOS 17.0+
- iPhone or iPad
- Internet connection

## License

Proprietary
