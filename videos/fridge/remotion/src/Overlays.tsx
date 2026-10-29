import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {At, Badge, BODY, C, Card, DISPLAY, FPS, P, Pill, Title, eout, pop} from './ui';
import {makeCam, project} from './scene';
import {VH, VW, VY} from './Fridge3D';

const Tag: React.FC<{p: {x: number; y: number}; dx: number; dy: number; s: number; col: string; text: string; size?: number}> = ({p, dx, dy, s, col, text, size = 32}) => s <= 0 ? null : (
	<>
		<svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, opacity: Math.min(1, s)}}>
			<line x1={p.x} y1={p.y} x2={p.x + dx} y2={p.y + dy} stroke={col} strokeWidth={4} /><circle cx={p.x} cy={p.y} r={10} fill={col} />
		</svg>
		<At x={p.x + dx} y={p.y + dy} s={s}><Pill text={text} bg={col} size={size} /></At>
	</>
);
const Thermo: React.FC<{val: string; col: string; k: number}> = ({val, col, k}) => (
	<div style={{display: 'flex', alignItems: 'center', gap: 14}}>
		<div style={{width: 34, height: 150, borderRadius: 17, border: `4px solid ${C.cream}`, position: 'relative', background: 'rgba(7,18,31,.8)'}}>
			<div style={{position: 'absolute', bottom: 4, left: 5, width: 16, height: 20 + 110 * k, borderRadius: 8, background: col, boxShadow: `0 0 16px ${col}`}} />
		</div>
		<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 56, color: col, textShadow: `0 0 20px ${col}`}}>{val}</div>
	</div>
);
export const Overlays: React.FC<{ch: number[]; K: any; S: any}> = ({ch, K, S}) => {
	const t = useCurrentFrame() / FPS;
	const cam = makeCam(t, ch, VW, VH);
	const pr = (v: number[]) => project(cam, v, VW, VH, VY);
	const vis = (i: number) => P(t, ch[i] - 0.1, ch[i] + 0.3) * (1 - P(t, ch[i + 1] - 0.3, ch[i + 1] + 0.05));
	const L: React.ReactNode[] = [];
	const add = (i: number, node: React.ReactNode) => {const o = vis(i); if (o > 0) L.push(<AbsoluteFill key={i} style={{opacity: o}}>{node}</AbsoluteFill>);};
	add(0, <>
		<At x={540} y={250} s={pop(t, 0.1)}><Title text={S.t1} col="#fff" size={86} /></At>
		<At x={540} y={350} s={pop(t, 0.35)}><Title text={S.t2} col={C.cyan} size={96} glow={C.cyan} /></At>
		<At x={540} y={1250} s={pop(t, K.nocold - 0.3)} rot={-4}><Badge text={'✕ ' + S.nocold} col={C.red} size={50} /></At>
		<At x={540} y={1380} s={pop(t, K.out - 0.2)}><Pill text={S.out} bg={C.orange} size={40} /></At>
	</>);
	add(1, <>
		<At x={540} y={260} s={pop(t, K.back - 0.4)}><Badge text={S.back} col={C.red} size={60} /></At>
		<At x={300} y={1240} s={pop(t, K.back)}><Thermo val={'≈ 35 °'} col={C.red} k={eout(P(t, K.back, K.back + 1.2))} /></At>
		<At x={540} y={1400} s={pop(t, K.touch - 0.3)}><Pill text={S.touch} bg={C.orange} size={36} /></At>
	</>);
	add(2, <>
		<At x={540} y={260} s={pop(t, K.agent - 0.4)}><Badge text={S.agent} col={C.cyan} size={60} /></At>
		<At x={540} y={1300} s={pop(t, K.iso - 0.3)}>
			<Card w={760} col={C.cyan}>
				<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 52, color: '#fff', textAlign: 'center'}}>{S.iso}</div>
				<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 62, color: C.cyan, textAlign: 'center', marginTop: 10, opacity: Math.min(1, pop(t, K.boil - 0.3)), textShadow: `0 0 24px ${C.cyan}`}}>{S.boil}</div>
			</Card>
		</At>
	</>);
	add(3, <>
		<Tag p={pr([0.0, 3.55, -0.62])} dx={-60} dy={-300} s={pop(t, K.evap - 0.3)} col={C.cyan} text={S.evap} size={38} />
		<At x={770} y={1240} s={pop(t, K.food)}><Thermo val={S.fridgeT} col={C.sky} k={0.35} /></At>
		<At x={300} y={1240} s={pop(t, K.food + 0.3)}><Thermo val={S.freezerT} col={C.ice} k={0.1} /></At>
		<At x={540} y={1420} s={pop(t, K.sweat - 0.3)}><Pill text={S.sweat} bg={C.teal} size={38} /></At>
	</>);
	add(4, <>
		<Tag p={pr([0.45, 0.38, -1.22])} dx={-260} dy={-200} s={pop(t, K.comp - 0.3)} col={C.red} text={S.comp} size={38} />
		<At x={540} y={260} s={pop(t, K.hot - 0.3)}><Badge text={S.hot + ' 🔥'.replace(' 🔥', '')} col={C.red} size={60} /></At>
		<Tag p={pr([0, 2.6, -1.06])} dx={150} dy={-330} s={pop(t, K.grid - 0.3)} col={C.orange} text={S.grid} size={34} />
		<At x={540} y={1420} s={pop(t, K.grid + 0.6)}><Pill text={S.toRoom} bg={C.orange} size={38} /></At>
	</>);
	add(5, <>
		<Tag p={pr([-0.88, 3.7, -1.0])} dx={120} dy={-330} s={pop(t, K.tube - 0.3)} col={C.sky} text={S.tube} size={38} />
		<At x={540} y={1300} s={pop(t, K.drop - 0.3)}><Badge text={S.drop} col={C.cyan} size={50} /></At>
		<At x={540} y={1430} s={pop(t, K.loop - 0.3)}><Pill text={S.loop + ' ↻'} bg={C.teal} size={38} /></At>
	</>);
	add(6, <AbsoluteFill style={{background: 'rgba(5,10,22,.55)'}}>
		{S.hist.map((h: string[], i: number) => {
			const kt = [K.ammonia, K.freon, K.ban, K.ban + 1.6][i]; const col = [C.red, C.sky, C.orange, C.green][i];
			return (
				<At key={i} x={540} y={380 + i * 270} s={pop(t, kt - 0.4)}>
					<Card w={880} col={col} pad={26}>
						<div style={{display: 'flex', alignItems: 'center', gap: 26}}>
							<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 48, color: col, width: 220}}>{h[0]}</div>
							<div>
								<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 40, color: '#fff'}}>{h[1]}</div>
								<div style={{fontFamily: BODY, fontWeight: 800, fontSize: 30, color: col, marginTop: 6}}>{(i === 0 ? '☠ ' : '') + h[2]}</div>
							</div>
						</div>
					</Card>
				</At>
			);
		})}
	</AbsoluteFill>);
	add(7, <>
		<At x={540} y={250} s={pop(t, K.pump - 0.7)}><Title text={S.fin1} col="#fff" size={80} /></At>
		<At x={540} y={355} s={pop(t, K.pump - 0.3)}><Title text={S.fin2} col={C.cyan} size={96} glow={C.cyan} /></At>
		<AbsoluteFill style={{opacity: K.cta === undefined ? 1 : 1 - P(t, K.cta - 0.4, K.cta)}}>
		<At x={540} y={1260} s={pop(t, K.door - 0.3)}><Pill text={S.door} bg={C.cream} size={36} /></At>
		<At x={540} y={1400} s={pop(t, K.heat - 0.3)}>
			<div style={{display: 'flex', alignItems: 'center', gap: 20}}>
				<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 40, color: C.cream}}>{S.kitchen}</div>
				<Thermo val={''} col={C.red} k={0.3 + 0.6 * eout(P(t, K.heat, K.heat + 2))} />
				<Pill text={S.warmer} bg={C.red} size={34} fg="#fff" />
			</div>
		</At>
		</AbsoluteFill>
	</>);
	return <AbsoluteFill>{L}</AbsoluteFill>;
};
export const Cycle: React.FC<{ch: number[]; K: any; S: any}> = ({ch, K, S}) => {
	const t = useCurrentFrame() / FPS;
	const a = P(t, ch[2] - 0.2, ch[2] + 0.4) * (1 - P(t, ch[6] - 0.3, ch[6]));
	if (a <= 0) return null;
	const ts = [K.evap, K.comp, K.grid, K.tube], cols = [C.cyan, C.red, C.orange, C.sky];
	let cur = -1; ts.forEach((k, i) => {if (t >= k - 0.2) cur = i;});
	return (
		<At x={540} y={1530} o={a}>
			<div style={{display: 'flex', gap: 12, alignItems: 'center'}}>
				{S.stages.map((s: string, i: number) => (
					<React.Fragment key={i}>
						<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 24, padding: '10px 16px', borderRadius: 999, color: i === cur ? C.ink : i < cur ? cols[i] : C.mute, background: i === cur ? cols[i] : 'rgba(7,18,31,.85)', border: `3px solid ${i <= cur ? cols[i] : 'rgba(255,255,255,.2)'}`, boxShadow: i === cur ? `0 0 24px ${cols[i]}` : undefined}}>{s}</div>
						{i < 3 ? <div style={{color: C.mute, fontSize: 26, fontWeight: 900}}>→</div> : null}
					</React.Fragment>
				))}
			</div>
		</At>
	);
};

