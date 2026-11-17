import React from 'react';
import {AbsoluteFill, Img, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Audio} from '@remotion/media';
import {loadFont} from '@remotion/fonts';
import {Callout, Cam, Restaurant3D, Show} from './Comps';
import {CTA} from './CTA';
import {Captions} from './Captions';
import {STR} from './strings';
import {At, BODY, C, DISPLAY, FPS, P, Title, eio, pop} from './ui';

for (const [f, w] of [['InterDisplay-Black.otf', '900'], ['InterDisplay-ExtraBold.otf', '800']]) loadFont({family: 'Inter Display', url: staticFile('fonts/' + f), weight: w});
for (const [f, w] of [['Inter-Bold.otf', '700'], ['Inter-ExtraBold.otf', '800']]) loadFont({family: 'Inter', url: staticFile('fonts/' + f), weight: w});

export const chapters = (data: any, n = 8) => {const ch = [0]; for (let s = 2; s <= n; s++) ch.push(data.segs.find((x: any) => x.s === s).t0 - 0.35); ch.push(data.dur); return ch;};
const Brand: React.FC<{S: any}> = ({S}) => (
	<div style={{position: 'absolute', left: 44, top: 52, display: 'flex', alignItems: 'center', gap: 16}}>
		<Img src={staticFile(S.logo)} style={{width: 72, height: 72, borderRadius: 36, border: `3px solid ${C.amber}cc`, boxShadow: `0 0 18px ${C.amber}66`}} />
		<div style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 32, color: 'rgba(255,246,236,.92)', textShadow: '0 2px 10px rgba(0,0,0,.6)'}}>{S.handle}</div>
	</div>
);
export const sfx = (src: string, at: number, vol: number, key: string) => <Sequence key={key} from={Math.max(0, Math.round(at * FPS))} layout="none"><Audio src={staticFile('sfx/' + src)} volume={vol} /></Sequence>;
const lerp3 = (a: number[], b: number[], k: number) => a.map((v, i) => v + (b[i] - v) * k) as [number, number, number];
export const Card: React.FC<{w: number; col: string; top: string; big: string; sub?: string}> = ({w, col, top, big, sub}) => (
	<div style={{width: w, padding: 22, borderRadius: 24, background: 'rgba(18,10,18,.92)', border: `3px solid ${col}`, boxShadow: `0 0 26px ${col}44`, boxSizing: 'border-box', textAlign: 'center', whiteSpace: 'normal'}}>
		<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 30, color: col}}>{top}</div>
		<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 50, color: C.white, lineHeight: 1.15}}>{big}</div>
		{sub ? <div style={{fontFamily: BODY, fontWeight: 700, fontSize: 28, color: C.mute, marginTop: 6}}>{sub}</div> : null}
	</div>
);

export const showAt = (t: number, K: any): Show => ({
	knock: P(t, K.knock, K.knock + 0.8), roof: P(t, K.knock + 0.4, K.knock + 2.0), pot: P(t, K.pot - 0.4, K.pot + 0.2), stew: 1 - P(t, K.late - 0.2, K.late + 0.8),
	coin: P(t, K.coin - 0.2, K.coin + 1.0), table: P(t, K.ten - 0.7, K.ten - 0.1), stools: P(t, K.ten - 0.2, K.ten + 0.8),
	dishes: P(t, K.dishes - 0.3, K.dishes + 1.2), board: P(t, K.board - 0.3, K.board + 1.6), shake: P(t, K.elbows - 0.3, K.elbows + 1.4), split: P(t, K.saw, K.saw + 1.6), plates: P(t, K.plate - 0.3, K.plate + 0.3),
	smoke: P(t, K.burn - 0.4, K.burn + 0.2) * (1 - P(t, K.wall + 1, K.wall + 2.5)), wall: P(t, K.wall - 0.2, K.wall + 1.0), window: P(t, K.window - 0.2, K.window + 0.3), tray: P(t, K.window + 0.6, K.window + 1.0),
	prices: P(t, K.price - 0.2, K.price + 1.2), bill: P(t, K.bill - 0.3, K.bill + 0.2), sign: P(t, K.sign - 0.3, K.sign + 1.2), lamps: P(t, K.congrats - 0.5, K.congrats + 1), steam: P(t, K.soup - 0.5, K.soup + 0.5),
});
export const camAt = (t: number, ch: number[], cams: Cam[], orbitFrom: number) => {
	let c = 0; while (c < cams.length - 1 && t >= ch[c + 1]) c++;
	const k = c === 0 ? 1 : eio(P(t, ch[c], ch[c] + 1.4));
	let cam: Cam = {p: lerp3(cams[Math.max(0, c - 1)].p, cams[c].p, k), l: lerp3(cams[Math.max(0, c - 1)].l, cams[c].l, k)};
	if (c >= orbitFrom) {const f = cams[orbitFrom]; const r = Math.hypot(f.p[0], f.p[2]); const a0 = Math.atan2(f.p[0], f.p[2]); const a = a0 + 0.12 * Math.sin((t - ch[orbitFrom]) * 0.12); const o: Cam = {p: [Math.sin(a) * r, f.p[1], Math.cos(a) * r], l: f.l}; cam = c === orbitFrom && k < 1 ? {p: lerp3(cams[c - 1].p, o.p, k), l: lerp3(cams[c - 1].l, o.l, k)} : o;}
	// slow push-in inside each chapter for life
	const d = 1 - 0.04 * P(t, ch[c], ch[c + 1] ?? t + 1);
	return {p: lerp3(cam.l, cam.p, d), l: cam.l} as Cam;
};
export const CAMS: Cam[] = [
	{p: [4.6, 3.0, 13.5], l: [0, 1.3, 0.5]},
	{p: [2.2, 7.5, 9.5], l: [0, 0.4, -0.2]},
	{p: [-0.5, 6.0, 8.2], l: [-0.85, 0.8, 0.1]},
	{p: [0.01, 12.5, 3.2], l: [0, 0, 0]},
	{p: [2.8, 5.8, 4.4], l: [0.1, 0.7, -1.3]},
	{p: [0.2, 4.8, 7.6], l: [-1.05, 1.0, 1.1]},
	{p: [3.0, 6.8, 14.5], l: [-0.9, 1.1, 0.7]},
	{p: [3.0, 6.8, 14.5], l: [-0.9, 1.1, 0.7]},
];

