import React from 'react';
import {AbsoluteFill, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Audio} from '@remotion/media';
import {AgeLabel, CellarBg, Equalizer, Flag, Generations, Glass3D, Letters, Magazine, Seal, ShareRing, Stamp, Stave, TownSign, Vinyl} from './Comps';
import {CTA} from './CTA';
import {chapters, sfx} from './Short';
import {At, Badge, BODY, C, DISPLAY, FPS, P, Pill, Title, Txt, eio, eout, pop} from './ui';

const PARTS = ['The best-selling cognac', 'An Irish soldier in Cognac', 'What makes cognac cognac', 'VSOP, stars and X.O', 'Eight generations of taste', 'The American chapter', 'Hip-hop and Henny', 'The H in LVMH', 'Tariffs and a hangover', 'A story about time'];
const YEARS = ['1765', '1817', '1870', '1963', '1971', '1987', '2025'];
const E = [0, 6, 0, 0.5, 1.5, 1.8, 3, 3.5, 4.5, 6, 6];
const L = {sub: 'FOLLOW', subbed: 'FOLLOWING ✓', like: 'LIKE'};

const Win: React.FC<{a: number; b: number; children: React.ReactNode; last?: boolean}> = ({a, b, children, last}) => {
	const t = useCurrentFrame() / FPS;
	if (t < a - 0.4 || t > b + 0.4) return null;
	const i = eout(P(t, a - 0.35, a + 0.5)), o = last ? 1 : 1 - P(t, b - 0.4, b + 0.2);
	return <AbsoluteFill style={{opacity: i * o, filter: i < 1 ? `blur(${(1 - i) * 8}px)` : undefined}}>{children}</AbsoluteFill>;
};
const PartTitle: React.FC<{n: number; title: string; at: number}> = ({n, title, at}) => {
	const t = useCurrentFrame() / FPS;
	const k = P(t, at, at + 0.5) * (1 - P(t, at + 3.8, at + 4.4));
	if (k <= 0) return null;
	return (
		<div style={{position: 'absolute', left: 80, bottom: 70, opacity: k, transform: `translateX(${(1 - eout(Math.min(1, k * 1.2))) * -60}px)`}}>
			<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 26, color: C.gold, letterSpacing: 4}}>PART {n}</div>
			<div style={{fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 58, color: C.cream, textShadow: '0 4px 20px rgba(0,0,0,.7)'}}>{title}</div>
			<div style={{height: 5, width: 160, background: C.gold, borderRadius: 3, marginTop: 10, boxShadow: `0 0 14px ${C.gold}`}} />
		</div>
	);
};
const Card: React.FC<{w: number; col: string; top: string; big: string; sub?: string}> = ({w, col, top, big, sub}) => (
	<div style={{width: w, padding: 22, borderRadius: 24, background: 'rgba(18,11,7,.9)', border: `3px solid ${col}`, boxShadow: `0 0 26px ${col}44`, boxSizing: 'border-box', textAlign: 'center', whiteSpace: 'normal'}}>
		<div style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 24, color: C.mute, letterSpacing: 1}}>{top}</div>
		<div style={{fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 52, color: col, lineHeight: 1.15}}>{big}</div>
		{sub ? <div style={{fontFamily: BODY, fontWeight: 700, fontSize: 22, color: C.cream, marginTop: 6}}>{sub}</div> : null}
	</div>
);
const Pop: React.FC<{t: number; at: number; x: number; y: number; children: React.ReactNode; rot?: number}> = ({t, at, x, y, children, rot}) => <At x={x} y={y} s={pop(t, at - 0.3)} rot={rot}>{children}</At>;
const Row: React.FC<{children: React.ReactNode; gap?: number}> = ({children, gap = 20}) => <div style={{display: 'flex', alignItems: 'center', gap}}>{children}</div>;

