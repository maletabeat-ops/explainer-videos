import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, DISPLAY, BODY, FPS, P, clamp, eout} from './ui';

// ---------- night apron background: runway lights + soft glow ----------
export const RunwayBg: React.FC<{w?: number; h?: number}> = ({w = 1080, h = 1920}) => {
	const t = useCurrentFrame() / FPS;
	return (
		<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 28%, #16243d 0%, #0b1322 50%, #05080f 100%)', overflow: 'hidden'}}>
			<svg width={w} height={h} style={{position: 'absolute', inset: 0}}>
				{Array.from({length: 2}).map((_, side) => Array.from({length: 12}).map((_, i) => {
					const k = ((i + (t * 0.6) % 1) / 12); const y = h * 0.66 + Math.pow(k, 1.6) * h * 0.36; const sp = (y - h * 0.62) / (h * 0.4);
					const x = w / 2 + (side ? 1 : -1) * (30 + w * 0.55 * sp);
					return <circle key={side + '-' + i} cx={x} cy={y} r={2 + 5 * sp} fill={side ? '#4fd7ff' : '#ffb21e'} opacity={0.18 + 0.3 * sp} />;
				}))}
				{Array.from({length: 7}).map((_, i) => {const k = (i + (t * 0.6) % 1) / 7; const y = h * 0.66 + Math.pow(k, 1.6) * h * 0.36; const sp = (y - h * 0.62) / (h * 0.4); return <rect key={'c' + i} x={w / 2 - 3 - 6 * sp} y={y} width={6 + 12 * sp} height={14 + 40 * sp} fill="#fff" opacity={0.07 + 0.08 * sp} />;})}
			</svg>
			{Array.from({length: 16}).map((_, i) => <div key={i} style={{position: 'absolute', left: (i * 211) % w, top: 60 + ((i * 337) % (h * 0.5)), width: 4, height: 4, borderRadius: 2, background: '#cfe6ff', opacity: 0.18 + 0.2 * Math.sin(t * 1.3 + i)}} />)}
			<div style={{position: 'absolute', left: w / 2 - 520, top: h * 0.14, width: 1040, height: 760, borderRadius: '50%', background: 'rgba(79,215,255,.06)', filter: 'blur(70px)'}} />
		</AbsoluteFill>
	);
};

// ---------- split-flap text (departure board) ----------
export const Flap: React.FC<{text: string; col?: string; size?: number; flip?: number}> = ({text, col = C.yellow, size = 90, flip = 1}) => (
	<div style={{display: 'flex', gap: size * 0.08}}>
		{[...text].map((ch, i) => {
			const f = clamp(flip * 1.6 - i * 0.08); const sc = ch === ' ' ? 0.45 : 1;
			return (
				<div key={i} style={{position: 'relative', width: size * 0.72 * sc, height: size * 1.12, borderRadius: size * 0.08, background: ch === ' ' ? 'transparent' : 'linear-gradient(#1b2232 0 49%, #0d121c 51% 100%)', boxShadow: ch === ' ' ? 'none' : '0 6px 14px rgba(0,0,0,.6), inset 0 0 0 2px #2a3346', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'}}>
					<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: size, color: col, lineHeight: 1, transform: `scaleY(${f < 1 ? Math.abs(Math.cos(f * Math.PI * 2)) : 1})`, textShadow: `0 0 18px ${col}88`}}>{f > 0.25 ? ch : ''}</div>
					{ch !== ' ' ? <div style={{position: 'absolute', left: 0, right: 0, top: '50%', height: 2, background: '#05080f'}} /> : null}
				</div>
			);
		})}
	</div>
);

