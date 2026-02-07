declare module '@metorial/mcp-server-sdk' {
  import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

  interface ServerOptions {
    name: string;
    version: string;
  }

  export const metorial: {
    createServer: (
      options: ServerOptions,
      callback: (server: McpServer, args?: unknown) => Promise<void>,
    ) => void;
  };
}
