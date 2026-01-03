// lib/fetchFromPayload.ts
// Unifica las llamadas al backend usando el proxy /api (rewrite o reverse proxy).

export async function fetchFromPayload<T>(path: string): Promise<T> {
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
  const url = `/api/${normalizedPath}`;

  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`[Payload] ${res.status} ${res.statusText} en ${url} ${text}`);
  }

  return res.json();
}
