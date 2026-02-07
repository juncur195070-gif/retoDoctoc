import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { doctocRequest } from '../utils/doctoc-client.js';

export function registerUserTools(server: McpServer): void {
  server.tool(
    'get-user-info',
    'Obtiene la informacion basica y profesional de un medico o usuario del sistema.',
    {
      uid: z.string().describe('UID del usuario/medico'),
    },
    async ({ uid }) => {
      try {
        const result = await doctocRequest('manageUserInfoAPI', {
          action: 'get',
          uid,
          type: 'user',
          sections: ['basic', 'professional'],
        });
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[get-user-info] Error: ${message}`);
        return {
          content: [{ type: 'text' as const, text: `Error: ${message}` }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'get-user-calendar',
    'Obtiene el calendario de un medico: horarios fijos, dinamicos, tipos de cita asociados y configuracion de sobre-agenda.',
    {
      uid: z.string().describe('UID del usuario/medico'),
    },
    async ({ uid }) => {
      try {
        const result = await doctocRequest('manageUserInfoAPI', {
          action: 'get',
          uid,
          type: 'user',
          sections: ['calendarInfo'],
        });
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[get-user-calendar] Error: ${message}`);
        return {
          content: [{ type: 'text' as const, text: `Error: ${message}` }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'get-appointment-types',
    'Obtiene los tipos de cita disponibles en la organizacion (Consulta, Procedimiento, Teleconsulta, etc.).',
    {},
    async () => {
      try {
        const result = await doctocRequest('manageUserInfoAPI', {
          action: 'get',
          sections: ['tipos'],
        });
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[get-appointment-types] Error: ${message}`);
        return {
          content: [{ type: 'text' as const, text: `Error: ${message}` }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'update-user-calendar',
    'Actualiza la configuracion de calendario de un medico: horarios fijos, dinamicos, tipos asociados y sobre-agenda.',
    {
      uid: z.string().describe('UID del usuario/medico'),
      calendarData: z
        .record(z.unknown())
        .describe('Objeto calendarInfo con la nueva configuracion de horarios'),
    },
    async ({ uid, calendarData }) => {
      try {
        const result = await doctocRequest('manageUserInfoAPI', {
          action: 'update',
          uid,
          type: 'user',
          data: { calendarInfo: calendarData },
        });
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[update-user-calendar] Error: ${message}`);
        return {
          content: [{ type: 'text' as const, text: `Error: ${message}` }],
          isError: true,
        };
      }
    },
  );
}
