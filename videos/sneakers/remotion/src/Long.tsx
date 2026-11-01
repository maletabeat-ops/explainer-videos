import React from 'react';
import {AbsoluteFill, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Audio} from '@remotion/media';
import {Brother, Hose, Medal, RubberBlob, SalesBars, Scissors, ShoePhoto, SoundBars, StepTrail, SwissFlag, TennisBall, Ticker, TrackBg, WaffleIron} from './Comps';
import {CTA} from './CTA';
import {SALES, chapters, gait, sfx} from './Short';
import {At, Badge, BODY, C, DISPLAY, FPS, P, Pill, Title, Txt, eio, eout, pop} from './ui';

const PARTS = ['From a garden hose', 'Rubber that refused to melt', 'Why they are called sneakers', 'Two brothers, two brands', 'A waffle iron and a swoosh', 'The cushioning arms race', 'The hose that worked', 'Federer, Wall Street and Zendaya', 'The numbers', 'What if?'];
const YEARS = ['1839', '1880s', '1924', '1971', '2010', '2021', '2025'];
const E = [0, 6, 0, 1, 2, 3, 3.6, 4, 5, 6, 6]; // trail position by part number (1..10)
const L = {sub: 'FOLLOW', subbed: 'FOLLOWING ✓', like: 'LIKE'};

const Win: React.FC<{a: number; b: number; children: React.ReactNode; last?: boolean}> = ({a, b, children, last}) => {
	const t = useCurrentFrame() / FPS;
	if (t < a - 0.4 || t > b + 0.4) return null;
	const i = eout(P(t, a - 0.35, a + 0.4)), o = last ? 1 : 1 - P(t, b - 0.3, b + 0.2);
	return <AbsoluteFill style={{opacity: i * o, transform: `translateX(${(1 - i) * 80}px)`}}>{children}</AbsoluteFill>;
};
const PartTitle: React.FC<{n: number; title: string; at: number}> = ({n, title, at}) => {
	const t = useCurrentFrame() / FPS;
	const k = P(t, at, at + 0.5) * (1 - P(t, at + 3.5, at + 4.1));
	if (k <= 0) return null;
	return (
		<div style={{position: 'absolute', left: 80, bottom: 70, opacity: k, transform: `translateX(${(1 - eout(Math.min(1, k * 1.2))) * -60}px)`}}>
			<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 26, color: C.lime, letterSpacing: 4}}>PART {n}</div>
			<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 56, color: C.white, textShadow: '0 4px 20px rgba(0,0,0,.7)'}}>{title}</div>
			<div style={{height: 6, width: 160, background: C.lime, borderRadius: 3, marginTop: 10, boxShadow: `0 0 14px ${C.lime}`}} />
		</div>
	);
};
const Card: React.FC<{w: number; col: string; top: string; big: string; sub?: string}> = ({w, col, top, big, sub}) => (
	<div style={{width: w, padding: 22, borderRadius: 26, background: 'rgba(10,13,16,.9)', border: `4px solid ${col}`, boxShadow: `0 0 28px ${col}55`, boxSizing: 'border-box', textAlign: 'center', whiteSpace: 'normal'}}>
		<div style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 26, color: C.mute}}>{top}</div>
		<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 56, color: col, lineHeight: 1.1}}>{big}</div>
		{sub ? <div style={{fontFamily: BODY, fontWeight: 700, fontSize: 24, color: C.white, marginTop: 6}}>{sub}</div> : null}
	</div>
);
const Pop: React.FC<{t: number; at: number; x: number; y: number; children: React.ReactNode; rot?: number}> = ({t, at, x, y, children, rot}) => <At x={x} y={y} s={pop(t, at - 0.3)} rot={rot}>{children}</At>;

