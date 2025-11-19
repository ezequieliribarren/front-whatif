// lib/fetchFromPayload.ts
// Unifica las llamadas al backend pasando siempre por el proxy interno de Next (/api/payload)

export async function fetchFromPayload<T>(path: string): Promise<T> {
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
  const url = `/api/payload/${normalizedPath}`;

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

