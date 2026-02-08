import { metorial } from '@metorial/mcp-server-sdk';
import { setConfig } from './config.ts';
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
    try {
      setConfig({
        doctocApiUrl:
          args?.DOCTOC_API_URL || 'https://us-central1-doctoc-platform.cloudfunctions.net',
        doctocApiToken: args?.DOCTOC_API_TOKEN || '',
        doctocOrgId: args?.DOCTOC_ORG_ID || '',
        unipileDsn: args?.UNIPILE_DSN || '',
        unipileApiKey: args?.UNIPILE_API_KEY || '',
        transport: 'stdio',
        port: 3000,
      });

      registerTelegramTools(server);
      registerAppointmentTools(server);
      registerPatientTools(server);
      registerUserTools(server);
      registerOrganizationTools(server);
      registerPriceTools(server);
      registerPaymentTools(server);

      console.error('[mcp-doctoc-carla] 30 tools registrados en Metorial.');
    } catch (err) {
      console.error('[mcp-doctoc-carla] Error en callback:', err);
      throw err;
    }
  },
);
