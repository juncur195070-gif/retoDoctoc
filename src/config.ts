export interface Config {
  doctocApiUrl: string;
  doctocApiToken: string;
  doctocOrgId: string;
  unipileDsn: string;
  unipileApiKey: string;
  transport: 'stdio' | 'http';
  port: number;
}

function getEnv(name: string): string {
  try {
    return (typeof process !== 'undefined' && process.env?.[name]) || '';
  } catch {
    return '';
  }
}

export function loadConfig(): Config {
  return {
    doctocApiUrl:
      getEnv('DOCTOC_API_URL') ||
      'https://us-central1-doctoc-platform.cloudfunctions.net',
    doctocApiToken: getEnv('DOCTOC_API_TOKEN'),
    doctocOrgId: getEnv('DOCTOC_ORG_ID'),
    unipileDsn: getEnv('UNIPILE_DSN'),
    unipileApiKey: getEnv('UNIPILE_API_KEY'),
    transport: getEnv('TRANSPORT') === 'http' ? 'http' : 'stdio',
    port: parseInt(getEnv('PORT') || '3000', 10),
  };
}

let _config: Config | null = null;

export function setConfig(cfg: Config): void {
  _config = cfg;
}

export function getConfig(): Config {
  if (!_config) {
    _config = loadConfig();
  }
  return _config;
}

// Proxy lazy: no llama loadConfig() hasta que se accede a una propiedad
export const config = new Proxy({} as Config, {
  get(_target, prop: string) {
    return getConfig()[prop as keyof Config];
  },
});
