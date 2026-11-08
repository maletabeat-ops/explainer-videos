import React, {useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';
import {C, DISPLAY, BODY, FPS, clamp, eout} from './ui';

// ---------------- 3D contour bottle (generic, no logo) ----------------
const PROF: [number, number][] = [[0, 0], [0.26, 0], [0.3, 0.05], [0.34, 0.32], [0.33, 0.62], [0.245, 0.98], [0.28, 1.22], [0.345, 1.5], [0.31, 1.76], [0.21, 2.02], [0.14, 2.28], [0.13, 2.45], [0.15, 2.5], [0.15, 2.56], [0.12, 2.58]];
export const Bottle3D: React.FC<{w: number; h: number; t: number; fill?: number; spin?: number; dist?: number; glow?: number; tilt?: number}> = ({w, h, t, fill = 0.72, spin = 0.4, dist = 6.5, glow = 0.4, tilt = 0}) => {
	const glass = useMemo(() => {
		const g = new THREE.LatheGeometry(PROF.map(([r, y]) => new THREE.Vector2(r, y)), 96, 0, Math.PI * 2);
		const p = g.attributes.position.array as Float32Array;
		for (let i = 0; i < p.length; i += 3) {
			const x = p[i], y = p[i + 1], z = p[i + 2];
			const band = y > 0.35 && y < 1.9 ? Math.sin(((y - 0.35) / 1.55) * Math.PI) : 0;
			const a = Math.atan2(z, x);
			const k = 1 + 0.06 * band * Math.cos(a * 10);
			p[i] = x * k; p[i + 2] = z * k;
		}
		g.computeVertexNormals();
		return g;
	}, []);
	const top = 0.1 + 1.85 * clamp(fill);
	const liquid = useMemo(() => {
		const pts: any[] = [];
		for (const [r, y] of PROF) if (y <= top) pts.push(new THREE.Vector2(Math.max(0, r - 0.03), y + 0.03));
		pts.push(new THREE.Vector2(0.2, top), new THREE.Vector2(0, top));
		return new THREE.LatheGeometry(pts, 64);
	}, [top]);
	return (
		<div style={{width: w, height: h, filter: `drop-shadow(0 0 ${20 + 40 * glow}px rgba(255,42,61,${0.25 + 0.4 * glow}))`}}>
			<ThreeCanvas width={w} height={h} camera={{fov: 28, position: [0, 1.4, dist]}}>
				<ambientLight intensity={0.5} />
				<directionalLight position={[3, 5, 4]} intensity={2.2} />
				<directionalLight position={[-4, 3, -2]} intensity={1.2} color="#ff6a6a" />
				<pointLight position={[1.5, 1.2, 2]} intensity={2} color="#ffffff" distance={6} />
				<group position={[0, -1.1, 0]} rotation={[0, t * spin, tilt]}>
					<mesh geometry={liquid}><meshStandardMaterial color="#3a1206" emissive="#5a1a08" emissiveIntensity={0.55} roughness={0.12} /></mesh>
					<mesh geometry={glass}><meshStandardMaterial color="#b9ecd2" roughness={0.04} metalness={0.3} transparent opacity={0.42} side={THREE.DoubleSide} depthWrite={false} /></mesh>
					{/* crown cap */}
					<mesh position={[0, 2.62, 0]}><cylinderGeometry args={[0.16, 0.17, 0.08, 21]} /><meshStandardMaterial color="#e4002b" metalness={0.6} roughness={0.3} /></mesh>
					{/* rising bubbles */}
					{Array.from({length: 16}).map((_, i) => {const q = (t * 0.5 + i / 16) % 1; const y = 0.15 + q * (top - 0.2); return <mesh key={i} position={[Math.sin(i * 2.4 + t) * 0.14, y, Math.cos(i * 1.7) * 0.12]}><sphereGeometry args={[0.012 + (i % 3) * 0.006, 8, 8]} /><meshBasicMaterial color="#ffd9b8" transparent opacity={0.7 * (1 - q)} /></mesh>;})}
					{/* highlight strip */}
					<mesh position={[0.22, 1.2, 0.18]}><boxGeometry args={[0.02, 1.6, 0.02]} /><meshBasicMaterial color="#ffffff" transparent opacity={0.45} /></mesh>
				</group>
			</ThreeCanvas>
		</div>
	);
};

// ---------------- background ----------------
export const RedBg: React.FC<{w?: number; h?: number; snow?: number; night?: number}> = ({w = 1080, h = 1920, snow = 0, night = 0}) => {
	const t = useCurrentFrame() / FPS;
	return (
		<AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 30%, ${night > 0.5 ? '#1b2a52' : '#5a0710'} 0%, ${night > 0.5 ? '#0b1430' : '#2a0306'} 50%, #0d0102 100%)`, overflow: 'hidden'}}>
			{/* ribbon wave */}
			<svg width={w} height={h} style={{position: 'absolute', inset: 0, opacity: 0.12 * (1 - night)}}>
				<path d={`M0 ${h * 0.62} C ${w * 0.3} ${h * 0.55} ${w * 0.6} ${h * 0.72} ${w} ${h * 0.6} L ${w} ${h * 0.66} C ${w * 0.6} ${h * 0.78} ${w * 0.3} ${h * 0.61} 0 ${h * 0.68} Z`} fill="#ffffff" />
			</svg>
			{Array.from({length: 40}).map((_, i) => {const q = ((t * 0.08 + i / 40) % 1); return <div key={i} style={{position: 'absolute', left: ((i * 271) % w) + Math.sin(t + i) * 20, top: q * h, width: 6 + (i % 3) * 3, height: 6 + (i % 3) * 3, borderRadius: 10, background: '#fff', opacity: snow * (0.5 + 0.3 * Math.sin(i))}} />;})}
			{Array.from({length: 22}).map((_, i) => {const q = ((t * 0.12 + i / 22) % 1); return <div key={'b' + i} style={{position: 'absolute', left: (i * 131) % w, top: h * (1 - q), width: 10 + (i % 4) * 6, height: 10 + (i % 4) * 6, borderRadius: 20, border: '2px solid rgba(255,255,255,.25)', opacity: (1 - snow) * (1 - q) * 0.7}} />;})}
		</AbsoluteFill>
	);
};

// ---------------- persistent bottle-cap timeline ----------------
const Cap: React.FC<{size: number; on: number; past: boolean; label: string}> = ({size, on, past, label}) => {
	const pts = Array.from({length: 42}).map((_, i) => {const a = (i / 42) * Math.PI * 2; const r = i % 2 ? 46 : 50; return `${50 + Math.cos(a) * r},${50 + Math.sin(a) * r}`;}).join(' ');
	return (
		<div style={{position: 'relative', width: size, height: size, transform: `scale(${1 + 0.18 * on}) translateY(${-8 * on}px)`, filter: on > 0.3 ? `drop-shadow(0 0 ${14 * on}px ${C.red})` : undefined}}>
			<svg width={size} height={size} viewBox="0 0 100 100">
				<polygon points={pts} fill={past ? '#e4002b' : '#4a1418'} />
				<circle cx="50" cy="50" r="38" fill={past ? '#ff2a3d' : '#3a1013'} stroke="rgba(255,255,255,.35)" strokeWidth="2" />
			</svg>
			<div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: DISPLAY, fontWeight: 900, fontSize: size * 0.24, color: past ? '#fff' : 'rgba(255,255,255,.45)'}}>{label}</div>
		</div>
	);
};
export const CapRow: React.FC<{years: string[]; pos: number; o: number; size?: number}> = ({years, pos, o, size = 104}) => (
	<div style={{display: 'flex', gap: 14, opacity: o}}>{years.map((y, i) => <Cap key={i} size={size} on={clamp(1 - Math.abs(pos - i) * 1.5)} past={pos >= i - 0.02} label={y} />)}</div>
);

