import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, DISPLAY, BODY, FPS, clamp, eout} from './ui';

// ---------------- big glossy push button (crosswalk style) ----------------
export const PushButton: React.FC<{size: number; press: number; glow?: number; label?: string; fake?: number}> = ({size, press, glow = 0, label, fake = 0}) => {
	const p = clamp(press);
	return (
		<div style={{position: 'relative', width: size * 1.3, height: size * 1.75, borderRadius: size * 0.12, background: 'linear-gradient(160deg,#ffe46b,#e0a800)', boxShadow: `0 30px 60px rgba(0,0,0,.6), inset 0 -10px 0 rgba(0,0,0,.18), 0 0 ${40 * glow}px rgba(255,210,58,${0.6 * glow})`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-evenly'}}>
			{/* walking-person sign */}
			<div style={{width: size * 0.9, height: size * 0.5, borderRadius: 12, background: '#16181f', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16}}>
				<svg width={size * 0.3} height={size * 0.42} viewBox="0 0 30 42"><circle cx="16" cy="5" r="4" fill="#e9fbff" /><path d="M15 11 L10 24 L14 25 L12 40 M15 11 L20 25 L24 40 M15 14 L22 20 M14 14 L7 19" stroke="#e9fbff" strokeWidth="3.4" fill="none" strokeLinecap="round" /></svg>
				{label ? <div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: size * 0.11, color: '#e9fbff', lineHeight: 1.05, whiteSpace: 'pre-line'}}>{label}</div> : null}
			</div>
			{/* the button */}
			<div style={{position: 'relative', width: size * 0.62, height: size * 0.62, borderRadius: '50%', background: 'radial-gradient(circle at 50% 50%, #3a3d46, #16181f)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 6px 14px rgba(0,0,0,.6)'}}>
				<div style={{width: size * 0.46, height: size * 0.46, borderRadius: '50%', background: 'radial-gradient(circle at 38% 32%, #f4f7ff, #9aa2b6 70%, #6a7184)', transform: `translateY(${p * size * 0.025}px) scale(${1 - 0.06 * p})`, boxShadow: `0 ${(1 - p) * 10}px ${(1 - p) * 14}px rgba(0,0,0,.55)`}} />
				{p > 0 ? <div style={{position: 'absolute', inset: -size * 0.15 * p, borderRadius: '50%', border: `4px solid rgba(255,255,255,${0.6 * (1 - p)})`}} /> : null}
			</div>
			{fake > 0 ? <div style={{position: 'absolute', top: '42%', left: '50%', transform: `translate(-50%,-50%) rotate(-14deg) scale(${2.2 - 1.2 * eout(clamp(fake * 3))})`, opacity: Math.min(1, fake * 4), fontFamily: DISPLAY, fontWeight: 900, fontSize: size * 0.24, color: C.red, border: `${size * 0.03}px solid ${C.red}`, borderRadius: 18, padding: `0 ${size * 0.08}px`, background: 'rgba(20,4,4,.82)', whiteSpace: 'nowrap'}}>FAKE</div> : null}
		</div>
	);
};

// ---------------- traffic light that ignores you ----------------
export const TrafficLight: React.FC<{h: number; t: number; phase?: number}> = ({h, t, phase = 0}) => {
	const cyc = ((t + phase) % 9) / 9; const red = cyc < 0.55, amber = cyc >= 0.55 && cyc < 0.65, green = cyc >= 0.65;
	const lamp = (on: boolean, col: string) => <div style={{width: h * 0.22, height: h * 0.22, borderRadius: '50%', background: on ? col : '#2a2d36', boxShadow: on ? `0 0 ${h * 0.12}px ${col}` : 'inset 0 4px 10px rgba(0,0,0,.6)'}} />;
	return (
		<div style={{width: h * 0.34, height: h, borderRadius: h * 0.06, background: '#16181f', border: '4px solid #2c303a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-evenly', boxShadow: '0 20px 50px rgba(0,0,0,.6)'}}>
			{lamp(red, C.red)}{lamp(amber, C.amber)}{lamp(green, C.green)}
		</div>
	);
};
export const Clock: React.FC<{size: number; t: number}> = ({size, t}) => (
	<svg width={size} height={size} viewBox="0 0 100 100">
		<circle cx="50" cy="50" r="46" fill="#16181f" stroke={C.cyan} strokeWidth="4" />
		{Array.from({length: 12}).map((_, i) => <line key={i} x1="50" y1="8" x2="50" y2="14" stroke={C.cyan} strokeWidth="3" transform={`rotate(${i * 30} 50 50)`} />)}
		<line x1="50" y1="50" x2="50" y2="22" stroke="#fff" strokeWidth="4" strokeLinecap="round" transform={`rotate(${t * 120} 50 50)`} />
		<line x1="50" y1="50" x2="50" y2="30" stroke={C.yellow} strokeWidth="5" strokeLinecap="round" transform={`rotate(${t * 10} 50 50)`} />
	</svg>
);

