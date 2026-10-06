import { css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { QuoinElement } from '../shared/base-element.js';

export type QuoinStackDirection = 'row' | 'column';
export type QuoinStackAlign = 'start' | 'center' | 'end' | 'stretch';
export type QuoinStackJustify = 'start' | 'center' | 'end' | 'between';

/** A space-scale key, e.g. '0' | '1' | ... | '12'. */
export type QuoinSpaceKey = string;

/**
 * `<quoin-stack>` — a flexbox layout primitive.
 *
 * Spacing is expressed as a design-token key (`gap="4"` → `var(--quoin-space-4)`),
 * so layouts stay on the system's spacing scale.
 *
 * @slot - The items to lay out.
 */
@customElement('quoin-stack')
export class QuoinStack extends QuoinElement {
  static override styles = [
    QuoinElement.baseStyles,
    css`
      :host {
        display: flex;
        flex-direction: column;
        gap: var(--quoin-stack-gap, 0);
      }
      :host([direction='row']) {
        flex-direction: row;
      }
      :host([wrap]) {
        flex-wrap: wrap;
      }

      :host([align='start']) {
        align-items: flex-start;
      }
      :host([align='center']) {
        align-items: center;
      }
      :host([align='end']) {
        align-items: flex-end;
      }
      :host([align='stretch']) {
        align-items: stretch;
      }

      :host([justify='start']) {
        justify-content: flex-start;
      }
      :host([justify='center']) {
        justify-content: center;
      }
      :host([justify='end']) {
        justify-content: flex-end;
      }
      :host([justify='between']) {
        justify-content: space-between;
      }
    `,
  ];

  @property({ reflect: true }) direction: QuoinStackDirection = 'column';

  /** Gap between children, as a space-scale token key. */
  @property() gap: QuoinSpaceKey = '4';

  @property({ reflect: true }) align: QuoinStackAlign = 'stretch';

  @property({ reflect: true }) justify: QuoinStackJustify = 'start';

  @property({ type: Boolean, reflect: true }) wrap = false;

  override updated(changed: Map<string, unknown>) {
    if (changed.has('gap')) {
      // Resolve the token key to a real custom-property reference.
      this.style.setProperty('--quoin-stack-gap', `var(--quoin-space-${this.gap})`);
    }
  }

  override render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'quoin-stack': QuoinStack;
  }
}
