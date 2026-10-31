import React, {useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';
import {C, DISPLAY, BODY, FPS, P, clamp, eio, eout, pop} from './ui';

// ---------------- 3D lantern: carved turnip (morph=0) → jack-o'-lantern pumpkin (morph=1) ----------------
const SEG_W = 128, SEG_H = 96;
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const faceTexture = () => {
	const W = 1024, H = 512;
	const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
	const g = cv.getContext('2d')!;
	const draw = (bg: string, fg: string) => {
		g.fillStyle = bg; g.fillRect(0, 0, W, H); g.fillStyle = fg;
		const cx = 256;
		// eyes (triangles)
		for (const s of [-1, 1]) {g.beginPath(); g.moveTo(cx + s * 30, 215); g.lineTo(cx + s * 92, 215); g.lineTo(cx + s * 62, 150); g.closePath(); g.fill();}
		// nose
		g.beginPath(); g.moveTo(cx - 14, 262); g.lineTo(cx + 14, 262); g.lineTo(cx, 238); g.closePath(); g.fill();
		// jagged grin
		g.beginPath(); g.moveTo(cx - 120, 285);
		g.quadraticCurveTo(cx, 345, cx + 120, 285);
		g.lineTo(cx + 96, 318); g.lineTo(cx + 70, 304); g.lineTo(cx + 46, 342); g.lineTo(cx + 18, 322); g.lineTo(cx - 6, 352); g.lineTo(cx - 30, 324); g.lineTo(cx - 56, 344); g.lineTo(cx - 78, 306); g.lineTo(cx - 100, 320);
		g.closePath(); g.fill();
	};
	draw('#ffffff', '#2a0c00');
	const map = new THREE.CanvasTexture(cv); map.colorSpace = THREE.SRGBColorSpace;
	const cv2 = document.createElement('canvas'); cv2.width = W; cv2.height = H; const g2 = cv2.getContext('2d')!;
	g2.drawImage(cv, 0, 0); const id = g2.getImageData(0, 0, W, H);
	for (let i = 0; i < id.data.length; i += 4) {const dark = id.data[i] < 128; id.data[i] = id.data[i + 1] = id.data[i + 2] = dark ? 255 : 0;}
	g2.putImageData(id, 0, 0);
	const em = new THREE.CanvasTexture(cv2);
	return {map, em};
};
export const Lantern3D: React.FC<{w: number; h: number; morph: number; glow: number; spin?: number; dist?: number; y?: number; flicker?: number}> = ({w, h, morph, glow, spin = 0, dist = 6.2, y = 0, flicker = 0}) => {
	const geo = useMemo(() => new THREE.SphereGeometry(1, SEG_W, SEG_H), []);
	const base = useMemo(() => Float32Array.from(geo.attributes.position.array as Float32Array), [geo]);
	const tex = useMemo(() => faceTexture(), []);
	useMemo(() => {
		const pos = geo.attributes.position.array as Float32Array;
		const col = new Float32Array(pos.length);
		const orange = new THREE.Color('#ff7414'), groove = new THREE.Color('#b34400'), purple = new THREE.Color('#8b3aa8'), cream = new THREE.Color('#efe4cf');
		const c = new THREE.Color();
		for (let i = 0; i < pos.length; i += 3) {
			const x = base[i], yy = base[i + 1], z = base[i + 2];
			const rxz = Math.sqrt(x * x + z * z), phi = Math.atan2(z, x);
			const lobeRaw = Math.pow(Math.abs(Math.sin(5 * phi)), 0.55);
			const lobe = 0.9 + 0.1 * lobeRaw;
			// pumpkin
			const pX = x * lobe * 1.28, pZ = z * lobe * 1.28, pY = yy * 0.98 - 0.28 * Math.pow(1 - rxz, 3) * Math.sign(yy);
			// turnip: round top, tapering tap-root at the bottom
			const rootK = yy < -0.7 ? (-yy - 0.7) / 0.3 : 0;
			const tS = 1 - 0.85 * Math.pow(rootK, 0.45);
			const tX = x * 1.08 * tS, tZ = z * 1.08 * tS, tY = yy < 0 ? yy * 0.9 - 0.5 * Math.pow(rootK, 1.6) : yy * 0.86 - 0.12 * Math.pow(1 - rxz, 4);
			pos[i] = lerp(tX, pX, morph); pos[i + 1] = lerp(tY, pY, morph); pos[i + 2] = lerp(tZ, pZ, morph);
			const pc = orange.clone().lerp(groove, (1 - lobeRaw) * 0.8);
			const tc = cream.clone().lerp(purple, clamp((yy - 0.05) / 0.35));
			c.copy(tc).lerp(pc, morph);
			col[i] = c.r; col[i + 1] = c.g; col[i + 2] = c.b;
		}
		geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
		geo.attributes.position.needsUpdate = true;
		geo.computeVertexNormals();
	}, [geo, base, morph]);
	const g = glow * (0.85 + 0.15 * flicker);
	const top = lerp(0.84, 0.72, morph);
	return (
		<div style={{width: w, height: h, filter: `drop-shadow(0 0 ${30 + 40 * g}px rgba(255,140,40,${0.25 + 0.45 * g}))`}}>
			<ThreeCanvas width={w} height={h} camera={{fov: 30, position: [0, 0.35, dist]}}>
				<ambientLight intensity={0.55} color="#c9b4ff" />
				<directionalLight position={[-4, 5, 4]} intensity={1.6} color="#dfe6ff" />
				<directionalLight position={[4, 1, -3]} intensity={1.2} color="#9b5cff" />
				<pointLight position={[0, -1.2, 2.6]} intensity={6 * g} distance={8} color="#ff9a3c" />
				<group position={[0, y, 0]} rotation={[0.08, spin, 0]}>
					<mesh geometry={geo}>
						<meshStandardMaterial vertexColors map={tex.map} emissiveMap={tex.em} emissive="#ffb347" emissiveIntensity={2.2 * g} roughness={0.55} metalness={0.05} />
					</mesh>
					{/* pumpkin stem */}
					<group scale={morph} position={[0, top, 0]}>
						<mesh position={[0.03, 0.18, 0]} rotation={[0, 0, -0.25]}><cylinderGeometry args={[0.07, 0.12, 0.42, 12]} /><meshStandardMaterial color="#5b6b1e" roughness={0.8} /></mesh>
					</group>
					{/* turnip leaf stubs */}
					<group scale={1 - morph} position={[0, top, 0]}>
						{[-0.5, 0, 0.5].map((a, i) => <mesh key={i} position={[a * 0.25, 0.22, 0]} rotation={[0, 0, a]}><coneGeometry args={[0.07, 0.5, 8]} /><meshStandardMaterial color="#4f8f2a" roughness={0.7} /></mesh>)}
					</group>
				</group>
			</ThreeCanvas>
		</div>
	);
};

// ---------------- night background ----------------
const rnd = (seed: number) => {let s = seed; return () => {s = (s * 16807) % 2147483647; return (s - 1) / 2147483646;};};
export const NightBg: React.FC<{w?: number; h?: number; moon?: [number, number]; hills?: number}> = ({w = 1080, h = 1920, moon = [975, 150], hills = 0.72}) => {
	const t = useCurrentFrame() / FPS;
	const stars = useMemo(() => {const r = rnd(7); return Array.from({length: 90}).map(() => [r() * w, r() * h * 0.7, 1 + r() * 2.5, r() * 6]);}, [w, h]);
	return (
		<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 20%, #2a1146 0%, #150a26 45%, #07040f 100%)', overflow: 'hidden'}}>
			{stars.map(([x, y, r, ph], i) => <div key={i} style={{position: 'absolute', left: x, top: y, width: r, height: r, borderRadius: r, background: '#fff', opacity: 0.25 + 0.35 * (0.5 + 0.5 * Math.sin(t * 1.3 + ph))}} />)}
			<div style={{position: 'absolute', left: moon[0] - 70, top: moon[1] - 70, width: 140, height: 140, borderRadius: 70, background: 'radial-gradient(circle at 40% 38%, #fffbe8 0%, #f3e3b5 55%, #d9c38c 100%)', boxShadow: '0 0 90px 30px rgba(255,236,180,.28), 0 0 220px 80px rgba(155,92,255,.18)'}}>
				{[[38, 44, 20], [82, 76, 14], [56, 96, 10]].map(([x, y, r], i) => <div key={i} style={{position: 'absolute', left: x, top: y, width: r, height: r, borderRadius: r, background: 'rgba(190,170,120,.35)'}} />)}
			</div>
			{[0, 1, 2].map((i) => <div key={'f' + i} style={{position: 'absolute', left: -400 + ((t * (14 + i * 6) + i * 500) % (w + 800)) - 400, top: h * (0.42 + i * 0.16), width: 1300, height: 260, borderRadius: '50%', background: 'rgba(190,170,255,.07)', filter: 'blur(40px)'}} />)}
			<svg width={w} height={h} style={{position: 'absolute', left: 0, top: 0}} viewBox={`0 0 ${w} ${h}`}>
				<path d={`M0 ${h * hills} C ${w * 0.2} ${h * (hills - 0.05)} ${w * 0.35} ${h * (hills + 0.02)} ${w * 0.55} ${h * (hills - 0.03)} S ${w * 0.85} ${h * (hills + 0.01)} ${w} ${h * (hills - 0.04)} L ${w} ${h} L 0 ${h} Z`} fill="#0b0618" />
				<path d={`M0 ${h * (hills + 0.05)} C ${w * 0.25} ${h * (hills + 0.02)} ${w * 0.5} ${h * (hills + 0.08)} ${w * 0.75} ${h * (hills + 0.04)} S ${w} ${h * (hills + 0.06)} ${w} ${h * (hills + 0.06)} L ${w} ${h} L 0 ${h} Z`} fill="#06030c" />
			</svg>
		</AbsoluteFill>
	);
};

// ---------------- small SVG props ----------------
export const Ghost: React.FC<{size: number; t: number; ph?: number; o?: number; col?: string}> = ({size, t, ph = 0, o = 1, col = '#f4f0ff'}) => {
	const wv = Math.sin(t * 4 + ph) * 4;
	return (
		<svg width={size} height={size * 1.2} viewBox="0 0 100 120" style={{opacity: o, filter: `drop-shadow(0 0 ${size * 0.15}px ${C.ghost}88)`}}>
			<path d={`M10 60 C10 20 30 4 50 4 C70 4 90 20 90 60 L90 108 L78 ${98 + wv} L64 110 L50 ${98 - wv} L36 110 L22 ${98 + wv} L10 108 Z`} fill={col} opacity={0.92} />
			<ellipse cx="37" cy="48" rx="7" ry="10" fill="#1a0f2e" /><ellipse cx="63" cy="48" rx="7" ry="10" fill="#1a0f2e" />
			<ellipse cx="50" cy="72" rx="8" ry="10" fill="#1a0f2e" />
		</svg>
	);
};
export const Bat: React.FC<{size: number; t: number; ph?: number}> = ({size, t, ph = 0}) => {
	const f = Math.sin(t * 16 + ph);
	return (
		<svg width={size} height={size * 0.6} viewBox="0 0 100 60">
			<g transform={`translate(50 30) scale(1 ${0.5 + 0.5 * Math.abs(f)}) translate(-50 -30)`}>
				<path d="M50 24 C46 18 40 14 30 12 C34 18 30 22 24 22 C24 28 18 30 4 28 C16 36 26 40 36 38 C40 44 46 44 50 40 C54 44 60 44 64 38 C74 40 84 36 96 28 C82 30 76 28 76 22 C70 22 66 18 70 12 C60 14 54 18 50 24 Z" fill="#05030a" />
			</g>
		</svg>
	);
};
export const Bonfire: React.FC<{size: number; t: number; o?: number}> = ({size, t, o = 1}) => {
	const fl = (a: number, b: number) => 1 + 0.08 * Math.sin(t * a) + 0.05 * Math.sin(t * b);
	const sparks = Array.from({length: 12}).map((_, i) => {const k = ((t * 0.7 + i / 12) % 1); return [50 + Math.sin(i * 2.3 + t) * 18 * k, 70 - k * 75, 1 - k];});
	return (
		<svg width={size} height={size * 1.1} viewBox="0 0 100 110" style={{opacity: o, overflow: 'visible', filter: `drop-shadow(0 0 ${size * 0.18}px rgba(255,140,40,.8))`}}>
			<ellipse cx="50" cy="100" rx="46" ry="8" fill="rgba(255,120,30,.25)" />
			<g transform={`translate(50 96) scale(${fl(9, 23)} ${fl(7, 17)}) translate(-50 -96)`}><path d="M50 8 C62 30 80 40 76 70 C74 90 62 98 50 98 C38 98 24 90 24 70 C22 48 40 40 50 8 Z" fill="#ff5a14" /></g>
			<g transform={`translate(50 96) scale(${fl(11, 19)} ${fl(13, 29)}) translate(-50 -96)`}><path d="M50 30 C58 46 68 54 66 74 C64 90 58 96 50 96 C42 96 34 90 34 74 C34 58 46 50 50 30 Z" fill="#ffb340" /></g>
			<g transform={`translate(50 96) scale(${fl(15, 7)} ${fl(12, 21)}) translate(-50 -96)`}><path d="M50 54 C55 64 60 70 58 82 C57 92 54 95 50 95 C46 95 42 92 42 82 C42 72 48 66 50 54 Z" fill="#fff1b0" /></g>
			<rect x="18" y="92" width="64" height="9" rx="4" fill="#4a2410" transform="rotate(12 50 96)" /><rect x="18" y="92" width="64" height="9" rx="4" fill="#5c2e14" transform="rotate(-12 50 96)" />
			{sparks.map(([x, y, a], i) => <circle key={i} cx={x} cy={y} r={1.6} fill="#ffd27a" opacity={a} />)}
		</svg>
	);
};
export const Masked: React.FC<{size: number; col?: string; t: number}> = ({size, col = '#2a1840', t}) => (
	<svg width={size} height={size * 1.3} viewBox="0 0 80 104">
		<path d="M8 104 C8 66 22 54 40 54 C58 54 72 66 72 104 Z" fill={col} />
		<circle cx="40" cy="30" r="20" fill={col} />
		{/* mask: horns + eye holes */}
		<path d="M20 22 L14 4 L28 16 Z M60 22 L66 4 L52 16 Z" fill="#c9b27a" />
		<path d="M22 24 C22 14 58 14 58 24 L58 36 C58 44 22 44 22 36 Z" fill="#d8c79a" />
		<ellipse cx="32" cy="30" rx="5" ry={3.5 + 0.5 * Math.sin(t * 3)} fill="#120a1e" /><ellipse cx="48" cy="30" rx="5" ry="3.5" fill="#120a1e" />
	</svg>
);
export const SoulCake: React.FC<{size: number}> = ({size}) => (
	<svg width={size} height={size * 0.62} viewBox="0 0 100 62">
		<ellipse cx="50" cy="40" rx="46" ry="18" fill="#7a4a1e" />
		<ellipse cx="50" cy="32" rx="46" ry="18" fill="#d99a4e" />
		<ellipse cx="50" cy="30" rx="40" ry="14" fill="#e8b468" />
		<path d="M50 20 L50 40 M36 30 L64 30" stroke="#8a4f18" strokeWidth="5" strokeLinecap="round" />
		{[[30, 26], [70, 34], [40, 38], [62, 24]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="2.4" fill="#5a2a0c" />)}
	</svg>
);
export const Door: React.FC<{w: number; open: number; shake: number; glow: number}> = ({w, open, shake, glow}) => (
	<div style={{position: 'relative', width: w, height: w * 1.55, transform: `translateX(${shake * 6}px)`}}>
		<div style={{position: 'absolute', inset: 0, borderRadius: `${w / 2}px ${w / 2}px 10px 10px`, background: `radial-gradient(ellipse at 50% 60%, rgba(255,190,90,${glow}) 0%, rgba(255,120,30,${glow * 0.6}) 50%, #120a06 100%)`, border: '10px solid #3a2410', boxSizing: 'border-box'}} />
		<div style={{position: 'absolute', inset: 10, borderRadius: `${w / 2 - 10}px ${w / 2 - 10}px 4px 4px`, background: 'repeating-linear-gradient(90deg, #6b3d1c 0 46px, #5a3216 46px 50px)', transformOrigin: 'left center', transform: `perspective(900px) rotateY(${-70 * open}deg)`, boxShadow: 'inset 0 0 30px rgba(0,0,0,.5)'}}>
			<div style={{position: 'absolute', right: 26, top: '52%', width: 22, height: 22, borderRadius: 11, background: '#c9a24a'}} />
			<div style={{position: 'absolute', left: '50%', top: '22%', width: 70, height: 16, marginLeft: -35, borderRadius: 8, background: '#2a160a'}} />
		</div>
	</div>
);
export const Devil: React.FC<{size: number; t: number}> = ({size, t}) => (
	<svg width={size} height={size} viewBox="0 0 100 100" style={{filter: `drop-shadow(0 0 ${size * 0.12}px ${C.blood})`}}>
		<path d="M24 34 C14 20 16 6 22 2 C24 14 30 22 38 26 Z M76 34 C86 20 84 6 78 2 C76 14 70 22 62 26 Z" fill={C.blood} />
		<circle cx="50" cy="56" r="34" fill="#a3141f" />
		<path d="M30 50 L44 56 L30 58 Z M70 50 L56 56 L70 58 Z" fill="#ffd27a" opacity={0.7 + 0.3 * Math.sin(t * 5)} />
		<path d="M32 70 C42 82 58 82 68 70 C58 76 42 76 32 70 Z" fill="#2a0508" />
		<path d="M50 90 L46 100 L54 100 Z" fill="#a3141f" />
	</svg>
);
export const Ember: React.FC<{size: number; t: number}> = ({size, t}) => (
	<div style={{width: size, height: size, borderRadius: size / 2, background: 'radial-gradient(circle at 45% 40%, #fff3c0 0%, #ffb340 35%, #ff4d14 70%, rgba(255,60,10,0) 100%)', boxShadow: `0 0 ${size * (0.6 + 0.2 * Math.sin(t * 9))}px ${size * 0.3}px rgba(255,110,30,.6)`}} />
);

// ---------------- wheel of the year ----------------
export const YearWheel: React.FC<{size: number; t: number; rot: number; dark: number; L: {light: string; dark: string; harvest: string}}> = ({size, rot, dark, L}) => {
	const R = size / 2;
	return (
		<div style={{position: 'relative', width: size, height: size}}>
			<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{transform: `rotate(${rot}deg)`, overflow: 'visible'}}>
				<defs>
					<linearGradient id="lg" x1="0" x2="1"><stop offset="0" stopColor="#ffd27a" /><stop offset="1" stopColor="#ff9a3c" /></linearGradient>
					<linearGradient id="dg" x1="0" x2="1"><stop offset="0" stopColor="#2a1450" /><stop offset="1" stopColor="#100726" /></linearGradient>
				</defs>
				<path d={`M${R} ${R} L${R} 0 A${R} ${R} 0 0 0 ${R} ${size} Z`} fill="url(#lg)" />
				<path d={`M${R} ${R} L${R} 0 A${R} ${R} 0 0 1 ${R} ${size} Z`} fill="url(#dg)" stroke={C.violet} strokeWidth={4 * dark} />
				{Array.from({length: 12}).map((_, i) => <line key={i} x1={R} y1={R} x2={R + Math.sin((i * Math.PI) / 6) * R} y2={R - Math.cos((i * Math.PI) / 6) * R} stroke="rgba(0,0,0,.25)" strokeWidth={2} />)}
				<circle cx={R} cy={R} r={R * 0.22} fill="#0d0716" stroke={C.gold} strokeWidth={4} />
			</svg>
			<div style={{position: 'absolute', left: -10, top: R - 26, transform: 'translateX(-100%)', fontFamily: DISPLAY, fontWeight: 900, fontSize: 34, color: C.ember}}>{L.light}</div>
			<div style={{position: 'absolute', right: -10, top: R - 26, transform: 'translateX(100%)', fontFamily: DISPLAY, fontWeight: 900, fontSize: 34, color: C.violet, opacity: 0.4 + 0.6 * dark, textShadow: `0 0 ${20 * dark}px ${C.violet}`}}>{L.dark}</div>
			<div style={{position: 'absolute', left: R, top: -18, transform: 'translate(-50%,-100%)', fontFamily: DISPLAY, fontWeight: 900, fontSize: 30, color: C.gold}}>{L.harvest}</div>
		</div>
	);
};

