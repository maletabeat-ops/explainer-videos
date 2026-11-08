import React from 'react';
import {AbsoluteFill, Img, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Audio} from '@remotion/media';
import {loadFont} from '@remotion/fonts';
import {Bill, Bottle3D, Calendar, CapRow, Card, Counter, Glasses, RedBg, SantaSwatches, Truck} from './Comps';
import {CTA} from './CTA';
import {Captions} from './Captions';
import {STR} from './strings';
import {At, Badge, C, DISPLAY, FPS, P, Pill, Title, Txt, eio, eout, pop} from './ui';

for (const [f, w] of [['InterDisplay-Black.otf', '900'], ['InterDisplay-ExtraBold.otf', '800']]) loadFont({family: 'Inter Display', url: staticFile('fonts/' + f), weight: w});
for (const [f, w] of [['Inter-Bold.otf', '700'], ['Inter-ExtraBold.otf', '800']]) loadFont({family: 'Inter', url: staticFile('fonts/' + f), weight: w});

export const chapters = (data: any, n = 8) => {const ch = [0]; for (let s = 2; s <= n; s++) ch.push(data.segs.find((x: any) => x.s === s).t0 - 0.35); ch.push(data.dur); return ch;};
const Brand: React.FC<{S: any}> = ({S}) => (
	<div style={{position: 'absolute', left: 44, top: 52, display: 'flex', alignItems: 'center', gap: 16}}>
		<Img src={staticFile(S.logo)} style={{width: 72, height: 72, borderRadius: 36, border: `3px solid ${C.red}cc`, boxShadow: `0 0 18px ${C.red}66`}} />
		<div style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 32, color: 'rgba(255,248,242,.92)', textShadow: '0 2px 10px rgba(0,0,0,.6)'}}>{S.handle}</div>
	</div>
);
export const Win: React.FC<{a: number; b: number; children: React.ReactNode; last?: boolean}> = ({a, b, children, last}) => {
	const t = useCurrentFrame() / FPS;
	if (t < a - 0.3 || t > b + 0.3) return null;
	const i = eout(P(t, a - 0.25, a + 0.35)), o = last ? 1 : 1 - P(t, b - 0.2, b + 0.15);
	return <AbsoluteFill style={{opacity: i * o, transform: `translateY(${(1 - i) * 50}px)`}}>{children}</AbsoluteFill>;
};
export const sfx = (src: string, at: number, vol: number, key: string) => <Sequence key={key} from={Math.max(0, Math.round(at * FPS))} layout="none"><Audio src={staticFile('sfx/' + src)} volume={vol} /></Sequence>;

