import type React from 'react';

export type PropsOf<T extends keyof JSX.IntrinsicElements | React.JSXElementConstructor<any>> =
  JSX.LibraryManagedAttributes<T, React.ComponentPropsWithRef<T>>;