// ---------------- voyage: Ireland → America ----------------
export const Voyage: React.FC<{w: number; k: number; t: number; L: {ie: string; us: string}}> = ({w, k, t, L}) => {
	const h = w * 0.55;
	const ax = w * 0.86, ay = h * 0.42, bx = w * 0.12, by = h * 0.55, cx = w * 0.5, cy = -h * 0.05;
	const q = (u: number) => [(1 - u) * (1 - u) * ax + 2 * (1 - u) * u * cx + u * u * bx, (1 - u) * (1 - u) * ay + 2 * (1 - u) * u * cy + u * u * by];
	const pts = Array.from({length: 41}).map((_, i) => q(i / 40));
	const n = Math.round(40 * k);
	const ships = [0, 0.22, 0.44].map((d) => clamp(k * 1.3 - d));
	return (
		<svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{overflow: 'visible'}}>
			{Array.from({length: 7}).map((_, i) => <path key={i} d={`M ${w * 0.2} ${h * (0.3 + i * 0.1)} q 30 ${-10} 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0`} fill="none" stroke="rgba(127,200,255,.12)" strokeWidth="3" transform={`translate(${(Math.sin(t + i) * 20).toFixed(1)} 0)`} />)}
			<path d={`M ${w - 10} ${h * 0.18} C ${w * 0.92} ${h * 0.25} ${w * 0.95} ${h * 0.4} ${w * 0.9} ${h * 0.55} C ${w * 0.84} ${h * 0.66} ${w * 0.96} ${h * 0.72} ${w - 10} ${h * 0.75}`} fill="none" stroke="#3a7a3a" strokeWidth="10" strokeLinecap="round" />
			<path d={`M 10 ${h * 0.12} C ${w * 0.08} ${h * 0.3} ${w * 0.02} ${h * 0.5} ${w * 0.08} ${h * 0.7} C ${w * 0.12} ${h * 0.85} ${w * 0.04} ${h * 0.95} 10 ${h}`} fill="none" stroke="#5a4a8a" strokeWidth="10" strokeLinecap="round" />
			<polyline points={pts.slice(0, n + 1).map((p) => p.join(',')).join(' ')} fill="none" stroke={C.ember} strokeWidth="5" strokeDasharray="14 12" />
			{ships.map((u, i) => {if (u <= 0 || u >= 1) return null; const [x, y] = q(u); return <g key={i} transform={`translate(${x} ${y + Math.sin(t * 3 + i) * 3})`}><path d="M-22 0 L22 0 L14 12 L-14 12 Z" fill="#c98a4a" /><path d="M0 0 L0 -34 L18 -6 Z" fill={C.bone} /></g>;})}
			<circle cx={ax} cy={ay} r={14} fill={C.ghost} /><circle cx={bx} cy={by} r={14} fill={C.gold} opacity={0.3 + 0.7 * clamp(k * 2 - 1)} />
			<text x={ax} y={ay + 56} textAnchor="middle" fontFamily={DISPLAY} fontWeight={900} fontSize={34} fill={C.ghost}>{L.ie}</text>
			<text x={bx + 20} y={by + 56} textAnchor="start" fontFamily={DISPLAY} fontWeight={900} fontSize={34} fill={C.gold} opacity={clamp(k * 2 - 0.8)}>{L.us}</text>
		</svg>
	);
};

