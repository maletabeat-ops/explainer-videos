import React from 'react';
import {AbsoluteFill, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Audio} from '@remotion/media';
import {Card, CaseFile, CityBg, Clock, LiftPanel, Meter, PushButton, Thermostat, TrafficLight} from './Comps';
import {CTA} from './CTA';
import {chapters, sfx} from './Short';
import {At, Badge, C, DISPLAY, FPS, P, Pill, Title, Txt, eout, pop} from './ui';

const L = {sub: 'SUBSCRIBE', subbed: 'SUBSCRIBED ✓', like: 'LIKE'};
const Win: React.FC<{a: number; b: number; children: React.ReactNode; last?: boolean}> = ({a, b, children, last}) => {
	const t = useCurrentFrame() / FPS;
	if (t < a - 0.4 || t > b + 0.4) return null;
	const i = eout(P(t, a - 0.3, a + 0.4)), o = last ? 1 : 1 - P(t, b - 0.35, b + 0.15);
	return <AbsoluteFill style={{opacity: i * o, transform: `translateY(${(1 - i) * 60}px) scale(${1.05 - 0.05 * i})`}}>{children}</AbsoluteFill>;
};
const PartTitle: React.FC<{n: number; title: string; at: number}> = ({n, title, at}) => {
	const t = useCurrentFrame() / FPS;
	const k = P(t, at, at + 0.5) * (1 - P(t, at + 4.2, at + 4.8));
	if (k <= 0) return null;
	return (
		<div style={{position: 'absolute', left: 80, bottom: 60, opacity: k, transform: `translateX(${(1 - eout(Math.min(1, k * 1.2))) * -60}px)`}}>
			<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 24, color: C.yellow, letterSpacing: 4}}>PART {n}</div>
			<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 50, color: C.white, textShadow: '0 4px 20px rgba(0,0,0,.7)'}}>{title}</div>
			<div style={{height: 5, width: 160, background: C.yellow, borderRadius: 3, marginTop: 10, boxShadow: `0 0 14px ${C.yellow}`}} />
		</div>
	);
};
const Pop: React.FC<{t: number; at: number; x: number; y: number; children: React.ReactNode; rot?: number}> = ({t, at, x, y, children, rot}) => <At x={x} y={y} s={pop(t, at - 0.3)} rot={rot}>{children}</At>;
const Ticket: React.FC<{label: string; price: string; col: string; k: number}> = ({label, price, col, k}) => (
	<div style={{width: 300, height: 170, borderRadius: 16, background: `linear-gradient(135deg, ${col}, ${col}aa)`, border: '4px dashed rgba(10,13,20,.5)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 30px ${col}55`}}>
		<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 26, color: C.ink}}>{label}</div>
		<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 64, color: C.ink, opacity: k}}>{price}</div>
	</div>
);
const Tile: React.FC<{text: string; col: string; on: number}> = ({text, col, on}) => (
	<div style={{width: 330, height: 150, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 14, boxSizing: 'border-box', background: on > 0.5 ? `${col}22` : 'rgba(255,255,255,.04)', border: `3px solid ${on > 0.5 ? col : 'rgba(255,255,255,.15)'}`, boxShadow: on > 0.5 ? `0 0 26px ${col}66` : undefined, fontFamily: DISPLAY, fontWeight: 900, fontSize: 30, color: on > 0.5 ? C.white : C.mute, transform: `scale(${0.9 + 0.1 * on})`}}>{text}</div>
);

const PARTS = ['The button that does nothing', 'Case file one: the crosswalk', 'New York, 2004', 'Not all of them are fake', 'Case file two: the elevator', 'Case file three: the thermostat', 'The illusion of control', 'Designing the wait', 'Is it a lie?', 'So what does it actually do?'];

