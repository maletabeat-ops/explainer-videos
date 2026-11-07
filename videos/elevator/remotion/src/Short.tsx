import React from 'react';
import {AbsoluteFill, Img, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Audio} from '@remotion/media';
import {loadFont} from '@remotion/fonts';
import {Callout, Cam, Inventory, Lift3D, track} from './Comps';
import {CTA} from './CTA';
import {Captions} from './Captions';
import {STR} from './strings';
import {At, Badge, C, DISPLAY, FPS, P, Title, eio, eout, pop} from './ui';

for (const [f, w] of [['InterDisplay-Black.otf', '900'], ['InterDisplay-ExtraBold.otf', '800']]) loadFont({family: 'Inter Display', url: staticFile('fonts/' + f), weight: w});
for (const [f, w] of [['Inter-Bold.otf', '700'], ['Inter-ExtraBold.otf', '800']]) loadFont({family: 'Inter', url: staticFile('fonts/' + f), weight: w});

export const chapters = (data: any, n = 8) => {const ch = [0]; for (let s = 2; s <= n; s++) ch.push(data.segs.find((x: any) => x.s === s).t0 - 0.35); ch.push(data.dur); return ch;};
export const Brand: React.FC<{S: any}> = ({S}) => (
	<div style={{position: 'absolute', left: 44, top: 52, display: 'flex', alignItems: 'center', gap: 16}}>
		<Img src={staticFile(S.logo)} style={{width: 72, height: 72, borderRadius: 36, border: `3px solid ${C.cyan}cc`, boxShadow: `0 0 18px ${C.cyan}66`}} />
		<div style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 32, color: 'rgba(245,248,255,.92)', textShadow: '0 2px 10px rgba(0,0,0,.6)'}}>{S.handle}</div>
	</div>
);
export const sfx = (src: string, at: number, vol: number, key: string) => <Sequence key={key} from={Math.max(0, Math.round(at * FPS))} layout="none"><Audio src={staticFile('sfx/' + src)} volume={vol} /></Sequence>;
const lerp3 = (a: number[], b: number[], k: number) => a.map((v, i) => v + (b[i] - v) * k) as [number, number, number];
export const ITEMS = ['wheel', 'box', 'cw', 'motor', 'rails', 'brake', 'doors', 'buttons'];

// all scene logic in one place, shared by short + long
export const liftState = (t: number, K: any, ch: number[], cams: Cam[]) => {
	let c = 0; while (c < cams.length - 1 && t >= ch[c + 1]) c++;
	const k = c === 0 ? 1 : eio(P(t, ch[c], ch[c] + 1.4));
	const from = cams[Math.max(0, c - 1)], to = cams[c];
	let cam: Cam = {p: lerp3(from.p, to.p, k), l: lerp3(from.l, to.l, k)};
	if (c === cams.length - 1) {const a = 0.6 + (t - ch[c]) * 0.12; cam = {p: [Math.sin(a) * 22, 7, Math.cos(a) * 22], l: [0, 5.3, 0]};}
	const show = {wheel: P(t, K.wheel - 0.3, K.wheel + 0.3), box: P(t, K.box - 0.3, K.box + 0.3), cw: P(t, K.cw - 0.3, K.cw + 0.3), motor: P(t, K.motor - 0.3, K.motor + 0.3), rails: P(t, K.rails - 0.5, K.rails + 0.8), brake: P(t, K.spring - 0.2, K.spring + 0.4), doors: P(t, K.doors - 0.4, K.doors + 0.3), buttons: P(t, K.buttons - 0.3, K.buttons + 0.3)};
	const snapA = t >= K.snap && t < K.spring - 0.6, snapB = t >= K.grab - 0.7 && t < ch[5] + 0.4;
	let boxY = track(t, [[K.pullup - 0.2, 0], [K.heavy - 0.4, 2.6], [K.heavy + 0.4, 2.3], [K.balance - 0.3, 2.3], [K.balance + 1.6, 6], [K.motor + 0.4, 6], [K.motor + 2.6, 9], [K.rails - 0.2, 9], [K.rails + 1.2, 6]]);
	if (t >= ch[4]) boxY = 6;
	if (snapA) boxY = Math.max(0, 6 - 9 * Math.pow(Math.max(0, t - K.snap), 2));
	if (t >= K.spring - 0.6 && t < K.grab - 0.7) boxY = 6;
	let teeth = 0, sparks = 0;
	if (t >= K.grab - 0.7 && t < ch[5] + 0.4) {const f = Math.min(0.55, 4.5 * Math.pow(Math.max(0, t - (K.grab - 0.7)), 2)); boxY = 6 - f; teeth = P(t, K.grab - 0.35, K.grab - 0.2); sparks = t > K.grab - 0.3 ? P(t, K.grab - 0.3, K.grab + 0.5) : 0;}
	if (t >= ch[5] + 0.4) boxY = track(t, [[ch[5] + 0.4, 5.45], [K.doors - 0.1, 2], [K.buttons + 0.2, 2], [K.buttons + 2.6, 9]]);
	const doorFloor = t < K.buttons + 0.1 ? 2 : 9;
	const doorOpen = t < K.buttons + 0.1 ? P(t, K.doors + 0.2, K.doors + 0.9) * (1 - P(t, K.buttons - 0.4, K.buttons)) : P(t, K.buttons + 2.7, K.buttons + 3.3);
	const litFloor = t >= K.buttons - 0.2 && t < K.buttons + 2.8 ? 9 : -1;
	const bagY = t < ch[1] + 0.3 ? 3.2 * eout(P(t, 0.4, ch[1])) : -1;
	const ropeOK = !(snapA || snapB);
	const spin = boxY * 2;
	return {cam, show, boxY, ropeOK, teeth, spin, doorFloor, doorOpen, litFloor, bagY, sparks, c};
};

