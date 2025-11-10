import Foundation
import CryptoKit

enum CryptoError: Error {
    case encryptionFailed
    case decryptionFailed
    case keyGenerationFailed
    case invalidData
}

class CryptoManager {
    private let keychain = KeychainManager()

    // Generate a symmetric key for AES-GCM encryption
    func generateKey() throws -> SymmetricKey {
        return SymmetricKey(size: .bits256)
    }

    // Encrypt data using AES-GCM
    func encrypt(data: Data, using key: SymmetricKey) throws -> Data {
        do {
            let sealedBox = try AES.GCM.seal(data, using: key)

            guard let combined = sealedBox.combined else {
                throw CryptoError.encryptionFailed
            }

            return combined
        } catch {
            throw CryptoError.encryptionFailed
        }
    }

    // Decrypt data using AES-GCM
    func decrypt(data: Data, using key: SymmetricKey) throws -> Data {
        do {
            let sealedBox = try AES.GCM.SealedBox(combined: data)
            let decryptedData = try AES.GCM.open(sealedBox, using: key)
            return decryptedData
        } catch {
            throw CryptoError.decryptionFailed
        }
    }

    // Encrypt a file before uploading to server
    func encryptFile(at url: URL, using key: SymmetricKey) throws -> Data {
        guard let fileData = try? Data(contentsOf: url) else {
            throw CryptoError.invalidData
        }

        return try encrypt(data: fileData, using: key)
    }

    // Decrypt a file after downloading from server
    func decryptFile(data: Data, using key: SymmetricKey, saveTo url: URL) throws {
        let decryptedData = try decrypt(data: data, using: key)
        try decryptedData.write(to: url)
    }

    // Generate a secure random nonce
    func generateNonce() -> Data {
        var nonce = Data(count: 12) // 96 bits
        _ = nonce.withUnsafeMutableBytes { bytes in
            SecRandomCopyBytes(kSecRandomDefault, 12, bytes.baseAddress!)
        }
        return nonce
    }

    // Hash data using SHA-256
    func hash(data: Data) -> String {
        let hashed = SHA256.hash(data: data)
        return hashed.compactMap { String(format: "%02x", $0) }.joined()
    }
}

// Keychain manager for secure storage of encryption keys
class KeychainManager {
    func save(key: SymmetricKey, identifier: String) throws {
        let keyData = key.withUnsafeBytes { Data($0) }

        let query: [String: Any] = [
            kSecClass as String: kSecClassKey,
            kSecAttrApplicationTag as String: identifier.data(using: .utf8)!,
            kSecValueData as String: keyData,
            kSecAttrAccessible as String: kSecAttrAccessibleWhenUnlockedThisDeviceOnly
        ]

        SecItemDelete(query as CFDictionary)

        let status = SecItemAdd(query as CFDictionary, nil)

        guard status == errSecSuccess else {
            throw CryptoError.keyGenerationFailed
        }
    }

    func load(identifier: String) throws -> SymmetricKey {
        let query: [String: Any] = [
            kSecClass as String: kSecClassKey,
            kSecAttrApplicationTag as String: identifier.data(using: .utf8)!,
            kSecReturnData as String: true
        ]

        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)

        guard status == errSecSuccess,
              let keyData = result as? Data else {
            throw CryptoError.keyGenerationFailed
        }

        return SymmetricKey(data: keyData)
    }

    func delete(identifier: String) {
        let query: [String: Any] = [
            kSecClass as String: kSecClassKey,
            kSecAttrApplicationTag as String: identifier.data(using: .utf8)!
        ]

        SecItemDelete(query as CFDictionary)
    }
}
