import React from 'react';
import {AbsoluteFill, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Audio} from '@remotion/media';
import {loadFont} from '@remotion/fonts';
import {Balance, Career, DealMeter, Finale, Hook, Kiosk, Ladder, Myth, Receipt} from './Scenes';
import {CTA} from './CTA';
import {Captions} from './Captions';
import {STR} from './strings';
import {C, DISPLAY, FPS, P, eout} from './ui';

for (const [f, w] of [['InterDisplay-Black.otf', '900'], ['InterDisplay-ExtraBold.otf', '800']]) loadFont({family: 'Inter Display', url: staticFile('fonts/' + f), weight: w});
for (const [f, w] of [['Inter-Bold.otf', '700'], ['Inter-ExtraBold.otf', '800']]) loadFont({family: 'Inter', url: staticFile('fonts/' + f), weight: w});

export const chapters = (data: any) => {const ch = [0]; for (let s = 2; s <= 8; s++) ch.push(data.segs.find((x: any) => x.s === s).t0 - 0.35); ch.push(data.dur); return ch;};

const Background: React.FC<{lang: string}> = ({lang}) => {
	const t = useCurrentFrame() / FPS;
	const sym = lang === 'ru' ? '₽' : '$';
	return (
		<AbsoluteFill style={{background: 'linear-gradient(180deg,#04110c 0%,#0a2219 45%,#0b1a17 75%,#040b09 100%)'}}>
			<AbsoluteFill style={{backgroundImage: 'linear-gradient(rgba(150,255,200,.035) 2px, transparent 2px), linear-gradient(90deg, rgba(150,255,200,.035) 2px, transparent 2px)', backgroundSize: '60px 60px'}} />
			<div style={{position: 'absolute', left: 540 + 160 * Math.sin(t * 0.2) - 650, top: 820 - 650, width: 1300, height: 1300, background: `radial-gradient(circle, ${C.green}1f, transparent 60%)`}} />
			{Array.from({length: 18}).map((_, i) => {
				const x = (i * 197) % 1080, y = ((i * 431 - t * (18 + (i % 4) * 6)) % 2100 + 2100) % 2100 - 100;
				return <div key={i} style={{position: 'absolute', left: x, top: y, transform: `rotate(${(i % 5) * 9 - 18}deg)`, padding: '6px 14px', borderRadius: 8, border: '2px solid rgba(160,255,210,.09)', color: 'rgba(160,255,210,.09)', fontFamily: DISPLAY, fontWeight: 900, fontSize: 30}}>{sym}{(i * 37) % 900 + 49}</div>;
			})}
		</AbsoluteFill>
	);
};
const Header: React.FC<{S: any; ch: number[]; dur: number}> = ({S, ch, dur}) => {
	const t = useCurrentFrame() / FPS;
	const n = Math.min(8, ch.findIndex((c, i) => t >= c && t < ch[i + 1]) + 1 || 8);
	return (
		<>
			<div style={{position: 'absolute', left: 48, top: 56, width: 984, height: 8, borderRadius: 4, background: 'rgba(255,255,255,.12)'}}>
				<div style={{width: `${P(t, 0, dur) * 100}%`, height: 8, borderRadius: 4, background: `linear-gradient(90deg, ${C.green}, ${C.gold}, ${C.red})`, boxShadow: `0 0 12px ${C.green}`}} />
			</div>
			<div style={{position: 'absolute', left: 48, top: 88, fontFamily: DISPLAY, fontWeight: 800, fontSize: 30, color: 'rgba(244,255,248,.78)'}}>{S.head}</div>
			<div style={{position: 'absolute', right: 48, top: 88, fontFamily: DISPLAY, fontWeight: 800, fontSize: 30, color: C.green}}>{`0${n} / 08`}</div>
		</>
	);
};
// scene window with zoom-in transition (scenes use absolute time, so no <Sequence> wrapper)
const Win: React.FC<{a: number; b: number; children: React.ReactNode; last?: boolean}> = ({a, b, children, last}) => {
	const t = useCurrentFrame() / FPS;
	if (t < a - 0.3 || t > b + 0.3) return null;
	const i = eout(P(t, a - 0.25, a + 0.3)), o = last ? 1 : 1 - P(t, b - 0.2, b + 0.15);
	return <AbsoluteFill style={{opacity: i * o, transform: `scale(${1.06 - 0.06 * i + 0.04 * (1 - o)})`}}>{children}</AbsoluteFill>;
};
const sfx = (src: string, at: number, vol: number, key: string) => <Sequence key={key} from={Math.max(0, Math.round(at * FPS))} layout="none"><Audio src={staticFile('sfx/' + src)} volume={vol} /></Sequence>;