const CAMS: Cam[] = [
	{p: [4, 6.5, 23], l: [-0.4, 5.3, 0]},
	{p: [3, 3.6, 11.5], l: [-0.3, 2.8, 0]},
	{p: [3.5, 5.2, 13], l: [0, 4.6, 0]},
	{p: [3, 12.4, 7.5], l: [0, 10.4, 0]},
	{p: [3, 7.6, 5], l: [-0.6, 6.4, 0]},
	{p: [1.4, 3.1, 7], l: [-0.4, 2.4, 0]},
	{p: [4, 6.2, 19], l: [-0.2, 5.4, 0]},
	{p: [4, 6.5, 22], l: [0, 5.3, 0]},
];

export const LiftShort: React.FC<{lang: 'ru' | 'en'; data: any}> = ({lang, data}) => {
	const S = STR[lang], K = data.k, ch = chapters(data), dur = data.dur;
	const t = useCurrentFrame() / FPS;
	const st = liftState(t, K, ch, CAMS);
	const cta = K.cta !== undefined ? 1 - P(t, K.cta - 0.4, K.cta) : 1;
	const C1 = (at: number, until: number, x: number, y: number, text: string, col?: string) => t > at - 0.3 && t < until ? <At x={x} y={y} s={pop(t, at - 0.3)} o={1 - P(t, until - 0.3, until)}><Callout text={text} col={col} /></At> : null;
	return (
		<AbsoluteFill style={{background: C.navy}}>
			<AbsoluteFill><Lift3D w={1080} h={1920} t={t} {...st} /></AbsoluteFill>
			{/* hook title */}
			<At x={540} y={250} s={pop(t, 0.1)} o={1 - P(t, ch[1] - 0.3, ch[1])}><Title text={S.t1} col={C.white} size={84} /></At>
			<At x={540} y={350} s={pop(t, 0.35)} o={1 - P(t, ch[1] - 0.3, ch[1])}><Title text={S.t2} col={C.amber} size={120} glow={C.amber} /></At>
			{C1(K.floor, ch[1], 760, 520, S.floor10, C.amber)}
			{C1(K.stairs, ch[1], 330, 1150, S.stairs)}
			{/* chapter callouts */}
			{C1(K.wheel, ch[2], 700, 330, S.wheel)}
			{C1(K.box, ch[2], 380, 440, S.box)}
			{C1(K.heavy, ch[2], 540, 560, S.heavy, C.red)}
			{C1(K.cw, ch[3], 720, 330, S.cw, C.violet)}
			{C1(K.balance, ch[3], 540, 450, S.balance, C.green)}
			{C1(K.motor, ch[4], 700, 330, S.motor, C.amber)}
			{C1(K.rails, ch[4], 540, 450, S.rails)}
			{C1(K.snap, K.spring - 0.6, 540, 330, S.snap, C.red)}
			{C1(K.spring, ch[5], 540, 330, S.spring, C.green)}
			{C1(K.grab, ch[5], 540, 450, S.grab, C.amber)}
			{C1(K.doors, ch[6], 540, 330, S.doors, C.green)}
			{C1(K.buttons, ch[7], 540, 330, S.buttons, C.amber)}
			{/* finale */}
			<At x={540} y={250} s={pop(t, K.congrats - 0.3)} o={cta}><Title text={S.fin1} col={C.white} size={lang === 'ru' ? 76 : 70} /></At>
			<At x={540} y={350} s={pop(t, K.congrats)} o={cta}><Title text={S.fin2} col={C.amber} size={lang === 'ru' ? 104 : 96} glow={C.amber} /></At>
			<At x={540} y={1200} s={pop(t, K.otis - 0.4)} o={cta}><Badge text={S.otis} col={C.amber} size={48} /></At>
			<At x={540} y={1320} s={pop(t, K.cut - 0.2)} o={cta}><Callout text={S.otis2} col={C.white} size={lang === 'ru' ? 34 : 32} /></At>
			<At x={540} y={1478} o={P(t, ch[1] - 0.5, ch[1]) * cta}><Inventory items={ITEMS} got={[K.wheel, K.box, K.cw, K.motor, K.rails, K.spring, K.doors, K.buttons].map((a) => P(t, a - 0.2, a + 0.4))} o={1} /></At>
			<Brand S={S} />
			<CTA K={K} S={S} />
			<Captions captions={data.captions} />
			<Audio src={staticFile('music.mp3')} volume={(f) => 0.14 * Math.min(1, f / 30) * Math.min(1, (dur * FPS - f) / 75)} />
			<Sequence from={15} layout="none"><Audio src={staticFile(`${lang}/voice.mp3`)} volume={1.1} /></Sequence>
			{sfx('rope.mp3', K.pullup - 0.1, 0.3, 'ro')}
			{sfx('motor.mp3', K.motor + 0.3, 0.3, 'mo')}
			{sfx('snap.mp3', K.snap - 0.05, 0.4, 'sn')}
			{sfx('clank.mp3', K.grab - 0.35, 0.4, 'cl')}
			{sfx('door.mp3', K.doors + 0.1, 0.3, 'do')}
		</AbsoluteFill>
	);
};
