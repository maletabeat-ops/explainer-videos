import React from 'react';
import {AbsoluteFill, Img, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Audio} from '@remotion/media';
import {loadFont} from '@remotion/fonts';
import {FoamDemo, Hose, PodMeter, SalesBars, Scissors, ShoePhoto, SwissFlag, TennisBall, Ticker, TrackBg} from './Comps';
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
	let c = 0; while (c < 8 && t >= ch[c + 1]) c++;
	const lit = c + eout(P(t, ch[c], ch[c] + 0.6));
	const cta = K.cta !== undefined ? 1 - P(t, K.cta - 0.4, K.cta) : 1;
	const fl = 10 + 10 * Math.sin(t * 1.6);
	const lay = [P(t, K.air - 0.3, K.air + 0.3), P(t, K.gel - 0.3, K.gel + 0.3), P(t, K.foam - 0.3, K.foam + 0.3)];
	const press = t < K.mushy - 0.8 ? 0 : eio(P(t, K.mushy - 0.8, K.mushy + 0.2)) - 0.25 * eio(P(t, K.mushy + 0.8, K.mushy + 1.6));
	const g5 = gait(t, K.land - 0.2);
	return (
		<AbsoluteFill>
			<TrackBg />
			{/* 1 — hook: the real shoe */}
			<Win a={0} b={ch[1]}>
				<At x={540} y={270} s={pop(t, K.b3 - 0.4)}><Title text={S.b3} col={C.lime} size={lang === 'ru' ? 80 : 74} glow={C.lime} /></At>
				<At x={540} y={700} s={pop(t, 0.05, 0.6)}><ShoePhoto w={960} float={fl} /></At>
				<At x={540} y={1060} s={pop(t, K.hose - 0.9)}><Txt text={S.from} col={C.white} size={40} /></At>
				<At x={540} y={1250} s={pop(t, K.hose - 0.5)}><Hose w={760} cut={0} t={t} /></At>
			</Win>
			{/* 2–3 — the cushioning race and the mushy problem */}
			<Win a={ch[1]} b={ch[3]}>
				<At x={540} y={270} s={pop(t, K.arms - 0.3)}><Badge text={S.race} col={C.cyan} size={50} /></At>
				<At x={540} y={790}><FoamDemo w={900} t={t} layers={lay} press={press} labels={S.layers} /></At>
				<At x={540} y={1170} s={pop(t, K.mushy - 0.2)}><Badge text={S.mushy} col={C.red} size={58} /></At>
				<At x={540} y={1300} s={pop(t, K.mushy + 0.8)}><Txt text={S.weak} col={C.amber} size={40} /></At>
			</Win>
			{/* 4 — Olivier cuts the hose */}
			<Win a={ch[3]} b={ch[4]}>
				<At x={540} y={260} s={pop(t, K.olivier - 0.4)}><div style={{display: 'flex', alignItems: 'center', gap: 20}}><SwissFlag size={70} /><Badge text={S.ob} col={C.lime} size={50} /></div></At>
				<At x={540} y={370} s={pop(t, K.olivier)}><Txt text={S.obSub} col={C.mute} size={36} /></At>
				<At x={540} y={590} o={1 - 0.6 * P(t, K.glue, K.glue + 0.6)}><Hose w={860} cut={P(t, K.cut, K.cut + 1.3)} t={t} /></At>
				{t > K.cut - 0.3 && t < K.cut + 1.6 ? <At x={130 + 800 * P(t, K.cut, K.cut + 1.3)} y={500}><Scissors size={150} open={Math.abs(Math.sin(t * 10))} /></At> : null}
				<At x={540} y={1000} s={pop(t, K.glue - 0.4)}><ShoePhoto w={900} holesOn={eout(P(t, K.glue, K.glue + 1.2))} glow={0.6} /></At>
				<At x={540} y={1320} s={pop(t, K.glue + 0.4)}><Pill text={S.glue} bg={C.lime} size={lang === 'ru' ? 34 : 36} /></At>
			</Win>
			{/* 5 — how CloudTec works (signature: the real sole breathes) */}
			<Win a={ch[4]} b={ch[5]}>
				<At x={540} y={720}><ShoePhoto w={1020} squash={g5} holesOn={1} glow={g5} float={(1 - g5) * 50} /></At>
				<At x={540} y={1130} s={pop(t, K.squash - 0.3)}><Pill text={S.land} bg={C.cyan} size={40} /></At>
				<At x={540} y={1260} s={pop(t, K.firm - 0.3)}><Pill text={S.firm} bg={C.lime} size={40} /></At>
			</Win>
			{/* 6 — big brands said no → On, Zurich */}
			<Win a={ch[5]} b={ch[6] + 0.6}>
				<At x={540} y={260} s={pop(t, K.declined - 0.4)}><Badge text={S.no} col={C.red} size={lang === 'ru' ? 36 : 40} /></At>
				<At x={540} y={400} s={pop(t, K.zurich - 0.4)}><div style={{display: 'flex', alignItems: 'center', gap: 22}}><SwissFlag size={78} /><Badge text={S.zurich} col={C.white} size={48} /></div></At>
				<At x={540} y={590} s={pop(t, K.zurich + 0.2)}><Title text="On" col={C.white} size={170} glow={C.white} /></At>
				<At x={540} y={950} s={pop(t, K.zurich + 0.4)}><ShoePhoto w={880} holesOn={1} glow={0.5 + 0.5 * Math.sin(t * 3)} float={fl} /></At>
				<At x={540} y={1300} s={pop(t, K.zurich + 0.9)}><Pill text={S.cloud} bg={C.lime} size={44} /></At>
			</Win>
			{/* 7 — Federer, IPO */}
			<Win a={ch[6] + 0.6} b={ch[7]}>
				<At x={540} y={260} s={pop(t, ch[6] + 0.7)}><div style={{display: 'flex', alignItems: 'center', gap: 20}}><TennisBall size={80} t={t} /><Badge text={S.fed} col={C.lime} size={44} /></div></At>
				<At x={540} y={720} s={pop(t, ch[6] + 1.0)}><Ticker w={900} h={420} k={eout(P(t, ch[6] + 1.1, K.b11 + 1))} t={t} /></At>
				<At x={540} y={1080} s={pop(t, K.ipo)}><Pill text={S.ipo} bg={C.cyan} size={40} /></At>
				<At x={540} y={1240} s={pop(t, K.b11 - 0.3)}><Title text={S.b11} col={C.lime} size={120} glow={C.lime} /></At>
			</Win>
			{/* 8 — sales + what if */}
			<Win a={ch[7]} b={ch[8]} last>
				<At x={540} y={250} s={pop(t, ch[7] + 0.1)} o={cta}><Txt text={S.sales} col={C.mute} size={36} /></At>
				<At x={540} y={740} s={pop(t, ch[7])} o={0.3 + 0.7 * cta}><SalesBars w={940} h={720} t={t} t0={ch[7] + 0.2} rows={SALES} fmt={S.fmt} /></At>
				<At x={300} y={420} s={pop(t, K.growth - 0.3)} o={cta} rot={-6}><Badge text={S.growth} col={C.lime} size={46} /></At>
				<At x={540} y={1260} s={pop(t, K.whatif - 0.4)} o={cta}><Title text={S.whatif} col={C.lime} size={120} glow={C.lime} /></At>
			</Win>
			<At x={540} y={1470} o={cta}><PodMeter n={8} lit={lit} t={t} o={1} /></At>
			<Brand S={S} />
			<CTA K={K} S={S} />
			<Captions captions={data.captions} />
			<Audio src={staticFile('music.mp3')} volume={(f) => 0.14 * Math.min(1, f / 30) * Math.min(1, (dur * FPS - f) / 75)} />
			<Sequence from={15} layout="none"><Audio src={staticFile(`${lang}/voice.mp3`)} volume={1.1} /></Sequence>
			{sfx('snip.mp3', K.cut + 0.1, 0.45, 'sn')}
			{sfx('squeak.mp3', K.land - 0.1, 0.28, 'sq')}
			{sfx('bell.mp3', K.ipo - 0.2, 0.3, 'bl')}
			{sfx('coins.mp3', K.growth - 0.2, 0.28, 'co')}
		</AbsoluteFill>
	);
};
