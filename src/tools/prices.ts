import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { doctocRequest } from '../utils/doctoc-client.ts';

// Fallback: obtener precios desde los tipos de cita cuando getPricesAPI no está disponible
async function getPricesFromAppointmentTypes(): Promise<Record<string, unknown>> {
  const result = await doctocRequest<Record<string, unknown>>('manageUserInfoAPI', {
    action: 'get',
    sections: ['tipos'],
  });
  const tipos = (result as { appointment_types?: Array<Record<string, unknown>> }).appointment_types ?? [];
  const prices = tipos.map((t) => ({
    name: t.name,
    price: t.price ?? 0,
    category: t.category ?? 'cita',
    durationMinutes: t.durationMinutes ?? 0,
    id: t.id,
  }));
  return { source: 'appointment_types', prices };
}

export function registerPriceTools(server: McpServer): void {
  server.tool(
    'get-prices',
    'Obtiene los precios de servicios medicos. Si el endpoint de precios no esta disponible, retorna precios basados en los tipos de cita configurados.',
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
      } catch {
        // Fallback: usar precios de tipos de cita
        try {
          const fallback = await getPricesFromAppointmentTypes();
          return {
            content: [{ type: 'text' as const, text: JSON.stringify(fallback, null, 2) }],
          };
        } catch (fallbackError) {
          const message = fallbackError instanceof Error ? fallbackError.message : String(fallbackError);
          return {
            content: [{ type: 'text' as const, text: `Error: ${message}` }],
            isError: true,
          };
        }
      }
    },
  );

  server.tool(
    'get-price-categories',
    'Obtiene las categorias de precios. Si el endpoint no esta disponible, retorna las categorias derivadas de los tipos de cita.',
    {},
    async () => {
      try {
        const result = await doctocRequest('getPricesAPI', { action: 'categories' });
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch {
        try {
          const fallback = await getPricesFromAppointmentTypes();
          const categories = [...new Set((fallback.prices as Array<{ category: string }>).map((p) => p.category))];
          return {
            content: [{ type: 'text' as const, text: JSON.stringify({ source: 'appointment_types', categories }, null, 2) }],
          };
        } catch (fallbackError) {
          const message = fallbackError instanceof Error ? fallbackError.message : String(fallbackError);
          return {
            content: [{ type: 'text' as const, text: `Error: ${message}` }],
            isError: true,
          };
        }
      }
    },
  );

  server.tool(
    'get-prices-and-categories',
    'Obtiene precios y categorias en una sola llamada. Si el endpoint no esta disponible, retorna datos derivados de los tipos de cita.',
    {},
    async () => {
      try {
        const result = await doctocRequest('getPricesAPI', { action: 'both' });
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch {
        try {
          const fallback = await getPricesFromAppointmentTypes();
          const categories = [...new Set((fallback.prices as Array<{ category: string }>).map((p) => p.category))];
          return {
            content: [{ type: 'text' as const, text: JSON.stringify({ source: 'appointment_types', prices: fallback.prices, categories }, null, 2) }],
          };
        } catch (fallbackError) {
          const message = fallbackError instanceof Error ? fallbackError.message : String(fallbackError);
          return {
            content: [{ type: 'text' as const, text: `Error: ${message}` }],
            isError: true,
          };
        }
      }
    },
  );
}
