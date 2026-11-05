import React, {useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';
import {C, DISPLAY, BODY, FPS, P, clamp, eout} from './ui';

// ---------------- 3D cognac snifter (lathe) with amber liquid ----------------
const PROFILE: [number, number][] = [[0.0, 0.0], [0.62, 0.0], [0.64, 0.04], [0.12, 0.1], [0.07, 0.2], [0.06, 0.7], [0.1, 0.84], [0.42, 0.95], [0.78, 1.18], [0.96, 1.55], [0.96, 1.85], [0.84, 2.2], [0.66, 2.48], [0.62, 2.55]];
const bowlR = (y: number) => {
	for (let i = 6; i < PROFILE.length - 1; i++) {
		const [r0, y0] = PROFILE[i], [r1, y1] = PROFILE[i + 1];
		if (y >= y0 && y <= y1) return r0 + ((r1 - r0) * (y - y0)) / (y1 - y0);
	}
	return 0.62;
};
export const Glass3D: React.FC<{w: number; h: number; t: number; fill: number; swirl?: number; dist?: number; glow?: number}> = ({w, h, t, fill, swirl = 0, dist = 7.2, glow = 0.5}) => {
	const glass = useMemo(() => new THREE.LatheGeometry(PROFILE.map(([r, y]) => new THREE.Vector2(r, y)), 96), []);
	const yBot = 0.86, yTop = yBot + 0.95 * clamp(fill);
	const liquid = useMemo(() => {
		const pts: any[] = [new THREE.Vector2(0, yBot)];
		for (let k = 0; k <= 24; k++) {const y = yBot + ((yTop - yBot) * k) / 24; pts.push(new THREE.Vector2(Math.max(0.02, bowlR(y) - 0.035), y));}
		pts.push(new THREE.Vector2(0, yTop));
		return new THREE.LatheGeometry(pts, 96);
	}, [yTop]);
	const tilt = Math.sin(t * 1.3) * 0.08 * swirl;
	return (
		<div style={{width: w, height: h, filter: `drop-shadow(0 0 ${30 + 40 * glow}px rgba(224,138,44,${0.25 + 0.35 * glow}))`}}>
			<ThreeCanvas width={w} height={h} camera={{fov: 28, position: [0, 2.1, dist]}}>
				<ambientLight intensity={0.5} />
				<directionalLight position={[3, 5, 4]} intensity={2.2} />
				<directionalLight position={[-4, 2, -2]} intensity={1.2} color="#ffd9a0" />
				<pointLight position={[0, 1.3, 1.6]} intensity={2 + 3 * glow} color="#ffb04a" distance={6} />
				<group position={[0, -1.25, 0]} rotation={[0, t * 0.25, tilt]}>
					{fill > 0.01 ? <mesh geometry={liquid}><meshStandardMaterial color="#b85f12" emissive="#7a3504" emissiveIntensity={0.55 + 0.4 * glow} roughness={0.15} metalness={0.1} transparent opacity={0.93} /></mesh> : null}
					<mesh geometry={glass}><meshStandardMaterial color="#ffffff" roughness={0.05} metalness={0.3} transparent opacity={0.22} side={THREE.DoubleSide} depthWrite={false} /></mesh>
					{/* rim + highlights */}
					<mesh position={[0, 2.55, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.62, 0.012, 8, 96]} /><meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.4} /></mesh>
					<mesh position={[0.62, 1.7, 0.5]} rotation={[0, 0, 0.1]}><boxGeometry args={[0.03, 0.9, 0.03]} /><meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8} transparent opacity={0.6} /></mesh>
				</group>
			</ThreeCanvas>
		</div>
	);
};

// ---------------- background: dark cellar with warm candle light ----------------
export const CellarBg: React.FC<{w?: number; h?: number}> = ({w = 1080, h = 1920}) => {
	const t = useCurrentFrame() / FPS;
	return (
		<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 35%, #3a210f 0%, #1c1009 50%, #0b0604 100%)', overflow: 'hidden'}}>
			{/* barrel rows (rings) in the dark */}
			{Array.from({length: 6}).map((_, i) => (
				<div key={i} style={{position: 'absolute', left: (i % 3) * (w / 3) - 60, top: h * (0.55 + Math.floor(i / 3) * 0.22), width: w / 3 + 120, height: w / 3 + 120, borderRadius: '50%', border: '18px solid rgba(120,70,30,.10)', boxShadow: 'inset 0 0 0 40px rgba(90,52,24,.06)'}} />
			))}
			{Array.from({length: 18}).map((_, i) => {const k = (t * 0.05 + i / 18) % 1; return <div key={'d' + i} style={{position: 'absolute', left: ((i * 263) % w), top: h * (1 - k), width: 4, height: 4, borderRadius: 2, background: '#ffcf8a', opacity: 0.25 * Math.sin(k * Math.PI)}} />;})}
			<div style={{position: 'absolute', left: w / 2 - 520, top: h * 0.12, width: 1040, height: 760, borderRadius: '50%', background: 'rgba(242,198,109,.08)', filter: 'blur(70px)'}} />
		</AbsoluteFill>
	);
};

