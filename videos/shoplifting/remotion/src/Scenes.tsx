import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {At, Badge, BODY, C, Card, DISPLAY, FPS, P, Person, Pill, Title, eio, eout, pop} from './ui';

const useT = () => useCurrentFrame() / FPS;

// ---------- trading-style chart (hook + finale) ----------
const chartPts = (k: number, crash: number) => {
	const pts: [number, number][] = [];
	for (let i = 0; i <= 60; i++) {
		const x = i / 60;
		let y = 0.15 + 0.6 * x + 0.05 * Math.sin(i * 1.7) + 0.03 * Math.sin(i * 4.3);
		if (crash > 0 && x > 0.62) y -= crash * (x - 0.62) * 2.6;
		pts.push([x, Math.max(0.02, Math.min(0.98, y))]);
	}
	return pts.slice(0, Math.max(2, Math.round(61 * k)));
};
export const Chart: React.FC<{k: number; crash: number; S: any; value: string; col: string}> = ({k, crash, S, value, col}) => {
	const W = 880, H = 460;
	const pts = chartPts(k, crash);
	const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x * W} ${H - y * H}`).join(' ');
	const last = pts[pts.length - 1];
	return (
		<Card w={940} col={col} pad={28}>
			<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14}}>
				<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 30, color: C.mute}}>{S.app}</div>
				<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 46, color: col, textShadow: `0 0 20px ${col}`}}>{value}</div>
			</div>
			<svg width={W} height={H}>
				{[0.25, 0.5, 0.75].map((g) => <line key={g} x1={0} x2={W} y1={H * g} y2={H * g} stroke="rgba(255,255,255,.07)" strokeWidth={2} />)}
				<path d={`${d} L${last[0] * W} ${H} L0 ${H} Z`} fill={`${col}22`} />
				<path d={d} stroke={col} strokeWidth={7} fill="none" strokeLinejoin="round" style={{filter: `drop-shadow(0 0 10px ${col})`}} />
				<circle cx={last[0] * W} cy={H - last[1] * H} r={12} fill={col} />
			</svg>
		</Card>
	);
};
export const Hook: React.FC<{K: any; S: any}> = ({K, S}) => {
	const t = useT();
	const yr = P(t, K.y - 0.2, K.y + 0.4);
	return (
		<AbsoluteFill>
			<At x={540} y={250} s={pop(t, 0.1)}><Title text={S.t1} col="#fff" size={100} /></At>
			<At x={540} y={360} s={pop(t, 0.35)}><Title text={S.t2} col={C.green} size={110} glow={C.green} /></At>
			<At x={540} y={840} s={pop(t, K.m - 0.6)}><Chart k={eout(P(t, K.m - 0.4, K.y + 1.2))} crash={0} S={S} value={yr > 0.5 ? S.y : S.m} col={C.green} /></At>
			<At x={540} y={1280} s={pop(t, K.math - 0.3)}><Pill text={S.math} bg={C.gold} size={40} /></At>
		</AbsoluteFill>
	);
};
export const Myth: React.FC<{K: any; S: any}> = ({K, S}) => {
	const t = useT();
	const strike = eout(P(t, K.myth + 0.3, K.myth + 0.8));
	const hl = P(t, K.one11 - 0.4, K.one11);
	return (
		<AbsoluteFill>
			<At x={540} y={260} s={pop(t, K.myth - 0.4)}>
				<div style={{position: 'relative'}}>
					<Badge text={S.myth} col={C.mute} size={54} />
					<div style={{position: 'absolute', left: 10, right: 10, top: '50%', height: 8, background: C.red, transformOrigin: 'left', transform: `scaleX(${strike})`, boxShadow: `0 0 14px ${C.red}`, borderRadius: 4}} />
				</div>
			</At>
			{Array.from({length: 11}).map((_, i) => {
				const row = i < 6 ? 0 : 1, col = row ? i - 6 : i;
				const x = row ? 220 + col * 160 : 140 + col * 160, y = 640 + row * 230;
				const red = i === 7 && hl > 0;
				return <At key={i} x={x} y={y} s={pop(t, K.myth + 0.1 + i * 0.05) * (red ? 1 + 0.15 * hl : 1)}><Person col={red ? C.red : '#3d5a52'} size={120} /></At>;
			})}
			<At x={540} y={1180} s={pop(t, K.one11 - 0.2)}><Title text={S.one11} col={C.red} size={140} glow={C.red} /></At>
			<At x={540} y={1300} s={pop(t, K.one11 + 0.2)}><div style={{fontFamily: BODY, fontWeight: 700, fontSize: 32, color: C.mute}}>{S.one11note}</div></At>
		</AbsoluteFill>
	);
};
export const Ladder: React.FC<{K: any; S: any}> = ({K, S}) => {
	const t = useT();
	const ks = [K.fine, K.crim, K.record], cols = [C.gold, C.orange, C.red];
	return (
		<AbsoluteFill>
			<At x={540} y={260} s={pop(t, K.risk - 0.4)}><Badge text={S.risk} col={C.red} size={70} /></At>
			{S.ladder.map((l: string[], i: number) => (
				<React.Fragment key={i}>
					<At x={540 + (i - 1) * 40} y={520 + i * 300} s={pop(t, ks[i] - 0.3)}>
						<Card w={820} col={cols[i]} pad={26}>
							<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
								<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 30, color: cols[i]}}>{l[0]}</div>
								<div style={{fontFamily: BODY, fontWeight: 800, fontSize: 26, color: C.mute}}>{l[2]}</div>
							</div>
							<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: i === 2 ? 72 : 46, color: '#fff', marginTop: 6, textShadow: i === 2 ? `0 0 26px ${C.red}` : undefined}}>{l[1]}</div>
						</Card>
					</At>
					{i < 2 ? <At x={540 + (i - 0.5) * 40} y={670 + i * 300} s={pop(t, ks[i + 1] - 0.5)}><div style={{fontSize: 70, color: cols[i + 1], fontWeight: 900}}>↓</div></At> : null}
				</React.Fragment>
			))}
		</AbsoluteFill>
	);
};
const Resume: React.FC<{title: string; col: string; pct: number; k: number; S: any; bad?: boolean}> = ({title, col, pct, k, S, bad}) => (
	<Card w={430} col={col} pad={26}>
		<div style={{display: 'flex', gap: 16, alignItems: 'center', marginBottom: 18}}>
			<div style={{width: 70, height: 70, borderRadius: 35, background: '#3d5a52'}} />
			<div style={{flex: 1}}>{[1, 0.7, 0.85].map((w, i) => <div key={i} style={{height: 12, width: `${w * 100}%`, background: 'rgba(255,255,255,.18)', borderRadius: 6, marginBottom: 8}} />)}</div>
		</div>
		{[0.9, 0.6, 0.8, 0.5].map((w, i) => <div key={i} style={{height: 10, width: `${w * 100}%`, background: 'rgba(255,255,255,.1)', borderRadius: 5, marginBottom: 10}} />)}
		<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 30, color: col, margin: '14px 0 10px', whiteSpace: 'nowrap'}}>{(bad ? '⚠ ' : '✓ ') + title}</div>
		<div style={{height: 300, display: 'flex', alignItems: 'flex-end', gap: 14}}>
			<div style={{width: 120, height: 300 * (pct / 40) * k, background: `linear-gradient(${col}, ${col}55)`, borderRadius: 12, boxShadow: `0 0 20px ${col}`}} />
			<div>
				<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 84, color: col}}>{Math.round(pct * k)}%</div>
				<div style={{fontFamily: BODY, fontWeight: 700, fontSize: 26, color: C.mute}}>{S.callbacks}</div>
			</div>
		</div>
	</Card>
);
export const Career: React.FC<{K: any; S: any}> = ({K, S}) => {
	const t = useT();
	return (
		<AbsoluteFill>
			<At x={290} y={760} s={pop(t, K.exp - 0.4)}><Resume title={S.cvA} col={C.green} pct={34} k={eout(P(t, K.half - 0.4, K.half + 0.6))} S={S} /></At>
			<At x={790} y={760} s={pop(t, K.exp - 0.2)}><Resume title={S.cvB} col={C.red} pct={17} k={eout(P(t, K.p17 - 0.4, K.p17 + 0.5))} S={S} bad /></At>
			<At x={540} y={260} s={pop(t, K.half - 0.3)}><Badge text="÷ 2" col={C.red} size={80} /></At>
			<At x={540} y={1290} s={pop(t, K.p17 + 0.6)}><div style={{fontFamily: BODY, fontWeight: 700, fontSize: 28, color: C.mute}}>{S.expNote}</div></At>
		</AbsoluteFill>
	);
};
// ---------- 3D balance scale ----------
const Scale3D: React.FC<{tilt: number; coins: number}> = ({tilt, coins}) => (
	<ThreeCanvas width={1080} height={1100} camera={{fov: 32, position: [0, 1.6, 15.5]}}>
		<ambientLight intensity={0.6} />
		<directionalLight position={[4, 6, 6]} intensity={1.8} />
		<directionalLight position={[-5, 2, -4]} intensity={1.2} color="#7fffd0" />
		<group position={[0, -1.6, 0]}>
			<mesh position={[0, 0.05, 0]}><cylinderGeometry args={[1.2, 1.4, 0.2, 48]} /><meshStandardMaterial color="#c9a227" metalness={0.9} roughness={0.25} /></mesh>
			<mesh position={[0, 2.0, 0]}><cylinderGeometry args={[0.12, 0.16, 3.8, 24]} /><meshStandardMaterial color="#d8b23a" metalness={0.9} roughness={0.25} /></mesh>
			<group position={[0, 3.9, 0]} rotation={[0, 0, -tilt]}>
				<mesh><boxGeometry args={[6, 0.16, 0.2]} /><meshStandardMaterial color="#e2bf4a" metalness={0.9} roughness={0.2} /></mesh>
				<mesh><sphereGeometry args={[0.22, 24, 16]} /><meshStandardMaterial color="#e2bf4a" metalness={0.9} roughness={0.2} /></mesh>
				{[-1, 1].map((sd) => (
					<group key={sd} position={[sd * 2.8, 0, 0]} rotation={[0, 0, tilt]}>
						{[-0.6, 0.6].map((dx) => <mesh key={dx} position={[dx / 2, -0.8, 0]} rotation={[0, 0, dx > 0 ? 0.35 : -0.35]}><cylinderGeometry args={[0.02, 0.02, 1.7, 6]} /><meshStandardMaterial color="#bbb" metalness={1} /></mesh>)}
						<mesh position={[0, -1.6, 0]}><cylinderGeometry args={[1.0, 0.85, 0.12, 40]} /><meshStandardMaterial color="#d8b23a" metalness={0.9} roughness={0.25} /></mesh>
						{sd < 0
							? Array.from({length: 5}).map((_, i) => <mesh key={i} position={[(i % 2) * 0.05, -1.5 + i * 0.09 + (1 - coins) * (2 + i), 0]} scale={coins > 0.02 ? 1 : 0.001}><cylinderGeometry args={[0.32, 0.32, 0.08, 32]} /><meshStandardMaterial color="#2ee68a" metalness={0.7} roughness={0.25} emissive="#2ee68a" emissiveIntensity={0.25} /></mesh>)
							: <mesh position={[0, -1.0, 0]}><boxGeometry args={[1.5, 1.1, 0.9]} /><meshStandardMaterial color="#3a2b22" metalness={0.3} roughness={0.5} /></mesh>}
						{sd > 0 ? <mesh position={[0, -0.36, 0]}><torusGeometry args={[0.3, 0.06, 12, 32, Math.PI]} /><meshStandardMaterial color="#c9a227" metalness={0.9} /></mesh> : null}
					</group>
				))}
			</group>
		</group>
	</ThreeCanvas>
);
export const Balance: React.FC<{K: any; S: any; t0: number}> = ({K, S, t0}) => {
	const t = useT();
	const k = eio(P(t, K.lost - 0.2, K.lost + 0.8));
	const tilt = 0.06 * Math.sin(t * 3) * (1 - k) + 0.42 * k; // positive = right pan down
	const coins = 1 - eio(P(t, K.burn, K.burn + 1.0));
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{top: 260}}><Scale3D tilt={tilt} coins={coins} /></AbsoluteFill>
			<At x={250} y={600 - 170 * k} s={pop(t, t0 + 0.2) * (0.4 + 0.6 * coins)}><Pill text={S.saved} bg={C.green} size={40} /></At>
			<At x={830} y={600 + 170 * k} s={pop(t, K.lost - 0.3)}><Pill text={S.career} bg={C.cream} size={30} /></At>
			<At x={540} y={1340} s={pop(t, K.burn - 0.2)}><Badge text={'🔥 '.replace('🔥 ', '') + S.burn} col={C.red} size={44} /></At>
		</AbsoluteFill>
	);
};
export const Receipt: React.FC<{K: any; S: any}> = ({K, S}) => {
	const t = useT();
	const hl = P(t, K.pct - 0.3, K.pct + 0.3);
	return (
		<AbsoluteFill>
			<At x={540} y={260} s={pop(t, K.everyone - 0.4)}><Badge text={S.everyone} col={C.gold} size={54} /></At>
			<At x={540} y={820} s={pop(t, K.everyone - 0.1)} rot={-3}>
				<div style={{width: 600, background: '#fbfbf6', borderRadius: 10, padding: '40px 46px', boxShadow: '0 30px 80px rgba(0,0,0,.5)', fontFamily: 'Inter', color: '#222', whiteSpace: 'normal'}}>
					<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 48, textAlign: 'center'}}>{S.rcTitle}</div>
					<div style={{borderTop: '4px dashed #aaa', margin: '20px 0'}} />
					{S.rc.map(([n, p]: string[], i: number) => <div key={i} style={{display: 'flex', justifyContent: 'space-between', fontSize: 38, fontWeight: 700, margin: '10px 0', opacity: Math.min(1, pop(t, K.everyone + 0.2 + i * 0.15))}}><span>{n}</span><span>{p}</span></div>)}
					<div style={{borderTop: '4px dashed #aaa', margin: '20px 0'}} />
					<div style={{display: 'flex', justifyContent: 'space-between', fontSize: 34, fontWeight: 800, color: '#e0244a', background: `rgba(255,59,79,${0.18 * hl})`, padding: '8px 10px', borderRadius: 8, transform: `scale(${1 + 0.05 * hl})`, opacity: Math.min(1, hl * 2)}}><span>{S.rcTheft}</span><span>⚠</span></div>
					<div style={{display: 'flex', justifyContent: 'space-between', fontSize: 44, fontWeight: 900, marginTop: 18}}><span>{S.total}</span><span>✓</span></div>
					<div style={{display: 'flex', gap: 4, marginTop: 24, height: 60}}>{Array.from({length: 46}).map((_, i) => <div key={i} style={{width: i % 3 ? 3 : 7, background: '#222'}} />)}</div>
				</div>
			</At>
		</AbsoluteFill>
	);
};
export const Kiosk: React.FC<{K: any; S: any}> = ({K, S}) => {
	const t = useT();
	const scan = (t * 1.2) % 1;
	return (
		<AbsoluteFill>
			<At x={540} y={260} s={pop(t, K.kiosk - 0.5)}><Pill text={S.kiosk} bg={C.sky} size={40} /></At>
			<At x={540} y={800} s={pop(t, K.kiosk - 0.3)}>
				<svg width={560} height={720} viewBox="0 0 560 720">
					<rect x={130} y={20} width={300} height={220} rx={24} fill="#16302a" stroke={C.sky} strokeWidth={6} />
					<rect x={160} y={50} width={240} height={160} rx={12} fill="#0a1714" />
					<text x={280} y={115} textAnchor="middle" fontFamily="Inter Display" fontWeight={900} fontSize={34} fill={C.green}>SCAN</text>
					<rect x={200} y={150} width={160} height={28} rx={14} fill={C.green} opacity={0.8} />
					<rect x={260} y={240} width={40} height={140} fill="#2b4a42" />
					<rect x={40} y={380} width={480} height={300} rx={30} fill="#1d3a33" stroke={C.sky} strokeWidth={6} />
					<rect x={90} y={410} width={380} height={30} rx={10} fill="#0a1714" />
					<line x1={100} x2={460} y1={425} y2={425} stroke={C.red} strokeWidth={6} opacity={0.4 + 0.6 * Math.sin(scan * Math.PI)} />
					<rect x={200 + 120 * Math.sin(t * 2)} y={330} width={110} height={70} rx={10} fill={C.gold} />
				</svg>
			</At>
			<At x={790} y={560} s={pop(t, K.p22 - 0.3)} rot={8}><Badge text={S.p22} col={C.red} size={60} /></At>
			<At x={540} y={1300} s={pop(t, K.p22 + 0.5)}><div style={{fontFamily: BODY, fontWeight: 700, fontSize: 28, color: C.mute}}>{S.p22note}</div></At>
		</AbsoluteFill>
	);
};
export const Finale: React.FC<{K: any; S: any; t0: number}> = ({K, S, t0}) => {
	const t = useT();
	const crash = eio(P(t, t0 + 0.3, K.deal));
	const stamp = P(t, K.deal - 0.1, K.deal + 0.15);
	return (
		<AbsoluteFill>
			<At x={540} y={760} s={1}><Chart k={1} crash={crash} S={S} value={crash > 0.4 ? '−∞' : S.y} col={crash > 0.3 ? C.red : C.green} /></At>
			{stamp > 0 ? <At x={540} y={760} s={3 - 2 * eout(stamp)} rot={-12} o={Math.min(1, stamp * 2)}>
				<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 80, color: C.red, border: `10px solid ${C.red}`, borderRadius: 24, padding: '10px 40px', background: 'rgba(30,5,8,.6)', textShadow: `0 0 30px ${C.red}`}}>{S.deal}</div>
			</At> : null}
			<At x={300} y={1260} s={pop(t, K.kop - 0.3)}><Pill text={S.kop} bg={C.green} size={32} /></At>
			<At x={770} y={1260} s={pop(t, K.future - 0.3)}><Pill text={S.future} bg={C.red} size={32} fg="#fff" /></At>
		</AbsoluteFill>
	);
};
export const DealMeter: React.FC<{v: number; o: number; S: any}> = ({v, o, S}) => {
	if (o <= 0) return null;
	return (
		<At x={540} y={1505} o={o}>
			<div style={{width: 760, display: 'flex', alignItems: 'center', gap: 16}}>
				<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 26, color: C.green}}>{S.meterL}</div>
				<div style={{flex: 1, height: 22, borderRadius: 11, background: `linear-gradient(90deg, ${C.green}, ${C.gold}, ${C.red})`, position: 'relative', boxShadow: '0 0 18px rgba(0,0,0,.6)'}}>
					<div style={{position: 'absolute', left: `${v * 100}%`, top: -12, width: 10, height: 46, marginLeft: -5, background: '#fff', borderRadius: 5, boxShadow: '0 0 14px #fff'}} />
				</div>
				<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 26, color: C.red}}>{S.meterR}</div>
			</div>
		</At>
	);
};