// ---------- top-down cabin seat map ----------
export const ROWS = 30, COLS = 6, NSEAT = ROWS * COLS;
const order = Array.from({length: NSEAT}, (_, i) => i).sort((a, b) => ((a * 97) % 181) - ((b * 97) % 181));
export const NOSHOW = order.slice(0, 15); // ~8% of 180
export const SeatMap: React.FC<{fill: number; noshow?: number; burn?: number; hi?: number; seatW?: number}> = ({fill, noshow = 0, burn = 0, hi = -1, seatW = 50}) => {
	const sh = seatW * 0.56, gap = seatW * 0.12, aisle = seatW * 0.7;
	const W = COLS * (seatW + gap) + aisle + 60, Hc = ROWS * (sh + gap) + 40;
	const nFill = Math.floor(fill * NSEAT);
	const rank = new Map(order.map((s, i) => [s, i]));
	const burnSeat = NOSHOW[0];
	return (
		<div style={{position: 'relative', width: W, height: Hc + W * 0.75}}>
			{/* fuselage */}
			<svg width={W} height={Hc + W * 0.75} style={{position: 'absolute', inset: 0}}>
				<path d={`M0 ${W * 0.75} Q0 0 ${W / 2} 0 Q${W} 0 ${W} ${W * 0.75} L${W} ${Hc + W * 0.75} L0 ${Hc + W * 0.75} Z`} fill="#e9eef7" opacity={0.08} stroke="#9fb3d1" strokeWidth={3} />
				<path d={`M${W * 0.3} ${W * 0.32} Q${W / 2} ${W * 0.2} ${W * 0.7} ${W * 0.32}`} stroke="#4fd7ff" strokeWidth={6} fill="none" opacity={0.6} />
			</svg>
			{Array.from({length: NSEAT}).map((_, i) => {
				const r = Math.floor(i / COLS), c = i % COLS;
				const x = 30 + c * (seatW + gap) + (c >= 3 ? aisle : 0), y = W * 0.75 + 20 + r * (sh + gap);
				const taken = (rank.get(i) ?? 0) < nFill;
				const ns = NOSHOW.indexOf(i), isNo = ns >= 0 && noshow > ns / NOSHOW.length;
				const isBurn = i === burnSeat && burn > 0;
				let bg = taken ? C.cyan : '#26324a';
				if (isNo) bg = '#3a4257';
				if (isBurn) bg = `rgb(${255},${Math.round(178 - 120 * burn)},${Math.round(30)})`;
				const isHi = i === hi;
				return <div key={i} style={{position: 'absolute', left: x, top: y, width: seatW, height: sh, borderRadius: sh * 0.3, background: bg, opacity: isBurn ? 1 - 0.85 * clamp((burn - 0.6) / 0.4) : 1, boxShadow: isHi ? `0 0 0 4px ${C.yellow}, 0 0 24px ${C.yellow}` : isBurn ? `0 0 ${30 * burn}px #ff6a1e` : taken && !isNo ? `0 0 8px ${C.cyan}66` : 'none', border: isNo ? '2px dashed #8f97ad' : 'none', boxSizing: 'border-box'}} />;
			})}
		</div>
	);
};

// ---------- queue of passengers with no seat ----------
export const Person: React.FC<{size: number; col: string}> = ({size, col}) => (
	<svg width={size} height={size * 1.5} viewBox="0 0 20 30"><circle cx="10" cy="6" r="5" fill={col} /><path d="M2 29 Q2 13 10 13 Q18 13 18 29 Z" fill={col} /></svg>
);

// ---------- boarding pass ----------
export const Pass: React.FC<{w: number; seat: string; name: string; route: string; col?: string; stamp?: string; stampK?: number; label: string; stampX?: string; stampY?: string}> = ({w, seat, name, route, col = C.cyan, stamp, stampK = 0, label, stampX = '36%', stampY = '50%'}) => (
	<div style={{position: 'relative', width: w, height: w * 0.42, borderRadius: 22, background: 'linear-gradient(120deg,#f4f7ff,#dfe7f5)', display: 'flex', boxShadow: '0 24px 50px rgba(0,0,0,.55)', overflow: 'hidden'}}>
		<div style={{width: w * 0.7, padding: w * 0.04, boxSizing: 'border-box', borderRight: '4px dashed #9aa6bd'}}>
			<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: w * 0.05, color: '#0b1322', letterSpacing: 2}}>BOARDING PASS</div>
			<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: w * 0.085, color: '#0b1322', marginTop: w * 0.025, whiteSpace: 'nowrap'}}>{route}</div>
			<div style={{fontFamily: BODY, fontWeight: 700, fontSize: w * 0.04, color: '#56627a', marginTop: w * 0.02}}>{name}</div>
		</div>
		<div style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: col}}>
			<div style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: w * 0.04, color: '#0b1322'}}>{label}</div>
			<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: w * 0.12, color: '#0b1322'}}>{seat}</div>
		</div>
		{stamp && stampK > 0 ? <div style={{position: 'absolute', left: stampX, top: stampY, transform: `translate(-50%,-50%) rotate(-12deg) scale(${2 - eout(clamp(stampK))})`, opacity: clamp(stampK * 3), fontFamily: DISPLAY, fontWeight: 900, fontSize: w * 0.08, color: C.red, border: `6px solid ${C.red}`, borderRadius: 14, padding: '2px 18px', background: 'rgba(255,240,240,.85)', whiteSpace: 'nowrap'}}>{stamp}</div> : null}
	</div>
);

