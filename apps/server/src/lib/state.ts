import { stateToken } from '@/config';
import type { AppEnv } from './env';

function bytesToBase64Url(input: ArrayBuffer | Uint8Array | string): string {
  let bytes: Uint8Array;
  if (typeof input === 'string') {
    bytes = new TextEncoder().encode(input);
  } else if (input instanceof Uint8Array) {
    bytes = input;
  } else {
    bytes = new Uint8Array(input);
  }
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function base64UrlToBytes(input: string): Uint8Array {
  const pad = input.length % 4 === 0 ? '' : '='.repeat(4 - (input.length % 4));
  const b64 = input.replace(/-/g, '+').replace(/_/g, '/') + pad;
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function hmacSHA256(keyBytes: Uint8Array, data: string): Promise<string> {
  const copy = new Uint8Array(keyBytes.byteLength);
  copy.set(keyBytes);
  const keyBuffer: ArrayBuffer = copy.buffer;
  const key = await crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(data),
  );
  return bytesToBase64Url(sig);
}

export type InstallStatePayload = {
  teamId?: string;
  returnTo?: string;
  nonce: string;
  ts: number; // unix seconds
};

export async function signInstallState(
  env: AppEnv,
  payload: InstallStatePayload,
): Promise<string> {
  const secret = env.BETTER_AUTH_SECRET;
  const keyBytes = new TextEncoder().encode(secret);
  const body = bytesToBase64Url(JSON.stringify(payload));
  const sig = await hmacSHA256(keyBytes, body);
  return `${body}.${sig}`;
}

export async function verifyInstallState(
  env: AppEnv,
  token: string,
): Promise<InstallStatePayload | null> {
  try {
    const [body, sig] = token.split('.');
    if (!(body && sig)) {
      return null;
    }
    const secret = env.BETTER_AUTH_SECRET;
    const keyBytes = new TextEncoder().encode(secret);
    const expected = await hmacSHA256(keyBytes, body);
    if (expected !== sig) {
      return null;
    }
    const json = new TextDecoder().decode(base64UrlToBytes(body));
    const payload = JSON.parse(json) as InstallStatePayload;
    // Basic freshness check
    if (
      Math.abs(Date.now() / 1000 - payload.ts) >
      stateToken.freshnessWindowMinutes * 60
    ) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
