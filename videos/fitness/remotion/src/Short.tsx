import React from 'react';
import {AbsoluteFill, Img, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Audio} from '@remotion/media';
import {loadFont} from '@remotion/fonts';
import {Can, Card, CopyGrid, Counter, Dumbbell3D, FeedCard, GymBg, Ladder, MoneyPop, People100, Phone, Profile, PromoTag} from './Comps';
import {CTA} from './CTA';
import {Captions} from './Captions';
import {STR} from './strings';
import {At, Badge, C, DISPLAY, FPS, P, Pill, Title, Txt, eout, pop} from './ui';

for (const [f, w] of [['InterDisplay-Black.otf', '900'], ['InterDisplay-ExtraBold.otf', '800']]) loadFont({family: 'Inter Display', url: staticFile('fonts/' + f), weight: w});
for (const [f, w] of [['Inter-Bold.otf', '700'], ['Inter-ExtraBold.otf', '800']]) loadFont({family: 'Inter', url: staticFile('fonts/' + f), weight: w});

export const chapters = (data: any, n = 8) => {const ch = [0]; for (let s = 2; s <= n; s++) ch.push(data.segs.find((x: any) => x.s === s).t0 - 0.35); ch.push(data.dur); return ch;};
const Brand: React.FC<{S: any}> = ({S}) => (
	<div style={{position: 'absolute', left: 44, top: 52, display: 'flex', alignItems: 'center', gap: 16}}>
		<Img src={staticFile(S.logo)} style={{width: 72, height: 72, borderRadius: 36, border: `3px solid ${C.pink}cc`, boxShadow: `0 0 18px ${C.pink}66`}} />
		<div style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 32, color: 'rgba(247,245,255,.92)', textShadow: '0 2px 10px rgba(0,0,0,.6)'}}>{S.handle}</div>
	</div>
);
export const Win: React.FC<{a: number; b: number; children: React.ReactNode; last?: boolean}> = ({a, b, children, last}) => {
	const t = useCurrentFrame() / FPS;
	if (t < a - 0.3 || t > b + 0.3) return null;
	const i = eout(P(t, a - 0.25, a + 0.35)), o = last ? 1 : 1 - P(t, b - 0.2, b + 0.15);
	return <AbsoluteFill style={{opacity: i * o, transform: `scale(${1.08 - 0.08 * i})`}}>{children}</AbsoluteFill>;
};
export const sfx = (src: string, at: number, vol: number, key: string) => <Sequence key={key} from={Math.max(0, Math.round(at * FPS))} layout="none"><Audio src={staticFile('sfx/' + src)} volume={vol} /></Sequence>;

