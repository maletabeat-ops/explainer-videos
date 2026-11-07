import React from 'react';
import {AbsoluteFill, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Audio} from '@remotion/media';
import {Callout, Cam, Inventory, Lift3D, track} from './Comps';
import {CTA} from './CTA';
import {ITEMS, chapters, sfx} from './Short';
import {At, Badge, BODY, C, DISPLAY, FPS, P, Pill, Title, Txt, eio, eout, pop} from './ui';

const PARTS = ['Two hundred steps', 'A rope and a wheel', 'The counterweight trick', 'Motors, ropes and rails', 'What if the rope breaks?', 'Governors, buffers and doors', 'The doors and the strike', 'The button puzzle', 'The machine that built cities', 'You just invented the elevator'];
const L = {sub: 'FOLLOW', subbed: 'FOLLOWING ✓', like: 'LIKE'};
const CAMS: Cam[] = [
	{p: [9, 6.5, 22], l: [-0.6, 5.3, 0]},
	{p: [5, 4.5, 12], l: [-0.4, 3.5, 0]},
	{p: [6, 6, 13], l: [0, 5, 0]},
	{p: [4.5, 12.2, 7.5], l: [0, 10.3, 0]},
	{p: [3.4, 7.4, 4.4], l: [-0.6, 6.4, 0]},
	{p: [5, 9, 9], l: [-0.2, 7.5, 0]},
	{p: [2.2, 3.1, 6.5], l: [-0.4, 2.5, 0]},
	{p: [6, 6, 15], l: [-0.2, 5.3, 0]},
	{p: [10, 7, 20], l: [0, 5.3, 0]},
	{p: [9, 6.5, 21], l: [0, 5.3, 0]},
];
const lerp3 = (a: number[], b: number[], k: number) => a.map((v, i) => v + (b[i] - v) * k) as [number, number, number];

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
			<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 26, color: C.amber, letterSpacing: 4}}>STEP {n}</div>
			<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 56, color: C.white, textShadow: '0 4px 20px rgba(0,0,0,.7)'}}>{title}</div>
			<div style={{height: 5, width: 160, background: C.amber, borderRadius: 3, marginTop: 10, boxShadow: `0 0 14px ${C.amber}`}} />
		</div>
	);
};
const Card: React.FC<{w: number; col: string; top: string; big: string; sub?: string}> = ({w, col, top, big, sub}) => (
	<div style={{width: w, padding: 22, borderRadius: 24, background: 'rgba(7,13,26,.88)', border: `3px solid ${col}`, boxShadow: `0 0 26px ${col}44`, boxSizing: 'border-box', textAlign: 'center', whiteSpace: 'normal'}}>
		<div style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 24, color: C.mute}}>{top}</div>
		<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 48, color: col, lineHeight: 1.15}}>{big}</div>
		{sub ? <div style={{fontFamily: BODY, fontWeight: 700, fontSize: 22, color: C.white, marginTop: 6}}>{sub}</div> : null}
	</div>
);
const Pop: React.FC<{t: number; at: number; x: number; y: number; children: React.ReactNode}> = ({t, at, x, y, children}) => <At x={x} y={y} s={pop(t, at - 0.3)}>{children}</At>;

