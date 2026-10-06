import { useCallback, useEffect, useRef } from 'react';
import type { MutableRefObject, ReactNode, Ref } from 'react';
import '@jasondaihl/core';
import type { QuoinInput, QuoinInputType } from '@jasondaihl/core';

interface QuoinInputIntrinsic {
  ref?: Ref<QuoinInput>;
  value?: string;
  name?: string;
  type?: QuoinInputType;
  label?: string;
  placeholder?: string;
  helperText?: string;
  errorText?: string;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  class?: string;
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'quoin-input': QuoinInputIntrinsic;
    }
  }
}

export interface InputProps {
  value?: string;
  name?: string;
  type?: QuoinInputType;
  label?: string;
  placeholder?: string;
  helperText?: string;
  errorText?: string;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  className?: string;
  /** Fired on every keystroke with the current value. */
  onValueInput?: (value: string) => void;
  /** Fired on commit/blur with the current value. */
  onValueChange?: (value: string) => void;
  ref?: Ref<QuoinInput>;
}

/**
 * React wrapper around `<quoin-input>`. Bridges the element's `quoin-input` /
 * `quoin-change` custom events to `onValueInput` / `onValueChange` callbacks.
 */
export function Input({ ref, onValueInput, onValueChange, className, ...props }: InputProps) {
  const innerRef = useRef<QuoinInput | null>(null);

  const setRefs = useCallback(
    (node: QuoinInput | null) => {
      innerRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        (ref as MutableRefObject<QuoinInput | null>).current = node;
      }
    },
    [ref],
  );

  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const onInput = (e: Event) => onValueInput?.((e as CustomEvent).detail.value);
    const onChange = (e: Event) => onValueChange?.((e as CustomEvent).detail.value);
    el.addEventListener('quoin-input', onInput);
    el.addEventListener('quoin-change', onChange);
    return () => {
      el.removeEventListener('quoin-input', onInput);
      el.removeEventListener('quoin-change', onChange);
    };
  }, [onValueInput, onValueChange]);

  return <quoin-input ref={setRefs} class={className} {...props} />;
}