// ---------------- 9 glasses counter ----------------
export const Glasses: React.FC<{n: number; k: number; size?: number}> = ({n, k, size = 74}) => (
	<div style={{display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', width: (size + 10) * Math.min(n, 9)}}>
		{Array.from({length: n}).map((_, i) => {const f = clamp(k * n - i); return (
			<svg key={i} width={size} height={size * 1.3} viewBox="0 0 40 52" style={{opacity: 0.3 + 0.7 * Math.min(1, f * 2)}}>
				<path d="M6 4 L34 4 L30 48 L10 48 Z" fill="rgba(255,255,255,.12)" stroke="#fff" strokeWidth="2" />
				<path d={`M${10 - 2 * f} ${48 - 40 * f} L${30 + 2 * f} ${48 - 40 * f} L30 48 L10 48 Z`} fill="#8a2e10" />
				{f > 0.9 ? <circle cx="20" cy="12" r="2" fill="#ffd9b8" /> : null}
			</svg>
		);})}
	</div>
);

// ---------------- dollar bill ----------------
export const Bill: React.FC<{w: number; stamp: number; label: string}> = ({w, stamp, label}) => (
	<div style={{position: 'relative', width: w, height: w * 0.45, borderRadius: 14, background: 'linear-gradient(135deg,#3f8f5a,#1f5f3a)', border: '6px solid #bfe8c8', boxShadow: '0 16px 40px rgba(0,0,0,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
		<div style={{position: 'absolute', inset: 14, border: '2px dashed rgba(220,255,230,.5)', borderRadius: 8}} />
		<div style={{width: w * 0.22, height: w * 0.22, borderRadius: '50%', border: '4px solid #d8f5de', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: w * 0.13, color: '#e8ffe8'}}>1</div>
		<div style={{position: 'absolute', left: 30, top: 18, fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: w * 0.07, color: '#e8ffe8'}}>$1</div>
		<div style={{position: 'absolute', right: 30, bottom: 18, fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: w * 0.07, color: '#e8ffe8'}}>$1</div>
		{stamp > 0 ? <div style={{position: 'absolute', transform: `rotate(-12deg) scale(${2 - eout(stamp)})`, opacity: Math.min(1, stamp * 3), fontFamily: DISPLAY, fontWeight: 900, fontSize: w * 0.07, color: C.red, border: `6px solid ${C.red}`, borderRadius: 12, padding: '6px 18px', background: 'rgba(30,5,5,.75)', whiteSpace: 'nowrap'}}>{label}</div> : null}
	</div>
);

// ---------------- 79-day calendar ----------------
export const Calendar: React.FC<{k: number; size: number; label: string}> = ({k, size, label}) => (
	<div style={{width: size, borderRadius: 22, overflow: 'hidden', background: '#fff8f2', boxShadow: '0 16px 40px rgba(0,0,0,.6)', textAlign: 'center'}}>
		<div style={{background: C.deep, color: '#fff', fontFamily: DISPLAY, fontWeight: 900, fontSize: size * 0.12, padding: '10px 0'}}>{label}</div>
		<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: size * 0.42, color: C.ink, padding: '6px 0 14px'}}>{Math.round(79 * eout(clamp(k)))}</div>
	</div>
);

// ---------------- Santa colour history swatches ----------------
export const SantaSwatches: React.FC<{k: number; red: number; L: string[]}> = ({k, red, L}) => (
	<div style={{display: 'flex', gap: 16, alignItems: 'flex-end'}}>
		{[['#3f7a3a', L[0]], ['#2f4f9a', L[1]], ['#a07a4a', L[2]], ['#e4002b', L[3]]].map(([c, l], i) => {const v = clamp(k * 4 - i); const isRed = i === 3; return (
			<div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, opacity: v, transform: `scale(${isRed ? 1 + 0.25 * red : 0.9})`}}>
				<svg width={isRed ? 260 : 170} height={isRed ? 260 : 170} viewBox="0 0 100 100" style={{filter: isRed && red > 0 ? `drop-shadow(0 0 ${20 * red}px ${C.red})` : undefined}}>
					<path d="M18 74 C22 40 46 14 74 20 C64 30 66 46 70 74 Z" fill={c} />
					<rect x="12" y="70" width="64" height="16" rx="8" fill="#fff8f2" />
					<circle cx="78" cy="20" r="9" fill="#fff8f2" />
				</svg>
				<div style={{fontFamily: BODY, fontWeight: 700, fontSize: isRed ? 40 : 28, color: isRed ? C.white : C.mute}}>{l}</div>
			</div>
		);})}
	</div>
);