// ---------------- flags (simple, correct) ----------------
export const Flag: React.FC<{c: 'ie' | 'fr' | 'us' | 'cn'; w: number}> = ({c, w}) => {
	const h = w * 0.62;
	const box: React.CSSProperties = {width: w, height: h, borderRadius: 8, overflow: 'hidden', boxShadow: '0 6px 20px rgba(0,0,0,.5)', display: 'flex', position: 'relative'};
	if (c === 'ie' || c === 'fr') {const cols = c === 'ie' ? ['#169b62', '#ffffff', '#ff883e'] : ['#0055a4', '#ffffff', '#ef4135']; return <div style={box}>{cols.map((x) => <div key={x} style={{flex: 1, background: x}} />)}</div>;}
	if (c === 'cn') return <div style={{...box, background: '#de2910'}}><svg width={w * 0.3} height={w * 0.3} viewBox="0 0 10 10" style={{position: 'absolute', left: w * 0.06, top: h * 0.08}}><polygon points="5,0 6.2,3.6 10,3.6 6.9,5.8 8.1,9.5 5,7.2 1.9,9.5 3.1,5.8 0,3.6 3.8,3.6" fill="#ffde00" /></svg></div>;
	return (
		<div style={{...box, flexDirection: 'column'}}>
			{Array.from({length: 13}).map((_, i) => <div key={i} style={{flex: 1, background: i % 2 ? '#ffffff' : '#b22234'}} />)}
			<div style={{position: 'absolute', left: 0, top: 0, width: w * 0.4, height: h * (7 / 13), background: '#3c3b6e'}} />
		</div>
	);
};

// ---------------- wax seal ----------------
export const Seal: React.FC<{size: number; text: string; sub?: string}> = ({size, text, sub}) => (
	<div style={{width: size, height: size, borderRadius: '50%', background: 'radial-gradient(circle at 35% 30%, #e0544a 0%, #a3241c 55%, #6d140f 100%)', boxShadow: '0 10px 30px rgba(0,0,0,.6), inset 0 0 0 10px rgba(0,0,0,.12)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', clipPath: 'polygon(50% 0%,62% 4%,74% 2%,82% 11%,94% 15%,96% 28%,100% 40%,97% 52%,100% 64%,93% 74%,90% 87%,78% 92%,66% 99%,54% 96%,42% 100%,31% 94%,19% 92%,12% 82%,3% 73%,4% 60%,0% 48%,4% 36%,2% 24%,11% 15%,21% 6%,34% 5%)'}}>
		<div style={{fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: size * 0.26, color: '#ffd9c8', textShadow: '0 2px 0 #5a0d08'}}>{text}</div>
		{sub ? <div style={{fontFamily: BODY, fontWeight: 700, fontSize: size * 0.08, color: '#ffd9c8', letterSpacing: 2}}>{sub}</div> : null}
	</div>
);

// ---------------- French town entry sign ----------------
export const TownSign: React.FC<{w: number; name: string}> = ({w, name}) => (
	<div style={{width: w, padding: '18px 24px', background: '#fbf6ee', border: `12px solid ${C.red}`, borderRadius: 18, boxShadow: '0 12px 30px rgba(0,0,0,.6)', textAlign: 'center', boxSizing: 'border-box'}}>
		<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: w * 0.17, color: '#111', letterSpacing: 4}}>{name}</div>
	</div>
);

