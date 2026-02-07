import type { McpServer } from '@metorial/mcp-server-sdk';
import { z } from '@metorial/mcp-server-sdk';
import { doctocRequest } from '../utils/doctoc-client.ts';

export function registerPatientTools(server: McpServer): void {
  server.tool(
    'get-all-patients',
    'Lista todos los pacientes de la organizacion con paginacion. Para buscar un paciente especifico, usa search-patients en su lugar.',
    {
      limit: z.number().optional().default(50).describe('Maximo de pacientes a retornar (default 50)'),
      startAfter: z.string().optional().describe('ID del ultimo paciente de la pagina anterior para paginacion'),
    },
    async ({ limit, startAfter }) => {
      try {
        const body: Record<string, unknown> = { action: 'getAll', limit };
        if (startAfter) body.startFrom = startAfter;

        const result = await doctocRequest('managePatientsAPI', body);
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[get-all-patients] Error: ${message}`);
        return {
          content: [{ type: 'text' as const, text: `Error: ${message}` }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'search-patients',
    'Busca pacientes por nombre, DNI, telefono, ID u otro tipo de documento. Retorna coincidencias parciales.',
    {
      type: z
        .enum(['nombre', 'dni', 'telefono', 'id', 'pasaporte', 'cedula_identidad', 'carnet_extranjeria'])
        .describe('Tipo de busqueda: nombre, dni, telefono, id, pasaporte, cedula_identidad, carnet_extranjeria'),
      text: z.string().describe('Texto a buscar'),
      limit: z.number().optional().default(10).describe('Maximo de resultados (default 10)'),
    },
    async ({ type, text, limit }) => {
      try {
        const result = await doctocRequest('managePatientsAPI', {
          action: 'search',
          type,
          text,
          limit,
        });
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[search-patients] Error: ${message}`);
        return {
          content: [{ type: 'text' as const, text: `Error: ${message}` }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'create-patient',
    'Crea un nuevo paciente en la organizacion.',
    {
      names: z.string().describe('Nombres del paciente'),
      surnames: z.string().describe('Apellidos del paciente'),
      dni: z.string().describe('Numero de documento de identidad'),
      birth_date: z.string().describe('Fecha de nacimiento en formato YYYY-MM-DD'),
      gender: z.string().describe('Genero: Masculino o Femenino'),
      phone: z.string().optional().describe('Telefono con codigo de pais (ej: +51999111222)'),
      mail: z.string().optional().describe('Correo electronico'),
    },
    async (params) => {
      try {
        const result = await doctocRequest('managePatientsAPI', {
          action: 'create',
          ...params,
        });
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[create-patient] Error: ${message}`);
        return {
          content: [{ type: 'text' as const, text: `Error: ${message}` }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'update-patient',
    'Actualiza los datos de un paciente existente. Solo envia los campos que quieras actualizar.',
    {
      patient_id: z.string().describe('ID del paciente a actualizar'),
      names: z.string().optional().describe('Nuevos nombres'),
      surnames: z.string().optional().describe('Nuevos apellidos'),
      phone: z.string().optional().describe('Nuevo telefono'),
      mail: z.string().optional().describe('Nuevo correo'),
      birth_date: z.string().optional().describe('Nueva fecha de nacimiento (YYYY-MM-DD)'),
      gender: z.string().optional().describe('Nuevo genero'),
    },
    async (params) => {
      try {
        const body: Record<string, unknown> = {
          action: 'update',
          patient_id: params.patient_id,
        };
        if (params.names) body.names = params.names;
        if (params.surnames) body.surnames = params.surnames;
        if (params.phone) body.phone = params.phone;
        if (params.mail) body.mail = params.mail;
        if (params.birth_date) body.birth_date = params.birth_date;
        if (params.gender) body.gender = params.gender;

        const result = await doctocRequest('managePatientsAPI', body);
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[update-patient] Error: ${message}`);
        return {
          content: [{ type: 'text' as const, text: `Error: ${message}` }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'delete-patient',
    'Marca un paciente como deshabilitado (soft delete). No elimina los datos permanentemente.',
    {
      patient_id: z.string().describe('ID del paciente a deshabilitar'),
    },
    async ({ patient_id }) => {
      try {
        const result = await doctocRequest('managePatientsAPI', {
          action: 'delete',
          patient_id,
        });
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[delete-patient] Error: ${message}`);
        return {
          content: [{ type: 'text' as const, text: `Error: ${message}` }],
          isError: true,
        };
      }
    },
  );
}
