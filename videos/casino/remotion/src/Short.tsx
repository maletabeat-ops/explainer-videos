import React from 'react';
import {AbsoluteFill, Img, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Audio} from '@remotion/media';
import {loadFont} from '@remotion/fonts';
import {PocketStrip, Roulette3D, SimChart, Slot, Streak} from './Comps';
import {CTA} from './CTA';
import {Captions} from './Captions';
import {STR} from './strings';
import {At, Badge, BODY, C, DISPLAY, FPS, P, Pill, Title, eout, pop} from './ui';

for (const [f, w] of [['InterDisplay-Black.otf', '900'], ['InterDisplay-ExtraBold.otf', '800']]) loadFont({family: 'Inter Display', url: staticFile('fonts/' + f), weight: w});
for (const [f, w] of [['Inter-Bold.otf', '700'], ['Inter-ExtraBold.otf', '800']]) loadFont({family: 'Inter', url: staticFile('fonts/' + f), weight: w});

export const chapters = (data: any, n = 8) => {const ch = [0]; for (let s = 2; s <= n; s++) ch.push(data.segs.find((x: any) => x.s === s).t0 - 0.35); ch.push(data.dur); return ch;};
export const CasinoBg: React.FC = () => {
	const t = useCurrentFrame() / FPS;
	return (
		<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 35%, #3a0d1c 0%, #1c0610 55%, #0a0306 100%)'}}>
			<AbsoluteFill style={{backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,201,77,.035) 0 2px, transparent 2px 46px), repeating-linear-gradient(-45deg, rgba(255,201,77,.035) 0 2px, transparent 2px 46px)'}} />
			{Array.from({length: 14}).map((_, i) => {
				const x = (i * 283) % 100, y = (i * 571) % 100, r = 90 + (i % 4) * 50;
				return <div key={i} style={{position: 'absolute', left: `${x}%`, top: `${y}%`, width: r, height: r, marginLeft: -r / 2, marginTop: -r / 2, borderRadius: '50%', background: [C.gold, C.red, C.violet][i % 3], opacity: 0.05 + 0.04 * Math.sin(t * 0.8 + i), filter: 'blur(30px)'}} />;
			})}
		</AbsoluteFill>
	);
};
const Brand: React.FC<{S: any}> = ({S}) => (
	<div style={{position: 'absolute', left: 44, top: 52, display: 'flex', alignItems: 'center', gap: 16}}>
		<Img src={staticFile(S.logo)} style={{width: 72, height: 72, borderRadius: 36, border: '3px solid rgba(255,201,77,.7)', boxShadow: '0 0 18px rgba(255,201,77,.4)'}} />
		<div style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 32, color: 'rgba(255,246,234,.9)', textShadow: '0 2px 10px rgba(0,0,0,.6)'}}>{S.handle}</div>
	</div>
);
const Win: React.FC<{a: number; b: number; children: React.ReactNode; last?: boolean}> = ({a, b, children, last}) => {
	const t = useCurrentFrame() / FPS;
	if (t < a - 0.3 || t > b + 0.3) return null;
	const i = eout(P(t, a - 0.25, a + 0.3)), o = last ? 1 : 1 - P(t, b - 0.2, b + 0.15);
	return <AbsoluteFill style={{opacity: i * o, transform: `scale(${1.05 - 0.05 * i})`}}>{children}</AbsoluteFill>;
};
const sfx = (src: string, at: number, vol: number, key: string) => <Sequence key={key} from={Math.max(0, Math.round(at * FPS))} layout="none"><Audio src={staticFile('sfx/' + src)} volume={vol} /></Sequence>;

