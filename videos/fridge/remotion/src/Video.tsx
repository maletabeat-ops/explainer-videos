import React from 'react';
import {AbsoluteFill, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Audio} from '@remotion/media';
import {loadFont} from '@remotion/fonts';
import {Fridge3D} from './Fridge3D';
import {CTA, Cycle, Overlays} from './Overlays';
import {Captions} from './Captions';
import {STR} from './strings';
import {chapters} from './scene';
import {C, DISPLAY, FPS, P} from './ui';

for (const [f, w] of [['InterDisplay-Black.otf', '900'], ['InterDisplay-ExtraBold.otf', '800']]) loadFont({family: 'Inter Display', url: staticFile('fonts/' + f), weight: w});
for (const [f, w] of [['Inter-Bold.otf', '700'], ['Inter-ExtraBold.otf', '800']]) loadFont({family: 'Inter', url: staticFile('fonts/' + f), weight: w});

const Background: React.FC = () => {
	const t = useCurrentFrame() / FPS;
	return (
		<AbsoluteFill style={{background: 'linear-gradient(180deg,#050c1c 0%,#0b1f3d 45%,#0d1630 75%,#050a16 100%)'}}>
			<AbsoluteFill style={{backgroundImage: 'linear-gradient(rgba(160,220,255,.04) 2px, transparent 2px), linear-gradient(90deg, rgba(160,220,255,.04) 2px, transparent 2px)', backgroundSize: '60px 60px'}} />
			<div style={{position: 'absolute', left: 540 + 160 * Math.sin(t * 0.2) - 650, top: 900 - 650, width: 1300, height: 1300, background: `radial-gradient(circle, ${C.cyan}22, transparent 60%)`}} />
			{Array.from({length: 40}).map((_, i) => {const x = (i * 263) % 1080, y = ((i * 577 - t * (20 + (i % 5) * 8)) % 1920 + 1920) % 1920; return <div key={i} style={{position: 'absolute', left: x, top: y, width: 4 + (i % 3) * 2, height: 4 + (i % 3) * 2, borderRadius: 9, background: '#dff6ff', opacity: 0.25}} />;})}
		</AbsoluteFill>
	);
};
const Header: React.FC<{S: any; ch: number[]; dur: number}> = ({S, ch, dur}) => {
	const t = useCurrentFrame() / FPS;
	const n = Math.min(8, ch.findIndex((c, i) => t >= c && t < ch[i + 1]) + 1 || 8);
	return (
		<>
			<div style={{position: 'absolute', left: 48, top: 56, width: 984, height: 8, borderRadius: 4, background: 'rgba(255,255,255,.12)'}}>
				<div style={{width: `${P(t, 0, dur) * 100}%`, height: 8, borderRadius: 4, background: `linear-gradient(90deg, ${C.cyan}, ${C.sky}, ${C.red})`, boxShadow: `0 0 12px ${C.cyan}`}} />
			</div>
			<div style={{position: 'absolute', left: 48, top: 88, fontFamily: DISPLAY, fontWeight: 800, fontSize: 30, color: 'rgba(242,248,255,.78)'}}>{S.head}</div>
			<div style={{position: 'absolute', right: 48, top: 88, fontFamily: DISPLAY, fontWeight: 800, fontSize: 30, color: C.cyan}}>{`0${n} / 08`}</div>
		</>
	);
};
const sfx = (src: string, at: number, vol: number, key: string) => <Sequence key={key} from={Math.max(0, Math.round(at * FPS))} layout="none"><Audio src={staticFile('sfx/' + src)} volume={vol} /></Sequence>;

export const FridgeVideo: React.FC<{lang: 'ru' | 'en'; data: any}> = ({lang, data}) => {
	const S = STR[lang], K = data.k, ch = chapters(data), dur = data.dur;
	const end = data.segs[data.segs.length - 1].t1 + 0.8;
	return (
		<AbsoluteFill style={{background: '#050c1c'}}>
			<Background />
			<Fridge3D ch={ch} K={K} dur={dur} />
			<Overlays ch={ch} K={K} S={S} />
			<Cycle ch={ch} K={K} S={S} />
			<Header S={S} ch={ch} dur={dur} />
			<CTA K={K} S={S} />
			<Captions captions={data.captions} />
			<Audio src={staticFile('music.mp3')} volume={(f) => 0.14 * Math.min(1, f / 30) * Math.min(1, (dur * FPS - f) / 75)} />
			<Sequence from={15} layout="none"><Audio src={staticFile(`${lang}/voice.mp3`)} volume={1.1} /></Sequence>
			{sfx('door.mp3', 0.6, 0.4, 'd1')}{sfx('close.mp3', 2.9, 0.35, 'd2')}{sfx('door.mp3', K.door - 0.6, 0.4, 'd3')}
			{sfx('click.mp3', K.comp - 0.3, 0.5, 'cl')}{sfx('hum.mp3', K.comp, 0.25, 'hm')}{sfx('hiss.mp3', K.drop - 0.3, 0.35, 'hs')}
			{[K.nocold, K.agent, K.evap, K.grid, K.tube, K.ammonia, K.freon, K.ban, K.pump].map((k: number, i: number) => sfx('pop.mp3', k - 0.3, 0.3, 'p' + i))}
			{K.cta !== undefined ? <>{sfx('pop.mp3', K.cta + 1.1, 0.45, 'tap')}{sfx('ding.mp3', K.cta + 2.0, 0.4, 'like')}</> : sfx('ding.mp3', end, 0.4, 'end')}
		</AbsoluteFill>
	);
};
