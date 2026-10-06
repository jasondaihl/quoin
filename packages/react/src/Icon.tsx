import type { ReactNode, Ref } from 'react';
import '@jasondaihl/core';
import type { QuoinIcon, QuoinIconSize } from '@jasondaihl/core';

interface QuoinIconIntrinsic {
  ref?: Ref<QuoinIcon>;
  children?: ReactNode;
  size?: QuoinIconSize;
  label?: string;
  class?: string;
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'quoin-icon': QuoinIconIntrinsic;
    }
  }
}

export interface IconProps {
  children?: ReactNode;
  size?: QuoinIconSize;
  /** Accessible name. Omit for decorative icons. */
  label?: string;
  className?: string;
  ref?: Ref<QuoinIcon>;
}

/** React wrapper around `<quoin-icon>`. Pass an `<svg>` as children. */
export function Icon({ className, children, ...props }: IconProps) {
  return (
    <quoin-icon class={className} {...props}>
      {children}
    </quoin-icon>
  );
}
