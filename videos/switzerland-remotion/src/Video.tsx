import React from 'react';
import {AbsoluteFill, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Audio} from '@remotion/media';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {loadFont} from '@remotion/fonts';
import {MapScene} from './MapScene';
import {Apprentice, Chain, Costs, Domino, Stability} from './Scenes';
import {Captions} from './Captions';
import {STR} from './strings';
import {C, DISPLAY, FPS, P} from './ui';

for (const [f, w] of [['InterDisplay-Black.otf', '900'], ['InterDisplay-ExtraBold.otf', '800']]) loadFont({family: 'Inter Display', url: staticFile('fonts/' + f), weight: w});
for (const [f, w] of [['Inter-Bold.otf', '700'], ['Inter-ExtraBold.otf', '800']]) loadFont({family: 'Inter', url: staticFile('fonts/' + f), weight: w});

export type VProps = {lang: 'ru' | 'en'; data: any};
const T = 14; // transition frames

export const chapters = (data: any) => {const ch = [0]; for (let s = 2; s <= 8; s++) ch.push(data.segs.find((x: any) => x.s === s).t0 - 0.35); ch.push(data.dur); return ch;};

const Background: React.FC = () => {
	const t = useCurrentFrame() / FPS;
	return (
		<AbsoluteFill style={{background: 'linear-gradient(180deg,#070a1c 0%,#101640 45%,#1a1036 75%,#080a18 100%)'}}>
			<AbsoluteFill style={{backgroundImage: 'linear-gradient(rgba(170,180,255,.04) 2px, transparent 2px), linear-gradient(90deg, rgba(170,180,255,.04) 2px, transparent 2px)', backgroundSize: '60px 60px'}} />
			<div style={{position: 'absolute', left: 300 + 120 * Math.sin(t * 0.2) - 600, top: 700 - 600, width: 1200, height: 1200, background: `radial-gradient(circle, ${C.red}26, transparent 60%)`}} />
			<div style={{position: 'absolute', left: 800 + 90 * Math.cos(t * 0.23) - 550, top: 1300 - 550, width: 1100, height: 1100, background: `radial-gradient(circle, ${C.teal}1c, transparent 60%)`}} />
		</AbsoluteFill>
	);
};
const Header: React.FC<{S: any; ch: number[]; dur: number}> = ({S, ch, dur}) => {
	const t = useCurrentFrame() / FPS;
	const n = Math.min(8, ch.findIndex((c, i) => t >= c && t < ch[i + 1]) + 1 || 8);
	return (
		<>
			<div style={{position: 'absolute', left: 48, top: 56, width: 984, height: 8, borderRadius: 4, background: 'rgba(255,255,255,.12)'}}>
				<div style={{width: `${P(t, 0, dur) * 100}%`, height: 8, borderRadius: 4, background: `linear-gradient(90deg, ${C.red}, ${C.gold}, ${C.teal})`, boxShadow: `0 0 12px ${C.red}`}} />
			</div>
			<div style={{position: 'absolute', left: 48, top: 88, fontFamily: DISPLAY, fontWeight: 800, fontSize: 30, color: 'rgba(244,241,255,.78)'}}>{S.head}</div>
			<div style={{position: 'absolute', right: 48, top: 88, fontFamily: DISPLAY, fontWeight: 800, fontSize: 30, color: C.red}}>{`0${n} / 08`}</div>
		</>
	);
};
const sfx = (src: string, at: number, vol: number, key: string) => <Sequence key={key} from={Math.max(0, Math.round(at * FPS))} layout="none"><Audio src={staticFile('sfx/' + src)} volume={vol} /></Sequence>;

export const SwissVideo: React.FC<VProps> = ({lang, data}) => {
	const S = STR[lang], K = data.k, ch = chapters(data), dur = data.dur;
	const scenes: [React.FC<any>, any][] = [
		[MapScene, {mode: 'europe'}], [MapScene, {mode: 'swiss'}], [Domino, {}], [Apprentice, {}], [Stability, {}], [Costs, {}], [Chain, {}], [MapScene, {mode: 'final'}],
	];
	const end = data.segs[data.segs.length - 1].t1 + 0.8;
	return (
		<AbsoluteFill style={{background: '#070a1c'}}>
			<Background />
			<TransitionSeries>
				{scenes.map(([Comp, extra], i) => {
					const d = Math.round((ch[i + 1] - ch[i]) * FPS) + (i < 7 ? T : 0);
					return (
						<React.Fragment key={i}>
							<TransitionSeries.Sequence durationInFrames={d} name={`Scene ${i + 1}`}>
								<Comp t0={ch[i]} K={K} S={S} {...extra} />
							</TransitionSeries.Sequence>
							{i < 7 ? <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames: T})} /> : null}
						</React.Fragment>
					);
				})}
			</TransitionSeries>
			<Header S={S} ch={ch} dur={dur} />
			<Captions captions={data.captions} />
			<Sequence from={Math.round(end * FPS)} layout="none">
				<AbsoluteFill style={{top: 1640, alignItems: 'center'}}>
					<div style={{background: C.red, color: '#fff', fontFamily: DISPLAY, fontWeight: 900, fontSize: 52, padding: '20px 44px', borderRadius: 999, boxShadow: `0 0 40px ${C.red}`, height: 'fit-content'}}>{S.end}</div>
				</AbsoluteFill>
			</Sequence>
			<Audio src={staticFile('music.mp3')} volume={(f) => 0.14 * Math.min(1, f / 30) * Math.min(1, (dur * FPS - f) / 75)} />
			<Sequence from={15} layout="none"><Audio src={staticFile(`${lang}/voice.mp3`)} volume={1.1} /></Sequence>
			{ch.slice(1, 8).map((c, i) => sfx('sfx_swoosh.mp3', c - 0.3, 0.3, 'w' + i))}
			{[K.wage, K.double, K.pay, K.twothirds, K.franc, K.ins, K.rent].map((k: number, i: number) => sfx('sfx_coin.mp3', k - 0.1, 0.3, 'c' + i))}
			{[K.pharma, K.bank, K.watch, K.trade, K.waiter, K.cashier, K.driver, K.neutral, K.zug, K.goods, K.prod, K.wages, K.prices].map((k: number, i: number) => sfx('sfx_pop.mp3', k - 0.25, 0.3, 'p' + i))}
			{sfx('sfx_stamp.mp3', K.leave - 0.3, 0.4, 'st')}
			{sfx('sfx_ding.mp3', end, 0.45, 'end')}
		</AbsoluteFill>
	);
};