export const BtnLong: React.FC<{data: any}> = ({data}) => {
	const K = data.k, ch = chapters(data, 10), dur = data.dur;
	const t = useCurrentFrame() / FPS;
	const MUSIC = 80, loops = Math.ceil(dur / (MUSIC - 4)) + 1;
	const cta = K.cta !== undefined ? 1 - P(t, K.cta - 0.4, K.cta) : 1;
	const presses = [1.2, 3.0, 5.4];
	const press = presses.reduce((a, p) => a + Math.sin(P(t, p, p + 0.25) * Math.PI), 0);
	const active = t < ch[1] ? -1 : t < ch[4] ? 0 : t < ch[5] ? 1 : t < ch[6] ? 2 : -1;
	const caseO = P(t, ch[1] - 0.3, ch[1] + 0.3) * (1 - P(t, ch[6] - 0.3, ch[6] + 0.2));
	return (
		<AbsoluteFill>
			<CityBg w={1920} h={1080} />
			{/* 1 hook */}
			<Win a={0} b={ch[1]}>
				<At x={1420} y={540}><PushButton size={430} press={press} glow={0.6 + 0.3 * Math.sin(t * 2)} label={'PUSH\nAND WAIT'} fake={P(t, K.notbroken + 6, K.notbroken + 6.4) * (t < K.why0 ? 1 : 0)} /></At>
				<Pop t={t} at={K.millions} x={540} y={220}><Title text="MILLIONS PRESS IT" col={C.white} size={78} /></Pop>
				<Pop t={t} at={K.nothing0} x={540} y={330}><Title text="IT DOES NOTHING" col={C.yellow} size={88} glow={C.yellow} /></Pop>
				<Pop t={t} at={K.notbroken} x={540} y={450}><Pill text="AND IT ISN'T BROKEN" bg={C.red} fg="#fff" size={34} /></Pop>
				{[['ON YOUR STREET CORNER', K.corner], ['IN YOUR OFFICE', K.office0], ['IN YOUR ELEVATOR', K.elev0]].map(([x, a]: any, i) => <Pop key={i} t={t} at={a} x={540} y={570 + i * 80}><Txt text={x} col={C.white} size={36} /></Pop>)}
				<Pop t={t} at={K.why0} x={540} y={850}><Badge text="WHO DECIDED THIS — AND WHY?" col={C.cyan} size={40} /></Pop>
			</Win>
			{/* 2 beg button */}
			<Win a={ch[1]} b={ch[2]}>
				<Pop t={t} at={K.beg} x={540} y={250}><Title text="THE “BEG BUTTON”" col={C.yellow} size={84} glow={C.yellow} /></Pop>
				<Pop t={t} at={K.didwork} x={540} y={430}><Card w={700} col={C.green} top="MID-20TH CENTURY" big="Press → the light changes" sub="a signal to a box on the corner" /></Pop>
				<Pop t={t} at={K.grew} x={540} y={640}><Card w={700} col={C.amber} top="THEN CITIES GREW" big="Every press breaks the green wave" /></Pop>
				<Pop t={t} at={K.computers} x={540} y={830}><Pill text="LIGHTS HANDED OVER TO COMPUTERS" bg={C.cyan} size={32} /></Pop>
				<At x={1250} y={560} s={pop(t, ch[1] + 0.1)}><TrafficLight h={620} t={t} /></At>
				<At x={1620} y={460} s={pop(t, K.boxcorner - 0.3)}><PushButton size={260} press={Math.sin(P(t, K.permission, K.permission + 0.25) * Math.PI) + Math.sin(P(t, K.boxcorner + 0.5, K.boxcorner + 0.75) * Math.PI)} glow={0.5} /></At>
				<At x={1620} y={800} s={pop(t, K.computers - 0.4)}><Clock size={240} t={t} /></At>
			</Win>
			{/* 3 NYC */}
			<Win a={ch[2]} b={ch[3]}>
				<Pop t={t} at={K.nyt} x={540} y={230}><Badge text="THE NEW YORK TIMES · 2004" col={C.yellow} size={40} /></Pop>
				<Pop t={t} at={K.n3250} x={540} y={360}><Txt text="NYC pedestrian buttons: ~3,250" col={C.white} size={42} /></Pop>
				<At x={540} y={510} s={t < K.n2500 - 0.3 ? 0 : 2 - eout(P(t, K.n2500 - 0.3, K.n2500))} rot={-5}><div style={{display: 'flex', alignItems: 'baseline', gap: 20, fontFamily: DISPLAY, fontWeight: 900, color: C.red, border: `7px solid ${C.red}`, borderRadius: 22, padding: '4px 28px', background: 'rgba(20,4,4,.85)'}}><span style={{fontSize: 100}}>2,500+</span><span style={{fontSize: 44}}>DID NOTHING</span></div></At>
				<Pop t={t} at={K.threefour} x={540} y={660}><Txt text="more than 3 out of 4" col={C.mute} size={38} /></Pop>
				<Pop t={t} at={K.hundreds} x={540} y={790}><Card w={640} col={C.amber} top="REMOVING ONE" big="≈ hundreds of $" sub="× thousands of corners" /></Pop>
				<Pop t={t} at={K.stayed} x={540} y={930}><Pill text="SO THE DEAD BUTTONS STAYED" bg={C.yellow} size={32} /></Pop>
				<At x={1400} y={560}><div style={{display: 'grid', gridTemplateColumns: 'repeat(10, 62px)', gap: 14}}>{Array.from({length: 80}).map((_, i) => {const fake = (i * 53 + 7) % 17 >= 4; const v = P(t, K.n3250 - 0.4 + i * 0.01, K.n3250 + i * 0.01); const red = fake && t > K.n2500 - 0.2 + (i % 10) * 0.02; return <div key={i} style={{width: 62, height: 62, borderRadius: '50%', background: red ? C.red : 'radial-gradient(circle at 40% 35%, #fff2a0, #e0a800)', opacity: v, transform: `scale(${0.4 + 0.6 * eout(v)})`, border: !fake && t > K.n2500 ? `4px solid ${C.green}` : undefined, boxShadow: !fake && t > K.n2500 ? `0 0 16px ${C.green}` : undefined}} />;})}</div></At>
			</Win>
			{/* 4 not all */}
			<Win a={ch[3]} b={ch[4]}>
				<Pop t={t} at={K.notevery} x={540} y={250}><Title text="NOT ALL OF THEM" col={C.white} size={84} /></Pop>
				<Pop t={t} at={K.notevery + 0.5} x={540} y={350}><Txt text="are fake — and they all look the same" col={C.mute} size={38} /></Pop>
				<Pop t={t} at={K.y2020} x={540} y={600}><Card w={700} col={C.cyan} top="2020 · THE PANDEMIC" big="Crossings set to automatic" sub="so nobody had to touch the button" /></Pop>
				<Pop t={t} at={K.nochange} x={540} y={810}><Title text="…AND NOTHING CHANGED" col={C.yellow} size={56} glow={C.yellow} /></Pop>
				<At x={1400} y={540}><div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 330px)', gap: 26}}>{[['REAL SWITCH', C.green, K.suburbs], ['NIGHT-ONLY SWITCH', C.cyan, K.latenight], ['ACCESSIBILITY DEVICE', C.amber, K.blind], ['DECORATION', C.red, K.identical - 1.2]].map(([x, col, a]: any, i) => <div key={i} style={{transform: `scale(${pop(t, a - 0.3)})`}}><Tile text={x} col={col} on={P(t, a - 0.2, a + 0.2)} /></div>)}</div></At>
			</Win>
			{/* 5 elevator */}
			<Win a={ch[4]} b={ch[5]}>
				<Pop t={t} at={K.doorclose} x={540} y={240}><Title text="“DOOR CLOSE”" col={C.white} size={92} /></Pop>
				<Pop t={t} at={K.nofaster} x={540} y={360}><Pill text="OFTEN: NO FASTER AT ALL" bg={C.red} fg="#fff" size={34} /></Pop>
				<Pop t={t} at={K.ada} x={540} y={540}><Card w={700} col={C.cyan} top="AMERICANS WITH DISABILITIES ACT · 1990" big="Doors stay open long enough" sub="cane · walker · wheelchair" /></Pop>
				<Pop t={t} at={K.firemode} x={540} y={750}><Card w={700} col={C.red} top="SPECIAL KEY" big="Fire service mode: it works" /></Pop>
				<Pop t={t} at={K.helmets} x={540} y={920}><Txt text="…for people wearing helmets" col={C.yellow} size={42} /></Pop>
				<At x={1400} y={560} s={pop(t, ch[4] + 0.1)}><LiftPanel w={480} pressClose={[K.arrows, K.doorclose + 0.8, K.nofaster].reduce((a, p) => a + Math.sin(P(t, p, p + 0.22) * Math.PI), 0)} fire={P(t, K.firemode - 0.2, K.firemode)} fake={P(t, K.nofaster, K.nofaster + 0.3)} /></At>
			</Win>
			{/* 6 thermostat */}
			<Win a={ch[5]} b={ch[6]}>
				<Pop t={t} at={K.wsj} x={540} y={240}><Badge text="THE WALL STREET JOURNAL · 2003" col={C.cyan} size={36} /></Pop>
				<Pop t={t} at={K.notconn} x={540} y={380}><Title text="CONNECTED TO NOTHING" col={C.red} size={66} /></Pop>
				<Pop t={t} at={K.centralsys} x={540} y={490}><Txt text="the real control is somewhere else in the building" col={C.mute} size={32} /></Pop>
				<Pop t={t} at={K.survey} x={540} y={650}><Card w={700} col={C.amber} top="TRADE-MAGAZINE SURVEY" big="Many techs installed dummies" /></Pop>
				<Pop t={t} at={K.complaints} x={540} y={830}><Title text="“FEELS WARMER”" col={C.amber} size={76} glow={C.amber} /></Pop>
				<At x={1380} y={470} s={pop(t, ch[5] + 0.2)}><Thermostat size={400} turn={P(t, K.dial, K.dial + 1.5) * 0.6 + 0.4 * P(t, K.complaints - 1, K.complaints)} wire={P(t, K.notconn, K.notconn + 0.5)} temp={21 + 3 * P(t, K.complaints - 1, K.warmer)} /></At>
			</Win>
			{/* 7 psychology */}
			<Win a={ch[6]} b={ch[7]}>
				<Pop t={t} at={K.illusion} x={540} y={220}><Badge text="THE ILLUSION OF CONTROL" col={C.cyan} size={46} /></Pop>
				<Pop t={t} at={K.langer} x={540} y={330}><Txt text="Ellen Langer · Harvard · 1970s" col={C.white} size={36} /></Pop>
				<At x={540} y={530} s={pop(t, K.lottery - 0.3)}><div style={{display: 'flex', gap: 40}}><Ticket label="HANDED" price="$" col={C.mute} k={P(t, K.times - 0.4, K.times)} /><div style={{transform: `scale(${1 + 0.15 * P(t, K.times - 0.3, K.times + 0.3)})`}}><Ticket label="CHOSEN" price="$$$$" col={C.yellow} k={P(t, K.times - 0.4, K.times)} /></div></div></At>
				<Pop t={t} at={K.odds} x={540} y={700}><Txt text="same odds · several × the price" col={C.mute} size={34} /></Pop>
				<At x={1400} y={420} s={pop(t, K.noise - 0.3)}><div style={{display: 'flex', flexDirection: 'column', gap: 40}}><Meter w={720} label="PERFORMANCE" v={0.3 + 0.6 * P(t, K.better - 0.5, K.better + 0.8)} col={C.green} /><Meter w={720} label="STRESS" v={0.9 - 0.6 * P(t, K.better - 0.3, K.better + 1)} col={C.red} /></div></At>
				<At x={1400} y={720} s={pop(t, K.stopbtn - 0.3)}><PushButton size={190} press={0} glow={0.7} /></At>
				<Pop t={t} at={K.never} x={1400} y={920}><Pill text="MOST NEVER PRESSED IT" bg={C.yellow} size={34} /></Pop>
			</Win>
			{/* 8 designing the wait */}
			<Win a={ch[7]} b={ch[8]}>
				<Pop t={t} at={K.mirrors} x={540} y={220}><Card w={700} col={C.cyan} top="ELEVATOR LOBBIES" big="Mirrors = shorter wait" /></Pop>
				<Pop t={t} at={K.houston} x={540} y={420}><Badge text="HOUSTON AIRPORT" col={C.yellow} size={44} /></Pop>
				<At x={540} y={600} s={pop(t, K.gates - 0.3)}><div style={{display: 'flex', flexDirection: 'column', gap: 26}}><Meter w={700} label="WALK TO BAGGAGE" v={0.15 + 0.8 * P(t, K.sixtimes - 0.4, K.sixtimes + 0.6)} col={C.cyan} /><Meter w={700} label="COMPLAINTS" v={0.9 - 0.85 * P(t, K.disappeared - 0.6, K.disappeared + 0.4)} col={C.red} /></div></At>
				<Pop t={t} at={K.eight} x={540} y={790}><Txt text="bags: ~8 min wait — complaints didn't stop" col={C.mute} size={32} /></Pop>
				<Pop t={t} at={K.labor} x={1400} y={300}><Badge text="THE LABOR ILLUSION" col={C.amber} size={44} /></Pop>
				<At x={1400} y={540} s={pop(t, K.phone - 0.3)}><div style={{width: 640, padding: 30, borderRadius: 26, background: 'rgba(10,13,20,.9)', border: `3px solid ${C.amber}`, boxSizing: 'border-box'}}>{['Checking 412 airlines…', 'Comparing prices…', 'Finding the best deal…'].map((x, i) => <div key={i} style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 30, color: t > K.phone + 1 + i * 1.6 ? C.white : C.mute, marginBottom: 12}}>{(t > K.phone + 2.4 + i * 1.6 ? '✓ ' : '· ') + x}</div>)}<div style={{height: 22, borderRadius: 11, background: 'rgba(255,255,255,.1)', marginTop: 10}}><div style={{height: 22, borderRadius: 11, width: `${100 * P(t, K.phone, K.labor)}%`, background: C.amber, boxShadow: `0 0 14px ${C.amber}`}} /></div></div></At>
			</Win>
			{/* 9 lie? */}
			<Win a={ch[8]} b={ch[9]}>
				<Pop t={t} at={K.lie} x={960} y={220}><Title text="IS IT A LIE?" col={C.yellow} size={110} glow={C.yellow} /></Pop>
				<Pop t={t} at={K.critics} x={560} y={560}><Card w={700} col={C.red} top="CRITICS" big="Teaches us to ignore buttons" sub="some cross on red" /></Pop>
				<Pop t={t} at={K.opposite} x={1360} y={560}><Card w={700} col={C.green} top="ENGINEERS" big="Costs nothing, calms millions" sub="traffic keeps moving" /></Pop>
				<Pop t={t} at={K.secret9} x={960} y={850}><Pill text="IT WORKS BEST WHEN YOU DON'T KNOW" bg={C.white} size={36} /></Pop>
			</Win>
			{/* 10 close */}
			<Win a={ch[9]} b={ch[10]} last>
				<At x={1420} y={540} o={cta}><PushButton size={430} press={Math.sin(P(t, K.threetimes - 0.2, K.threetimes + 0.05) * Math.PI) + Math.sin(P(t, K.threetimes + 0.3, K.threetimes + 0.55) * Math.PI) + Math.sin(P(t, K.threetimes + 0.8, K.threetimes + 1.05) * Math.PI)} glow={0.4 + 0.6 * P(t, K.foryou - 0.2, K.foryou + 0.3)} label={'PUSH\nAND WAIT'} /></At>
				{[['TURNS WAITING INTO DOING', K.doing], ['HELPLESSNESS → CONTROL', K.helpless], ['SHORTER MINUTE · WARMER ROOM', K.shorter10]].map(([x, a]: any, i) => <Pop key={i} t={t} at={a} x={540} y={220 + i * 100}><div style={{opacity: cta}}><Pill text={x} bg={[C.yellow, C.cyan, C.amber][i]} size={32} /></div></Pop>)}
				<At x={540} y={620} s={pop(t, K.neverlight - 0.3)} o={cta}><Txt text="it was never built for the light…" col={C.mute} size={42} /></At>
				<At x={540} y={750} s={pop(t, K.foryou - 0.3, 0.4)} o={cta}><Title text="IT WAS BUILT FOR YOU" col={C.yellow} size={84} glow={C.yellow} /></At>
			</Win>
			<At x={960} y={78}><CaseFile items={['CROSSWALK', 'ELEVATOR', 'THERMOSTAT']} stamps={[P(t, K.n2500, K.n2500 + 0.3), P(t, K.nofaster, K.nofaster + 0.3), P(t, K.notconn, K.notconn + 0.3)]} active={active} o={caseO} /></At>
			{PARTS.map((p, i) => <PartTitle key={i} n={i + 1} title={p} at={i === 0 ? 0.6 : ch[i] + 0.3} />)}
			<CTA K={K} S={L} cx={960} cy={-760} />
			{Array.from({length: loops}).map((_, i) => (
				<Sequence key={'m' + i} from={Math.round(i * (MUSIC - 4) * FPS)} durationInFrames={Math.round(MUSIC * FPS)} layout="none">
					<Audio src={staticFile('music.mp3')} volume={(f) => 0.11 * Math.min(1, f / (4 * FPS)) * Math.min(1, (MUSIC * FPS - f) / (4 * FPS)) * Math.min(1, (dur * FPS - (f + i * (MUSIC - 4) * FPS)) / 90)} />
				</Sequence>
			))}
			<Sequence from={15} layout="none"><Audio src={staticFile('long/voice.mp3')} volume={1.1} /></Sequence>
			{presses.map((p, i) => sfx('click.mp3', p, 0.32, 'c' + i))}
			{sfx('beep.mp3', K.computers, 0.2, 'be')}
			{sfx('lift.mp3', K.doorclose, 0.28, 'li')}
			{sfx('dial.mp3', K.dial, 0.32, 'di')}
			{sfx('click.mp3', K.threetimes - 0.2, 0.35, 'cf')}
		</AbsoluteFill>
	);
};
