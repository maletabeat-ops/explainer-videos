import React from 'react';
import {AbsoluteFill, Img, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Audio} from '@remotion/media';
import {loadFont} from '@remotion/fonts';
import {Bracelet, Card, Counter, DepthScale, Dial, Flag, GreenBg, Ownership, QueueBoard, Sea, Typed} from './Comps';
import {CTA} from './CTA';
import {Captions} from './Captions';
import {STR} from './strings';
import {At, Badge, C, DISPLAY, FPS, P, Pill, Title, Txt, eio, eout, pop} from './ui';

for (const [f, w] of [['InterDisplay-Black.otf', '900'], ['InterDisplay-ExtraBold.otf', '800']]) loadFont({family: 'Inter Display', url: staticFile('fonts/' + f), weight: w});
for (const [f, w] of [['Inter-Bold.otf', '700'], ['Inter-ExtraBold.otf', '800']]) loadFont({family: 'Inter', url: staticFile('fonts/' + f), weight: w});

export const chapters = (data: any, n = 8) => {const ch = [0]; for (let s = 2; s <= n; s++) ch.push(data.segs.find((x: any) => x.s === s).t0 - 0.35); ch.push(data.dur); return ch;};
export const Brand: React.FC<{S: any}> = ({S}) => (
	<div style={{position: 'absolute', left: 44, top: 52, display: 'flex', alignItems: 'center', gap: 16}}>
		<Img src={staticFile(S.logo)} style={{width: 72, height: 72, borderRadius: 36, border: `3px solid ${C.gold}cc`, boxShadow: `0 0 18px ${C.gold}66`}} />
		<div style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 32, color: 'rgba(251,250,246,.92)', textShadow: '0 2px 10px rgba(0,0,0,.6)'}}>{S.handle}</div>
	</div>
);
export const Win: React.FC<{a: number; b: number; children: React.ReactNode; last?: boolean}> = ({a, b, children, last}) => {
	const t = useCurrentFrame() / FPS;
	if (t < a - 0.3 || t > b + 0.3) return null;
	const i = eout(P(t, a - 0.25, a + 0.35)), o = last ? 1 : 1 - P(t, b - 0.2, b + 0.15);
	// signature transition: a quarter-turn "dial sweep" in
	return <AbsoluteFill style={{opacity: i * o, transform: `rotate(${(1 - i) * -8}deg) scale(${1.06 - 0.06 * i})`, transformOrigin: '50% 40%'}}>{children}</AbsoluteFill>;
};
export const sfx = (src: string, at: number, vol: number, key: string) => <Sequence key={key} from={Math.max(0, Math.round(at * FPS))} layout="none"><Audio src={staticFile('sfx/' + src)} volume={vol} /></Sequence>;
export const Row: React.FC<{children: React.ReactNode; gap?: number}> = ({children, gap = 22}) => <div style={{display: 'flex', alignItems: 'center', gap}}>{children}</div>;

