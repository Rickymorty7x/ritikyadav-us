# Ritikyadav.us private publishing system

This directory contains the Cloudflare Worker and D1 database that power the private admin workspace and public dynamic-content API. The existing GitHub Pages website remains the origin for normal pages.

## Architecture

```text
Public browser ──> GitHub Pages (HTML/CSS/JS)
       │
       ├── /api/content ───────────────> Cloudflare Worker ──> D1
       │
Owner  └── hidden logo gesture
               └── /__ry/gateway
                     └── one-time token
                           └── /admin/login
                                 └── secure session ──> CRUD + audit log
```

The gesture is only a private shortcut. It is deliberately **not** treated as authentication. Security is enforced on the server.

## Security controls

- Passwords use PBKDF2-HMAC-SHA-256 with 600,000 iterations, a unique salt, and a separate Worker-secret pepper.
- The database never receives a plaintext password.
- Session IDs are 256-bit random values; only SHA-256 hashes are stored in D1.
- Session cookies are `Secure`, `HttpOnly`, `SameSite=Strict`, host-only cookies.
- State-changing requests require a same-origin request and a matching CSRF token.
- Login attempts are rate-limited; gateway URLs are short-lived and single-use.
- Turnstile is validated server-side when configured.
- The private area uses `no-store`, strict CSP, anti-framing headers, and `X-Robots-Tag: noindex`.
- Admin actions and failed/successful sign-ins are recorded in an audit log.
- Password changes revoke every other active session.
- SQL uses D1 prepared statements and bound parameters.

No internet-connected system can honestly be guaranteed “100% secure.” This is defense in depth, and it still requires secret rotation, software updates, monitoring, backups, and a strong unique password.

## Cloudflare resources required

1. D1 database named `ritikyadav-admin`.
2. Worker routes for `ritikyadav.us/api/*`, `ritikyadav.us/admin*`, and `ritikyadav.us/__ry/*`.
3. Turnstile widget restricted to `ritikyadav.us` (recommended).
4. Worker secrets: `AUTH_PEPPER` and `TURNSTILE_SECRET`.

Replace the placeholder `database_id` in `wrangler.jsonc` with the ID returned when the D1 database is created.

## First setup

```sh
npm install
npx wrangler secret put AUTH_PEPPER
npx wrangler secret put TURNSTILE_SECRET
npm run db:migrate:remote
npm run deploy
```

After deployment, tap the small logo dot seven times within four seconds. The Worker creates a one-time entry token and reveals the owner setup screen when no administrator exists. Choose your admin ID and password there; the password is hashed inside the Worker and plaintext is never stored or sent anywhere except the protected setup request.

## Content model

The admin supports `post`, `project`, `blog`, `opinion`, `music`, and `page` entries with draft, published, and archived states. Metadata is JSON for type-specific fields such as tags, URLs, GitHub links, artist, YouTube video ID, and duration.

The initial migration imports the current projects, blog posts, opinion, and playlist. Public pages load published D1 content first and retain their bundled static content as a fallback if the Worker is unavailable.

## Local verification

```sh
npm run db:migrate:local
npm run typecheck
npm run dev
```

Never commit `.dev.vars`, passwords, API tokens, generated credential JSON, or Turnstile secrets.