// ---------------- 1920s newspaper clipping ----------------
export const Newspaper: React.FC<{w: number; L: {mast: string; date: string; head: string; sub: string}}> = ({w, L}) => (
	<div style={{width: w, padding: 34, background: 'linear-gradient(160deg,#efe3c4,#d8c79a)', boxShadow: '0 20px 60px rgba(0,0,0,.6)', borderRadius: 6, boxSizing: 'border-box', whiteSpace: 'normal', color: '#2a1d10'}}>
		<div style={{fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 52, textAlign: 'center', borderBottom: '4px double #2a1d10', paddingBottom: 10, letterSpacing: 2}}>{L.mast}</div>
		<div style={{fontFamily: BODY, fontWeight: 700, fontSize: 22, textAlign: 'center', margin: '8px 0 18px', letterSpacing: 4}}>{L.date}</div>
		<div style={{fontFamily: 'Georgia, serif', fontWeight: 900, fontSize: 92, lineHeight: 1, textAlign: 'center', color: '#8a1a10'}}>{L.head}</div>
		<div style={{fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 30, textAlign: 'center', margin: '14px 0 18px'}}>{L.sub}</div>
		<div style={{display: 'flex', gap: 20}}>
			{[0, 1].map((c) => <div key={c} style={{flex: 1}}>{Array.from({length: 5}).map((_, i) => <div key={i} style={{height: 10, margin: '10px 0', background: 'rgba(42,29,16,.35)', width: `${70 + ((i * 37 + c * 13) % 30)}%`}} />)}</div>)}
		</div>
	</div>
);

