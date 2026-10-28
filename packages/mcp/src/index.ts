import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { getComponent, listComponents } from './components.js';
import { registerPrompts } from './prompts.js';
import { registerResources } from './resources.js';
import { getToken, listTokens, searchTokens, tokenGroups } from './tokens.js';
import { checkComponent, checkToken } from './validate.js';

// quoin MCP server: exposes the design system's tokens and component APIs to an
// AI assistant over stdio, reading the generated @jasondaihl/quoin-tokens and @jasondaihl/quoin-core
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
      'Handy for "which token is oklch(0.5106 0.2301 276.97)" or finding every accent color.',
    inputSchema: {
      query: z.string().describe('Substring to match, e.g. an oklch value or "accent"'),
    },
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

// --- Validation tool -----------------------------------------------------------------

server.registerTool(
  'check_usage',
  {
    title: 'Validate token or component usage',
    description:
      'Check whether a token path, or a component (optionally a specific prop/attribute), ' +
      'is valid before you use it. Returns valid:true with the resolved entry, or ' +
      'valid:false with the nearest real suggestions — so you can self-correct instead of ' +
      'emitting a wrong CSS var or an unsupported prop. Pass `token`, or `component` ' +
      '(optionally with `prop`).',
    inputSchema: {
      token: z
        .string()
        .optional()
        .describe('Dotted token path to validate, e.g. color.accent.default'),
      component: z
        .string()
        .optional()
        .describe('Component tag, React name, or bare name, e.g. Button'),
      prop: z
        .string()
        .optional()
        .describe('With `component`: a prop or attribute name to check on it'),
    },
  },
  async ({ token, component, prop }) => {
    if (token !== undefined) return json(checkToken(token));
    if (component !== undefined) return json(checkComponent(component, prop));
    return notFound('check_usage needs a `token` or a `component` argument.');
  },
);

// --- Resources & prompts -------------------------------------------------------------

registerResources(server);
registerPrompts(server);

// --- Connect over stdio --------------------------------------------------------------

const transport = new StdioServerTransport();
await server.connect(transport);
