// lib/fetchFromPayload.ts
const API_URL = process.env.PAYLOAD_API_URL || 'http://69.62.110.55/api';

export async function fetchFromPayload<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    next: { revalidate: 60 }, // 🔄 caché de 60s si es del lado del server
  });

  if (!res.ok) {
    throw new Error(`[Payload] Error al hacer fetch a ${path}`);
  }

  return res.json();
}