// ---------------- persistent time ribbon ----------------
export const TimeRibbon: React.FC<{w: number; eras: string[]; pos: number; t: number; o: number}> = ({w, eras, pos, t, o}) => {
	const n = eras.length, step = w / (n - 1);
	const mx = clamp(pos, 0, n - 1) * step;
	return (
		<div style={{position: 'relative', width: w, height: 90, opacity: o}}>
			<div style={{position: 'absolute', left: 0, right: 0, top: 22, height: 6, borderRadius: 3, background: 'rgba(155,92,255,.35)'}} />
			<div style={{position: 'absolute', left: 0, width: mx, top: 22, height: 6, borderRadius: 3, background: `linear-gradient(90deg, ${C.violet}, ${C.pumpkin})`, boxShadow: `0 0 16px ${C.pumpkin}`}} />
			{eras.map((e, i) => {
				const on = clamp(1 - Math.abs(pos - i) * 1.5);
				const past = pos >= i - 0.01;
				return (
					<div key={i} style={{position: 'absolute', left: i * step, top: 25, transform: 'translate(-50%,-50%)'}}>
						<div style={{width: 22 + 10 * on, height: 22 + 10 * on, borderRadius: 99, background: past ? C.pumpkin : '#2a1840', border: `3px solid ${past ? C.ember : C.violet}`, boxShadow: on > 0 ? `0 0 ${24 * on}px ${C.ember}` : undefined}} />
						<div style={{position: 'absolute', left: '50%', top: 38, transform: 'translateX(-50%)', fontFamily: DISPLAY, fontWeight: 900, fontSize: 24 + 6 * on, color: on > 0.3 ? C.gold : 'rgba(246,236,217,.55)', whiteSpace: 'nowrap'}}>{e}</div>
					</div>
				);
			})}
			<div style={{position: 'absolute', left: mx, top: -22, transform: `translate(-50%,-50%) translateY(${Math.sin(t * 3) * 3}px)`}}>
				<svg width="38" height="34" viewBox="0 0 38 34"><ellipse cx="19" cy="19" rx="17" ry="14" fill={C.pumpkin} /><path d="M19 5 L21 0" stroke="#5b6b1e" strokeWidth="3" /><path d="M11 15 L15 11 L17 17 Z M27 15 L23 11 L21 17 Z M11 22 Q19 28 27 22 Z" fill="#ffe08a" /></svg>
			</div>
		</div>
	);
};

export const Counter: React.FC<{k: number; to: number; fmt: (v: number) => string; col: string; size: number}> = ({k, to, fmt, col, size}) => (
	<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: size, color: col, textShadow: `0 0 40px ${col}`, lineHeight: 1}}>{fmt(to * eout(k))}</div>
);
export {eio, pop};
