import { ADMIN_CSS, ADMIN_HTML, ADMIN_JS, LOGIN_JS, loginHtml } from './admin-ui';
import { asset, html, json, methodNotAllowed, publicJson, redirect } from './responses';
import {
  CSRF_COOKIE,
  GATE_COOKIE,
  PASSWORD_ITERATIONS,
  SESSION_COOKIE,
  clearCookie,
  constantTimeEqual,
  derivePasswordHash,
  parseCookies,
  randomToken,
  requestFingerprint,
  requestIp,
  sameOrigin,
  secureCookie,
  sha256,
  toBase64Url,
} from './security';

interface Env {
  DB: D1Database;
  AUTH_PEPPER: string;
  TURNSTILE_SITE_KEY?: string;
  TURNSTILE_SECRET?: string;
}

type AdminRow = {
  id: number;
  username: string;
  password_hash: string;
  password_salt: string;
  password_iterations: number;
};

type SessionRow = {
  id_hash: string;
  admin_id: number;
  username: string;
  csrf_hash: string;
  ip_hash: string;
  user_agent_hash: string;
  created_at: number;
  last_seen_at: number;
  expires_at: number;
};

type ContentInput = {
  type: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  metadata: Record<string, unknown>;
  status: string;
  sortOrder: number;
  publishedAt: number | null;
};

const CONTENT_TYPES = new Set(['post', 'project', 'blog', 'opinion', 'music', 'page']);
const CONTENT_STATUSES = new Set(['draft', 'published', 'archived']);
const SESSION_SECONDS = 8 * 60 * 60;
const SESSION_IDLE_SECONDS = 45 * 60;
const GATE_ENTRY_SECONDS = 3 * 60;
const GATE_BROWSER_SECONDS = 5 * 60;

function now(): number {
  return Math.floor(Date.now() / 1000);
}

async function readJson(request: Request, maxBytes = 128_000): Promise<Record<string, unknown>> {
  const declared = Number(request.headers.get('Content-Length') || 0);
  if (declared > maxBytes) throw new Error('Request is too large.');
  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > maxBytes) throw new Error('Request is too large.');
  const parsed: unknown = JSON.parse(raw);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('A JSON object is required.');
  return parsed as Record<string, unknown>;
}

function normalizeUsername(value: unknown): string {
  return typeof value === 'string' ? value.trim().slice(0, 64) : '';
}

function normalizeContent(input: Record<string, unknown>): ContentInput {
  const type = typeof input.type === 'string' ? input.type : '';
  const status = typeof input.status === 'string' ? input.status : '';
  const slug = typeof input.slug === 'string' ? input.slug.trim().toLowerCase() : '';
  const title = typeof input.title === 'string' ? input.title.trim() : '';
  const excerpt = typeof input.excerpt === 'string' ? input.excerpt.trim() : '';
  const body = typeof input.body === 'string' ? input.body : '';
  const metadata = input.metadata && typeof input.metadata === 'object' && !Array.isArray(input.metadata)
    ? input.metadata as Record<string, unknown>
    : {};
  const sortOrder = Number.isInteger(input.sortOrder) ? Number(input.sortOrder) : 0;
  const publishedAt = input.publishedAt === null || input.publishedAt === undefined || input.publishedAt === ''
    ? null
    : Number(input.publishedAt);

  if (!CONTENT_TYPES.has(type)) throw new Error('Invalid content type.');
  if (!CONTENT_STATUSES.has(status)) throw new Error('Invalid content status.');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 120) throw new Error('Slug must contain lowercase letters, numbers, and hyphens.');
  if (title.length < 1 || title.length > 160) throw new Error('Title must be 1-160 characters.');
  if (excerpt.length > 500) throw new Error('Excerpt is too long.');
  if (body.length > 100_000) throw new Error('Body is too long.');
  if (JSON.stringify(metadata).length > 20_000) throw new Error('Metadata is too large.');
  if (sortOrder < -9999 || sortOrder > 9999) throw new Error('Sort order is out of range.');
  if (publishedAt !== null && (!Number.isInteger(publishedAt) || publishedAt < 0)) throw new Error('Invalid publish date.');

  return { type, status, slug, title, excerpt, body, metadata, sortOrder, publishedAt };
}