export const RolexShort: React.FC<{lang: 'ru' | 'en'; data: any}> = ({lang, data}) => {
	const S = STR[lang], K = data.k, ch = chapters(data), dur = data.dur;
	const t = useCurrentFrame() / FPS;
	const E = [0, 6, 0, 2, 3, 5, 4, 6, 6];
	let c = 0; while (c < 8 && t >= ch[c + 1]) c++;
	const n = Math.min(8, c + 1);
	let pos = c === 0 ? 6 : E[n - 1] + (E[n] - E[n - 1]) * eio(P(t, ch[c], ch[c] + 1.2));
	if (n === 2) pos = 6 * (1 - eio(P(t, ch[1], ch[1] + 1))) + eio(P(t, K.rolex - 1, K.rolex));
	if (n === 2 && t > ch[1] + 1) pos = eio(P(t, K.rolex - 1, K.rolex));
	const cta = K.cta !== undefined ? 1 - P(t, K.cta - 0.4, K.cta) : 1;
	const bob = Math.sin(t * 2) * 14;
	return (
		<AbsoluteFill>
			<GreenBg />
			{/* 1 — hook */}
			<Win a={0} b={ch[1]}>
				<At x={540} y={250} s={pop(t, 0.1)}><Title text={S.t1} col={C.cream} size={lang === 'ru' ? 92 : 84} /></At>
				<At x={540} y={350} s={pop(t, 0.35)}><Title text={S.t2} col={C.gold} size={104} glow={C.gold} /></At>
				<At x={540} y={830} s={pop(t, 0.2, 0.7)}><Dial size={760} t={t} glow={0.6} /></At>
				<At x={540} y={1290} s={pop(t, K.german - 0.3)}><Row><Flag c="de" w={90} /><Pill text={S.german} bg={C.cream} size={lang === 'ru' ? 34 : 32} /></Row></At>
				<At x={540} y={1390} s={pop(t, K.fund - 0.3)}><Pill text={S.fund} bg={C.gold} size={40} /></At>
			</Win>
			{/* 2 — Wilsdorf, London, the word */}
			<Win a={ch[1]} b={ch[2]}>
				<At x={540} y={260} s={pop(t, K.hans - 0.3)}><Badge text={S.hans} col={C.gold} size={50} /></At>
				<At x={540} y={420} s={pop(t, K.london - 0.4)}><Row><Flag c="de" w={120} /><div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 60, color: C.gold}}>→</div><Flag c="uk" w={120} /></Row></At>
				<At x={540} y={540} s={pop(t, K.london)}><Txt text={S.firm} col={C.mute} size={34} /></At>
				<At x={540} y={650} s={pop(t, K.rolex - 1.2)}><Pill text="1908" bg={C.gold} size={44} /></At>
				<At x={540} y={800}><Typed text="ROLEX" k={P(t, K.rolex - 0.9, K.rolex + 0.2)} size={170} col={C.gold} /></At>
				<At x={540} y={1080} s={pop(t, K.rolex + 0.6)}><Pill text={S.short} bg={C.cream} size={lang === 'ru' ? 32 : 32} /></At>
			</Win>
			{/* 3 — Geneva */}
			<Win a={ch[2]} b={ch[3]}>
				<At x={540} y={560} s={pop(t, ch[2] + 0.2)}><Row gap={40}><Flag c="uk" w={260} /><div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 120, color: C.gold, transform: `translateX(${eout(P(t, K.geneva - 1, K.geneva)) * 20}px)`}}>→</div><Flag c="ch" w={220} /></Row></At>
				<At x={540} y={850} s={pop(t, K.tax - 0.3)} rot={-5}><div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 70, color: C.red, border: `8px solid ${C.red}`, borderRadius: 18, padding: '6px 28px', background: 'rgba(30,5,5,.6)'}}>{S.tax}</div></At>
				<At x={540} y={1150} s={pop(t, K.geneva - 0.3)}><Title text={S.geneva} col={C.gold} size={110} glow={C.gold} /></At>
			</Win>
			{/* 4 — Oyster in the sea */}
			<Win a={ch[3]} b={ch[4]}>
				<At x={540} y={260} s={pop(t, K.oyster - 0.4)}><Badge text={S.oyster} col={C.gold} size={56} /></At>
				<At x={540} y={370} s={pop(t, K.oyster)}><Txt text={S.wp} col={C.cream} size={lang === 'ru' ? 40 : 36} /></At>
				<At x={540} y={760 + bob}><Dial size={460} t={t} tiltX={20} glow={0.5} /></At>
				<At x={540} y={980}><Sea w={1080} h={560} t={t} /></At>
				<At x={540} y={1300} s={pop(t, K.gleitze - 0.3)}><Card w={860} col={C.cyan} top={S.gle[0]} big={S.gle[1]} sub={P(t, K.ticking - 0.3, K.ticking) > 0 ? '✓ ' + S.gle[2] : ' '} /></At>
			</Win>
			{/* 5 — Everest to the Trench */}
			<Win a={ch[4]} b={ch[5]}>
				<At x={540} y={250} s={pop(t, K.perpetual - 0.4)}><Pill text={S.perp} bg={C.gold} size={40} /></At>
				<At x={540} y={880}><DepthScale h={1000} k={P(t, ch[4], ch[4] + 0.6)} up={eio(P(t, K.everest - 0.5, K.everest + 0.8)) * (1 - eio(P(t, K.trench - 1.6, K.trench - 0.8)))} down={eio(P(t, K.trench - 0.8, K.trench + 1.2))} L={S.scale} /></At>
			</Win>
			{/* 6 — the foundation */}
			<Win a={ch[5]} b={ch[6]}>
				<At x={540} y={250} s={pop(t, K.wife - 0.3)}><Badge text={S.f45} col={C.gold} size={50} /></At>
				<At x={540} y={790} s={pop(t, K.fund2 - 0.6)}><Ownership w={860} k={eout(P(t, K.fund2 - 0.3, K.fund2 + 1))} L={S.own} n1={pop(t, K.noshare - 0.3)} n2={pop(t, K.noshare + 1.2)} /></At>
			</Win>
			{/* 7 — a million watches, but waitlists */}
			<Win a={ch[6]} b={ch[7]}>
				<At x={540} y={290} s={pop(t, K.million - 0.4)}><Title text={S.mil} col={C.gold} size={130} glow={C.gold} /></At>
				<At x={540} y={400} s={pop(t, K.million)}><Txt text={S.milSub} col={C.cream} size={40} /></At>
				<At x={540} y={760} s={pop(t, K.queue - 1.2)}><QueueBoard w={900} t={t} t0={K.queue - 1.2} L={S.q} /></At>
				<At x={540} y={1100} s={pop(t, K.queue - 0.2)}><Title text={S.queue} col={C.red} size={110} /></At>
			</Win>
			{/* 8 — revenue */}
			<Win a={ch[7]} b={ch[8]} last>
				<At x={540} y={290} s={pop(t, K.b11 - 0.4)} o={cta}><Counter k={P(t, K.b11 - 0.3, K.b11 + 1)} to={11} fmt={S.b11} col={C.gold} size={lang === 'ru' ? 96 : 92} /></At>
				<At x={540} y={390} s={pop(t, K.b11 + 0.3)} o={cta}><Txt text={S.b11sub} col={C.mute} size={34} /></At>
				<At x={540} y={830} s={pop(t, ch[7] + 0.2, 0.7)} o={cta}><Dial size={620} t={t} glow={0.9} hours={10.1} minutes={10} /></At>
				<At x={540} y={1300} s={pop(t, K.word - 0.4)} o={cta}><Row><Flag c="uk" w={100} /><Title text={S.word} col={C.cream} size={lang === 'ru' ? 66 : 64} /></Row></At>
			</Win>
			<At x={540} y={1478}><Bracelet w={980} years={S.years} pos={pos} o={P(t, ch[1], ch[1] + 0.6) * cta} /></At>
			<Brand S={S} />
			<CTA K={K} S={S} />
			<Captions captions={data.captions} />
			<Audio src={staticFile('music.mp3')} volume={(f) => 0.14 * Math.min(1, f / 30) * Math.min(1, (dur * FPS - f) / 75)} />
			<Sequence from={15} layout="none"><Audio src={staticFile(`${lang}/voice.mp3`)} volume={1.1} /></Sequence>
			{sfx('wind.mp3', 0.4, 0.35, 'wi')}
			{sfx('splash.mp3', K.gleitze - 0.2, 0.3, 'sp')}
			{sfx('deep.mp3', K.trench - 0.8, 0.3, 'dp')}
			{sfx('coins.mp3', K.b11 - 0.2, 0.25, 'co')}
		</AbsoluteFill>
	);
};
