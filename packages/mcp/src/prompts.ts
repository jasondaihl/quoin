import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

// MCP *prompts*: the guardrail knowledge the `.claude/skills` recipes encode, handed to
// any MCP client as guided, parameterized workflows. The read tools tell an agent what
// exists; these tell it how to add to the system correctly (semantic tokens only, the
// web-component → React-wrapper path, the contrast rule) — so the agent gets the recipe,
// not just the lookup. Kept in step with .claude/skills/{add-component,add-brand}/SKILL.md.

const userText = (text: string) => ({
  messages: [{ role: 'user' as const, content: { type: 'text' as const, text } }],
});

function scaffoldComponentText(name: string): string {
  const kebab = name.trim().toLowerCase().replace(/\s+/g, '-') || 'name';
  const pascal = kebab.replace(/(^|-)([a-z])/g, (_, _sep, c: string) => c.toUpperCase());
  return `Add a new quoin component \`quoin-${kebab}\` (React: \`${pascal}\`), following the web-component → React-wrapper recipe. \`quoin-button\` is the reference.

1. Branch off \`main\` (protected): \`feat/${kebab}\`.
2. Web component — \`packages/core/src/${kebab}/quoin-${kebab}.ts\`: extend \`QuoinElement\`, \`@customElement('quoin-${kebab}')\`, declare the API with \`@property\` (\`reflect: true\` for anything targeted from CSS). Style ONLY with semantic tokens (\`var(--quoin-color-…)\`, \`var(--quoin-space-…)\`) — never hard-code a value a token covers. Add the \`HTMLElementTagNameMap\` augmentation; dispatch any \`CustomEvent\` with \`{ bubbles: true, composed: true }\`.
3. Test in real Chromium — \`quoin-${kebab}.test.ts\`: mount, \`await el.updateComplete\`, assert against the shadow root, and add \`expectNoA11yViolations\` over its states.
4. Story — \`quoin-${kebab}.stories.ts\` (CSF3).
5. Export the element + types from \`packages/core/src/index.ts\`.
6. React wrapper — \`packages/react/src/${pascal}.tsx\`: \`import '@jasondaihl/quoin-core'\`, augment \`JSX.IntrinsicElements\`, forward props, accept \`ref\`; bridge custom events with a \`ref\` + \`useEffect\`. Export it; mirror the test + story.
7. \`pnpm build && pnpm test && pnpm lint\`, then open a PR — \`verify\` must pass (linear history).

Use the quoin MCP tools as you go: \`get_component quoin-button\` for the reference shape, \`list_tokens\`/\`search_tokens\` to pick semantic tokens, and \`check_usage\` to confirm a token path or prop before you write it.`;
}

function addBrandText(brand: string): string {
  const slug = brand.trim().toLowerCase().replace(/\s+/g, '-') || 'brand';
  return `Add a new quoin brand overlay \`${slug}\` — a new accent identity across light and dark. \`ocean\` is the reference. A brand is a thin overlay that re-points only the semantic roles it changes; components never change.

1. Branch off \`main\` (protected).
2. Palette ramp (if needed) — \`packages/tokens/tokens/primitive/palette.json\`, following the \`50…900\` shape. Primitives stay in \`:root\`, shared across brands.
3. Overlay (light + dark) — \`packages/tokens/tokens/semantic/brands/${slug}/light.json\` and \`dark.json\`: declare ONLY the roles that change (typically \`color.accent.*\` and \`color.focus.ring\`), aliasing into your ramp (\`{palette.<ramp>.600}\`). Anything omitted falls through to the base.
4. Contrast gotcha: contrast is enforced for every brand×mode. A light accent fails white-text AA — override \`color.text.on-accent\` to a dark value (as \`ocean\` does) rather than darkening the accent.
5. Verify — \`pnpm --filter @jasondaihl/quoin-tokens test\` shows which brand×mode pairs pass WCAG AA, then \`pnpm build && pnpm test\`.
6. Open a PR — \`verify\` must pass (linear history).

Use \`search_tokens\` to find the palette ramp and the semantic roles, and \`get_token color.accent.default\` to see the base you're overriding.`;
}

export function registerPrompts(server: McpServer): void {
  server.registerPrompt(
    'scaffold-component',
    {
      title: 'Scaffold a quoin component',
      description:
        'Guided recipe to add a new component the quoin way (web component → React wrapper, semantic tokens, real-Chromium + a11y tests).',
      argsSchema: { name: z.string().describe('Component name, e.g. "badge" or "toggle"') },
    },
    ({ name }) => userText(scaffoldComponentText(name)),
  );

  server.registerPrompt(
    'add-brand',
    {
      title: 'Add a quoin brand',
      description:
        'Guided recipe to add a brand/theme overlay (a new accent identity across light + dark) with the WCAG-AA contrast rule.',
      argsSchema: { brand: z.string().describe('Brand name, e.g. "sunset" or "scout"') },
    },
    ({ brand }) => userText(addBrandText(brand)),
  );
}
