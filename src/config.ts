export interface Config {
  doctocApiUrl: string;
  doctocApiToken: string;
  doctocOrgId: string;
  unipileDsn: string;
  unipileApiKey: string;
  transport: 'stdio' | 'http';
  port: number;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`[mcp-doctoc-carla] ADVERTENCIA: Variable de entorno no encontrada: ${name}`);
    return '';
  }
  return value;
}

export function loadConfig(): Config {
  return {
    doctocApiUrl:
      process.env.DOCTOC_API_URL ??
      'https://us-central1-doctoc-platform.cloudfunctions.net',
    doctocApiToken: requireEnv('DOCTOC_API_TOKEN'),
    doctocOrgId: requireEnv('DOCTOC_ORG_ID'),
    unipileDsn: requireEnv('UNIPILE_DSN'),
    unipileApiKey: requireEnv('UNIPILE_API_KEY'),
    transport: process.env.TRANSPORT === 'http' ? 'http' : 'stdio',
    port: parseInt(process.env.PORT ?? '3000', 10),
  };
}

export const config = loadConfig();