// ---------- forecast bars ----------
export const Forecast: React.FC<{w: number; labels: string[]; v: number; result: string}> = ({w, labels, v, result}) => (
	<div style={{width: w, padding: 30, borderRadius: 28, background: 'rgba(8,14,26,.92)', border: `3px solid ${C.cyan}`, boxShadow: `0 0 34px ${C.cyan}44`, boxSizing: 'border-box'}}>
		{labels.map((l, i) => {const k = eout(P(v, i * 0.25, i * 0.25 + 0.3)); return (
			<div key={i} style={{display: 'flex', alignItems: 'center', gap: 20, marginBottom: 18}}>
				<div style={{width: w * 0.3, fontFamily: DISPLAY, fontWeight: 800, fontSize: 34, color: C.white, textAlign: 'right'}}>{l}</div>
				<div style={{flex: 1, height: 34, borderRadius: 17, background: '#1c2840', overflow: 'hidden'}}><div style={{width: `${k * [62, 85, 48][i % 3]}%`, height: '100%', background: `linear-gradient(90deg, ${C.cyan}, #9cf0ff)`, borderRadius: 17}} /></div>
			</div>
		);})}
		<div style={{textAlign: 'center', marginTop: 10, fontFamily: DISPLAY, fontWeight: 900, fontSize: 48, color: C.yellow, opacity: P(v, 0.75, 0.9), textShadow: `0 0 20px ${C.yellow}88`}}>{result}</div>
	</div>
);

// ---------- phone recording frame ----------
export const Phone: React.FC<{w: number; t: number; empty: number; top: string; bottom: string}> = ({w, t, empty, top, bottom}) => {
	const h = w * 1.25;
	return (
		<div style={{position: 'relative', width: w, height: h, borderRadius: 50, background: '#05070c', border: '10px solid #2a3346', boxShadow: '0 30px 70px rgba(0,0,0,.7)', overflow: 'hidden'}}>
			<div style={{position: 'absolute', inset: 0, background: 'linear-gradient(#1b2436,#0b1120)'}} />
			{/* cabin rows in perspective */}
			{Array.from({length: 5}).map((_, r) => {const s = 0.45 + r * 0.14; const y = h * 0.13 + r * h * 0.12; return (
				<div key={r} style={{position: 'absolute', left: '50%', top: y, transform: `translateX(-50%) scale(${s})`, display: 'flex', gap: 14}}>
					{Array.from({length: 6}).map((_, c) => {const isE = r === 4 && c === 1; return <div key={c} style={{width: 90, height: 120, borderRadius: '24px 24px 10px 10px', background: isE ? `rgba(255,74,61,${0.15 + 0.5 * empty})` : '#3a4a6a', border: isE ? `5px solid rgba(255,74,61,${empty})` : 'none', marginLeft: c === 3 ? 60 : 0}} />;})}
				</div>
			);})}
			<div style={{position: 'absolute', left: 30, top: 30, display: 'flex', alignItems: 'center', gap: 12, fontFamily: DISPLAY, fontWeight: 900, fontSize: 34, color: '#fff'}}><div style={{width: 22, height: 22, borderRadius: 11, background: C.red, opacity: Math.sin(t * 6) > 0 ? 1 : 0.25}} />REC</div>
			<div style={{position: 'absolute', right: 30, top: 34, fontFamily: DISPLAY, fontWeight: 800, fontSize: 30, color: '#cfd8ea'}}>{top}</div>
			<div style={{position: 'absolute', left: 0, right: 0, bottom: 30, textAlign: 'center', fontFamily: DISPLAY, fontWeight: 900, fontSize: 40, color: C.red}}>{bottom}</div>
		</div>
	);
};

