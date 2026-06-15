/**
 * End-to-end encryption helpers using the native WebCrypto API.
 *
 * Key exchange:  ECDH P-256
 * Symmetric enc: AES-GCM 256-bit
 * Wire format:   "E2E:<base64-iv>:<base64-ciphertext>"
 *
 * The server never sees plaintext — it only stores and relays the
 * "E2E:…" ciphertext strings.
 */

const ALGO_ECDH = { name: 'ECDH', namedCurve: 'P-256' } as const;
const ALGO_AES  = { name: 'AES-GCM', length: 256 }      as const;
const E2E_PREFIX = 'E2E:';

// ---------------------------------------------------------------------------
// Key generation & serialisation
// ---------------------------------------------------------------------------

export async function generateKeyPair(): Promise<CryptoKeyPair> {
  return crypto.subtle.generateKey(ALGO_ECDH, true, ['deriveKey']);
}

/** Export the private key as a JWK JSON string for localStorage. */
export async function exportPrivateKeyJwk(key: CryptoKey): Promise<string> {
  const jwk = await crypto.subtle.exportKey('jwk', key);
  return JSON.stringify(jwk);
}

/**
 * Derive the public-key JWK from a private-key JWK by stripping the
 * private scalar `d` — avoids having to store two keys.
 */
export function publicJwkFromPrivateJwk(privateJwkStr: string): string {
  const jwk = JSON.parse(privateJwkStr) as Record<string, unknown>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { d, key_ops, ...pubJwk } = jwk;
  return JSON.stringify(pubJwk);
}

export async function importPrivateKey(jwkStr: string): Promise<CryptoKey> {
  return crypto.subtle.importKey('jwk', JSON.parse(jwkStr), ALGO_ECDH, false, ['deriveKey']);
}

export async function importPublicKey(jwkStr: string): Promise<CryptoKey> {
  return crypto.subtle.importKey('jwk', JSON.parse(jwkStr), ALGO_ECDH, false, []);
}

// ---------------------------------------------------------------------------
// Shared key derivation  (ECDH)
// ---------------------------------------------------------------------------

export async function deriveSharedKey(
  myPrivateKey: CryptoKey,
  theirPublicKey: CryptoKey,
): Promise<CryptoKey> {
  return crypto.subtle.deriveKey(
    { name: 'ECDH', public: theirPublicKey },
    myPrivateKey,
    ALGO_AES,
    false,
    ['encrypt', 'decrypt'],
  );
}

// ---------------------------------------------------------------------------
// Encrypt / decrypt  (AES-GCM)
// ---------------------------------------------------------------------------

function u8ToBase64(buf: Uint8Array): string {
  return btoa(String.fromCharCode(...buf));
}

function base64ToU8(b64: string): Uint8Array<ArrayBuffer> {
  const binary = atob(b64);
  const arr = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
  return arr as Uint8Array<ArrayBuffer>;
}

export async function encryptMessage(plaintext: string, sharedKey: CryptoKey): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, sharedKey, encoded);
  return `${E2E_PREFIX}${u8ToBase64(iv)}:${u8ToBase64(new Uint8Array(ciphertext))}`;
}

export async function decryptMessage(payload: string, sharedKey: CryptoKey): Promise<string> {
  const [, ivB64, ctB64] = payload.split(':');
  if (!ivB64 || !ctB64) throw new Error('Malformed E2E payload');
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: base64ToU8(ivB64) },
    sharedKey,
    base64ToU8(ctB64),
  );
  return new TextDecoder().decode(decrypted);
}

/** Returns true if the string is an E2E-encrypted payload. */
export function isEncrypted(text: string): boolean {
  return text.startsWith(E2E_PREFIX);
}