function parseMetadata<T extends { metadata: string }>(row: T): Omit<T, 'metadata'> & { metadata: Record<string, unknown> } {
  let metadata: Record<string, unknown> = {};
  try {
    const parsed: unknown = JSON.parse(row.metadata);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) metadata = parsed as Record<string, unknown>;
  } catch { /* Existing invalid metadata is treated as empty. */ }
  return { ...row, metadata };
}

async function getAdmin(env: Env): Promise<AdminRow | null> {
  return env.DB.prepare('SELECT id, username, password_hash, password_salt, password_iterations FROM admins LIMIT 1').first<AdminRow>();
}

async function verifyAdminCredentials(env: Env, username: string, password: string): Promise<AdminRow | null> {
  if (password.length < 1 || password.length > 1024) return null;
  const admin = await getAdmin(env);
  if (!admin || admin.username.toLowerCase() !== username.toLowerCase()) return null;
  const candidate = await derivePasswordHash(password, admin.password_salt, admin.password_iterations, env.AUTH_PEPPER);
  return constantTimeEqual(candidate, admin.password_hash) ? admin : null;
}

async function authenticate(request: Request, env: Env, requireCsrf = false): Promise<SessionRow | null> {
  const cookies = parseCookies(request);
  const token = cookies.get(SESSION_COOKIE);
  if (!token || token.length > 128) return null;
  const idHash = await sha256(token);
  const session = await env.DB.prepare(`SELECT s.id_hash, s.admin_id, a.username, s.csrf_hash, s.ip_hash, s.user_agent_hash, s.created_at, s.last_seen_at, s.expires_at
    FROM sessions s JOIN admins a ON a.id = s.admin_id WHERE s.id_hash = ? AND s.revoked_at IS NULL`).bind(idHash).first<SessionRow>();
  const timestamp = now();
  if (!session || session.expires_at <= timestamp || session.last_seen_at <= timestamp - SESSION_IDLE_SECONDS) return null;
  const fingerprint = await requestFingerprint(request, env.AUTH_PEPPER);
  if (!constantTimeEqual(session.user_agent_hash, fingerprint.userAgentHash)) return null;
  if (requireCsrf) {
    if (!sameOrigin(request)) return null;
    const cookieToken = cookies.get(CSRF_COOKIE) || '';
    const headerToken = request.headers.get('X-CSRF-Token') || '';
    if (!cookieToken || !constantTimeEqual(cookieToken, headerToken) || !constantTimeEqual(await sha256(cookieToken), session.csrf_hash)) return null;
  }
  return session;
}

