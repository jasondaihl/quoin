import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { allComponents } from './components.js';
import { listTokens } from './tokens.js';

// MCP *resources*: the whole authoritative dataset as readable documents, so an agent
// can pull the full token/component picture into context in one read instead of many
// point tool-calls. Same generated source as the tools, so the two never disagree.

const jsonResource = (uri: URL, data: unknown) => ({
  contents: [
    { uri: uri.href, mimeType: 'application/json', text: `${JSON.stringify(data, null, 2)}\n` },
  ],
});

export function registerResources(server: McpServer): void {
  server.registerResource(
    'tokens',
    'quoin://tokens.json',
    {
      title: 'All design tokens',
      description:
        'Every quoin design token (path, CSS var, type, tier, resolved light/dark value, alias) as one JSON document.',
      mimeType: 'application/json',
    },
    async (uri) => jsonResource(uri, listTokens()),
  );

  server.registerResource(
    'components',
    'quoin://components.json',
    {
      title: 'All component APIs',
      description:
        'Every quoin component with its full normalized API (props, slots, events, CSS parts/props, and HTML + React usage) as one JSON document.',
      mimeType: 'application/json',
    },
    async (uri) => jsonResource(uri, allComponents()),
  );
}
