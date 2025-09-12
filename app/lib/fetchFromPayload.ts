// lib/fetchFromPayload.ts
// Unifica las llamadas al backend usando NEXT_PUBLIC_BACKEND_URL
const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function fetchFromPayload<T>(path: string): Promise<T> {
  if (!BASE_URL) {
    throw new Error('NEXT_PUBLIC_BACKEND_URL no está definida');
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${BASE_URL}/api${normalizedPath}`;

  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`[Payload] ${res.status} ${res.statusText} en ${url} ${text}`);
  }

  return res.json();
}

