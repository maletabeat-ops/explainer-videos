import React, {useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';
import {C, DISPLAY, BODY, FPS, clamp, eout} from './ui';

// ---------------- 3D dumbbell ----------------
export const Dumbbell3D: React.FC<{w: number; h: number; t: number; spin?: number; glow?: number; dist?: number}> = ({w, h, t, spin = 0.5, glow = 0.5, dist = 7}) => {
	const plates = [-1.15, -0.95, 0.95, 1.15];
	return (
		<div style={{width: w, height: h, filter: `drop-shadow(0 0 ${20 + 40 * glow}px rgba(255,61,154,${0.25 + 0.4 * glow}))`}}>
			<ThreeCanvas width={w} height={h} camera={{fov: 30, position: [0, 1.2, dist]}}>
				<ambientLight intensity={0.5} />
				<directionalLight position={[3, 5, 4]} intensity={2.2} />
				<directionalLight position={[-4, 1, -3]} intensity={1.4} color="#3d8bff" />
				<pointLight position={[0, -2, 3]} intensity={2} color="#ff3d9a" distance={8} />
				<group rotation={[0.3 + Math.sin(t * 0.7) * 0.08, 0.45 + Math.sin(t * spin) * 0.35, 0.18]}>
					<mesh rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.09, 0.09, 2.2, 24]} /><meshStandardMaterial color="#d8dde8" metalness={0.9} roughness={0.25} /></mesh>
					{/* knurling */}
					{Array.from({length: 14}).map((_, i) => <mesh key={i} position={[-0.6 + i * 0.09, 0, 0]} rotation={[0, 0, Math.PI / 2]}><torusGeometry args={[0.092, 0.006, 6, 20]} /><meshStandardMaterial color="#9aa3b5" metalness={0.8} roughness={0.4} /></mesh>)}
					{plates.map((x, i) => <mesh key={'p' + i} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[i === 1 || i === 2 ? 0.62 : 0.5, i === 1 || i === 2 ? 0.62 : 0.5, 0.2, 48]} /><meshStandardMaterial color={i === 1 || i === 2 ? '#1a1630' : '#ff3d9a'} metalness={0.4} roughness={0.35} emissive={i === 1 || i === 2 ? '#000' : '#ff3d9a'} emissiveIntensity={0.15 + 0.3 * glow} /></mesh>)}
					{[-1.32, 1.32].map((x) => <mesh key={x} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.14, 0.14, 0.12, 24]} /><meshStandardMaterial color="#d8dde8" metalness={0.9} roughness={0.25} /></mesh>)}
				</group>
			</ThreeCanvas>
		</div>
	);
};

// ---------------- background ----------------
export const GymBg: React.FC<{w?: number; h?: number}> = ({w = 1080, h = 1920}) => {
	const t = useCurrentFrame() / FPS;
	return (
		<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 30%, #2a1450 0%, #140b2a 50%, #07050f 100%)', overflow: 'hidden'}}>
			<svg width={w} height={h} style={{position: 'absolute', inset: 0, opacity: 0.18}}>
				{Array.from({length: 7}).map((_, i) => <rect key={i} x={-200 + ((i * 260 + t * 40) % (w + 400))} y={0} width={60} height={h} fill={i % 2 ? '#ff3d9a' : '#3d8bff'} transform={`skewX(-18)`} opacity={0.35} />)}
			</svg>
			<div style={{position: 'absolute', left: w * 0.5 - 520, top: h * 0.08, width: 1040, height: 800, borderRadius: '50%', background: 'rgba(255,61,154,.08)', filter: 'blur(70px)'}} />
		</AbsoluteFill>
	);
};

