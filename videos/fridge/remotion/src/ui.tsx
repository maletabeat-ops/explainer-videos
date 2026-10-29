import React from 'react';
export const FPS = 30;
export const C = {red: '#ff5a4f', gold: '#ffc94d', teal: '#2ee6c9', violet: '#a98bff', sky: '#5fc8ff', ice: '#bfefff', cyan: '#4de1ff', orange: '#ff9a3c', cream: '#f2f8ff', mute: '#93a7c4', ink: '#07121f', pink: '#ff5fa2', green: '#3ddc84'};
export const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const P = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
export const eout = (k: number) => 1 - Math.pow(1 - k, 3);
export const eio = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
export const back = (k: number) => {const c = 1.9; return k <= 0 ? 0 : 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2);};
export const pop = (t: number, t0: number, d = 0.45) => back(P(t, t0, t0 + d));
export const DISPLAY = 'Inter Display', BODY = 'Inter';
type Pos = {x: number; y: number; s?: number; rot?: number; o?: number};
export const At: React.FC<Pos & {children: React.ReactNode}> = ({x, y, s = 1, rot = 0, o = 1, children}) =>
	s <= 0.001 ? null : (
		<div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${s}) rotate(${rot}deg)`, opacity: o, whiteSpace: 'nowrap'}}>{children}</div>
	);
export const Pill: React.FC<{text: string; bg: string; size?: number; fg?: string}> = ({text, bg, size = 36, fg = C.ink}) => (
	<div style={{background: bg, color: fg, fontFamily: DISPLAY, fontWeight: 900, fontSize: size, padding: `${size * 0.38}px ${size * 0.75}px`, borderRadius: 999, boxShadow: `0 0 34px ${bg}88`, lineHeight: 1}}>{text}</div>
);
export const Badge: React.FC<{text: string; col: string; size?: number}> = ({text, col, size = 64}) => (
	<div style={{color: col, fontFamily: DISPLAY, fontWeight: 900, fontSize: size, padding: `${size * 0.3}px ${size * 0.5}px`, borderRadius: 28, border: `5px solid ${col}`, background: 'rgba(11,15,34,.88)', boxShadow: `0 0 40px ${col}aa, inset 0 0 20px ${col}33`, textShadow: `0 0 24px ${col}`, lineHeight: 1}}>{text}</div>
);
export const Card: React.FC<{w: number; col: string; children: React.ReactNode; pad?: number}> = ({w, col, children, pad = 34}) => (
	<div style={{width: w, padding: pad, borderRadius: 32, background: 'rgba(11,15,34,.92)', border: `4px solid ${col}`, boxShadow: `0 0 34px ${col}77`, boxSizing: 'border-box', whiteSpace: 'normal'}}>{children}</div>
);
export const Title: React.FC<{text: string; col: string; size: number; glow?: string}> = ({text, col, size, glow}) => (
	<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: size, color: col, textShadow: glow ? `0 0 34px ${glow}` : '0 6px 24px rgba(0,0,0,.7)', lineHeight: 1.02, textAlign: 'center'}}>{text}</div>
);
export const SwissCross: React.FC<{size: number}> = ({size}) => (
	<div style={{width: size, height: size, background: C.red, borderRadius: size * 0.18, position: 'relative', boxShadow: `0 0 30px ${C.red}99`}}>
		<div style={{position: 'absolute', left: '40%', top: '18%', width: '20%', height: '64%', background: '#fff'}} />
		<div style={{position: 'absolute', top: '40%', left: '18%', height: '20%', width: '64%', background: '#fff'}} />
	</div>
);
export const Person: React.FC<{col: string; size?: number; hat?: boolean}> = ({col, size = 90, hat}) => (
	<svg width={size} height={size * 1.25} viewBox="0 0 80 100">
		<circle cx="40" cy="26" r="17" fill={col} />
		<path d="M10 96 C10 62 22 50 40 50 C58 50 70 62 70 96 Z" fill={col} />
		{hat ? <path d="M20 22 C20 6 60 6 60 22 L66 24 L14 24 Z" fill={C.gold} /> : null}
	</svg>
);
