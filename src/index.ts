import { config } from './config.ts';
import { createServer } from './server.ts';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import http from 'node:http';
import { URL } from 'node:url';

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

// Store SSE transports by session ID
const sseTransports = new Map<string, SSEServerTransport>();

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

    const urlPath = (req.url ?? '').split('?')[0];

    // Health check
    if (urlPath === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', server: 'mcp-doctoc-carla', tools: 30 }));
      return;
    }

    // =========================================================================
    // STREAMABLE HTTP TRANSPORT — POST /mcp (protocol 2025-03-26)
    // =========================================================================
    if (urlPath === '/mcp') {
      if (req.method === 'POST') {
        try {
          const chunks: Buffer[] = [];
          for await (const chunk of req) {
            chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
          }
          const body = JSON.parse(Buffer.concat(chunks).toString());

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
          console.error('[mcp-doctoc-carla] Error Streamable HTTP:', err);
          if (!res.headersSent) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Error interno del servidor' }));
          }
        }
        return;
      }

      if (req.method === 'GET' || req.method === 'DELETE') {
        res.writeHead(405, { 'Content-Type': 'application/json', Allow: 'POST' });
        res.end(JSON.stringify({ error: 'Method not allowed. Use POST for MCP requests.' }));
        return;
      }
    }

    // =========================================================================
    // LEGACY SSE TRANSPORT — GET /sse + POST /messages (protocol 2024-11-05)
    // =========================================================================
    if (urlPath === '/sse' && req.method === 'GET') {
      console.error('[mcp-doctoc-carla] Nueva conexion SSE');
      try {
        const transport = new SSEServerTransport('/messages', res);
        sseTransports.set(transport.sessionId, transport);

        res.on('close', () => {
          console.error(`[mcp-doctoc-carla] SSE cerrado: ${transport.sessionId}`);
          sseTransports.delete(transport.sessionId);
        });

        const mcpServer = createServer();
        await mcpServer.connect(transport);
        await transport.start();
      } catch (err) {
        console.error('[mcp-doctoc-carla] Error SSE:', err);
        if (!res.headersSent) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Error SSE' }));
        }
      }
      return;
    }

    if (urlPath === '/messages' && req.method === 'POST') {
      try {
        const parsedUrl = new URL(req.url ?? '', `http://${req.headers.host}`);
        const sessionId = parsedUrl.searchParams.get('sessionId') ?? '';

        const transport = sseTransports.get(sessionId);
        if (!transport) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'No transport found for sessionId' }));
          return;
        }

        const chunks: Buffer[] = [];
        for await (const chunk of req) {
          chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
        }
        const body = JSON.parse(Buffer.concat(chunks).toString());

        await transport.handlePostMessage(req, res, body);
      } catch (err) {
        console.error('[mcp-doctoc-carla] Error /messages:', err);
        if (!res.headersSent) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Error procesando mensaje' }));
        }
      }
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'No encontrado. Usa POST /mcp, GET /sse, o GET /health' }));
  });

  httpServer.listen(config.port, () => {
    console.error(`[mcp-doctoc-carla] Servidor HTTP escuchando en puerto ${config.port}`);
    console.error(`[mcp-doctoc-carla] Streamable HTTP: http://localhost:${config.port}/mcp`);
    console.error(`[mcp-doctoc-carla] Legacy SSE:      http://localhost:${config.port}/sse`);
    console.error(`[mcp-doctoc-carla] Health check:     http://localhost:${config.port}/health`);
  });

  process.on('SIGINT', () => {
    console.error('[mcp-doctoc-carla] Apagando servidor...');
    for (const [sid, transport] of sseTransports) {
      transport.close();
      sseTransports.delete(sid);
    }
    httpServer.close();
    process.exit(0);
  });
}

main().catch((error) => {
  console.error('[mcp-doctoc-carla] Error fatal:', error);
  process.exit(1);
});
