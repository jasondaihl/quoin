import type { ReactNode, Ref } from 'react';
import '@jasondaihl/core';
import type {
  QuoinSpaceKey,
  QuoinStack,
  QuoinStackAlign,
  QuoinStackDirection,
  QuoinStackJustify,
} from '@jasondaihl/core';

interface QuoinStackIntrinsic {
  ref?: Ref<QuoinStack>;
  children?: ReactNode;
  direction?: QuoinStackDirection;
  gap?: QuoinSpaceKey;
  align?: QuoinStackAlign;
  justify?: QuoinStackJustify;
  wrap?: boolean;
  class?: string;
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'quoin-stack': QuoinStackIntrinsic;
    }
  }
}

export interface StackProps {
  children?: ReactNode;
  direction?: QuoinStackDirection;
  /** Gap between children as a space-scale token key, e.g. '4'. */
  gap?: QuoinSpaceKey;
  align?: QuoinStackAlign;
  justify?: QuoinStackJustify;
  wrap?: boolean;
  className?: string;
  ref?: Ref<QuoinStack>;
}

/** React wrapper around the `<quoin-stack>` layout primitive. */
export function Stack({ className, children, ...props }: StackProps) {
  return (
    <quoin-stack class={className} {...props}>
      {children}
    </quoin-stack>
  );
}
