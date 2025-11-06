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
  const size = state.variant === 'arrow' ? 42 : 8; // small by default, expand on clickable
  const style: React.CSSProperties = {
    position: 'fixed',
    left: state.x,
    top: state.y,
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
    // Keep negative effect only when over clickable elements (arrow variant)
    mixBlendMode: state.variant === 'arrow' ? 'difference' : 'normal',
    zIndex: 99999,
    opacity: state.visible ? 1 : 0,
    transition:
      'opacity 120ms ease-in-out, width 120ms ease, height 120ms ease, background-color 120ms ease, border-color 120ms ease',
    width: size,
    height: size,
    borderRadius: '50%',
    border: 'none',
    // Default: small orange dot; Clickable: solid white for stronger negative effect
    backgroundColor: state.variant === 'arrow' ? '#fff' : '#FF7A00',
  };
  return <div aria-hidden="true" style={style} />;
}

export function CursorProvider({ children }: { children: React.ReactNode }) {
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    const computeIsTouch = () => {
      if (typeof window === 'undefined') return false;
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallViewport = window.innerWidth <= 1024; // treat mobile/tablet as touch for cursor behavior
      return hasTouch || isSmallViewport;
    };
    setIsTouch(computeIsTouch());
    const onResize = () => setIsTouch(computeIsTouch());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
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
      // On hide, revert to default small dot instead of disappearing
      hide: () => setState((s) => ({ ...s, visible: true, variant: 'default' })),
      move: (x, y) => setState((s) => ({ ...s, x, y })),
      setText: (t) => setState((s) => ({ ...s, text: t })),
      isTouch,
    }),
    [isTouch]
  );

  // Global mouse tracking so the cursor is consistent across the site (disabled on mobile/tablet)
  useEffect(() => {
    if (isTouch || typeof window === 'undefined') return;

    const CLICKABLE_SELECTOR =
      'a, button, [role="button"], input[type="button"], input[type="submit"], img, picture, figure, img[alt="Logo"], [data-cursor-clickable="true"]';

    let rafId: number | null = null;
    let lastX = 0,
      lastY = 0,
      lastVariant: CursorVariant = 'default';

    const handleMove = (e: MouseEvent) => {
      const target = e.target as Element | null;
      const overClickable = !!(target && target.closest(CLICKABLE_SELECTOR));
      lastX = e.clientX;
      lastY = e.clientY;
      lastVariant = overClickable ? 'arrow' : 'default';
      if (rafId == null) {
        rafId = window.requestAnimationFrame(() => {
          setState((s) => {
            if (s.x === lastX && s.y === lastY && s.variant === lastVariant && s.visible) return s;
            return { ...s, x: lastX, y: lastY, variant: lastVariant, visible: true };
          });
          rafId = null;
        });
      }
    };
    const handleLeave = () => setState((s) => ({ ...s, visible: false, variant: 'default' }));

    window.addEventListener('mousemove', handleMove, { passive: true } as any);
    window.addEventListener('mouseleave', handleLeave as any);

    return () => {
      if (rafId != null) cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', handleMove as any);
      window.removeEventListener('mouseleave', handleLeave as any);
    };
  }, [isTouch]);

  // Hide native cursor globally on non-touch desktop only
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const styleId = 'custom-cursor-hide-style';
    const existing = document.getElementById(styleId);
    if (existing) existing.parentElement?.removeChild(existing);
    if (!isTouch) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `html, body, * { cursor: none !important; }`;
      document.head.appendChild(style);
      return () => {
        style.parentElement?.removeChild(style);
      };
    }
  }, [isTouch]);

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
