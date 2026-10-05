import { css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { QuoinElement } from '../shared/base-element.js';

export type QuoinIconSize = 'sm' | 'md' | 'lg';

/**
 * `<quoin-icon>` — a sizing/color box for an SVG passed via the default slot.
 *
 * The icon inherits `currentColor`, so it takes on the color of surrounding
 * text by default. Provide `label` for a meaningful icon, or omit it for a
 * purely decorative one (which is then hidden from assistive tech).
 *
 * ```html
 * <quoin-icon size="md" label="Search">
 *   <svg viewBox="0 0 24 24">…</svg>
 * </quoin-icon>
 * ```
 */
@customElement('quoin-icon')
export class QuoinIcon extends QuoinElement {
  static override styles = [
    QuoinElement.baseStyles,
    css`
      :host {
        display: inline-flex;
        color: currentColor;
      }
      :host([size='sm']) {
        width: 16px;
        height: 16px;
      }
      :host([size='md']),
      :host(:not([size])) {
        width: 20px;
        height: 20px;
      }
      :host([size='lg']) {
        width: 24px;
        height: 24px;
      }
      ::slotted(svg) {
        display: block;
        width: 100%;
        height: 100%;
        fill: currentColor;
      }
    `,
  ];

  @property({ reflect: true }) size: QuoinIconSize = 'md';

  /** Accessible name. Omit for decorative icons. */
  @property() label = '';

  override render() {
    const decorative = this.label === '';
    return html`<span
      part="icon"
      role=${decorative ? nothing : 'img'}
      aria-hidden=${decorative ? 'true' : nothing}
      aria-label=${decorative ? nothing : this.label}
    >
      <slot></slot>
    </span>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'quoin-icon': QuoinIcon;
  }
}