export const FitShort: React.FC<{lang: 'ru' | 'en'; data: any}> = ({lang, data}) => {
	const S = STR[lang], K = data.k, ch = chapters(data), dur = data.dur;
	const t = useCurrentFrame() / FPS;
	const cta = K.cta !== undefined ? 1 - P(t, K.cta - 0.4, K.cta) : 1;
	const lit = t < ch[2] ? 0 : t < ch[3] ? 1 + P(t, K.promo - 0.3, K.promo + 0.3) : t < ch[4] ? 2 + P(t, K.programs - 0.3, K.programs + 0.3) : 3 + P(t, K.brand - 0.3, K.brand + 0.3);
	return (
		<AbsoluteFill>
			<GymBg />
			{/* 1 */}
			<Win a={0} b={ch[1]}>
				<At x={540} y={250} s={pop(t, 0.1)}><Title text={S.t1} col={C.white} size={lang === 'ru' ? 66 : 70} /></At>
				<At x={540} y={370} s={pop(t, K.why - 0.3)}><Title text={S.t2} col={C.volt} size={130} glow={C.volt} /></At>
				<At x={540} y={800}><Dumbbell3D w={1000} h={760} t={t} glow={0.7} /></At>
				<At x={540} y={1300} s={t < K.spoiler - 0.4 ? 0 : 2 - eout(P(t, K.spoiler - 0.4, K.spoiler - 0.1))} rot={-4}><div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: lang === 'ru' ? 54 : 44, color: C.pink, border: `7px solid ${C.pink}`, borderRadius: 18, padding: '8px 26px', background: 'rgba(12,9,24,.8)', boxShadow: `0 0 30px ${C.pink}66`}}>{S.spoiler}</div></At>
			</Win>
			{/* 2 */}
			<Win a={ch[1]} b={ch[2]}>
				<At x={540} y={250} s={pop(t, K.perfect - 0.3)}><Badge text={S.perfect} col={C.pink} size={54} /></At>
				<At x={540} y={830} o={1 - P(t, K.pandemic - 0.3, K.pandemic)}><Phone w={460}><Profile w={460} followers={2.4e6 * eout(P(t, ch[1], K.before + 1))} label={S.followers} fmt={S.fmtF} />{S.cards.map((c: string, i: number) => <FeedCard key={i} w={460} col={[C.pink, C.blue, C.violet][i]} title={c} icon={['dumbbell', 'food', 'ba'][i] as any} k={P(t, K.perfect + i * 0.9, K.perfect + i * 0.9 + 0.5)} />)}</Phone></At>
				{t > K.pandemic - 0.4 ? <>
					<At x={540} y={640} s={pop(t, K.pandemic - 0.3)}><div style={{position: 'relative', width: 360, height: 260, borderRadius: 30, background: '#1a1630', border: '4px solid #3a3456', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><svg width="200" height="140" viewBox="0 0 40 28"><path d="M2 14 h4 M34 14 h4 M6 6 v16 M34 6 v16 M10 9 v10 M30 9 v10 M10 14 h20" stroke="#8a84aa" strokeWidth="3" strokeLinecap="round" /></svg><div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><svg width="140" height="160" viewBox="0 0 30 34"><rect x="3" y="14" width="24" height="18" rx="3" fill={C.red} /><path d="M8 14 v-5 a7 7 0 0 1 14 0 v5" stroke={C.red} strokeWidth="4" fill="none" /></svg></div></div></At>
					<At x={540} y={860} s={pop(t, K.pandemic)}><Pill text={S.gyms} bg={C.red} fg="#fff" size={44} /></At>
					<At x={540} y={1060} s={pop(t, K.home - 0.5)}><Title text={S.home} col={C.volt} size={92} glow={C.volt} /></At>
				</> : null}
			</Win>
			{/* 3 */}
			<Win a={ch[2]} b={ch[3]}>
				<At x={540} y={260} s={pop(t, K.cheap - 0.4)}><Badge text={S.views} col={C.mute} size={lang === 'ru' ? 50 : 54} /></At>
				<At x={540} y={460} s={pop(t, K.cheap)}><Counter k={P(t, ch[2], K.cheap + 0.5)} to={1000000} fmt={(v) => '▶ ' + Math.round(v).toLocaleString('en-US')} col={C.white} size={84} /></At>
				<At x={540} y={830} s={pop(t, K.promo - 0.3)}><PromoTag w={760} code="FIT-BRO20" pct={S.pct} k={P(t, K.promo, K.promo + 1.2)} /></At>
				<At x={540} y={1110} s={pop(t, K.percent - 0.3)}><Title text={S.cut} col={C.blue} size={lang === 'ru' ? 66 : 72} glow={C.blue} /></At>
				<MoneyPop t={t} t0={K.percent + 0.2} text="+$" n={5} col={C.volt} />
			</Win>
			{/* 4 */}
			<Win a={ch[3]} b={ch[4]}>
				<At x={540} y={260} s={pop(t, K.programs - 0.4)}><Badge text={S.programs} col={C.pink} size={56} /></At>
				<At x={540} y={760} s={pop(t, K.once - 0.6)}><CopyGrid k={P(t, K.thousands - 0.6, K.thousands + 1.2)} /></At>
				<At x={300} y={1130} s={pop(t, K.once - 0.2)}><Pill text={S.once} bg={C.pink} fg="#fff" size={36} /></At>
				<At x={780} y={1130} s={pop(t, K.thousands - 0.3)}><Pill text={'×1000'} bg={C.blue} fg="#fff" size={44} /></At>
				<At x={540} y={1260} s={pop(t, K.thousands)}><Txt text={S.thousands} col={C.volt} size={lang === 'ru' ? 46 : 42} /></At>
			</Win>
			{/* 5 */}
			<Win a={ch[4]} b={ch[5]}>
				<At x={540} y={260} s={pop(t, K.brand - 0.4)}><Badge text={S.brand} col={C.volt} size={56} /></At>
				<At x={540} y={380} s={pop(t, K.katy - 0.3)}><Txt text={S.katy[0]} col={C.white} size={42} /></At>
				<At x={540} y={450} s={pop(t, K.katy)}><Txt text={S.katy[1]} col={C.mute} size={34} /></At>
				<At x={540} y={790} s={1}><div style={{display: 'flex', gap: 40, alignItems: 'flex-end'}}>{[[C.pink, '#8a1452'], [C.blue, '#123a8a'], [C.volt, '#5a7a12']].map(([a, b], i) => <div key={i} style={{transform: `translateY(${(1 - eout(P(t, K.katy + i * 0.25, K.katy + 0.6 + i * 0.25))) * 400}px)`, opacity: P(t, K.katy + i * 0.25, K.katy + 0.4 + i * 0.25)}}><Can h={i === 1 ? 420 : 360} col={a} col2={b} label="ENERGY" /></div>)}</div></At>
				<At x={540} y={1210} s={pop(t, K.b18 - 0.5)}><Counter k={P(t, K.b18 - 0.4, K.b18 + 0.8)} to={1.8} fmt={S.b18} col={C.volt} size={lang === 'ru' ? 118 : 104} /></At>
			</Win>
			{/* 6 */}
			<Win a={ch[5]} b={ch[6]}>
				<At x={540} y={260} s={pop(t, K.kayla - 0.4)}><Badge text={S.kayla[0]} col={C.pink} size={56} /></At>
				<At x={540} y={370} s={pop(t, K.kayla)}><Txt text={S.kayla[1]} col={C.mute} size={36} /></At>
				<At x={540} y={760} s={pop(t, K.app - 0.4)}><div style={{width: 300, height: 300, borderRadius: 70, background: `linear-gradient(135deg, ${C.pink}, ${C.violet})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 60px ${C.pink}66`}}><svg width="170" height="120" viewBox="0 0 40 28"><path d="M2 14 h4 M34 14 h4 M6 6 v16 M34 6 v16 M10 9 v10 M30 9 v10 M10 14 h20" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" /></svg></div></At>
				<At x={540} y={1100} s={pop(t, K.app + 0.4)}><div style={{display: 'flex', alignItems: 'center', gap: 26}}><div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}><div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 90, color: C.volt}}>↑</div><Pill text={S.sold} bg={C.volt} size={32} /></div><div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: P(t, K.back - 0.4, K.back)}}><div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 90, color: C.red}}>↓</div><Pill text={S.back} bg={C.red} fg="#fff" size={32} /></div></div></At>
			</Win>
			{/* 7 */}
			<Win a={ch[6]} b={ch[7]}>
				<At x={540} y={260} s={pop(t, K.catch - 0.3)}><Title text={S.p4} col={C.volt} size={150} glow={C.volt} /></At>
				<At x={540} y={380} s={pop(t, K.p4 - 0.2)}><Txt text={S.p4sub} col={C.white} size={lang === 'ru' ? 34 : 36} /></At>
				<At x={540} y={830} s={pop(t, K.catch)}><People100 k={P(t, K.catch, K.catch + 2)} hi={P(t, K.p4 - 0.2, K.p4 + 0.5)} size={70} /></At>
				<At x={540} y={1300} s={pop(t, K.rest - 0.3)}><Pill text={S.rest} bg={C.white} size={lang === 'ru' ? 34 : 42} /></At>
			</Win>
			{/* 8 */}
			<Win a={ch[7]} b={ch[8]} last>
				<At x={540} y={260} s={pop(t, K.notworkouts - 0.4)} o={cta}><Title text={S.notw} col={C.white} size={lang === 'ru' ? 62 : 58} /></At>
				<At x={540} y={700} o={cta}><Dumbbell3D w={900} h={600} t={t} glow={0.9} dist={7.6} /></At>
				<At x={540} y={1130} s={pop(t, K.trust - 0.3)} o={cta}><div style={{display: 'flex', alignItems: 'center', gap: 24}}><Pill text={S.trust} bg={C.pink} fg="#fff" size={50} /><div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 80, color: C.white, opacity: P(t, K.product - 0.8, K.product - 0.4)}}>→</div><div style={{transform: `scale(${pop(t, K.product - 0.4)})`}}><Pill text={S.product} bg={C.volt} size={44} /></div></div></At>
			</Win>
			<At x={540} y={1478}><Ladder w={940} steps={S.ladder} lit={lit} o={P(t, ch[2] - 0.4, ch[2] + 0.2) * cta} /></At>
			<Brand S={S} />
			<CTA K={K} S={S} />
			<Captions captions={data.captions} />
			<Audio src={staticFile('music.mp3')} volume={(f) => 0.13 * Math.min(1, f / 30) * Math.min(1, (dur * FPS - f) / 75)} />
			<Sequence from={15} layout="none"><Audio src={staticFile(`${lang}/voice.mp3`)} volume={1.1} /></Sequence>
			{sfx('dumbbell.mp3', 0.4, 0.35, 'db')}
			{sfx('notif.mp3', K.percent + 0.2, 0.3, 'n1')}
			{sfx('cash.mp3', K.b18 - 0.2, 0.3, 'ca')}
			{sfx('dumbbell.mp3', K.trust - 0.2, 0.25, 'db2')}
		</AbsoluteFill>
	);
};