export const RestShort: React.FC<{lang: 'ru' | 'en'; data: any}> = ({lang, data}) => {
	const S = STR[lang], K = data.k, ch = chapters(data), dur = data.dur;
	const t = useCurrentFrame() / FPS;
	const cam = camAt(t, ch, CAMS, 6), show = showAt(t, K);
	const cta = K.cta !== undefined ? 1 - P(t, K.cta - 0.4, K.cta) : 1;
	const C1 = (at: number, until: number, x: number, y: number, text: string, col?: string, size?: number) => t > at - 0.3 && t < until ? <At key={text + at} x={x} y={y} s={pop(t, at - 0.3)} o={1 - P(t, until - 0.3, until)}><Callout text={text} col={col} size={size} /></At> : null;
	return (
		<AbsoluteFill style={{background: C.navy}}>
			<AbsoluteFill><Restaurant3D w={1080} h={1920} t={t} cam={cam} show={show} signText={S.signText} /></AbsoluteFill>
			{C1(K.road - 0.2, ch[1], 540, 330, S.road, C.white)}
			{C1(K.hungry, ch[1], 540, 440, S.hungry, C.red)}
			{t > K.where - 0.4 && t < ch[1] ? <At x={540} y={590} s={pop(t, K.where - 0.3)} o={1 - P(t, ch[1] - 0.3, ch[1])}><Title text={S.where} col={C.amber} size={lang === 'ru' ? 96 : 84} glow={C.amber} /></At> : null}
			{C1(K.pot, ch[2], 540, 330, S.pot, C.amber)}
			{C1(K.coin, ch[2], 540, 440, S.coin, C.gold)}
			{C1(K.ten, ch[2], 540, 550, S.ten, C.white)}
			{C1(K.longtable, ch[2], 540, 660, S.longtable, C.amber)}
			{C1(K.late, K.dishes, 540, 330, S.late, C.red)}
			{C1(K.hate, K.dishes, 540, 440, S.hate, C.red)}
			{C1(K.dishes, ch[3], 540, 330, S.dishes, C.gold)}
			{C1(K.board, ch[3], 540, 440, S.board, C.white)}
			{C1(K.elbows, K.saw, 540, 330, S.elbows, C.red)}
			{C1(K.saw, ch[4], 540, 330, S.saw, C.amber)}
			{C1(K.plate, ch[4], 540, 440, S.plate, C.white)}
			{C1(K.burn, K.wall, 540, 330, S.burn, C.red)}
			{C1(K.wall, ch[5], 540, 330, S.wall, C.white)}
			{C1(K.kitchen, ch[5], 330, 440, S.kitchen, C.amber)}
			{C1(K.hall, ch[5], 750, 440, S.hall, C.gold)}
			{C1(K.window, ch[5], 540, 550, S.window, C.amber)}
			{C1(K.money, K.price, 540, 330, S.money, C.red)}
			{C1(K.price, ch[6], 540, 330, S.price, C.amber)}
			{C1(K.bill, ch[6], 540, 440, S.bill, C.white)}
			{C1(K.sign, ch[6], 540, 550, S.sign, C.gold)}
			{/* reveal */}
			{t > K.congrats - 0.4 ? <>
				<At x={540} y={270} s={pop(t, K.congrats - 0.3)} o={cta}><Title text={S.reveal1} col={C.white} size={lang === 'ru' ? 84 : 80} /></At>
				<At x={540} y={385} s={pop(t, K.congrats + 0.7, 0.6)} o={cta}><Title text={S.reveal2} col={C.amber} size={lang === 'ru' ? 128 : 100} glow={C.amber} /></At>
				<At x={540} y={1300} s={pop(t, K.paris - 0.4)} o={(1 - P(t, K.twist - 0.5, K.twist - 0.2)) * cta}><Card w={820} col={C.amber} top={S.paris[0]} big={S.paris[1]} sub={S.paris[2]} /></At>
				<At x={540} y={1300} s={pop(t, K.twist - 0.3)} o={cta}><Card w={820} col={C.red} top={S.china[0]} big={S.china[1]} sub={S.china[2]} /></At>
			</> : null}
			<Brand S={S} />
			<CTA K={K} S={S} />
			<Captions captions={data.captions} />
			<Audio src={staticFile('music.mp3')} volume={(f) => 0.13 * Math.min(1, f / 30) * Math.min(1, (dur * FPS - f) / 75)} />
			<Sequence from={15} layout="none"><Audio src={staticFile(`${lang}/voice.mp3`)} volume={1.1} /></Sequence>
			{sfx('knock.mp3', K.knock - 0.1, 0.4, 'kn')}
			{sfx('coin.mp3', K.coin + 0.5, 0.35, 'co')}
			{sfx('chalk.mp3', K.board, 0.3, 'chk')}
			{sfx('saw.mp3', K.saw - 0.1, 0.3, 'sw')}
			{sfx('plates.mp3', K.window + 0.6, 0.3, 'pl')}
		</AbsoluteFill>
	);
};