// ---------- document / bill with stamp ----------
export const Doc: React.FC<{w: number; head: string; lines: string[]; stamp: string; k: number; col?: string}> = ({w, head, lines, stamp, k, col = C.yellow}) => (
	<div style={{position: 'relative', width: w, padding: 40, borderRadius: 20, background: '#eef2f9', boxShadow: '0 30px 60px rgba(0,0,0,.6)', boxSizing: 'border-box', whiteSpace: 'normal'}}>
		<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 40, color: '#0b1322', textAlign: 'center'}}>{head}</div>
		<div style={{height: 4, background: '#0b1322', margin: '18px 0 22px'}} />
		{lines.map((l, i) => <div key={i} style={{fontFamily: BODY, fontWeight: 700, fontSize: 32, color: '#2a3346', marginBottom: 14}}>{l}</div>)}
		{[0, 1, 2].map((i) => <div key={'b' + i} style={{height: 14, borderRadius: 7, background: '#c9d2e2', width: `${90 - i * 18}%`, marginBottom: 14}} />)}
		{k > 0 ? <div style={{position: 'absolute', right: 30, bottom: 30, transform: `rotate(-10deg) scale(${2 - eout(clamp(k))})`, opacity: clamp(k * 3), fontFamily: DISPLAY, fontWeight: 900, fontSize: 46, color: col, border: `6px solid ${col}`, borderRadius: 14, padding: '4px 20px', background: 'rgba(11,19,34,.9)', whiteSpace: 'nowrap'}}>{stamp}</div> : null}
	</div>
);

// ---------- voucher / check cards ----------
export const Ticket: React.FC<{w: number; title: string; big: string; col: string; cross?: number; glow?: number}> = ({w, title, big, col, cross = 0, glow = 0}) => (
	<div style={{position: 'relative', width: w, padding: '26px 30px', borderRadius: 24, background: 'rgba(8,14,26,.92)', border: `4px solid ${col}`, boxShadow: `0 0 ${20 + 40 * glow}px ${col}${glow > 0.5 ? 'cc' : '55'}`, boxSizing: 'border-box', textAlign: 'center'}}>
		<div style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 34, color: C.mute}}>{title}</div>
		<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 74, color: col, lineHeight: 1.1}}>{big}</div>
		{cross > 0 ? <svg width={w} height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{position: 'absolute', inset: 0}}><line x1="6" y1="90" x2={6 + 88 * clamp(cross)} y2={90 - 80 * clamp(cross)} stroke={C.red} strokeWidth="5" strokeLinecap="round" /></svg> : null}
	</div>
);

// ---------- departure-board status row (persistent bottom element) ----------
export const BoardRow: React.FC<{cols: [string, string][]; status: string; statusCol: string; o: number; flip: number}> = ({cols, status, statusCol, o, flip}) => (
	<div style={{opacity: o, display: 'flex', alignItems: 'stretch', gap: 10, padding: 12, borderRadius: 20, background: 'rgba(5,8,15,.92)', border: '3px solid #2a3346', boxShadow: '0 10px 30px rgba(0,0,0,.6)'}}>
		{cols.map(([k, v], i) => (
			<div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4px 12px'}}>
				<div style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 20, color: C.mute, letterSpacing: 1}}>{k}</div>
				<Flap text={v} size={36} col={C.white} />
			</div>
		))}
		<div style={{display: 'flex', alignItems: 'center', padding: '0 8px'}}><Flap text={status} size={36} col={statusCol} flip={flip} /></div>
	</div>
);
