import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, DISPLAY, BODY, FPS, clamp, eout} from './ui';

// ---------------- watch dial (generic, no brand marks) with sweeping seconds ----------------
export const Dial: React.FC<{size: number; t: number; tiltX?: number; tiltY?: number; glow?: number; hours?: number; minutes?: number; date?: string}> = ({size, t, tiltX = 12, tiltY = -10, glow = 0.5, hours = 10.15, minutes = 9, date = '28'}) => {
	const R = 100;
	const sec = (t * 6) % 360; // smooth sweep
	const hA = (hours / 12) * 360, mA = (minutes / 60) * 360;
	const sheen = 30 + 40 * Math.sin(t * 0.6);
	return (
		<div style={{width: size, height: size, perspective: 1600}}>
			<div style={{width: size, height: size, transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`, transformStyle: 'preserve-3d', filter: `drop-shadow(0 30px 40px rgba(0,0,0,.6)) drop-shadow(0 0 ${30 * glow}px rgba(217,180,95,${0.4 * glow}))`}}>
				<svg width={size} height={size} viewBox="-120 -120 240 240">
					<defs>
						<radialGradient id="sun" cx="40%" cy="35%" r="75%"><stop offset="0" stopColor="#1f9a6d" /><stop offset=".55" stopColor="#0f6446" /><stop offset="1" stopColor="#06311f" /></radialGradient>
						<linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f6e2a4" /><stop offset=".45" stopColor="#c99a3e" /><stop offset=".7" stopColor="#f3d98e" /><stop offset="1" stopColor="#8f6a22" /></linearGradient>
						<linearGradient id="steel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f2f4f3" /><stop offset=".5" stopColor="#9aa3a0" /><stop offset="1" stopColor="#e8ecea" /></linearGradient>
						<linearGradient id="glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="rgba(255,255,255,.28)" /><stop offset=".35" stopColor="rgba(255,255,255,0)" /></linearGradient>
					</defs>
					{/* case + fluted bezel */}
					<circle r={118} fill="url(#steel)" />
					{Array.from({length: 60}).map((_, i) => <line key={i} x1={0} y1={-117} x2={0} y2={-105} stroke="rgba(0,0,0,.28)" strokeWidth={1.6} transform={`rotate(${i * 6})`} />)}
					<circle r={104} fill="url(#gold)" />
					<circle r={96} fill="url(#sun)" />
					{/* sunburst rays */}
					{Array.from({length: 72}).map((_, i) => <line key={'r' + i} x1={0} y1={0} x2={0} y2={-95} stroke="rgba(255,255,255,.035)" strokeWidth={2} transform={`rotate(${i * 5 + sheen * 0.1})`} />)}
					{/* minute track */}
					{Array.from({length: 60}).map((_, i) => i % 5 ? <line key={'m' + i} x1={0} y1={-92} x2={0} y2={-88} stroke="rgba(244,239,226,.7)" strokeWidth={0.8} transform={`rotate(${i * 6})`} /> : null)}
					{/* hour indices */}
					{Array.from({length: 12}).map((_, i) => {
						if (i === 0) return <path key={'h' + i} d="M-7 -88 L7 -88 L0 -74 Z" fill="url(#gold)" />;
						if (i === 3) return <rect key={'h' + i} x={58} y={-8} width={22} height={16} rx={2} fill="#fbfaf6" stroke="url(#gold)" strokeWidth={1.5} />;
						return <rect key={'h' + i} x={-3.2} y={-88} width={6.4} height={i % 3 ? 14 : 18} rx={1.2} fill="url(#gold)" transform={`rotate(${i * 30})`} />;
					})}
					<text x={69} y={5} textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize={11} fill="#111">{date}</text>
					{/* hands */}
					<g transform={`rotate(${hA})`}><path d="M-4 10 L-4 -40 L0 -50 L4 -40 L4 10 Z" fill="url(#gold)" /><circle cy={-40} r={7} fill="none" stroke="url(#gold)" strokeWidth={3} /></g>
					<g transform={`rotate(${mA})`}><path d="M-3 12 L-3 -72 L0 -80 L3 -72 L3 12 Z" fill="url(#gold)" /></g>
					<g transform={`rotate(${sec})`}><line x1={0} y1={18} x2={0} y2={-86} stroke="#f4efe2" strokeWidth={1.4} /><circle cy={-60} r={3.5} fill="#f4efe2" /></g>
					<circle r={4} fill="url(#gold)" />
					{/* crystal reflection */}
					<circle r={96} fill="url(#glass)" />
					<path d={`M-80 -40 Q -30 -${70 + sheen * 0.2} 40 -88`} stroke="rgba(255,255,255,.18)" strokeWidth={10} fill="none" strokeLinecap="round" />
				</svg>
			</div>
		</div>
	);
};

// ---------------- background: deep green + gold light ----------------
export const GreenBg: React.FC<{w?: number; h?: number}> = ({w = 1080, h = 1920}) => {
	const t = useCurrentFrame() / FPS;
	return (
		<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 30%, #12543d 0%, #0a2f22 45%, #04110c 100%)', overflow: 'hidden'}}>
			<svg width={w} height={h} style={{position: 'absolute', inset: 0, opacity: 0.08}}>
				{Array.from({length: 40}).map((_, i) => <line key={i} x1={w / 2} y1={h * 0.32} x2={w / 2 + Math.cos(i / 40 * Math.PI * 2 + t * 0.03) * 2000} y2={h * 0.32 + Math.sin(i / 40 * Math.PI * 2 + t * 0.03) * 2000} stroke="#d9b45f" strokeWidth={2} />)}
			</svg>
			<div style={{position: 'absolute', left: w / 2 - 520, top: h * 0.1, width: 1040, height: 800, borderRadius: '50%', background: 'rgba(217,180,95,.08)', filter: 'blur(70px)'}} />
		</AbsoluteFill>
	);
};

// ---------------- flags ----------------
export const Flag: React.FC<{c: 'de' | 'uk' | 'ch' | 'us'; w: number}> = ({c, w}) => {
	const h = c === 'ch' ? w * 0.8 : w * 0.6;
	const box: React.CSSProperties = {width: c === 'ch' ? h : w, height: h, borderRadius: 8, overflow: 'hidden', boxShadow: '0 6px 20px rgba(0,0,0,.5)', position: 'relative', display: 'flex', flexDirection: 'column'};
	if (c === 'de') return <div style={box}>{['#000', '#dd0000', '#ffce00'].map((x) => <div key={x} style={{flex: 1, background: x}} />)}</div>;
	if (c === 'ch') return <div style={{...box, background: '#d52b1e'}}><div style={{position: 'absolute', left: '40%', top: '18%', width: '20%', height: '64%', background: '#fff'}} /><div style={{position: 'absolute', top: '40%', left: '18%', height: '20%', width: '64%', background: '#fff'}} /></div>;
	if (c === 'uk') return (
		<div style={box}><svg width={w} height={h} viewBox="0 0 60 30" preserveAspectRatio="none">
			<rect width="60" height="30" fill="#012169" /><path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" /><path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="2" />
			<path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" /><path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
		</svg></div>
	);
	return <div style={box}>{Array.from({length: 13}).map((_, i) => <div key={i} style={{flex: 1, background: i % 2 ? '#fff' : '#b22234'}} />)}<div style={{position: 'absolute', left: 0, top: 0, width: w * 0.4, height: h * (7 / 13), background: '#3c3b6e'}} /></div>;
};

// ---------------- word typing (R-O-L-E-X) ----------------
export const Typed: React.FC<{text: string; k: number; size: number; col: string}> = ({text, k, size, col}) => {
	const n = Math.floor(k * text.length + 0.001);
	return <div style={{fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: size, color: col, letterSpacing: size * 0.08, textShadow: `0 0 30px ${col}66`}}>{text.slice(0, n)}<span style={{opacity: k < 1 ? 0.8 : 0}}>|</span></div>;
};

// ---------------- sea waves with the watch ----------------
export const Sea: React.FC<{w: number; h: number; t: number}> = ({w, h, t}) => (
	<svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{overflow: 'visible'}}>
		<defs><linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2a8fae" stopOpacity=".85" /><stop offset="1" stopColor="#06303d" stopOpacity=".95" /></linearGradient></defs>
		{[0, 1, 2].map((i) => {
			const y = h * 0.3 + i * 26, ph = t * (1.2 + i * 0.3) + i;
			const d = `M0 ${y} ` + Array.from({length: 21}).map((_, j) => `L${(j / 20) * w} ${y + Math.sin(j * 0.7 + ph) * 14}`).join(' ') + ` L${w} ${h} L0 ${h} Z`;
			return <path key={i} d={d} fill="url(#sea)" opacity={0.55 + i * 0.2} />;
		})}
		{Array.from({length: 14}).map((_, i) => {const k = (t * 0.35 + i / 14) % 1; return <circle key={i} cx={(i * 137) % w} cy={h - k * h * 0.6} r={3 + (i % 3) * 2} fill="rgba(255,255,255,.35)" opacity={1 - k} />;})}
	</svg>
);

// ---------------- Everest ↔ Mariana trench scale ----------------
export const DepthScale: React.FC<{h: number; k: number; up: number; down: number; L: {top: string; sea: string; bottom: string}}> = ({h, k, up, down, L}) => {
	const total = 8849 + 10916, y0 = (8849 / total) * h;
	const yWatch = y0 - up * y0 + down * (h - y0);
	return (
		<div style={{position: 'relative', width: 760, height: h}}>
			<svg width={760} height={h} style={{position: 'absolute', left: 0, top: 0}}>
				<path d={`M120 ${y0} L300 ${y0 * 0.08} L360 ${y0 * 0.2} L480 ${y0} Z`} fill="#dfe8ea" opacity={0.9 * k} />
				<path d={`M300 ${y0 * 0.08} L330 ${y0 * 0.14} L300 ${y0 * 0.18} L275 ${y0 * 0.14} Z`} fill="#fff" opacity={k} />
				<rect x={0} y={y0} width={760} height={h - y0} fill="url(#dg)" opacity={k} />
				<defs><linearGradient id="dg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1f6f8b" /><stop offset="1" stopColor="#020a10" /></linearGradient></defs>
				<path d={`M0 ${h * 0.92} L260 ${h * 0.92} L330 ${h - 4} L400 ${h * 0.92} L760 ${h * 0.92} L760 ${h} L0 ${h} Z`} fill="#071b22" opacity={k} />
				<line x1={0} y1={y0} x2={760} y2={y0} stroke="#cfe9f1" strokeWidth={3} opacity={k} />
			</svg>
			<div style={{position: 'absolute', right: 0, top: 0, fontFamily: DISPLAY, fontWeight: 900, fontSize: 34, color: C.white}}>{L.top}</div>
			<div style={{position: 'absolute', right: 0, top: y0 + 8, fontFamily: DISPLAY, fontWeight: 800, fontSize: 28, color: '#cfe9f1'}}>{L.sea}</div>
			<div style={{position: 'absolute', right: 0, bottom: -42, fontFamily: DISPLAY, fontWeight: 900, fontSize: 34, color: C.gold}}>{L.bottom}</div>
			<div style={{position: 'absolute', left: 330 - 34, top: Math.min(yWatch, h - 40) - 34, width: 68, height: 68, borderRadius: 34, background: 'radial-gradient(circle at 40% 35%, #1f9a6d, #06311f)', border: '6px solid #d9b45f', boxShadow: '0 0 24px rgba(217,180,95,.7)', opacity: k}} />
		</div>
	);
};

// ---------------- ownership: foundation card ----------------
export const Ownership: React.FC<{w: number; k: number; L: {own: string; fnd: string; no1: string; no2: string}; n1: number; n2: number}> = ({w, k, L, n1, n2}) => (
	<div style={{width: w, padding: 34, borderRadius: 30, background: 'rgba(7,20,15,.92)', border: `4px solid ${C.gold}`, boxShadow: `0 0 40px ${C.gold}44`, boxSizing: 'border-box', textAlign: 'center', whiteSpace: 'normal'}}>
		<div style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 30, color: C.mute}}>{L.own}</div>
		<div style={{position: 'relative', width: 280, height: 280, margin: '18px auto', borderRadius: '50%', background: `conic-gradient(${C.gold} 0 ${100 * k}%, rgba(244,239,226,.1) ${100 * k}% 100%)`}}>
			<div style={{position: 'absolute', inset: 50, borderRadius: '50%', background: '#07140f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: DISPLAY, fontWeight: 900, fontSize: 50, color: C.gold}}>{Math.round(100 * k)}%</div>
		</div>
		<div style={{fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 44, color: C.cream}}>{L.fnd}</div>
		<div style={{display: 'flex', gap: 14, justifyContent: 'center', marginTop: 18}}>
			{[L.no1, L.no2].map((x, i) => <div key={i} style={{transform: `scale(${[n1, n2][i]})`, fontFamily: DISPLAY, fontWeight: 900, fontSize: 26, color: C.red, border: `4px solid ${C.red}`, borderRadius: 12, padding: '6px 14px'}}>✕ {x}</div>)}
		</div>
	</div>
);

// ---------------- waitlist ticket display ----------------
export const QueueBoard: React.FC<{w: number; t: number; t0: number; L: {now: string; you: string}}> = ({w, t, t0, L}) => {
	const now = 47 + Math.floor(Math.max(0, t - t0) * 0.4);
	const you = 2318;
	return (
		<div style={{width: w, padding: 28, borderRadius: 26, background: '#050807', border: '4px solid #2a3a33', boxShadow: '0 20px 50px rgba(0,0,0,.6), inset 0 0 40px rgba(0,0,0,.8)', boxSizing: 'border-box'}}>
			{[[L.now, now, C.red], [L.you, you, C.gold]].map(([lab, v, col]: any, i) => (
				<div key={i} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 6px', borderTop: i ? '2px solid #1b2622' : undefined}}>
					<div style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 34, color: C.mute}}>{lab}</div>
					<div style={{fontFamily: 'Courier New, monospace', fontWeight: 700, fontSize: 84, color: col, textShadow: `0 0 18px ${col}`}}>#{String(v).padStart(4, '0')}</div>
				</div>
			))}
		</div>
	);
};

export const Counter: React.FC<{k: number; to: number; fmt: (v: number) => string; col: string; size: number}> = ({k, to, fmt, col, size}) => (
	<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: size, color: col, textShadow: `0 0 40px ${col}88`, lineHeight: 1}}>{fmt(to * eout(clamp(k)))}</div>
);

// ---------------- persistent bracelet timeline ----------------
export const Bracelet: React.FC<{w: number; years: string[]; pos: number; o: number}> = ({w, years, pos, o}) => {
	const n = years.length, lw = w / n;
	return (
		<div style={{display: 'flex', width: w, height: 92, opacity: o, filter: 'drop-shadow(0 10px 20px rgba(0,0,0,.6))'}}>
			{years.map((y, i) => {
				const on = clamp(1 - Math.abs(pos - i) * 1.5), past = pos >= i - 0.02;
				return (
					<div key={i} style={{width: lw, height: 92, display: 'flex', gap: 3, padding: '0 2px', boxSizing: 'border-box'}}>
						<div style={{flex: 1, borderRadius: '10px 4px 4px 10px', background: 'linear-gradient(180deg,#e9ecea,#8d9692 55%,#cfd4d1)'}} />
						<div style={{flex: 2.2, borderRadius: 6, background: past ? 'linear-gradient(180deg,#f6e2a4,#c99a3e 55%,#f3d98e)' : 'linear-gradient(180deg,#f4f6f5,#a9b1ad 55%,#e5e9e7)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: on > 0.3 ? `0 0 ${24 * on}px ${C.gold}` : undefined}}>
							<span style={{fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 24 + 8 * on, color: past ? '#3a2a08' : '#4a524e'}}>{y}</span>
						</div>
						<div style={{flex: 1, borderRadius: '4px 10px 10px 4px', background: 'linear-gradient(180deg,#e9ecea,#8d9692 55%,#cfd4d1)'}} />
					</div>
				);
			})}
		</div>
	);
};
export const Card: React.FC<{w: number; col: string; top: string; big: string; sub?: string}> = ({w, col, top, big, sub}) => (
	<div style={{width: w, padding: 22, borderRadius: 24, background: 'rgba(7,20,15,.9)', border: `3px solid ${col}`, boxShadow: `0 0 26px ${col}44`, boxSizing: 'border-box', textAlign: 'center', whiteSpace: 'normal'}}>
		<div style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 24, color: C.mute}}>{top}</div>
		<div style={{fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 50, color: col, lineHeight: 1.15}}>{big}</div>
		{sub ? <div style={{fontFamily: BODY, fontWeight: 700, fontSize: 22, color: C.cream, marginTop: 6}}>{sub}</div> : null}
	</div>
);
