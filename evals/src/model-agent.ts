import Anthropic from '@anthropic-ai/sdk';
import type { AgentOutput } from './agent.js';
import type { QuoinMcp } from './client.js';

// ---------------------------------------------------------------------------
// The real target: a Claude model wired to the quoin MCP server.
//
// This is what the heuristic agent in agent.ts stands in for. It hands Claude
// the server's tools and runs the standard tool-use loop by hand — ask the
// model, run whatever tool it calls on the real server, feed the result back,
// repeat until it answers. (quoin's MCP server speaks stdio, so this uses a
// manual loop against our stdio client rather than the hosted MCP connector,
// which only takes URL servers.)
//
// It returns the same AgentOutput shape as the heuristic agent, so the dataset,
// graders and runner don't change — only the thing being graded does. Select it
// with EVAL_AGENT=model (see run.ts); it needs Anthropic credentials and spends
// tokens, which is why it is opt-in and the offline agent stays the default.
// ---------------------------------------------------------------------------

// Defaults to Haiku — the cheapest current model, which keeps a full eval run
// inexpensive. Override with EVAL_MODEL (e.g. a more capable model when you want
// to measure the ceiling) without touching code.
export const DEFAULT_MODEL = 'claude-haiku-5-5';
const MODEL = process.env.EVAL_MODEL ?? DEFAULT_MODEL;

const SYSTEM = [
  'You answer questions about the quoin design system.',
  'Use the provided quoin tools to look up the real answer — never guess token',
  'values, component props, or usage from memory.',
  'Quote exact names, paths, CSS variables, tags and values from the tool results',
  'in your answer so it is precise and verifiable.',
].join(' ');

// Stop runaway loops; these tasks need one or two tool calls.
const MAX_TURNS = 6;

export async function answer(mcp: QuoinMcp, task: string): Promise<AgentOutput> {
  const client = new Anthropic();
  const tools = (await mcp.listTools()) as Anthropic.Tool[];

  const messages: Anthropic.MessageParam[] = [{ role: 'user', content: task }];

  // What we report back for grading: the first tool the model reached for, and
  // all the prose it produced.
  let firstTool: string | undefined;
  let firstArgs: Record<string, unknown> = {};
  const answerText: string[] = [];
  let sawError = false;

  for (let turn = 0; turn < MAX_TURNS; turn++) {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 4096,
      system: SYSTEM,
      tools,
      messages,
    });

    for (const block of response.content) {
      if (block.type === 'text') answerText.push(block.text);
    }
    messages.push({ role: 'assistant', content: response.content });

    if (response.stop_reason === 'refusal') {
      answerText.push('[model refused]');
      sawError = true;
      break;
    }

    const toolUses = response.content.filter((b) => b.type === 'tool_use');
    if (toolUses.length === 0) break; // end_turn — the model has answered

    // Run every tool the model asked for and return all results in one message.
    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const call of toolUses) {
      firstTool ??= call.name;
      if (Object.keys(firstArgs).length === 0) firstArgs = call.input as Record<string, unknown>;
      const result = await mcp.callTool(call.name, call.input as Record<string, unknown>);
      if (result.isError) sawError = true;
      toolResults.push({
        type: 'tool_result',
        tool_use_id: call.id,
        content: result.text,
        is_error: result.isError,
      });
    }
    messages.push({ role: 'user', content: toolResults });
  }

  return {
    task,
    tool: firstTool ?? '(no tool call)',
    args: firstArgs,
    text: answerText.join('\n'),
    isError: sawError,
  };
}
