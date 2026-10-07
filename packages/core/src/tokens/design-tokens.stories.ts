// The published token metadata — the single source of truth the CSS/TS artifacts
// are also generated from. Reading it here keeps this reference in lockstep with
// the tokens; new tokens show up automatically on the next build.
import tokens from '@jasondaihl/quoin-tokens/tokens.json';
import type { Meta, StoryObj } from '@storybook/web-components';
import { type TemplateResult, html } from 'lit';

/** One row of the flat token metadata emitted by the tokens package. */
interface Token {
  path: string;
  cssVar: string;
  type: 'dimension' | 'color' | 'shadow' | 'fontFamily' | 'fontWeight' | 'number';
  tier: 'primitive' | 'semantic';
  value: string | number;
  reference: string | null;
  /** Present on semantic colors: the value applied under `[data-theme="dark"]`. */
  valueDark?: string;
}

const all = tokens as Token[];
const group = (prefix: string) => all.filter((t) => t.path.split('.')[0] === prefix);

// Chrome styles, built from quoin's own semantic tokens so this page re-themes
// with the Theme toolbar just like the components do.
const mono =
  "font-family: var(--quoin-font-family-mono, ui-monospace, 'SFMono-Regular', monospace)";
const muted = 'color: var(--quoin-color-text-muted)';
const grid = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px';
const card = [
  'border:1px solid var(--quoin-color-border-default)',
  'border-radius:8px',
  'background:var(--quoin-color-surface-default)',
  'overflow:hidden',
].join(';');

/** A labelled block of swatch cards. */
function section(title: string, note: string, cards: TemplateResult[]): TemplateResult {
  return html`
    <section
      style="font-family:var(--quoin-font-family-sans);color:var(--quoin-color-text-default);padding:24px;max-width:1100px"
    >
      <h2 style="margin:0 0 4px;font-size:20px">${title}</h2>
      <p style="margin:0 0 20px;${muted}">${note}</p>
      <div style=${grid}>${cards}</div>
    </section>
  `;
}

/** The identifying footer shared by every swatch: path, CSS variable, value. */
function meta(t: Token): TemplateResult {
  return html`
    <div style="padding:12px 14px;border-top:1px solid var(--quoin-color-border-default)">
      <div style="font-size:13px;font-weight:600">${t.path}</div>
      <div style="font-size:12px;${mono};${muted};margin-top:2px">${t.cssVar}</div>
      <div style="font-size:12px;${mono};margin-top:6px">
        ${String(t.value)}${t.valueDark ? html` <span style=${muted}>/ ${t.valueDark} (dark)</span>` : ''}
      </div>
      ${
        t.reference
          ? html`<div style="font-size:12px;${muted};margin-top:4px">→ ${t.reference.replace(/[{}]/g, '')}</div>`
          : ''
      }
    </div>
  `;
}

const colorCard = (t: Token) => html`
  <div style=${card}>
    <div style="height:72px;background:var(${t.cssVar})"></div>
    ${meta(t)}
  </div>
`;

const meta_: Meta = {
  title: 'Design Tokens',
  parameters: {
    // A reference catalogue, not an interactive component — hide the controls panel.
    controls: { disable: true },
    options: { showPanel: false },
  },
};
export default meta_;
type Story = StoryObj;

/** Semantic color roles — what components actually consume. Theme-aware. */
export const Colors: Story = {
  render: () =>
    section(
      'Semantic colors',
      'Role-based colors components reference. Flip the Theme toolbar for dark values, and the Brand toolbar (e.g. Ocean) to re-point accent/focus — the swatches read live CSS, so they re-theme in place. The literal values below are the default brand’s reference values.',
      group('color').map(colorCard),
    ),
};

/** Primitive palette — the raw color ramps the semantic roles point at. */
export const Palette: Story = {
  render: () =>
    section(
      'Palette',
      'Primitive color ramps. Semantic roles alias into these; prefer the semantic tokens in app code.',
      group('palette').map(colorCard),
    ),
};

