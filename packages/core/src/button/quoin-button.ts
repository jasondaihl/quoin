import { css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { QuoinElement } from '../shared/base-element.js';

export type QuoinButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type QuoinButtonSize = 'sm' | 'md' | 'lg';
export type QuoinButtonType = 'button' | 'submit' | 'reset';

/**
 * `<quoin-button>` — the canonical quoin component.
 *
 * @slot - The button label.
 * @slot start - Leading adornment (e.g. an icon).
 * @slot end - Trailing adornment.
 *
 * @fires quoin-click - Dispatched on activation (suppressed while disabled or
 * loading). The underlying native `click` also bubbles (composed).
 *
 * @csspart button - The native `<button>` element.
 * @csspart spinner - The loading spinner (present only while `loading`).
 */
@customElement('quoin-button')
export class QuoinButton extends QuoinElement {
  static override styles = [
    QuoinElement.baseStyles,
    css`
      :host {
        display: inline-block;
      }

      button {
        /* layout */
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: var(--quoin-space-3);
        width: 100%;
        /* typography */
        font-family: inherit;
        font-weight: var(--quoin-font-weight-medium);
        line-height: var(--quoin-line-height-tight);
        /* shape */
        border: var(--quoin-border-width-thin) solid transparent;
        border-radius: var(--quoin-radius-md);
        cursor: pointer;
        transition:
          background-color 120ms ease,
          border-color 120ms ease,
          color 120ms ease;
      }

      button:focus-visible {
        outline: var(--quoin-border-width-thick) solid var(--quoin-color-focus-ring);
        outline-offset: 2px;
      }

      /* ---- sizes ---- */
      :host([size='sm']) button {
        font-size: var(--quoin-font-size-sm);
        padding: var(--quoin-space-2) var(--quoin-space-4);
        min-height: 28px;
      }
      :host([size='md']) button,
      :host(:not([size])) button {
        font-size: var(--quoin-font-size-md);
        padding: var(--quoin-space-3) var(--quoin-space-5);
        min-height: 36px;
      }
      :host([size='lg']) button {
        font-size: var(--quoin-font-size-lg);
        padding: var(--quoin-space-4) var(--quoin-space-7);
        min-height: 44px;
      }

      /* ---- variants ---- */
      :host([variant='primary']) button,
      :host(:not([variant])) button {
        background-color: var(--quoin-color-accent-default);
        color: var(--quoin-color-text-on-accent);
      }
      :host([variant='primary']) button:hover,
      :host(:not([variant])) button:hover {
        background-color: var(--quoin-color-accent-hover);
      }
      :host([variant='primary']) button:active,
      :host(:not([variant])) button:active {
        background-color: var(--quoin-color-accent-active);
      }

      :host([variant='secondary']) button {
        background-color: var(--quoin-color-surface-default);
        border-color: var(--quoin-color-border-strong);
        color: var(--quoin-color-text-default);
      }
      :host([variant='secondary']) button:hover {
        background-color: var(--quoin-color-bg-subtle);
      }

      :host([variant='ghost']) button {
        background-color: transparent;
        color: var(--quoin-color-text-default);
      }
      :host([variant='ghost']) button:hover {
        background-color: var(--quoin-color-bg-subtle);
      }

      :host([variant='danger']) button {
        background-color: var(--quoin-color-danger-default);
        color: var(--quoin-color-text-on-danger);
      }
      :host([variant='danger']) button:hover {
        background-color: var(--quoin-color-danger-hover);
      }

      /* ---- disabled / loading ---- */
      :host([disabled]) button,
      :host([loading]) button {
        cursor: not-allowed;
        opacity: 0.55;
      }

      .spinner {
        width: 1em;
        height: 1em;
        border: 2px solid currentColor;
        border-right-color: transparent;
        border-radius: var(--quoin-radius-full);
        animation: quoin-spin 0.6s linear infinite;
      }

      @keyframes quoin-spin {
        to {
          transform: rotate(360deg);
        }
      }

      @media (prefers-reduced-motion: reduce) {
        button {
          transition: none;
        }
        .spinner {
          animation-duration: 1.5s;
        }
      }

      ::slotted(*) {
        pointer-events: none;
      }
    `,
  ];

  /** Visual style of the button. */
  @property({ reflect: true })
  variant: QuoinButtonVariant = 'primary';

  /** Size of the button. */
  @property({ reflect: true })
  size: QuoinButtonSize = 'md';

  /** Native button behavior (`button` | `submit` | `reset`). */
  @property()
  type: QuoinButtonType = 'button';

  /** Disables interaction. */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  /** Shows a spinner and blocks interaction. */
  @property({ type: Boolean, reflect: true })
  loading = false;

  /** Accessible label, when the button has no text (e.g. icon-only). */
  @property({ attribute: 'aria-label' })
  ariaLabelOverride: string | null = null;

  private handleClick(event: MouseEvent) {
    if (this.disabled || this.loading) {
      event.stopImmediatePropagation();
      event.preventDefault();
      return;
    }
    this.dispatchEvent(new CustomEvent('quoin-click', { bubbles: true, composed: true }));
  }

  override render() {
    return html`
      <button
        part="button"
        type=${this.type}
        ?disabled=${this.disabled || this.loading}
        aria-busy=${this.loading ? 'true' : 'false'}
        aria-label=${this.ariaLabelOverride ?? undefined}
        @click=${this.handleClick}
      >
        ${
          this.loading
            ? html`<span class="spinner" part="spinner" aria-hidden="true"></span>`
            : html`<slot name="start"></slot>`
        }
        <slot></slot>
        <slot name="end"></slot>
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'quoin-button': QuoinButton;
  }
}
