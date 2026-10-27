import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { answer as heuristicAnswer } from './agent.js';
import { connect } from './client.js';
import { dataset } from './dataset.js';
import { grade } from './graders.js';
import { DEFAULT_MODEL, answer as modelAnswer } from './model-agent.js';

// ---------------------------------------------------------------------------
// The runner.
//
// Ties the four pieces together: start the server, send every task in the
// dataset through the agent, grade each answer, then print a scored report and
// exit non-zero if the overall score falls below the bar. That exit code is
// what lets an eval gate CI the same way a test suite does — except the number
// it gates on is a quality score, not all-or-nothing.
// ---------------------------------------------------------------------------

// The bar the whole suite must clear (0–1). Override with EVAL_MIN_SCORE.
const MIN_SCORE = Number(process.env.EVAL_MIN_SCORE ?? '0.8');

// Which thing to grade: the offline heuristic (default, free) or a real Claude
// model with the server's tools attached (EVAL_AGENT=model, needs credentials).
const useModel = process.env.EVAL_AGENT === 'model';
const answer = useModel ? modelAnswer : heuristicAnswer;
const agentLabel = useModel ? `model (${process.env.EVAL_MODEL ?? DEFAULT_MODEL})` : 'heuristic';

const pct = (ratio: number) => `${(ratio * 100).toFixed(0)}%`;
const bar = (ratio: number, width = 20) => '█'.repeat(Math.round(ratio * width)).padEnd(width, '░');

async function main() {
  const mcp = await connect();

  const results = [];
  let totalScore = 0;
  let totalMax = 0;

  console.log(
    `\nquoin MCP eval · ${dataset.length} cases · agent: ${agentLabel}\n${'─'.repeat(60)}`,
  );

  try {
    for (const testCase of dataset) {
      const output = await answer(mcp, testCase.task);
      const graded = grade(output, testCase.graders);
      totalScore += graded.score;
      totalMax += graded.max;

      const head = graded.ratio === 1 ? '✓' : graded.ratio === 0 ? '✗' : '~';
      console.log(`\n${head} ${testCase.id} — ${pct(graded.ratio)}`);
      console.log(`  task: ${testCase.task}`);
      console.log(`  called: ${output.tool}(${JSON.stringify(output.args)})`);
      for (const g of graded.grades) {
        const mark = g.score === g.max ? '✓' : g.score === 0 ? '✗' : '~';
        console.log(`    ${mark} ${g.label} [${g.score}/${g.max}] — ${g.note}`);
      }
      if (testCase.note) console.log(`  ⓘ ${testCase.note}`);

      results.push({
        id: testCase.id,
        task: testCase.task,
        tool: output.tool,
        args: output.args,
        score: graded.score,
        max: graded.max,
        ratio: graded.ratio,
        grades: graded.grades,
      });
    }
  } finally {
    await mcp.close();
  }

  const overall = totalMax === 0 ? 1 : totalScore / totalMax;
  const passed = overall >= MIN_SCORE;

  console.log(`\n${'─'.repeat(60)}`);
  console.log(`score  ${bar(overall)}  ${pct(overall)}  (${totalScore.toFixed(1)}/${totalMax})`);
  console.log(`bar    ${bar(MIN_SCORE)}  ${pct(MIN_SCORE)}  (EVAL_MIN_SCORE)`);
  console.log(`result ${passed ? 'PASS ✓' : 'FAIL ✗'}\n`);

  // Persist the run so it can be diffed or inspected later. Gitignored.
  const outFile = fileURLToPath(new URL('../results.json', import.meta.url));
  writeFileSync(
    outFile,
    `${JSON.stringify({ agent: agentLabel, overall, min: MIN_SCORE, passed, results }, null, 2)}\n`,
  );
  console.log(`wrote ${outFile}\n`);

  process.exitCode = passed ? 0 : 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