export const LiftLong: React.FC<{data: any}> = ({data}) => {
	const K = data.k, ch = chapters(data, 10), dur = data.dur;
	const t = useCurrentFrame() / FPS;
	const MUSIC = 80, loops = Math.ceil(dur / MUSIC) + 1;
	let c = 0; while (c < 9 && t >= ch[c + 1]) c++;
	const k = c === 0 ? 1 : eio(P(t, ch[c], ch[c] + 1.6));
	let cam: Cam = {p: lerp3(CAMS[Math.max(0, c - 1)].p, CAMS[c].p, k), l: lerp3(CAMS[Math.max(0, c - 1)].l, CAMS[c].l, k)};
	if (c === 8) {const a = 0.8 + (t - ch[8]) * 0.1; cam = {p: [Math.sin(a) * 21, 7, Math.cos(a) * 21], l: [0, 5.3, 0]};}
	const got = [K.wheel, K.wheel + 1, K.cw, K.grooved, K.rails, K.spring, K.locked, K.buttons];
	const show = {wheel: P(t, got[0] - 0.3, got[0] + 0.3), box: P(t, got[1] - 0.3, got[1] + 0.3), cw: P(t, got[2] - 0.3, got[2] + 0.3), motor: P(t, got[3] - 0.3, got[3] + 0.3), rails: P(t, got[4] - 0.5, got[4] + 0.8), brake: P(t, got[5] - 0.2, got[5] + 0.4), doors: P(t, got[6] - 0.4, got[6] + 0.3), buttons: P(t, got[7] - 0.3, got[7] + 0.3)};
	// car motion: rises with the story, falls a few inches at the axe, then tours the floors
	const cut = t >= K.axe && t < K.safe + 1.5;
	let boxY = track(t, [[K.pull - 0.2, 0], [K.heavy, 2.5], [K.difference, 2.5], [K.hidden, 5.5], [K.boring, 5.5], [K.grooved + 2, 8], [K.rails + 2, 6], [K.axe, 6]]);
	let teeth = 0, sparks = 0;
	if (t >= K.axe) {const f = Math.min(0.4, 3.5 * Math.pow(Math.max(0, t - K.axe), 2)); boxY = 6 - f; teeth = P(t, K.inches - 0.6, K.inches - 0.4); sparks = P(t, K.inches - 0.5, K.inches + 0.4) * (t < K.inches + 0.4 ? 1 : 0);}
	if (t >= K.safe + 1.5) boxY = track(t, [[K.safe + 1.5, 5.6], [K.faster, 8.5], [K.buffers, 2], [K.locked + 2, 2], [K.buttons, 2], [K.order + 1, 9], [K.smarter + 1, 4], [K.close + 1, 4], [K.step, 6], [K.count, 6]]);
	const doorFloor = t < K.order ? 2 : t < K.smarter + 1 ? 9 : 4;
	const doorOpen = P(t, K.right - 0.5, K.right + 0.3) * (1 - P(t, K.lever - 0.5, K.lever)) + (t > K.order + 1.2 && t < K.smarter ? 1 : 0);
	const litFloor = t >= K.buttons && t < K.order + 1 ? 9 : -1;
	const st = {cam, show, boxY, ropeOK: !cut, teeth, spin: boxY * 2, doorFloor, doorOpen, litFloor, bagY: t < ch[1] ? 4 * eout(P(t, 1, ch[1])) : -1, sparks};
	const cta = K.cta !== undefined ? 1 - P(t, K.cta - 0.4, K.cta) : 1;
	return (
		<AbsoluteFill style={{background: C.navy}}>
			<AbsoluteFill style={{left: 640}}><Lift3D w={1280} h={1080} t={t} {...st} /></AbsoluteFill>
			<AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(7,13,26,.96) 0%, rgba(7,13,26,.85) 34%, rgba(7,13,26,0) 50%)'}} />
			{/* 1 */}
			<Win a={0} b={ch[1]}>
				<Pop t={t} at={K.tenth} x={420} y={230}><Title text="10TH FLOOR" col={C.amber} size={90} glow={C.amber} /></Pop>
				<Pop t={t} at={K.steps} x={420} y={350}><Txt text="≈ 200 steps, every day" col={C.white} size={40} /></Pop>
				<Pop t={t} at={K.scratch} x={420} y={500}><Title text="LET'S INVENT" col={C.white} size={70} /></Pop>
				<Pop t={t} at={K.scratch + 0.4} x={420} y={590}><Title text="THE ELEVATOR" col={C.amber} size={80} glow={C.amber} /></Pop>
				<Pop t={t} at={K.problem} x={420} y={720}><Pill text="PROBLEM → FIX → NEW PROBLEM" bg={C.cyan} size={30} /></Pop>
			</Win>
			{/* 2 */}
			<Win a={ch[1]} b={ch[2]}>
				<Pop t={t} at={K.archimedes} x={400} y={230}><Card w={600} col={C.cyan} top="≈ 2,200 YEARS AGO" big="Archimedes' hoists" /></Pop>
				<Pop t={t} at={K.colosseum} x={400} y={440}><Card w={600} col={C.amber} top="ROMAN COLOSSEUM" big="Animal lifts" sub="pulled by teams of workers" /></Pop>
				<Pop t={t} at={K.versailles} x={400} y={660}><Card w={600} col={C.violet} top="1743 · VERSAILLES" big="Louis XV's private lift" sub="servants pulled the ropes" /></Pop>
				<Pop t={t} at={K.heavy} x={400} y={860}><Callout text="you lift ALL the weight" col={C.red} /></Pop>
			</Win>
			{/* 3 */}
			<Win a={ch[2]} b={ch[3]}>
				<Pop t={t} at={K.cw} x={400} y={230}><Title text="COUNTERWEIGHT" col={C.violet} size={76} /></Pop>
				<Pop t={t} at={K.seesaw} x={400} y={350}><Txt text="balanced like a seesaw" col={C.white} size={38} /></Pop>
				<Pop t={t} at={K.difference} x={400} y={480}><Callout text="motor lifts only the difference" col={C.green} /></Pop>
				<Pop t={t} at={K.half} x={400} y={650}><Card w={600} col={C.violet} top="TYPICAL COUNTERWEIGHT" big="car + ≈ 50% of load" /></Pop>
				<Pop t={t} at={K.saver} x={400} y={850}><Pill text="THE BIGGEST ENERGY SAVER" bg={C.amber} size={32} /></Pop>
			</Win>
			{/* 4 */}
			<Win a={ch[3]} b={ch[4]}>
				<Pop t={t} at={K.steam} x={400} y={220}><Pill text="1800s · STEAM & WATER PRESSURE" bg={C.white} size={30} /></Pop>
				<Pop t={t} at={K.siemens} x={400} y={360}><Card w={600} col={C.amber} top="1880 · WERNER VON SIEMENS" big="Electric elevator" /></Pop>
				<Pop t={t} at={K.grooved} x={400} y={530}><Callout text="motor + grooved wheel (traction)" col={C.amber} /></Pop>
				<Pop t={t} at={K.ropes} x={400} y={700}><Card w={600} col={C.cyan} top="SEVERAL STEEL ROPES" big="any one can hold the car" /></Pop>
				<Pop t={t} at={K.rails} x={400} y={880}><Callout text="shaft + guide rails" col={C.white} /></Pop>
			</Win>
			{/* 5 */}
			<Win a={ch[4]} b={ch[5]}>
				<Pop t={t} at={K.breaks} x={400} y={210}><Title text="WHAT IF THE ROPE BREAKS?" col={C.red} size={52} /></Pop>
				<Pop t={t} at={K.otis} x={400} y={330}><Badge text="ELISHA OTIS" col={C.amber} size={48} /></Pop>
				<Pop t={t} at={K.spring} x={400} y={450}><Callout text="spring + teeth in the rails" col={C.green} /></Pop>
				<Pop t={t} at={K.y1854} x={400} y={610}><Card w={620} col={C.amber} top="1854 · NEW YORK" big="Cuts his own rope" sub="drops a few inches… and stops" /></Pop>
				<Pop t={t} at={K.y1857} x={400} y={830}><Card w={620} col={C.cyan} top="1857 · FIRST PASSENGER ELEVATOR" big="≈ 40 ft / minute" /></Pop>
			</Win>
			{/* 6 */}
			<Win a={ch[5]} b={ch[6]}>
				<Pop t={t} at={K.governor} x={400} y={230}><Card w={600} col={C.green} top="AT THE TOP" big="Speed governor" sub="too fast → trips the brake" /></Pop>
				<Pop t={t} at={K.buffers} x={400} y={450}><Card w={600} col={C.cyan} top="AT THE BOTTOM" big="Buffers" sub="shock absorbers, just in case" /></Pop>
				<Pop t={t} at={K.freefall} x={400} y={640}><Pill text="FREE FALL: ALMOST IMPOSSIBLE" bg={C.green} size={30} /></Pop>
				<Pop t={t} at={K.locked} x={400} y={800}><Callout text="each landing door is locked…" col={C.white} /></Pop>
				<Pop t={t} at={K.right} x={400} y={900}><Callout text="…until the car is right there" col={C.green} /></Pop>
			</Win>
			{/* 7 */}
			<Win a={ch[6]} b={ch[7]}>
				<Pop t={t} at={K.miles} x={400} y={230}><Card w={620} col={C.amber} top="1887 · ALEXANDER MILES" big="Automatic doors" /></Pop>
				<Pop t={t} at={K.operator} x={400} y={430}><Pill text="DECADES OF HUMAN OPERATORS" bg={C.white} size={30} /></Pop>
				<Pop t={t} at={K.trust} x={400} y={530}><Txt text="automatic? passengers didn't trust it" col={C.mute} size={32} /></Pop>
				<Pop t={t} at={K.strike} x={400} y={680}><Card w={620} col={C.red} top="1945 · NEW YORK" big="Operators' strike" sub="thousands climb dozens of floors" /></Pop>
				<Pop t={t} at={K.switched} x={400} y={880}><Pill text="STOP · ALARM · PHONE · CALM VOICE" bg={C.green} size={28} /></Pop>
			</Win>
			{/* 8 */}
			<Win a={ch[7]} b={ch[8]}>
				<Pop t={t} at={K.buttons} x={400} y={230}><Title text="BUTTONS" col={C.amber} size={86} glow={C.amber} /></Pop>
				<Pop t={t} at={K.ten} x={400} y={370}><Txt text="10 calls · 6 cars · who goes where?" col={C.white} size={36} /></Pop>
				<Pop t={t} at={K.choose} x={400} y={540}><Card w={620} col={C.cyan} top="DESTINATION DISPATCH" big="Pick your floor first" sub="the system groups people" /></Pop>
				<Pop t={t} at={K.close} x={400} y={780}><Callout text="“door close”: sometimes disabled" col={C.red} /></Pop>
			</Win>
			{/* 9 */}
			<Win a={ch[8]} b={ch[9]}>
				<Pop t={t} at={K.cheapest} x={400} y={210}><Card w={620} col={C.mute} top="BEFORE ELEVATORS" big="Top floor = cheapest" /></Pop>
				<Pop t={t} at={K.penthouse} x={400} y={400}><Card w={620} col={C.amber} top="AFTER" big="Penthouse = priciest" /></Pop>
				<Pop t={t} at={K.twenty} x={400} y={590}><Card w={620} col={C.cyan} top="FASTEST TODAY (CHINA)" big="≈ 20 m/s · 70 km/h" /></Pop>
				<Pop t={t} at={K.carbon} x={400} y={770}><Pill text="SKY LOBBIES · CARBON-FIBER ROPES" bg={C.white} size={28} /></Pop>
				<Pop t={t} at={K.alarm} x={400} y={900}><Callout text="stuck? press alarm, stay inside" col={C.green} /></Pop>
			</Win>
			{/* 10 */}
			<Win a={ch[9]} b={ch[10]} last>
				<At x={400} y={260} s={pop(t, K.congrats - 0.3)} o={cta}><Title text="YOU JUST INVENTED" col={C.white} size={64} /></At>
				<At x={400} y={360} s={pop(t, K.congrats)} o={cta}><Title text="THE ELEVATOR" col={C.amber} size={86} glow={C.amber} /></At>
				<At x={400} y={560} s={pop(t, K.groceries - 0.3)} o={cta}><Callout text="…from a bag of groceries" col={C.white} /></At>
			</Win>
			<At x={960} y={70}><div style={{transform: 'scale(.8)'}}><Inventory items={ITEMS} got={(c === 9 ? [K.wheelrope, K.wheelrope + 0.5, K.cwend, K.motorend, K.railsend, K.brakeend, K.doorsend, K.buttonsend] : got).map((a, i) => c === 9 ? P(t, a - 0.2, a + 0.4) : P(t, a - 0.2, a + 0.4))} o={P(t, K.rope0 - 0.6, K.rope0) * cta} /></div></At>
			{PARTS.map((p, i) => <PartTitle key={i} n={i + 1} title={p} at={i === 0 ? 0.6 : ch[i] + 0.3} />)}
			<CTA K={K} S={L} cx={960} cy={-760} />
			{Array.from({length: loops}).map((_, i) => (
				<Sequence key={'m' + i} from={Math.round(i * (MUSIC - 4) * FPS)} durationInFrames={Math.round(MUSIC * FPS)} layout="none">
					<Audio src={staticFile('music.mp3')} volume={(f) => 0.12 * Math.min(1, f / (4 * FPS)) * Math.min(1, (MUSIC * FPS - f) / (4 * FPS)) * Math.min(1, (dur * FPS - (f + i * (MUSIC - 4) * FPS)) / 90)} />
				</Sequence>
			))}
			<Sequence from={15} layout="none"><Audio src={staticFile('long/voice.mp3')} volume={1.1} /></Sequence>
			{sfx('rope.mp3', K.pull - 0.1, 0.28, 'ro')}
			{sfx('motor.mp3', K.grooved, 0.28, 'mo')}
			{sfx('snap.mp3', K.axe - 0.05, 0.38, 'sn')}
			{sfx('clank.mp3', K.inches - 0.5, 0.38, 'cl')}
			{sfx('door.mp3', K.right - 0.4, 0.28, 'do')}
		</AbsoluteFill>
	);
};
