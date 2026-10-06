import { LitElement, css } from 'lit';

/**
 * Base class for all quoin elements.
 *
 * Design tokens are exposed as CSS custom properties on the document `:root`
 * (from `@jasondaihl/tokens/tokens.css`). Custom properties inherit *through* the
 * Shadow DOM boundary, so components simply reference `var(--quoin-...)` and
 * inherit whatever theme is active on the host document.
 */
export class QuoinElement extends LitElement {
  /** Shared base styles mixed into every component's own styles. */
  static baseStyles = css`
    :host {
      box-sizing: border-box;
      font-family: var(--quoin-font-family-sans, system-ui, sans-serif);
    }
    :host([hidden]) {
      display: none;
    }
    *,
    *::before,
    *::after {
      box-sizing: inherit;
    }
  `;
}
