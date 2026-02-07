import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { unipileGet, unipilePostMessage } from '../utils/unipile-client.ts';

export function registerTelegramTools(server: McpServer): void {
  server.tool(
    'list-telegram-chats',
    'Lista los chats disponibles en Telegram. Usa esto para encontrar el chat_id necesario para leer o enviar mensajes a Poke u otros contactos.',
    {
      limit: z
        .number()
        .optional()
        .default(10)
        .describe('Numero maximo de chats a retornar (default 10)'),
      cursor: z
        .string()
        .optional()
        .describe('Cursor de paginacion para obtener la siguiente pagina de chats'),
    },
    async ({ limit, cursor }) => {
      try {
        const params: Record<string, string> = {
          account_type: 'TELEGRAM',
          limit: String(limit),
        };
        if (cursor) params.cursor = cursor;

        const result = await unipileGet('/chats', params);
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[list-telegram-chats] Error: ${message}`);
        return {
          content: [{ type: 'text' as const, text: `Error: ${message}` }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'read-telegram-messages',
    'Lee los mensajes mas recientes de un chat de Telegram. Necesitas el chat_id que obtienes con list-telegram-chats. Si acabas de enviar un mensaje y esperas respuesta, espera unos segundos antes de leer. Si el ultimo mensaje es tuyo, vuelve a intentar.',
    {
      chat_id: z
        .string()
        .describe('ID del chat de Telegram (obtenido de list-telegram-chats)'),
      limit: z
        .number()
        .optional()
        .default(20)
        .describe('Numero de mensajes a leer (default 20)'),
    },
    async ({ chat_id, limit }) => {
      try {
        const result = await unipileGet(`/chats/${chat_id}/messages`, {
          limit: String(limit),
        });
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[read-telegram-messages] Error: ${message}`);
        return {
          content: [{ type: 'text' as const, text: `Error: ${message}` }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'send-telegram-message',
    'Envia un mensaje de texto a un chat de Telegram. Necesitas el chat_id que obtienes con list-telegram-chats. Usa esto para comunicarte con Poke u otros contactos.',
    {
      chat_id: z.string().describe('ID del chat de Telegram'),
      text: z.string().describe('Texto del mensaje a enviar'),
    },
    async ({ chat_id, text }) => {
      try {
        const result = await unipilePostMessage(chat_id, text);
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[send-telegram-message] Error: ${message}`);
        return {
          content: [{ type: 'text' as const, text: `Error: ${message}` }],
          isError: true,
        };
      }
    },
  );
}
