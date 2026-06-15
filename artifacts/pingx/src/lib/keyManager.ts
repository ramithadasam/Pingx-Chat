/**
 * Manages the user's ECDH key pair across sessions.
 *
 * Private key  → stored as JWK in localStorage (never sent to server)
 * Public key   → uploaded to server via PATCH /api/users/me so contacts
 *                can encrypt messages to us
 *
 * Shared AES keys are derived on-demand and cached in memory (Map) for
 * the lifetime of the page — they are never persisted anywhere.
 */

import {
  generateKeyPair,
  exportPrivateKeyJwk,
  publicJwkFromPrivateJwk,
  importPrivateKey,
  importPublicKey,
  deriveSharedKey,
} from './crypto';

const STORAGE_KEY = 'pingx_e2e_privkey';

// In-memory cache: conversationId → AES-GCM CryptoKey
const sharedKeyCache = new Map<string, CryptoKey>();

// ---------------------------------------------------------------------------
// Key initialisation  (call once after login / register)
// ---------------------------------------------------------------------------

/**
 * Ensures the user has an ECDH key pair.
 * - If a private key already exists in localStorage, verifies it is valid.
 * - Otherwise generates a fresh pair and stores the private key.
 *
 * Returns the public key JWK string that should be uploaded to the server,
 * or null if the existing key was already valid (server already has it).
 */
export async function initializeKeys(): Promise<string | null> {
  const existing = localStorage.getItem(STORAGE_KEY);

  if (existing) {
    try {
      await importPrivateKey(existing);
      // Key is valid — server already has the public key from a previous session.
      // Return the public key so the caller can re-upload it if needed
      // (e.g. first login on this device after server reset).
      return publicJwkFromPrivateJwk(existing);
    } catch {
      // Stored key is corrupted — fall through to regenerate.
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  const keyPair = await generateKeyPair();
  const privateJwk = await exportPrivateKeyJwk(keyPair.privateKey);
  localStorage.setItem(STORAGE_KEY, privateJwk);

  return publicJwkFromPrivateJwk(privateJwk);
}

// ---------------------------------------------------------------------------
// Key retrieval
// ---------------------------------------------------------------------------

export async function getMyPrivateKey(): Promise<CryptoKey | null> {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    return await importPrivateKey(stored);
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Shared-key derivation + cache
// ---------------------------------------------------------------------------

/**
 * Returns a cached AES-GCM shared key for this conversation, deriving it
 * the first time from our private key and the other user's public key.
 */
export async function getOrDeriveSharedKey(
  conversationId: string,
  myPrivateKey: CryptoKey,
  theirPublicKeyJwk: string,
): Promise<CryptoKey> {
  const cached = sharedKeyCache.get(conversationId);
  if (cached) return cached;

  const theirPublicKey = await importPublicKey(theirPublicKeyJwk);
  const sharedKey = await deriveSharedKey(myPrivateKey, theirPublicKey);
  sharedKeyCache.set(conversationId, sharedKey);
  return sharedKey;
}

// ---------------------------------------------------------------------------
// Cleanup  (call on logout)
// ---------------------------------------------------------------------------

export function clearKeys(): void {
  localStorage.removeItem(STORAGE_KEY);
  sharedKeyCache.clear();
}
