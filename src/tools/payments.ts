import type { McpServer } from '@metorial/mcp-server-sdk';
import { z } from '@metorial/mcp-server-sdk';
import { doctocRequest } from '../utils/doctoc-client.ts';

export function registerPaymentTools(server: McpServer): void {
  server.tool(
    'create-payment',
    'Crea un nuevo pago o recibo. Incluye los items cobrados (campos) y los metodos de pago utilizados (pagos).',
    {
      patient: z.string().describe('ID del paciente'),
      medico: z.string().optional().describe('ID del medico asociado al pago'),
      motive: z.string().describe('Motivo del pago (ej: Consulta general)'),
      time: z.string().describe('Fecha del pago en formato YYYY-MM-DD'),
      descuento: z.number().optional().describe('Porcentaje de descuento'),
      igv: z.number().optional().describe('Porcentaje de IGV/impuesto'),
      moneda: z.string().optional().default('Soles').describe('Moneda: Soles o Dolares'),
      campos: z
        .array(
          z.object({
            name: z.string().describe('Nombre del servicio/item'),
            quantity: z.number().describe('Cantidad'),
            price: z.number().describe('Precio unitario'),
            subTotal: z.number().describe('Subtotal (quantity * price)'),
          }),
        )
        .describe('Lista de items cobrados con nombre, cantidad, precio y subtotal'),
      pagos: z
        .array(
          z.object({
            method: z.string().describe('Metodo de pago: Efectivo, Tarjeta, Transferencia'),
            amount: z.string().describe('Monto pagado'),
            moneda: z.string().describe('Moneda del pago'),
          }),
        )
        .describe('Lista de pagos realizados con metodo, monto y moneda'),
      person: z.string().describe('ID o nombre de la persona que registra el pago'),
      sedeID: z.string().optional().default('').describe('ID de la sede'),
      status: z.string().optional().default('completado').describe('Estado: completado o pendiente'),
    },
    async (params) => {
      try {
        const result = await doctocRequest('managePaymentAPI', {
          action: 'create',
          paymentData: {
            patient: params.patient,
            medico: params.medico ?? '',
            motive: params.motive,
            time: params.time,
            descuento: params.descuento ?? 0,
            igv: params.igv ?? 0,
            moneda: params.moneda,
            campos: params.campos,
            pagos: params.pagos,
            person: params.person,
            sedeID: params.sedeID,
            status: params.status,
          },
        });
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[create-payment] Error: ${message}`);
        return {
          content: [{ type: 'text' as const, text: `Error: ${message}` }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'get-patient-payments',
    'Obtiene todos los pagos de un paciente con total, monto pendiente y detalle de cada pago.',
    {
      patientID: z.string().describe('ID del paciente'),
    },
    async ({ patientID }) => {
      try {
        const result = await doctocRequest('getPatientPaymentsAPI', { patientID });
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[get-patient-payments] Error: ${message}`);
        return {
          content: [{ type: 'text' as const, text: `Error: ${message}` }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    'get-day-payments',
    'Obtiene todos los pagos registrados en un dia especifico.',
    {
      date: z.string().describe('Fecha en formato YYYY-MM-DD'),
    },
    async ({ date }) => {
      try {
        const result = await doctocRequest('getDayPaymentsAPI', { date });
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[get-day-payments] Error: ${message}`);
        return {
          content: [{ type: 'text' as const, text: `Error: ${message}` }],
          isError: true,
        };
      }
    },
  );
}
