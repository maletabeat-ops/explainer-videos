import React, {useMemo} from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';
import {C, DISPLAY, BODY, FPS, P, clamp, eio, eout} from './ui';

// ---------------- 3D cloud sneaker (side profile, extruded) ----------------
// pods = hose pieces under the midsole; squash = 0..1 compression on landing; pods=0..1 how many pods are glued
const upperShape = () => {
	const s = new THREE.Shape();
	s.moveTo(-2.05, 0);
	s.lineTo(1.9, 0);
	s.quadraticCurveTo(2.45, 0.02, 2.35, 0.28);
	s.quadraticCurveTo(2.1, 0.5, 1.3, 0.56);
	s.quadraticCurveTo(0.25, 0.66, -0.55, 1.05);
	s.lineTo(-0.78, 1.2);
	s.quadraticCurveTo(-0.98, 0.98, -1.4, 0.94);
	s.quadraticCurveTo(-1.88, 0.94, -2.0, 1.12);
	s.quadraticCurveTo(-2.28, 0.6, -2.05, 0);
	return s;
};
const soleShape = () => {
	const s = new THREE.Shape();
	s.moveTo(-2.15, 0.05);
	s.lineTo(2.0, 0.05);
	s.quadraticCurveTo(2.55, 0.05, 2.45, 0.22);
	s.lineTo(2.35, 0.3);
	s.lineTo(-2.1, 0.3);
	s.quadraticCurveTo(-2.3, 0.2, -2.15, 0.05);
	return s;
};
const POD_X = [-1.78, -1.27, -0.76, -0.25, 0.26, 0.77, 1.28, 1.79];
export const Sneaker3D: React.FC<{w: number; h: number; t: number; squash?: number; pods?: number; upper?: number; yaw?: number; dist?: number; glow?: number; podCol?: string}> = ({w, h, t, squash = 0, pods = 1, upper = 1, yaw = 0.35, dist = 9, glow = 0.4, podCol = C.lime}) => {
	const up = useMemo(() => new THREE.ExtrudeGeometry(upperShape(), {depth: 1.25, bevelEnabled: true, bevelSize: 0.12, bevelThickness: 0.14, bevelSegments: 6, curveSegments: 32}), []);
	const so = useMemo(() => new THREE.ExtrudeGeometry(soleShape(), {depth: 1.35, bevelEnabled: true, bevelSize: 0.06, bevelThickness: 0.06, bevelSegments: 4, curveSegments: 24}), []);
	const lace = useMemo(() => new THREE.ExtrudeGeometry((() => {const s = new THREE.Shape(); s.moveTo(-0.1, 0.85); s.quadraticCurveTo(0.6, 0.62, 1.35, 0.6); s.lineTo(1.3, 0.72); s.quadraticCurveTo(0.55, 0.76, -0.05, 1.0); s.closePath(); return s;})(), {depth: 1.66, bevelEnabled: false}), []);
	const sq = clamp(squash);
	const podH = 0.51 * (1 - 0.38 * sq);
	const lift = podH; // midsole sits on top of the pods
	return (
		<ThreeCanvas width={w} height={h} camera={{fov: 30, position: [Math.sin(yaw) * dist, 2.4, Math.cos(yaw) * dist]}}>
			<ambientLight intensity={0.6} />
			<directionalLight position={[3, 6, 5]} intensity={2.0} />
			<directionalLight position={[-5, 2, -3]} intensity={1.0} color="#3ad7ff" />
			<pointLight position={[0, -1.5, 3]} intensity={3 * glow} color={podCol} distance={8} />
			<group position={[0, -0.3, 0]}>
				{/* pods (hose pieces), axis across the shoe */}
				{POD_X.map((x, i) => {
					const k = clamp(pods * POD_X.length - i);
					if (k <= 0) return null;
					const drop = (1 - eout(k)) * 2.2;
					return (
						<group key={i} position={[x, podH / 2 + drop, 0]} scale={[1, (1 - 0.38 * sq), 1]}>
							<mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.255, 0.255, 1.3, 28, 1, true]} /><meshStandardMaterial color={podCol} roughness={0.45} side={THREE.DoubleSide} emissive={podCol} emissiveIntensity={0.15 + 0.35 * glow} /></mesh>
							<mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.15, 0.15, 1.32, 24, 1, true]} /><meshStandardMaterial color="#0a0d10" roughness={0.9} side={THREE.DoubleSide} /></mesh>
							{[-0.65, 0.65].map((z, j) => <mesh key={j} position={[0, 0, z]}><ringGeometry args={[0.15, 0.255, 28]} /><meshStandardMaterial color={podCol} side={THREE.DoubleSide} emissive={podCol} emissiveIntensity={0.2 + 0.4 * glow} /></mesh>)}
						</group>
					);
				})}
				<group position={[0, lift - 0.04, -0.68]}>
					<mesh geometry={so}><meshStandardMaterial color="#e9edf1" roughness={0.6} /></mesh>
				</group>
				{upper > 0 ? <group position={[0, lift + 0.28, -0.62]} scale={[1, eout(clamp(upper)), 1]}>
					<mesh geometry={up}><meshStandardMaterial color="#dfe5ea" roughness={0.75} metalness={0.02} /></mesh>
					{[[1.0, 0.6], [0.62, 0.66], [0.24, 0.76], [-0.14, 0.9]].map(([x, y], i) => <mesh key={i} position={[x, y + 0.1, 0.62]} rotation={[0, 0, 0.32]}><boxGeometry args={[0.07, 0.06, 0.78]} /><meshStandardMaterial color="#1b2027" roughness={0.6} /></mesh>)}
					<mesh position={[-1.18, 1.0, 0.62]} scale={[1, 0.16, 0.66]}><sphereGeometry args={[0.42, 32, 16]} /><meshStandardMaterial color="#101317" roughness={0.9} /></mesh>
					<mesh position={[-2.02, 0.75, 0.62]} scale={[0.35, 1, 1]}><boxGeometry args={[0.2, 0.55, 0.5]} /><meshStandardMaterial color={podCol} roughness={0.5} emissive={podCol} emissiveIntensity={0.25} /></mesh>
				</group> : null}
			</group>
		</ThreeCanvas>
	);
};

