import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTelegramTools } from './tools/telegram.ts';
import { registerAppointmentTools } from './tools/appointments.ts';
import { registerPatientTools } from './tools/patients.ts';
import { registerUserTools } from './tools/users.ts';
import { registerOrganizationTools } from './tools/organization.ts';
import { registerPriceTools } from './tools/prices.ts';
import { registerPaymentTools } from './tools/payments.ts';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new McpServer({
  name: 'mcp-doctoc-carla',
  version: '1.0.0',
});

registerTelegramTools(server);
registerAppointmentTools(server);
registerPatientTools(server);
registerUserTools(server);
registerOrganizationTools(server);
registerPriceTools(server);
registerPaymentTools(server);

const transport = new StdioServerTransport();
await server.connect(transport);

export default server;
