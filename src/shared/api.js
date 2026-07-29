import { apiUrl as fallbackApiUrl } from "./config.js";

let resolvedApiUrl = fallbackApiUrl;
let loading = null;

export async function resolveApiUrl() {
  if (loading) return loading;
  loading = (async () => {
    try {
      const res = await fetch("/api-config.json", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data?.apiUrl) resolvedApiUrl = String(data.apiUrl).replace(/\/$/, "");
      }
    } catch {
      // keep fallback
    }
    return resolvedApiUrl;
  })();
  return loading;
}

export async function apiFetch(path, { token, method = "GET", body } = {}) {
  const base = await resolveApiUrl();
  const headers = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${base}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}
