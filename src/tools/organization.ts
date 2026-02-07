import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { doctocRequest } from '../utils/doctoc-client.js';

export function registerOrganizationTools(server: McpServer): void {
  server.tool(
    'get-org-basic-info',
    'Obtiene la informacion basica de la organizacion: nombre, razon social, RUC, descripcion, web, imagen y redes sociales.',
    {},
    async () => {
      try {
        const result = await doctocRequest('getOrgInfoAPI', {
          sections: ['basic'],
        });
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[get-org-basic-info] Error: ${message}`);
        return {
          content: [{ type: 'text' as const, text: `Error: ${message}` }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'get-org-locations',
    'Obtiene la lista de sedes de la organizacion con nombre, direccion, coordenadas, telefono y correo.',
    {},
    async () => {
      try {
        const result = await doctocRequest('getOrgInfoAPI', {
          sections: ['sedes'],
        });
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[get-org-locations] Error: ${message}`);
        return {
          content: [{ type: 'text' as const, text: `Error: ${message}` }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'get-org-specialties',
    'Obtiene las especialidades medicas ofrecidas por la organizacion con nombre, foto y descripcion.',
    {},
    async () => {
      try {
        const result = await doctocRequest('getOrgInfoAPI', {
          sections: ['specialties'],
        });
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[get-org-specialties] Error: ${message}`);
        return {
          content: [{ type: 'text' as const, text: `Error: ${message}` }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'get-org-users',
    'Obtiene la lista de todos los usuarios (medicos, staff) de la organizacion con uid, nombre, rol, especialidad y foto.',
    {},
    async () => {
      try {
        const result = await doctocRequest('getOrgInfoAPI', {
          sections: ['users'],
        });
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[get-org-users] Error: ${message}`);
        return {
          content: [{ type: 'text' as const, text: `Error: ${message}` }],
          isError: true,
        };
      }
    },
  );
}
