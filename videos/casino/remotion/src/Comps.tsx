import React, {useMemo} from 'react';
import {ThreeCanvas} from '@remotion/three';
import {C, DISPLAY, BODY, P, eio, eout, pop, clamp} from './ui';

// ---------------- 3D roulette wheel ----------------
const ORDER = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
const REDS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
const SEC = (Math.PI * 2) / 37;
export const Roulette3D: React.FC<{t: number; w: number; h: number; land: number; glow: number; tilt?: number; dist?: number}> = ({t, w, h, land, glow, tilt = 0.95, dist = 13.5}) => {
	const wheelA = t * 0.6;
	// ball: orbits counter to the wheel, slows, then drops into the green zero (pocket index 0)
	const k = eio(P(t, land - 0.9, land));
	const free = -t * 2.4;
	const target = wheelA + SEC * 0.5 - Math.PI / 2;
	const ang = t < land - 0.9 ? free : free + (target - free) * k;
	const r = 3.45 - 0.75 * k;
	const by = 0.42 - 0.18 * k + (k > 0 && k < 1 ? Math.abs(Math.sin(k * 14)) * 0.12 * (1 - k) : 0);
	const ballA = t >= land ? target : ang;
	return (
		<ThreeCanvas width={w} height={h} camera={{fov: 30, position: [0, Math.sin(tilt) * dist, Math.cos(tilt) * dist]}}>
			<ambientLight intensity={0.5} />
			<directionalLight position={[4, 8, 5]} intensity={1.8} />
			<pointLight position={[0, 3, 0]} intensity={2.5} color="#ffd88a" />
			<group rotation={[0, 0, 0]}>
				<mesh position={[0, -0.25, 0]}><cylinderGeometry args={[4.3, 4.6, 0.5, 64]} /><meshStandardMaterial color="#3a1a10" metalness={0.3} roughness={0.5} /></mesh>
				<mesh position={[0, 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[3.85, 0.22, 16, 96]} /><meshStandardMaterial color="#c9a227" metalness={0.9} roughness={0.25} /></mesh>
				<group rotation={[0, wheelA, 0]}>
					{ORDER.map((n, i) => (
						<mesh key={i} position={[0, 0.05, 0]}>
							<cylinderGeometry args={[3.1, 3.1, 0.12, 2, 1, false, i * SEC, SEC]} />
							<meshStandardMaterial color={n === 0 ? '#1fb36b' : REDS.has(n) ? '#d61f35' : '#141414'} metalness={0.2} roughness={0.4} emissive={n === 0 ? '#2ee68a' : '#000'} emissiveIntensity={n === 0 ? glow * 1.2 : 0} />
						</mesh>
					))}
					{ORDER.map((_, i) => <mesh key={'s' + i} position={[Math.sin(i * SEC) * 2.6, 0.16, Math.cos(i * SEC) * 2.6]} rotation={[0, i * SEC, 0]}><boxGeometry args={[0.03, 0.12, 1.0]} /><meshStandardMaterial color="#e2bf4a" metalness={0.9} roughness={0.2} /></mesh>)}
					<mesh position={[0, 0.25, 0]}><cylinderGeometry args={[1.9, 2.1, 0.3, 48]} /><meshStandardMaterial color="#5a2a14" metalness={0.3} roughness={0.4} /></mesh>
					<mesh position={[0, 0.7, 0]}><coneGeometry args={[0.6, 0.8, 32]} /><meshStandardMaterial color="#e2bf4a" metalness={0.95} roughness={0.15} /></mesh>
					{[0, 1, 2, 3].map((i) => <mesh key={'h' + i} position={[0, 0.75, 0]} rotation={[0, (i * Math.PI) / 2, Math.PI / 2]}><cylinderGeometry args={[0.05, 0.05, 2.4, 10]} /><meshStandardMaterial color="#e2bf4a" metalness={0.95} roughness={0.15} /></mesh>)}
				</group>
				<mesh position={[Math.cos(ballA) * r, by, -Math.sin(ballA) * r]}><sphereGeometry args={[0.16, 24, 16]} /><meshStandardMaterial color="#ffffff" metalness={0.1} roughness={0.15} /></mesh>
			</group>
		</ThreeCanvas>
	);
};

// ---------------- pocket strip 18 / 18 / 1 ----------------
export const PocketStrip: React.FC<{t: number; t0: number; zeroGlow: number; w: number}> = ({t, t0, zeroGlow, w}) => {
	const cell = w / 37;
	return (
		<div style={{display: 'flex', gap: 2}}>
			{ORDER.map((n, i) => {
				const s = clamp((t - t0) * 30 - i);
				const col = n === 0 ? C.felt : REDS.has(n) ? '#d61f35' : '#1b1b1b';
				return <div key={i} style={{width: cell - 2, height: cell * 2.2, borderRadius: 4, background: col, opacity: s, transform: `scaleY(${0.3 + 0.7 * s})`, boxShadow: n === 0 ? `0 0 ${30 * zeroGlow}px ${C.green}` : undefined, border: n === 0 ? `2px solid rgba(255,255,255,${0.6 * zeroGlow})` : '1px solid rgba(255,255,255,.08)'}} />;
			})}
		</div>
	);
};

// ---------------- law of large numbers simulation ----------------
const rnd = (seed: number) => {let s = seed; return () => {s = (s * 16807) % 2147483647; return (s - 1) / 2147483646;};};
export const useSim = (players = 46, steps = 120) => useMemo(() => {
	const r = rnd(7); const lines: number[][] = []; const house: number[] = new Array(steps + 1).fill(0);
	for (let p = 0; p < players; p++) {let v = 0; const l = [0]; for (let s = 1; s <= steps; s++) {const win = r() < 18 / 37; v += win ? 1 : -1; house[s] -= win ? 1 : -1; l.push(v);} lines.push(l);}
	let acc = 0; const H = house.map((x, i) => (i === 0 ? 0 : (acc += x))); // cumulative house take
	let hacc = 0; const houseCum = [0]; for (let s = 1; s <= steps; s++) {let d = 0; for (const l of lines) d -= l[s] - l[s - 1]; hacc += d; houseCum.push(hacc);}
	return {lines, house: houseCum, H};
}, [players, steps]);
export const SimChart: React.FC<{k: number; w: number; h: number; houseLabel: string; playerLabel: string; houseOn: number}> = ({k, w, h, houseLabel, playerLabel, houseOn}) => {
	const {lines, house} = useSim();
	const n = Math.max(2, Math.round(lines[0].length * k));
	const ymax = 30, hmax = Math.max(...house) * 1.05;
	const px = (i: number) => (i / (lines[0].length - 1)) * w;
	const py = (v: number) => h / 2 - (v / ymax) * (h / 2);
	const hy = (v: number) => h - 10 - (v / hmax) * (h - 30);
	return (
		<svg width={w} height={h} style={{overflow: 'visible'}}>
			<line x1={0} x2={w} y1={h / 2} y2={h / 2} stroke="rgba(255,255,255,.25)" strokeDasharray="8 8" strokeWidth={2} />
			{lines.map((l, j) => <polyline key={j} points={l.slice(0, n).map((v, i) => `${px(i)},${py(v)}`).join(' ')} fill="none" stroke={l[n - 1] >= 0 ? 'rgba(46,230,138,.55)' : 'rgba(255,59,79,.45)'} strokeWidth={2.5} />)}
			{houseOn > 0 ? <polyline points={house.slice(0, n).map((v, i) => `${px(i)},${hy(v)}`).join(' ')} fill="none" stroke={C.gold} strokeWidth={8} opacity={houseOn} style={{filter: `drop-shadow(0 0 10px ${C.gold})`}} /> : null}
			{houseOn > 0 ? <text x={px(n - 1) - 10} y={hy(house[n - 1]) - 20} textAnchor="end" fontFamily={DISPLAY} fontWeight={900} fontSize={34} fill={C.gold} opacity={houseOn}>{houseLabel}</text> : null}
			<text x={8} y={36} fontFamily={DISPLAY} fontWeight={900} fontSize={28} fill="rgba(255,255,255,.6)">{playerLabel}</text>
		</svg>
	);
};

// ---------------- slot machine ----------------
const Sym: React.FC<{s: string; size: number}> = ({s, size}) => {
	if (s === '7') return <div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: size * 0.8, color: '#ff2d46', textShadow: '0 4px 0 #7a0010', lineHeight: 1}}>7</div>;
	if (s === 'BAR') return <div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: size * 0.32, color: '#111', background: C.gold, padding: '6px 14px', borderRadius: 8}}>BAR</div>;
	if (s === 'STAR') return <svg width={size * 0.7} height={size * 0.7} viewBox="0 0 24 24"><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.7 7-6.3-3.9-6.3 3.9 1.7-7L2 9.2l7.1-.6z" fill={C.gold} /></svg>;
	return <svg width={size * 0.75} height={size * 0.75} viewBox="0 0 24 24"><path d="M12 3c2 3 3 6 2 9M12 3c-2 2-4 6-5 10" stroke="#3ddc84" strokeWidth={1.8} fill="none" /><circle cx="7" cy="16" r="4" fill="#e0213a" /><circle cx="15" cy="16.5" r="4" fill="#ff3b4f" /></svg>;
};
const REEL = ['CHERRY', '7', 'BAR', 'STAR', 'CHERRY', 'BAR', '7', 'STAR'];
// final: index of symbol on the payline per reel; offset 0.5 = third symbol stops just above the line
export const Slot: React.FC<{t: number; t0: number; stops: number[]; final: number[]; nearMiss?: boolean; flash?: number; size?: number}> = ({t, t0, stops, final, nearMiss, flash = 0, size = 150}) => {
	const cell = size, H = cell * 3;
	return (
		<div style={{padding: 26, borderRadius: 40, background: 'linear-gradient(180deg,#5a1020,#2a0710)', border: `6px solid ${C.gold}`, boxShadow: `0 0 ${40 + 40 * flash}px rgba(255,201,77,${0.4 + 0.5 * flash})`}}>
			<div style={{display: 'flex', gap: 14, position: 'relative'}}>
				{[0, 1, 2].map((ri) => {
					const stopT = t0 + stops[ri];
					const spinning = t < stopT;
					const target = final[ri] + (nearMiss && ri === 2 ? 0.5 : 0);
					const pos = spinning ? (t - t0) * 9 + ri : target + 0.35 * Math.exp(-(t - stopT) * 9) * Math.sin((t - stopT) * 30);
					const off = ((pos % REEL.length) + REEL.length) % REEL.length;
					return (
						<div key={ri} style={{width: cell, height: H, overflow: 'hidden', background: 'linear-gradient(180deg,#d9d2c4,#fffaf0 30%,#fffaf0 70%,#d9d2c4)', borderRadius: 14, position: 'relative'}}>
							{Array.from({length: REEL.length + 4}).map((_, i) => {
								const y = (i - off + 1) * cell;
								const sym = REEL[(i + REEL.length) % REEL.length];
								return <div key={i} style={{position: 'absolute', left: 0, top: y, width: cell, height: cell, display: 'flex', alignItems: 'center', justifyContent: 'center', filter: spinning ? 'blur(3px)' : undefined}}><Sym s={sym} size={cell} /></div>;
							})}
						</div>
					);
				})}
				<div style={{position: 'absolute', left: -10, right: -10, top: cell * 1.5 - 3, height: 6, background: C.red, boxShadow: `0 0 14px ${C.red}`}} />
			</div>
		</div>
	);
};