// ---------------- holiday trucks ----------------
export const Truck: React.FC<{w: number; t: number; ph: number}> = ({w, t, ph}) => (
	<svg width={w} height={w * 0.45} viewBox="0 0 220 100">
		<rect x="4" y="14" width="150" height="62" rx="6" fill="#c8001f" />
		<path d="M154 34 L190 34 L210 54 L210 76 L154 76 Z" fill="#a8001a" />
		<rect x="166" y="40" width="22" height="16" rx="2" fill="#9fe0ff" opacity="0.8" />
		{[30, 120, 182].map((x) => <g key={x}><circle cx={x} cy="80" r="13" fill="#111" /><circle cx={x} cy="80" r="5" fill="#666" /></g>)}
		{Array.from({length: 26}).map((_, i) => {const x = 8 + i * 5.6; const on = Math.sin(t * 6 + i * 0.9 + ph) > -0.2; return <circle key={i} cx={x} cy="16" r="2.2" fill={on ? '#ffe9a8' : '#7a5a2a'} />;})}
		{Array.from({length: 12}).map((_, i) => {const on = Math.sin(t * 6 + i + ph) > 0; return <circle key={'v' + i} cx="6" cy={20 + i * 4.8} r="2" fill={on ? '#ffe9a8' : '#7a5a2a'} />;})}
		<path d="M30 46 C 60 30 90 62 130 40" stroke="#ffffff" strokeWidth="6" fill="none" opacity="0.9" />
		<circle cx="210" cy="64" r="4" fill="#ffe9a8" />
	</svg>
);

export const Counter: React.FC<{k: number; to: number; fmt: (v: number) => string; col: string; size: number}> = ({k, to, fmt, col, size}) => (
	<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: size, color: col, textShadow: `0 0 40px ${col}88`, lineHeight: 1}}>{fmt(to * eout(clamp(k)))}</div>
);
export const Card: React.FC<{w: number; col: string; top: string; big: string; sub?: string}> = ({w, col, top, big, sub}) => (
	<div style={{width: w, padding: 22, borderRadius: 24, background: 'rgba(26,3,6,.9)', border: `3px solid ${col}`, boxShadow: `0 0 26px ${col}44`, boxSizing: 'border-box', textAlign: 'center', whiteSpace: 'normal'}}>
		<div style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 26, color: C.mute}}>{top}</div>
		<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 50, color: col, lineHeight: 1.12}}>{big}</div>
		{sub ? <div style={{fontFamily: BODY, fontWeight: 700, fontSize: 24, color: C.white, marginTop: 6}}>{sub}</div> : null}
	</div>
);
