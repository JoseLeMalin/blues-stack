import { randomBytes, timingSafeEqual, scrypt } from "crypto";
import { promisify } from "util";

interface ScryptParams {
  N: number;
  r: number;
  p: number;
}
// const scryptAsync = promisify<password: BinaryLike: any, salt: BinaryLike, keylen: number, callback: (err: Error | null, derivedKey: Buffer) => void>(scrypt);
const scryptAsync = promisify<
  string | Buffer,
  Buffer,
  number,
  ScryptParams,
  Buffer
>(scrypt);

const SALT_LENGTH = 32;
const KEY_LENGTH = 64;
const SCRYPT_PARAMS = {
  N: 16384, // CPU/memory cost parameter
  r: 8, // Block size parameter
  p: 1, // Parallelization parameter
};

export const hashPassword = async (password: string) => {
  try {
    // Generate a random salt
    const salt = randomBytes(SALT_LENGTH);

    // Hash the password with scrypt
    const derivedKey = await scryptAsync(
      password,
      salt,
      KEY_LENGTH,
      SCRYPT_PARAMS,
    );

    // Combine salt and derived key into a single buffer
    const buffer = Buffer.concat([salt, derivedKey]);

    // Return the combined value as a base64 string
    return buffer.toString("base64");
  } catch (error) {
    if (error instanceof Error)
      throw new Error(`Error hashing password: ${error.message}`);
    return String(error);
  }
};

/**
 * Verify a password against a hash
 * @param {string} password - The plain text password to verify
 * @param {string} hashedPassword - The stored hashed password
 * @returns {Promise<boolean>} - True if the password matches, false otherwise
 */
export const verifyPassword = async (
  password: string,
  hashedPassword: string,
) => {
  try {
    // Decode the stored hash from base64
    const buffer = Buffer.from(hashedPassword, "base64");

    // Extract salt and stored derived key
    const salt = buffer.subarray(0, SALT_LENGTH);
    const storedDerivedKey = buffer.subarray(SALT_LENGTH);

    // Hash the input password with the same salt
    const derivedKey = await scryptAsync(
      password,
      salt,
      KEY_LENGTH,
      SCRYPT_PARAMS,
    );

    // Compare the derived key with the stored key using a constant-time comparison
    return timingSafeEqual(storedDerivedKey, derivedKey);
  } catch (error) {
    if (error instanceof Error)
      throw new Error(`Error hashing password: ${error.message}`);
    return String(error);
  }
};

/**
 * Generate a secure random password
 * @param {number} length - The desired length of the password
 * @returns {string} - A random password
 */
export const generateSecurePassword = (length = 16) => {
  // Define character sets for password generation
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";
  let password = "";

  // Generate random bytes
  const randomBytesResult = randomBytes(length);

  // Use random bytes to select characters from charset
  for (let i = 0; i < length; i++) {
    password += charset[randomBytesResult[i] % charset.length];
  }

  return password;
};
