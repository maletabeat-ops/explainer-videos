import React from 'react';
export const FPS = 30;
export const C = {lime: '#d4ff3a', cyan: '#3ad7ff', white: '#f4f7fa', red: '#ff2a3d', gold: '#ffc94d', amber: '#ffa23a', violet: '#8b7bff', hose: '#2fbf5a', mute: '#8a97a6', ink: '#0a0d10', graphite: '#151b22', bone: '#f4f7fa', pumpkin: '#d4ff3a'};
export const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const P = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
export const eout = (k: number) => 1 - Math.pow(1 - k, 3);
export const eio = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
export const back = (k: number) => {const c = 1.9; return k <= 0 ? 0 : 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2);};
export const pop = (t: number, t0: number, d = 0.45) => back(P(t, t0, t0 + d));
export const DISPLAY = 'Inter Display', BODY = 'Inter';
type Pos = {x: number; y: number; s?: number; rot?: number; o?: number};
export const At: React.FC<Pos & {children: React.ReactNode}> = ({x, y, s = 1, rot = 0, o = 1, children}) =>
	s <= 0.001 || o <= 0.001 ? null : (
		<div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${s}) rotate(${rot}deg)`, opacity: o, whiteSpace: 'nowrap'}}>{children}</div>
	);
export const Pill: React.FC<{text: string; bg: string; size?: number; fg?: string}> = ({text, bg, size = 36, fg = C.ink}) => (
	<div style={{background: bg, color: fg, fontFamily: DISPLAY, fontWeight: 900, fontSize: size, padding: `${size * 0.38}px ${size * 0.75}px`, borderRadius: 999, boxShadow: `0 0 34px ${bg}88`, lineHeight: 1}}>{text}</div>
);
export const Badge: React.FC<{text: string; col: string; size?: number}> = ({text, col, size = 64}) => (
	<div style={{color: col, fontFamily: DISPLAY, fontWeight: 900, fontSize: size, padding: `${size * 0.3}px ${size * 0.5}px`, borderRadius: 28, border: `5px solid ${col}`, background: 'rgba(10,13,16,.9)', boxShadow: `0 0 40px ${col}aa, inset 0 0 20px ${col}33`, textShadow: `0 0 24px ${col}`, lineHeight: 1}}>{text}</div>
);
export const Title: React.FC<{text: string; col: string; size: number; glow?: string}> = ({text, col, size, glow}) => (
	<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: size, color: col, textShadow: glow ? `0 0 34px ${glow}` : '0 6px 24px rgba(0,0,0,.7)', lineHeight: 1.02, textAlign: 'center'}}>{text}</div>
);
export const Txt: React.FC<{text: string; col?: string; size?: number}> = ({text, col = C.bone, size = 38}) => (
	<div style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: size, color: col, textShadow: '0 3px 14px rgba(0,0,0,.8)', textAlign: 'center'}}>{text}</div>
);