export const ShopVideo: React.FC<{lang: 'ru' | 'en'; data: any}> = ({lang, data}) => {
	const S = STR[lang], K = data.k, ch = chapters(data), dur = data.dur;
	const t = useCurrentFrame() / FPS;
	const marks = [0.12, 0.2, 0.45, 0.62, 0.78, 0.86, 0.92, 1.0];
	const ci = Math.max(0, ch.findIndex((c, i) => t >= c && t < ch[i + 1]));
	const v = marks[Math.max(0, ci - 1)] + (marks[ci] - marks[Math.max(0, ci - 1)]) * eout(P(t, ch[ci], ch[ci] + 1.2));
	const meterO = P(t, 1.0, 1.6) * (K.cta !== undefined ? 1 - P(t, K.cta - 0.4, K.cta) : 1);
	return (
		<AbsoluteFill style={{background: '#04110c'}}>
			<Background lang={lang} />
			<Win a={0} b={ch[1]}><Hook K={K} S={S} /></Win>
			<Win a={ch[1]} b={ch[2]}><Myth K={K} S={S} /></Win>
			<Win a={ch[2]} b={ch[3]}><Ladder K={K} S={S} /></Win>
			<Win a={ch[3]} b={ch[4]}><Career K={K} S={S} /></Win>
			<Win a={ch[4]} b={ch[5]}><Balance K={K} S={S} t0={ch[4]} /></Win>
			<Win a={ch[5]} b={ch[6]}><Receipt K={K} S={S} /></Win>
			<Win a={ch[6]} b={ch[7]}><Kiosk K={K} S={S} /></Win>
			<Win a={ch[7]} b={ch[8]} last><Finale K={K} S={S} t0={ch[7]} /></Win>
			<DealMeter v={v} o={meterO} S={S} />
			<Header S={S} ch={ch} dur={dur} />
			<CTA K={K} S={S} />
			<Captions captions={data.captions} />
			<Audio src={staticFile('music.mp3')} volume={(f) => 0.14 * Math.min(1, f / 30) * Math.min(1, (dur * FPS - f) / 75)} />
			<Sequence from={15} layout="none"><Audio src={staticFile(`${lang}/voice.mp3`)} volume={1.1} /></Sequence>
			{sfx('kaching.mp3', K.m - 0.2, 0.35, 'k1')}{sfx('kaching.mp3', K.y - 0.2, 0.35, 'k2')}
			{sfx('alarm.mp3', K.risk - 0.3, 0.25, 'al')}{sfx('stamp.mp3', K.record - 0.2, 0.45, 'st1')}
			{sfx('ring.mp3', K.half - 0.4, 0.3, 'rg')}{sfx('coins.mp3', K.burn, 0.35, 'cn')}
			{sfx('beep.mp3', K.kiosk + 0.3, 0.3, 'b1')}{sfx('beep.mp3', K.kiosk + 1.1, 0.3, 'b2')}
			{sfx('crash.mp3', ch[7] + 0.3, 0.3, 'cr')}{sfx('stamp.mp3', K.deal - 0.05, 0.5, 'st2')}
			{[K.myth + 0.3, K.one11 - 0.2, K.fine - 0.3, K.crim - 0.3, K.everyone - 0.3, K.pct - 0.3, K.p22 - 0.3, K.kop - 0.3, K.future - 0.3].map((k: number, i: number) => sfx('pop.mp3', k, 0.28, 'p' + i))}
			{K.cta !== undefined ? <>{sfx('pop.mp3', K.cta + 1.1, 0.45, 'tap')}{sfx('kaching.mp3', K.cta + 2.0, 0.3, 'like')}</> : null}
		</AbsoluteFill>
	);
};
