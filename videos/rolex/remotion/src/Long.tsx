import React from 'react';
import {AbsoluteFill, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Audio} from '@remotion/media';
import {Bracelet, Card, Counter, DepthScale, Dial, Flag, GreenBg, Ownership, QueueBoard, Sea, Typed} from './Comps';
import {CTA} from './CTA';
import {Row, chapters, sfx} from './Short';
import {At, Badge, C, DISPLAY, FPS, P, Pill, Title, Txt, eio, eout, pop} from './ui';

const PARTS = ["A watch you can't buy", 'A German orphan in London', 'A word on a London bus', 'War and the move to Geneva', 'The Oyster', 'From Everest to the Mariana Trench', 'Owned by no one', 'Built to be scarce', 'How big is Rolex?', 'Selling time'];
const YEARS = ['1881', '1905', '1908', '1919', '1926', '1953', '1960', '2025'];
const E = [0, 7, 0.5, 2, 3, 4, 5.5, 6, 7, 7, 7];
const L = {sub: 'FOLLOW', subbed: 'FOLLOWING ✓', like: 'LIKE'};

const Win: React.FC<{a: number; b: number; children: React.ReactNode; last?: boolean}> = ({a, b, children, last}) => {
	const t = useCurrentFrame() / FPS;
	if (t < a - 0.4 || t > b + 0.4) return null;
	const i = eout(P(t, a - 0.35, a + 0.5)), o = last ? 1 : 1 - P(t, b - 0.4, b + 0.2);
	return <AbsoluteFill style={{opacity: i * o, transform: `rotate(${(1 - i) * -5}deg) scale(${1.04 - 0.04 * i})`}}>{children}</AbsoluteFill>;
};
const PartTitle: React.FC<{n: number; title: string; at: number}> = ({n, title, at}) => {
	const t = useCurrentFrame() / FPS;
	const k = P(t, at, at + 0.5) * (1 - P(t, at + 4.2, at + 4.8));
	if (k <= 0) return null;
	return (
		<div style={{position: 'absolute', left: 80, bottom: 70, opacity: k, transform: `translateX(${(1 - eout(Math.min(1, k * 1.2))) * -60}px)`}}>
			<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 26, color: C.gold, letterSpacing: 4}}>PART {n}</div>
			<div style={{fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 58, color: C.cream, textShadow: '0 4px 20px rgba(0,0,0,.7)'}}>{title}</div>
			<div style={{height: 5, width: 160, background: C.gold, borderRadius: 3, marginTop: 10, boxShadow: `0 0 14px ${C.gold}`}} />
		</div>
	);
};
const Pop: React.FC<{t: number; at: number; x: number; y: number; children: React.ReactNode; rot?: number}> = ({t, at, x, y, children, rot}) => <At x={x} y={y} s={pop(t, at - 0.3)} rot={rot}>{children}</At>;

