import React from 'react';
import {AbsoluteFill, Img, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Audio} from '@remotion/media';
import {loadFont} from '@remotion/fonts';
import {Brother, Hose, Medal, RubberBlob, SalesBars, Scissors, Sneaker3D, SoundBars, StepTrail, SwissFlag, TennisBall, Ticker, TrackBg, WaffleIron} from './Comps';
import {CTA} from './CTA';
import {Captions} from './Captions';
import {STR} from './strings';
import {At, Badge, C, DISPLAY, FPS, P, Pill, Title, Txt, eio, eout, pop} from './ui';

for (const [f, w] of [['InterDisplay-Black.otf', '900'], ['InterDisplay-ExtraBold.otf', '800']]) loadFont({family: 'Inter Display', url: staticFile('fonts/' + f), weight: w});
for (const [f, w] of [['Inter-Bold.otf', '700'], ['Inter-ExtraBold.otf', '800']]) loadFont({family: 'Inter', url: staticFile('fonts/' + f), weight: w});

export const chapters = (data: any, n = 8) => {const ch = [0]; for (let s = 2; s <= n; s++) ch.push(data.segs.find((x: any) => x.s === s).t0 - 0.35); ch.push(data.dur); return ch;};
export const Brand: React.FC<{S: any}> = ({S}) => (
	<div style={{position: 'absolute', left: 44, top: 52, display: 'flex', alignItems: 'center', gap: 16}}>
		<Img src={staticFile(S.logo)} style={{width: 72, height: 72, borderRadius: 36, border: `3px solid ${C.lime}cc`, boxShadow: `0 0 18px ${C.lime}66`}} />
		<div style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 32, color: 'rgba(244,247,250,.92)', textShadow: '0 2px 10px rgba(0,0,0,.6)'}}>{S.handle}</div>
	</div>
);
export const Win: React.FC<{a: number; b: number; children: React.ReactNode; last?: boolean}> = ({a, b, children, last}) => {
	const t = useCurrentFrame() / FPS;
	if (t < a - 0.3 || t > b + 0.3) return null;
	const i = eout(P(t, a - 0.25, a + 0.3)), o = last ? 1 : 1 - P(t, b - 0.2, b + 0.15);
	return <AbsoluteFill style={{opacity: i * o, transform: `translateX(${(1 - i) * 60}px)`}}>{children}</AbsoluteFill>;
};
export const sfx = (src: string, at: number, vol: number, key: string) => <Sequence key={key} from={Math.max(0, Math.round(at * FPS))} layout="none"><Audio src={staticFile('sfx/' + src)} volume={vol} /></Sequence>;
// running gait: squash pulses (landing) at a steady cadence after t0
export const gait = (t: number, t0: number) => (t < t0 ? 0 : Math.max(0, Math.sin((t - t0) * Math.PI * 1.6)) ** 2);
export const SALES: [string, number][] = [['2021', 0.72], ['2022', 1.22], ['2023', 1.79], ['2024', 2.32], ['2025', 3.01]];

