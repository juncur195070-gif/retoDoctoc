import { metorial } from '@metorial/mcp-server-sdk';

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
      console.error('[metorial] Callback iniciado. Args recibidos:', JSON.stringify(Object.keys(args || {})));

      // 1. Inyectar credenciales ANTES de importar los modulos
      process.env.DOCTOC_API_TOKEN = args?.DOCTOC_API_TOKEN ?? '';
      process.env.DOCTOC_ORG_ID = args?.DOCTOC_ORG_ID ?? '';
      process.env.DOCTOC_API_URL =
        args?.DOCTOC_API_URL ?? 'https://us-central1-doctoc-platform.cloudfunctions.net';
      process.env.UNIPILE_DSN = args?.UNIPILE_DSN ?? '';
      process.env.UNIPILE_API_KEY = args?.UNIPILE_API_KEY ?? '';

      console.error('[metorial] Env vars seteadas. DOCTOC_API_URL:', process.env.DOCTOC_API_URL);

      // 2. Imports dinamicos DESPUES de setear env vars
      const { registerTelegramTools } = await import('./tools/telegram.ts');
      const { registerAppointmentTools } = await import('./tools/appointments.ts');
      const { registerPatientTools } = await import('./tools/patients.ts');
      const { registerUserTools } = await import('./tools/users.ts');
      const { registerOrganizationTools } = await import('./tools/organization.ts');
      const { registerPriceTools } = await import('./tools/prices.ts');
      const { registerPaymentTools } = await import('./tools/payments.ts');

      // 3. Registrar los 30 tools
      registerTelegramTools(server);
      registerAppointmentTools(server);
      registerPatientTools(server);
      registerUserTools(server);
      registerOrganizationTools(server);
      registerPriceTools(server);
      registerPaymentTools(server);

      console.error('[metorial] 30 tools registrados exitosamente');
    } catch (err) {
      console.error('[metorial] ERROR en callback:', err);
      throw err;
    }
  },
);