// ---------------- background ----------------
export const TrackBg: React.FC<{w?: number; h?: number}> = ({w = 1080, h = 1920}) => {
	const t = useCurrentFrame() / FPS;
	return (
		<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 30%, #1b2530 0%, #10161d 50%, #070a0d 100%)', overflow: 'hidden'}}>
			{/* running-track lanes in perspective */}
			<svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{position: 'absolute', left: 0, top: 0, opacity: 0.22}}>
				{Array.from({length: 9}).map((_, i) => {const x = (i - 4) / 4; return <line key={i} x1={w / 2 + x * w * 0.08} y1={h * 0.3} x2={w / 2 + x * w * 1.4} y2={h} stroke="#3ad7ff" strokeWidth={2} />;})}
				{Array.from({length: 12}).map((_, i) => {const k = ((i / 12 + t * 0.12) % 1); const y = h * 0.3 + Math.pow(k, 2.2) * h * 0.7; return <line key={'h' + i} x1={0} y1={y} x2={w} y2={y} stroke="#d4ff3a" strokeWidth={1 + k * 2} opacity={0.15 + 0.5 * k} />;})}
			</svg>
			<div style={{position: 'absolute', left: w * 0.5 - 500, top: h * 0.12, width: 1000, height: 600, borderRadius: '50%', background: 'rgba(212,255,58,.06)', filter: 'blur(60px)'}} />
		</AbsoluteFill>
	);
};

// ---------------- garden hose (coil → cut rings) ----------------
export const Hose: React.FC<{w: number; cut: number; t: number}> = ({w, cut, t}) => {
	const h = w * 0.45;
	const pts = Array.from({length: 120}).map((_, i) => {const u = i / 119; return [w * 0.06 + u * w * 0.88, h * 0.5 + Math.sin(u * Math.PI * 3 + t * 1.5) * h * 0.28];});
	const nCut = Math.floor(cut * 7);
	return (
		<svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{overflow: 'visible'}}>
			<polyline points={pts.map((p) => p.join(',')).join(' ')} fill="none" stroke="#1d7a3a" strokeWidth={46} strokeLinecap="round" />
			<polyline points={pts.map((p) => p.join(',')).join(' ')} fill="none" stroke={C.hose} strokeWidth={36} strokeLinecap="round" />
			<polyline points={pts.map((p) => [p[0], p[1] - 8].join(',')).join(' ')} fill="none" stroke="rgba(255,255,255,.35)" strokeWidth={6} strokeLinecap="round" />
			{Array.from({length: 7}).map((_, i) => {
				if (i >= nCut) return null;
				const [x, y] = pts[Math.round((i + 1) * 15)];
				return <g key={i}><rect x={x - 5} y={y - 34} width={10} height={68} fill="#0a0d10" /><path d={`M${x - 22} ${y - 46} L${x + 22} ${y + 46}`} stroke={C.white} strokeWidth={3} opacity={clamp(1 - (cut * 7 - i - 1) * 2)} /></g>;
			})}
		</svg>
	);
};
export const Scissors: React.FC<{size: number; open: number}> = ({size, open}) => (
	<svg width={size} height={size} viewBox="0 0 100 100">
		<g transform={`rotate(${-12 * open} 50 50)`}><path d="M50 50 L96 40 L96 46 Z" fill="#cfd8e0" /><circle cx="26" cy="36" r="13" fill="none" stroke={C.red} strokeWidth="7" /><path d="M36 42 L50 50" stroke={C.red} strokeWidth="7" /></g>
		<g transform={`rotate(${12 * open} 50 50)`}><path d="M50 50 L96 60 L96 54 Z" fill="#e6edf2" /><circle cx="26" cy="64" r="13" fill="none" stroke={C.red} strokeWidth="7" /><path d="M36 58 L50 50" stroke={C.red} strokeWidth="7" /></g>
		<circle cx="50" cy="50" r="4" fill="#5a6672" />
	</svg>
);