export const RolexLong: React.FC<{data: any}> = ({data}) => {
	const K = data.k, ch = chapters(data, 10), dur = data.dur;
	const t = useCurrentFrame() / FPS;
	const MUSIC = 85, loops = Math.ceil(dur / MUSIC) + 1;
	let c = 0; while (c < 10 && t >= ch[c + 1]) c++;
	const n = Math.min(10, c + 1);
	const pos = c === 0 ? 7 - 7 * eio(P(t, K.wind - 1, K.wind + 1.5)) : E[n - 1] + (E[n] - E[n - 1]) * eio(P(t, ch[c], ch[c] + 1.4));
	const cta = K.cta !== undefined ? 1 - P(t, K.cta - 0.4, K.cta) : 1;
	const bob = Math.sin(t * 2) * 12;
	return (
		<AbsoluteFill>
			<GreenBg w={1920} h={1080} />
			{/* 1 */}
			<Win a={0} b={ch[1]}>
				<At x={1400} y={560}><Dial size={760} t={t} glow={0.7} /></At>
				<Pop t={t} at={K.million} x={540} y={200}><Title text="1,000,000+ WATCHES A YEAR" col={C.gold} size={56} glow={C.gold} /></Pop>
				<Pop t={t} at={K.waitlist} x={540} y={330}><Pill text="…AND A WAITLIST" bg={C.red} fg="#fff" size={36} /></Pop>
				<Pop t={t} at={K.noshare} x={540} y={460}><div style={{display: 'flex', gap: 14}}>{['NO SHAREHOLDERS', 'NO STOCK LISTING', 'NO PUBLIC RESULTS'].map((x, i) => <div key={i} style={{transform: `scale(${pop(t, K.noshare + i * 1.4)})`}}><Pill text={'✕ ' + x} bg={C.cream} size={22} /></div>)}</div></Pop>
				<Pop t={t} at={K.foundation} x={540} y={600}><Badge text="OWNED BY A FOUNDATION" col={C.gold} size={44} /></Pop>
				<Pop t={t} at={K.german} x={540} y={750}><Row><Flag c="de" w={100} /><div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 50, color: C.gold}}>→</div><Flag c="uk" w={100} /></Row></Pop>
				<Pop t={t} at={K.word} x={540} y={880}><Txt text="a made-up word → the most famous luxury brand" col={C.cream} size={34} /></Pop>
			</Win>
			{/* 2 */}
			<Win a={ch[1]} b={ch[2]}>
				<Pop t={t} at={K.born} x={520} y={200}><Badge text="HANS WILSDORF · b. 1881" col={C.gold} size={46} /></Pop>
				<Pop t={t} at={K.born + 0.6} x={520} y={310}><Flag c="de" w={110} /></Pop>
				<Pop t={t} at={K.orphan} x={520} y={430}><Pill text="ORPHANED AT 12" bg={C.cream} size={34} /></Pop>
				<Pop t={t} at={K.swiss} x={520} y={540}><Row><Flag c="ch" w={70} /><Txt text="first job: a Swiss watch exporter" col={C.cream} size={32} /></Row></Pop>
				<Pop t={t} at={K.y1903} x={520} y={660}><Row><Flag c="uk" w={110} /><Txt text="1903 · London" col={C.gold} size={44} /></Row></Pop>
				<Pop t={t} at={K.y1905} x={1400} y={300}><Card w={680} col={C.gold} top="1905 · AGED 24" big="Wilsdorf & Davis" sub="with his brother-in-law, Alfred Davis" /></Pop>
				<Pop t={t} at={K.movements} x={1400} y={540}><Pill text="SWISS MOVEMENTS · BRITISH CASES" bg={C.cream} size={30} /></Pop>
				<Pop t={t} at={K.bet} x={1400} y={760}><Dial size={360} t={t} tiltX={18} glow={0.5} /></Pop>
				<Pop t={t} at={K.bet + 0.4} x={1400} y={960}><Txt text="the bet: the wristwatch" col={C.gold} size={38} /></Pop>
			</Win>
			{/* 3 */}
			<Win a={ch[2]} b={ch[3]}>
				<Pop t={t} at={K.pocket} x={480} y={200}><Pill text="REAL MEN: POCKET WATCHES" bg={C.cream} size={32} /></Pop>
				<Pop t={t} at={K.jewelry} x={480} y={300}><Txt text="wristwatches = fragile jewelry" col={C.mute} size={34} /></Pop>
				<Pop t={t} at={K.y1908} x={480} y={440}><Pill text="1908" bg={C.gold} size={44} /></Pop>
				<At x={480} y={590}><Typed text="ROLEX" k={P(t, K.rolex - 1.4, K.rolex)} size={170} col={C.gold} /></At>
				<Pop t={t} at={K.short} x={480} y={760}><Txt text="short · fits on a dial · same in every language" col={C.cream} size={32} /></Pop>
				<Pop t={t} at={K.bus} x={480} y={860}><Pill text="…ON TOP OF A LONDON BUS (HIS STORY)" bg={C.red} fg="#fff" size={28} /></Pop>
				<Pop t={t} at={K.y1910} x={1400} y={330}><Card w={640} col={C.cream} top="1910 · SWITZERLAND" big="1st wrist chronometer" sub="official certificate" /></Pop>
				<Pop t={t} at={K.kew} x={1400} y={620}><Card w={640} col={C.gold} top="1914 · KEW OBSERVATORY, UK" big="Class A precision" sub="usually for ships' marine chronometers" /></Pop>
			</Win>
			{/* 4 */}
			<Win a={ch[3]} b={ch[4]}>
				<Pop t={t} at={K.ww1} x={960} y={200}><Badge text="WORLD WAR ONE" col={C.cream} size={50} /></Pop>
				<Pop t={t} at={K.trenches} x={960} y={300}><Txt text="soldiers switch to wristwatches" col={C.mute} size={34} /></Pop>
				<Pop t={t} at={K.duties} x={560} y={500} rot={-5}><div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 56, color: C.red, border: `7px solid ${C.red}`, borderRadius: 16, padding: '6px 24px', background: 'rgba(30,5,5,.6)'}}>IMPORT DUTIES ↑</div></Pop>
				<Pop t={t} at={K.suspicion} x={560} y={640}><Txt text="a German-born boss in wartime London" col={C.cream} size={32} /></Pop>
				<Pop t={t} at={K.y1919} x={1380} y={540}><Row gap={30}><Flag c="uk" w={180} /><div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 90, color: C.gold}}>→</div><Flag c="ch" w={150} /></Row></Pop>
				<Pop t={t} at={K.montres} x={1380} y={720}><Title text="1919 · MONTRES ROLEX, GENEVA" col={C.gold} size={52} glow={C.gold} /></Pop>
				<Pop t={t} at={K.bienne} x={960} y={900}><Pill text="MOVEMENTS FROM BIENNE · BOUGHT OUTRIGHT IN 2004" bg={C.cream} size={30} /></Pop>
			</Win>
			{/* 5 */}
			<Win a={ch[4]} b={ch[5]}>
				<At x={520} y={460 + bob}><Dial size={520} t={t} tiltX={22} glow={0.5} /></At>
				<At x={520} y={760}><Sea w={1000} h={520} t={t} /></At>
				<Pop t={t} at={K.y1926} x={1400} y={190}><Badge text="1926 · THE OYSTER" col={C.gold} size={50} /></Pop>
				<Pop t={t} at={K.screw} x={1400} y={300}><Txt text="screw-down crown & case back · sealed like a hatch" col={C.cream} size={30} /></Pop>
				<Pop t={t} at={K.gleitze} x={1400} y={470}><Card w={660} col={C.cyan} top="1927 · MERCEDES GLEITZE" big="≈ 10 h in the Channel" sub={t > K.running - 0.3 ? '✓ still running' : ' '} /></Pop>
				<Pop t={t} at={K.mail} x={1400} y={680}><Pill text="FRONT PAGE OF THE DAILY MAIL" bg={C.cream} size={30} /></Pop>
				<Pop t={t} at={K.tanks} x={1400} y={780}><Pill text="OYSTERS IN SHOP-WINDOW FISH TANKS" bg={C.cyan} size={28} /></Pop>
				<Pop t={t} at={K.rotor} x={1400} y={900}><Badge text="1931 · PERPETUAL ROTOR" col={C.gold} size={40} /></Pop>
			</Win>
			{/* 6 */}
			<Win a={ch[5]} b={ch[6]}>
				<At x={520} y={590}><DepthScale h={820} k={P(t, ch[5], ch[5] + 0.6)} up={eio(P(t, K.everest - 0.5, K.everest + 0.8)) * (1 - eio(P(t, K.trieste - 1.2, K.trieste - 0.4)))} down={eio(P(t, K.trieste - 0.4, K.trench + 0.6))} L={{top: 'EVEREST · 1953', sea: 'sea level', bottom: 'MARIANA TRENCH · 1960'}} /></At>
				{[['1945', 'DATEJUST', K.datejust], ['1953', 'SUBMARINER', K.sub], ['1953', 'EXPLORER', K.explorer], ['1955', 'GMT-MASTER · PAN AM', K.gmt], ['1960', 'TRIESTE · ≈ 11 KM DOWN', K.trieste], ['2012', 'JAMES CAMERON', K.cameron]].map(([y, x, a]: any, i) => (
					<At key={i} x={1420} y={190 + i * 120} s={pop(t, a - 0.3)}><div style={{display: 'flex', alignItems: 'center', gap: 18, width: 760}}><div style={{fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 44, color: C.gold, width: 130}}>{y}</div><Pill text={x} bg={i === 4 ? C.cyan : C.cream} size={30} /></div></At>
				))}
			</Win>
			{/* 7 */}
			<Win a={ch[6]} b={ch[7]}>
				<Pop t={t} at={K.wife} x={520} y={220}><Pill text="1944 · HIS WIFE DIES · NO CHILDREN" bg={C.cream} size={30} /></Pop>
				<Pop t={t} at={K.created} x={520} y={340}><Badge text="1945 · THE FOUNDATION" col={C.gold} size={44} /></Pop>
				<Pop t={t} at={K.y1960} x={520} y={460}><Txt text="1960 · it takes control of Rolex" col={C.cream} size={36} /></Pop>
				<Pop t={t} at={K.charity} x={520} y={640}><Card w={640} col={C.gold} top="THE MONEY" big="Charities & the company" sub="many projects in Geneva" /></Pop>
				<Pop t={t} at={K.decades} x={520} y={860}><Title text="DECADES, NOT QUARTERS" col={C.gold} size={58} glow={C.gold} /></Pop>
				<At x={1400} y={560} s={pop(t, K.created - 0.4)}><Ownership w={760} k={eout(P(t, K.y1960 - 0.5, K.y1960 + 1))} L={{own: 'WHO OWNS IT', fnd: 'The Hans Wilsdorf Foundation', no1: 'FAMILY', no2: 'SHAREHOLDERS'}} n1={pop(t, K.nofamily - 0.3)} n2={pop(t, K.quarterly - 0.3)} /></At>
			</Win>
			{/* 8 */}
			<Win a={ch[7]} b={ch[8]}>
				<Pop t={t} at={K.itself} x={520} y={200}><Badge text="MADE IN-HOUSE" col={C.gold} size={46} /></Pop>
				{[['OWN GOLD FOUNDRY', K.foundry], ['OWN STEEL: OYSTERSTEEL', K.foundry + 4], ['RE-TESTED AFTER CASING', K.foundry + 9], ['ONLY AUTHORIZED DEALERS', K.dealers]].map(([x, a]: any, i) => <Pop key={i} t={t} at={a} x={520} y={330 + i * 100}><Pill text={x} bg={i % 2 ? C.cream : C.gold} size={30} /></Pop>)}
				<Pop t={t} at={K.boom} x={520} y={800}><Card w={640} col={C.red} top="2021–2022 BOOM" big="Resale > store price" sub="then prices cooled" /></Pop>
				<At x={1400} y={420} s={pop(t, K.price - 0.4)}><QueueBoard w={760} t={t} t0={K.price} L={{now: 'NOW SERVING', you: 'YOUR NUMBER'}} /></At>
				<Pop t={t} at={K.bucherer} x={1400} y={700}><Card w={640} col={C.gold} top="2023" big="Buys Bucherer" sub="its largest retail partner" /></Pop>
				<Pop t={t} at={K.preowned} x={1400} y={900}><Pill text="+ CERTIFIED PRE-OWNED" bg={C.cream} size={32} /></Pop>
			</Win>
			{/* 9 */}
			<Win a={ch[8]} b={ch[9]}>
				<At x={1400} y={560}><Dial size={700} t={t} glow={0.9} /></At>
				<Pop t={t} at={K.estimate} x={540} y={230}><Txt text="no published numbers → analyst estimates" col={C.mute} size={34} /></Pop>
				<Pop t={t} at={K.b11} x={540} y={400}><Counter k={P(t, K.b11 - 0.3, K.b11 + 1.2)} to={11} fmt={(v) => `≈ CHF ${v.toFixed(0)} BILLION`} col={C.gold} size={84} /></Pop>
				<Pop t={t} at={K.b11 + 0.5} x={540} y={500}><Txt text="a year" col={C.cream} size={36} /></Pop>
				<Pop t={t} at={K.third} x={540} y={660}><Card w={640} col={C.gold} top="SHARE OF SWISS WATCH SALES (EST.)" big="≈ 1 / 3" /></Pop>
				<Pop t={t} at={K.back} x={540} y={880}><Pill text="NO DIVIDENDS → BACK INTO THE BUSINESS" bg={C.cream} size={28} /></Pop>
			</Win>
			{/* 10 */}
			<Win a={ch[9]} b={ch[10]} last>
				<At x={1400} y={560} o={cta}><Dial size={760} t={t} glow={1} /></At>
				{[['AN ORPHAN FROM BAVARIA', K.orphan2, C.cream], ['A WORD ON A LONDON BUS', K.bus2, C.gold], ['THE CHANNEL · EVEREST · THE TRENCH', K.survived, C.cyan], ['OWNED BY NO ONE', K.noone, C.cream]].map(([x, a, col]: any, j) => <At key={j} x={540} y={220 + j * 120} s={pop(t, a - 0.3)} o={cta}><Pill text={x} bg={col} size={32} /></At>)}
				<At x={540} y={820} s={pop(t, K.time - 0.6)} o={cta}><Title text="IT SELLS TIME" col={C.gold} size={96} glow={C.gold} /></At>
			</Win>
			<At x={960} y={58}><div style={{transform: 'scale(.78)'}}><Bracelet w={1500} years={YEARS} pos={pos} o={P(t, K.wind - 1.5, K.wind - 0.5) * cta} /></div></At>
			{PARTS.map((p, i) => <PartTitle key={i} n={i + 1} title={p} at={i === 0 ? 0.6 : ch[i] + 0.3} />)}
			<CTA K={K} S={L} cx={960} cy={-760} />
			{Array.from({length: loops}).map((_, i) => (
				<Sequence key={'m' + i} from={Math.round(i * (MUSIC - 4) * FPS)} durationInFrames={Math.round(MUSIC * FPS)} layout="none">
					<Audio src={staticFile('music.mp3')} volume={(f) => 0.12 * Math.min(1, f / (4 * FPS)) * Math.min(1, (MUSIC * FPS - f) / (4 * FPS)) * Math.min(1, (dur * FPS - (f + i * (MUSIC - 4) * FPS)) / 90)} />
				</Sequence>
			))}
			<Sequence from={15} layout="none"><Audio src={staticFile('long/voice.mp3')} volume={1.1} /></Sequence>
			{sfx('wind.mp3', 0.5, 0.32, 'wi')}
			{sfx('splash.mp3', K.channel - 0.3, 0.28, 'sp')}
			{sfx('deep.mp3', K.trieste, 0.28, 'dp')}
			{sfx('coins.mp3', K.b11 - 0.2, 0.22, 'co')}
		</AbsoluteFill>
	);
};
