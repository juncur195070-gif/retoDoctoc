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
    // 1. Importar setConfig y inyectar credenciales SIN usar process.env
    const { setConfig } = await import('./config.ts');

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

    // 2. Imports dinamicos DESPUES de setear config
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
  },
);