export const CTA: React.FC<{K: any; S: any}> = ({K, S}) => {
	const t = useCurrentFrame() / FPS;
	if (K.cta === undefined || t < K.cta - 0.3) return null;
	const t0 = K.cta, tap = t0 + 1.1, like = t0 + 2.0;
	const appear = pop(t, t0 - 0.2, 0.5);
	const pressed = t > tap, press = Math.sin(P(t, tap - 0.12, tap + 0.12) * Math.PI);
	const hand = P(t, t0 + 0.3, tap) * (1 - P(t, like + 0.6, like + 1.0));
	const handX = t < like - 0.3 ? 760 - 120 * eout(P(t, t0 + 0.3, tap)) : 640 - 120 * eout(P(t, tap + 0.3, like));
	const handY = t < like - 0.3 ? 1260 : 1240 + 180 * eout(P(t, tap + 0.3, like));
	const liked = t > like, lp = pop(t, like, 0.5);
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{background: `rgba(3,8,18,${0.55 * Math.min(1, appear)})`}} />
			<At x={540} y={1210} s={appear * (1 - 0.06 * press)}>
				<div style={{display: 'flex', alignItems: 'center', gap: 22, padding: '30px 64px', borderRadius: 999, background: pressed ? '#2a3448' : '#ff2d46', boxShadow: pressed ? 'none' : '0 0 50px #ff2d46aa', fontFamily: DISPLAY, fontWeight: 900, fontSize: 64, color: '#fff'}}>
					<svg width="56" height="56" viewBox="0 0 24 24"><path d="M12 22a2.5 2.5 0 0 0 2.4-2h-4.8A2.5 2.5 0 0 0 12 22zm7-6V11a7 7 0 0 0-5-6.7V3a2 2 0 0 0-4 0v1.3A7 7 0 0 0 5 11v5l-2 2v1h18v-1z" fill="#fff" /></svg>
					{pressed ? S.subbed : S.sub}
				</div>
			</At>
			<At x={540} y={1420} s={appear}>
				<div style={{position: 'relative', width: 200, height: 200}}>
					<svg width="200" height="200" viewBox="0 0 24 24" style={{transform: `scale(${liked ? 0.9 + 0.25 * lp : 0.9})`}}>
						<path d="M12 21s-7.5-4.6-10-9.3C.4 8.4 2.3 4.5 6 4.5c2.1 0 3.4 1.1 4.2 2.3h3.6c.8-1.2 2.1-2.3 4.2-2.3 3.7 0 5.6 3.9 4 7.2C19.5 16.4 12 21 12 21z" fill={liked ? '#ff2d46' : 'none'} stroke={liked ? '#ff2d46' : '#ffffff'} strokeWidth={1.6} />
					</svg>
					{liked ? Array.from({length: 10}).map((_, i) => {const a = (i / 10) * Math.PI * 2, r = 70 + 90 * eout(P(t, like, like + 0.6)); return <div key={i} style={{position: 'absolute', left: 100 + Math.cos(a) * r - 7, top: 100 + Math.sin(a) * r - 7, width: 14, height: 14, borderRadius: 7, background: i % 2 ? C.gold : '#ff2d46', opacity: 1 - P(t, like + 0.3, like + 0.9)}} />;}) : null}
				</div>
			</At>
			<At x={540} y={1560} s={appear}><div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 40, color: C.cream}}>{S.like}</div></At>
			{hand > 0 ? <At x={handX} y={handY + 40 * press} s={1}><svg width="110" height="130" viewBox="0 0 24 28" style={{opacity: Math.min(1, hand * 3)}}><path d="M9 2a2 2 0 0 1 2 2v8l1-.2a2 2 0 0 1 2.3 1.6l.1.6 1.4-.3a2 2 0 0 1 2.3 1.6l.1.5 1-.2a2 2 0 0 1 2.3 1.6l.6 3.9C22.6 25 20 27 17 27h-5c-2 0-3.5-1-4.5-2.5L3.3 18a2 2 0 0 1 3.1-2.5L7 16V4a2 2 0 0 1 2-2z" fill="#ffffff" stroke="#0b1220" strokeWidth="1.2" /></svg></At> : null}
		</AbsoluteFill>
	);
};
