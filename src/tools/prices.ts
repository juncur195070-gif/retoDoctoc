import type { McpServer } from '@metorial/mcp-server-sdk';
import { z } from '@metorial/mcp-server-sdk';
import { doctocRequest } from '../utils/doctoc-client.ts';

export function registerPriceTools(server: McpServer): void {
  server.tool(
    'get-prices',
    'Obtiene los precios de servicios medicos. Opcionalmente filtra por categoria.',
    {
      categoriaID: z
        .string()
        .optional()
        .describe('ID de la categoria para filtrar precios (opcional, sin el retorna todos)'),
    },
    async ({ categoriaID }) => {
      try {
        const body: Record<string, unknown> = { action: 'prices' };
        if (categoriaID) body.categoriaID = categoriaID;

        const result = await doctocRequest('getPricesAPI', body);
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[get-prices] Error: ${message}`);
        return {
          content: [{ type: 'text' as const, text: `Error: ${message}` }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'get-price-categories',
    'Obtiene las categorias de precios (ej: Consultas, Procedimientos, Laboratorio).',
    {},
    async () => {
      try {
        const result = await doctocRequest('getPricesAPI', {
          action: 'categories',
        });
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[get-price-categories] Error: ${message}`);
        return {
          content: [{ type: 'text' as const, text: `Error: ${message}` }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'get-prices-and-categories',
    'Obtiene precios y categorias en una sola llamada. Mas eficiente que llamar get-prices y get-price-categories por separado.',
    {},
    async () => {
      try {
        const result = await doctocRequest('getPricesAPI', {
          action: 'both',
        });
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[get-prices-and-categories] Error: ${message}`);
        return {
          content: [{ type: 'text' as const, text: `Error: ${message}` }],
          isError: true,
        };
      }
    },
  );
}
