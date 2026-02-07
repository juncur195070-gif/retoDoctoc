import { metorial, z } from '@metorial/mcp-server-sdk';

metorial.createServer(
  {
    name: 'mcp-doctoc-carla',
    version: '1.0.0',
  },
  async (server) => {
    server.tool(
      'hello-doctoc',
      'Test tool - says hello',
      {
        name: z.string().optional().describe('Nombre para saludar'),
      },
      async ({ name }) => ({
        content: [{ type: 'text' as const, text: `Hola ${name || 'mundo'} desde Doctoc MCP!` }],
      }),
    );
  },
);