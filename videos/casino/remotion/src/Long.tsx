import React from 'react';
import {AbsoluteFill, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Audio} from '@remotion/media';
import {Calc, Cards, Crowd, EdgeTable, Martingale, PocketStrip, Roulette3D, SimChart, Slot, Streak} from './Comps';
import {CTA} from './CTA';
import {CasinoBg, chapters} from './Short';
import {LONG as L} from './strings';
import {At, Badge, BODY, C, Card, DISPLAY, FPS, P, Pill, Title, eout, pop} from './ui';

const Win: React.FC<{a: number; b: number; children: React.ReactNode; last?: boolean}> = ({a, b, children, last}) => {
	const t = useCurrentFrame() / FPS;
	if (t < a - 0.4 || t > b + 0.4) return null;
	const i = eout(P(t, a - 0.35, a + 0.4)), o = last ? 1 : 1 - P(t, b - 0.3, b + 0.2);
	return <AbsoluteFill style={{opacity: i * o, transform: `scale(${1.04 - 0.04 * i})`}}>{children}</AbsoluteFill>;
};
const PartTitle: React.FC<{n: number; title: string; at: number}> = ({n, title, at}) => {
	const t = useCurrentFrame() / FPS;
	const k = P(t, at, at + 0.5) * (1 - P(t, at + 3.5, at + 4.1));
	if (k <= 0) return null;
	return (
		<div style={{position: 'absolute', left: 80, bottom: 90, opacity: k, transform: `translateX(${(1 - eout(Math.min(1, k * 1.2))) * -60}px)`}}>
			<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 28, color: C.gold, letterSpacing: 4}}>PART {n}</div>
			<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 64, color: '#fff', textShadow: '0 4px 20px rgba(0,0,0,.7)'}}>{title}</div>
			<div style={{height: 6, width: 160, background: C.gold, borderRadius: 3, marginTop: 10, boxShadow: `0 0 14px ${C.gold}`}} />
		</div>
	);
};
const sfx = (src: string, at: number, vol: number, key: string) => <Sequence key={key} from={Math.max(0, Math.round(at * FPS))} layout="none"><Audio src={staticFile('sfx/' + src)} volume={vol} /></Sequence>;
const Txt: React.FC<{text: string; size?: number; col?: string}> = ({text, size = 40, col = C.cream}) => <div style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: size, color: col}}>{text}</div>;

