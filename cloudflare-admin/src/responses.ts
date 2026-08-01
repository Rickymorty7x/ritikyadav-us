const BASE_SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
};

const PRIVATE_HEADERS: Record<string, string> = {
  ...BASE_SECURITY_HEADERS,
  'Cache-Control': 'no-store, private, max-age=0',
  Pragma: 'no-cache',
  'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet, noimageindex',
  'X-Frame-Options': 'DENY',
};

export function json(data: unknown, status = 200, extraHeaders?: HeadersInit): Response {
  const headers = new Headers({
    ...PRIVATE_HEADERS,
    'Content-Type': 'application/json; charset=utf-8',
  });
  if (extraHeaders) new Headers(extraHeaders).forEach((value, key) => headers.append(key, value));
  return new Response(JSON.stringify(data), { status, headers });
}

export function publicJson(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...BASE_SECURITY_HEADERS,
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': status === 200 ? 'public, max-age=60, s-maxage=120, stale-while-revalidate=300' : 'no-store',
    },
  });
}

export function publicHtml(body: string, status = 200, extraHeaders?: HeadersInit): Response {
  const headers = new Headers({
    ...BASE_SECURITY_HEADERS,
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': status === 200 ? 'public, max-age=60, s-maxage=120, stale-while-revalidate=300' : 'no-store',
    'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; img-src 'self' data: https:; connect-src 'self'; font-src 'self' https://fonts.gstatic.com; form-action 'self'; frame-ancestors 'none'; base-uri 'none'; object-src 'none'",
    'X-Frame-Options': 'DENY',
  });
  if (status !== 200) headers.set('X-Robots-Tag', 'noindex, nofollow');
  if (extraHeaders) new Headers(extraHeaders).forEach((value, key) => headers.append(key, value));
  return new Response(body, { status, headers });
}

export function html(body: string, status = 200): Response {
  return new Response(body, {
    status,
    headers: {
      ...PRIVATE_HEADERS,
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Security-Policy': "default-src 'none'; script-src 'self' https://challenges.cloudflare.com; style-src 'self'; img-src 'self' data:; connect-src 'self' https://challenges.cloudflare.com; frame-src https://challenges.cloudflare.com; font-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'; object-src 'none'",
    },
  });
}

export function asset(body: string, type: string): Response {
  return new Response(body, {
    headers: {
      ...PRIVATE_HEADERS,
      'Content-Type': `${type}; charset=utf-8`,
    },
  });
}

export function redirect(location: string, headers?: HeadersInit): Response {
  const responseHeaders = new Headers({ ...PRIVATE_HEADERS, Location: location });
  if (headers) new Headers(headers).forEach((value, key) => responseHeaders.append(key, value));
  return new Response(null, { status: 303, headers: responseHeaders });
}

export function methodNotAllowed(allow: string): Response {
  return json({ error: 'Method not allowed.' }, 405, { Allow: allow });
}
