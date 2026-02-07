import { config } from './config.js';
import { createServer } from './server.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import http from 'node:http';

async function main() {
  if (config.transport === 'http') {
    await startHttpTransport();
  } else {
    await startStdioTransport();
  }
}

async function startStdioTransport() {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('[mcp-doctoc-carla] Ejecutando en transporte stdio.');
}

async function startHttpTransport() {
  const httpServer = http.createServer(async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, mcp-session-id');
    res.setHeader('Access-Control-Expose-Headers', 'mcp-session-id');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    // Health check
    if (req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', server: 'mcp-doctoc-carla', tools: 30 }));
      return;
    }

    // MCP endpoint
    if (req.url === '/mcp' && req.method === 'POST') {
      try {
        const chunks: Buffer[] = [];
        for await (const chunk of req) {
          chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
        }
        const body = JSON.parse(Buffer.concat(chunks).toString());

        // Stateless: nuevo transport y server por cada request
        const transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: undefined,
          enableJsonResponse: true,
        });

        res.on('close', () => {
          transport.close();
        });

        const mcpServer = createServer();
        await mcpServer.connect(transport);
        await transport.handleRequest(req, res, body);
      } catch (err) {
        console.error('[mcp-doctoc-carla] Error HTTP:', err);
        if (!res.headersSent) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Error interno del servidor' }));
        }
      }
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'No encontrado. Usa POST /mcp o GET /health' }));
  });

  httpServer.listen(config.port, () => {
    console.error(`[mcp-doctoc-carla] Servidor HTTP escuchando en puerto ${config.port}`);
    console.error(`[mcp-doctoc-carla] MCP endpoint: http://localhost:${config.port}/mcp`);
    console.error(`[mcp-doctoc-carla] Health check: http://localhost:${config.port}/health`);
  });

  process.on('SIGINT', () => {
    console.error('[mcp-doctoc-carla] Apagando servidor...');
    httpServer.close();
    process.exit(0);
  });
}

main().catch((error) => {
  console.error('[mcp-doctoc-carla] Error fatal:', error);
  process.exit(1);
});