// ---------------- label with stars → X.O ----------------
export const AgeLabel: React.FC<{w: number; stars: number; xo: number}> = ({w, stars, xo}) => (
	<div style={{position: 'relative', width: w, height: w * 0.62, borderRadius: 18, background: 'linear-gradient(160deg,#f6ead6,#dcc49a)', boxShadow: '0 16px 40px rgba(0,0,0,.6)', border: '6px double #8a5a20', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
		<div style={{fontFamily: 'Georgia, serif', fontSize: w * 0.075, color: '#5a3418', letterSpacing: 6, opacity: 1 - xo}}>COGNAC</div>
		<div style={{display: 'flex', gap: 10, margin: '8px 0', opacity: 1 - xo}}>{[0, 1, 2].map((i) => <span key={i} style={{fontSize: w * 0.16, color: '#b8862a', transform: `scale(${clamp(stars * 3 - i)})`, display: 'inline-block'}}>★</span>)}</div>
		{xo > 0 ? <div style={{position: 'absolute', fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: w * 0.26, color: '#8a5a20', opacity: xo, transform: `scale(${0.8 + 0.2 * eout(xo)})`}}>X.O</div> : null}
	</div>
);

// ---------------- 8 generations ----------------
export const Generations: React.FC<{w: number; k: number; t: number}> = ({w, k, t}) => (
	<div style={{display: 'flex', gap: 14, alignItems: 'flex-end', width: w, justifyContent: 'center'}}>
		{Array.from({length: 8}).map((_, i) => {
			const on = clamp(k * 8 - i);
			const last = i === 7;
			return (
				<div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.25 + 0.75 * on, transform: `translateY(${(1 - eout(on)) * 30}px)`}}>
					<svg width={last ? 96 : 76} height={last ? 120 : 95} viewBox="0 0 80 100"><circle cx="40" cy="28" r="18" fill={last ? C.gold : '#c9a77a'} /><path d="M10 100 C10 62 22 52 40 52 C58 52 70 62 70 100 Z" fill={last ? C.gold : '#c9a77a'} /></svg>
					<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: last ? 34 : 26, color: last ? C.gold : C.mute, textShadow: last ? `0 0 ${12 + 6 * Math.sin(t * 4)}px ${C.gold}` : undefined}}>{i + 1}</div>
				</div>
			);
		})}
	</div>
);

// ---------------- magazine covers ----------------
export const Magazine: React.FC<{w: number; title: string; col: string; rot?: number}> = ({w, title, col, rot = 0}) => (
	<div style={{width: w, height: w * 1.3, borderRadius: 10, background: `linear-gradient(170deg, ${col}, #1c1009)`, boxShadow: '0 16px 40px rgba(0,0,0,.6)', transform: `rotate(${rot}deg)`, padding: 18, boxSizing: 'border-box', position: 'relative', overflow: 'hidden'}}>
		<div style={{fontFamily: 'Georgia, serif', fontWeight: 900, fontSize: w * 0.24, color: '#fff', letterSpacing: 2}}>{title}</div>
		<div style={{position: 'absolute', left: '22%', bottom: 0, width: '56%', height: '58%', borderRadius: '50% 50% 0 0', background: 'rgba(0,0,0,.35)'}} />
		<div style={{position: 'absolute', left: '37%', bottom: '50%', width: '26%', height: '22%', borderRadius: '50%', background: 'rgba(0,0,0,.35)'}} />
		{[0, 1, 2].map((i) => <div key={i} style={{position: 'absolute', left: 18, top: w * 0.4 + i * 22, width: w * 0.35, height: 8, background: 'rgba(255,255,255,.5)'}} />)}
	</div>
);

