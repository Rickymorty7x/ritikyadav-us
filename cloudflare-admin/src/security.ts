export const SESSION_COOKIE = '__Host-ry_session';
export const CSRF_COOKIE = '__Host-ry_csrf';
export const GATE_COOKIE = '__Host-ry_gate';
export const PASSWORD_ITERATIONS = 600_000;

const encoder = new TextEncoder();

function asArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return new Uint8Array(bytes).buffer;
}

export type StoredCredential = {
  version: 1;
  username: string;
  iterations: number;
  salt: string;
  hash: string;
};

export function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export function fromBase64Url(value: string): Uint8Array {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
  const binary = atob(base64);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

export function randomToken(byteLength = 32): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return toBase64Url(bytes);
}

export async function sha256(value: string | Uint8Array): Promise<string> {
  const bytes = typeof value === 'string' ? encoder.encode(value) : value;
  return toBase64Url(new Uint8Array(await crypto.subtle.digest('SHA-256', asArrayBuffer(bytes))));
}

async function hmacPassword(password: string, pepper: string): Promise<ArrayBuffer> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(pepper),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  return crypto.subtle.sign('HMAC', key, encoder.encode(password));
}

export async function derivePasswordHash(
  password: string,
  salt: string,
  iterations: number,
  pepper: string,
): Promise<string> {
  const prehash = await hmacPassword(password, pepper);
  const key = await crypto.subtle.importKey('raw', prehash, 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: asArrayBuffer(fromBase64Url(salt)), iterations },
    key,
    256,
  );
  return toBase64Url(new Uint8Array(bits));
}

export function constantTimeEqual(a: string, b: string): boolean {
  const left = encoder.encode(a);
  const right = encoder.encode(b);
  let difference = left.length ^ right.length;
  const max = Math.max(left.length, right.length);
  for (let i = 0; i < max; i += 1) difference |= (left[i] ?? 0) ^ (right[i] ?? 0);
  return difference === 0;
}

export function parseCredential(value: string): StoredCredential {
  const parsed: unknown = JSON.parse(value);
  if (!parsed || typeof parsed !== 'object') throw new Error('ADMIN_CREDENTIAL is invalid.');
  const candidate = parsed as Partial<StoredCredential>;
  if (
    candidate.version !== 1 ||
    typeof candidate.username !== 'string' ||
    typeof candidate.salt !== 'string' ||
    typeof candidate.hash !== 'string' ||
    typeof candidate.iterations !== 'number' ||
    candidate.iterations < PASSWORD_ITERATIONS
  ) throw new Error('ADMIN_CREDENTIAL is invalid.');
  return candidate as StoredCredential;
}

export function parseCookies(request: Request): Map<string, string> {
  const result = new Map<string, string>();
  for (const item of (request.headers.get('Cookie') || '').split(';')) {
    const index = item.indexOf('=');
    if (index < 1) continue;
    result.set(item.slice(0, index).trim(), decodeURIComponent(item.slice(index + 1).trim()));
  }
  return result;
}

export function secureCookie(name: string, value: string, maxAge: number, httpOnly = true): string {
  return `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; Secure; SameSite=Strict${httpOnly ? '; HttpOnly' : ''}`;
}

export function clearCookie(name: string, httpOnly = true): string {
  return `${name}=; Path=/; Max-Age=0; Secure; SameSite=Strict${httpOnly ? '; HttpOnly' : ''}`;
}

export function requestIp(request: Request): string {
  return request.headers.get('CF-Connecting-IP') || 'local';
}

export async function requestFingerprint(request: Request, pepper: string): Promise<{ ipHash: string; userAgentHash: string }> {
  const ipHash = await sha256(`${pepper}:ip:${requestIp(request)}`);
  const userAgentHash = await sha256(`${pepper}:ua:${request.headers.get('User-Agent') || 'unknown'}`);
  return { ipHash, userAgentHash };
}

export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get('Origin');
  return origin === new URL(request.url).origin;
}