// ---------------- Monte Carlo streak ----------------
export const Streak: React.FC<{t: number; t0: number; n: number; cols: number; size: number; perSec: number}> = ({t, t0, n, cols, size, perSec}) => {
	const shown = Math.min(n, Math.floor(Math.max(0, t - t0) * perSec));
	return (
		<div style={{display: 'grid', gridTemplateColumns: `repeat(${cols}, ${size}px)`, gap: size * 0.22}}>
			{Array.from({length: n}).map((_, i) => (
				<div key={i} style={{width: size, height: size, borderRadius: size / 2, background: i < shown ? '#121212' : 'rgba(255,255,255,.06)', border: `3px solid ${i < shown ? '#e2bf4a' : 'rgba(255,255,255,.12)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: DISPLAY, fontWeight: 900, fontSize: size * 0.36, color: '#e2bf4a', transform: `scale(${i === shown - 1 ? 1.15 : 1})`}}>{i < shown ? i + 1 : ''}</div>
			))}
		</div>
	);
};

// ---------------- Martingale bars ----------------
export const Martingale: React.FC<{t: number; t0: number; w: number; h: number; limit: number; limitLabel: string; limitOn: number}> = ({t, t0, w, h, limit, limitLabel, limitOn}) => {
	const bets = Array.from({length: 11}, (_, i) => 10 * 2 ** i);
	const max = bets[10] * 1.1, bw = w / 11 - 10;
	return (
		<div style={{position: 'relative', width: w, height: h}}>
			{bets.map((b, i) => {
				const k = eout(P(t, t0 + i * 0.35, t0 + i * 0.35 + 0.4));
				const bh = (b / max) * (h - 60) * k, over = b > limit;
				return (
					<div key={i} style={{position: 'absolute', left: i * (bw + 10), bottom: 40, width: bw, height: bh, background: over ? `linear-gradient(${C.red}, #7a0010)` : `linear-gradient(${C.gold}, #8a6a10)`, borderRadius: '8px 8px 0 0', boxShadow: over ? `0 0 20px ${C.red}` : undefined}}>
						<div style={{position: 'absolute', top: -38, width: '100%', textAlign: 'center', fontFamily: DISPLAY, fontWeight: 900, fontSize: i > 7 ? 24 : 20, color: over ? C.red : C.cream, opacity: k}}>${b.toLocaleString('en-US')}</div>
					</div>
				);
			})}
			{limitOn > 0 ? <div style={{position: 'absolute', left: 0, right: 0, bottom: 40 + (limit / max) * (h - 60), height: 4, background: '#fff', opacity: limitOn, boxShadow: '0 0 12px #fff'}}><div style={{position: 'absolute', left: 0, top: -44, fontFamily: DISPLAY, fontWeight: 900, fontSize: 28, color: '#fff'}}>{limitLabel}</div></div> : null}
		</div>
	);
};

// ---------------- house edge table ----------------
export const EdgeTable: React.FC<{t: number; rows: [string, number, string, number][]; w: number}> = ({t, rows, w}) => (
	<div style={{width: w, display: 'flex', flexDirection: 'column', gap: 22}}>
		{rows.map(([name, v, col, at], i) => {
			const k = eout(P(t, at - 0.2, at + 0.6));
			return (
				<div key={i} style={{opacity: Math.min(1, k * 2)}}>
					<div style={{display: 'flex', justifyContent: 'space-between', fontFamily: DISPLAY, fontWeight: 900, fontSize: 34, color: C.cream, marginBottom: 8}}><span>{name}</span><span style={{color: col}}>{v.toLocaleString('en-US')}%</span></div>
					<div style={{height: 30, borderRadius: 15, background: 'rgba(255,255,255,.07)'}}><div style={{height: 30, width: `${(v / 8) * 100 * k}%`, borderRadius: 15, background: col, boxShadow: `0 0 16px ${col}`}} /></div>
				</div>
			);
		})}
	</div>
);

// ---------------- theoretical loss calculator ----------------
export const Calc: React.FC<{t: number; rows: [string, string, number][]; result: string; resAt: number; w: number}> = ({t, rows, result, resAt, w}) => (
	<div style={{width: w, padding: 40, borderRadius: 30, background: 'rgba(20,6,10,.92)', border: `4px solid ${C.gold}`, boxShadow: `0 0 40px ${C.gold}55`}}>
		{rows.map(([op, txt, at], i) => (
			<div key={i} style={{display: 'flex', gap: 24, alignItems: 'baseline', fontFamily: DISPLAY, fontWeight: 900, fontSize: 46, color: C.cream, margin: '10px 0', opacity: Math.min(1, pop(t, at - 0.2)), transform: `translateX(${(1 - Math.min(1, pop(t, at - 0.2))) * 60}px)`}}>
				<span style={{color: C.gold, width: 50}}>{op}</span><span>{txt}</span>
			</div>
		))}
		<div style={{borderTop: '3px dashed rgba(255,255,255,.3)', margin: '18px 0'}} />
		<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 64, color: C.red, textShadow: `0 0 24px ${C.red}`, opacity: Math.min(1, pop(t, resAt - 0.2))}}>{result}</div>
	</div>
);