export const HenLong: React.FC<{data: any}> = ({data}) => {
	const K = data.k, ch = chapters(data, 10), dur = data.dur;
	const t = useCurrentFrame() / FPS;
	const MUSIC = 80, loops = Math.ceil(dur / MUSIC) + 1;
	let c = 0; while (c < 10 && t >= ch[c + 1]) c++;
	const n = Math.min(10, c + 1);
	const pos = c === 0 ? 6 - 6 * eio(P(t, K.pour - 1.5, K.pour + 1.2)) : E[n - 1] + (E[n] - E[n - 1]) * eio(P(t, ch[c], ch[c] + 1.4));
	const cta = K.cta !== undefined ? 1 - P(t, K.cta - 0.4, K.cta) : 1;
	return (
		<AbsoluteFill>
			<CellarBg w={1920} h={1080} />
			{/* 1 — intro */}
			<Win a={0} b={ch[1]}>
				<At x={1420} y={560}><Glass3D w={900} h={900} t={t} fill={0.5 * eout(P(t, 0.5, 4))} swirl={1} /></At>
				<Pop t={t} at={K.best} x={560} y={200}><Title text="THE WORLD'S BEST-SELLING COGNAC" col={C.gold} size={54} glow={C.amber} /></Pop>
				<Pop t={t} at={K.bottles} x={560} y={340}><Card w={640} col={C.gold} top="LVMH COGNAC, LAST YEAR" big="≈ 75 million bottles" /></Pop>
				<Pop t={t} at={K.irish} x={560} y={520}><Row><Flag c="ie" w={100} /><Pill text="FOUNDED BY AN IRISHMAN" bg={C.cream} size={34} /></Row></Pop>
				<Pop t={t} at={K.us} x={560} y={630}><Row><Flag c="us" w={100} /><Pill text="BIGGEST MARKET: THE U.S." bg={C.gold} size={34} /></Row></Pop>
				<Pop t={t} at={K.cork} x={560} y={760}><Txt text="County Cork → a Tupac song?" col={C.cream} size={40} /></Pop>
				<Pop t={t} at={K.tupac + 3} x={560} y={880}><Row gap={14}>{['AN INSECT', 'A KING', 'THE H IN LVMH'].map((x, i) => <div key={i} style={{transform: `scale(${pop(t, K.tupac + 3 + i * 1.6)})`}}><Pill text={x} bg={[C.green, C.gold, C.cream][i]} size={28} /></div>)}</Row></Pop>
			</Win>
			{/* 2 — Richard */}
			<Win a={ch[1]} b={ch[2]}>
				<Pop t={t} at={K.born} x={500} y={210}><Badge text="RICHARD HENNESSY · b. 1724" col={C.gold} size={44} /></Pop>
				<Pop t={t} at={K.louis} x={500} y={360}><Row><Flag c="ie" w={130} /><div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 70, color: C.gold}}>→</div><Flag c="fr" w={130} /></Row></Pop>
				<Pop t={t} at={K.brigade} x={500} y={490}><Txt text="the Irish Brigade of King Louis XV" col={C.mute} size={34} /></Pop>
				<Pop t={t} at={K.barrels} x={500} y={620}><Pill text="BARRELS SENT HOME → MORE ORDERS" bg={C.cream} size={30} /></Pop>
				<Pop t={t} at={K.james} x={500} y={800}><Card w={620} col={C.cream} top="HIS SON JAMES" big="Jas Hennessy & Co." sub="still the company's official name" /></Pop>
				<Pop t={t} at={K.town} x={1400} y={330} rot={-2}><TownSign w={620} name="COGNAC" /></Pop>
				{t > K.y1765 - 0.2 ? <At x={1400} y={720} s={2.2 - 1.2 * eout(P(t, K.y1765 - 0.2, K.y1765 + 0.15))} o={P(t, K.y1765 - 0.2, K.y1765)} rot={-8}><Seal size={320} text="1765" sub="TRADING HOUSE" /></At> : null}
			</Win>
			{/* 3 — what is cognac */}
			<Win a={ch[2]} b={ch[3]}>
				<At x={480} y={560}><Glass3D w={760} h={820} t={t} fill={0.55} dist={7} glow={0.4 + 0.6 * P(t, K.angels - 0.5, K.angels + 0.5)} /></At>
				{t > K.evap && t < K.fungus + 2 ? Array.from({length: 12}).map((_, i) => {const k = ((t - K.evap) * 0.4 + i / 12) % 1; return <div key={i} style={{position: 'absolute', left: 430 + Math.sin(i * 2.1 + t) * 70, top: 330 - k * 260, width: 14, height: 14, borderRadius: 7, background: C.gold, opacity: 0.6 * (1 - k), filter: 'blur(2px)'}} />;}) : null}
				<Pop t={t} at={K.protected} x={1350} y={190}><Badge text="A PROTECTED NAME, LIKE CHAMPAGNE" col={C.gold} size={36} /></Pop>
				<Pop t={t} at={K.grapes} x={1350} y={320}><Pill text="WHITE GRAPES" bg={C.cream} size={32} /></Pop>
				<Pop t={t} at={K.twice} x={1350} y={420}><Pill text="DISTILLED TWICE · COPPER STILLS" bg={C.amber} size={32} /></Pop>
				<Pop t={t} at={K.oak} x={1350} y={520}><Pill text="AGED IN FRENCH OAK" bg={C.cream} size={32} /></Pop>
				<Pop t={t} at={K.angels} x={1350} y={650}><Card w={640} col={C.gold} top="EVAPORATES EVERY YEAR" big="≈ 2% · the angels' share" /></Pop>
				<Pop t={t} at={K.vs} x={1350} y={880}><Row gap={16}>{[['V.S.', '2+ yrs', K.vs], ['V.S.O.P.', '4+ yrs', K.vsop], ['X.O.', '10+ yrs', K.xo]].map(([a, b, at]: any, i) => <div key={i} style={{transform: `scale(${pop(t, at - 0.3)})`}}><Card w={250} col={[C.cream, C.amber, C.gold][i]} top={b} big={a} /></div>)}</Row></Pop>
			</Win>
			{/* 4 — VSOP, stars, X.O, phylloxera */}
			<Win a={ch[3]} b={ch[4]}>
				<At x={520} y={520} s={pop(t, K.sixties - 0.4)}><AgeLabel w={640} stars={P(t, K.stars - 0.3, K.stars + 0.9)} xo={P(t, K.y1870 - 0.2, K.y1870 + 0.5)} /></At>
				<Pop t={t} at={K.y1817} x={1380} y={210}><Card w={680} col={C.gold} top="1817 · THE FUTURE KING GEORGE IV" big="Very Superior Old Pale" sub="= V.S.O.P. (according to the house)" /></Pop>
				<Pop t={t} at={K.stars} x={1380} y={430}><Pill text="1860s · ★ STARS ON THE LABEL" bg={C.cream} size={32} /></Pop>
				<Pop t={t} at={K.y1870} x={1380} y={530}><Pill text="1870 · X.O. FOR FAMILY & FRIENDS" bg={C.gold} size={32} /></Pop>
				<Pop t={t} at={K.phylloxera} x={1380} y={720}><Badge text="PHYLLOXERA" col={C.red} size={56} /></Pop>
				<Pop t={t} at={K.phylloxera + 0.8} x={1380} y={830}><Txt text="a tiny insect from America killed most vineyards" col={C.cream} size={30} /></Pop>
				<Pop t={t} at={K.replanted} x={1380} y={930}><Pill text="REPLANTED ALMOST FROM SCRATCH" bg={C.green} size={30} /></Pop>
			</Win>
			{/* 5 — Fillioux */}
			<Win a={ch[4]} b={ch[5]}>
				<Pop t={t} at={K.y1806} x={960} y={190}><Badge text="THE FILLIOUX FAMILY · MASTER BLENDERS SINCE 1806" col={C.gold} size={40} /></Pop>
				<At x={960} y={420}><Generations w={1200} k={eout(P(t, K.y1806, K.gen8 + 0.3))} t={t} /></At>
				<Pop t={t} at={K.renaud} x={960} y={620}><Txt text="Renaud Fillioux de Gironde · 8th generation" col={C.cream} size={38} /></Pop>
				<Pop t={t} at={K.committee} x={520} y={820}><Card w={560} col={C.cream} top="EVERY MORNING" big="Tasting committee" /></Pop>
				<Pop t={t} at={K.library} x={1400} y={820}><Card w={560} col={C.gold} top="A LIBRARY OF" big="Very old eaux-de-vie" sub="some from the 1800s" /></Pop>
			</Win>
			{/* 6 — America */}
			<Win a={ch[5]} b={ch[6]}>
				<Pop t={t} at={K.soldiers} x={500} y={190}><Row><Flag c="us" w={100} /><div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 50, color: C.gold}}>→</div><Flag c="fr" w={100} /></Row></Pop>
				<Pop t={t} at={K.soldiers + 0.5} x={500} y={290}><Txt text="Black American soldiers in France" col={C.cream} size={34} /></Pop>
				<Pop t={t} at={K.refused} x={500} y={400}><Pill text="LUXURY BRANDS: “NOT OUR CUSTOMERS”" bg={C.red} fg="#fff" size={28} /></Pop>
				<At x={360} y={720} s={pop(t, K.ebony - 0.3)}><Magazine w={280} title="EBONY" col="#9a2b22" rot={-6} /></At>
				<At x={660} y={735} s={pop(t, K.ebony + 0.3)}><Magazine w={280} title="JET" col="#2b4f9a" rot={5} /></At>
				<Pop t={t} at={K.douglas} x={1400} y={330}><Card w={700} col={C.gold} top="1963 · VICE PRESIDENT" big="Herb Douglas" sub="Olympic bronze medalist, long jump" /></Pop>
				<Pop t={t} at={K.vp + 1} x={1400} y={560}><Txt text="one of the first Black executives at a major U.S. company" col={C.cream} size={28} /></Pop>
				<Pop t={t} at={K.respect} x={1400} y={720}><Title text="RESPECT → LOYALTY" col={C.gold} size={70} glow={C.amber} /></Pop>
				<Pop t={t} at={K.doc} x={1400} y={880}><Pill text="DOC: “AN UNEXPECTED HISTORY”" bg={C.cream} size={30} /></Pop>
			</Win>
			{/* 7 — hip-hop */}
			<Win a={ch[6]} b={ch[7]}>
				<At x={480} y={500} s={pop(t, K.arrived - 0.3)}><Vinyl size={560} t={t} label="HENNY" /></At>
				<At x={480} y={920} s={pop(t, K.nineties)}><Equalizer w={760} t={t} /></At>
				<Pop t={t} at={K.henny} x={1400} y={200}><Title text="“HENNY”" col={C.gold} size={110} glow={C.amber} /></Pop>
				<Pop t={t} at={K.tupac2} x={1400} y={360}><Pill text="TUPAC · “HENNESSY”" bg={C.cream} size={36} /></Pop>
				<Pop t={t} at={K.busta} x={1400} y={470}><Pill text="BUSTA RHYMES · “PASS THE COURVOISIER”" bg={C.amber} size={28} /></Pop>
				<Pop t={t} at={K.artists} x={1240} y={620}><Card w={380} col={C.cream} top="LIMITED BOTTLES" big="Street artists" /></Pop>
				<Pop t={t} at={K.nba} x={1640} y={620}><Card w={340} col={C.gold} top="PARTNERSHIP" big="NBA" /></Pop>
				<Pop t={t} at={K.biggest} x={1400} y={860}><Row><Flag c="us" w={110} /><Card w={560} col={C.gold} top="MARKET #1" big="≈ 3 million cases / yr" /></Row></Pop>
			</Win>
			{/* 8 — LVMH */}
			<Win a={ch[7]} b={ch[8]}>
				<At x={960} y={330}><Letters size={240} on={[P(t, K.vuitton - 0.2, K.vuitton + 0.4), P(t, K.vuitton, K.vuitton + 0.6), P(t, K.moet - 0.2, K.moet + 0.4), P(t, ch[7] + 0.3, ch[7] + 0.9)]} hi={P(t, K.letters - 0.3, K.letters + 0.4)} /></At>
				<Pop t={t} at={K.y1971} x={500} y={620}><Card w={560} col={C.cream} top="1971" big="Moët + Hennessy" /></Pop>
				<Pop t={t} at={K.y1987} x={1420} y={620}><Card w={560} col={C.gold} top="1987" big="+ Louis Vuitton" /></Pop>
				<Pop t={t} at={K.arnault} x={500} y={840}><Pill text="BERNARD ARNAULT TAKES CONTROL" bg={C.cream} size={30} /></Pop>
				<Pop t={t} at={K.diageo} x={1420} y={840}><Pill text="DIAGEO OWNS ≈ 1/3 OF MOËT HENNESSY" bg={C.amber} size={30} /></Pop>
				<Pop t={t} at={K.largest} x={960} y={960}><Txt text="the world's largest luxury group" col={C.mute} size={34} /></Pop>
			</Win>
			{/* 9 — tariffs */}
			<Win a={ch[8]} b={ch[9]}>
				<Pop t={t} at={K.boomed} x={480} y={200}><Pill text="PANDEMIC BOOM → THE PARTY ENDS" bg={C.cream} size={32} /></Pop>
				<Pop t={t} at={K.china} x={480} y={360}><Row><Flag c="cn" w={120} /><Card w={460} col={C.red} top="2024 · CHINA" big="Duties on EU brandy" sub="a fight over electric cars" /></Row></Pop>
				<Pop t={t} at={K.y2025} x={480} y={610}><Row><Flag c="us" w={120} /><Card w={460} col={C.red} top="2025 · U.S." big="15% tariff" /></Row></Pop>
				<Pop t={t} at={K.fell} x={1400} y={300}><ShareRing size={440} k={1} label="share of all cognac (est.)" /></Pop>
				<Pop t={t} at={K.fell} x={1400} y={620}><Stamp text="COGNAC SALES −12%" size={54} /></Pop>
				<Pop t={t} at={K.rtd} x={1400} y={780}><Pill text="NEW: READY-TO-DRINK COCKTAILS" bg={C.gold} size={30} /></Pop>
				<Pop t={t} at={K.vines} x={960} y={930}><Txt text="some growers are pulling up vines" col={C.cream} size={34} /></Pop>
			</Win>
			{/* 10 — outro */}
			<Win a={ch[9]} b={ch[10]} last>
				<At x={1400} y={560} o={cta}><Glass3D w={820} h={860} t={t} fill={0.5} swirl={1} glow={0.9} /></At>
				{[['AN IRISH SOLDIER', K.soldier2, C.cream], ['A TOWN BY A RIVER', K.river, C.amber], ['ONE PALATE, 200 YEARS', K.palate, C.gold], ['DECADES OF TRUST', K.trust, C.cream]].map(([x, a, col]: any, j) => <At key={j} x={540} y={220 + j * 120} s={pop(t, a - 0.3)} o={cta}><Pill text={x} bg={col} size={38} /></At>)}
				<At x={540} y={760} s={pop(t, K.arm - 0.4)} o={cta}><Card w={640} col={C.gold} top="ON THE LABEL" big="An arm with an axe" sub="the family's Irish coat of arms" /></At>
				<At x={540} y={950} s={pop(t, K.overnight - 1)} o={cta}><Title text="IT'S ABOUT TIME" col={C.gold} size={80} glow={C.amber} /></At>
			</Win>
			<At x={960} y={62}><div style={{transform: 'scale(.8)'}}><Stave w={1500} years={YEARS} pos={pos} t={t} o={P(t, K.pour - 2, K.pour - 1) * cta} /></div></At>
			{PARTS.map((p, i) => <PartTitle key={i} n={i + 1} title={p} at={i === 0 ? 0.6 : ch[i] - 0.6} />)}
			<CTA K={K} S={L} cx={960} cy={-760} />
			{Array.from({length: loops}).map((_, i) => (
				<Sequence key={'m' + i} from={Math.round(i * (MUSIC - 4) * FPS)} durationInFrames={Math.round(MUSIC * FPS)} layout="none">
					<Audio src={staticFile('music.mp3')} volume={(f) => 0.12 * Math.min(1, f / (4 * FPS)) * Math.min(1, (MUSIC * FPS - f) / (4 * FPS)) * Math.min(1, (dur * FPS - (f + i * (MUSIC - 4) * FPS)) / 90)} />
				</Sequence>
			))}
			<Sequence from={15} layout="none"><Audio src={staticFile('long/voice.mp3')} volume={1.1} /></Sequence>
			{sfx('pour.mp3', 0.5, 0.32, 'po')}
			{sfx('barrel.mp3', K.barrels, 0.3, 'ba')}
			{sfx('clink.mp3', K.y1971, 0.28, 'cl')}
		</AbsoluteFill>
	);
};