export const CokeShort: React.FC<{lang: 'ru' | 'en'; data: any}> = ({lang, data}) => {
	const S = STR[lang], K = data.k, ch = chapters(data), dur = data.dur;
	const t = useCurrentFrame() / FPS;
	const E = [0, 6, 0, 1, 2, 4, 3, 5, 6];
	let c = 0; while (c < 8 && t >= ch[c + 1]) c++;
	const n = Math.min(8, c + 1);
	const pos = c === 0 ? 6 : E[n - 1] + (E[n] - E[n - 1]) * eio(P(t, ch[c], ch[c] + 1.2));
	const cta = K.cta !== undefined ? 1 - P(t, K.cta - 0.4, K.cta) : 1;
	const snow = P(t, ch[5], ch[5] + 1.5);
	const night = P(t, ch[6] - 0.3, ch[6] + 0.6);
	const dark = P(t, K.dark - 0.8, K.dark - 0.2) * (1 - P(t, ch[4] - 0.4, ch[4]));
	return (
		<AbsoluteFill>
			<RedBg snow={snow} night={night} />
			{/* 1 */}
			<Win a={0} b={ch[1]}>
				<At x={540} y={250} s={pop(t, 0.1)}><Title text={S.t1} col={C.white} size={lang === 'ru' ? 90 : 84} /></At>
				<At x={540} y={355} s={pop(t, K.newyear - 0.6)}><Title text={S.t2} col={C.red} size={lang === 'ru' ? 66 : 56} glow={C.red} /></At>
				<At x={540} y={880}><Bottle3D w={900} h={1000} t={t} glow={0.6} /></At>
			</Win>
			{/* 2 */}
			<Win a={ch[1]} b={ch[2]}>
				<At x={540} y={250} s={pop(t, ch[1] + 0.1)}><Badge text={S.y1886} col={C.gold} size={56} /></At>
				<At x={540} y={360} s={pop(t, K.pemberton - 0.3)}><Txt text={S.pem} col={C.white} size={40} /></At>
				<At x={540} y={540} s={pop(t, K.soda - 0.3)}><Pill text={S.soda} bg={C.ice} size={40} /></At>
				<At x={540} y={830} s={pop(t, K.nine - 1.4)}><Glasses n={9} k={P(t, K.nine - 1.2, K.nine + 0.6)} size={88} /></At>
				<At x={540} y={1120} s={pop(t, K.nine - 0.2)}><Title text={S.nine} col={C.red} size={88} glow={C.red} /></At>
			</Win>
			{/* 3 */}
			<Win a={ch[2]} b={ch[3]}>
				<At x={540} y={250} s={pop(t, K.candler - 0.3)}><Badge text={S.candler} col={C.gold} size={56} /></At>
				<At x={540} y={360} s={pop(t, K.candler + 0.4)}><Txt text={S.candlerSub} col={C.white} size={40} /></At>
				<At x={540} y={780} s={pop(t, K.dollar - 1.4)}><Bill w={820} stamp={P(t, K.dollar - 0.1, K.dollar + 0.25)} label={S.stamp} /></At>
				<At x={540} y={1180} s={pop(t, K.dollar)}><Title text={S.y1899} col={C.green} size={100} glow={C.green} /></At>
			</Win>
			{/* 4 */}
			<Win a={ch[3]} b={ch[4]}>
				<At x={540} y={250} s={pop(t, K.bottle - 0.4)}><Badge text={S.y1915} col={C.gold} size={lang === 'ru' ? 48 : 52} /></At>
				<At x={540} y={820}><Bottle3D w={1000} h={1100} t={t} glow={0.4 + dark} dist={5.6} spin={0.6} /></At>
				<AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 0%, rgba(0,0,0,${0.85 * dark}) 38%)`}} />
				<At x={540} y={1340} s={pop(t, K.dark - 0.5)}><Pill text={S.dark} bg={C.white} size={40} /></At>
			</Win>
			{/* 5 */}
			<Win a={ch[4]} b={ch[5]}>
				<At x={540} y={250} s={pop(t, ch[4] + 0.1)}><Badge text={S.y1985} col={C.gold} size={56} /></At>
				<At x={540} y={600} s={pop(t, K.newcoke - 0.3)}>
					<div style={{position: 'relative'}}>
						<div style={{padding: '40px 70px', borderRadius: 30, background: 'linear-gradient(160deg,#e4002b,#8a0018)', fontFamily: DISPLAY, fontWeight: 900, fontSize: 90, color: '#fff', boxShadow: '0 16px 40px rgba(0,0,0,.6)'}}>{S.newc}</div>
						{t > K.angry - 0.2 ? <svg width="520" height="260" viewBox="0 0 520 260" style={{position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', overflow: 'visible'}}><path d={`M20 20 L${20 + 480 * eout(P(t, K.angry - 0.2, K.angry + 0.2))} ${20 + 220 * eout(P(t, K.angry - 0.2, K.angry + 0.2))}`} stroke="#fff" strokeWidth="18" strokeLinecap="round" /><path d={`M500 20 L${500 - 480 * eout(P(t, K.angry, K.angry + 0.4))} ${20 + 220 * eout(P(t, K.angry, K.angry + 0.4))}`} stroke="#fff" strokeWidth="18" strokeLinecap="round" /></svg> : null}
					</div>
				</At>
				<At x={540} y={1000} s={pop(t, K.d79 - 0.6)}><Calendar k={P(t, K.d79 - 0.6, K.d79 + 0.6)} size={360} label={S.days} /></At>
				<At x={540} y={1300} s={pop(t, K.d79 + 0.8)}><Pill text={S.back} bg={C.green} size={40} /></At>
			</Win>
			{/* 6 */}
			<Win a={ch[5]} b={ch[6]}>
				<At x={540} y={250} s={pop(t, K.sundblom - 0.4)}><Badge text={S.y1931} col={C.gold} size={lang === 'ru' ? 48 : 52} /></At>
				<At x={540} y={700} s={1}><SantaSwatches k={P(t, K.sundblom, K.santa)} red={P(t, K.red - 0.2, K.red + 0.4)} L={S.sw} /></At>
				<At x={540} y={1060} s={pop(t, K.red + 0.6)}><Txt text={S.before} col={C.mute} size={40} /></At>
				<At x={540} y={1180} s={pop(t, K.world - 0.6)}><Title text={S.world} col={C.white} size={lang === 'ru' ? 52 : 58} /></At>
			</Win>
			{/* 7 */}
			<Win a={ch[6]} b={ch[7]}>
				<At x={540} y={260} s={pop(t, K.song - 0.4)}><Title text={S.song} col={C.white} size={lang === 'ru' ? 58 : 70} glow={C.red} /></At>
				<At x={540} y={380} s={pop(t, K.trucks - 0.4)}><Pill text={S.y1995} bg={C.red} fg="#fff" size={38} /></At>
				{[0, 1, 2].map((i) => {const x = -500 + ((t - ch[6]) * 140 + i * 420) % 2200; return <At key={i} x={x} y={820} s={1}><Truck w={460} t={t} ph={i} /></At>;})}
				<At x={540} y={1200} s={pop(t, K.countries - 0.4)}><Card w={680} col={C.gold} top={S.c100[1]} big={S.c100[0]} /></At>
			</Win>
			{/* 8 */}
			<Win a={ch[7]} b={ch[8]} last>
				<At x={540} y={300} s={pop(t, K.b2 - 0.4)} o={cta}><Counter k={P(t, K.b2 - 0.3, K.b2 + 1)} to={2.2} fmt={S.b2} col={C.white} size={lang === 'ru' ? 110 : 96} /></At>
				<At x={540} y={410} s={pop(t, K.b2 + 0.4)} o={cta}><Txt text={S.b2sub} col={C.red} size={44} /></At>
				<At x={540} y={880} o={cta}><Bottle3D w={800} h={900} t={t} glow={0.9} /></At>
				<At x={540} y={1320} s={pop(t, K.nine2 - 0.6)} o={cta}><Pill text={S.end} bg={C.white} size={lang === 'ru' ? 34 : 38} /></At>
			</Win>
			<At x={540} y={1478}><CapRow years={S.years} pos={pos} o={P(t, ch[1], ch[1] + 0.6) * cta} size={110} /></At>
			<Brand S={S} />
			<CTA K={K} S={S} />
			<Captions captions={data.captions} />
			<Audio src={staticFile('music.mp3')} volume={(f) => 0.14 * Math.min(1, f / 30) * Math.min(1, (dur * FPS - f) / 75)} />
			<Sequence from={15} layout="none"><Audio src={staticFile(`${lang}/voice.mp3`)} volume={1.1} /></Sequence>
			{sfx('fizz.mp3', 0.3, 0.32, 'fz')}
			{sfx('pour.mp3', K.nine - 1.2, 0.28, 'po')}
			{sfx('register.mp3', K.dollar - 0.1, 0.3, 're')}
			{sfx('bells.mp3', K.trucks - 0.2, 0.3, 'be')}
		</AbsoluteFill>
	);
};
