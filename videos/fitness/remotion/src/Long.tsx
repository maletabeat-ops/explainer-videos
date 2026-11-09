import React from 'react';
import {AbsoluteFill, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Audio} from '@remotion/media';
import {Can, Card, CopyGrid, Counter, Dumbbell3D, FeedCard, GymBg, Ladder, MoneyPop, People100, Phone, Profile, PromoTag} from './Comps';
import {CTA} from './CTA';
import {chapters, sfx} from './Short';
import {At, Badge, C, DISPLAY, FPS, P, Pill, Title, Txt, eout, pop} from './ui';

const PARTS = ['Fitness influencers are everywhere', 'Why fitness is perfect content', '2020: the gyms close', 'Step 1: views', 'Step 2: brand deals and promo codes', 'Step 3: programs and apps', 'Kayla Itsines and the $400M app', 'Step 4: your own brand', 'The work behind the reels', 'The uncomfortable truth', 'They sell trust'];
const STEPS = ['VIEWS', 'PROMO CODES', 'PROGRAMS', 'OWN BRAND'];
const L = {sub: 'FOLLOW', subbed: 'FOLLOWING ✓', like: 'LIKE'};
const fmtF = (v: number) => (v >= 1e6 ? (v / 1e6).toFixed(1) + 'M' : Math.round(v / 1000) + 'K');

const Win: React.FC<{a: number; b: number; children: React.ReactNode; last?: boolean}> = ({a, b, children, last}) => {
	const t = useCurrentFrame() / FPS;
	if (t < a - 0.4 || t > b + 0.4) return null;
	const i = eout(P(t, a - 0.35, a + 0.5)), o = last ? 1 : 1 - P(t, b - 0.4, b + 0.2);
	return <AbsoluteFill style={{opacity: i * o, transform: `scale(${1.05 - 0.05 * i})`}}>{children}</AbsoluteFill>;
};
const PartTitle: React.FC<{n: number; title: string; at: number}> = ({n, title, at}) => {
	const t = useCurrentFrame() / FPS;
	const k = P(t, at, at + 0.5) * (1 - P(t, at + 4.2, at + 4.8));
	if (k <= 0) return null;
	return (
		<div style={{position: 'absolute', left: 80, bottom: 70, opacity: k, transform: `translateX(${(1 - eout(Math.min(1, k * 1.2))) * -60}px)`}}>
			<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 26, color: C.pink, letterSpacing: 4}}>PART {n}</div>
			<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 56, color: C.white, textShadow: '0 4px 20px rgba(0,0,0,.7)'}}>{title}</div>
			<div style={{height: 5, width: 160, background: C.pink, borderRadius: 3, marginTop: 10, boxShadow: `0 0 14px ${C.pink}`}} />
		</div>
	);
};
const Pop: React.FC<{t: number; at: number; x: number; y: number; children: React.ReactNode; rot?: number}> = ({t, at, x, y, children, rot}) => <At x={x} y={y} s={pop(t, at - 0.3)} rot={rot}>{children}</At>;

