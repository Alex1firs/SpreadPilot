import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

/**
 * Encrypts a string using a master key from environment variables.
 */
export function encrypt(text: string): string {
  const masterKey = process.env.ENCRYPTION_KEY;
  if (!masterKey) throw new Error('ENCRYPTION_KEY is not defined in environment variables.');
  
  // Ensure key is 32 bytes
  const key = crypto.createHash('sha256').update(masterKey).digest();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return `${iv.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts a string using a master key from environment variables.
 */
export function decrypt(encryptedText: string): string {
  const masterKey = process.env.ENCRYPTION_KEY;
  if (!masterKey) throw new Error('ENCRYPTION_KEY is not defined in environment variables.');
  
  const key = crypto.createHash('sha256').update(masterKey).digest();
  const [ivHex, encrypted] = encryptedText.split(':');
  
  if (!ivHex || !encrypted) throw new Error('Invalid encrypted text format.');
  
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