export const CasinoLong: React.FC<{data: any}> = ({data}) => {
	const K = data.k, ch = chapters(data, 11), dur = data.dur;
	const t = useCurrentFrame() / FPS;
	const MUSIC = 86, loops = Math.ceil(dur / MUSIC) + 1;
	return (
		<AbsoluteFill>
			<CasinoBg />
			{/* 1 — Monte Carlo cold open */}
			<Win a={0} b={ch[1]}>
				<AbsoluteFill style={{left: 960}}><Roulette3D t={t} w={960} h={1080} land={99} glow={0} /></AbsoluteFill>
				<At x={480} y={520} s={pop(t, K.black - 0.3)}><Streak t={t} t0={K.black} n={26} cols={7} size={90} perSec={26 / Math.max(1, K.p26 - K.black)} /></At>
				<At x={480} y={160} s={pop(t, K.aug - 0.2)}><Badge text="MONTE CARLO · AUGUST 1913" col={C.gold} size={40} /></At>
				<At x={480} y={880} s={pop(t, K.red - 0.3)}><Pill text='EVERYONE: "RED IS DUE!"' bg={C.red} size={38} fg="#fff" /></At>
				{t > K.why - 0.5 ? <AbsoluteFill style={{background: `rgba(10,3,6,${0.8 * P(t, K.why - 0.5, K.why)})`}}>
					<At x={960} y={460} s={pop(t, K.why - 0.3)}><Title text={L.title1} col="#fff" size={120} /></At>
					<At x={960} y={600} s={pop(t, K.why)}><Title text={L.title2} col={C.gold} size={150} glow={C.gold} /></At>
					<At x={960} y={780} s={pop(t, K.math - 0.2)}><Pill text="IT'S MATH" bg={C.gold} size={44} /></At>
				</AbsoluteFill> : null}
			</Win>
			{/* 2 — house edge */}
			<Win a={ch[1]} b={ch[2]}>
				<AbsoluteFill style={{width: 900}}><Roulette3D t={t} w={900} h={1080} land={K.gap + 0.4} glow={P(t, K.gap + 0.4, K.gap + 1)} tilt={1.0} dist={17} /></AbsoluteFill>
				<At x={1400} y={190} s={pop(t, K.p37 - 0.4)}><PocketStrip t={t} t0={K.p37 - 0.4} zeroGlow={P(t, K.gap, K.gap + 0.4)} w={860} /></At>
				<At x={1400} y={340} s={pop(t, K.p486 - 0.4)}><Title text={L.p486} col={C.cream} size={70} /></At>
				<At x={1400} y={520} s={pop(t, K.single - 0.3)}><div style={{display: 'flex', gap: 30}}>{L.pay.map(([a, b]: string[], i: number) => <Card key={i} w={360} col={i ? C.green : C.red} pad={24}><Txt text={a} size={28} col={C.mute} /><Txt text={b} size={72} col={i ? C.green : C.red} /></Card>)}</div></At>
				<At x={1400} y={760} s={pop(t, K.eu - 0.3)}><div style={{display: 'flex', gap: 30}}><Card w={360} col={C.gold} pad={24}><Txt text={L.eu[0]} size={26} col={C.mute} /><Txt text={L.eu[1]} size={80} col={C.gold} /></Card>
					<div style={{opacity: Math.min(1, pop(t, K.us - 0.3))}}><Card w={360} col={C.orange} pad={24}><Txt text={L.us[0]} size={26} col={C.mute} /><Txt text={L.us[1]} size={80} col={C.orange} /></Card></div></div></At>
				<At x={1400} y={940} s={pop(t, K.gap - 0.3)}><Badge text="= THE HOUSE EDGE" col={C.red} size={44} /></At>
			</Win>
			{/* 3 — law of large numbers */}
			<Win a={ch[2]} b={ch[3]}>
				<At x={960} y={130} s={pop(t, K.lln - 0.4)}><Badge text={L.lln} col={C.gold} size={48} /></At>
				<At x={960} y={580} s={pop(t, ch[2] + 0.1)}><div style={{padding: 30, borderRadius: 30, background: 'rgba(20,6,10,.8)', border: '3px solid rgba(255,201,77,.35)'}}><SimChart k={eout(P(t, K.thousand - 0.5, K.predictable))} w={1500} h={640} houseLabel="THE HOUSE" playerLabel="1,000 PLAYERS × 100 BETS" houseOn={P(t, K.total - 0.4, K.total + 0.4)} /></div></At>
				<At x={520} y={990} s={pop(t, K.win - 0.3)}><Pill text={L.small} bg={C.cream} size={30} /></At>
				<At x={1420} y={990} s={pop(t, K.predictable - 0.4)}><Pill text={L.pred} bg={C.gold} size={30} /></At>
			</Win>
			{/* 4 — Martingale */}
			<Win a={ch[3]} b={ch[4]}>
				<At x={960} y={120} s={pop(t, K.mart - 0.4)}><Badge text={L.mart} col={C.gold} size={52} /></At>
				<At x={960} y={590} s={1}><Martingale t={t} t0={K.double - 0.2} w={1500} h={760} limit={5000} limitLabel={L.limit} limitOn={P(t, K.limit - 0.3, K.limit + 0.3)} /></At>
				<At x={560} y={330} s={pop(t, K.love - 0.4)} rot={-4}><Badge text={L.love} col={C.red} size={44} /></At>
			</Win>
			{/* 5 — every game */}
			<Win a={ch[4]} b={ch[5]}>
				<At x={600} y={540} s={pop(t, ch[4])}><EdgeTable t={t} w={950} rows={L.edgeRows.map((r: any, i: number) => [r[0], r[1], r[2], [K.bj, K.bac, K.rou, K.rou + 0.8, K.slots][i]])} /></At>
				<At x={1480} y={460} s={pop(t, K.nov - 0.4)}><Card w={620} col={C.red} pad={36}><Title text={L.nov} col={C.red} size={150} glow={C.red} /><div style={{fontFamily: BODY, fontWeight: 700, fontSize: 30, color: C.cream, textAlign: 'center'}}>{L.novSub}</div></Card></At>
			</Win>
			{/* 6 — brain */}
			<Win a={ch[5]} b={ch[6]}>
				<At x={560} y={540} s={1}><Slot t={t} t0={ch[5] + 0.1} stops={[0.8, 1.3, 2.6]} final={[1, 6, 1]} nearMiss size={210} flash={P(t, K.ldw, K.ldw + 0.3) * (0.5 + 0.5 * Math.sin(t * 14)) * (1 - P(t, K.rng - 0.5, K.rng))} /></At>
				<At x={1420} y={190} s={pop(t, K.near - 0.3)}><Badge text={L.near} col={C.gold} size={50} /></At>
				<At x={1420} y={330} s={pop(t, K.reward - 0.3)}><Pill text={L.reward} bg={C.violet} size={30} fg="#fff" /></At>
				<At x={1420} y={590} s={pop(t, K.ldw - 0.3)}><Card w={660} col={C.gold} pad={28}>{L.ldw.map((x: string, i: number) => <Txt key={i} text={x} size={i === 3 ? 50 : 38} col={i === 3 ? C.red : i === 2 ? C.gold : C.cream} />)}</Card></At>
				<At x={1420} y={880} s={pop(t, K.rng - 0.3)}><Pill text={L.rng} bg={C.sky} size={28} /></At>
				<At x={1420} y={970} s={pop(t, K.never - 0.3)}><Txt text={L.never} size={34} col={C.mute} /></At>
			</Win>
			{/* 7 — jackpot */}
			<Win a={ch[6]} b={ch[7]}>
				<At x={960} y={560} s={1}><Crowd t={t} t0={ch[6] + 0.2} w={1600} cols={32} rows={8} winnerLabel={L.winner} flash={P(t, K.lights - 0.2, K.lights + 0.3) * (0.5 + 0.5 * Math.sin(t * 12))} /></At>
				<At x={960} y={170} s={pop(t, K.couldbe - 0.3)}><Badge text={L.couldbe} col={C.gold} size={50} /></At>
				<At x={960} y={960} s={pop(t, K.thousands - 0.3)}><Pill text={L.paid} bg={C.red} size={36} fg="#fff" /></At>
			</Win>
			{/* 8 — theoretical loss */}
			<Win a={ch[7]} b={ch[8]}>
				<At x={620} y={540} s={pop(t, K.theo - 0.4)}><Calc t={t} w={900} rows={L.calc.map((r: string[], i: number) => [r[0], r[1], r[2] === 'ex' ? K.ex + i * 0.9 : K[r[2]]] as [string, string, number])} result={L.calcRes} resAt={K.loss} /></At>
				<At x={1470} y={160} s={pop(t, K.theo - 0.3)}><Badge text="THEORETICAL LOSS" col={C.gold} size={44} /></At>
				{L.comps.map((c: string, i: number) => <At key={i} x={1470} y={420 + i * 130} s={pop(t, K.comps - 0.2 + i * 0.3)}><Pill text={c} bg={[C.sky, C.green, C.violet][i]} size={36} /></At>)}
				<At x={1470} y={880} s={pop(t, K.card - 0.3)}><Pill text={L.card} bg={C.gold} size={32} /></At>
			</Win>
			{/* 9 — myths */}
			<Win a={ch[8]} b={ch[9]}>
				<At x={560} y={420} s={pop(t, K.clocks - 0.3)}><Card w={760} col={C.cream} pad={40}><Title text={L.clocks} col="#fff" size={56} /><div style={{fontFamily: BODY, fontWeight: 700, fontSize: 28, color: C.mute, textAlign: 'center', marginTop: 14}}>{L.friedman}</div></Card></At>
				{t > K.called - 0.2 ? <At x={560} y={640} s={2.2 - 1.2 * eout(P(t, K.called - 0.2, K.called + 0.1))} rot={-10} o={Math.min(1, P(t, K.called - 0.2, K.called) * 3)}><div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 54, color: C.red, border: `7px solid ${C.red}`, borderRadius: 18, padding: '6px 26px', background: 'rgba(30,5,8,.75)'}}>{L.myth}</div></At> : null}
				<At x={1400} y={420} s={pop(t, K.chips - 0.3)}>
					<div style={{display: 'flex', alignItems: 'center', gap: 30}}>
						<div style={{width: 220, height: 110, borderRadius: 12, background: 'linear-gradient(135deg,#3f8f5a,#1f5f3a)', border: '4px solid #bfe8c8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: DISPLAY, fontWeight: 900, fontSize: 56, color: '#e8ffe8'}}>$100</div>
						<div style={{fontSize: 60, color: C.gold, fontWeight: 900}}>→</div>
						<div style={{display: 'flex', flexDirection: 'column-reverse'}}>{[C.red, C.sky, C.violet, C.gold].map((c, i) => <div key={i} style={{width: 150, height: 34, borderRadius: '50%', background: c, border: '4px dashed #fff', marginTop: -14, transform: `translateY(${(1 - eout(P(t, K.plastic - 0.3 + i * 0.1, K.plastic + i * 0.1))) * -200}px)`}} />)}</div>
					</div>
				</At>
				<At x={1400} y={620} s={pop(t, K.plastic)}><Pill text={L.chips} bg={C.violet} size={30} fg="#fff" /></At>
				<At x={960} y={900} s={pop(t, K.edge - 0.3)}><Badge text={L.edgeWork} col={C.gold} size={54} /></At>
			</Win>
			{/* 10 — no memory */}
			<Win a={ch[9]} b={ch[10]}>
				<AbsoluteFill style={{width: 860}}><Roulette3D t={t} w={860} h={1080} land={99} glow={0} tilt={1.0} dist={17} /></AbsoluteFill>
				<At x={1380} y={210} s={pop(t, K.still - 0.3)}><Title text={L.still} col={C.cream} size={130} /></At>
				<At x={1380} y={320} s={pop(t, K.still)}><Txt text={L.stillSub} size={32} col={C.mute} /></At>
				<At x={1380} y={430} s={pop(t, K.due - 0.3)}><Badge text={L.due} col={C.red} size={46} /></At>
				<At x={1380} y={540} s={pop(t, K.fallacy - 0.3)}><Pill text={L.fallacy} bg={C.gold} size={32} /></At>
				<At x={1380} y={760} s={pop(t, K.counters - 0.5)}><Cards t={t} t0={K.counters - 0.3} size={110} /></At>
				<At x={1380} y={990} s={pop(t, K.leave - 0.3)}><Pill text={`${L.counting} · ${L.leave}`} bg={C.cream} size={26} /></At>
			</Win>
			{/* 11 — outro */}
			<Win a={ch[10]} b={ch[11]} last>
				<AbsoluteFill style={{opacity: 0.55}}><Roulette3D t={t} w={1920} h={1080} land={ch[10] + 3} glow={P(t, ch[10] + 3, ch[10] + 3.5)} tilt={1.2} dist={17} /></AbsoluteFill>
				{L.tips.map((x: string, i: number) => <At key={i} x={960} y={300 + i * 120} s={pop(t, [K.night, K.budget, K.walk][i] - 0.3) * (K.cta !== undefined ? 1 - P(t, K.cta - 0.4, K.cta) : 1)}><Pill text={x} bg={[C.cream, C.gold, C.green][i]} size={46} /></At>)}
				<At x={960} y={740} s={pop(t, K.long - 0.4) * (K.cta !== undefined ? 1 - P(t, K.cta - 0.4, K.cta) : 1)}><Title text={L.fin} col={C.gold} size={64} glow={C.gold} /></At>
			</Win>
			{L.parts.map((p: string, i: number) => <PartTitle key={i} n={i + 1} title={p} at={i === 0 ? 0.6 : ch[i] + 0.3} />)}
			<CTA K={K} S={L} cx={960} cy={-760} />
			{Array.from({length: loops}).map((_, i) => (
				<Sequence key={'m' + i} from={Math.round(i * (MUSIC - 4) * FPS)} durationInFrames={Math.round(MUSIC * FPS)} layout="none">
					<Audio src={staticFile('music.mp3')} volume={(f) => 0.12 * Math.min(1, f / (4 * FPS)) * Math.min(1, (MUSIC * FPS - f) / (4 * FPS)) * Math.min(1, (dur * FPS - (f + i * (MUSIC - 4) * FPS)) / 90)} />
				</Sequence>
			))}
			<Sequence from={15} layout="none"><Audio src={staticFile('long/voice.mp3')} volume={1.1} /></Sequence>
			{sfx('spin.mp3', 0.5, 0.3, 'sp')}{sfx('gasp.mp3', K.crowd, 0.35, 'g1')}{sfx('drop.mp3', K.gap + 0.4, 0.4, 'd1')}{sfx('chips.mp3', K.even, 0.35, 'c1')}
			{sfx('chips.mp3', K.double, 0.35, 'c2')}{sfx('reels.mp3', ch[5] + 0.1, 0.3, 'r1')}{sfx('jackpot.mp3', K.lights - 0.2, 0.3, 'j1')}{sfx('card.mp3', K.counters, 0.3, 'cd')}
			{sfx('drop.mp3', ch[10] + 2.7, 0.3, 'd2')}
			{[K.p486, K.single, K.eu, K.us, K.lln, K.total, K.limit, K.bj, K.bac, K.rou, K.slots, K.nov, K.near, K.ldw, K.rng, K.couldbe, K.theo, K.loss, K.comps, K.called, K.chips, K.due, K.fallacy].map((k: number, i: number) => sfx('pop.mp3', k - 0.3, 0.25, 'p' + i))}
			{K.cta !== undefined ? <>{sfx('pop.mp3', K.cta + 1.1, 0.45, 'tap')}{sfx('jackpot.mp3', K.cta + 2.0, 0.22, 'like')}</> : null}
		</AbsoluteFill>
	);
};