// ---------------- vinyl ----------------
export const Vinyl: React.FC<{size: number; t: number; label: string}> = ({size, t, label}) => (
	<div style={{width: size, height: size, borderRadius: '50%', background: 'repeating-radial-gradient(circle, #111 0 3px, #1d1d1d 3px 6px)', boxShadow: '0 16px 40px rgba(0,0,0,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `rotate(${t * 200}deg)`}}>
		<div style={{width: size * 0.36, height: size * 0.36, borderRadius: '50%', background: `radial-gradient(circle, ${C.gold} 0%, ${C.amber} 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: DISPLAY, fontWeight: 900, fontSize: size * 0.07, color: C.ink}}>{label}</div>
	</div>
);
export const Equalizer: React.FC<{w: number; t: number}> = ({w, t}) => (
	<div style={{display: 'flex', alignItems: 'flex-end', gap: 8, height: 140}}>
		{Array.from({length: 20}).map((_, i) => <div key={i} style={{width: w / 20 - 8, height: 14 + 120 * Math.abs(Math.sin(t * 5 + i * 0.9) * Math.cos(t * 2.3 + i * 0.4)), borderRadius: 6, background: i % 3 ? C.amber : C.gold}} />)}
	</div>
);

// ---------------- LVMH letters ----------------
export const Letters: React.FC<{size: number; on: number[]; hi: number}> = ({size, on, hi}) => (
	<div style={{display: 'flex', gap: size * 0.12}}>
		{['L', 'V', 'M', 'H'].map((l, i) => {
			const k = clamp(on[i]);
			const isH = i === 3;
			return <div key={l} style={{fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: size, lineHeight: 1, color: isH && hi > 0 ? C.gold : C.cream, opacity: 0.15 + 0.85 * k, transform: `translateY(${(1 - eout(k)) * 40}px) scale(${isH ? 1 + 0.25 * hi : 1})`, textShadow: isH && hi > 0 ? `0 0 ${40 * hi}px ${C.gold}` : '0 6px 20px rgba(0,0,0,.6)'}}>{l}</div>;
		})}
	</div>
);

// ---------------- market share ring ----------------
export const ShareRing: React.FC<{size: number; k: number; label: string}> = ({size, k, label}) => (
	<div style={{position: 'relative', width: size, height: size}}>
		<div style={{position: 'absolute', inset: 0, borderRadius: '50%', background: `conic-gradient(${C.amber} 0 ${40 * k}%, rgba(246,234,214,.12) ${40 * k}% 100%)`, boxShadow: `0 0 50px rgba(224,138,44,${0.4 * k})`}} />
		<div style={{position: 'absolute', inset: size * 0.18, borderRadius: '50%', background: '#1c1009', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
			<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: size * 0.18, color: C.gold}}>≈{Math.round(40 * k)}%</div>
			<div style={{fontFamily: BODY, fontWeight: 700, fontSize: size * 0.06, color: C.mute, textAlign: 'center', width: size * 0.5, whiteSpace: 'normal', lineHeight: 1.2}}>{label}</div>
		</div>
	</div>
);
export const Stamp: React.FC<{text: string; size: number; col?: string}> = ({text, size, col = C.red}) => (
	<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: size, color: col, border: `${size * 0.12}px solid ${col}`, borderRadius: size * 0.3, padding: `${size * 0.1}px ${size * 0.5}px`, background: 'rgba(30,8,5,.7)', letterSpacing: 3}}>{text}</div>
);

// ---------------- persistent barrel-stave timeline ----------------
export const Stave: React.FC<{w: number; years: string[]; pos: number; t: number; o: number}> = ({w, years, pos, t, o}) => {
	const n = years.length, step = (w - 120) / (n - 1);
	const mx = 60 + clamp(pos, 0, n - 1) * step;
	return (
		<div style={{position: 'relative', width: w, height: 96, opacity: o, borderRadius: 18, background: 'linear-gradient(180deg,#7a4a22,#4e2c12)', boxShadow: '0 10px 30px rgba(0,0,0,.6), inset 0 2px 0 rgba(255,255,255,.12)', overflow: 'hidden'}}>
			{[0.22, 0.78].map((y) => <div key={y} style={{position: 'absolute', left: 0, right: 0, top: `${y * 100}%`, height: 6, background: 'linear-gradient(#2a2a2a,#555,#2a2a2a)', opacity: 0.7}} />)}
			{Array.from({length: 7}).map((_, i) => <div key={'g' + i} style={{position: 'absolute', left: 0, right: 0, top: 10 + i * 12, height: 1, background: 'rgba(0,0,0,.18)'}} />)}
			<div style={{position: 'absolute', left: mx - 70, top: 0, width: 140, height: 96, background: 'radial-gradient(ellipse, rgba(242,198,109,.45), transparent 70%)'}} />
			{years.map((y, i) => {
				const on = clamp(1 - Math.abs(pos - i) * 1.5), past = pos >= i - 0.02;
				return <div key={i} style={{position: 'absolute', left: 60 + i * step, top: 48, transform: 'translate(-50%,-50%)', fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 28 + 10 * on, color: on > 0.3 ? '#fff3d6' : past ? '#e8c590' : 'rgba(30,15,6,.75)', textShadow: on > 0.3 ? `0 0 ${16 * on}px ${C.gold}` : 'none'}}>{y}</div>;
			})}
		</div>
	);
};
export {eout};
