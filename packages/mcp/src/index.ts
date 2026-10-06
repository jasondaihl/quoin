import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { getComponent, listComponents } from './components.js';
import { getToken, listTokens, searchTokens, tokenGroups } from './tokens.js';

// quoin MCP server: exposes the design system's tokens and component APIs to an
// AI assistant over stdio, reading the generated @quoin/tokens and @quoin/core
// manifests so the answers never drift from the source.

const server = new McpServer({ name: 'quoin', version: '0.0.0' });

const json = (data: unknown) => ({
  content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
});

const notFound = (message: string) => ({
  content: [{ type: 'text' as const, text: message }],
  isError: true,
});

// --- Token tools ---------------------------------------------------------------------

server.registerTool(
  'list_tokens',
  {
    title: 'List design tokens',
    description:
      'List quoin design tokens (path, CSS var, type, tier, resolved value). ' +
      'Optionally filter by tier ("semantic" | "primitive") and/or top-level group ' +
      '(e.g. "color", "space", "radius", "palette", "font-size").',
    inputSchema: {
      tier: z.enum(['semantic', 'primitive']).optional(),
      group: z.string().optional(),
    },
  },
  async ({ tier, group }) => json(listTokens({ tier, group })),
);

server.registerTool(
  'get_token',
  {
    title: 'Get a design token',
    description:
      'Resolve one token by its exact dotted path (e.g. "color.accent.default"). ' +
      'Returns its CSS var, type, light value, dark value (for themed roles), and ' +
      'the authored alias reference.',
    inputSchema: { path: z.string().describe('Dotted token path, e.g. color.accent.default') },
  },
  async ({ path }) => {
    const token = getToken(path);
    if (!token) {
      return notFound(
        `No token at "${path}". Use list_tokens or search_tokens to find valid paths. ` +
          `Groups: ${tokenGroups().join(', ')}.`,
      );
    }
    return json(token);
  },
);

server.registerTool(
  'search_tokens',
  {
    title: 'Search design tokens',
    description:
      'Case-insensitive substring search across token path, CSS var, and value. ' +
      'Handy for "which token is #4f46e5" or finding every accent color.',
    inputSchema: { query: z.string().describe('Substring to match, e.g. a hex value or "accent"') },
  },
  async ({ query }) => json(searchTokens(query)),
);

// --- Component tools -----------------------------------------------------------------

server.registerTool(
  'list_components',
  {
    title: 'List components',
    description:
      'List every quoin component with its custom-element tag, React wrapper name, ' +
      'and a one-line summary.',
    inputSchema: {},
  },
  async () => json(listComponents()),
);

server.registerTool(
  'get_component',
  {
    title: 'Get a component API',
    description:
      'Full API for one component by tag ("quoin-button"), React name ("Button"), or ' +
      'bare name ("button"): props (type, default, attribute, reflects, description), ' +
      'slots, events, CSS parts/custom properties, and ready-to-paste HTML + React usage.',
    inputSchema: {
      name: z.string().describe('Component tag, React name, or bare name (e.g. Button)'),
    },
  },
  async ({ name }) => {
    const component = getComponent(name);
    if (!component) {
      const tags = listComponents()
        .map((c) => c.tag)
        .join(', ');
      return notFound(`No component "${name}". Available: ${tags}.`);
    }
    return json(component);
  },
);

// --- Connect over stdio --------------------------------------------------------------

const transport = new StdioServerTransport();
await server.connect(transport);