// ---------------- jackpot crowd ----------------
export const Crowd: React.FC<{t: number; t0: number; w: number; cols: number; rows: number; winnerLabel: string; flash: number}> = ({t, t0, w, cols, rows, winnerLabel, flash}) => {
	const cell = w / cols, win = Math.floor((cols * rows) / 2 + cols / 2);
	return (
		<div style={{position: 'relative', width: w, height: cell * rows}}>
			{Array.from({length: cols * rows}).map((_, i) => {
				const isW = i === win, s = clamp((t - t0) * 40 - i * 0.6);
				return <div key={i} style={{position: 'absolute', left: (i % cols) * cell + cell * 0.2, top: Math.floor(i / cols) * cell + cell * 0.2, width: cell * 0.6, height: cell * 0.6, borderRadius: '50%', background: isW ? C.gold : 'rgba(255,255,255,.25)', transform: `scale(${s * (isW ? 1.6 + 0.2 * Math.sin(t * 10) : 1)})`, boxShadow: isW ? `0 0 ${30 + 30 * flash}px ${C.gold}` : undefined}} />;
			})}
			<div style={{position: 'absolute', left: ((win % cols) + 0.5) * cell, top: Math.floor(win / cols) * cell - 30, transform: 'translate(-50%,-100%)', fontFamily: DISPLAY, fontWeight: 900, fontSize: 34, color: C.gold, whiteSpace: 'nowrap', textShadow: '0 2px 10px #000'}}>{winnerLabel}</div>
		</div>
	);
};

