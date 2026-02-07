import { metorial, z } from '@metorial/mcp-server-sdk';

// TEST MINIMO: 1 solo tool, sin imports externos, para diagnosticar Metorial
metorial.createServer(
  {
    name: 'mcp-doctoc-carla',
    version: '1.0.0',
  },
  async (server) => {
    server.tool(
      'ping',
      'Responde pong. Tool de prueba para verificar que el servidor funciona.',
      { message: z.string().optional().default('pong') },
      async ({ message }: { message: string }) => ({
        content: [{ type: 'text' as const, text: message }],
      }),
    );
  },
);
