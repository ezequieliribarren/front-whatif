'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type Align = 'right' | 'left';
type CursorVariant = 'default' | 'arrow';

type CursorState = {
  x: number;
  y: number;
  visible: boolean;
  text: string;
  align: Align;
  variant: CursorVariant;
};

type CursorAPI = {
  show: (text?: string, opts?: { align?: Align; variant?: CursorVariant }) => void;
  hide: () => void;
  move: (x: number, y: number) => void;
  setText: (t: string) => void;
  isTouch: boolean;
};

const CursorContext = createContext<CursorAPI | null>(null);

function CursorOverlay({ state, isTouch }: { state: CursorState; isTouch: boolean }) {
  if (isTouch) return null;
  const size = state.variant === 'arrow' ? 42 : 24;
  const style: React.CSSProperties = {
    position: 'fixed',
    left: state.x,
    top: state.y,
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
    mixBlendMode: 'difference',
    zIndex: 99999,
    opacity: state.visible ? 1 : 0,
    transition: 'opacity 120ms ease-in-out, width 120ms ease, height 120ms ease, background-color 120ms ease, border-color 120ms ease',
    width: size,
    height: size,
    borderRadius: '50%',
    border: '2px solid #fff',
    backgroundColor: state.variant === 'arrow' ? '#fff' : 'transparent',
  };
  return <div aria-hidden="true" style={style} />;
}

export function CursorProvider({ children }: { children: React.ReactNode }) {
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    const hasTouch = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
    setIsTouch(Boolean(hasTouch));
  }, []);

  const [state, setState] = useState<CursorState>({ x: 0, y: 0, visible: false, text: 'WHAT IF', align: 'right', variant: 'default' });

  const api: CursorAPI = useMemo(
    () => ({
      show: (text = 'WHAT IF', opts) =>
        setState((s) => ({
          ...s,
          visible: true,
          text,
          align: opts?.align ?? s.align,
          variant: opts?.variant ?? 'default',
        })),
      hide: () => setState((s) => ({ ...s, visible: false, variant: 'default' })),
      move: (x, y) => setState((s) => ({ ...s, x, y })),
      setText: (t) => setState((s) => ({ ...s, text: t })),
      isTouch,
    }),
    [isTouch]
  );

  return (
    <CursorContext.Provider value={api}>
      {children}
      <CursorOverlay state={state} isTouch={isTouch} />
    </CursorContext.Provider>
  );
}

export function useCursor() {
  const ctx = useContext(CursorContext);
  if (!ctx) throw new Error('useCursor must be used within CursorProvider');
  return ctx;
}
