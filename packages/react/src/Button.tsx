import { useCallback, useEffect, useRef } from 'react';
import type { MutableRefObject, ReactNode, Ref } from 'react';
// Importing the core package registers <quoin-button> as a side effect.
import '@jasondaihl/quoin-core';
import type {
  QuoinButton,
  QuoinButtonSize,
  QuoinButtonType,
  QuoinButtonVariant,
} from '@jasondaihl/quoin-core';

/**
 * Teach TypeScript about the `<quoin-button>` custom element in JSX. React 19
 * sets these as element *properties* when they exist on the instance (they do —
 * they're Lit reactive properties) and falls back to attributes otherwise.
 */
interface QuoinButtonIntrinsic {
  ref?: Ref<QuoinButton>;
  children?: ReactNode;
  variant?: QuoinButtonVariant;
  size?: QuoinButtonSize;
  type?: QuoinButtonType;
  disabled?: boolean;
  loading?: boolean;
  'aria-label'?: string;
  class?: string;
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'quoin-button': QuoinButtonIntrinsic;
    }
  }
}

export interface ButtonProps {
  children?: ReactNode;
  variant?: QuoinButtonVariant;
  size?: QuoinButtonSize;
  type?: QuoinButtonType;
  disabled?: boolean;
  loading?: boolean;
  /** Called when the button dispatches its `quoin-click` custom event. */
  onClick?: (event: CustomEvent) => void;
  'aria-label'?: string;
  className?: string;
  /** React 19 allows `ref` to be passed as an ordinary prop (no forwardRef). */
  ref?: Ref<QuoinButton>;
}

/**
 * React wrapper around `<quoin-button>`.
 *
 * The wrapper is deliberately thin: it forwards props to the element and bridges
 * the one thing React doesn't do declaratively — listening to a *custom* DOM
 * event (`quoin-click`) — via a ref and an effect.
 */
export function Button({ ref, onClick, className, children, ...props }: ButtonProps) {
  const innerRef = useRef<QuoinButton | null>(null);

  // Keep both our internal ref and any forwarded ref pointing at the element.
  const setRefs = useCallback(
    (node: QuoinButton | null) => {
      innerRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        (ref as MutableRefObject<QuoinButton | null>).current = node;
      }
    },
    [ref],
  );

  useEffect(() => {
    const el = innerRef.current;
    if (!el || !onClick) return;
    const handler = onClick as EventListener;
    el.addEventListener('quoin-click', handler);
    return () => el.removeEventListener('quoin-click', handler);
  }, [onClick]);

  return (
    <quoin-button ref={setRefs} class={className} {...props}>
      {children}
    </quoin-button>
  );
}