// ---------------- elevator panel ----------------
export const LiftPanel: React.FC<{w: number; pressClose: number; fire: number; fake: number}> = ({w, pressClose, fire, fake}) => (
	<div style={{position: 'relative', width: w, padding: w * 0.08, borderRadius: w * 0.06, background: 'linear-gradient(160deg,#c9cfdc,#7a8296)', boxShadow: '0 30px 60px rgba(0,0,0,.6)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: w * 0.05}}>
		<div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: w * 0.04}}>
			{[7, 8, 9, 4, 5, 6, 1, 2, 3].map((n) => <div key={n} style={{width: w * 0.2, height: w * 0.2, borderRadius: '50%', background: 'radial-gradient(circle at 40% 35%, #f4f7ff, #a8b0c2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: DISPLAY, fontWeight: 900, fontSize: w * 0.08, color: '#2a2f3a', boxShadow: '0 4px 8px rgba(0,0,0,.35)'}}>{n}</div>)}
		</div>
		<div style={{display: 'flex', gap: w * 0.08}}>
			{[['◀|▶', false], ['▶|◀', true]].map(([lbl, isClose]: any, i) => {
				const p = isClose ? clamp(pressClose) : 0;
				return <div key={i} style={{position: 'relative', width: w * 0.28, height: w * 0.28, borderRadius: '50%', background: isClose ? `radial-gradient(circle at 40% 35%, #fff, ${p > 0 ? '#ffd23a' : '#a8b0c2'})` : 'radial-gradient(circle at 40% 35%, #f4f7ff, #a8b0c2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: DISPLAY, fontWeight: 900, fontSize: w * 0.075, color: '#2a2f3a', transform: `scale(${1 - 0.07 * p})`, boxShadow: isClose && p > 0 ? `0 0 30px ${C.yellow}` : '0 4px 8px rgba(0,0,0,.35)'}}>{lbl}
					{isClose && fake > 0 ? <div style={{position: 'absolute', inset: -w * 0.03, borderRadius: '50%', border: `${w * 0.025}px solid ${C.red}`, opacity: Math.min(1, fake * 3)}}><div style={{position: 'absolute', left: '50%', top: '50%', width: '120%', height: w * 0.025, background: C.red, transform: 'translate(-50%,-50%) rotate(-45deg)'}} /></div> : null}
				</div>;
			})}
		</div>
		<div style={{display: 'flex', alignItems: 'center', gap: 10, padding: '6px 14px', borderRadius: 12, background: fire > 0.5 ? C.red : '#3a3f4c', transition: 'none'}}>
			<svg width={w * 0.1} height={w * 0.1} viewBox="0 0 20 20"><path d="M10 1 C13 6 17 8 15 14 C14 18 11 19 10 19 C8 19 4 18 4 13 C4 9 8 8 10 1 Z" fill={fire > 0.5 ? '#fff' : '#ffb03a'} /></svg>
			<div style={{fontFamily: 'Courier New, monospace', fontWeight: 700, fontSize: w * 0.06, color: '#fff'}}>FIRE KEY</div>
		</div>
	</div>
);

// ---------------- fake thermostat ----------------
export const Thermostat: React.FC<{size: number; turn: number; wire: number; temp: number}> = ({size, turn, wire, temp}) => (
	<div style={{position: 'relative', width: size, height: size * 1.25}}>
		<div style={{position: 'absolute', inset: 0, borderRadius: size * 0.12, background: 'linear-gradient(160deg,#eef1f6,#b9c0cf)', boxShadow: '0 30px 60px rgba(0,0,0,.6)'}} />
		<div style={{position: 'absolute', left: size * 0.12, right: size * 0.12, top: size * 0.12, height: size * 0.32, borderRadius: 14, background: '#0d1a14', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Courier New, monospace', fontWeight: 700, fontSize: size * 0.2, color: '#5dff9a', textShadow: '0 0 12px #5dff9a'}}>{temp.toFixed(0)}°</div>
		<div style={{position: 'absolute', left: '50%', top: size * 0.75, width: size * 0.48, height: size * 0.48, marginLeft: -size * 0.24, marginTop: -size * 0.24 + size * 0.1, borderRadius: '50%', background: 'radial-gradient(circle at 40% 35%, #fff, #9aa2b6)', transform: `rotate(${turn * 160 - 80}deg)`, boxShadow: '0 6px 14px rgba(0,0,0,.35)'}}>
			<div style={{position: 'absolute', left: '50%', top: 8, width: 8, height: size * 0.12, marginLeft: -4, borderRadius: 4, background: C.red}} />
		</div>
		{/* unplugged wire behind */}
		{wire > 0 ? <svg width={size * 1.4} height={size * 0.8} viewBox="0 0 140 80" style={{position: 'absolute', left: size * 0.5, top: size * 1.05, opacity: clamp(wire), overflow: 'visible'}}>
			<path d="M0 0 C 10 40 50 20 70 50" stroke="#e44" strokeWidth="5" fill="none" strokeLinecap="round" />
			<path d="M70 50 l10 6 M70 50 l12 -2" stroke="#ccc" strokeWidth="3" />
			<text x="90" y="72" fontFamily={DISPLAY} fontWeight={900} fontSize="18" fill={C.red}>✕</text>
		</svg> : null}
	</div>
);

// ---------------- stress / control meters ----------------
export const Meter: React.FC<{w: number; label: string; v: number; col: string}> = ({w, label, v, col}) => (
	<div style={{width: w}}>
		<div style={{display: 'flex', justifyContent: 'space-between', fontFamily: DISPLAY, fontWeight: 900, fontSize: 34, color: C.white, marginBottom: 8}}><span>{label}</span><span style={{color: col}}>{Math.round(clamp(v) * 100)}%</span></div>
		<div style={{height: 34, borderRadius: 17, background: 'rgba(255,255,255,.08)', overflow: 'hidden'}}><div style={{width: `${clamp(v) * 100}%`, height: '100%', borderRadius: 17, background: col, boxShadow: `0 0 20px ${col}`}} /></div>
	</div>
);

// ---------------- persistent "case file": 3 suspects ----------------
export const CaseFile: React.FC<{items: string[]; stamps: number[]; o: number; active: number}> = ({items, stamps, o, active}) => (
	<div style={{display: 'flex', gap: 16, opacity: o}}>
		{items.map((x, i) => {const s = clamp(stamps[i]); const on = active === i; return (
			<div key={i} style={{position: 'relative', width: 280, height: 96, borderRadius: 18, background: on ? 'rgba(255,210,58,.16)' : 'rgba(255,255,255,.05)', border: `3px solid ${on ? C.yellow : 'rgba(255,255,255,.18)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: on ? `0 0 24px ${C.yellow}66` : undefined}}>
				<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 28, color: on ? C.white : C.mute}}>{x}</div>
				{s > 0 ? <div style={{position: 'absolute', right: -8, top: -14, transform: `rotate(-12deg) scale(${2 - eout(s)})`, opacity: Math.min(1, s * 3), fontFamily: DISPLAY, fontWeight: 900, fontSize: 22, color: '#fff', background: C.red, borderRadius: 8, padding: '2px 10px'}}>FAKE?</div> : null}
			</div>
		);})}
	</div>
);
export const CityBg: React.FC<{w?: number; h?: number}> = ({w = 1080, h = 1920}) => {
	const t = useCurrentFrame() / FPS;
	return (
		<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 30%, #1d2436 0%, #10141f 50%, #06080d 100%)', overflow: 'hidden'}}>
			{/* zebra crossing stripes in perspective */}
			<svg width={w} height={h} style={{position: 'absolute', inset: 0, opacity: 0.13}}>
				{Array.from({length: 9}).map((_, i) => {const y = h * 0.62 + i * 70 + ((t * 40) % 70); const sp = (y - h * 0.55) / (h * 0.45); return <rect key={i} x={w / 2 - w * 0.6 * sp} y={y} width={w * 1.2 * sp} height={26 + 18 * sp} fill="#fff" />;})}
			</svg>
			{Array.from({length: 14}).map((_, i) => <div key={i} style={{position: 'absolute', left: (i * 173) % w, top: (i * 337) % (h * 0.5), width: 6, height: 6, borderRadius: 3, background: [C.yellow, C.red, C.green][i % 3], opacity: 0.25 + 0.25 * Math.sin(t * 2 + i), filter: 'blur(1px)'}} />)}
			<div style={{position: 'absolute', left: w / 2 - 520, top: h * 0.12, width: 1040, height: 760, borderRadius: '50%', background: 'rgba(255,210,58,.07)', filter: 'blur(70px)'}} />
		</AbsoluteFill>
	);
};
export const Card: React.FC<{w: number; col: string; top: string; big: string; sub?: string}> = ({w, col, top, big, sub}) => (
	<div style={{width: w, padding: 22, borderRadius: 24, background: 'rgba(10,13,20,.9)', border: `3px solid ${col}`, boxShadow: `0 0 26px ${col}44`, boxSizing: 'border-box', textAlign: 'center', whiteSpace: 'normal'}}>
		<div style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 26, color: C.mute}}>{top}</div>
		<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 52, color: col, lineHeight: 1.1}}>{big}</div>
		{sub ? <div style={{fontFamily: BODY, fontWeight: 700, fontSize: 24, color: C.white, marginTop: 6}}>{sub}</div> : null}
	</div>
);
