import { metorial } from '@metorial/mcp-server-sdk';
import { registerTelegramTools } from './tools/telegram.ts';
import { registerAppointmentTools } from './tools/appointments.ts';
import { registerPatientTools } from './tools/patients.ts';
import { registerUserTools } from './tools/users.ts';
import { registerOrganizationTools } from './tools/organization.ts';
import { registerPriceTools } from './tools/prices.ts';
import { registerPaymentTools } from './tools/payments.ts';

interface MetorialConfig {
  DOCTOC_API_TOKEN: string;
  DOCTOC_ORG_ID: string;
  DOCTOC_API_URL: string;
  UNIPILE_DSN: string;
  UNIPILE_API_KEY: string;
}

metorial.createServer<MetorialConfig>(
  {
    name: 'mcp-doctoc-carla',
    version: '1.0.0',
  },
  async (server, args) => {
    // Inyectar las propiedades de Metorial como variables de entorno
    // para que config.ts y los clientes HTTP las lean correctamente
    process.env.DOCTOC_API_TOKEN = args.DOCTOC_API_TOKEN;
    process.env.DOCTOC_ORG_ID = args.DOCTOC_ORG_ID;
    process.env.DOCTOC_API_URL = args.DOCTOC_API_URL;
    process.env.UNIPILE_DSN = args.UNIPILE_DSN;
    process.env.UNIPILE_API_KEY = args.UNIPILE_API_KEY;

    registerTelegramTools(server);
    registerAppointmentTools(server);
    registerPatientTools(server);
    registerUserTools(server);
    registerOrganizationTools(server);
    registerPriceTools(server);
    registerPaymentTools(server);
  },
);
