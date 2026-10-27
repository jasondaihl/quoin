import type { QuoinMcp } from './client.js';

// ---------------------------------------------------------------------------
// The "system under test".
//
// An eval grades whatever turns a task into an answer. Here that is a tiny,
// rule-based planner: it reads a natural-language task, picks ONE quoin MCP
// tool to call, calls it on the real server, and hands back the answer.
//
// It stands in for the thing you would really ship this against — a Claude
// model wired up to the quoin MCP server, deciding for itself which tool to
// call. Swapping it out is a one-function change (see README.md "Point it at a
// real model"): return the same AgentOutput shape and the dataset, graders and
// runner below are unchanged.
//
// Deliberately kept simple and general — it is NOT tuned to pass the dataset.
// One case in dataset.ts exposes a heuristic it gets "wrong", so the score is
// honestly below 100%.
// ---------------------------------------------------------------------------

export interface AgentOutput {
  task: string;
  /** Which MCP tool the agent decided to call. */
  tool: string;
  /** The arguments it called the tool with. */
  args: Record<string, unknown>;
  /** The server's text answer (JSON or a not-found message). */
  text: string;
  isError: boolean;
}

interface Plan {
  tool: string;
  args: Record<string, unknown>;
}

// The semantic/primitive token groups quoin exposes (the top-level path segment).
const GROUPS = [
  'color',
  'space',
  'radius',
  'shadow',
  'palette',
  'font-size',
  'font-weight',
  'font-family',
  'line-height',
  'border-width',
];

// The components, by the names a person might type.
const COMPONENTS = ['button', 'input', 'icon', 'stack'];

// Words too generic to make a useful token search query.
const STOPWORDS = new Set([
  'the',
  'a',
  'an',
  'of',
  'and',
  'or',
  'is',
  'are',
  'to',
  'in',
  'on',
  'for',
  'its',
  'it',
  'what',
  'which',
  'does',
  'do',
  'how',
  'me',
  'my',
  'i',
  'use',
  'uses',
  'give',
  'show',
  'get',
  'tell',
  'need',
  'want',
  'quoin',
  'design',
  'system',
  'token',
  'tokens',
  'value',
  'exact',
  'please',
  'can',
  'you',
  'that',
  'this',
  'with',
  'about',
  'there',
  'they',
  'offer',
  'provide',
  'provides',
  'support',
  'supports',
  'have',
  'has',
]);

/** Decide which single MCP tool answers this task, and with what arguments. */
export function plan(task: string): Plan {
  const lower = task.toLowerCase();

  // 1. An explicit oklch(...) value → reverse-lookup which token it is.
  const oklch = task.match(/oklch\([^)]*\)/i);
  if (oklch) return { tool: 'search_tokens', args: { query: oklch[0] } };

  // 2. An explicit dotted token path (color.accent.default, space.5) → resolve it.
  const path = lower.match(/\b[a-z]+(?:\.[a-z0-9-]+)+\b/);
  if (path) return { tool: 'get_token', args: { path: path[0] } };

  const listVerb = /\b(list|every|all|each)\b/.test(lower);

  // 3. Component questions.
  const component = COMPONENTS.find((c) => new RegExp(`\\b${c}s?\\b`).test(lower));
  if (lower.includes('component') || component) {
    if (component) return { tool: 'get_component', args: { name: component } };
    return { tool: 'list_components', args: {} };
  }

  // 4. Enumerate a token group ("list all the radii") → list_tokens.
  const group = GROUPS.find((g) => lower.includes(g));
  if (group && listVerb) return { tool: 'list_tokens', args: { group } };

  // 5. Fallback: substring-search tokens for the most salient word in the task.
  return { tool: 'search_tokens', args: { query: salientWord(lower) } };
}

/** The longest non-stopword in the task — a crude but serviceable search term. */
function salientWord(lower: string): string {
  const words = lower
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !STOPWORDS.has(w));
  words.sort((a, b) => b.length - a.length);
  return words[0] ?? lower.trim();
}

/** Run a task end to end: plan a tool call, execute it on the server, return the answer. */
export async function answer(mcp: QuoinMcp, task: string): Promise<AgentOutput> {
  const { tool, args } = plan(task);
  const result = await mcp.callTool(tool, args);
  return { task, tool, args, text: result.text, isError: result.isError };
}
