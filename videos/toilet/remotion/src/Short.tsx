import React from 'react';
import {AbsoluteFill, Img, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Audio} from '@remotion/media';
import {loadFont} from '@remotion/fonts';
import {Callout, Cam, Toilet3D, track} from './Comps';
import {CTA} from './CTA';
import {Captions} from './Captions';
import {STR} from './strings';
import {At, BODY, C, DISPLAY, FPS, P, Title, eio, pop} from './ui';

for (const [f, w] of [['InterDisplay-Black.otf', '900'], ['InterDisplay-ExtraBold.otf', '800']]) loadFont({family: 'Inter Display', url: staticFile('fonts/' + f), weight: w});
for (const [f, w] of [['Inter-Bold.otf', '700'], ['Inter-ExtraBold.otf', '800']]) loadFont({family: 'Inter', url: staticFile('fonts/' + f), weight: w});

export const chapters = (data: any, n = 8) => {const ch = [0]; for (let s = 2; s <= n; s++) ch.push(data.segs.find((x: any) => x.s === s).t0 - 0.35); ch.push(data.dur); return ch;};
const Brand: React.FC<{S: any}> = ({S}) => (
	<div style={{position: 'absolute', left: 44, top: 52, display: 'flex', alignItems: 'center', gap: 16}}>
		<Img src={staticFile(S.logo)} style={{width: 72, height: 72, borderRadius: 36, border: `3px solid ${C.aqua}cc`, boxShadow: `0 0 18px ${C.aqua}66`}} />
		<div style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 32, color: 'rgba(244,251,255,.92)', textShadow: '0 2px 10px rgba(0,0,0,.6)'}}>{S.handle}</div>
	</div>
);
export const sfx = (src: string, at: number, vol: number, key: string) => <Sequence key={key} from={Math.max(0, Math.round(at * FPS))} layout="none"><Audio src={staticFile('sfx/' + src)} volume={vol} /></Sequence>;
const lerp3 = (a: number[], b: number[], k: number) => a.map((v, i) => v + (b[i] - v) * k) as [number, number, number];
export const Card: React.FC<{w: number; col: string; top: string; big: string; sub?: string}> = ({w, col, top, big, sub}) => (
	<div style={{width: w, padding: 20, borderRadius: 24, background: 'rgba(6,18,26,.9)', border: `3px solid ${col}`, boxShadow: `0 0 26px ${col}44`, boxSizing: 'border-box', textAlign: 'center', whiteSpace: 'normal'}}>
		<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 30, color: col}}>{top}</div>
		<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 46, color: C.white, lineHeight: 1.15}}>{big}</div>
		{sub ? <div style={{fontFamily: BODY, fontWeight: 700, fontSize: 24, color: C.mute, marginTop: 4}}>{sub}</div> : null}
	</div>
);

// shared scene state (short + long use the same keys where they exist)
export const toiletState = (t: number, K: any, ch: number[], cams: Cam[], orbitFrom: number) => {
	let c = 0; while (c < cams.length - 1 && t >= ch[c + 1]) c++;
	const k = c === 0 ? 1 : eio(P(t, ch[c], ch[c] + 1.4));
	let cam: Cam = {p: lerp3(cams[Math.max(0, c - 1)].p, cams[c].p, k), l: lerp3(cams[Math.max(0, c - 1)].l, cams[c].l, k)};
	if (c >= orbitFrom) {const a = 0.55 + 0.45 * Math.sin((t - ch[orbitFrom]) * 0.18); const kk = eio(P(t, ch[orbitFrom], ch[orbitFrom] + 1.6)); const o: Cam = {p: [Math.sin(a) * 8.5, 1.4, Math.cos(a) * 8.5], l: [0.4, 0, 0]}; const f = cams[orbitFrom - 1]; cam = {p: lerp3(f.p, o.p, kk), l: lerp3(f.l, o.l, kk)};}
	const show = {pipe: P(t, K.pipe - 0.3, K.pipe + 0.6), trap: P(t, K.bend - 0.2, K.bend + 1.6), tank: P(t, K.tank - 0.3, K.tank + 0.3), chain: P(t, K.pull - 1.0, K.pull - 0.2), supply: P(t, K.supply - 0.3, K.supply + 0.6), float: P(t, K.float - 0.3, K.float + 0.3), bowl: P(t, K.bowl - 0.3, K.bowl + 0.9), seat: P(t, K.seat - 0.3, K.seat + 0.4)};
	const bucketX = track(t, [[K.bucket - 0.3, 0], [K.bucket + 1.4, -2.2], [K.auto - 0.6, -2.2], [K.auto + 0.6, 0]]);
	const stink = P(t, K.smell - 0.4, K.smell + 0.2) * (1 - P(t, K.plug - 0.6, K.plug));
	const f1 = P(t, K.pull, K.pull + 2.4), f2 = K.congrats !== undefined ? P(t, K.congrats + 0.4, K.congrats + 2.8) : 0;
	const flush = f1 > 0 && f1 < 1 ? f1 : f2 > 0 && f2 < 1 ? f2 : 0;
	const level = t < K.pull + 0.1 ? 1 : t < K.supply + 0.4 ? 1 - P(t, K.pull + 0.1, K.pull + 1.2) : P(t, K.supply + 0.4, K.float + 2.2) * (f2 > 0 && f2 < 1 ? 1 - Math.sin(f2 * Math.PI) * 0.8 : 1);
	return {cam, show, bucketX, stink, flush, level, c};
};