export const SneakLong: React.FC<{data: any}> = ({data}) => {
	const K = data.k, ch = chapters(data, 10), dur = data.dur;
	const t = useCurrentFrame() / FPS;
	const MUSIC = 85, loops = Math.ceil(dur / MUSIC) + 1;
	let c = 0; while (c < 10 && t >= ch[c + 1]) c++;
	const n = Math.min(10, c + 1);
	const pos = c === 0 ? 6 - 6 * eio(P(t, K.back - 0.3, K.back + 2.2)) : E[n - 1] + (E[n] - E[n - 1]) * eio(P(t, ch[c], ch[c] + 1.4));
	const cta = K.cta !== undefined ? 1 - P(t, K.cta - 0.4, K.cta) : 1;
	return (
		<AbsoluteFill>
			<TrackBg w={1920} h={1080} />
			{/* 1 — cold open */}
			<Win a={0} b={ch[1]}>
				<At x={1340} y={520}><ShoePhoto w={1000} squash={gait(t, K.on)} holesOn={P(t, K.pods1 - 1, K.pods1 + 0.5)} glow={0.6} float={10 + 10 * Math.sin(t * 1.6)} /></At>
				<Pop t={t} at={K.on} x={480} y={220}><Title text="On" col={C.white} size={150} glow={C.white} /></Pop>
				<Pop t={t} at={K.b3} x={480} y={370}><Title text="CHF 3 BILLION" col={C.lime} size={86} glow={C.lime} /></Pop>
				<Pop t={t} at={K.growth} x={340} y={500}><Badge text="+30%" col={C.lime} size={56} /></Pop>
				<Pop t={t} at={K.nikeDown} x={640} y={500}><Badge text="NIKE ↓" col={C.red} size={56} /></Pop>
				<At x={480} y={720} s={pop(t, K.hose - 0.4)}><Hose w={700} cut={P(t, K.hose + 0.5, K.hose + 2)} t={t} /></At>
				<Pop t={t} at={K.storyIntro} x={960} y={540}><div style={{padding: '30px 60px', background: 'rgba(10,13,16,.92)', borderRadius: 30, border: `4px solid ${C.lime}`}}><Title text="THE STORY OF THE SNEAKER" col={C.white} size={84} /></div></Pop>
			</Win>
			{/* 2 — rubber */}
			<Win a={ch[1]} b={ch[2]}>
				<At x={480} y={520} s={pop(t, ch[1] + 0.2)}><RubberBlob size={420} t={t} cure={eio(P(t, K.stove, K.vulc))} /></At>
				<Pop t={t} at={K.melted} x={480} y={820}><Txt text={t < K.vulc ? 'SUMMER: MELTS · WINTER: CRACKS' : 'FIRM + FLEXIBLE'} col={t < K.vulc ? C.amber : C.cyan} size={40} /></Pop>
				<Pop t={t} at={K.goodyear} x={1350} y={200}><Badge text="CHARLES GOODYEAR" col={C.amber} size={52} /></Pop>
				<Pop t={t} at={K.broke} x={1350} y={330}><Pill text="BROKE · DEBTORS' PRISON" bg={C.red} fg="#fff" size={34} /></Pop>
				<Pop t={t} at={K.y1839} x={1350} y={460}><Card w={560} col={C.lime} top="1839" big="RUBBER + SULFUR" sub="+ a hot stove (so the legend goes)" /></Pop>
				<Pop t={t} at={K.vulc} x={1350} y={640}><Title text="VULCANIZATION" col={C.lime} size={84} glow={C.lime} /></Pop>
				<Pop t={t} at={K.debt} x={1350} y={790}><Pill text="DIED DEEPLY IN DEBT" bg={C.white} size={34} /></Pop>
				<Pop t={t} at={K.tire} x={1350} y={900}><Txt text="Goodyear Tire (1898): named after him, not founded by him" col={C.mute} size={30} /></Pop>
			</Win>
			{/* 3 — sneakers */}
			<Win a={ch[2]} b={ch[3]}>
				<Pop t={t} at={K.plimsolls} x={440} y={220}><Pill text="BRITAIN: PLIMSOLLS" bg={C.cyan} size={38} /></Pop>
				<Pop t={t} at={K.silent} x={440} y={420}><SoundBars w={640} t={t} quiet={eio(P(t, K.silent, K.silent + 1))} /></Pop>
				<Pop t={t} at={K.sneak} x={440} y={620}><Title text={t < K.eighties ? 'SNEAK…' : 'SNEAKERS'} col={C.lime} size={120} glow={C.lime} /></Pop>
				<Pop t={t} at={K.eighties} x={440} y={740}><Txt text="BY THE 1880s" col={C.white} size={40} /></Pop>
				<Pop t={t} at={K.keds} x={1170} y={330}><Card w={400} col={C.cyan} top="1916" big="KEDS" sub="U.S. Rubber Co." /></Pop>
				<Pop t={t} at={K.converse} x={1600} y={330}><Card w={400} col={C.red} top="1917" big="ALL STAR" sub="Converse" /></Pop>
				<Pop t={t} at={K.chuck} x={1385} y={690}><div style={{width: 300, height: 300, borderRadius: 150, background: '#f4f7fa', border: `10px solid ${C.red}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 40px ${C.red}66`}}><div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 30, color: '#1b2a4a'}}>CHUCK</div><div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 30, color: '#1b2a4a'}}>TAYLOR</div><div style={{fontFamily: BODY, fontWeight: 700, fontSize: 20, color: C.red}}>ALL STAR</div></div></Pop>
				<Pop t={t} at={K.patch} x={1385} y={900}><Txt text="his name, still on the ankle patch" col={C.mute} size={30} /></Pop>
			</Win>
			{/* 4 — Dassler */}
			<Win a={ch[3]} b={ch[4]}>
				<Pop t={t} at={K.town} x={960} y={190}><Badge text="HERZOGENAURACH, GERMANY · 1924" col={C.gold} size={44} /></Pop>
				{[0, 1].map((j) => {const sep = eout(P(t, K.split - 0.2, K.split + 1)); return <At key={j} x={960 + (j ? 1 : -1) * (120 + 330 * sep)} y={560} s={pop(t, (j ? K.rudolf : K.adi) - 0.3)}><Brother size={200} col={j ? '#c0392b' : '#2d6cdf'} flip={j === 1} /></At>;})}
				<At x={960} y={560} o={P(t, K.river - 0.4, K.river)}><svg width="80" height="500" viewBox="0 0 80 500"><path d="M40 0 C10 60 70 120 40 180 C10 240 70 300 40 360 C10 420 70 480 40 500" stroke={C.cyan} strokeWidth="14" fill="none" opacity="0.8" /></svg></At>
				<Pop t={t} at={K.owens} x={960} y={330}><div style={{display: 'flex', gap: 18, alignItems: 'center'}}>{[0, 1, 2, 3].map((j) => <div key={j} style={{transform: `scale(${pop(t, K.gold - 0.2 + j * 0.2)})`}}><Medal size={70} /></div>)}<Pill text="JESSE OWENS · 1936" bg={C.white} size={30} /></div></Pop>
				<Pop t={t} at={K.puma} x={1360} y={830}><Card w={360} col="#c0392b" top="RUDOLF · 1948" big="PUMA" /></Pop>
				<Pop t={t} at={K.adidas} x={560} y={830}><Card w={360} col="#2d6cdf" top="ADI · 1949" big="ADIDAS" /></Pop>
				<Pop t={t} at={K.look} x={960} y={970}><Txt text="“The town of bent necks”: look at the shoes first" col={C.white} size={34} /></Pop>
			</Win>
			{/* 5 — Nike */}
			<Win a={ch[4]} b={ch[5]}>
				<Pop t={t} at={K.bowerman} x={430} y={200}><Badge text="BILL BOWERMAN + PHIL KNIGHT" col={C.amber} size={40} /></Pop>
				<Pop t={t} at={K.japan} x={430} y={300}><Txt text="importing Japanese running shoes" col={C.mute} size={32} /></Pop>
				<At x={430} y={620} s={pop(t, K.track - 0.4)}><WaffleIron w={560} open={eio(P(t, K.waffle + 1.2, K.waffle + 2.2))} t={t} steam={P(t, K.waffle, K.waffle + 0.5)} /></At>
				<Pop t={t} at={K.hit} x={430} y={930}><Pill text="THE WAFFLE SOLE" bg={C.amber} size={38} /></Pop>
				<Pop t={t} at={K.nike} x={1380} y={240}><Title text="1971 · NIKE" col={C.white} size={96} glow={C.white} /></Pop>
				<Pop t={t} at={K.swoosh} x={1380} y={410}><Card w={620} col={C.lime} top="THE LOGO, BY STUDENT CAROLYN DAVIDSON" big="$35" /></Pop>
				<Pop t={t} at={K.jordan} x={1380} y={650}><Card w={620} col={C.red} top="1985 · MICHAEL JORDAN" big="AIR JORDAN" sub="reportedly $100M+ in year one" /></Pop>
				<Pop t={t} at={K.culture} x={1380} y={880}><Badge text="SNEAKERS = CULTURE" col={C.lime} size={44} /></Pop>
			</Win>
			{/* 6 — arms race, Olivier, hose */}
			<Win a={ch[5]} b={ch[6]}>
				<Pop t={t} at={K.arms} x={480} y={200}><Badge text="THE CUSHIONING ARMS RACE" col={C.cyan} size={42} /></Pop>
				{['AIR', 'GEL', 'FOAM', 'MORE FOAM'].map((x, j) => <Pop key={j} t={t} at={K.arms + 1 + j * 1.2} x={480} y={330 + j * 95}><div style={{width: 260 + j * 90, height: 70, borderRadius: 20, background: [C.cyan, C.violet, C.white, C.mute][j], display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: DISPLAY, fontWeight: 900, fontSize: 34, color: C.ink}}>{x}</div></Pop>)}
				<Pop t={t} at={K.mushy} x={480} y={760}><Txt text="SOFT LANDING… MUSHY PUSH-OFF" col={C.amber} size={38} /></Pop>
				<Pop t={t} at={K.olivier} x={1390} y={200}><div style={{display: 'flex', alignItems: 'center', gap: 18}}><SwissFlag size={64} /><Badge text="OLIVIER BERNHARD" col={C.lime} size={46} /></div></Pop>
				<Pop t={t} at={K.ironman} x={1390} y={310}><Txt text="pro triathlete · Ironman winner" col={C.mute} size={32} /></Pop>
				<Pop t={t} at={K.both} x={1390} y={410}><Pill text="SOFT LANDING + FIRM PUSH-OFF" bg={C.white} size={34} /></Pop>
				<At x={1390} y={660} s={pop(t, K.absurd - 0.4)}><Hose w={760} cut={P(t, K.cut, K.cut + 1.6)} t={t} /></At>
				{t > K.cut - 0.3 && t < K.cut + 2 ? <At x={1040 + 700 * P(t, K.cut, K.cut + 1.6)} y={580} s={1}><Scissors size={140} open={Math.abs(Math.sin(t * 10))} /></At> : null}
				<Pop t={t} at={K.glued} x={1390} y={900}><Badge text="GLUED SIDEWAYS UNDER A SHOE" col={C.lime} size={38} /></Pop>
			</Win>
			{/* 7 — how it works, On founded */}
			<Win a={ch[6]} b={ch[7]}>
				<At x={500} y={560}><ShoePhoto w={880} squash={t < K.squash ? 0 : t < K.y2010 ? gait(t, K.squash) : 0} holesOn={1} glow={0.6 + 0.4 * P(t, K.cloudtec - 0.5, K.cloudtec)} /></At>
				<Pop t={t} at={K.squash} x={240} y={190}><Pill text="LAND: PODS SQUASH ↓" bg={C.cyan} size={36} /></Pop>
				<Pop t={t} at={K.firm} x={680} y={190}><Pill text="PUSH: FIRM ↑" bg={C.lime} size={36} /></Pop>
				<Pop t={t} at={K.firm + 3} x={480} y={900}><Badge text="+ SPEEDBOARD: A SPRINGY PLATE" col={C.white} size={34} /></Pop>
				<Pop t={t} at={K.declined} x={1460} y={180}><Pill text="BIG BRANDS: NOT INTERESTED (REPORTEDLY)" bg={C.red} fg="#fff" size={28} /></Pop>
				<Pop t={t} at={K.zurich} x={1460} y={330}><div style={{display: 'flex', alignItems: 'center', gap: 18}}><SwissFlag size={70} /><Badge text="ZURICH · 2010" col={C.white} size={46} /></div></Pop>
				<Pop t={t} at={K.friends} x={1460} y={490}><div style={{display: 'flex', gap: 14, alignItems: 'flex-end'}}>{[0, 1, 2].map((j) => <Brother key={j} size={j === 1 ? 100 : 84} col={j === 1 ? C.lime : C.mute} />)}</div></Pop>
				<Pop t={t} at={K.called} x={1460} y={640}><Title text="On" col={C.white} size={150} glow={C.white} /></Pop>
				<Pop t={t} at={K.ispo} x={1460} y={790}><Pill text="ISPO AWARD · 2010" bg={C.gold} size={36} /></Pop>
				<Pop t={t} at={K.cloudtec} x={1460} y={910}><Badge text="CloudTec® · PATENTED" col={C.lime} size={44} /></Pop>
			</Win>
			{/* 8 — Federer, IPO, Zendaya */}
			<Win a={ch[7]} b={ch[8]}>
				<Pop t={t} at={K.stores} x={480} y={190}><Pill text="RUNNING STORES · WORD OF MOUTH" bg={C.white} size={32} /></Pop>
				<Pop t={t} at={K.federer} x={480} y={330}><div style={{display: 'flex', alignItems: 'center', gap: 20}}><TennisBall size={90} t={t} /><Badge text="ROGER FEDERER · 2019" col={C.lime} size={44} /></div></Pop>
				<Pop t={t} at={K.invested} x={480} y={460}><Pill text="NOT A SPONSOR: AN INVESTOR" bg={C.lime} size={36} /></Pop>
				<Pop t={t} at={K.roger} x={480} y={570}><Txt text="+ his own line: “The Roger”" col={C.white} size={36} /></Pop>
				<Pop t={t} at={K.zendaya} x={480} y={760}><Card w={560} col={C.violet} top="2024 · NEW PARTNER" big="ZENDAYA" /></Pop>
				<Pop t={t} at={K.fashion} x={480} y={930}><Txt text="a running shoe → a fashion statement" col={C.mute} size={34} /></Pop>
				<At x={1400} y={470} s={pop(t, K.ipo - 0.5)}><Ticker w={860} h={420} k={eout(P(t, K.ipo - 0.3, K.b11 + 1))} t={t} /></At>
				<Pop t={t} at={K.p24} x={1220} y={810}><Card w={300} col={C.white} top="IPO PRICE" big="$24" /></Pop>
				<Pop t={t} at={K.p35} x={1580} y={810}><Card w={300} col={C.lime} top="FIRST TRADE" big="$35.40" /></Pop>
				<Pop t={t} at={K.b11} x={1400} y={970}><Title text="VALUED AT > $11 BILLION" col={C.lime} size={54} glow={C.lime} /></Pop>
			</Win>
			{/* 9 — numbers */}
			<Win a={ch[8]} b={ch[9]}>
				<Pop t={t} at={K.numbers} x={560} y={170}><Txt text="ON NET SALES, CHF BILLION" col={C.mute} size={34} /></Pop>
				<At x={560} y={590} s={pop(t, K.numbers)}><SalesBars w={940} h={720} t={t} t0={K.y21 - 0.3} rows={SALES} fmt={(v) => v.toFixed(1)} /></At>
				<Pop t={t} at={K.y25 + 1} x={300} y={300}><Badge text="+30%" col={C.lime} size={60} /></Pop>
				<Pop t={t} at={K.margin} x={1460} y={260}><Card w={600} col={C.lime} top="GROSS MARGIN" big="62.8%" sub="≈ 63 cents of every franc" /></Pop>
				<Pop t={t} at={K.margin + 4} x={1460} y={480}><Card w={600} col={C.red} top="NIKE" big="> 10× BIGGER" sub="but growing much slower" /></Pop>
				<Pop t={t} at={K.asia} x={1460} y={690}><Card w={600} col={C.cyan} top="ASIA-PACIFIC" big="≈ ×2 · CHF 0.5B+" /></Pop>
				<Pop t={t} at={K.secret} x={1460} y={880}><div style={{display: 'flex', gap: 12, flexWrap: 'wrap', width: 640, justifyContent: 'center'}}>{['LOOKS DIFFERENT', 'PREMIUM PRICE', 'FEW DISCOUNTS', 'A GREAT STORY'].map((x, j) => <div key={j} style={{transform: `scale(${pop(t, K.secret + j * 0.8)})`}}><Pill text={x} bg={[C.white, C.lime, C.cyan, C.amber][j]} size={26} /></div>)}</div></Pop>
			</Win>
			{/* 10 — what if */}
			<Win a={ch[9]} b={ch[10]} last>
				<At x={1340} y={560} o={cta}><ShoePhoto w={1000} squash={gait(t, ch[9] + 1)} holesOn={1} glow={0.8} /></At>
				{[['A HOT STOVE', K.stove2, C.amber], ['SILENT SOLES', K.word, C.cyan], ['TWO BROTHERS', K.brothers, C.red], ['A WAFFLE IRON', K.wafflend, C.white], ['A GARDEN HOSE', K.triathlete, C.lime]].map(([x, a, col]: any, j) => <At key={j} x={480} y={200 + j * 115} s={pop(t, a - 0.3)} o={cta}><Pill text={x} bg={col} size={40} fg={C.ink} /></At>)}
				<At x={480} y={850} s={pop(t, K.whatif - 0.3)} o={cta}><Title text="WHAT IF?" col={C.lime} size={140} glow={C.lime} /></At>
			</Win>
			<At x={960} y={70} o={1}><div style={{transform: 'scale(.85)'}}><StepTrail w={1300} years={YEARS} pos={pos} t={t} o={P(t, K.back - 0.8, K.back) * cta} /></div></At>
			{PARTS.map((p, i) => <PartTitle key={i} n={i + 1} title={p} at={i === 0 ? 0.6 : ch[i] + 0.3} />)}
			<CTA K={K} S={L} cx={960} cy={-760} />
			{Array.from({length: loops}).map((_, i) => (
				<Sequence key={'m' + i} from={Math.round(i * (MUSIC - 4) * FPS)} durationInFrames={Math.round(MUSIC * FPS)} layout="none">
					<Audio src={staticFile('music.mp3')} volume={(f) => 0.12 * Math.min(1, f / (4 * FPS)) * Math.min(1, (MUSIC * FPS - f) / (4 * FPS)) * Math.min(1, (dur * FPS - (f + i * (MUSIC - 4) * FPS)) / 90)} />
				</Sequence>
			))}
			<Sequence from={15} layout="none"><Audio src={staticFile('long/voice.mp3')} volume={1.1} /></Sequence>
			{sfx('squeak.mp3', K.on, 0.28, 'sq')}
			{sfx('sizzle.mp3', K.waffle, 0.32, 'sz')}
			{sfx('snip.mp3', K.cut + 0.1, 0.42, 'sn')}
			{sfx('bell.mp3', K.ipo - 0.2, 0.28, 'bl')}
			{sfx('coins.mp3', K.y25 - 0.2, 0.25, 'co')}
		</AbsoluteFill>
	);
};