export const Spacing: Story = {
  render: () =>
    section('Spacing', 'The spacing scale, used for padding, margins, and gaps.', [
      html`
        <div style="grid-column:1/-1;display:flex;flex-direction:column;gap:10px">
          ${group('space').map(
            (t) => html`
              <div style="display:flex;align-items:center;gap:12px;font-family:var(--quoin-font-family-sans)">
                <code style="${mono};font-size:12px;width:120px;color:var(--quoin-color-text-default)">${t.path}</code>
                <div style="height:16px;width:${t.value};background:var(--quoin-color-accent-default);border-radius:2px"></div>
                <span style="${mono};font-size:12px;${muted}">${t.value}</span>
              </div>
            `,
          )}
        </div>
      `,
    ]),
};

export const Radius: Story = {
  render: () =>
    section(
      'Radius',
      'Corner radii.',
      group('radius').map(
        (t) => html`
          <div style=${card}>
            <div
              style="height:72px;background:var(--quoin-color-accent-subtle);border:1px solid var(--quoin-color-accent-default);border-radius:${t.value};margin:14px;"
            ></div>
            ${meta(t)}
          </div>
        `,
      ),
    ),
};

export const BorderWidth: Story = {
  render: () =>
    section(
      'Border width',
      'Stroke widths for borders and dividers.',
      group('border-width').map(
        (t) => html`
          <div style=${card}>
            <div
              style="height:72px;margin:14px;border:${t.value} solid var(--quoin-color-accent-default);border-radius:6px;"
            ></div>
            ${meta(t)}
          </div>
        `,
      ),
    ),
};

export const Shadows: Story = {
  render: () =>
    section(
      'Shadows',
      'Elevation shadows.',
      group('shadow').map(
        (t) => html`
          <div style=${card}>
            <div style="padding:22px">
              <div
                style="height:64px;background:var(--quoin-color-surface-raised);border-radius:6px;box-shadow:var(${t.cssVar})"
              ></div>
            </div>
            ${meta(t)}
          </div>
        `,
      ),
    ),
};

/** Font families, sizes, weights, and line-heights, each shown on live sample text. */
export const Typography: Story = {
  render: () => {
    const sample = 'The quick brown fox';
    const row = (label: string, css: string, value: string | number) => html`
      <div
        style="display:flex;align-items:baseline;gap:16px;padding:10px 0;border-bottom:1px solid var(--quoin-color-border-default)"
      >
        <code style="${mono};font-size:12px;${muted};width:200px;flex:none">${label}</code>
        <span style=${css}>${sample}</span>
        <span style="${mono};font-size:12px;${muted};margin-left:auto">${String(value)}</span>
      </div>
    `;
    return section('Typography', 'Font families, sizes, weights, and line-heights.', [
      html`
        <div style="grid-column:1/-1;font-family:var(--quoin-font-family-sans);color:var(--quoin-color-text-default)">
          ${group('font-family').map((t) => row(t.path, `font-family:var(${t.cssVar});font-size:20px`, t.value))}
          ${group('font-size').map((t) => row(t.path, `font-size:var(${t.cssVar})`, t.value))}
          ${group('font-weight').map((t) => row(t.path, `font-weight:var(${t.cssVar});font-size:20px`, t.value))}
          ${group('line-height').map(
            (t) => html`
              <div style="padding:10px 0;border-bottom:1px solid var(--quoin-color-border-default)">
                <code style="${mono};font-size:12px;${muted}">${t.path} — ${String(t.value)}</code>
                <p style="margin:6px 0 0;max-width:420px;line-height:var(${t.cssVar})">
                  ${sample}, who jumped over the lazy dog, kept on running across several lines to show the line height.
                </p>
              </div>
            `,
          )}
        </div>
      `,
    ]);
  },
};