// ---------------- 1839: rubber + silence ----------------
export const RubberBlob: React.FC<{size: number; t: number; cure: number}> = ({size, t, cure}) => {
	const wob = (1 - cure) * 10;
	const r = (a: number) => 40 + Math.sin(a * 3 + t * 4) * wob * 0.6 + Math.cos(a * 5 - t * 3) * wob * 0.4;
	const d = Array.from({length: 36}).map((_, i) => {const a = (i / 36) * Math.PI * 2; return `${i ? 'L' : 'M'}${50 + Math.cos(a) * r(a) * (cure ? 1 + 0.25 * cure : 1)} ${50 + Math.sin(a) * r(a) * (1 - 0.45 * cure)}`;}).join(' ') + 'Z';
	return (
		<svg width={size} height={size} viewBox="0 0 100 100" style={{overflow: 'visible'}}>
			<path d={d} fill={cure > 0.5 ? '#2a2f36' : '#8a5a2b'} stroke={cure > 0.5 ? C.white : C.amber} strokeWidth={2} />
			{cure > 0.6 ? <path d="M22 50 h56 M26 42 h48 M26 58 h48" stroke="rgba(255,255,255,.25)" strokeWidth="2" /> : null}
		</svg>
	);
};
export const SoundBars: React.FC<{w: number; t: number; quiet: number}> = ({w, t, quiet}) => (
	<div style={{display: 'flex', alignItems: 'center', gap: 8, height: 120}}>
		{Array.from({length: 18}).map((_, i) => <div key={i} style={{width: w / 18 - 8, height: 8 + (1 - quiet) * 100 * Math.abs(Math.sin(t * 9 + i * 0.7)), borderRadius: 6, background: quiet > 0.5 ? C.cyan : C.amber}} />)}
	</div>
);

// ---------------- 1936 ----------------
export const Medal: React.FC<{size: number}> = ({size}) => (
	<svg width={size} height={size * 1.4} viewBox="0 0 60 84">
		<path d="M14 0 L26 34 L34 34 L22 0 Z" fill="#2a6fdb" /><path d="M46 0 L34 34 L26 34 L38 0 Z" fill={C.red} />
		<circle cx="30" cy="56" r="24" fill={C.gold} stroke="#b88a1c" strokeWidth="4" />
		<circle cx="30" cy="56" r="15" fill="none" stroke="#fff3c0" strokeWidth="2" />
	</svg>
);
export const Brother: React.FC<{size: number; col: string; flip?: boolean}> = ({size, col, flip}) => (
	<svg width={size} height={size * 1.25} viewBox="0 0 80 100" style={{transform: flip ? 'scaleX(-1)' : undefined}}>
		<circle cx="40" cy="26" r="17" fill={col} />
		<path d="M10 100 C10 62 22 50 40 50 C58 50 70 62 70 100 Z" fill={col} />
		<path d="M26 22 C30 14 50 14 54 22 L54 18 C50 8 30 8 26 18 Z" fill="#0a0d10" opacity="0.5" />
	</svg>
);

