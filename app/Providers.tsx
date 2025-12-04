'use client';

import type { ReactNode } from 'react';
import { CursorProvider } from './components/CursorProvider';

export default function Providers({ children }: { children: ReactNode }) {
  return <CursorProvider>{children}</CursorProvider>;
}
