// src/services/encryptionService.ts
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 32;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32; // 256 bits for AES-256

const SECRET_KEY = (() => {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error(
      'ENCRYPTION_KEY environment variable is required. ' +
      'Generate one with: node -e "console.log(crypto.randomBytes(32).toString(\'hex\'))"'
    );
  }
  // Ensure key is exactly 32 bytes
  if (Buffer.from(key, 'hex').length !== KEY_LENGTH) {
    throw new Error(
      `ENCRYPTION_KEY must be exactly ${KEY_LENGTH * 2} hex characters (${KEY_LENGTH} bytes). ` +
      'Generate a new one with: node -e "console.log(crypto.randomBytes(32).toString(\'hex\'))"'
    );
  }
  return Buffer.from(key, 'hex');
})();

export interface EncryptedData {
  encryptedData: string;
  iv: string;
  tag: string;
  salt: string;
}

function deriveKey(password: Buffer, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(password, salt, 100000, KEY_LENGTH, 'sha512');
}

export function encrypt(text: string | null): string | null {
  if (!text || text.trim() === '') return text;

  try {
    const salt = crypto.randomBytes(SALT_LENGTH);
    const iv = crypto.randomBytes(IV_LENGTH);
    const key = deriveKey(SECRET_KEY, salt);
    
    // Use createCipheriv instead of deprecated createCipherGCM
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();

    const result: EncryptedData = {
      encryptedData: encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex'),
      salt: salt.toString('hex')
    };

    return JSON.stringify(result);
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

export function decrypt(encryptedText: string | null): string | null {
  if (!encryptedText || encryptedText.trim() === '') return encryptedText;

  // If it doesn't look like encrypted data (doesn't start with {), return as-is
  // This handles existing unencrypted data gracefully
  if (!encryptedText.startsWith('{')) {
    return encryptedText;
  }

  try {
    const data: EncryptedData = JSON.parse(encryptedText);
    
    const salt = Buffer.from(data.salt, 'hex');
    const iv = Buffer.from(data.iv, 'hex');
    const tag = Buffer.from(data.tag, 'hex');
    const key = deriveKey(SECRET_KEY, salt);
    
    // Use createDecipheriv instead of deprecated createDecipherGCM
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(data.encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    // Return original data if decryption fails (for backward compatibility)
    return encryptedText;
  }
}

// Helper function to check if data is encrypted
export function isEncrypted(text: string | null): boolean {
  if (!text) return false;
  return text.startsWith('{') && text.includes('"encryptedData"');
}