export const SneakShort: React.FC<{lang: 'ru' | 'en'; data: any}> = ({lang, data}) => {
	const S = STR[lang], K = data.k, ch = chapters(data), dur = data.dur;
	const t = useCurrentFrame() / FPS;
	const E = [0, 0, 0, 1, 2, 2.85, 3, 4, 5]; // era position by chapter number (1..8)
	let c = 0; while (c < 8 && t >= ch[c + 1]) c++;
	const n = Math.min(8, c + 1);
	const pos = c === 0 ? 0 : E[n - 1] + (E[n] - E[n - 1]) * eio(P(t, ch[c], ch[c] + 1.2));
	const trailO = P(t, ch[1], ch[1] + 0.6) * (K.cta !== undefined ? 1 - P(t, K.cta - 0.4, K.cta) : 1);
	return (
		<AbsoluteFill>
			<TrackBg />
			{/* 1 — hook */}
			<Win a={0} b={ch[1]}>
				<At x={540} y={250} s={pop(t, 0.1)}><Title text={S.t1} col={C.white} size={lang === 'ru' ? 76 : 80} /></At>
				<At x={540} y={350} s={pop(t, 0.4)}><Title text={S.t2} col={C.lime} size={100} glow={C.lime} /></At>
				<At x={540} y={640} s={pop(t, K.hook - 0.5)} o={1 - P(t, K.start - 0.8, K.start - 0.3)}><Hose w={860} cut={0} t={t} /></At>
				{t > K.start - 0.9 ? <AbsoluteFill style={{top: 470}}><Sneaker3D w={1080} h={760} t={t} pods={P(t, K.start - 0.9, K.start + 0.3)} upper={P(t, K.start, K.start + 0.6)} yaw={0.35 + Math.sin(t * 0.6) * 0.15} glow={0.6} /></AbsoluteFill> : null}
				<At x={540} y={1330} s={pop(t, K.b3hook - 0.3)}><Pill text={S.b3} bg={C.lime} size={50} /></At>
			</Win>
			{/* 2 — 1839 */}
			<Win a={ch[1]} b={ch[2]}>
				<At x={540} y={260} s={pop(t, K.goodyear - 0.4)}><Badge text={S.gy} col={C.amber} size={46} /></At>
				<At x={540} y={560} s={pop(t, ch[1] + 0.3)}><RubberBlob size={300} t={t} cure={eio(P(t, K.rubber - 0.2, K.rubber + 1.2))} /></At>
				<At x={540} y={790} s={pop(t, K.rubber)}><Pill text={S.vulc} bg={C.amber} size={38} /></At>
				<At x={540} y={990} s={pop(t, K.quiet - 0.5)}><SoundBars w={720} t={t} quiet={eio(P(t, K.quiet - 0.2, K.quiet + 0.8))} /></At>
				<At x={540} y={1110} s={pop(t, K.quiet)}><Txt text={S.quiet} col={C.cyan} size={40} /></At>
				<At x={540} y={1250} s={pop(t, K.sneak - 1.6)}><Title text={t < K.sneak - 0.1 ? 'SNEAK' : 'SNEAKERS'} col={C.lime} size={130} glow={C.lime} /></At>
				<At x={540} y={1360} s={pop(t, K.sneak - 1.3)}><Txt text={S.sneak} col={C.white} size={34} /></At>
			</Win>
			{/* 3 — 1936 */}
			<Win a={ch[2]} b={ch[3]}>
				<At x={540} y={260} s={pop(t, ch[2] + 0.1)}><Badge text={S.berlin} col={C.gold} size={46} /></At>
				<At x={540} y={380} s={pop(t, K.owens - 0.3)}><Pill text={S.owens} bg={C.white} size={42} /></At>
				<At x={540} y={590} s={1}><div style={{display: 'flex', gap: 30}}>{[0, 1, 2, 3].map((j) => <div key={j} style={{transform: `scale(${pop(t, K.gold4 - 0.2 + j * 0.22)})`}}><Medal size={140} /></div>)}</div></At>
				<At x={540} y={790} s={pop(t, K.gold4 + 0.8)}><Txt text={S.dassler} col={C.mute} size={36} /></At>
				{[0, 1].map((j) => {const sep = eout(P(t, K.split - 0.2, K.split + 0.8)); return <At key={j} x={540 + (j ? 1 : -1) * (90 + 180 * sep)} y={1030} s={pop(t, K.split - 1.2)}><Brother size={170} col={j ? '#c0392b' : '#2d6cdf'} flip={j === 1} /></At>;})}
				<At x={540} y={1030} o={P(t, K.split, K.split + 0.3) * (1 - P(t, K.brands, K.brands + 0.5))}><svg width="60" height="240" viewBox="0 0 60 240"><path d="M30 0 L14 50 L40 90 L18 140 L44 190 L26 240" stroke={C.red} strokeWidth="8" fill="none" /></svg></At>
				<At x={540} y={1300} s={1}><div style={{display: 'flex', gap: 40}}>{['ADIDAS', 'PUMA'].map((b, j) => <div key={j} style={{transform: `scale(${pop(t, K.brands - 0.3 + j * 0.5)})`}}><Pill text={b} bg={j ? '#c0392b' : '#2d6cdf'} fg="#fff" size={50} /></div>)}</div></At>
				<At x={540} y={1180} s={pop(t, K.split)}><Txt text={S.split} col={C.red} size={36} /></At>
			</Win>
			{/* 4 — 1971 waffle */}
			<Win a={ch[3]} b={ch[4]}>
				<At x={540} y={260} s={pop(t, ch[3] + 0.1)}><Badge text={S.bow} col={C.amber} size={46} /></At>
				<At x={540} y={720} s={pop(t, K.waffle - 0.6)}><WaffleIron w={660} open={eio(P(t, K.waffle + 1.2, K.waffle + 2.2))} t={t} steam={P(t, K.waffle, K.waffle + 0.5)} /></At>
				<At x={540} y={1110} s={pop(t, K.waffle + 2.0)}><Pill text={S.waffle} bg={C.amber} size={44} /></At>
				<At x={540} y={1280} s={pop(t, K.nike - 0.4)}><Title text="NIKE" col={C.white} size={150} glow={C.white} /></At>
			</Win>
			{/* 5 — garden hose */}
			<Win a={ch[4]} b={ch[5]}>
				<At x={540} y={250} s={pop(t, K.olivier - 0.4)}><Badge text={S.ob} col={C.lime} size={lang === 'ru' ? 40 : 38} /></At>
				<At x={540} y={345} s={pop(t, K.olivier)}><Txt text={S.obSub} col={C.mute} size={34} /></At>
				<At x={540} y={560} o={1 - P(t, K.glue + 0.2, K.glue + 0.7)}><Hose w={860} cut={P(t, K.hose, K.hose + 1.4)} t={t} /></At>
				{t > K.hose - 0.3 && t < K.glue + 0.4 ? <At x={130 + 800 * P(t, K.hose, K.hose + 1.4)} y={470} s={1}><Scissors size={150} open={Math.abs(Math.sin(t * 10))} /></At> : null}
				{t > K.glue - 0.5 ? <AbsoluteFill style={{top: 400}}><Sneaker3D w={1080} h={820} t={t} pods={P(t, K.glue - 0.5, K.glue + 0.6)} upper={P(t, K.glue + 0.2, K.glue + 0.8)} squash={gait(t, K.soft - 0.4)} yaw={0.15} glow={0.6} /></AbsoluteFill> : null}
				<At x={300} y={1300} s={pop(t, K.soft - 0.3)}><Pill text={S.soft} bg={C.cyan} size={40} /></At>
				<At x={790} y={1300} s={pop(t, K.push - 0.3)}><Pill text={S.push} bg={C.lime} size={40} /></At>
			</Win>
			{/* 6 — On, Zurich */}
			<Win a={ch[5]} b={ch[6]}>
				<At x={540} y={260} s={pop(t, K.zurich - 0.4)}><div style={{display: 'flex', alignItems: 'center', gap: 22}}><SwissFlag size={78} /><Badge text={S.zurich} col={C.white} size={46} /></div></At>
				<At x={540} y={440} s={pop(t, K.zurich)}><div style={{display: 'flex', gap: 10, alignItems: 'flex-end'}}>{[0, 1, 2].map((j) => <Brother key={j} size={j === 1 ? 110 : 90} col={j === 1 ? C.lime : C.mute} />)}</div></At>
				<At x={540} y={590} s={pop(t, K.on - 0.3)}><Title text="On" col={C.white} size={160} glow={C.white} /></At>
				<AbsoluteFill style={{top: 640}}><Sneaker3D w={1080} h={700} t={t} yaw={0.3 + Math.sin((t - ch[5]) * 0.5) * 0.3} glow={0.4 + 0.6 * P(t, K.clouds - 0.4, K.clouds + 0.3)} squash={gait(t, ch[5] + 1)} /></AbsoluteFill>
				<At x={540} y={1340} s={pop(t, K.clouds - 0.4)}><Pill text={'CloudTec® · ' + S.clouds} bg={C.lime} size={lang === 'ru' ? 34 : 38} /></At>
			</Win>
			{/* 7 — Federer, IPO */}
			<Win a={ch[6]} b={ch[7]}>
				<At x={540} y={260} s={pop(t, K.federer - 0.4)}><div style={{display: 'flex', alignItems: 'center', gap: 20}}><TennisBall size={80} t={t} /><Badge text={S.fed} col={C.lime} size={42} /></div></At>
				<At x={540} y={370} s={pop(t, K.federer + 0.3)}><Pill text={S.inv} bg={C.white} size={36} /></At>
				<At x={540} y={790} s={pop(t, K.ipo - 0.6)}><Ticker w={900} h={420} k={eout(P(t, K.ipo - 0.4, K.b11 + 1))} t={t} /></At>
				<At x={540} y={1130} s={pop(t, K.ipo)}><Pill text={S.ipo} bg={C.cyan} size={40} /></At>
				<At x={540} y={1280} s={pop(t, K.b11 - 0.3)}><Title text={S.b11} col={C.lime} size={120} glow={C.lime} /></At>
			</Win>
			{/* 8 — sales */}
			<Win a={ch[7]} b={ch[8]} last>
				<At x={540} y={260} s={pop(t, ch[7] + 0.1)} o={K.cta !== undefined ? 1 - P(t, K.cta - 0.4, K.cta) : 1}><Txt text={S.sales} col={C.mute} size={36} /></At>
				<At x={540} y={770} s={pop(t, ch[7])} o={K.cta !== undefined ? 1 - 0.7 * P(t, K.cta - 0.4, K.cta) : 1}><SalesBars w={940} h={760} t={t} t0={ch[7] + 0.2} rows={SALES} fmt={S.fmt} /></At>
				<At x={300} y={440} s={pop(t, K.growth - 0.3)} rot={-6}><Badge text={S.growth} col={C.lime} size={70} /></At>
				<At x={540} y={1290} s={pop(t, K.hoseEnd - 0.4)} o={K.cta !== undefined ? 1 - P(t, K.cta - 0.4, K.cta) : 1}><Title text={S.fin} col={C.lime} size={lang === 'ru' ? 62 : 66} glow={C.lime} /></At>
			</Win>
			{trailO > 0 ? <At x={540} y={1470} o={1}><StepTrail w={860} years={S.years} pos={pos} t={t} o={trailO} /></At> : null}
			<Brand S={S} />
			<CTA K={K} S={S} />
			<Captions captions={data.captions} />
			<Audio src={staticFile('music.mp3')} volume={(f) => 0.14 * Math.min(1, f / 30) * Math.min(1, (dur * FPS - f) / 75)} />
			<Sequence from={15} layout="none"><Audio src={staticFile(`${lang}/voice.mp3`)} volume={1.1} /></Sequence>
			{sfx('squeak.mp3', K.start, 0.3, 'sq')}
			{sfx('sizzle.mp3', K.waffle, 0.35, 'sz')}
			{sfx('snip.mp3', K.hose + 0.1, 0.45, 'sn')}
			{sfx('bell.mp3', K.ipo - 0.2, 0.3, 'bl')}
			{sfx('coins.mp3', K.sales3 - 0.2, 0.28, 'co')}
		</AbsoluteFill>
	);
};