// ---------------- generic phone with a feed (no real app UI) ----------------
export const Phone: React.FC<{w: number; children: React.ReactNode; tilt?: number}> = ({w, children, tilt = 0}) => (
	<div style={{width: w, height: w * 2.05, borderRadius: w * 0.12, background: '#0d0b18', border: `${w * 0.03}px solid #2c2846`, boxShadow: '0 30px 60px rgba(0,0,0,.6), 0 0 40px rgba(255,61,154,.25)', overflow: 'hidden', position: 'relative', transform: `perspective(1400px) rotateY(${tilt}deg)`}}>
		<div style={{position: 'absolute', top: w * 0.03, left: '50%', width: w * 0.3, height: w * 0.06, marginLeft: -w * 0.15, borderRadius: 20, background: '#000', zIndex: 3}} />
		{children}
	</div>
);
export const Profile: React.FC<{w: number; followers: number; label: string; fmt: (v: number) => string}> = ({w, followers, label, fmt}) => (
	<div style={{padding: w * 0.07, paddingTop: w * 0.14, color: C.white}}>
		<div style={{display: 'flex', alignItems: 'center', gap: w * 0.05}}>
			<div style={{width: w * 0.22, height: w * 0.22, borderRadius: '50%', background: `conic-gradient(${C.pink}, ${C.blue}, ${C.volt}, ${C.pink})`, padding: 5, boxSizing: 'border-box'}}><div style={{width: '100%', height: '100%', borderRadius: '50%', background: '#2c2846', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><svg width="60%" height="60%" viewBox="0 0 40 40"><path d="M6 20 h4 M30 20 h4 M10 14 v12 M30 14 v12 M13 17 v6 M27 17 v6 M13 20 h14" stroke="#fff" strokeWidth="3" strokeLinecap="round" /></svg></div></div>
			<div>
				<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: w * 0.12, lineHeight: 1}}>{fmt(followers)}</div>
				<div style={{fontFamily: BODY, fontWeight: 700, fontSize: w * 0.05, color: C.mute}}>{label}</div>
			</div>
		</div>
	</div>
);
export const FeedCard: React.FC<{w: number; col: string; title: string; icon: 'dumbbell' | 'food' | 'ba'; k: number}> = ({w, col, title, icon, k}) => (
	<div style={{margin: `${w * 0.03}px ${w * 0.06}px`, height: w * 0.42, borderRadius: w * 0.05, background: `linear-gradient(135deg, ${col}, #1a1630)`, display: 'flex', alignItems: 'center', gap: w * 0.05, padding: w * 0.05, boxSizing: 'border-box', opacity: clamp(k), transform: `translateY(${(1 - eout(clamp(k))) * 60}px)`}}>
		<svg width={w * 0.24} height={w * 0.24} viewBox="0 0 40 40">
			{icon === 'dumbbell' ? <path d="M4 20 h4 M32 20 h4 M8 12 v16 M32 12 v16 M12 15 v10 M28 15 v10 M12 20 h16" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" /> : null}
			{icon === 'food' ? <g><circle cx="20" cy="22" r="13" fill="none" stroke="#fff" strokeWidth="3" /><path d="M14 18 q6 -8 12 0" stroke="#fff" strokeWidth="3" fill="none" /></g> : null}
			{icon === 'ba' ? <g><rect x="3" y="8" width="15" height="24" rx="3" fill="none" stroke="#fff" strokeWidth="3" /><rect x="22" y="8" width="15" height="24" rx="3" fill="#fff" /><path d="M10 16 v10 M29 16 v10" stroke={col} strokeWidth="5" /></g> : null}
		</svg>
		<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: w * 0.075, color: '#fff', whiteSpace: 'normal', lineHeight: 1.05}}>{title}</div>
	</div>
);

// ---------------- coins / money popups ----------------
export const MoneyPop: React.FC<{t: number; t0: number; text: string; n?: number; col?: string}> = ({t, t0, text, n = 6, col = C.volt}) => (
	<>{Array.from({length: n}).map((_, i) => {const k = (t - t0 - i * 0.45); if (k < 0 || k > 1.6) return null; return <div key={i} style={{position: 'absolute', left: 120 + ((i * 197) % 760), top: 1020 - k * 200, fontFamily: DISPLAY, fontWeight: 900, fontSize: 52, color: col, opacity: 1 - k / 1.6, textShadow: `0 0 16px ${col}`}}>{text}</div>;})}</>
);
export const PromoTag: React.FC<{w: number; code: string; pct: string; k: number}> = ({w, code, pct, k}) => (
	<div style={{position: 'relative', width: w, height: w * 0.42, borderRadius: 26, background: '#fff', display: 'flex', alignItems: 'center', boxShadow: '0 20px 50px rgba(0,0,0,.5)', overflow: 'hidden'}}>
		<div style={{width: w * 0.36, height: '100%', background: C.pink, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: DISPLAY, fontWeight: 900, fontSize: w * 0.13, color: '#fff'}}>{pct}</div>
		<div style={{flex: 1, textAlign: 'center', fontFamily: 'Courier New, monospace', fontWeight: 700, fontSize: w * 0.1, color: C.ink, letterSpacing: 4}}>{code.slice(0, Math.max(0, Math.round(code.length * clamp(k))))}</div>
		<div style={{position: 'absolute', left: w * 0.36 - 14, top: -14, width: 28, height: 28, borderRadius: 14, background: '#140b2a'}} />
		<div style={{position: 'absolute', left: w * 0.36 - 14, bottom: -14, width: 28, height: 28, borderRadius: 14, background: '#140b2a'}} />
	</div>
);

