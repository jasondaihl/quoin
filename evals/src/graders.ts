import type { AgentOutput } from './agent.js';

// ---------------------------------------------------------------------------
// Graders.
//
// A grader looks at one answer and returns a partial score out of some max.
// This is the heart of what makes an eval an *eval* and not a unit test: the
// checks are tolerant and weighted, so a near-miss scores 0.5 rather than
// simply "failed". A case's final score is the sum of its graders' scores over
// the sum of their maxes.
//
// Graders encode judgment calls (e.g. "enumerating a group should use
// list_tokens") — reasonable people could grade differently, and that is fine.
// Making those calls explicit and reviewable is the point.
// ---------------------------------------------------------------------------

export interface Grade {
  label: string;
  score: number;
  max: number;
  note: string;
}

export type Grader = (output: AgentOutput) => Grade;

/** Full marks when the agent chose the tool we expected for this task. */
export function usedTool(expected: string, weight = 1): Grader {
  return (o) => ({
    label: `tool = ${expected}`,
    max: weight,
    score: o.tool === expected ? weight : 0,
    note: o.tool === expected ? `chose ${expected}` : `chose ${o.tool}`,
  });
}

/**
 * Partial credit for how many expected facts show up in the answer text
 * (case-insensitive substring). Tolerant on purpose: a real model phrases
 * things differently every run, so we check that the facts are present, not
 * that the wording is exact.
 */
export function answerContains(needles: string[], weight = 1): Grader {
  return (o) => {
    const hay = o.text.toLowerCase();
    const missing = needles.filter((n) => !hay.includes(n.toLowerCase()));
    const hits = needles.length - missing.length;
    return {
      label: needles.length === 1 ? `mentions "${needles[0]}"` : `mentions ${needles.length} facts`,
      max: weight,
      score: (hits / needles.length) * weight,
      note:
        missing.length === 0
          ? `all ${needles.length} present`
          : `${hits}/${needles.length} present (missing: ${missing.join(', ')})`,
    };
  };
}

interface Oklch {
  l: number;
  c: number;
  h: number;
}

function parseOklch(value: string): Oklch | null {
  const m = value.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)/i);
  if (!m?.[1] || !m?.[2] || !m?.[3]) return null;
  return { l: Number(m[1]), c: Number(m[2]), h: Number(m[3]) };
}

/**
 * Full marks when the answer contains an oklch() value within tolerance of the
 * expected one. A numeric, fuzzy grader — the kind you reach for whenever the
 * "right" answer is a measurement rather than a fixed string.
 */
export function oklchCloseTo(
  expected: string,
  weight = 1,
  tol: Oklch = { l: 0.01, c: 0.01, h: 0.5 },
): Grader {
  const want = parseOklch(expected);
  return (o) => {
    const found = [...o.text.matchAll(/oklch\([^)]*\)/gi)]
      .map((m) => parseOklch(m[0]))
      .filter((x): x is Oklch => x !== null);
    const near =
      want !== null &&
      found.some(
        (f) =>
          Math.abs(f.l - want.l) <= tol.l &&
          Math.abs(f.c - want.c) <= tol.c &&
          Math.abs(f.h - want.h) <= tol.h,
      );
    return {
      label: `oklch ≈ ${expected}`,
      max: weight,
      score: near ? weight : 0,
      note: near ? 'within tolerance' : `no oklch within tolerance of ${expected}`,
    };
  };
}

/** Grade one answer against all of a case's graders and total it up. */
export function grade(output: AgentOutput, graders: Grader[]) {
  const grades = graders.map((g) => g(output));
  const score = grades.reduce((sum, g) => sum + g.score, 0);
  const max = grades.reduce((sum, g) => sum + g.max, 0);
  return { grades, score, max, ratio: max === 0 ? 1 : score / max };
}
