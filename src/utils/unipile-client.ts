import { config } from '../config.ts';

export async function unipileGet<T = unknown>(
  path: string,
  params?: Record<string, string>,
): Promise<T> {
  const url = new URL(`${config.unipileDsn}/api/v1${path}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v);
    }
  }

  console.error(`[unipile-client] GET ${path}`);

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'X-API-KEY': config.unipileApiKey,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Error desconocido');
    throw new Error(
      `Unipile API error: ${response.status} ${response.statusText} - ${errorText}`,
    );
  }

  return response.json() as Promise<T>;
}

export async function unipilePostMessage(
  chatId: string,
  text: string,
): Promise<unknown> {
  const url = `${config.unipileDsn}/api/v1/chats/${chatId}/messages`;

  console.error(`[unipile-client] POST /chats/${chatId}/messages`);

  const formData = new FormData();
  formData.append('text', text);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'X-API-KEY': config.unipileApiKey,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Error desconocido');
    throw new Error(
      `Unipile API error: ${response.status} ${response.statusText} - ${errorText}`,
    );
  }

  return response.json();
}
