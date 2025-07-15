const API_URL = process.env.PAYLOAD_API_URL;

export async function fetchFromPayload(
  path: string,
  options?: RequestInit
) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });

  if (!res.ok) {
    console.error('[Payload API Error]', res.status, await res.text());
    throw new Error('Error al llamar a la API de Payload');
  }

  return res.json();
}
