import React from 'react';
import {AbsoluteFill, Img, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Audio} from '@remotion/media';
import {loadFont} from '@remotion/fonts';
import {AgeLabel, CellarBg, Equalizer, Flag, Generations, Glass3D, Letters, Magazine, Seal, ShareRing, Stamp, Stave, TownSign, Vinyl} from './Comps';
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
		<div style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 32, color: 'rgba(251,246,238,.92)', textShadow: '0 2px 10px rgba(0,0,0,.6)'}}>{S.handle}</div>
	</div>
);
export const Win: React.FC<{a: number; b: number; children: React.ReactNode; last?: boolean}> = ({a, b, children, last}) => {
	const t = useCurrentFrame() / FPS;
	if (t < a - 0.3 || t > b + 0.3) return null;
	const i = eout(P(t, a - 0.25, a + 0.35)), o = last ? 1 : 1 - P(t, b - 0.2, b + 0.15);
	return <AbsoluteFill style={{opacity: i * o, filter: i < 1 ? `blur(${(1 - i) * 8}px)` : undefined}}>{children}</AbsoluteFill>;
};
export const sfx = (src: string, at: number, vol: number, key: string) => <Sequence key={key} from={Math.max(0, Math.round(at * FPS))} layout="none"><Audio src={staticFile('sfx/' + src)} volume={vol} /></Sequence>;
const Row: React.FC<{children: React.ReactNode}> = ({children}) => <div style={{display: 'flex', alignItems: 'center', gap: 22}}>{children}</div>;