export const FitLong: React.FC<{data: any}> = ({data}) => {
	const K = data.k, ch = chapters(data, 11), dur = data.dur;
	const t = useCurrentFrame() / FPS;
	const MUSIC = 90, loops = Math.ceil(dur / MUSIC) + 1;
	const cta = K.cta !== undefined ? 1 - P(t, K.cta - 0.4, K.cta) : 1;
	let lit = 0;
	if (t >= ch[3]) lit = 1;
	if (t >= ch[4]) lit = 1 + P(t, K.step2 - 0.3, K.step2 + 0.3);
	if (t >= ch[5]) lit = 2 + P(t, K.step3 - 0.3, K.step3 + 0.3);
	if (t >= ch[7]) lit = 3 + P(t, K.step4 - 0.3, K.step4 + 0.3);
	if (t >= ch[10]) lit = Math.min(4, P(t, K.r1 - 0.3, K.r1 + 0.3) + P(t, K.r2 - 0.3, K.r2 + 0.3) + P(t, K.r3 - 0.3, K.r3 + 0.3) + P(t, K.r4 - 0.3, K.r4 + 0.3));
	return (
		<AbsoluteFill>
			<GymBg w={1920} h={1080} />
			{/* 1 */}
			<Win a={0} b={ch[1]}>
				<At x={1400} y={560}><Dumbbell3D w={900} h={760} t={t} glow={0.7} dist={7.6} /></At>
				<Pop t={t} at={K.abs} x={520} y={200}><div style={{display: 'flex', gap: 14}}>{['ABS', 'BREAKFAST', 'DISCOUNT CODE'].map((x, i) => <div key={i} style={{transform: `scale(${pop(t, K.abs + i * 0.7)})`}}><Pill text={x} bg={[C.pink, C.blue, C.volt][i]} fg={i === 2 ? C.ink : '#fff'} size={30} /></div>)}</div></Pop>
				<Pop t={t} at={K.dream} x={520} y={340}><Title text="A DREAM JOB?" col={C.white} size={80} /></Pop>
				<Pop t={t} at={K.billions} x={520} y={490}><Card w={640} col={C.volt} top="A FEW" big="Sell companies for billions" /></Pop>
				<Pop t={t} at={K.dayjob} x={520} y={680}><Card w={640} col={C.mute} top="MOST" big="Never quit their day job" /></Pop>
				<Pop t={t} at={K.ladder} x={520} y={860}><Pill text="LET'S CLIMB THE MONEY LADDER" bg={C.pink} fg="#fff" size={32} /></Pop>
			</Win>
			{/* 2 */}
			<Win a={ch[1]} b={ch[2]}>
				<At x={1420} y={540}><Phone w={420}><Profile w={420} followers={2.4e6 * eout(P(t, ch[1], ch[2]))} label="followers" fmt={fmtF} />{['WORKOUT OF THE DAY', 'WHAT I EAT IN A DAY', 'BEFORE / AFTER'].map((c, i) => <FeedCard key={i} w={420} col={[C.pink, C.blue, C.violet][i]} title={c} icon={['dumbbell', 'food', 'ba'][i] as any} k={P(t, [K.runsout, K.visual, K.beforeafter][i], [K.runsout, K.visual, K.beforeafter][i] + 0.5)} />)}</Phone></At>
				{[['NEVER RUNS OUT', K.runsout, C.pink], ['VISUAL: BEFORE / AFTER', K.visual, C.blue], ['PERSONAL: A JOURNEY', K.personal, C.violet], ['USEFUL: DO IT WITH THEM', K.useful, C.volt]].map(([x, a, col]: any, i) => <Pop key={i} t={t} at={a} x={520} y={220 + i * 150}><Pill text={x} bg={col} fg={col === C.volt ? C.ink : '#fff'} size={34} /></Pop>)}
				<Pop t={t} at={K.everyday} x={520} y={860}><Txt text="= content people return to every day" col={C.white} size={34} /></Pop>
			</Win>
			{/* 3 */}
			<Win a={ch[2]} b={ch[3]}>
				<Pop t={t} at={K.closed} x={520} y={220}><Badge text="2020 · GYMS CLOSED" col={C.red} size={48} /></Pop>
				<Pop t={t} at={K.wicks} x={520} y={400}><Card w={640} col={C.blue} top="UK · JOE WICKS · PE WITH JOE" big="≈ 955,000 homes live" sub="a YouTube livestream record" /></Pop>
				<Pop t={t} at={K.soldout} x={520} y={620}><Pill text="APPS & HOME GEAR SOLD OUT" bg={C.white} size={30} /></Pop>
				<Pop t={t} at={K.habit} x={520} y={740}><Txt text="gyms reopened… the habit stayed" col={C.volt} size={36} /></Pop>
				<Pop t={t} at={K.vertical} x={1400} y={540}><Phone w={360}><div style={{height: '100%', background: `linear-gradient(180deg, ${C.pink}, ${C.violet})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: DISPLAY, fontWeight: 900, fontSize: 60, color: '#fff'}}>0:30</div></Phone></Pop>
			</Win>
			{/* 4 */}
			<Win a={ch[3]} b={ch[4]}>
				<Pop t={t} at={K.views} x={960} y={220}><Counter k={P(t, K.views, K.dont + 1)} to={1000000} fmt={(v) => '▶ ' + Math.round(v).toLocaleString('en-US')} col={C.white} size={100} /></Pop>
				<Pop t={t} at={K.perthousand} x={480} y={500}><Card w={560} col={C.blue} top="LONG YOUTUBE VIDEOS" big="a few $ / 1,000 views" sub="depends on audience country" /></Pop>
				<Pop t={t} at={K.cents} x={1440} y={500}><Card w={560} col={C.mute} top="SHORTS" big="a few ¢ / 1,000 views" /></Pop>
				<Pop t={t} at={K.reels} x={960} y={720}><Pill text="INSTAGRAM REELS: NO DIRECT PAY FOR VIEWS" bg={C.white} size={30} /></Pop>
				<Pop t={t} at={K.window} x={760} y={850}><Title text="VIEWS = THE SHOP WINDOW" col={C.volt} size={70} glow={C.volt} /></Pop>
			</Win>
			{/* 5 */}
			<Win a={ch[4]} b={ch[5]}>
				<Pop t={t} at={K.code} x={500} y={300}><PromoTag w={680} code="FIT-BRO20" pct="−20%" k={P(t, K.code, K.code + 1.2)} /></Pop>
				<Pop t={t} at={K.cut} x={500} y={520}><Txt text="+ a cut of every sale" col={C.volt} size={42} /></Pop>
				<Pop t={t} at={K.label} x={500} y={700}><Pill text="LEGALLY: PAID POSTS MUST SAY #AD" bg={C.white} size={30} /></Pop>
				<Pop t={t} at={K.gymshark} x={1400} y={300}><Card w={640} col={C.pink} top="GYMSHARK · BEN FRANCIS" big="Clothes sent to YouTubers" sub="+ small monthly fees" /></Pop>
				<Pop t={t} at={K.billion} x={1400} y={560}><Card w={640} col={C.volt} top="2020 · INVESTOR TAKES A STAKE" big="≈ £1 billion valuation" /></Pop>
				{t > K.cut ? <MoneyPop t={t} t0={K.cut + 0.2} text="+$" n={5} col={C.volt} /> : null}
			</Win>
			{/* 6 */}
			<Win a={ch[5]} b={ch[6]}>
				<Pop t={t} at={K.knowledge} x={520} y={200}><Badge text="SELL YOUR KNOWLEDGE" col={C.pink} size={48} /></Pop>
				<Pop t={t} at={K.twelve} x={520} y={340}><Pill text="12-WEEK PROGRAM · FILMED ONCE" bg={C.pink} fg="#fff" size={30} /></Pop>
				<Pop t={t} at={K.nothing} x={520} y={440}><Txt text="each extra copy ≈ free" col={C.volt} size={38} /></Pop>
				<Pop t={t} at={K.coaching} x={520} y={600}><Card w={620} col={C.blue} top="1-ON-1 COACHING" big="More per client…" sub="…but limited by time" /></Pop>
				<Pop t={t} at={K.group} x={520} y={820}><Pill text="→ GROUP PROGRAMS & APPS" bg={C.volt} size={32} /></Pop>
				<At x={1400} y={540} s={pop(t, K.filmedonce - 0.4)}><CopyGrid k={P(t, K.filmedonce, K.hundredk + 1)} cols={10} rows={9} size={62} /></At>
			</Win>
			{/* 7 */}
			<Win a={ch[6]} b={ch[7]}>
				<Pop t={t} at={K.kayla} x={520} y={200}><Badge text="KAYLA ITSINES · AUSTRALIA" col={C.pink} size={44} /></Pop>
				<Pop t={t} at={K.clients} x={520} y={320}><Pill text="BEFORE/AFTER PHOTOS → A PDF GUIDE" bg={C.white} size={28} /></Pop>
				<Pop t={t} at={K.sweat} x={520} y={420}><Txt text="→ the Sweat app, millions of users" col={C.volt} size={36} /></Pop>
				<Pop t={t} at={K.ifit} x={520} y={600}><Card w={620} col={C.volt} top="2021 · SOLD TO iFIT" big="Reported ≈ $400M" sub="filings later suggested less" /></Pop>
				<Pop t={t} at={K.boughtback} x={520} y={830}><Card w={620} col={C.red} top="2023" big="Bought back, far cheaper" /></Pop>
				<At x={1400} y={540} s={pop(t, K.sweat - 0.4)}><div style={{width: 360, height: 360, borderRadius: 84, background: `linear-gradient(135deg, ${C.pink}, ${C.violet})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 60px ${C.pink}66`}}><svg width="200" height="140" viewBox="0 0 40 28"><path d="M2 14 h4 M34 14 h4 M6 6 v16 M34 6 v16 M10 9 v10 M30 9 v10 M10 14 h20" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" /></svg></div></At>
				<Pop t={t} at={K.timing} x={1400} y={860}><Title text="IT'S ALL TIMING" col={C.white} size={60} /></Pop>
			</Win>
			{/* 8 */}
			<Win a={ch[7]} b={ch[8]}>
				<Pop t={t} at={K.ownbrand} x={520} y={200}><Badge text="OWN THE PRODUCT" col={C.volt} size={52} /></Pop>
				<Pop t={t} at={K.fortune} x={520} y={340}><Card w={620} col={C.mute} top="A NEW BRAND" big="Pays a fortune for attention" /></Pop>
				<Pop t={t} at={K.free} x={520} y={530}><Card w={620} col={C.pink} top="AN INFLUENCER" big="Already has it, free" /></Pop>
				<Pop t={t} at={K.katy} x={520} y={720}><Pill text="KATY HEARN · ALANI NU" bg={C.white} size={32} /></Pop>
				<Pop t={t} at={K.b18} x={520} y={860}><Counter k={P(t, K.b18 - 0.3, K.b18 + 1)} to={1.8} fmt={(v) => `$${v.toFixed(1)} BILLION`} col={C.volt} size={84} /></Pop>
				<At x={1400} y={560} s={1}><div style={{display: 'flex', gap: 40, alignItems: 'flex-end'}}>{[[C.pink, '#8a1452'], [C.blue, '#123a8a'], [C.volt, '#5a7a12']].map(([a, b], i) => <div key={i} style={{transform: `translateY(${(1 - eout(P(t, K.alani + i * 0.25, K.alani + 0.6 + i * 0.25))) * 400}px)`, opacity: P(t, K.alani + i * 0.25, K.alani + 0.4 + i * 0.25)}}><Can h={i === 1 ? 460 : 400} col={a} col2={b} label="ENERGY" /></div>)}</div></At>
			</Win>
			{/* 9 */}
			<Win a={ch[8]} b={ch[9]}>
				<Pop t={t} at={K.work} x={960} y={200}><Title text="THE WORK BEHIND THE REELS" col={C.white} size={64} /></Pop>
				{['FILM', 'EDIT', 'CAPTIONS', 'COMMENTS', 'BRAND DEALS', 'POST DAILY'].map((x, i) => <Pop key={i} t={t} at={K.filming + i * 0.6} x={330 + (i % 3) * 630} y={380 + Math.floor(i / 3) * 110}><Pill text={x} bg={[C.pink, C.blue, C.violet, C.white, C.volt, C.pink][i]} fg={[2, 3, 4].includes(i) ? C.ink : '#fff'} size={32} /></Pop>)}
				<Pop t={t} at={K.teams} x={480} y={720}><Card w={600} col={C.blue} top="BIGGER NAMES" big="Whole teams" sub="editors · managers · support" /></Pop>
				<Pop t={t} at={K.bodies} x={1440} y={720}><Card w={600} col={C.red} top="THE BODY IS THE PRODUCT" big="Injury = business risk" /></Pop>
				<Pop t={t} at={K.burnout} x={960} y={930}><Pill text="BURNOUT: NEVER SWITCHING OFF" bg={C.red} fg="#fff" size={32} /></Pop>
			</Win>
			{/* 10 */}
			<Win a={ch[9]} b={ch[10]}>
				<Pop t={t} at={K.p4} x={480} y={220}><Title text="≈ 4%" col={C.volt} size={150} glow={C.volt} /></Pop>
				<Pop t={t} at={K.p4 + 0.4} x={480} y={340}><Txt text="of creators earn > $100K a year (est.)" col={C.white} size={32} /></Pop>
				<Pop t={t} at={K.winners} x={480} y={480}><Pill text="THE ALGORITHM SHOWS THE WINNERS" bg={C.white} size={28} /></Pop>
				<Pop t={t} at={K.filtered} x={480} y={600}><Txt text="lighting · angles · editing" col={C.mute} size={34} /></Pop>
				<Pop t={t} at={K.question} x={480} y={790}><Card w={640} col={C.pink} top="ALWAYS ASK" big="What are they selling?" sub="and who benefits if I believe it?" /></Pop>
				<At x={1400} y={540} s={pop(t, K.thousands - 0.4)}><People100 k={P(t, K.thousands, K.p4)} hi={P(t, K.p4 - 0.2, K.p4 + 0.5)} size={58} /></At>
			</Win>
			{/* 11 */}
			<Win a={ch[10]} b={ch[11]} last>
				<At x={1400} y={420} o={cta}><Dumbbell3D w={860} h={620} t={t} glow={0.9} dist={7.8} /></At>
				<At x={520} y={260} s={pop(t, K.foundation - 0.4)} o={cta}><Txt text="the foundation under every step:" col={C.mute} size={34} /></At>
				<At x={520} y={380} s={pop(t, K.trust - 0.3)} o={cta}><Title text="TRUST" col={C.pink} size={150} glow={C.pink} /></At>
				<At x={520} y={560} s={pop(t, K.notworkouts - 0.4)} o={cta}><Title text="THEY DON'T SELL WORKOUTS." col={C.white} size={48} /></At>
				<At x={520} y={640} s={pop(t, K.onepost - 0.6)} o={cta}><Title text="THEY SELL TRUST." col={C.volt} size={64} glow={C.volt} /></At>
			</Win>
			<At x={1400} y={960}><Ladder w={820} steps={STEPS} lit={lit} o={P(t, ch[3] - 0.4, ch[3] + 0.2) * cta * (t > ch[8] - 0.3 && t < ch[10] - 0.2 ? 0 : 1)} /></At>
			{PARTS.map((p, i) => <PartTitle key={i} n={i + 1} title={p} at={i === 0 ? 0.6 : ch[i] + 0.3} />)}
			<CTA K={K} S={L} cx={960} cy={-760} />
			{Array.from({length: loops}).map((_, i) => (
				<Sequence key={'m' + i} from={Math.round(i * (MUSIC - 4) * FPS)} durationInFrames={Math.round(MUSIC * FPS)} layout="none">
					<Audio src={staticFile('music.mp3')} volume={(f) => 0.11 * Math.min(1, f / (4 * FPS)) * Math.min(1, (MUSIC * FPS - f) / (4 * FPS)) * Math.min(1, (dur * FPS - (f + i * (MUSIC - 4) * FPS)) / 90)} />
				</Sequence>
			))}
			<Sequence from={15} layout="none"><Audio src={staticFile('long/voice.mp3')} volume={1.1} /></Sequence>
			{sfx('dumbbell.mp3', 0.5, 0.32, 'db')}
			{sfx('whistle.mp3', K.closed - 0.2, 0.22, 'wh')}
			{sfx('notif.mp3', K.cut + 0.2, 0.28, 'n1')}
			{sfx('cash.mp3', K.b18 - 0.2, 0.28, 'ca')}
		</AbsoluteFill>
	);
};
