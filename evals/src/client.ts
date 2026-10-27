import { createRequire } from 'node:module';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

// A thin wrapper around the Model Context Protocol client. It launches the *real*
// quoin MCP server (the same `dist/index.js` an AI assistant would run) as a child
// process and talks to it over stdio — so the eval grades the server exactly as a
// consumer sees it, not some re-implementation of its internals.

const require = createRequire(import.meta.url);

/** A single text answer a tool call came back with. */
export interface ToolResult {
  text: string;
  isError: boolean;
}

/** A tool the server advertises, shaped for the Anthropic Messages API. */
export interface ToolSpec {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
}

export interface QuoinMcp {
  /** The tools the server exposes, ready to hand to a model. */
  listTools(): Promise<ToolSpec[]>;
  callTool(name: string, args?: Record<string, unknown>): Promise<ToolResult>;
  close(): Promise<void>;
}

/**
 * Connect to the quoin MCP server over stdio. Requires the server to be built
 * (`pnpm --filter @jasondaihl/quoin-mcp build`); `pnpm eval` from the repo root
 * builds the packages first.
 */
export async function connect(): Promise<QuoinMcp> {
  // Resolve the built server entry from the workspace dependency, so this keeps
  // working no matter where the repo lives on disk.
  const serverEntry = require.resolve('@jasondaihl/quoin-mcp');

  const transport = new StdioClientTransport({
    command: process.execPath, // the current Node binary
    args: [serverEntry],
  });

  const client = new Client({ name: 'quoin-eval', version: '0.0.0' });
  await client.connect(transport);

  return {
    async listTools() {
      const { tools } = await client.listTools();
      return tools.map((t) => ({
        name: t.name,
        description: t.description ?? '',
        input_schema: t.inputSchema as Record<string, unknown>,
      }));
    },
    async callTool(name, args = {}) {
      const result = await client.callTool({ name, arguments: args });
      // The server always answers with a single text block (JSON or a message).
      const content = (result.content ?? []) as Array<{ type: string; text?: string }>;
      const text = content
        .filter((c) => c.type === 'text')
        .map((c) => c.text ?? '')
        .join('\n');
      return { text, isError: result.isError === true };
    },
    async close() {
      await client.close();
    },
  };
}
