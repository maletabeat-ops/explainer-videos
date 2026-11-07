import React from 'react';
import {AbsoluteFill, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Audio} from '@remotion/media';
import {Callout, Cam, Toilet3D} from './Comps';
import {CTA} from './CTA';
import {Card, chapters, sfx, toiletState} from './Short';
import {At, C, DISPLAY, FPS, P, Pill, Title, Txt, eout, pop} from './ui';

const PARTS = ['The bucket problem', 'A hole and a pipe', 'The smell comes back', 'The siphon trick', 'A tank and a chain', 'The float', 'The reveal', 'Who really invented it', 'Water and money', 'Japan, planes and space', '3.4 billion people'];
const L = {sub: 'FOLLOW', subbed: 'FOLLOWING ✓', like: 'LIKE'};
const CAMS: Cam[] = [
	{p: [3.5, 1.6, 9], l: [-0.8, 0.6, 0]},
	{p: [5, -0.6, 10.5], l: [0.6, -1.2, 0]},
	{p: [2.6, -0.3, 5.2], l: [0.2, -0.6, 0]},
	{p: [3.2, -0.6, 6.5], l: [0.6, -1.0, 0]},
	{p: [3.4, 1.4, 8.4], l: [-0.2, 1.3, 0]},
	{p: [2.2, 2.6, 4.4], l: [-0.6, 2.5, 0]},
	{p: [2.6, 0.9, 4.2], l: [-0.3, 0.45, 0]},
	{p: [6, 1.4, 6], l: [0.2, 0.2, 0]},
	{p: [6, 1.4, 6], l: [0.2, 0.2, 0]},
	{p: [6, 1.4, 6], l: [0.2, 0.2, 0]},
	{p: [6, 1.4, 6], l: [0.2, 0.2, 0]},
];
const Win: React.FC<{a: number; b: number; children: React.ReactNode; last?: boolean}> = ({a, b, children, last}) => {
	const t = useCurrentFrame() / FPS;
	if (t < a - 0.4 || t > b + 0.4) return null;
	const i = eout(P(t, a - 0.35, a + 0.5)), o = last ? 1 : 1 - P(t, b - 0.4, b + 0.2);
	return <AbsoluteFill style={{opacity: i * o, transform: `translateX(${(1 - i) * -60}px)`}}>{children}</AbsoluteFill>;
};
const PartTitle: React.FC<{n: number; title: string; at: number}> = ({n, title, at}) => {
	const t = useCurrentFrame() / FPS;
	const k = P(t, at, at + 0.5) * (1 - P(t, at + 4.2, at + 4.8));
	if (k <= 0) return null;
	return (
		<div style={{position: 'absolute', left: 80, bottom: 70, opacity: k, transform: `translateX(${(1 - eout(Math.min(1, k * 1.2))) * -60}px)`}}>
			<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 26, color: C.aqua, letterSpacing: 4}}>STEP {n}</div>
			<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 56, color: C.white, textShadow: '0 4px 20px rgba(0,0,0,.7)'}}>{title}</div>
			<div style={{height: 5, width: 160, background: C.aqua, borderRadius: 3, marginTop: 10, boxShadow: `0 0 14px ${C.aqua}`}} />
		</div>
	);
};
const Pop: React.FC<{t: number; at: number; x: number; y: number; children: React.ReactNode}> = ({t, at, x, y, children}) => <At x={x} y={y} s={pop(t, at - 0.3)}>{children}</At>;