// ---------------- playing cards (card counting) ----------------
export const Cards: React.FC<{t: number; t0: number; size: number}> = ({t, t0, size}) => {
	const cards = [['K', '♠', -1], ['5', '♥', 1], ['2', '♣', 1], ['A', '♦', -1], ['6', '♠', 1], ['3', '♥', 1]] as const;
	let count = 0;
	return (
		<div style={{display: 'flex', gap: size * 0.15, alignItems: 'center'}}>
			{cards.map(([v, s, c], i) => {
				const k = P(t, t0 + i * 0.45, t0 + i * 0.45 + 0.35); if (k >= 1) count += c;
				const red = s === '♥' || s === '♦';
				return (
					<div key={i} style={{width: size, height: size * 1.4, borderRadius: 12, background: k > 0.5 ? '#fff' : `linear-gradient(135deg, ${C.red}, #7a0010)`, transform: `rotateY(${(1 - k) * 180}deg)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 30px rgba(0,0,0,.5)', position: 'relative'}}>
						{k > 0.5 ? <><div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: size * 0.45, color: red ? '#d61f35' : '#111'}}>{v}</div><div style={{fontSize: size * 0.35, color: red ? '#d61f35' : '#111'}}>{s}</div>
							<div style={{position: 'absolute', bottom: -size * 0.45, fontFamily: DISPLAY, fontWeight: 900, fontSize: size * 0.3, color: c > 0 ? C.green : C.red}}>{c > 0 ? '+1' : '−1'}</div></> : null}
					</div>
				);
			})}
			<div style={{marginLeft: size * 0.3, fontFamily: DISPLAY, fontWeight: 900, fontSize: size * 0.4, color: C.gold}}>= {count > 0 ? '+' : ''}{count}</div>
		</div>
	);
};