// ---------------- copy grid (one video sold 1000x) ----------------
export const CopyGrid: React.FC<{k: number; cols?: number; rows?: number; size?: number}> = ({k, cols = 10, rows = 8, size = 72}) => (
	<div style={{display: 'grid', gridTemplateColumns: `repeat(${cols}, ${size}px)`, gap: 8}}>
		{Array.from({length: cols * rows}).map((_, i) => {const v = clamp(k * cols * rows * 1.1 - i); return <div key={i} style={{width: size, height: size * 0.62, borderRadius: 8, background: i === 0 ? C.pink : 'rgba(61,139,255,.75)', opacity: i === 0 ? 1 : v, transform: `scale(${0.6 + 0.4 * v})`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><svg width={size * 0.3} height={size * 0.3} viewBox="0 0 10 10"><path d="M2 1 L9 5 L2 9 Z" fill="#fff" /></svg></div>;})}
	</div>
);

// ---------------- generic energy can ----------------
export const Can: React.FC<{h: number; col: string; col2: string; label: string}> = ({h, col, col2, label}) => (
	<div style={{position: 'relative', width: h * 0.42, height: h, borderRadius: `${h * 0.05}px ${h * 0.05}px ${h * 0.06}px ${h * 0.06}px`, background: `linear-gradient(90deg, ${col2} 0%, ${col} 35%, #fff8 48%, ${col} 60%, ${col2} 100%)`, boxShadow: `0 20px 50px rgba(0,0,0,.5), 0 0 40px ${col}66`}}>
		<div style={{position: 'absolute', top: -h * 0.03, left: '8%', width: '84%', height: h * 0.05, borderRadius: '50%', background: 'linear-gradient(#e8e8f0,#9a9ab0)'}} />
		<div style={{position: 'absolute', top: '38%', left: 0, right: 0, textAlign: 'center', fontFamily: DISPLAY, fontWeight: 900, fontSize: h * 0.1, color: '#fff', transform: 'rotate(-90deg)', textShadow: '0 2px 8px rgba(0,0,0,.4)'}}>{label}</div>
	</div>
);

// ---------------- 100 creators, 4 earn ----------------
export const People100: React.FC<{k: number; hi: number; size?: number}> = ({k, hi, size = 64}) => (
	<div style={{display: 'grid', gridTemplateColumns: `repeat(10, ${size}px)`, gap: 10}}>
		{Array.from({length: 100}).map((_, i) => {const v = clamp(k * 110 - i); const rich = [12, 37, 58, 83].includes(i); return (
			<svg key={i} width={size} height={size} viewBox="0 0 40 40" style={{opacity: v * (rich ? 1 : 1 - 0.65 * hi), transform: `scale(${rich ? 1 + 0.35 * hi : 1})`, filter: rich && hi > 0 ? `drop-shadow(0 0 ${10 * hi}px ${C.volt})` : undefined}}>
				<circle cx="20" cy="12" r="8" fill={rich && hi > 0 ? C.volt : '#8a84aa'} /><path d="M6 38 C6 24 13 20 20 20 C27 20 34 24 34 38 Z" fill={rich && hi > 0 ? C.volt : '#8a84aa'} />
			</svg>
		);})}
	</div>
);

// ---------------- persistent money ladder ----------------
export const Ladder: React.FC<{w: number; steps: string[]; lit: number; o: number}> = ({w, steps, lit, o}) => (
	<div style={{display: 'flex', alignItems: 'flex-end', gap: 10, width: w, opacity: o}}>
		{steps.map((s, i) => {const v = clamp(lit - i); const hgt = 46 + i * 22; return (
			<div key={i} style={{flex: 1, height: hgt, borderRadius: 14, background: v > 0 ? `linear-gradient(180deg, ${[C.mute, C.blue, C.pink, C.volt][i]}, ${[C.mute, C.blue, C.pink, C.volt][i]}aa)` : 'rgba(255,255,255,.06)', border: `2px solid ${v > 0 ? 'transparent' : 'rgba(255,255,255,.18)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: v > 0.5 && i === Math.floor(lit) - 0 ? `0 0 24px ${[C.mute, C.blue, C.pink, C.volt][i]}` : undefined, transform: `translateY(${(1 - eout(Math.max(v, 0.0001))) * 6}px)`}}>
				<span style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 24, color: v > 0 ? C.ink : 'rgba(255,255,255,.45)', textAlign: 'center', lineHeight: 1.05, padding: '0 6px'}}>{s}</span>
			</div>
		);})}
	</div>
);
export const Counter: React.FC<{k: number; to: number; fmt: (v: number) => string; col: string; size: number}> = ({k, to, fmt, col, size}) => (
	<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: size, color: col, textShadow: `0 0 40px ${col}88`, lineHeight: 1}}>{fmt(to * eout(clamp(k)))}</div>
);
export const Card: React.FC<{w: number; col: string; top: string; big: string; sub?: string}> = ({w, col, top, big, sub}) => (
	<div style={{width: w, padding: 22, borderRadius: 24, background: 'rgba(12,9,24,.9)', border: `3px solid ${col}`, boxShadow: `0 0 26px ${col}44`, boxSizing: 'border-box', textAlign: 'center', whiteSpace: 'normal'}}>
		<div style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 26, color: C.mute}}>{top}</div>
		<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 50, color: col, lineHeight: 1.12}}>{big}</div>
		{sub ? <div style={{fontFamily: BODY, fontWeight: 700, fontSize: 24, color: C.white, marginTop: 6}}>{sub}</div> : null}
	</div>
);
void useMemo; void THREE;