export const HenShort: React.FC<{lang: 'ru' | 'en'; data: any}> = ({lang, data}) => {
	const S = STR[lang], K = data.k, ch = chapters(data), dur = data.dur;
	const t = useCurrentFrame() / FPS;
	const E = [0, 5, 0, 2, 1, 3, 4.5, 4, 5];
	let c = 0; while (c < 8 && t >= ch[c + 1]) c++;
	const n = Math.min(8, c + 1);
	const pos = c === 0 ? 5 : E[n - 1] + (E[n] - E[n - 1]) * eio(P(t, ch[c], ch[c] + 1.2));
	const cta = K.cta !== undefined ? 1 - P(t, K.cta - 0.4, K.cta) : 1;
	return (
		<AbsoluteFill>
			<CellarBg />
			{/* 1 — hook: a glass being poured */}
			<Win a={0} b={ch[1]}>
				<At x={540} y={250} s={pop(t, 0.1)}><Title text={S.t1} col={C.cream} size={lang === 'ru' ? 74 : 88} /></At>
				<At x={540} y={350} s={pop(t, 0.35)}><Title text={S.t2} col={C.gold} size={lang === 'ru' ? 96 : 76} glow={C.amber} /></At>
				<At x={540} y={790}><Glass3D w={900} h={820} t={t} fill={0.45 * eout(P(t, 0.3, 3.2))} swirl={1} /></At>
				<At x={540} y={1250} s={pop(t, K.soldier - 0.3)}><Row><Flag c="ie" w={90} /><Pill text={S.irish} bg={C.cream} size={38} /></Row></At>
				<At x={540} y={1360} s={pop(t, K.america - 0.3)}><Row><Flag c="us" w={90} /><Pill text={S.usa1} bg={C.gold} size={lang === 'ru' ? 34 : 36} /></Row></At>
			</Win>
			{/* 2 — Richard Hennessy, Cognac, 1765 */}
			<Win a={ch[1]} b={ch[2]}>
				<At x={540} y={260} s={pop(t, K.richard - 0.3)}><Badge text={S.richard} col={C.gold} size={52} /></At>
				<At x={540} y={420} s={pop(t, K.king - 0.4)}><Row><Flag c="ie" w={110} /><div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 60, color: C.gold}}>→</div><Flag c="fr" w={110} /></Row></At>
				<At x={540} y={530} s={pop(t, K.king)}><Txt text={S.king} col={C.mute} size={34} /></At>
				<At x={540} y={760} s={pop(t, K.town - 0.4)} rot={-2}><TownSign w={620} name="COGNAC" /></At>
				<At x={540} y={1110} s={t < K.y1765 - 0.2 ? 0 : 2.2 - 1.2 * eout(P(t, K.y1765 - 0.2, K.y1765 + 0.15))} o={P(t, K.y1765 - 0.2, K.y1765)} rot={-8}><Seal size={300} text="1765" sub={S.house} /></At>
			</Win>
			{/* 3 — stars → X.O */}
			<Win a={ch[2]} b={ch[3]}>
				<At x={540} y={700} s={pop(t, ch[2] + 0.2)}><AgeLabel w={780} stars={P(t, K.stars - 0.3, K.stars + 0.9)} xo={P(t, K.xo - 0.3, K.xo + 0.4)} /></At>
				<At x={540} y={1130} s={pop(t, K.stars + 0.3)}><Pill text={S.stars} bg={C.cream} size={40} /></At>
				<At x={540} y={1280} s={pop(t, K.xo)}><Title text={S.xo} col={C.gold} size={lang === 'ru' ? 66 : 70} glow={C.amber} /></At>
			</Win>
			{/* 4 — the Fillioux family */}
			<Win a={ch[3]} b={ch[4]}>
				<At x={540} y={260} s={pop(t, K.y1806 - 0.4)}><Badge text={S.fam} col={C.gold} size={lang === 'ru' ? 48 : 46} /></At>
				<At x={540} y={360} s={pop(t, K.fillioux)}><Txt text={S.blender} col={C.mute} size={36} /></At>
				<At x={540} y={720}><Generations w={1000} k={eout(P(t, K.y1806, K.gen8 + 0.3))} t={t} /></At>
				<At x={540} y={1000} s={pop(t, K.gen8 - 0.2)}><Title text={S.gen} col={C.gold} size={lang === 'ru' ? 84 : 88} glow={C.amber} /></At>
				<At x={540} y={1250} s={pop(t, ch[3] + 0.6)}><Glass3D w={420} h={360} t={t} fill={0.6} dist={8.5} glow={0.3} /></At>
			</Win>
			{/* 5 — America */}
			<Win a={ch[4]} b={ch[5]}>
				<At x={540} y={260} s={pop(t, ch[4] + 0.1)}><Row><Flag c="us" w={100} /><Badge text={S.ads} col={C.cream} size={lang === 'ru' ? 38 : 44} /></Row></At>
				<At x={360} y={680} s={pop(t, K.ads - 0.3)}><Magazine w={330} title="EBONY" col="#9a2b22" rot={-6} /></At>
				<At x={720} y={700} s={pop(t, K.ads + 0.2)}><Magazine w={330} title="JET" col="#2b4f9a" rot={5} /></At>
				<At x={540} y={1120} s={pop(t, K.vp - 0.4)}><div style={{padding: '22px 40px', borderRadius: 26, background: 'rgba(18,11,7,.92)', border: `4px solid ${C.gold}`, textAlign: 'center'}}><div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 56, color: C.gold}}>{S.vp}</div><div style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 32, color: C.cream, opacity: P(t, K.olymp - 0.3, K.olymp + 0.2)}}>{S.vpSub}</div></div></At>
			</Win>
			{/* 6 — hip-hop */}
			<Win a={ch[5]} b={ch[6]}>
				<At x={540} y={260} s={pop(t, K.hiphop - 0.4)}><Badge text={S.hip} col={C.amber} size={60} /></At>
				<At x={540} y={660} s={pop(t, K.hiphop - 0.2)}><Vinyl size={520} t={t} label="HENNY" /></At>
				<At x={540} y={1040} s={pop(t, K.hiphop)}><Equalizer w={900} t={t} /></At>
				<At x={540} y={1180} s={pop(t, K.tupac - 0.3)}><Pill text={S.tupac} bg={C.cream} size={42} /></At>
				<At x={540} y={1310} s={pop(t, K.usa - 0.3)}><Row><Flag c="us" w={90} /><Title text={S.usa} col={C.gold} size={74} glow={C.amber} /></Row></At>
			</Win>
			{/* 7 — the H in LVMH */}
			<Win a={ch[6]} b={ch[7]}>
				<At x={540} y={620}><Letters size={240} on={[P(t, K.lv - 0.2, K.lv + 0.4), P(t, K.lv, K.lv + 0.6), P(t, K.moet - 0.2, K.moet + 0.4), P(t, ch[6] + 0.2, ch[6] + 0.8)]} hi={P(t, K.h - 0.3, K.h + 0.4)} /></At>
				<At x={540} y={940} s={pop(t, K.moet - 0.3)}><Pill text={S.m71} bg={C.cream} size={40} /></At>
				<At x={540} y={1060} s={pop(t, K.lv - 0.3)}><Pill text={S.lv87} bg={C.gold} size={40} /></At>
				<At x={540} y={1260} s={pop(t, K.h - 0.2)}><Txt text={S.lvmh} col={C.cream} size={40} /></At>
			</Win>
			{/* 8 — share & tariffs */}
			<Win a={ch[7]} b={ch[8]} last>
				<At x={540} y={620} s={pop(t, ch[7] + 0.1)} o={cta}><ShareRing size={560} k={eout(P(t, K.share - 0.5, K.share + 1))} label={S.share} /></At>
				<At x={540} y={1080} s={pop(t, K.tariffs - 0.3)} o={cta}><Row><Flag c="us" w={110} /><Stamp text={S.tariffs} size={60} /><Flag c="cn" w={110} /></Row></At>
				<At x={540} y={1260} s={pop(t, K.king2 - 0.4)} o={cta}><Title text={S.king2} col={C.red} size={96} /></At>
			</Win>
			<At x={540} y={1470} o={1}><Stave w={940} years={S.years} pos={pos} t={t} o={P(t, ch[1], ch[1] + 0.6) * cta} /></At>
			<Brand S={S} />
			<CTA K={K} S={S} />
			<Captions captions={data.captions} />
			<Audio src={staticFile('music.mp3')} volume={(f) => 0.14 * Math.min(1, f / 30) * Math.min(1, (dur * FPS - f) / 75)} />
			<Sequence from={15} layout="none"><Audio src={staticFile(`${lang}/voice.mp3`)} volume={1.1} /></Sequence>
			{sfx('pour.mp3', 0.3, 0.35, 'po')}
			{sfx('barrel.mp3', K.y1806 - 0.3, 0.3, 'ba')}
			{sfx('clink.mp3', K.moet, 0.3, 'cl')}
		</AbsoluteFill>
	);
};
