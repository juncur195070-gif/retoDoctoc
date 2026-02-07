import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { doctocRequest } from '../utils/doctoc-client.js';

export function registerAppointmentTools(server: McpServer): void {
  server.tool(
    'create-appointment',
    'Crea una nueva cita medica. Requiere dayKey en formato DD-MM-YYYY, horarios en ISO 8601, y el ID del paciente y del medico.',
    {
      dayKey: z.string().describe('Dia de la cita en formato DD-MM-YYYY'),
      scheduledStart: z.string().describe('Hora de inicio en formato ISO 8601 (ej: 2026-02-07T10:00:00.000Z)'),
      scheduledEnd: z.string().describe('Hora de fin en formato ISO 8601'),
      patient: z.string().describe('ID del paciente'),
      userId: z.string().describe('UID del medico/usuario que atiende'),
      type: z.string().describe('Tipo de cita: Consulta, Teleconsulta, Procedimiento, etc.'),
      typeId: z.string().optional().describe('ID del tipo de cita'),
      motive: z.string().describe('Motivo de la cita'),
      status: z.string().optional().default('pending').describe('Estado: pending, confirmada, etc.'),
      locationId: z.string().optional().describe('ID de la sede'),
      category: z.string().optional().default('cita').describe('Categoria: cita'),
      personaEjecutante: z.string().optional().default('Administrador').describe('Persona que registra la cita'),
    },
    async (params) => {
      try {
        const result = await doctocRequest('manageQuotesAPI', {
          action: 'create',
          dayKey: params.dayKey,
          scheduledStart: params.scheduledStart,
          scheduledEnd: params.scheduledEnd,
          patient: params.patient,
          userId: params.userId,
          type: params.type,
          typeId: params.typeId ?? '',
          motive: params.motive,
          status: params.status,
          locationId: params.locationId ?? '',
          recipeID: '',
          category: params.category,
          personaEjecutante: params.personaEjecutante,
        });
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[create-appointment] Error: ${message}`);
        return {
          content: [{ type: 'text' as const, text: `Error: ${message}` }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'update-appointment',
    'Actualiza una cita existente. Si la cita cambia de dia, incluir oldDayKey con el dia original.',
    {
      quoteID: z.string().describe('ID de la cita a actualizar'),
      dayKey: z.string().describe('Nuevo dia de la cita en formato DD-MM-YYYY'),
      oldDayKey: z.string().optional().describe('Dia original si la cita cambia de dia (DD-MM-YYYY)'),
      scheduledStart: z.string().describe('Nueva hora de inicio en ISO 8601'),
      scheduledEnd: z.string().describe('Nueva hora de fin en ISO 8601'),
      patient: z.string().describe('ID del paciente'),
      userId: z.string().describe('UID del medico'),
      type: z.string().describe('Tipo de cita'),
      typeId: z.string().optional().describe('ID del tipo de cita'),
      motive: z.string().describe('Motivo de la cita'),
      status: z.string().optional().default('pending').describe('Estado de la cita'),
      locationId: z.string().optional().describe('ID de la sede'),
      category: z.string().optional().default('cita').describe('Categoria'),
      personaEjecutante: z.string().optional().default('Administrador').describe('Persona que actualiza'),
    },
    async (params) => {
      try {
        const body: Record<string, unknown> = {
          action: 'update',
          quoteID: params.quoteID,
          dayKey: params.dayKey,
          scheduledStart: params.scheduledStart,
          scheduledEnd: params.scheduledEnd,
          patient: params.patient,
          userId: params.userId,
          type: params.type,
          typeId: params.typeId ?? '',
          motive: params.motive,
          status: params.status,
          locationId: params.locationId ?? '',
          recipeID: '',
          category: params.category,
          personaEjecutante: params.personaEjecutante,
        };
        if (params.oldDayKey) body.oldDayKey = params.oldDayKey;

        const result = await doctocRequest('manageQuotesAPI', body);
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[update-appointment] Error: ${message}`);
        return {
          content: [{ type: 'text' as const, text: `Error: ${message}` }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'cancel-appointment',
    'Cancela una cita existente. Registra la cancelacion en el historial de la cita.',
    {
      dayKey: z.string().describe('Dia de la cita en formato DD-MM-YYYY'),
      quoteID: z.string().describe('ID de la cita a cancelar'),
      userId: z.string().describe('UID del medico asociado'),
      cancelReason: z.string().optional().describe('Razon de la cancelacion'),
      personaEjecutante: z.string().optional().default('Administrador').describe('Persona que cancela'),
    },
    async (params) => {
      try {
        const result = await doctocRequest('manageQuotesAPI', {
          action: 'cancel',
          dayKey: params.dayKey,
          quoteID: params.quoteID,
          userId: params.userId,
          cancelReason: params.cancelReason ?? '',
          personaEjecutante: params.personaEjecutante,
        });
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[cancel-appointment] Error: ${message}`);
        return {
          content: [{ type: 'text' as const, text: `Error: ${message}` }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'get-patient-appointments',
    'Obtiene todas las citas de un paciente especifico.',
    {
      patientID: z.string().describe('ID del paciente'),
    },
    async ({ patientID }) => {
      try {
        const result = await doctocRequest('getPatientQuoteAPI', { patientID });
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[get-patient-appointments] Error: ${message}`);
        return {
          content: [{ type: 'text' as const, text: `Error: ${message}` }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'get-day-appointments',
    'Obtiene todas las citas programadas para un dia especifico.',
    {
      dayKey: z.string().describe('Dia en formato DD-MM-YYYY'),
    },
    async ({ dayKey }) => {
      try {
        const result = await doctocRequest('getDayQuotesAPI', { dayKey });
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[get-day-appointments] Error: ${message}`);
        return {
          content: [{ type: 'text' as const, text: `Error: ${message}` }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'get-appointment-by-id',
    'Obtiene una cita especifica por su ID y dia.',
    {
      dayKey: z.string().describe('Dia de la cita en formato DD-MM-YYYY'),
      citaID: z.string().describe('ID de la cita'),
    },
    async ({ dayKey, citaID }) => {
      try {
        const result = await doctocRequest('getDayQuotesAPI', { dayKey, citaID });
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[get-appointment-by-id] Error: ${message}`);
        return {
          content: [{ type: 'text' as const, text: `Error: ${message}` }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'get-user-day-appointments',
    'Obtiene las citas de un medico/usuario en un dia especifico.',
    {
      dayKey: z.string().describe('Dia en formato DD-MM-YYYY'),
      userId: z.string().describe('UID del medico/usuario'),
    },
    async ({ dayKey, userId }) => {
      try {
        const result = await doctocRequest('getDayQuotesAPI', { dayKey, userId });
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[get-user-day-appointments] Error: ${message}`);
        return {
          content: [{ type: 'text' as const, text: `Error: ${message}` }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'get-busy-slots',
    'Obtiene los rangos de tiempo ocupados de un medico en un dia. Retorna un array de { start, end } con los slots donde ya hay citas. Util para encontrar horarios disponibles.',
    {
      dayKey: z.string().describe('Dia en formato DD-MM-YYYY'),
      userId: z.string().optional().describe('UID del medico (opcional, sin el retorna todos)'),
    },
    async ({ dayKey, userId }) => {
      try {
        const body: Record<string, unknown> = {
          dayKey,
          format: 'busy_ranges',
        };
        if (userId) body.userId = userId;

        const result = await doctocRequest('getDayQuotesAPI', body);
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[get-busy-slots] Error: ${message}`);
        return {
          content: [{ type: 'text' as const, text: `Error: ${message}` }],
          isError: true,
        };
      }
    },
  );
}
