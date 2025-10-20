'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type Align = 'right' | 'left';

type CursorState = {
  x: number;
  y: number;
  visible: boolean;
  text: string;
  align: Align;
};

type CursorAPI = {
  show: (text?: string, opts?: { align?: Align }) => void;
  hide: () => void;
  move: (x: number, y: number) => void;
  setText: (t: string) => void;
  isTouch: boolean;
};

const CursorContext = createContext<CursorAPI | null>(null);

function CursorOverlay({ state, isTouch }: { state: CursorState; isTouch: boolean }) {
  if (isTouch) return null;
  const offset = 14;
  const style: React.CSSProperties = {
    position: 'fixed',
    left: state.align === 'right' ? state.x + offset : state.x - offset,
    top: state.y,
    transform: state.align === 'right' ? 'translate(0,-50%)' : 'translate(-100%,-50%)',
    pointerEvents: 'none',
    mixBlendMode: 'difference',
    color: '#fff',
    fontFamily: 'fustat-bold, fustat, sans-serif',
    fontWeight: 800,
    lineHeight: 1,
    userSelect: 'none',
    zIndex: 9999,
    opacity: state.visible ? 1 : 0,
    transition: 'opacity 120ms ease-in-out',
    fontSize: 'clamp(16px, 2.8vw, 40px)',
    whiteSpace: 'pre',
    display: 'inline-block',
    textAlign: 'right',
  };
  return (
    <div aria-hidden="true" style={style}>
      {state.text}
    </div>
  );
}

export function CursorProvider({ children }: { children: React.ReactNode }) {
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    const hasTouch = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
    setIsTouch(Boolean(hasTouch));
  }, []);

  const [state, setState] = useState<CursorState>({ x: 0, y: 0, visible: false, text: 'WHAT IF', align: 'right' });

  const api: CursorAPI = useMemo(
    () => ({
      show: (text = 'WHAT IF', opts) => setState((s) => ({ ...s, visible: true, text, align: opts?.align ?? s.align })),
      hide: () => setState((s) => ({ ...s, visible: false })),
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
