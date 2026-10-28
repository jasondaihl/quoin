import { answerContains, type Grader, oklchCloseTo, usedTool } from './graders.js';

// ---------------------------------------------------------------------------
// The dataset.
//
// A list of tasks, each with the graders that decide whether the answer was
// good. This is the part you grow over time: every real bug or gap becomes a
// new case here, so the eval keeps measuring what you actually care about.
//
// Each case mixes a tool-choice grader with one or more content graders, so a
// case can score partially — right idea, imperfect answer.
// ---------------------------------------------------------------------------

export interface EvalCase {
  id: string;
  task: string;
  graders: Grader[];
  /** Optional aside shown in the report — handy for teaching. */
  note?: string;
}

export const dataset: EvalCase[] = [
  {
    id: 'accent-value',
    task: "What is quoin's accent color? I need the exact value.",
    graders: [
      usedTool('search_tokens'),
      oklchCloseTo('oklch(0.5106 0.2301 276.97)', 2),
      answerContains(['color.accent.default']),
    ],
  },
  {
    id: 'accent-css-var',
    task: 'Give me the CSS custom property for the color.accent.default token.',
    graders: [usedTool('get_token'), answerContains(['--quoin-color-accent-default'], 2)],
  },
  {
    id: 'space-5',
    task: 'What is the pixel size of the space.5 token?',
    graders: [usedTool('get_token'), answerContains(['16px'], 2)],
  },
  {
    id: 'reverse-oklch',
    task: 'Which quoin tokens resolve to oklch(0.5106 0.2301 276.97)?',
    graders: [
      usedTool('search_tokens'),
      answerContains(['palette.indigo.600', 'color.accent.default'], 2),
    ],
  },
  {
    id: 'button-react-usage',
    task: 'Show me how to render a primary Button in React.',
    graders: [usedTool('get_component'), answerContains(['<Button', 'variant', 'primary'], 2)],
  },
  {
    id: 'input-fields',
    task: 'Does the Input component support a placeholder and helper text?',
    graders: [usedTool('get_component'), answerContains(['placeholder', 'helperText'], 2)],
  },
  {
    id: 'list-components',
    task: 'List every component quoin ships.',
    graders: [
      usedTool('list_components'),
      answerContains(['quoin-button', 'quoin-input', 'quoin-icon', 'quoin-stack'], 2),
    ],
  },
  {
    id: 'radius-scale',
    task: 'What are the radius sizes in quoin?',
    note: "Teaching case: the eval prefers list_tokens for enumerating a group, but the heuristic agent — with no 'list/all' verb to trigger on — reaches for search_tokens instead. It still surfaces the radii, so it earns the content points but loses the tool-choice point: a partial score, which is exactly what evals exist to reveal.",
    graders: [usedTool('list_tokens'), answerContains(['radius.sm', 'radius.full'], 2)],
  },
  // check_usage: validate-before-use, so an agent can self-correct a typo'd path or prop.
  {
    id: 'check-valid-token',
    task: 'Is `space.5` a valid quoin token? Check it.',
    graders: [usedTool('check_usage'), answerContains(['"valid": true', '16px'], 2)],
  },
  {
    id: 'check-invalid-token',
    task: 'Is `color.accent.bogus` a valid token, or did I make a typo?',
    graders: [
      usedTool('check_usage'),
      answerContains(['"valid": false', 'color.accent.default'], 2),
    ],
  },
  {
    id: 'check-valid-prop',
    task: 'Does the Button component accept a `variant` prop? Check before I use it.',
    graders: [usedTool('check_usage'), answerContains(['"valid": true', 'variant'], 2)],
  },
  {
    id: 'check-invalid-prop',
    task: 'Does Button accept a `color` prop, or is that a typo?',
    graders: [usedTool('check_usage'), answerContains(['"valid": false', 'variant'], 2)],
  },
];
