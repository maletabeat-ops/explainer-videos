import React from 'react';
import {AbsoluteFill, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Audio} from '@remotion/media';
import {Bill, Bottle3D, Calendar, CapRow, Card, Counter, Glasses, RedBg, SantaSwatches, Truck} from './Comps';
import {CTA} from './CTA';
import {chapters, sfx} from './Short';
import {At, Badge, C, DISPLAY, FPS, P, Pill, Title, Txt, eio, eout, pop} from './ui';

const PARTS = ['Two billion a day', 'A pharmacist in Atlanta', "Asa Candler's marketing machine", 'The one-dollar deal', 'The bottle you can feel in the dark', 'A Coke for every soldier', 'The cola wars', 'New Coke: 79 days', 'How Coke shaped Santa', 'Holidays are coming', 'A secret in a vault'];
const YEARS = ['1886', '1899', '1915', '1931', '1985', '1995', '2025'];
const E = [0, 6, 0, 0.5, 1, 2, 2.5, 3.5, 4, 3, 5, 6];
const L = {sub: 'FOLLOW', subbed: 'FOLLOWING ✓', like: 'LIKE'};

const Win: React.FC<{a: number; b: number; children: React.ReactNode; last?: boolean}> = ({a, b, children, last}) => {
	const t = useCurrentFrame() / FPS;
	if (t < a - 0.4 || t > b + 0.4) return null;
	const i = eout(P(t, a - 0.35, a + 0.5)), o = last ? 1 : 1 - P(t, b - 0.4, b + 0.2);
	return <AbsoluteFill style={{opacity: i * o, transform: `translateY(${(1 - i) * 40}px)`}}>{children}</AbsoluteFill>;
};
const PartTitle: React.FC<{n: number; title: string; at: number}> = ({n, title, at}) => {
	const t = useCurrentFrame() / FPS;
	const k = P(t, at, at + 0.5) * (1 - P(t, at + 4.2, at + 4.8));
	if (k <= 0) return null;
	return (
		<div style={{position: 'absolute', left: 80, bottom: 70, opacity: k, transform: `translateX(${(1 - eout(Math.min(1, k * 1.2))) * -60}px)`}}>
			<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 26, color: C.red, letterSpacing: 4}}>PART {n}</div>
			<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 56, color: C.white, textShadow: '0 4px 20px rgba(0,0,0,.7)'}}>{title}</div>
			<div style={{height: 5, width: 160, background: C.red, borderRadius: 3, marginTop: 10, boxShadow: `0 0 14px ${C.red}`}} />
		</div>
	);
};
const Pop: React.FC<{t: number; at: number; x: number; y: number; children: React.ReactNode; rot?: number}> = ({t, at, x, y, children, rot}) => <At x={x} y={y} s={pop(t, at - 0.3)} rot={rot}>{children}</At>;

