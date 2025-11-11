import CryptoJS from "crypto-js";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "change-this-in-production";

// Encrypt sensitive data before storing in database
export function encrypt(data: string): string {
  try {
    const encrypted = CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
    return encrypted;
  } catch (error) {
    console.error("Encryption error:", error);
    throw new Error("Failed to encrypt data");
  }
}

// Decrypt data when retrieving from database
export function decrypt(encryptedData: string): string {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Failed to decrypt data");
  }
}

// Hash password or sensitive data (one-way)
export function hashPassword(password: string): string {
  return CryptoJS.SHA256(password).toString();
}

// Generate salt for password hashing
export function generateSalt(): string {
  return CryptoJS.lib.WordArray.random(128 / 8).toString();
}

// Hash with salt for better security
export function hashWithSalt(data: string, salt: string): string {
  return CryptoJS.PBKDF2(data, salt, {
    keySize: 256 / 32,
    iterations: 1000,
  }).toString();
}

// Verify hashed data
export function verifyHash(data: string, hash: string, salt: string): boolean {
  const computedHash = hashWithSalt(data, salt);
  return computedHash === hash;
}

// Encrypt Plaid access token for storage
export function encryptAccessToken(accessToken: string): string {
  return encrypt(accessToken);
}

// Decrypt Plaid access token when needed
export function decryptAccessToken(encryptedToken: string): string {
  return decrypt(encryptedToken);
}

// Generate secure API key
export function generateAPIKey(): string {
  const key = CryptoJS.lib.WordArray.random(256 / 8).toString();
  return `sk_${key}`;
}

// Mask sensitive data for logging (show only last 4 characters)
export function maskSensitiveData(data: string, visibleChars: number = 4): string {
  if (data.length <= visibleChars) return "****";
  const masked = "*".repeat(data.length - visibleChars);
  return masked + data.slice(-visibleChars);
}
