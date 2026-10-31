import React from 'react';
import {AbsoluteFill, Img, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Audio} from '@remotion/media';
import {loadFont} from '@remotion/fonts';
import {Bat, Bonfire, Counter, Devil, Door, Ember, Ghost, Lantern3D, Masked, NightBg, Newspaper, SoulCake, TimeRibbon, Voyage, YearWheel} from './Comps';
import {CTA} from './CTA';
import {Captions} from './Captions';
import {STR} from './strings';
import {At, Badge, C, DISPLAY, FPS, P, Pill, Title, Txt, eio, eout, pop} from './ui';

for (const [f, w] of [['InterDisplay-Black.otf', '900'], ['InterDisplay-ExtraBold.otf', '800']]) loadFont({family: 'Inter Display', url: staticFile('fonts/' + f), weight: w});
for (const [f, w] of [['Inter-Bold.otf', '700'], ['Inter-ExtraBold.otf', '800']]) loadFont({family: 'Inter', url: staticFile('fonts/' + f), weight: w});

export const chapters = (data: any, n = 8) => {const ch = [0]; for (let s = 2; s <= n; s++) ch.push(data.segs.find((x: any) => x.s === s).t0 - 0.35); ch.push(data.dur); return ch;};
export const Brand: React.FC<{S: any}> = ({S}) => (
	<div style={{position: 'absolute', left: 44, top: 52, display: 'flex', alignItems: 'center', gap: 16}}>
		<Img src={staticFile(S.logo)} style={{width: 72, height: 72, borderRadius: 36, border: `3px solid ${C.pumpkin}cc`, boxShadow: `0 0 18px ${C.pumpkin}77`}} />
		<div style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 32, color: 'rgba(246,236,217,.92)', textShadow: '0 2px 10px rgba(0,0,0,.6)'}}>{S.handle}</div>
	</div>
);
export const Win: React.FC<{a: number; b: number; children: React.ReactNode; last?: boolean}> = ({a, b, children, last}) => {
	const t = useCurrentFrame() / FPS;
	if (t < a - 0.3 || t > b + 0.3) return null;
	const i = eout(P(t, a - 0.25, a + 0.3)), o = last ? 1 : 1 - P(t, b - 0.2, b + 0.15);
	return <AbsoluteFill style={{opacity: i * o, transform: `scale(${1.04 - 0.04 * i})`}}>{children}</AbsoluteFill>;
};
export const sfx = (src: string, at: number, vol: number, key: string) => <Sequence key={key} from={Math.max(0, Math.round(at * FPS))} layout="none"><Audio src={staticFile('sfx/' + src)} volume={vol} /></Sequence>;
const Bats: React.FC<{t: number; t0: number; y: number}> = ({t, t0, y}) => (
	<>{[0, 1, 2].map((i) => {const k = (t - t0 - i * 0.35) / 4; if (k < 0 || k > 1) return null; return <At key={i} x={-120 + k * 1320} y={y + i * 60 + Math.sin(k * 9 + i) * 40} s={1}><Bat size={90 - i * 18} t={t} ph={i} /></At>;})}</>
);