const CAMS: Cam[] = [
	{p: [3, 1.6, 9.5], l: [-0.6, 0.6, 0]},
	{p: [4.5, -0.6, 11], l: [0.9, -1.2, 0]},
	{p: [2.4, -0.2, 5.4], l: [0.35, -0.6, 0]},
	{p: [3, 1.1, 9], l: [0, 1.2, 0]},
	{p: [2.0, 2.6, 4.6], l: [-0.3, 2.5, 0]},
	{p: [2.4, 0.9, 4.2], l: [0, 0.45, 0]},
	{p: [6, 1.4, 6], l: [0.4, 0, 0]},
	{p: [6, 1.4, 6], l: [0.4, 0, 0]},
];

export const ToiletShort: React.FC<{lang: 'ru' | 'en'; data: any}> = ({lang, data}) => {
	const S = STR[lang], K = data.k, ch = chapters(data), dur = data.dur;
	const t = useCurrentFrame() / FPS;
	const st = toiletState(t, K, ch, CAMS, 6);
	const cta = K.cta !== undefined ? 1 - P(t, K.cta - 0.4, K.cta) : 1;
	const C1 = (at: number, until: number, x: number, y: number, text: string, col?: string, size?: number) => t > at - 0.3 && t < until ? <At x={x} y={y} s={pop(t, at - 0.3)} o={1 - P(t, until - 0.3, until)}><Callout text={text} col={col} size={size} /></At> : null;
	return (
		<AbsoluteFill style={{background: C.navy}}>
			<AbsoluteFill><Toilet3D w={1080} h={1920} t={t} {...st} glow={P(t, K.congrats - 0.3, K.congrats + 0.5)} /></AbsoluteFill>
			<At x={540} y={260} s={pop(t, 0.2)} o={1 - P(t, ch[1] - 0.3, ch[1])}><Title text={S.guess} col={C.aqua} size={lang === 'ru' ? 62 : 60} glow={C.aqua} /></At>
			{C1(K.bucket, ch[1], 540, 420, S.bucket)}
			{C1(K.hole, ch[2], 540, 330, S.hole)}
			{C1(K.pipe, ch[2], 540, 440, S.pipe, C.aqua)}
			{C1(K.ditch, ch[2], 540, 550, S.ditch, C.green)}
			{C1(K.smell, K.bend, 540, 360, S.smell, C.stink, 60)}
			{C1(K.bend, ch[3], 540, 330, S.bend, C.white)}
			{C1(K.plug, ch[3], 540, 440, S.plug, C.aqua)}
			{C1(K.tank, ch[4], 540, 330, S.tank, C.aqua)}
			{C1(K.pull, ch[4], 540, 440, S.chain, C.amber)}
			{C1(K.supply, ch[5], 540, 330, S.supply, C.blue)}
			{C1(K.float, ch[5], 540, 440, S.float, C.red)}
			{C1(K.bowl, ch[6], 540, 330, S.bowl, C.white)}
			{C1(K.seat, ch[6], 540, 440, S.seat, C.mute)}
			{/* reveal */}
			{t > K.congrats - 0.4 ? <>
				<At x={540} y={250} s={pop(t, K.congrats - 0.3)} o={cta}><Title text={S.reveal1} col={C.white} size={lang === 'ru' ? 80 : 72} /></At>
				<At x={540} y={360} s={pop(t, K.congrats + 0.6, 0.6)} o={cta}><Title text={S.reveal2} col={C.aqua} size={lang === 'ru' ? 130 : 92} glow={C.aqua} /></At>
				<At x={540} y={1180} s={pop(t, K.harington - 0.4)} o={(1 - P(t, K.cumming - 0.6, K.cumming - 0.3)) * cta}><Card w={760} col={C.amber} top={S.har[0]} big={S.har[1]} sub={S.har[2]} /></At>
				<At x={540} y={1180} s={pop(t, K.cumming - 0.4)} o={(1 - P(t, K.b34 - 0.6, K.b34 - 0.3)) * cta}><Card w={760} col={C.aqua} top={S.cum[0]} big={S.cum[1]} sub={S.cum[2]} /></At>
				<At x={540} y={1180} s={pop(t, K.b34 - 0.4)} o={cta}><Card w={760} col={C.red} top={S.b3} big={S.b3sub} /></At>
				<At x={540} y={1360} s={pop(t, K.bucketend - 0.6)} o={cta}><Callout text={S.end} col={C.white} /></At>
			</> : null}
			<Brand S={S} />
			<CTA K={K} S={S} />
			<Captions captions={data.captions} />
			<Audio src={staticFile('music.mp3')} volume={(f) => 0.14 * Math.min(1, f / 30) * Math.min(1, (dur * FPS - f) / 75)} />
			<Sequence from={15} layout="none"><Audio src={staticFile(`${lang}/voice.mp3`)} volume={1.1} /></Sequence>
			{sfx('stink.mp3', K.smell - 0.2, 0.3, 'st')}
			{sfx('chain.mp3', K.pull - 0.1, 0.35, 'ch')}
			{sfx('flush.mp3', K.pull + 0.1, 0.35, 'fl')}
			{sfx('drip.mp3', K.supply + 0.5, 0.3, 'dr')}
			{sfx('flush.mp3', K.congrats + 0.4, 0.28, 'fl2')}
		</AbsoluteFill>
	);
};
void eio;
