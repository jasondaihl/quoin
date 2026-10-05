import { css, html, nothing } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { QuoinElement } from '../shared/base-element.js';

export type QuoinInputType = 'text' | 'email' | 'password' | 'search' | 'tel' | 'url' | 'number';

let idCounter = 0;

/**
 * `<quoin-input>` — a form-associated text field.
 *
 * This component is a **form-associated custom element**: it sets
 * `static formAssociated = true` and uses `ElementInternals` so that it
 * participates in a native `<form>` (its value is submitted, and it reports
 * validity) despite living behind a Shadow DOM boundary.
 *
 * Events:
 *  - `quoin-input`  — fired on every keystroke (`detail: { value }`)
 *  - `quoin-change` — fired on commit / blur (`detail: { value }`)
 */
@customElement('quoin-input')
export class QuoinInput extends QuoinElement {
  static formAssociated = true;

  static override styles = [
    QuoinElement.baseStyles,
    css`
      :host {
        display: block;
      }

      .field {
        display: flex;
        flex-direction: column;
        gap: var(--quoin-space-2);
      }

      label {
        font-size: var(--quoin-font-size-sm);
        font-weight: var(--quoin-font-weight-medium);
        color: var(--quoin-color-text-default);
      }

      .required {
        color: var(--quoin-color-danger-default);
        margin-inline-start: var(--quoin-space-1);
      }

      input {
        font-family: inherit;
        font-size: var(--quoin-font-size-md);
        line-height: var(--quoin-line-height-normal);
        color: var(--quoin-color-text-default);
        background-color: var(--quoin-color-surface-default);
        border: var(--quoin-border-width-thin) solid var(--quoin-color-border-strong);
        border-radius: var(--quoin-radius-md);
        padding: var(--quoin-space-3) var(--quoin-space-4);
        transition:
          border-color 120ms ease,
          box-shadow 120ms ease;
      }

      input::placeholder {
        color: var(--quoin-color-text-muted);
      }

      input:focus-visible {
        outline: none;
        border-color: var(--quoin-color-focus-ring);
        box-shadow: 0 0 0 3px var(--quoin-color-accent-subtle);
      }

      :host([invalid]) input {
        border-color: var(--quoin-color-danger-default);
      }
      :host([invalid]) input:focus-visible {
        box-shadow: 0 0 0 3px var(--quoin-color-danger-default);
      }

      :host([disabled]) input {
        cursor: not-allowed;
        opacity: 0.55;
      }

      .helper {
        font-size: var(--quoin-font-size-xs);
        color: var(--quoin-color-text-muted);
      }
      .helper.error {
        color: var(--quoin-color-danger-default);
      }

      @media (prefers-reduced-motion: reduce) {
        input {
          transition: none;
        }
      }
    `,
  ];

  private readonly internals = this.attachInternals();
  private readonly inputId = `quoin-input-${++idCounter}`;

  @query('input') private inputEl!: HTMLInputElement;

  /** The current value. Submitted with the surrounding form. */
  @property() value = '';

  /** Form control name. */
  @property() name = '';

  @property() type: QuoinInputType = 'text';

  /** Visible label text. */
  @property() label = '';

  @property() placeholder = '';

  /** Helper text shown below the field (replaced by `errorText` when invalid). */
  @property({ attribute: 'helper-text' }) helperText = '';

  /** Error message shown when `invalid` is set. */
  @property({ attribute: 'error-text' }) errorText = '';

  @property({ type: Boolean, reflect: true }) disabled = false;

  @property({ type: Boolean, reflect: true }) required = false;

  @property({ type: Boolean, reflect: true }) invalid = false;

  @state() private touched = false;

  override firstUpdated() {
    this.internals.setFormValue(this.value);
    this.syncValidity();
  }

  override updated(changed: Map<string, unknown>) {
    if (changed.has('value')) {
      this.internals.setFormValue(this.value);
      this.syncValidity();
    }
    if (changed.has('required')) {
      this.syncValidity();
    }
  }

  private syncValidity() {
    if (this.required && this.value.trim() === '') {
      this.internals.setValidity({ valueMissing: true }, 'This field is required.', this.inputEl);
    } else {
      this.internals.setValidity({});
    }
  }

  private handleInput(event: Event) {
    this.value = (event.target as HTMLInputElement).value;
    this.dispatchEvent(
      new CustomEvent('quoin-input', {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private handleChange() {
    this.touched = true;
    this.dispatchEvent(
      new CustomEvent('quoin-change', {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /** Programmatically focus the field. */
  override focus(options?: FocusOptions) {
    this.inputEl?.focus(options);
  }

  override render() {
    const showError = this.invalid && this.errorText !== '';
    const helper = showError ? this.errorText : this.helperText;
    return html`
      <div class="field">
        ${
          this.label
            ? html`<label for=${this.inputId}>
              ${this.label}
              ${this.required ? html`<span class="required" aria-hidden="true">*</span>` : nothing}
            </label>`
            : nothing
        }
        <input
          id=${this.inputId}
          part="input"
          .value=${this.value}
          type=${this.type}
          name=${this.name || nothing}
          placeholder=${this.placeholder || nothing}
          ?disabled=${this.disabled}
          ?required=${this.required}
          aria-invalid=${this.invalid ? 'true' : 'false'}
          @input=${this.handleInput}
          @change=${this.handleChange}
        />
        ${
          helper
            ? html`<span class="helper ${showError ? 'error' : ''}" part="helper">${helper}</span>`
            : nothing
        }
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'quoin-input': QuoinInput;
  }
}