async function audit(request: Request, env: Env, adminId: number | null, action: string, entityType: string, entityId: string | null, detail: Record<string, unknown> = {}): Promise<void> {
  const fingerprint = await requestFingerprint(request, env.AUTH_PEPPER);
  await env.DB.prepare('INSERT INTO audit_log (admin_id, action, entity_type, entity_id, ip_hash, user_agent_hash, detail, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .bind(adminId, action, entityType, entityId, fingerprint.ipHash, fingerprint.userAgentHash, JSON.stringify(detail), now()).run();
}

async function cleanup(env: Env): Promise<void> {
  const timestamp = now();
  await env.DB.batch([
    env.DB.prepare('DELETE FROM gate_tokens WHERE expires_at < ?').bind(timestamp - 3600),
    env.DB.prepare('DELETE FROM sessions WHERE expires_at < ? OR revoked_at < ?').bind(timestamp - 86400, timestamp - 86400 * 30),
    env.DB.prepare('DELETE FROM login_attempts WHERE created_at < ?').bind(timestamp - 86400 * 7),
  ]);
}

async function issueGateway(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') return methodNotAllowed('POST');
  if (!sameOrigin(request)) return json({ error: 'Unavailable.' }, 404);
  const fingerprint = await requestFingerprint(request, env.AUTH_PEPPER);
  const timestamp = now();
  const recent = await env.DB.prepare('SELECT COUNT(*) AS count FROM gate_tokens WHERE ip_hash = ? AND created_at > ?')
    .bind(fingerprint.ipHash, timestamp - 300).first<{ count: number }>();
  if ((recent?.count || 0) >= 12) return json({ error: 'Please wait before trying again.' }, 429, { 'Retry-After': '300' });
  const rawToken = randomToken();
  await env.DB.prepare('INSERT INTO gate_tokens (id_hash, ip_hash, created_at, expires_at) VALUES (?, ?, ?, ?)')
    .bind(await sha256(rawToken), fingerprint.ipHash, timestamp, timestamp + GATE_ENTRY_SECONDS).run();
  return json({ entry: `/admin/entry?gate=${encodeURIComponent(rawToken)}` });
}

async function enterGateway(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'GET') return methodNotAllowed('GET');
  const rawToken = new URL(request.url).searchParams.get('gate') || '';
  if (rawToken.length < 32 || rawToken.length > 128) return redirect('/');
  const fingerprint = await requestFingerprint(request, env.AUTH_PEPPER);
  const timestamp = now();
  const tokenHash = await sha256(rawToken);
  const gate = await env.DB.prepare('SELECT id_hash FROM gate_tokens WHERE id_hash = ? AND ip_hash = ? AND expires_at > ? AND consumed_at IS NULL')
    .bind(tokenHash, fingerprint.ipHash, timestamp).first<{ id_hash: string }>();
  if (!gate) return redirect('/');
  const browserToken = randomToken();
  await env.DB.prepare('UPDATE gate_tokens SET browser_hash = ?, consumed_at = ?, expires_at = ? WHERE id_hash = ? AND consumed_at IS NULL')
    .bind(await sha256(browserToken), timestamp, timestamp + GATE_BROWSER_SECONDS, tokenHash).run();
  return redirect('/admin/login', { 'Set-Cookie': secureCookie(GATE_COOKIE, browserToken, GATE_BROWSER_SECONDS) });
}

async function validGate(request: Request, env: Env): Promise<{ id_hash: string } | null> {
  const browserToken = parseCookies(request).get(GATE_COOKIE) || '';
  if (browserToken.length < 32 || browserToken.length > 128) return null;
  const fingerprint = await requestFingerprint(request, env.AUTH_PEPPER);
  return env.DB.prepare('SELECT id_hash FROM gate_tokens WHERE browser_hash = ? AND ip_hash = ? AND expires_at > ? AND consumed_at IS NOT NULL AND used_at IS NULL')
    .bind(await sha256(browserToken), fingerprint.ipHash, now()).first<{ id_hash: string }>();
}

async function validateTurnstile(request: Request, env: Env, token: string): Promise<boolean> {
  if (!env.TURNSTILE_SECRET) return false;
  if (!token || token.length > 2048) return false;
  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: env.TURNSTILE_SECRET,
        response: token,
        remoteip: requestIp(request),
      }),
    });
    if (!response.ok) return false;
    const result = await response.json<{ success?: boolean }>();
    return result.success === true;
  } catch {
    return false;
  }
}

