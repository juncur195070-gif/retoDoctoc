import { metorial } from '@metorial/mcp-server-sdk';
import { registerTelegramTools } from './tools/telegram.ts';
import { registerAppointmentTools } from './tools/appointments.ts';
import { registerPatientTools } from './tools/patients.ts';
import { registerUserTools } from './tools/users.ts';
import { registerOrganizationTools } from './tools/organization.ts';
import { registerPriceTools } from './tools/prices.ts';
import { registerPaymentTools } from './tools/payments.ts';

metorial.createServer(
  {
    name: 'mcp-doctoc-carla',
    version: '1.0.0',
  },
  async (server) => {
    registerTelegramTools(server);
    registerAppointmentTools(server);
    registerPatientTools(server);
    registerUserTools(server);
    registerOrganizationTools(server);
    registerPriceTools(server);
    registerPaymentTools(server);
  },
);