export const HallShort: React.FC<{lang: 'ru' | 'en'; data: any}> = ({lang, data}) => {
	const S = STR[lang], K = data.k, ch = chapters(data), dur = data.dur;
	const t = useCurrentFrame() / FPS;
	const sway = Math.sin(t * 0.7) * 0.32;
	const flick = 0.5 + 0.5 * Math.sin(t * 13) * Math.sin(t * 7.3);
	// chapter-7 'pumpkin' key collides with chapter 1 in timing post-processing → take it from the captions
	const pc = data.captions.find((c: any) => c.startMs / 1000 > ch[6] && /^(тыкв|pumpkin)/i.test(c.text.trim()));
	const pumpK = pc ? pc.startMs / 1000 : K.pumpkin;
	const today = K.today;
	const rpos = t < ch[3] ? 0 : t < ch[5] ? eio(P(t, ch[3], ch[3] + 1.2)) : t < ch[6] ? 1 + 0.5 * eio(P(t, ch[5], ch[5] + 1.2)) : t < ch[7] ? 1.5 + 0.5 * eio(P(t, ch[6], ch[6] + 1.5)) : 2 + eio(P(t, ch[7], ch[7] + 1.2)) + eio(P(t, today - 0.4, today + 0.8));
	const ribO = P(t, ch[1], ch[1] + 0.6) * (K.cta !== undefined ? 1 - P(t, K.cta - 0.4, K.cta) : 1);
	const q1 = K.q, dd = K.dead;
	const trioT = [0, 1, 2].map((i) => q1 + 0.9 + (dd - q1 - 1.6) * (i / 2));
	const morph7 = eio(P(t, pumpK - 0.3, pumpK + 1.1));
	const voyO = 1 - P(t, pumpK - 0.9, pumpK - 0.5), lanO = P(t, pumpK - 0.7, pumpK - 0.3);
	const papO = 1 - P(t, today - 0.5, today - 0.1);
	return (
		<AbsoluteFill>
			<NightBg />
			{/* 1 — hook */}
			<Win a={0} b={ch[1]}>
				<At x={540} y={250} s={pop(t, 0.1)}><Title text={S.t1} col={C.bone} size={lang === 'ru' ? 92 : 74} /></At>
				<At x={540} y={360} s={pop(t, 0.35)}><Title text={S.t2} col={C.pumpkin} size={112} glow={C.pumpkin} /></At>
				{[0, 1].map((i) => <At key={i} x={i ? 880 : 200} y={1000 - 260 * eout(P(t, dd - 0.6, dd + 1.4)) + Math.sin(t * 2 + i) * 14} o={P(t, dd - 0.6, dd)}><Ghost size={150} t={t} ph={i * 2} /></At>)}
				<At x={540} y={820}><Lantern3D w={1000} h={860} morph={1} glow={P(t, 0.3, 1.2)} spin={sway} flicker={flick} /></At>
				<At x={540} y={1260} s={1}><div style={{display: 'flex', gap: 22}}>{S.trio.map((x: string, i: number) => <div key={i} style={{transform: `scale(${pop(t, trioT[i])})`}}><Pill text={x} bg={[C.pumpkin, C.violet, C.ghost][i]} size={38} fg={i === 1 ? '#fff' : C.ink} /></div>)}</div></At>
				<At x={540} y={1390} s={pop(t, dd - 0.35)}><Badge text={S.dead} col={C.ghost} size={48} /></At>
				<Bats t={t} t0={2.2} y={560} />
			</Win>
			{/* 2 — Samhain */}
			<Win a={ch[1]} b={ch[2]}>
				<At x={540} y={250} s={pop(t, K.celts - 0.4)}><Pill text={S.celts} bg={C.ghost} size={38} /></At>
				<At x={540} y={370} s={pop(t, K.samhain - 0.3)}><Title text={S.samhain} col={C.pumpkin} size={130} glow={C.pumpkin} /></At>
				<At x={540} y={800} s={pop(t, K.samhain)}><YearWheel size={500} t={t} rot={-40 + 40 * eio(P(t, K.dark - 0.6, K.dark + 1))} dark={P(t, K.dark - 0.2, K.dark + 0.4)} L={S.wheel} /></At>
				<At x={540} y={1120} s={pop(t, K.sunset - 0.4)}><Txt text={S.sunset} col={C.ember} size={40} /></At>
				<At x={540} y={1235} o={P(t, K.sunset - 0.4, K.sunset)}>
					<div style={{position: 'relative', width: 700, height: 110, overflow: 'hidden', borderBottom: `4px solid ${C.ember}`}}>
						<div style={{position: 'absolute', left: 350 - 60, top: 10 + 110 * eio(P(t, K.sunset, K.sunset + 2.2)), width: 120, height: 120, borderRadius: 60, background: 'radial-gradient(circle, #fff1b0 0%, #ffb340 50%, #ff5a14 100%)', boxShadow: '0 0 60px #ff9a3c'}} />
					</div>
				</At>
				<At x={540} y={1360} s={pop(t, K.oct31 - 0.4)}><Pill text={S.oct31} bg={C.pumpkin} size={42} /></At>
			</Win>
			{/* 3 — spirits, bonfires, disguises */}
			<Win a={ch[2]} b={ch[3]}>
				<At x={540} y={260} s={pop(t, ch[2] + 0.1)}><Txt text={S.alive} col={C.ember} size={44} /></At>
				<At x={540} y={560} o={1}>
					<div style={{width: 1000, height: 14 - 10 * P(t, K.border, K.border + 1), borderRadius: 8, background: `linear-gradient(90deg, transparent, ${C.ghost}, transparent)`, boxShadow: `0 0 ${40 + 30 * Math.sin(t * 6)}px ${C.ghost}`, opacity: 0.9 - 0.5 * P(t, K.border, K.border + 1) * (0.5 + 0.5 * Math.sin(t * 9))}} />
				</At>
				<At x={540} y={500} s={pop(t, K.border - 0.2)}><Pill text={S.veil} bg="rgba(13,7,22,.9)" fg={C.ghost} size={32} /></At>
				<At x={540} y={660} o={1 - 0.6 * P(t, K.spirits, K.spirits + 1)}><Txt text={S.deadW} col={C.violet} size={40} /></At>
				{[0, 1, 2, 3].map((i) => {const k = eout(P(t, K.spirits - 0.3 + i * 0.25, K.spirits + 1.8 + i * 0.25)); return <At key={i} x={[200, 420, 660, 880][i]} y={900 - 520 * k + Math.sin(t * 2 + i) * 10} o={P(t, K.spirits - 0.3 + i * 0.25, K.spirits + i * 0.25) * (1 - P(t, K.fire + 0.2, K.fire + 0.8) * 0.5)}><Ghost size={[120, 100, 130, 105][i]} t={t} ph={i} /></At>;})}
				<At x={540} y={1060} s={pop(t, K.fire - 0.3)}><Bonfire size={280} t={t} /></At>
				<At x={540} y={1240} s={pop(t, K.fire)}><Txt text={S.fire} col={C.ember} size={40} /></At>
				{[0, 1].map((i) => <At key={i} x={i ? 840 : 240} y={1090} s={pop(t, K.mask - 0.3 + i * 0.2)}><Masked size={170} t={t} col={i ? '#3a1c58' : '#2a1840'} /></At>)}
				<At x={540} y={1345} s={pop(t, K.mask + 0.1)}><Badge text={S.mask} col={C.ghost} size={lang === 'ru' ? 40 : 36} /></At>
				<Bats t={t} t0={ch[2] + 0.6} y={330} />
			</Win>
			{/* 4 — All Hallows' Eve */}
			<Win a={ch[3]} b={ch[4]}>
				<At x={540} y={250} s={pop(t, K.church - 0.4)}><Pill text={S.church} bg={C.bone} size={40} /></At>
				{[[S.cal0, 300, K.eve - 0.7, C.violet], [S.cal1, 780, K.nov1 - 0.3, C.gold]].map(([L, x, a, col]: any, i) => (
					<At key={i} x={x} y={530} s={pop(t, a)}>
						<div style={{width: 420, borderRadius: 26, overflow: 'hidden', border: `4px solid ${col}`, boxShadow: `0 0 34px ${col}77`, background: 'rgba(13,7,22,.92)', textAlign: 'center'}}>
							<div style={{background: col, color: C.ink, fontFamily: DISPLAY, fontWeight: 900, fontSize: 40, padding: '14px 0'}}>{L[0]}</div>
							<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 32, color: C.bone, padding: '26px 10px'}}>{L[1]}</div>
						</div>
					</At>
				))}
				<At x={540} y={860} s={pop(t, K.eve - 0.4)}><Title text={S.w1} col={C.bone} size={84} /></At>
				<At x={540} y={950} o={P(t, K.word - 0.9, K.word - 0.6)}><Txt text="↓" col={C.mute} size={50} /></At>
				<At x={540} y={1040} s={pop(t, K.word - 0.7)}><Title text={S.w2} col={C.ember} size={84} /></At>
				<At x={540} y={1130} o={P(t, K.word - 0.3, K.word)}><Txt text="↓" col={C.mute} size={50} /></At>
				<At x={540} y={1260} s={pop(t, K.word, 0.6)}><Title text={S.w3} col={C.pumpkin} size={150} glow={C.pumpkin} /></At>
			</Win>
			{/* 5 — souling */}
			<Win a={ch[4]} b={ch[5]}>
				<At x={540} y={250} s={pop(t, K.poor - 0.4)}><Pill text={S.poor} bg={C.violet} fg="#fff" size={40} /></At>
				<At x={540} y={720}><Door w={340} open={eout(P(t, K.cakes - 0.6, K.cakes + 0.2))} shake={[0, 1, 2].reduce((a, i) => a + Math.sin(P(t, K.poor + i * 0.28, K.poor + i * 0.28 + 0.15) * Math.PI), 0)} glow={P(t, K.cakes - 0.6, K.cakes + 0.2)} /></At>
				<At x={540} y={1060 - 140 * (1 - eout(P(t, K.cakes - 0.2, K.cakes + 0.5)))} s={pop(t, K.cakes - 0.2)}><SoulCake size={230} /></At>
				<At x={300} y={1190} s={pop(t, K.cakes)}><Pill text={S.cakes} bg={C.ember} size={32} /></At>
				<At x={770} y={1190} s={pop(t, K.pray - 0.3)}><Pill text={S.pray} bg={C.bone} size={30} /></At>
				<At x={540} y={1290} s={pop(t, K.proto - 0.4)}><Txt text={S.proto1} col={C.bone} size={36} /></At>
				<At x={540} y={1360} s={pop(t, K.proto - 0.1)}><Title text={S.proto2} col={C.pumpkin} size={lang === 'ru' ? 58 : 64} glow={C.pumpkin} /></At>
			</Win>
			{/* 6 — Stingy Jack, turnip lantern */}
			<Win a={ch[5]} b={ch[6]}>
				<At x={540} y={250} s={pop(t, K.turnip - 0.4)}><Badge text={S.turnip} col={C.violet} size={50} /></At>
				<At x={540} y={790}><Lantern3D w={1000} h={800} morph={0} glow={P(t, K.turnip - 0.3, K.turnip + 0.6)} spin={sway} flicker={flick} dist={5.6} /></At>
				<At x={880} y={470} s={pop(t, K.devil - 0.3)} rot={8}><Devil size={170} t={t} /></At>
				<At x={210} y={500 - 30 * Math.sin(t * 2)} s={pop(t, K.ember - 0.3)}><Ember size={70} t={t} /></At>
				<At x={540} y={1190} s={pop(t, K.jack - 0.3)}><Pill text={S.jack} bg={C.pumpkin} size={44} /></At>
				<At x={540} y={1280} s={pop(t, K.devil - 0.2)}><Txt text={S.devil} col={C.blood} size={40} /></At>
				<At x={540} y={1350} s={pop(t, K.ember - 0.2)}><Txt text={S.ember} col={C.ember} size={40} /></At>
			</Win>
			{/* 7 — famine, voyage, turnip → pumpkin */}
			<Win a={ch[6]} b={ch[7]}>
				<At x={540} y={250} s={pop(t, K.famine - 0.4)}><Badge text={S.famine} col={C.bone} size={50} /></At>
				<At x={540} y={600} o={voyO}><Voyage w={960} k={eio(P(t, K.famine, K.america + 0.6))} t={t} L={S.voy} /></At>
				<At x={540} y={960} s={pop(t, K.famine + 0.6)} o={voyO}><Title text={S.n2m} col={C.gold} size={104} glow={C.gold} /></At>
				<At x={540} y={1050} s={pop(t, K.famine + 0.9)} o={voyO}><Txt text={S.n2sub} col={C.bone} size={38} /></At>
				{lanO > 0 ? <At x={540} y={760} o={lanO}><Lantern3D w={1000} h={820} morph={morph7} glow={1} spin={sway + 0.3 * Math.sin(t * 2) * (1 - morph7)} flicker={flick} dist={lerpN(5.6, 6.2, morph7)} /></At> : null}
				<At x={540} y={1210} s={pop(t, pumpK - 0.2)}><Pill text={S.swap} bg={C.pumpkin} size={46} /></At>
				<At x={540} y={1320} s={pop(t, K.easy - 0.3)}><Txt text={S.easy} col={C.ember} size={40} /></At>
			</Win>
			{/* 8 — trick or treat → today */}
			<Win a={ch[7]} b={ch[8]} last>
				<At x={540} y={740} s={pop(t, ch[7] + 0.1)} o={papO} rot={-3}><Newspaper w={840} L={S.paper} /></At>
				{papO < 1 ? <>
					<At x={540} y={330} s={pop(t, K.b135 - 0.4)}><Counter k={P(t, K.b135 - 0.3, K.b135 + 1.0)} to={13.5} fmt={S.fmt} col={C.gold} size={lang === 'ru' ? 120 : 104} /></At>
					<At x={540} y={440} s={pop(t, K.b135)}><Txt text={S.b135sub} col={C.bone} size={38} /></At>
					<At x={540} y={880} o={P(t, today - 0.3, today + 0.3)}><Lantern3D w={1000} h={760} morph={1} glow={1} spin={sway} flicker={flick} dist={6.6} /></At>
					<At x={540} y={1260} s={pop(t, K.fear - 0.6)} o={1 - P(t, K.cta - 0.4, K.cta)}><Txt text={S.fin1} col={C.bone} size={42} /></At>
					<At x={540} y={1340} s={pop(t, K.fear - 0.3)} o={1 - P(t, K.cta - 0.4, K.cta)}><Title text={S.fin2} col={C.ghost} size={lang === 'ru' ? 64 : 68} glow={C.ghost} /></At>
				</> : null}
			</Win>
			{ribO > 0 ? <At x={540} y={1478} o={1}><TimeRibbon w={860} eras={S.eras} pos={rpos} t={t} o={ribO} /></At> : null}
			<Brand S={S} />
			<CTA K={K} S={S} />
			<Captions captions={data.captions} />
			<Audio src={staticFile('music.mp3')} volume={(f) => 0.14 * Math.min(1, f / 30) * Math.min(1, (dur * FPS - f) / 75)} />
			<Sequence from={15} layout="none"><Audio src={staticFile(`${lang}/voice.mp3`)} volume={1.1} /></Sequence>
			{sfx('fire.mp3', K.fire - 0.3, 0.35, 'fi')}
			{sfx('knock.mp3', K.poor - 0.05, 0.5, 'kn')}
			{sfx('carve.mp3', pumpK - 0.1, 0.4, 'ca')}
			{sfx('coins.mp3', K.b135 - 0.2, 0.3, 'co')}
		</AbsoluteFill>
	);
};
const lerpN = (a: number, b: number, k: number) => a + (b - a) * k;