// ---------------- 1971 waffle iron ----------------
export const WaffleIron: React.FC<{w: number; open: number; t: number; steam: number}> = ({w, open, t, steam}) => {
	const h = w * 0.7;
	return (
		<div style={{position: 'relative', width: w, height: h}}>
			{/* bottom plate with waffle sole */}
			<div style={{position: 'absolute', left: 0, bottom: 0, width: w, height: h * 0.42, borderRadius: 30, background: 'linear-gradient(#3a424c,#20262e)', boxShadow: '0 20px 40px rgba(0,0,0,.6)'}}>
				<div style={{position: 'absolute', left: w * 0.12, top: h * 0.06, width: w * 0.76, height: h * 0.28, borderRadius: '45% 55% 50% 50% / 60% 60% 40% 40%', background: `repeating-linear-gradient(0deg, transparent 0 14px, rgba(0,0,0,.45) 14px 18px), repeating-linear-gradient(90deg, #e8b46a 0 14px, #b97a35 14px 18px)`, opacity: clamp(open * 2), boxShadow: `0 0 ${30 * steam}px ${C.amber}`}} />
			</div>
			{/* lid */}
			<div style={{position: 'absolute', left: 0, bottom: h * 0.38, width: w, height: h * 0.4, borderRadius: 30, background: 'linear-gradient(#4a535e,#2a3038)', transformOrigin: '50% 100%', transform: `perspective(900px) rotateX(${70 * open}deg)`, boxShadow: '0 -6px 20px rgba(0,0,0,.4)'}}>
				<div style={{position: 'absolute', left: '50%', top: 18, width: 140, height: 24, marginLeft: -70, borderRadius: 12, background: '#111'}} />
			</div>
			{Array.from({length: 6}).map((_, i) => {const k = (t * 0.6 + i / 6) % 1; return <div key={i} style={{position: 'absolute', left: w * (0.2 + i * 0.12), bottom: h * 0.5 + k * h * 0.5, width: 26, height: 60, borderRadius: 20, background: 'rgba(255,255,255,.35)', filter: 'blur(10px)', opacity: steam * (1 - k)}} />;})}
		</div>
	);
};

// ---------------- 2021 IPO ticker ----------------
export const Ticker: React.FC<{w: number; h: number; k: number; t: number}> = ({w, h, k, t}) => {
	const pts = useMemo(() => {let v = 0.25; return Array.from({length: 60}).map((_, i) => {v += 0.012 + Math.sin(i * 1.7) * 0.025; return [i / 59, Math.min(0.95, v)];});}, []);
	const n = Math.max(2, Math.round(60 * k));
	const path = pts.slice(0, n).map(([x, y], i) => `${i ? 'L' : 'M'}${x * w} ${h - y * h}`).join(' ');
	const last = pts[n - 1];
	return (
		<div style={{position: 'relative', width: w, height: h + 70, borderRadius: 24, background: 'rgba(10,13,16,.9)', border: `3px solid ${C.cyan}55`, padding: 0}}>
			<div style={{position: 'absolute', left: 24, top: 14, fontFamily: DISPLAY, fontWeight: 900, fontSize: 40, color: C.white}}>NYSE: ONON <span style={{color: C.lime}}>▲</span></div>
			<svg width={w} height={h} style={{position: 'absolute', left: 0, top: 70}}>
				{[0.25, 0.5, 0.75].map((y) => <line key={y} x1={0} x2={w} y1={h * y} y2={h * y} stroke="rgba(255,255,255,.08)" />)}
				<path d={path} fill="none" stroke={C.lime} strokeWidth={6} strokeLinejoin="round" />
				<circle cx={last[0] * w} cy={h - last[1] * h} r={10 + 3 * Math.sin(t * 8)} fill={C.lime} />
			</svg>
		</div>
	);
};

// ---------------- sales bars ----------------
export const SalesBars: React.FC<{w: number; h: number; t: number; t0: number; rows: [string, number][]; fmt: (v: number) => string}> = ({w, h, t, t0, rows, fmt}) => {
	const max = Math.max(...rows.map((r) => r[1]));
	const bw = w / rows.length;
	return (
		<div style={{position: 'relative', width: w, height: h}}>
			{rows.map(([y, v], i) => {
				const k = eout(P(t, t0 + i * 0.35, t0 + i * 0.35 + 0.7));
				const bh = (h - 120) * (v / max) * k;
				const last = i === rows.length - 1;
				return (
					<div key={i} style={{position: 'absolute', left: i * bw + bw * 0.15, bottom: 50, width: bw * 0.7}}>
						<div style={{position: 'absolute', bottom: bh + 10, width: '100%', textAlign: 'center', fontFamily: DISPLAY, fontWeight: 900, fontSize: last ? 40 : 30, color: last ? C.lime : C.white, opacity: k}}>{fmt(v)}</div>
						<div style={{position: 'absolute', bottom: 0, width: '100%', height: bh, borderRadius: '14px 14px 4px 4px', background: last ? C.lime : 'rgba(58,215,255,.55)', boxShadow: last ? `0 0 30px ${C.lime}` : undefined}} />
						<div style={{position: 'absolute', bottom: -46, width: '100%', textAlign: 'center', fontFamily: BODY, fontWeight: 700, fontSize: 28, color: C.mute}}>{y}</div>
					</div>
				);
			})}
		</div>
	);
};