export const ToiletLong: React.FC<{data: any}> = ({data}) => {
	const K0 = data.k, ch = chapters(data, 11), dur = data.dur;
	const K = {...K0, auto: K0.fix, hole: K0.hole};
	const t = useCurrentFrame() / FPS;
	const MUSIC = 85, loops = Math.ceil(dur / MUSIC) + 1;
	const st = toiletState(t, K, ch, CAMS, 7);
	const cta = K.cta !== undefined ? 1 - P(t, K.cta - 0.4, K.cta) : 1;
	return (
		<AbsoluteFill style={{background: C.navy}}>
			<AbsoluteFill style={{left: 640}}><Toilet3D w={1280} h={1080} t={t} {...st} glow={P(t, K.congrats - 0.3, K.congrats + 0.5)} /></AbsoluteFill>
			<AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(6,18,26,.96) 0%, rgba(6,18,26,.85) 34%, rgba(6,18,26,0) 50%)'}} />
			<Win a={0} b={ch[1]}>
				<Pop t={t} at={K.bucket} x={420} y={230}><Callout text="every morning: the bucket" col={C.white} /></Pop>
				<Pop t={t} at={K.window} x={420} y={360}><Card w={600} col={C.stink} top="OLD EUROPEAN CITIES" big="Out of the window" /></Pop>
				<Pop t={t} at={K.edinburgh} x={420} y={560}><Card w={600} col={C.amber} top="EDINBURGH" big="Shout first, then pour" /></Pop>
				<Pop t={t} at={K.guess} x={420} y={790}><Title text="CAN YOU GUESS" col={C.white} size={64} /></Pop>
				<Pop t={t} at={K.guess + 0.4} x={420} y={870}><Title text="WHAT WE'RE BUILDING?" col={C.aqua} size={56} glow={C.aqua} /></Pop>
			</Win>
			<Win a={ch[1]} b={ch[2]}>
				<Pop t={t} at={K.hole} x={420} y={220}><Callout text="hole + pipe → ditch" col={C.aqua} /></Pop>
				<Pop t={t} at={K.slope} x={420} y={340}><Card w={600} col={C.aqua} top="GRAVITY DOES THE WORK" big="≈ 2% slope" /></Pop>
				<Pop t={t} at={K.mohenjo} x={420} y={540}><Card w={600} col={C.amber} top="4,000+ YEARS AGO" big="Mohenjo-daro drains" /></Pop>
				<Pop t={t} at={K.cloaca} x={420} y={740}><Card w={600} col={C.violet} top="ANCIENT ROME" big="Cloaca Maxima" sub="parts still work today" /></Pop>
			</Win>
			<Win a={ch[2]} b={ch[3]}>
				<Pop t={t} at={K.smell} x={420} y={210}><Title text="THE SMELL" col={C.stink} size={84} glow={C.stink} /></Pop>
				<Pop t={t} at={K.sulfide} x={420} y={330}><Pill text="H₂S · ROTTEN EGGS + METHANE" bg={C.stink} size={28} /></Pop>
				<Pop t={t} at={K.bend} x={420} y={470}><Callout text="bend the pipe into a U" col={C.white} /></Pop>
				<Pop t={t} at={K.seal} x={420} y={600}><Card w={600} col={C.aqua} top="WATER TRAPPED IN THE BEND" big="A liquid plug" /></Pop>
				<Pop t={t} at={K.sink} x={420} y={780}><Txt text="same trick under every sink" col={C.white} size={34} /></Pop>
				<Pop t={t} at={K.evaporated} x={420} y={880}><Callout text="smelly drain? pour a glass of water" col={C.amber} /></Pop>
			</Win>
			<Win a={ch[3]} b={ch[4]}>
				<Pop t={t} at={K.push} x={420} y={230}><Callout text="it needs a push" col={C.white} /></Pop>
				<Pop t={t} at={K.siphon} x={420} y={380}><Title text="SIPHON" col={C.aqua} size={96} glow={C.aqua} /></Pop>
				<Pop t={t} at={K.straw} x={420} y={490}><Txt text="the falling water pulls, like a straw" col={C.white} size={34} /></Pop>
				<Pop t={t} at={K.gurgle} x={420} y={640}><Card w={600} col={C.amber} top="THAT FINAL GURGLE" big="Air breaks the siphon" /></Pop>
			</Win>
			<Win a={ch[4]} b={ch[5]}>
				<Pop t={t} at={K.tank} x={420} y={230}><Callout text="a tank high on the wall" col={C.aqua} /></Pop>
				<Pop t={t} at={K.higher} x={420} y={340}><Txt text="higher = faster water" col={C.white} size={36} /></Pop>
				<Pop t={t} at={K.chain} x={420} y={470}><Callout text="pull the chain → valve opens" col={C.amber} /></Pop>
				<Pop t={t} at={K.ceiling} x={420} y={620}><Card w={600} col={C.amber} top="1800s" big="Tank near the ceiling" /></Pop>
				<Pop t={t} at={K.lower} x={420} y={820}><Card w={600} col={C.aqua} top="LATER" big="Low tank + lever" /></Pop>
			</Win>
			<Win a={ch[5]} b={ch[6]}>
				<Pop t={t} at={K.supply} x={420} y={230}><Callout text="connect the water supply" col={C.blue} /></Pop>
				<Pop t={t} at={K.float} x={420} y={360}><Title text="THE FLOAT" col={C.red} size={84} /></Pop>
				<Pop t={t} at={K.rises} x={420} y={480}><Txt text="tank fills → float rises → valve shuts" col={C.white} size={32} /></Pop>
				<Pop t={t} at={K.buoyancy} x={420} y={620}><Card w={600} col={C.aqua} top="NO ELECTRICITY" big="Just buoyancy" /></Pop>
				<Pop t={t} at={K.overflow} x={420} y={820}><Callout text="+ overflow tube, just in case" col={C.white} /></Pop>
			</Win>
			<Win a={ch[6]} b={ch[7]}>
				<Pop t={t} at={K.bowl} x={420} y={230}><Callout text="smooth glazed bowl" col={C.white} /></Pop>
				<Pop t={t} at={K.seat} x={420} y={340}><Callout text="+ a seat" col={C.mute} /></Pop>
				<Pop t={t} at={K.congrats} x={420} y={560}><Title text="YOU JUST INVENTED" col={C.white} size={64} /></Pop>
				<Pop t={t} at={K.toilet} x={420} y={680}><Title text="THE FLUSH TOILET" col={C.aqua} size={76} glow={C.aqua} /></Pop>
			</Win>
			<Win a={ch[7]} b={ch[8]}>
				<Pop t={t} at={K.harington} x={420} y={200}><Card w={620} col={C.amber} top="1596 · SIR JOHN HARINGTON" big="The “Ajax”" sub="Elizabeth I reportedly had one" /></Pop>
				<Pop t={t} at={K.nosewers} x={420} y={390}><Pill text="NO SEWERS → IDEA STALLS ~200 YEARS" bg={C.white} size={26} /></Pop>
				<Pop t={t} at={K.cumming} x={420} y={530}><Card w={620} col={C.aqua} top="1775 · ALEXANDER CUMMING" big="Patent: the bent pipe" /></Pop>
				<Pop t={t} at={K.bramah} x={420} y={700}><Card w={620} col={C.violet} top="1778 · JOSEPH BRAMAH" big="Better valve" /></Pop>
				<Pop t={t} at={K.crapper} x={420} y={880}><Callout text="Thomas Crapper: sold them, didn't invent them" col={C.red} /></Pop>
			</Win>
			<Win a={ch[8]} b={ch[9]}>
				<Pop t={t} at={K.thirteen} x={420} y={230}><Card w={600} col={C.red} top="OLDER TOILETS" big="13+ L per flush" /></Pop>
				<Pop t={t} at={K.law} x={420} y={430}><Card w={600} col={C.aqua} top="U.S. LAW · 1992" big="1.6 gal ≈ 6 L" /></Pop>
				<Pop t={t} at={K.dual} x={420} y={620}><Callout text="dual flush: small + full" col={C.white} /></Pop>
				<Pop t={t} at={K.billions} x={420} y={760}><Txt text="small changes = billions of liters a day" col={C.white} size={32} /></Pop>
			</Win>
			<Win a={ch[9]} b={ch[10]}>
				<Pop t={t} at={K.japan} x={420} y={200}><Card w={620} col={C.amber} top="JAPAN" big="Warm seats, bidet sprays" sub="+ a privacy sound button" /></Pop>
				<Pop t={t} at={K.vacuum} x={420} y={420}><Card w={620} col={C.aqua} top="AIRPLANES" big="Vacuum flush" sub="a cup of water + air pressure" /></Pop>
				<Pop t={t} at={K.nasa} x={420} y={640}><Card w={620} col={C.violet} top="2020 · SPACE STATION" big="≈ $23M titanium toilet" sub="fans instead of gravity" /></Pop>
				<Pop t={t} at={K.recycle} x={420} y={860}><Callout text="urine → drinking water" col={C.white} /></Pop>
			</Win>
			<Win a={ch[10]} b={ch[11]} last>
				<At x={420} y={240} s={pop(t, K.b34 - 0.4)} o={cta}><Title text="3.4 BILLION" col={C.red} size={96} /></At>
				<At x={420} y={340} s={pop(t, K.b34)} o={cta}><Txt text="people without safely managed sanitation (UN)" col={C.white} size={30} /></At>
				<At x={420} y={500} s={pop(t, K.day - 0.3)} o={cta}><Pill text="WORLD TOILET DAY · NOV 19" bg={C.aqua} size={32} /></At>
				<At x={420} y={680} s={pop(t, K.bucketend - 0.5)} o={cta}><Callout text="…and it started with a bucket" col={C.white} /></At>
			</Win>
			{PARTS.map((p, i) => <PartTitle key={i} n={i + 1} title={p} at={i === 0 ? 0.6 : ch[i] + 0.3} />)}
			<CTA K={K} S={L} cx={960} cy={-760} />
			{Array.from({length: loops}).map((_, i) => (
				<Sequence key={'m' + i} from={Math.round(i * (MUSIC - 4) * FPS)} durationInFrames={Math.round(MUSIC * FPS)} layout="none">
					<Audio src={staticFile('music.mp3')} volume={(f) => 0.12 * Math.min(1, f / (4 * FPS)) * Math.min(1, (MUSIC * FPS - f) / (4 * FPS)) * Math.min(1, (dur * FPS - (f + i * (MUSIC - 4) * FPS)) / 90)} />
				</Sequence>
			))}
			<Sequence from={15} layout="none"><Audio src={staticFile('long/voice.mp3')} volume={1.1} /></Sequence>
			{sfx('stink.mp3', K.smell - 0.2, 0.28, 'st')}
			{sfx('chain.mp3', K.pull - 0.1, 0.32, 'ch')}
			{sfx('flush.mp3', K.pull + 0.1, 0.32, 'fl')}
			{sfx('drip.mp3', K.supply + 0.5, 0.28, 'dr')}
			{sfx('flush.mp3', K.congrats + 0.4, 0.26, 'fl2')}
		</AbsoluteFill>
	);
};
