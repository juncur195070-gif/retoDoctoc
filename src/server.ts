import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTelegramTools } from './tools/telegram.js';
import { registerAppointmentTools } from './tools/appointments.js';
import { registerPatientTools } from './tools/patients.js';
import { registerUserTools } from './tools/users.js';
import { registerOrganizationTools } from './tools/organization.js';
import { registerPriceTools } from './tools/prices.js';
import { registerPaymentTools } from './tools/payments.js';

export function createServer(): McpServer {
  const server = new McpServer({
    name: 'mcp-doctoc-carla',
    version: '1.0.0',
  });

  registerTelegramTools(server);       // 3 tools
  registerAppointmentTools(server);    // 8 tools
  registerPatientTools(server);        // 5 tools
  registerUserTools(server);           // 4 tools
  registerOrganizationTools(server);   // 4 tools
  registerPriceTools(server);          // 3 tools
  registerPaymentTools(server);        // 3 tools

  console.error('[mcp-doctoc-carla] Servidor creado con 30 tools registrados.');
  return server;
}
