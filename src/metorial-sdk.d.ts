declare module '@metorial/mcp-server-sdk' {
  // Re-exports from @modelcontextprotocol/sdk
  export { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
  export * from '@modelcontextprotocol/sdk/server/mcp.js';

  // Re-exports from zod
  export { z } from 'zod';
  export * from 'zod';

  interface ServerOptions {
    name: string;
    version: string;
  }

  export const metorial: {
    createServer: <T = unknown>(
      options: ServerOptions,
      callback: (server: McpServer, args: T) => Promise<void>,
    ) => void;
  };
}