// ---------------- persistent footprint trail ----------------
const Foot: React.FC<{size: number; col: string; flip?: boolean}> = ({size, col, flip}) => (
	<svg width={size * 0.55} height={size} viewBox="0 0 44 80" style={{transform: flip ? 'scaleX(-1)' : undefined}}>
		<path d="M22 4 C34 4 40 16 38 32 C36 44 30 48 30 56 C30 66 34 76 22 76 C10 76 12 64 12 56 C12 46 6 40 6 28 C6 14 12 4 22 4 Z" fill={col} />
		{[0, 1, 2, 3, 4, 5, 6].map((i) => <rect key={i} x={10} y={12 + i * 9} width={24} height={2.5} fill="rgba(0,0,0,.35)" />)}
	</svg>
);
export const StepTrail: React.FC<{w: number; years: string[]; pos: number; t: number; o: number}> = ({w, years, pos, t, o}) => {
	const n = years.length, step = w / (n - 1);
	return (
		<div style={{position: 'relative', width: w, height: 110, opacity: o}}>
			<div style={{position: 'absolute', left: 0, right: 0, top: 40, height: 4, borderRadius: 2, background: 'repeating-linear-gradient(90deg, rgba(244,247,250,.45) 0 14px, transparent 14px 24px)'}} />
			{years.map((y, i) => {
				const stamped = pos >= i - 0.02;
				const on = clamp(1 - Math.abs(pos - i) * 1.5);
				const stampK = eout(clamp((pos - i + 0.3) * 3));
				return (
					<div key={i} style={{position: 'absolute', left: i * step, top: 42, transform: 'translate(-50%,-50%)'}}>
						<div style={{transform: `rotate(${i % 2 ? 12 : -12}deg) scale(${stamped ? 0.9 + 0.3 * on * (1 - stampK * 0.3) : 0.75})`, opacity: stamped ? 1 : 0.25, filter: on > 0.2 ? `drop-shadow(0 0 ${14 * on}px ${C.lime})` : undefined}}>
							<Foot size={66} col={stamped ? (on > 0.3 ? C.lime : 'rgba(212,255,58,.55)') : 'rgba(244,247,250,.4)'} flip={i % 2 === 1} />
						</div>
						<div style={{position: 'absolute', left: '50%', top: 44, transform: 'translateX(-50%)', fontFamily: DISPLAY, fontWeight: 900, fontSize: 28 + 8 * on, color: on > 0.3 ? C.lime : 'rgba(244,247,250,.7)', whiteSpace: 'nowrap'}}>{y}</div>
					</div>
				);
			})}
		</div>
	);
};
export const SwissFlag: React.FC<{size: number}> = ({size}) => (
	<div style={{width: size, height: size, background: C.red, borderRadius: size * 0.16, position: 'relative', boxShadow: `0 0 30px ${C.red}99`}}>
		<div style={{position: 'absolute', left: '40%', top: '18%', width: '20%', height: '64%', background: '#fff'}} />
		<div style={{position: 'absolute', top: '40%', left: '18%', height: '20%', width: '64%', background: '#fff'}} />
	</div>
);
export const TennisBall: React.FC<{size: number; t: number}> = ({size, t}) => (
	<svg width={size} height={size} viewBox="0 0 100 100" style={{transform: `rotate(${t * 90}deg)`}}>
		<circle cx="50" cy="50" r="46" fill="#d8f03a" />
		<path d="M14 24 C38 40 38 60 14 76 M86 24 C62 40 62 60 86 76" fill="none" stroke="#fff" strokeWidth="5" />
	</svg>
);
export {eio};