export const CasinoShort: React.FC<{lang: 'ru' | 'en'; data: any}> = ({lang, data}) => {
	const S = STR[lang], K = data.k, ch = chapters(data), dur = data.dur;
	const t = useCurrentFrame() / FPS;
	const meterO = P(t, ch[2], ch[2] + 0.6) * (K.cta !== undefined ? 1 - P(t, K.cta - 0.4, K.cta) : 1);
	return (
		<AbsoluteFill>
			<CasinoBg />
			<Win a={0} b={ch[1]}>
				<At x={540} y={240} s={pop(t, 0.1)}><Title text={S.t1} col="#fff" size={88} /></At>
				<At x={540} y={340} s={pop(t, 0.35)}><Title text={S.t2} col={C.gold} size={74} glow={C.gold} /></At>
				<AbsoluteFill style={{top: 380}}><Roulette3D t={t} w={1080} h={900} land={99} glow={0} /></AbsoluteFill>
				<At x={540} y={1300} s={pop(t, K.cheat - 0.3)} rot={-3}><Badge text={S.cheat} col={C.red} size={46} /></At>
				<At x={540} y={1420} s={pop(t, K.math - 0.3)}><Pill text={S.math} bg={C.gold} size={42} /></At>
			</Win>
			<Win a={ch[1]} b={ch[2]}>
				<AbsoluteFill style={{top: 170}}><Roulette3D t={t} w={1080} h={860} land={99} glow={0} tilt={1.05} dist={12} /></AbsoluteFill>
				<At x={540} y={1080} s={pop(t, K.p37 - 0.4)}><PocketStrip t={t} t0={K.p37 - 0.4} zeroGlow={P(t, K.zero - 0.2, K.zero + 0.3)} w={980} /></At>
				<At x={540} y={1240} s={pop(t, K.p37)}>
					<div style={{display: 'flex', gap: 34}}>{S.cnt.map(([n, l, c]: string[], i: number) => <div key={i} style={{display: 'flex', alignItems: 'center', gap: 12, opacity: Math.min(1, pop(t, K.p37 + i * 0.5))}}><div style={{width: 40, height: 40, borderRadius: 20, background: c, border: '3px solid rgba(255,255,255,.5)'}} /><div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 44, color: C.cream}}>{n}</div><div style={{fontFamily: BODY, fontWeight: 700, fontSize: 30, color: C.mute}}>{l}</div></div>)}</div>
				</At>
				<At x={540} y={1400} s={pop(t, K.red - 0.3)}><Pill text={S.even} bg={C.red} size={40} fg="#fff" /></At>
			</Win>
			<Win a={ch[2]} b={ch[3]}>
				<AbsoluteFill style={{top: 170}}><Roulette3D t={t} w={1080} h={900} land={K.green + 0.2} glow={P(t, K.green, K.green + 0.5)} tilt={1.1} dist={11.5} /></AbsoluteFill>
				<At x={540} y={1180} s={pop(t, K.edge - 0.3)}><Title text={S.edge} col={C.red} size={170} glow={C.red} /></At>
				<At x={540} y={1330} s={pop(t, K.edge + 0.3)}><div style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 40, color: C.cream}}>{S.edgeSub}</div></At>
			</Win>
			<Win a={ch[3]} b={ch[4]}>
				<At x={540} y={260} s={pop(t, K.luck - 0.3)}><Pill text={S.luck} bg={C.cream} size={38} /></At>
				<At x={540} y={800} s={pop(t, ch[3] + 0.1)}>
					<div style={{padding: 30, borderRadius: 30, background: 'rgba(20,6,10,.85)', border: '3px solid rgba(255,201,77,.4)'}}><SimChart k={eout(P(t, ch[3] + 0.2, K.books + 0.5))} w={900} h={720} houseLabel={S.house} playerLabel={S.players} houseOn={P(t, K.millions - 0.3, K.millions + 0.4)} /></div>
				</At>
				<At x={540} y={1340} s={pop(t, K.books - 0.4)}><Badge text={S.books} col={C.gold} size={36} /></At>
			</Win>
			<Win a={ch[4]} b={ch[5]}>
				<At x={540} y={720} s={pop(t, ch[4] + 0.1)}><Slot t={t} t0={ch[4] + 0.2} stops={[1.2, 1.7, 2.2]} final={[0, 2, 3]} size={220} /></At>
				<At x={540} y={1170} s={pop(t, K.p75 - 0.3)}><Title text={S.p75} col={C.red} size={150} glow={C.red} /></At>
				<At x={540} y={1310} s={pop(t, K.p75 + 0.3)}><div style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 38, color: C.cream}}>{S.p75sub}</div></At>
			</Win>
			<Win a={ch[5]} b={ch[6]}>
				<At x={540} y={260} s={pop(t, K.near - 0.4)}><Badge text={S.near} col={C.gold} size={56} /></At>
				<At x={540} y={720} s={1}><Slot t={t} t0={ch[5] + 0.1} stops={[0.8, 1.3, 2.4]} final={[1, 6, 1]} nearMiss size={220} flash={P(t, K.brain, K.brain + 0.3) * (0.5 + 0.5 * Math.sin(t * 12))} /></At>
				<At x={540} y={1180} s={pop(t, K.brain - 0.3)}><Pill text={S.brain} bg={C.violet} size={40} fg="#fff" /></At>
				<At x={540} y={1340} s={pop(t, K.again - 0.3) * (1 + 0.05 * Math.sin(t * 10))}><Pill text={S.again} bg={C.red} size={48} fg="#fff" /></At>
			</Win>
			<Win a={ch[6]} b={ch[7]}>
				<At x={540} y={260} s={pop(t, K.monte - 0.4)}><Badge text={S.monte} col={C.gold} size={52} /></At>
				<At x={540} y={720} s={pop(t, K.monte)}><Streak t={t} t0={K.monte} n={26} cols={6} size={115} perSec={26 / Math.max(1, K.p26 - K.monte + 0.3)} /></At>
				<At x={540} y={1180} s={pop(t, K.p26 - 0.2)}><Pill text={S.p26} bg="#1b1b1b" size={42} fg={C.gold} /></At>
				<At x={330} y={1330} s={pop(t, K.bet - 0.3)}><Pill text={S.bet} bg={C.red} size={34} fg="#fff" /></At>
				<At x={790} y={1330} s={pop(t, K.lost - 0.3)} rot={-4}><Badge text={S.lost} col={C.red} size={44} /></At>
			</Win>
			<Win a={ch[7]} b={ch[8]} last>
				<AbsoluteFill style={{top: 520}}><Roulette3D t={t} w={1080} h={860} land={ch[7] + 2.0} glow={P(t, ch[7] + 2.0, ch[7] + 2.5)} /></AbsoluteFill>
				<At x={540} y={250} s={pop(t, K.noCheat - 0.5)}><Title text={S.fin1} col="#fff" size={56} /></At>
				<At x={540} y={350} s={pop(t, K.longer - 0.8)}><Title text={S.fin2} col={C.gold} size={72} glow={C.gold} /></At>
				<At x={540} y={440} s={pop(t, K.longer - 0.4)}><Title text={S.fin3} col={C.gold} size={86} glow={C.gold} /></At>
			</Win>
			{meterO > 0 ? <At x={540} y={1500} o={meterO}><div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '10px 24px', borderRadius: 999, background: 'rgba(20,6,10,.85)', border: `2px solid ${C.gold}`}}><div style={{width: 22, height: 22, borderRadius: 11, background: C.felt}} /><div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 28, color: C.cream}}>{S.meter}</div><div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 30, color: C.gold}}>{S.edge.replace('−', '+')}</div></div></At> : null}
			<Brand S={S} />
			<CTA K={K} S={S} />
			<Captions captions={data.captions} />
			<Audio src={staticFile('music.mp3')} volume={(f) => 0.14 * Math.min(1, f / 30) * Math.min(1, (dur * FPS - f) / 75)} />
			<Sequence from={15} layout="none"><Audio src={staticFile(`${lang}/voice.mp3`)} volume={1.1} /></Sequence>
			{sfx('spin.mp3', 0.6, 0.3, 'sp')}{sfx('chips.mp3', K.red - 0.2, 0.4, 'ch')}{sfx('drop.mp3', K.green, 0.45, 'dr')}
			{sfx('reels.mp3', ch[4] + 0.2, 0.35, 'r1')}{sfx('reels.mp3', ch[5] + 0.1, 0.35, 'r2')}{sfx('card.mp3', K.p26 - 0.2, 0.3, 'cd')}{sfx('gasp.mp3', K.lost - 0.4, 0.35, 'gs')}
			{sfx('drop.mp3', ch[7] + 1.7, 0.35, 'dr2')}
			{[K.cheat, K.math, K.p37, K.edge, K.books, K.p75, K.brain, K.again, K.monte, K.bet].map((k: number, i: number) => sfx('pop.mp3', k - 0.3, 0.28, 'p' + i))}
			{K.cta !== undefined ? <>{sfx('pop.mp3', K.cta + 1.1, 0.45, 'tap')}{sfx('jackpot.mp3', K.cta + 2.0, 0.25, 'like')}</> : null}
		</AbsoluteFill>
	);
};