export const CokeLong: React.FC<{data: any}> = ({data}) => {
	const K = data.k, ch = chapters(data, 11), dur = data.dur;
	const t = useCurrentFrame() / FPS;
	const MUSIC = 90, loops = Math.ceil(dur / MUSIC) + 1;
	let c = 0; while (c < 11 && t >= ch[c + 1]) c++;
	const n = Math.min(11, c + 1);
	const pos = c === 0 ? 6 - 6 * eio(P(t, K.open - 1, K.open + 1.5)) : E[n - 1] + (E[n] - E[n - 1]) * eio(P(t, ch[c], ch[c] + 1.4));
	const cta = K.cta !== undefined ? 1 - P(t, K.cta - 0.4, K.cta) : 1;
	const snow = P(t, ch[8], ch[8] + 1.5) * (1 - P(t, ch[10], ch[10] + 1.5) * 0.5);
	const night = P(t, ch[9] - 0.3, ch[9] + 0.6) * (1 - P(t, ch[10], ch[10] + 1));
	return (
		<AbsoluteFill>
			<RedBg w={1920} h={1080} snow={snow} night={night} />
			{/* 1 */}
			<Win a={0} b={ch[1]}>
				<At x={1400} y={600}><Bottle3D w={760} h={940} t={t} glow={0.7} dist={7} /></At>
				<Pop t={t} at={K.servings} x={540} y={200}><Counter k={P(t, K.servings - 0.3, K.servings + 1)} to={2.2} fmt={(v) => `${v.toFixed(1)} BILLION`} col={C.white} size={90} /></Pop>
				<Pop t={t} at={K.servings + 0.4} x={540} y={300}><Txt text="servings a day · 200+ countries" col={C.red} size={36} /></Pop>
				<Pop t={t} at={K.medicine} x={540} y={450}><Pill text="IT STARTED AS A MEDICINE" bg={C.white} size={34} /></Pop>
				<Pop t={t} at={K.war0} x={540} y={560}><Pill text="A BOTTLE WAR · A WORLD WAR · A FLOP" bg={C.gold} size={30} /></Pop>
				<Pop t={t} at={K.santa0} x={540} y={720}><Title text="DID COKE INVENT SANTA?" col={C.red} size={60} glow={C.red} /></Pop>
				<Pop t={t} at={K.santa0 + 1.2} x={540} y={810}><Txt text="(no.)" col={C.mute} size={40} /></Pop>
			</Win>
			{/* 2 */}
			<Win a={ch[1]} b={ch[2]}>
				<Pop t={t} at={K.pemberton} x={540} y={190}><Badge text="JOHN PEMBERTON · ATLANTA" col={C.gold} size={44} /></Pop>
				<Pop t={t} at={K.veteran} x={540} y={300}><Txt text="pharmacist · wounded Civil War veteran" col={C.white} size={32} /></Pop>
				<Pop t={t} at={K.cocawine} x={540} y={410}><Pill text="FIRST: A COCA WINE" bg={C.white} size={30} /></Pop>
				<Pop t={t} at={K.ban} x={540} y={500}><Pill text="1886: ATLANTA BANS ALCOHOL" bg={C.red} fg="#fff" size={30} /></Pop>
				<Pop t={t} at={K.syrup} x={540} y={600}><Txt text="→ coca leaf extract + kola nut caffeine" col={C.white} size={32} /></Pop>
				<Pop t={t} at={K.robinson} x={1400} y={260}><Card w={640} col={C.white} top="BOOKKEEPER FRANK ROBINSON" big="Named it + wrote the script" /></Pop>
				<Pop t={t} at={K.cents} x={1400} y={460}><Card w={640} col={C.gold} top="SODA FOUNTAIN" big="5¢ a glass" /></Pop>
				<At x={1400} y={700} s={pop(t, K.nine - 1.4)}><Glasses n={9} k={P(t, K.nine - 1.2, K.nine + 0.6)} size={66} /></At>
				<Pop t={t} at={K.nine} x={1400} y={880}><Title text="9 GLASSES A DAY" col={C.red} size={70} glow={C.red} /></Pop>
			</Win>
			{/* 3 */}
			<Win a={ch[2]} b={ch[3]}>
				<Pop t={t} at={K.candler} x={540} y={220}><Badge text="ASA CANDLER" col={C.gold} size={54} /></Pop>
				<Pop t={t} at={K.coupons} x={540} y={340}><Card w={620} col={C.white} top="MARKETING TRICK #1" big="Coupons for a free glass" /></Pop>
				<Pop t={t} at={K.calendars} x={540} y={580}><Card w={620} col={C.red} top="MARKETING TRICK #2" big="The logo on everything" sub="calendars · clocks · trays · signs" /></Pop>
				<Pop t={t} at={K.cocaine} x={540} y={780}><Pill text="EARLY 1900s: COCAINE REMOVED" bg={C.white} size={30} /></Pop>
				<Pop t={t} at={K.y1919} x={1400} y={540}><Card w={620} col={C.green} top="1919 · SOLD TO ERNEST WOODRUFF'S GROUP" big="$25 million" /></Pop>
			</Win>
			{/* 4 */}
			<Win a={ch[3]} b={ch[4]}>
				<Pop t={t} at={K.fountains} x={540} y={220}><Txt text="Candler: fountains > bottles" col={C.white} size={40} /></Pop>
				<At x={540} y={540} s={pop(t, K.y1899 - 0.4)}><Bill w={760} stamp={P(t, K.dollar - 0.1, K.dollar + 0.25)} label="BOTTLING RIGHTS" /></At>
				<Pop t={t} at={K.collected} x={540} y={820}><Txt text="…and he reportedly never collected it" col={C.mute} size={34} /></Pop>
				<Pop t={t} at={K.network} x={1400} y={380}><Card w={620} col={C.white} top="THE COCA-COLA SYSTEM" big="Syrup + local bottlers" /></Pop>
				<Pop t={t} at={K.close} x={1400} y={600}><Pill text="MADE CLOSE TO WHERE IT'S SOLD" bg={C.red} fg="#fff" size={30} /></Pop>
			</Win>
			{/* 5 */}
			<Win a={ch[4]} b={ch[5]}>
				<At x={1400} y={600}><Bottle3D w={760} h={940} dist={7} t={t} glow={0.5 + 0.5 * P(t, K.touch - 0.3, K.touch + 0.3)} spin={0.6} /></At>
				<Pop t={t} at={K.kokanola} x={540} y={220}><Pill text="COPYCATS: KOKA-NOLA · KO-KOLA…" bg={C.white} size={30} /></Pop>
				<Pop t={t} at={K.y1915} x={540} y={360}><Badge text="1915 · THE BRIEF" col={C.gold} size={48} /></Pop>
				<Pop t={t} at={K.touch} x={540} y={490}><Txt text="recognize it by touch, in the dark…" col={C.white} size={36} /></Pop>
				<Pop t={t} at={K.broken} x={540} y={560}><Txt text="…even broken on the ground" col={C.white} size={36} /></Pop>
				<Pop t={t} at={K.cocoa} x={540} y={720}><Card w={620} col={C.gold} top="LEGEND · ROOT GLASS CO." big="Inspired by a cocoa pod" /></Pop>
				<Pop t={t} at={K.trademark} x={540} y={900}><Pill text="A SHAPE REGISTERED AS A TRADEMARK" bg={C.red} fg="#fff" size={28} /></Pop>
			</Win>
			{/* 6 */}
			<Win a={ch[5]} b={ch[6]}>
				<Pop t={t} at={K.robert} x={540} y={220}><Badge text="WWII · ROBERT WOODRUFF" col={C.gold} size={46} /></Pop>
				<Pop t={t} at={K.promise} x={540} y={380}><Card w={640} col={C.white} top="THE PROMISE" big="A Coke for every soldier, 5¢" /></Pop>
				<Pop t={t} at={K.plants} x={540} y={590}><Pill text="BOTTLING PLANTS NEAR THE FRONT" bg={C.red} fg="#fff" size={30} /></Pop>
				<Pop t={t} at={K.headstart} x={540} y={700}><Txt text="after the war: a head start worldwide" col={C.white} size={32} /></Pop>
				<Pop t={t} at={K.fanta} x={1400} y={540}><Card w={560} col={C.gold} top="WARTIME GERMANY, NO SYRUP" big="Fanta is born" /></Pop>
			</Win>
			{/* 7 */}
			<Win a={ch[6]} b={ch[7]}>
				<Pop t={t} at={K.pepsi} x={540} y={240}><Card w={640} col={C.blue} top="1893 · CALEB BRADHAM, PHARMACIST" big="Pepsi is born" /></Pop>
				<Pop t={t} at={K.colawars} x={540} y={470}><Title text="THE COLA WARS" col={C.white} size={80} /></Pop>
				<Pop t={t} at={K.challenger} x={540} y={680}><Card w={640} col={C.ice} top="1985 · SPACE SHUTTLE CHALLENGER" big="Cola in space" sub="no gravity → warm, foamy, meh" /></Pop>
				<At x={1400} y={540} o={0.9}><Bottle3D w={620} h={860} t={t} glow={0.6} tilt={Math.sin(t * 0.8) * 0.3} /></At>
			</Win>
			{/* 8 */}
			<Win a={ch[7]} b={ch[8]}>
				<Pop t={t} at={K.challenge} x={540} y={200}><Pill text="THE PEPSI CHALLENGE · BLIND TESTS" bg={C.blue} fg="#fff" size={30} /></Pop>
				<Pop t={t} at={K.tests} x={540} y={320}><Txt text="≈ 200,000 taste tests → change the formula" col={C.white} size={32} /></Pop>
				<Pop t={t} at={K.newcoke} x={540} y={500}>
					<div style={{position: 'relative'}}>
						<div style={{padding: '30px 60px', borderRadius: 26, background: 'linear-gradient(160deg,#e4002b,#8a0018)', fontFamily: DISPLAY, fontWeight: 900, fontSize: 76, color: '#fff'}}>NEW COKE · 1985</div>
						{t > K.furious - 0.2 ? <svg width="620" height="200" viewBox="0 0 620 200" style={{position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', overflow: 'visible'}}><path d={`M10 10 L${10 + 600 * eout(P(t, K.furious - 0.2, K.furious + 0.2))} ${10 + 180 * eout(P(t, K.furious - 0.2, K.furious + 0.2))}`} stroke="#fff" strokeWidth="16" strokeLinecap="round" /><path d={`M610 10 L${610 - 600 * eout(P(t, K.furious, K.furious + 0.4))} ${10 + 180 * eout(P(t, K.furious, K.furious + 0.4))}`} stroke="#fff" strokeWidth="16" strokeLinecap="round" /></svg> : null}
					</div>
				</Pop>
				<Pop t={t} at={K.hotline} x={540} y={720}><Txt text="hoarding · protests · thousands of angry calls" col={C.white} size={30} /></Pop>
				<At x={1400} y={440} s={pop(t, K.d79 - 0.6)}><Calendar k={P(t, K.d79 - 0.6, K.d79 + 0.6)} size={340} label="DAYS" /></At>
				<Pop t={t} at={K.classic} x={1400} y={760}><Pill text="BACK AS COCA-COLA CLASSIC" bg={C.green} size={32} /></Pop>
			</Win>
			{/* 9 */}
			<Win a={ch[8]} b={ch[9]}>
				<Pop t={t} at={K.summer} x={540} y={200}><Pill text="PROBLEM: A “SUMMER DRINK”" bg={C.white} size={30} /></Pop>
				<Pop t={t} at={K.sundblom} x={540} y={320}><Badge text="1931 · HADDON SUNDBLOM" col={C.gold} size={44} /></Pop>
				<Pop t={t} at={K.thirty} x={540} y={430}><Txt text="30+ years of warm, chubby Santas" col={C.white} size={34} /></Pop>
				<Pop t={t} at={K.mirror} x={540} y={520}><Txt text="model: a friend… then his own face" col={C.mute} size={30} /></Pop>
				<At x={540} y={740} s={1}><SantaSwatches k={P(t, K.myth - 0.5, K.nast + 1)} red={P(t, K.consistent - 0.3, K.consistent + 0.5)} L={['green', 'blue', 'brown', 'RED']} /></At>
				<Pop t={t} at={K.nast} x={1400} y={300}><Card w={600} col={C.red} top="MYTH BUSTED" big="Red Santa existed before" sub="Thomas Nast, 1800s · magazine covers" /></Pop>
				<Pop t={t} at={K.consistent} x={1400} y={540}><Card w={600} col={C.gold} top="WHAT COKE DID" big="One Santa, every December" /></Pop>
				<Pop t={t} at={K.bears} x={1400} y={780}><Pill text="POLAR BEARS · 1922 PRINT · 1993 TV" bg={C.ice} size={28} /></Pop>
			</Win>
			{/* 10 */}
			<Win a={ch[9]} b={ch[10]}>
				<Pop t={t} at={K.jingle} x={960} y={210}><Title text="“HOLIDAYS ARE COMING”" col={C.white} size={80} glow={C.red} /></Pop>
				<Pop t={t} at={K.y1995} x={960} y={320}><Pill text="1995 · THE CHRISTMAS CARAVAN" bg={C.red} fg="#fff" size={34} /></Pop>
				{[0, 1, 2].map((i) => {const x = -500 + ((t - ch[9]) * 160 + i * 560) % 2900; return <At key={i} x={x} y={600} s={1}><Truck w={520} t={t} ph={i} /></At>;})}
				<Pop t={t} at={K.bulbs} x={480} y={860}><Card w={560} col={C.gold} top="PER TRUCK (ORIGINAL AD)" big="30,000+ bulbs" /></Pop>
				<Pop t={t} at={K.hundred} x={1440} y={860}><Card w={560} col={C.white} top="AIRED IN" big="100+ countries" /></Pop>
				<Pop t={t} at={K.russia} x={960} y={980}><Pill text="RUSSIA: «ПРАЗДНИК К НАМ ПРИХОДИТ»" bg={C.white} size={30} /></Pop>
			</Win>
			{/* 11 */}
			<Win a={ch[10]} b={ch[11]} last>
				<At x={1400} y={600} o={cta}><Bottle3D w={760} h={940} t={t} glow={1} dist={7} /></At>
				<At x={540} y={220} s={pop(t, K.revenue - 0.3)} o={cta}><Card w={620} col={C.green} top="YEARLY REVENUE" big="≈ $48 billion" /></At>
				<At x={540} y={430} s={pop(t, K.vault - 0.3)} o={cta}><Card w={620} col={C.gold} top="ATLANTA · WORLD OF COCA-COLA" big="The formula vault" sub="legend: only a couple of people know it" /></At>
				{[['A NAME IN SCRIPT', K.nameend, C.white], ['A BOTTLE YOU FEEL IN THE DARK', K.bottleend, C.gold], ['A RED SANTA EVERY DECEMBER', K.redsanta, C.red]].map(([x, a, col]: any, j) => <At key={j} x={540} y={640 + j * 100} s={pop(t, a - 0.3)} o={cta}><Pill text={x} bg={col} fg={col === C.red ? '#fff' : C.ink} size={30} /></At>)}
				<At x={540} y={960} s={pop(t, K.nineend - 0.4)} o={cta}><Txt text="…and it began with 9 glasses a day" col={C.white} size={36} /></At>
			</Win>
			<At x={960} y={58}><div style={{transform: 'scale(.62)'}}><CapRow years={YEARS} pos={pos} o={P(t, K.open - 1.5, K.open - 0.5) * cta} size={110} /></div></At>
			{PARTS.map((p, i) => <PartTitle key={i} n={i + 1} title={p} at={i === 0 ? 0.6 : ch[i] + 0.3} />)}
			<CTA K={K} S={L} cx={960} cy={-760} />
			{Array.from({length: loops}).map((_, i) => (
				<Sequence key={'m' + i} from={Math.round(i * (MUSIC - 4) * FPS)} durationInFrames={Math.round(MUSIC * FPS)} layout="none">
					<Audio src={staticFile('music.mp3')} volume={(f) => 0.12 * Math.min(1, f / (4 * FPS)) * Math.min(1, (MUSIC * FPS - f) / (4 * FPS)) * Math.min(1, (dur * FPS - (f + i * (MUSIC - 4) * FPS)) / 90)} />
				</Sequence>
			))}
			<Sequence from={15} layout="none"><Audio src={staticFile('long/voice.mp3')} volume={1.1} /></Sequence>
			{sfx('fizz.mp3', 0.5, 0.3, 'fz')}
			{sfx('pour.mp3', K.nine - 1.2, 0.26, 'po')}
			{sfx('register.mp3', K.dollar - 0.1, 0.28, 're')}
			{sfx('bells.mp3', K.jingle - 0.2, 0.28, 'be')}
		</AbsoluteFill>
	);
};