// ---------------- real product photo with a "breathing" CloudTec sole ----------------
// shoe.png 658×316, sole band ≈ bottom 34%; hole centres measured on the cutout
const HOLES = [0.1, 0.185, 0.275, 0.365, 0.465, 0.57, 0.68, 0.78, 0.86];
export const ShoePhoto: React.FC<{w: number; squash?: number; glow?: number; float?: number; holesOn?: number; rot?: number}> = ({w, squash = 0, glow = 0, float = 0, holesOn = 0, rot = 0}) => {
	const h = w * (316 / 658), sole = 0.34, sq = clamp(squash) * 0.2;
	const dy = h * sole * sq;
	const src = staticFile('shoe.png');
	return (
		<div style={{position: 'relative', width: w, height: h + 60, transform: `translateY(${-float}px) rotate(${rot}deg)`}}>
			<div style={{position: 'absolute', left: w * 0.12, right: w * 0.08, top: h + 20 + float * 0.6, height: 34, borderRadius: '50%', background: 'rgba(0,0,0,.55)', filter: 'blur(14px)', transform: `scaleX(${1 - float / 300})`}} />
			<Img src={src} style={{position: 'absolute', left: 0, top: dy, width: w, height: h, clipPath: `inset(0 0 ${sole * 100}% 0)`}} />
			<div style={{position: 'absolute', left: 0, top: 0, width: w, height: h, transformOrigin: '50% 100%', transform: `scaleY(${1 - sq})`}}>
				<Img src={src} style={{position: 'absolute', left: 0, top: 0, width: w, height: h, clipPath: `inset(${(1 - sole) * 100}% 0 0 0)`}} />
				{HOLES.map((x, i) => {const on = clamp(holesOn * HOLES.length - i); return on > 0 ? <div key={i} style={{position: 'absolute', left: x * w - w * 0.028, top: 0.865 * h - h * 0.035, width: w * 0.056, height: h * 0.07, borderRadius: '50%', background: C.lime, opacity: on * (0.55 + 0.45 * glow), boxShadow: `0 0 ${18 + 30 * glow}px ${C.lime}`, mixBlendMode: 'screen'}} /> : null;})}
			</div>
		</div>
	);
};

// ---------------- foam demo: soft sole swallows the push ----------------
export const FoamDemo: React.FC<{w: number; t: number; layers: number[]; press: number; labels: string[]}> = ({w, t, layers, press, labels}) => {
	const cols = [C.cyan, C.violet, '#e9edf1'];
	const base = 60, add = 95;
	const total = base + layers.reduce((a, k) => a + add * k, 0);
	const sink = press * total * 0.55;
	return (
		<div style={{position: 'relative', width: w, height: 520}}>
			{/* foot */}
			<div style={{position: 'absolute', left: w / 2 - 170, top: 520 - total - 150 + sink * (0.9 + 0.1 * Math.sin(t * 6) * press), width: 340, height: 150, borderRadius: '90px 90px 40px 40px', background: 'linear-gradient(#3a4552,#232a33)', boxShadow: '0 10px 30px rgba(0,0,0,.5)'}} />
			{/* sole stack */}
			<div style={{position: 'absolute', left: w * 0.1, width: w * 0.8, bottom: 0, height: total - sink, display: 'flex', flexDirection: 'column-reverse', borderRadius: 30, overflow: 'hidden', boxShadow: `0 0 40px ${C.cyan}33`}}>
				<div style={{height: base * (1 - press * 0.55), background: '#cfd6dd', flexShrink: 0}} />
				{layers.map((k, i) => k > 0 ? <div key={i} style={{height: add * k * (1 - press * 0.55), background: cols[i], display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: DISPLAY, fontWeight: 900, fontSize: 42, color: C.ink, opacity: Math.min(1, k * 2), flexShrink: 0, overflow: 'hidden'}}><span style={{opacity: 1 - press * 1.2}}>{labels[i]}</span></div> : null)}
			</div>
		</div>
	);
};

// ---------------- persistent pod meter (one hose ring per chapter) ----------------
export const PodMeter: React.FC<{n: number; lit: number; t: number; o: number}> = ({n, lit, t, o}) => (
	<div style={{display: 'flex', gap: 22, opacity: o}}>
		{Array.from({length: n}).map((_, i) => {
			const k = clamp(lit - i);
			const pulse = k > 0 && k < 1 ? 1 - 0.3 * Math.sin(k * Math.PI) : 1;
			return <div key={i} style={{width: 64, height: 64 * pulse, borderRadius: '50%', border: `14px solid ${k > 0 ? C.lime : 'rgba(244,247,250,.18)'}`, boxSizing: 'border-box', boxShadow: k > 0 ? `0 0 ${18 * k}px ${C.lime}` : undefined, background: '#0a0d10', alignSelf: 'flex-end'}} />;
		})}
	</div>
);