async function establishSession(request: Request, env: Env, admin: AdminRow, gate: { id_hash: string }, action: string): Promise<Response> {
  const timestamp = now();
  const fingerprint = await requestFingerprint(request, env.AUTH_PEPPER);
  const sessionToken = randomToken();
  const csrfToken = randomToken();
  await env.DB.batch([
    env.DB.prepare('INSERT INTO sessions (id_hash, admin_id, csrf_hash, ip_hash, user_agent_hash, created_at, last_seen_at, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .bind(await sha256(sessionToken), admin.id, await sha256(csrfToken), fingerprint.ipHash, fingerprint.userAgentHash, timestamp, timestamp, timestamp + SESSION_SECONDS),
    env.DB.prepare('UPDATE gate_tokens SET used_at = ? WHERE id_hash = ?').bind(timestamp, gate.id_hash),
  ]);
  await audit(request, env, admin.id, action, 'session', null);
  const headers = new Headers();
  headers.append('Set-Cookie', secureCookie(SESSION_COOKIE, sessionToken, SESSION_SECONDS));
  headers.append('Set-Cookie', secureCookie(CSRF_COOKIE, csrfToken, SESSION_SECONDS, false));
  headers.append('Set-Cookie', clearCookie(GATE_COOKIE));
  return json({ ok: true }, 200, headers);
}

async function setupAdmin(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') return methodNotAllowed('POST');
  if (!sameOrigin(request)) return json({ error: 'Setup failed.' }, 403);
  const gate = await validGate(request, env);
  if (!gate) return json({ error: 'This private entry has expired.' }, 403);
  if (await getAdmin(env)) return json({ error: 'Owner access already exists.' }, 409);
  let body: Record<string, unknown>;
  try { body = await readJson(request, 8_000); } catch { return json({ error: 'Setup failed.' }, 400); }
  const username = normalizeUsername(body.username);
  const password = typeof body.password === 'string' ? body.password : '';
  const confirmPassword = typeof body.confirmPassword === 'string' ? body.confirmPassword : '';
  const turnstileToken = typeof body['cf-turnstile-response'] === 'string' ? body['cf-turnstile-response'] : '';
  if (!/^[A-Za-z0-9._-]{3,64}$/.test(username)) return json({ error: 'Admin ID must be 3-64 safe characters.' }, 400);
  if (password.length < 14 || password.length > 1024) return json({ error: 'Password must be 14-1024 characters.' }, 400);
  if (!constantTimeEqual(password, confirmPassword)) return json({ error: 'Passwords do not match.' }, 400);
  if (!await validateTurnstile(request, env, turnstileToken)) return json({ error: 'Human verification failed.' }, 403);
  const saltBytes = new Uint8Array(16);
  crypto.getRandomValues(saltBytes);
  const salt = toBase64Url(saltBytes);
  const hash = await derivePasswordHash(password, salt, PASSWORD_ITERATIONS, env.AUTH_PEPPER);
  const timestamp = now();
  try {
    await env.DB.prepare('INSERT INTO admins (username, password_hash, password_salt, password_iterations, created_at, password_changed_at) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(username, hash, salt, PASSWORD_ITERATIONS, timestamp, timestamp).run();
  } catch {
    return json({ error: 'Owner access already exists.' }, 409);
  }
  const admin = await getAdmin(env);
  if (!admin) return json({ error: 'Setup failed.' }, 500);
  return establishSession(request, env, admin, gate, 'admin_created');
}

async function login(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') return methodNotAllowed('POST');
  if (!sameOrigin(request)) return json({ error: 'Sign-in failed.' }, 403);
  const gate = await validGate(request, env);
  if (!gate) return json({ error: 'This private entry has expired.' }, 403);
  let body: Record<string, unknown>;
  try { body = await readJson(request, 8_000); } catch { return json({ error: 'Sign-in failed.' }, 400); }
  const username = normalizeUsername(body.username);
  const password = typeof body.password === 'string' ? body.password : '';
  const turnstileToken = typeof body['cf-turnstile-response'] === 'string' ? body['cf-turnstile-response'] : '';
  const fingerprint = await requestFingerprint(request, env.AUTH_PEPPER);
  const usernameHash = await sha256(`${env.AUTH_PEPPER}:user:${username.toLowerCase()}`);
  const timestamp = now();
  const failures = await env.DB.prepare('SELECT COUNT(*) AS count FROM login_attempts WHERE ip_hash = ? AND username_hash = ? AND success = 0 AND created_at > ?')
    .bind(fingerprint.ipHash, usernameHash, timestamp - 900).first<{ count: number }>();
  if ((failures?.count || 0) >= 5) return json({ error: 'Too many attempts. Try again later.' }, 429, { 'Retry-After': '900' });

  const human = await validateTurnstile(request, env, turnstileToken);
  let admin: AdminRow | null = null;
  try { if (human) admin = await verifyAdminCredentials(env, username, password); } catch (error) {
    console.error('Admin configuration error', error);
    return json({ error: 'Admin access is not configured.' }, 503);
  }
  await env.DB.prepare('INSERT INTO login_attempts (ip_hash, username_hash, success, created_at) VALUES (?, ?, ?, ?)')
    .bind(fingerprint.ipHash, usernameHash, admin ? 1 : 0, timestamp).run();
  if (!admin) {
    await audit(request, env, null, 'login_failed', 'session', null);
    return json({ error: 'Sign-in failed.' }, 401);
  }

  return establishSession(request, env, admin, gate, 'login_success');
}

async function sessionInfo(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const session = await authenticate(request, env);
  if (!session) return json({ error: 'Unauthorized.' }, 401);
  const csrf = parseCookies(request).get(CSRF_COOKIE) || '';
  if (!csrf || !constantTimeEqual(await sha256(csrf), session.csrf_hash)) return json({ error: 'Unauthorized.' }, 401);
  if (session.last_seen_at < now() - 120) {
    ctx.waitUntil(env.DB.prepare('UPDATE sessions SET last_seen_at = ? WHERE id_hash = ?').bind(now(), session.id_hash).run().then(() => undefined));
  }
  return json({ username: session.username, csrf });
}

async function logout(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') return methodNotAllowed('POST');
  const session = await authenticate(request, env, true);
  if (!session) return json({ error: 'Unauthorized.' }, 401);
  const timestamp = now();
  await env.DB.prepare('UPDATE sessions SET revoked_at = ? WHERE id_hash = ?').bind(timestamp, session.id_hash).run();
  await audit(request, env, session.admin_id, 'logout', 'session', session.id_hash.slice(0, 10));
  const headers = new Headers();
  headers.append('Set-Cookie', clearCookie(SESSION_COOKIE));
  headers.append('Set-Cookie', clearCookie(CSRF_COOKIE, false));
  return json({ ok: true }, 200, headers);
}

async function listContent(env: Env): Promise<Response> {
  const result = await env.DB.prepare('SELECT id, type, slug, title, excerpt, body, metadata, status, sort_order, published_at, created_at, updated_at, version FROM content ORDER BY updated_at DESC, id DESC').all<{
    id: number; type: string; slug: string; title: string; excerpt: string; body: string; metadata: string; status: string; sort_order: number; published_at: number | null; created_at: number; updated_at: number; version: number;
  }>();
  return json({ items: result.results.map(parseMetadata) });
}

async function mutateContent(request: Request, env: Env, session: SessionRow, id: number | null): Promise<Response> {
  if (request.method === 'DELETE') {
    if (!id) return json({ error: 'Invalid content ID.' }, 400);
    const existing = await env.DB.prepare('SELECT type, slug, title FROM content WHERE id = ?').bind(id).first<{ type: string; slug: string; title: string }>();
    if (!existing) return json({ error: 'Content not found.' }, 404);
    const fingerprint = await requestFingerprint(request, env.AUTH_PEPPER);
    await env.DB.batch([
      env.DB.prepare('DELETE FROM content WHERE id = ?').bind(id),
      env.DB.prepare('INSERT INTO audit_log (admin_id, action, entity_type, entity_id, ip_hash, user_agent_hash, detail, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
        .bind(session.admin_id, 'content_deleted', existing.type, String(id), fingerprint.ipHash, fingerprint.userAgentHash, JSON.stringify({ slug: existing.slug, title: existing.title }), now()),
    ]);
    return json({ ok: true });
  }
  if (!['POST', 'PUT'].includes(request.method)) return methodNotAllowed(id ? 'PUT, DELETE' : 'GET, POST');
  let input: ContentInput;
  try { input = normalizeContent(await readJson(request)); } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Invalid content.' }, 400);
  }
  const timestamp = now();
  const publishedAt = input.status === 'published' ? (input.publishedAt || timestamp) : input.publishedAt;
  const metadata = JSON.stringify(input.metadata);
  const fingerprint = await requestFingerprint(request, env.AUTH_PEPPER);
  try {
    if (id) {
      const result = await env.DB.batch([
        env.DB.prepare('UPDATE content SET type = ?, slug = ?, title = ?, excerpt = ?, body = ?, metadata = ?, status = ?, sort_order = ?, published_at = ?, updated_at = ?, version = version + 1 WHERE id = ?')
          .bind(input.type, input.slug, input.title, input.excerpt, input.body, metadata, input.status, input.sortOrder, publishedAt, timestamp, id),
        env.DB.prepare('INSERT INTO audit_log (admin_id, action, entity_type, entity_id, ip_hash, user_agent_hash, detail, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
          .bind(session.admin_id, 'content_updated', input.type, String(id), fingerprint.ipHash, fingerprint.userAgentHash, JSON.stringify({ slug: input.slug, status: input.status }), timestamp),
      ]);
      if (!result[0].meta.changes) return json({ error: 'Content not found.' }, 404);
      return json({ ok: true, id });
    }
    const inserted = await env.DB.prepare('INSERT INTO content (type, slug, title, excerpt, body, metadata, status, sort_order, published_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id')
      .bind(input.type, input.slug, input.title, input.excerpt, input.body, metadata, input.status, input.sortOrder, publishedAt, timestamp, timestamp).first<{ id: number }>();
    if (!inserted) throw new Error('Insert failed.');
    await audit(request, env, session.admin_id, 'content_created', input.type, String(inserted.id), { slug: input.slug, status: input.status });
    return json({ ok: true, id: inserted.id }, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message.includes('UNIQUE constraint failed')) return json({ error: 'A content item with that type and slug already exists.' }, 409);
    console.error('Content mutation failed', error);
    return json({ error: 'Unable to save content.' }, 500);
  }
}

async function auditLog(env: Env): Promise<Response> {
  const result = await env.DB.prepare('SELECT action, entity_type, entity_id, detail, created_at FROM audit_log ORDER BY created_at DESC, id DESC LIMIT 150').all<{
    action: string; entity_type: string; entity_id: string | null; detail: string; created_at: number;
  }>();
  return json({ items: result.results });
}

async function changePassword(request: Request, env: Env, session: SessionRow): Promise<Response> {
  if (request.method !== 'PUT') return methodNotAllowed('PUT');
  let body: Record<string, unknown>;
  try { body = await readJson(request, 8_000); } catch { return json({ error: 'Invalid request.' }, 400); }
  const currentPassword = typeof body.currentPassword === 'string' ? body.currentPassword : '';
  const newPassword = typeof body.newPassword === 'string' ? body.newPassword : '';
  if (newPassword.length < 14 || newPassword.length > 1024) return json({ error: 'New password must be 14-1024 characters.' }, 400);
  const admin = await getAdmin(env);
  if (!admin || admin.id !== session.admin_id) return json({ error: 'Unauthorized.' }, 401);
  const currentHash = await derivePasswordHash(currentPassword, admin.password_salt, admin.password_iterations, env.AUTH_PEPPER);
  if (!constantTimeEqual(currentHash, admin.password_hash)) return json({ error: 'Current password is incorrect.' }, 401);
  const saltBytes = new Uint8Array(16);
  crypto.getRandomValues(saltBytes);
  const salt = toBase64Url(saltBytes);
  const newHash = await derivePasswordHash(newPassword, salt, PASSWORD_ITERATIONS, env.AUTH_PEPPER);
  const timestamp = now();
  const fingerprint = await requestFingerprint(request, env.AUTH_PEPPER);
  await env.DB.batch([
    env.DB.prepare('UPDATE admins SET password_hash = ?, password_salt = ?, password_iterations = ?, password_changed_at = ? WHERE id = ?')
      .bind(newHash, salt, PASSWORD_ITERATIONS, timestamp, admin.id),
    env.DB.prepare('UPDATE sessions SET revoked_at = ? WHERE admin_id = ? AND id_hash != ? AND revoked_at IS NULL')
      .bind(timestamp, admin.id, session.id_hash),
    env.DB.prepare('INSERT INTO audit_log (admin_id, action, entity_type, entity_id, ip_hash, user_agent_hash, detail, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .bind(admin.id, 'password_changed', 'admin', String(admin.id), fingerprint.ipHash, fingerprint.userAgentHash, '{}', timestamp),
  ]);
  return json({ ok: true });
}

async function publicContent(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'GET') return methodNotAllowed('GET');
  const url = new URL(request.url);
  const type = url.searchParams.get('type') || '';
  if (type && !CONTENT_TYPES.has(type)) return publicJson({ error: 'Invalid content type.' }, 400);
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get('limit') || 50)));
  const statement = type
    ? env.DB.prepare(`SELECT id, type, slug, title, excerpt, body, metadata, published_at, updated_at
        FROM content WHERE status = 'published' AND type = ? AND (published_at IS NULL OR published_at <= ?) ORDER BY sort_order ASC, published_at DESC, id DESC LIMIT ?`).bind(type, now(), limit)
    : env.DB.prepare(`SELECT id, type, slug, title, excerpt, body, metadata, published_at, updated_at
        FROM content WHERE status = 'published' AND (published_at IS NULL OR published_at <= ?) ORDER BY sort_order ASC, published_at DESC, id DESC LIMIT ?`).bind(now(), limit);
  const result = await statement.all<{ id: number; type: string; slug: string; title: string; excerpt: string; body: string; metadata: string; published_at: number | null; updated_at: number }>();
  return publicJson({ items: result.results.map(parseMetadata) });
}

