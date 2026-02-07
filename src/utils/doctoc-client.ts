import { config } from '../config.js';

export async function doctocRequest<T = Record<string, unknown>>(
  endpoint: string,
  body: Record<string, unknown>,
): Promise<T> {
  const url = `${config.doctocApiUrl}/${endpoint}`;

  console.error(`[doctoc-client] POST ${endpoint}`);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.doctocApiToken}`,
    },
    body: JSON.stringify({
      orgID: config.doctocOrgId,
      ...body,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Error desconocido');
    throw new Error(
      `Doctoc API error: ${response.status} ${response.statusText} - ${errorText}`,
    );
  }

  return response.json() as Promise<T>;
}