async function handleAdminApi(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const path = new URL(request.url).pathname;
  if (path === '/api/admin/setup') return setupAdmin(request, env);
  if (path === '/api/admin/login') return login(request, env);
  if (path === '/api/admin/session') return sessionInfo(request, env, ctx);
  const requiresCsrf = !['GET', 'HEAD'].includes(request.method);
  const session = await authenticate(request, env, requiresCsrf);
  if (!session) return json({ error: 'Unauthorized.' }, 401);
  if (path === '/api/admin/logout') return logout(request, env);
  if (path === '/api/admin/audit') return request.method === 'GET' ? auditLog(env) : methodNotAllowed('GET');
  if (path === '/api/admin/password') return changePassword(request, env, session);
  if (path === '/api/admin/content') {
    if (request.method === 'GET') return listContent(env);
    return mutateContent(request, env, session, null);
  }
  const match = path.match(/^\/api\/admin\/content\/(\d+)$/);
  if (match) return mutateContent(request, env, session, Number(match[1]));
  return json({ error: 'Not found.' }, 404);
}

async function handleAdminPage(request: Request, env: Env): Promise<Response> {
  const path = new URL(request.url).pathname;
  if (path === '/admin/style.css') return asset(ADMIN_CSS, 'text/css');
  if (path === '/admin/login.js') return asset(LOGIN_JS, 'text/javascript');
  if (path === '/admin/app.js') return asset(ADMIN_JS, 'text/javascript');
  const session = await authenticate(request, env);
  if (path === '/admin' || path === '/admin/') {
    return session ? html(ADMIN_HTML) : redirect('/');
  }
  if (path === '/admin/login') {
    if (session) return redirect('/admin');
    const gate = await validGate(request, env);
    return gate ? html(loginHtml(env.TURNSTILE_SITE_KEY || '', !await getAdmin(env))) : redirect('/');
  }
  if (path === '/admin/entry') return enterGateway(request, env);
  return html('<!doctype html><title>Not found</title>', 404);
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    if (!env.AUTH_PEPPER || env.AUTH_PEPPER.length < 32) {
      console.error('AUTH_PEPPER is missing or too short.');
      return json({ error: 'Service is not configured.' }, 503);
    }
    const url = new URL(request.url);
    ctx.waitUntil(cleanup(env));
    try {
      if (url.pathname === '/__ry/gateway') return issueGateway(request, env);
      if (url.pathname === '/api/content') return publicContent(request, env);
      if (url.pathname.startsWith('/api/admin/')) return handleAdminApi(request, env, ctx);
      if (url.pathname === '/admin' || url.pathname.startsWith('/admin/')) return handleAdminPage(request, env);
      return json({ error: 'Not found.' }, 404);
    } catch (error) {
      console.error('Unhandled request error', error);
      return json({ error: 'Unexpected server error.' }, 500);
    }
  },
} satisfies ExportedHandler<Env>;
