import React from 'react';
import {AbsoluteFill, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Audio} from '@remotion/media';
import {Bat, Bonfire, Counter, Devil, Door, Ember, Ghost, Lantern3D, Masked, NightBg, Newspaper, SoulCake, TimeRibbon, Voyage, YearWheel} from './Comps';
import {CTA} from './CTA';
import {chapters, sfx} from './Short';
import {At, Badge, BODY, C, DISPLAY, FPS, P, Pill, Title, Txt, eio, eout, pop} from './ui';

const PARTS = ['Tonight, and two thousand years of history', 'Samhain: the end of summer', 'When the dead walk', "All Hallows' Eve", 'Soul cakes', 'Stingy Jack and the turnip', 'Across the ocean', 'Pranks and trick or treat', 'War, candy and cartoons', 'Halloween today'];
PARTS[0] = 'Tonight';
const ERAS = ['SAMHAIN', '8TH CENTURY', 'MEDIEVAL', '1840s', '1920s', '1950s', 'TODAY'];
const L = {sub: 'FOLLOW', subbed: 'FOLLOWING ✓', like: 'LIKE'};

const Win: React.FC<{a: number; b: number; children: React.ReactNode; last?: boolean}> = ({a, b, children, last}) => {
	const t = useCurrentFrame() / FPS;
	if (t < a - 0.4 || t > b + 0.4) return null;
	const i = eout(P(t, a - 0.35, a + 0.4)), o = last ? 1 : 1 - P(t, b - 0.3, b + 0.2);
	return <AbsoluteFill style={{opacity: i * o, transform: `scale(${1.04 - 0.04 * i})`}}>{children}</AbsoluteFill>;
};
const PartTitle: React.FC<{n: number; title: string; at: number}> = ({n, title, at}) => {
	const t = useCurrentFrame() / FPS;
	const k = P(t, at, at + 0.5) * (1 - P(t, at + 3.5, at + 4.1));
	if (k <= 0) return null;
	return (
		<div style={{position: 'absolute', left: 80, bottom: 70, opacity: k, transform: `translateX(${(1 - eout(Math.min(1, k * 1.2))) * -60}px)`}}>
			<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 26, color: C.pumpkin, letterSpacing: 4}}>PART {n}</div>
			<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 56, color: C.bone, textShadow: '0 4px 20px rgba(0,0,0,.7)'}}>{title}</div>
			<div style={{height: 6, width: 160, background: C.pumpkin, borderRadius: 3, marginTop: 10, boxShadow: `0 0 14px ${C.pumpkin}`}} />
		</div>
	);
};
const Card: React.FC<{w: number; col: string; children: React.ReactNode; pad?: number}> = ({w, col, children, pad = 28}) => (
	<div style={{width: w, padding: pad, borderRadius: 28, background: 'rgba(13,7,22,.9)', border: `4px solid ${col}`, boxShadow: `0 0 30px ${col}66`, boxSizing: 'border-box', whiteSpace: 'normal', textAlign: 'center'}}>{children}</div>
);
const Stat: React.FC<{top: string; big: string; col: string; w?: number}> = ({top, big, col, w = 380}) => (
	<Card w={w} col={col} pad={22}><div style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 26, color: C.mute}}>{top}</div><div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 64, color: col, lineHeight: 1.1}}>{big}</div></Card>
);
const Tree: React.FC<{size: number; crosses: number}> = ({size, crosses}) => (
	<svg width={size} height={size * 1.1} viewBox="0 0 100 110">
		<rect x="44" y="55" width="12" height="55" fill="#4a2a14" />
		<circle cx="50" cy="38" r="34" fill="#1f5a2a" /><circle cx="30" cy="48" r="20" fill="#226630" /><circle cx="70" cy="48" r="20" fill="#226630" />
		{[[34, 30], [62, 26], [50, 50], [26, 52], [74, 50]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="5" fill="#d8262e" />)}
		{[0, 1, 2].map((i) => <g key={i} opacity={crosses > i / 3 ? 1 : 0}><path d={`M50 ${68 + i * 13} v9 M45.5 ${72 + i * 13} h9`} stroke={C.ember} strokeWidth="2.6" /></g>)}
	</svg>
);
const Bars: React.FC<{t: number; rows: [string, number, string, number][]; w: number; max: number}> = ({t, rows, w, max}) => (
	<div style={{display: 'flex', flexDirection: 'column', gap: 22}}>
		{rows.map(([lab, v, col, at], i) => {const k = eout(P(t, at, at + 0.9)); return (
			<div key={i} style={{display: 'flex', alignItems: 'center', gap: 20, opacity: Math.min(1, P(t, at - 0.2, at) * 2)}}>
				<div style={{width: 270, textAlign: 'right', fontFamily: DISPLAY, fontWeight: 900, fontSize: 32, color: C.bone}}>{lab}</div>
				<div style={{width: (w - 470) * (v / max) * k, height: 50, borderRadius: 12, background: col, boxShadow: `0 0 20px ${col}88`}} />
				<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 36, color: col}}>${(v * k).toFixed(v < 1 ? 2 : 1)}B</div>
			</div>
		);})}
	</div>
);

export const HallLong: React.FC<{data: any}> = ({data}) => {
	const K = data.k, ch = chapters(data, 10), dur = data.dur;
	const t = useCurrentFrame() / FPS;
	const MUSIC = 90, loops = Math.ceil(dur / MUSIC) + 1;
	const sway = Math.sin(t * 0.7) * 0.32, flick = 0.5 + 0.5 * Math.sin(t * 13) * Math.sin(t * 7.3);
	const eraOf = [6, 0, 0, 1, 2, 2.5, 3, 4, 5, 6];
	let rpos = 6;
	if (t < ch[1]) rpos = 6 - 6 * eio(P(t, K.travel - 0.2, K.travel + 2.0));
	else {let i = 1; while (i < 9 && t >= ch[i + 1]) i++; rpos = eraOf[i - 1] + (eraOf[i] - eraOf[i - 1]) * eio(P(t, ch[i], ch[i] + 1.4));}
	const ribO = (t < ch[1] ? P(t, K.travel - 0.6, K.travel) : 1) * (K.cta !== undefined ? 1 - P(t, K.cta - 0.4, K.cta) : 1);
	const cap1 = data.captions.find((c: any) => c.text.trim().startsWith('thirteen'));
	const b1 = cap1 ? cap1.startMs / 1000 : K.kids + 4;
	const morph7 = eio(P(t, K.pumpkin - 0.3, K.pumpkin + 1.2));
	return (
		<AbsoluteFill>
			<NightBg w={1920} h={1080} moon={[1800, 110]} hills={0.8} />
			{/* 1 — tonight */}
			<Win a={0} b={ch[1]}>
				<At x={1380} y={560} o={1 - 0.7 * P(t, K.travel - 0.5, K.travel + 0.5)}><Lantern3D w={900} h={900} morph={1} glow={P(t, 0.3, 1.2)} spin={sway} flicker={flick} /></At>
				{[0, 1, 2].map((i) => <At key={i} x={[980, 1760, 1240][i]} y={[380, 330, 900][i] + Math.sin(t * 2 + i) * 14} s={pop(t, K.kids - 0.2 + i * 0.3)}><Ghost size={[120, 100, 90][i]} t={t} ph={i} /></At>)}
				<At x={560} y={230} s={pop(t, b1 - 0.4)}><Counter k={P(t, b1 - 0.3, b1 + 1.0)} to={13.5} fmt={(v) => '$' + v.toFixed(1) + ' BILLION'} col={C.gold} size={96} /></At>
				<At x={560} y={330} s={pop(t, b1 + 0.3)}><Txt text="Halloween spending in the US · NRF 2026" col={C.bone} size={32} /></At>
				<At x={560} y={500} s={pop(t, K.split - 0.3)}><div style={{display: 'flex', gap: 22}}>{[['COSTUMES', C.pumpkin], ['DECOR', C.violet], ['CANDY', C.ghost]].map(([a, c], i) => <div key={i} style={{transform: `scale(${pop(t, K.split + i * 0.6)})`}}><Stat top={a} big="≈ $4B" col={c} w={240} /></div>)}</div></At>
				<At x={560} y={720} s={pop(t, K.dead - 0.4)}><Badge text="THE DEAD COME BACK" col={C.ghost} size={56} /></At>
				{t > K.travel - 1.2 ? <At x={560} y={870} s={pop(t, K.travel - 1.2)}><Title text="WHERE DID HALLOWEEN" col={C.bone} size={70} /></At> : null}
				{t > K.travel - 0.9 ? <At x={560} y={950} s={pop(t, K.travel - 0.9)}><Title text="COME FROM?" col={C.pumpkin} size={84} glow={C.pumpkin} /></At> : null}
				{[0, 1, 2].map((i) => {const k = (t - 6 - i * 0.4) / 5; if (k < 0 || k > 1) return null; return <At key={'b' + i} x={-100 + k * 2100} y={160 + i * 50 + Math.sin(k * 9 + i) * 30} s={1}><Bat size={80 - i * 14} t={t} ph={i} /></At>;})}
			</Win>
			{/* 2 — Samhain */}
			<Win a={ch[1]} b={ch[2]}>
				<At x={520} y={600} s={pop(t, K.halves - 0.3)}><YearWheel size={520} t={t} rot={-40 + 40 * eio(P(t, K.samhain - 0.6, K.samhain + 1))} dark={P(t, K.samhain - 0.2, K.samhain + 0.4)} L={{light: 'LIGHT', dark: 'DARK', harvest: 'SAMHAIN'}} /></At>
				<At x={1390} y={210} s={pop(t, K.gaels - 0.3)}><Pill text="THE GAELS · IRELAND & SCOTLAND" bg={C.ghost} size={34} /></At>
				<At x={1390} y={330} s={pop(t, K.samhain - 0.3)}><Title text="SAMHAIN · NOV 1" col={C.pumpkin} size={92} glow={C.pumpkin} /></At>
				<At x={1390} y={450} s={pop(t, K.harvest - 0.3)}><div style={{display: 'flex', gap: 16}}>{['END OF HARVEST', 'CATTLE IN', 'WINTER STORES'].map((x, i) => <div key={i} style={{transform: `scale(${pop(t, [K.harvest, K.cattle, K.cattle + 1.2][i] - 0.3)})`}}><Pill text={x} bg={[C.gold, C.bone, C.ember][i]} size={28} /></div>)}</div></At>
				<At x={1390} y={590} s={pop(t, K.sunset - 0.4)}><Txt text="A DAY BEGINS AT SUNSET" col={C.ember} size={42} /></At>
				<At x={1390} y={680} o={P(t, K.sunset - 0.4, K.sunset)}><div style={{position: 'relative', width: 640, height: 90, overflow: 'hidden', borderBottom: `4px solid ${C.ember}`}}><div style={{position: 'absolute', left: 260, top: 6 + 90 * eio(P(t, K.sunset, K.sunset + 2.2)), width: 110, height: 110, borderRadius: 55, background: 'radial-gradient(circle, #fff1b0 0%, #ffb340 50%, #ff5a14 100%)', boxShadow: '0 0 60px #ff9a3c'}} /></div></At>
				<At x={1390} y={790} s={pop(t, K.oct31 - 0.4)}><Pill text="OCTOBER 31 · EVENING" bg={C.pumpkin} size={40} /></At>
				<At x={1390} y={900} s={pop(t, K.caveat - 0.3)}><Badge text="CAVEAT: THE DRUIDS LEFT NO WRITING" col={C.bone} size={30} /></At>
			</Win>
			{/* 3 — the dead walk */}
			<Win a={ch[2]} b={ch[3]}>
				<At x={960} y={180} s={pop(t, ch[2] + 0.1)}><Txt text="OUR WORLD" col={C.ember} size={40} /></At>
				<At x={960} y={300}><div style={{width: 1700, height: 12 - 9 * P(t, K.wall, K.wall + 1), borderRadius: 8, background: `linear-gradient(90deg, transparent, ${C.ghost}, transparent)`, boxShadow: `0 0 ${40 + 30 * Math.sin(t * 6)}px ${C.ghost}`, opacity: 0.9 - 0.5 * P(t, K.wall, K.wall + 1) * (0.5 + 0.5 * Math.sin(t * 9))}} /></At>
				<At x={960} y={380} o={1 - 0.6 * P(t, K.walk, K.walk + 1)}><Txt text="THE OTHERWORLD" col={C.violet} size={36} /></At>
				{[0, 1, 2, 3, 4].map((i) => {const k = eout(P(t, K.walk - 0.6 + i * 0.25, K.walk + 1.6 + i * 0.25)); return <At key={i} x={[260, 560, 1360, 1660, 740][i]} y={640 - 420 * k + Math.sin(t * 2 + i) * 10} o={P(t, K.walk - 0.6 + i * 0.25, K.walk + i * 0.25) * (1 - 0.6 * P(t, K.bonfires, K.bonfires + 0.6))}><Ghost size={[110, 95, 120, 100, 85][i]} t={t} ph={i} /></At>;})}
				<At x={960} y={720} s={pop(t, K.bonfires - 0.3)}><Bonfire size={260} t={t} /></At>
				<At x={600} y={790} s={pop(t, K.food - 0.3)}><Card w={300} col={C.gold} pad={18}><Txt text="FOOD FOR THE DEAD" col={C.gold} size={28} /></Card></At>
				{[0, 1].map((i) => <At key={i} x={i ? 1560 : 1340} y={740} s={pop(t, K.guising - 0.3 + i * 0.2)}><Masked size={160} t={t} col={i ? '#3a1c58' : '#2a1840'} /></At>)}
				<At x={1450} y={900} s={pop(t, K.guising)}><Pill text="GUISING" bg={C.ghost} size={36} /></At>
				<At x={960} y={960} s={pop(t, K.recognize - 0.3)}><Badge text="CAN'T RECOGNIZE YOU → CAN'T TAKE YOU" col={C.ghost} size={34} /></At>
			</Win>
			{/* 4 — All Hallows */}
			<Win a={ch[3]} b={ch[4]}>
				<At x={960} y={170} s={pop(t, K.gregory - 0.3)}><Badge text="POPE GREGORY III · ROME · 8TH CENTURY" col={C.bone} size={36} /></At>
				{[[['OCT 31', "ALL HALLOWS' EVE"], 480, K.even - 0.4, C.violet], [['NOV 1', "ALL SAINTS' DAY"], 960, K.saints - 0.4, C.gold], [['NOV 2', "ALL SOULS' DAY"], 1440, K.souls - 0.4, C.ghost]].map(([Lb, x, a, col]: any, i) => (
					<At key={i} x={x} y={390} s={pop(t, a)}>
						<div style={{width: 400, borderRadius: 26, overflow: 'hidden', border: `4px solid ${col}`, boxShadow: `0 0 34px ${col}77`, background: 'rgba(13,7,22,.92)', textAlign: 'center'}}>
							<div style={{background: col, color: C.ink, fontFamily: DISPLAY, fontWeight: 900, fontSize: 42, padding: '12px 0'}}>{Lb[0]}</div>
							<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 32, color: C.bone, padding: '22px 10px'}}>{Lb[1]}</div>
						</div>
					</At>
				))}
				<At x={960} y={540} s={pop(t, K.holy - 0.3)}><Txt text="HALLOW = HOLY (OLD ENGLISH)" col={C.gold} size={34} /></At>
				<At x={960} y={650} s={pop(t, K.argue - 0.3)} o={1 - P(t, K.even - 0.6, K.even - 0.2)}><Pill text="HISTORIANS STILL ARGUE: REPLACING SAMHAIN?" bg={C.bone} size={30} /></At>
				<At x={960} y={680} s={pop(t, K.even - 0.2)}><Title text="All Hallows' Even" col={C.bone} size={76} /></At>
				<At x={960} y={790} s={pop(t, K.fast - 0.2)}><Title text="Hallowe'en" col={C.ember} size={76} /></At>
				<At x={960} y={920} s={pop(t, K.hw - 0.2, 0.6)}><Title text="HALLOWEEN" col={C.pumpkin} size={130} glow={C.pumpkin} /></At>
			</Win>
			{/* 5 — souling */}
			<Win a={ch[4]} b={ch[5]}>
				<At x={430} y={560}><Door w={330} open={eout(P(t, K.cakes - 0.6, K.cakes + 0.2))} shake={[0, 1, 2].reduce((a, i) => a + Math.sin(P(t, K.poor + i * 0.28, K.poor + i * 0.28 + 0.15) * Math.PI), 0)} glow={P(t, K.cakes - 0.6, K.cakes + 0.2)} /></At>
				<At x={1180} y={230} s={pop(t, K.poor - 0.3)}><Pill text="THE POOR, DOOR TO DOOR" bg={C.violet} fg="#fff" size={38} /></At>
				<At x={1000} y={420} s={pop(t, K.cakes - 0.2)}><SoulCake size={260} /></At>
				<At x={1000} y={540} s={pop(t, K.cross - 0.3)}><Pill text="SOUL CAKES" bg={C.ember} size={34} /></At>
				<At x={1480} y={470} s={pop(t, K.pray - 0.3)}><Card w={460} col={C.bone}><Txt text="IN RETURN:" col={C.mute} size={26} /><Txt text="PRAYERS FOR YOUR DEAD" col={C.bone} size={34} /></Card></At>
				<At x={1240} y={720} s={pop(t, K.shakes - 0.3)}><Card w={900} col={C.gold} pad={30}><div style={{fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 44, color: C.bone}}>“…to speak puling, like a beggar at Hallowmas.”</div><div style={{fontFamily: BODY, fontWeight: 700, fontSize: 26, color: C.gold, marginTop: 12}}>SHAKESPEARE · THE TWO GENTLEMEN OF VERONA</div></Card></At>
				<At x={1240} y={920} s={pop(t, K.pieces - 0.3)}><Badge text="COSTUMES + DOORS + TREATS = ALMOST THERE" col={C.pumpkin} size={34} /></At>
			</Win>
			{/* 6 — Stingy Jack */}
			<Win a={ch[5]} b={ch[6]}>
				<At x={520} y={560}><Lantern3D w={820} h={860} morph={0} glow={P(t, K.turnip - 0.5, K.turnip + 0.5)} spin={sway} flicker={flick} dist={5.6} /></At>
				<At x={520} y={160} s={pop(t, K.jack - 0.3)}><Badge text="STINGY JACK" col={C.pumpkin} size={52} /></At>
				<At x={1150} y={330} s={pop(t, K.tricked - 0.3)}><Devil size={170} t={t} /></At>
				<At x={1450} y={340} s={pop(t, K.tree - 0.3)}><Tree size={240} crosses={P(t, K.crosses - 0.2, K.crosses + 0.8)} /></At>
				<At x={1300} y={580} s={pop(t, K.heaven - 0.3)}><div style={{display: 'flex', gap: 24}}><Pill text="HEAVEN ✕" bg={C.bone} size={36} /><div style={{transform: `scale(${pop(t, K.hell - 0.3)})`}}><Pill text="HELL ✕" bg={C.blood} fg="#fff" size={36} /></div></div></At>
				<At x={1720} y={560} s={pop(t, K.coal - 0.3)}><Ember size={70} t={t} /></At>
				<At x={1380} y={700} s={pop(t, K.lantern - 0.3)}><Title text="JACK O' THE LANTERN" col={C.ember} size={56} glow={C.ember} /></At>
				<At x={1300} y={820} s={pop(t, K.faces - 0.3)}><Txt text="TURNIPS · POTATOES · BEETS" col={C.bone} size={36} /></At>
				<At x={1300} y={930} s={pop(t, K.burns - 0.4)}><Badge text="ROBERT BURNS · “HALLOWEEN” · 1785" col={C.ghost} size={32} /></At>
				<At x={950} y={930} s={pop(t, K.apples - 0.3)} o={1 - P(t, K.burns - 0.6, K.burns - 0.3)}><Pill text="APPLE BOBBING · FORTUNES" bg={C.blood} fg="#fff" size={30} /></At>
			</Win>
			{/* 7 — across the ocean */}
			<Win a={ch[6]} b={ch[7]}>
				<At x={960} y={150} s={pop(t, K.puritans - 0.3)} o={1 - P(t, K.potato - 0.5, K.potato)}><Badge text="PURITAN NEW ENGLAND: NO THANKS" col={C.bone} size={40} /></At>
				<At x={960} y={150} s={pop(t, K.famine - 0.3)}><Badge text="THE GREAT FAMINE · 1845" col={C.gold} size={44} /></At>
				<At x={640} y={560} o={1 - P(t, K.pumpkin - 0.9, K.pumpkin - 0.5)}><Voyage w={1060} k={eio(P(t, K.two - 0.5, K.customs + 0.5))} t={t} L={{ie: 'IRELAND', us: 'AMERICA'}} /></At>
				<At x={1540} y={420} s={pop(t, K.million - 0.3)}><Stat top="DIED" big="≈ 1,000,000" col={C.blood} w={440} /></At>
				<At x={1540} y={620} s={pop(t, K.two - 0.3)}><Stat top="LEFT IRELAND" big="≈ 2,000,000" col={C.gold} w={440} /></At>
				{t > K.pumpkin - 0.8 ? <At x={640} y={560} o={P(t, K.pumpkin - 0.7, K.pumpkin - 0.3)}><Lantern3D w={900} h={860} morph={morph7} glow={1} spin={sway} flicker={flick} dist={5.8 + 0.4 * morph7} /></At> : null}
				<At x={1540} y={820} s={pop(t, K.carve - 0.3)}><Pill text="TURNIP → PUMPKIN" bg={C.pumpkin} size={40} /></At>
				<At x={1540} y={920} s={pop(t, K.sixties - 0.3)}><Txt text="1860s: A HALLOWEEN SYMBOL" col={C.ember} size={36} /></At>
			</Win>
			{/* 8 — pranks → trick or treat */}
			<Win a={ch[7]} b={ch[8]}>
				<At x={520} y={220} s={pop(t, K.adults - 0.3)}><Pill text="1800s: PARTIES FOR ADULTS" bg={C.violet} fg="#fff" size={34} /></At>
				{['GATES VANISH', 'SOAPED WINDOWS', 'TIPPED OUTHOUSES'].map((x, i) => <At key={i} x={520} y={360 + i * 100} s={pop(t, K.gates - 0.3 + i * 0.5)} rot={i % 2 ? 3 : -3}><Badge text={x} col={C.blood} size={40} /></At>)}
				<At x={520} y={710} s={pop(t, K.vandal - 0.3)}><Txt text="1930s DEPRESSION → VANDALISM" col={C.blood} size={38} /></At>
				<At x={520} y={820} s={pop(t, K.towns - 0.3)}><Pill text="TOWNS: PARTIES, PARADES, TREATS" bg={C.ghost} size={32} /></At>
				<At x={1380} y={560} s={pop(t, K.phrase - 0.3)} rot={-3}><Newspaper w={760} L={{mast: 'ALBERTA, CANADA', date: '1927 · ONE OF THE EARLIEST IN PRINT', head: 'TRICK OR TREAT!', sub: 'a new phrase is born'}} /></At>
			</Win>
			{/* 9 — war, boom, cartoons */}
			<Win a={ch[8]} b={ch[9]}>
				{[[K.sugar, 'SUGAR RATIONED', '1942', C.blood, 330, 280], [K.boom, 'BABY BOOM · SUBURBS', '1946+', C.ghost, 960, 280], [K.ads, 'CANDY ADS EVERYWHERE', 'MID-1950s', C.gold, 1590, 280], [K.donald, 'DONALD DUCK: “TRICK OR TREAT”', '1952', C.sky, 560, 560], [K.peanuts, 'IT’S THE GREAT PUMPKIN, CHARLIE BROWN', '1966', C.pumpkin, 1360, 560]].map(([a, txt, yr, col, x, y]: any, i) => (
					<At key={i} x={x} y={y} s={pop(t, a - 0.3)}><Card w={i < 3 ? 520 : 700} col={col}><div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 60, color: col}}>{yr}</div><div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 30, color: C.bone}}>{txt}</div></Card></At>
				))}
				<At x={960} y={820} s={pop(t, K.scare - 0.3)}><Badge text="POISONED CANDY SCARE" col={C.blood} size={44} /></At>
				{t > K.noCases - 0.2 ? <At x={1520} y={810} s={2 - 1 * eout(P(t, K.noCases - 0.2, K.noCases + 0.1))} rot={-8} o={Math.min(1, P(t, K.noCases - 0.2, K.noCases) * 3)}><div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 46, color: C.ghost, border: `6px solid ${C.ghost}`, borderRadius: 16, padding: '4px 22px', background: 'rgba(13,7,22,.8)'}}>ALMOST NO REAL CASES</div></At> : null}
				<At x={960} y={950} s={pop(t, K.wrapped - 0.3)}><Pill text="→ INDIVIDUALLY WRAPPED CANDY" bg={C.bone} size={34} /></At>
			</Win>
			{/* 10 — today */}
			<Win a={ch[9]} b={ch[10]} last>
				<At x={1440} y={600} o={P(t, ch[9], ch[9] + 0.8)}><Lantern3D w={820} h={820} morph={1} glow={1} spin={sway} flicker={flick} dist={6.2} /></At>
				<At x={560} y={190} s={pop(t, K.b135 - 0.4)}><Counter k={P(t, K.b135 - 0.3, K.b135 + 1.0)} to={13.5} fmt={(v) => '$' + v.toFixed(1) + ' BILLION'} col={C.gold} size={90} /></At>
				<At x={560} y={290} s={pop(t, K.pp - 0.3)}><Txt text="≈ $115 PER PERSON · NRF 2026" col={C.bone} size={34} /></At>
				<At x={600} y={540} s={pop(t, K.costumes - 0.4)} o={1 - P(t, K.chain - 0.5, K.chain)}><Bars t={t} w={1000} max={4.4} rows={[['COSTUMES', 4.4, C.pumpkin, K.costumes], ['DECORATIONS', 4.3, C.violet, K.costumes + 1.0], ['CANDY', 4.1, C.ghost, K.costumes + 1.8], ['PUMPKINS', 0.77, C.ember, K.pumpkins - 0.3]]} /></At>
				<At x={600} y={800} s={pop(t, K.back - 0.3)} o={1 - P(t, K.chain - 0.5, K.chain)}><Pill text="BACK TO IRELAND & BRITAIN — AMERICAN-STYLE" bg={C.bone} size={30} /></At>
				{t > K.chain - 0.4 ? <At x={600} y={560} s={pop(t, K.chain - 0.4)} o={K.cta !== undefined ? 1 - P(t, K.cta - 0.4, K.cta) : 1}><div style={{display: 'flex', alignItems: 'center', gap: 18}}>{[['BONFIRES', C.ember], ['SOUL CAKES', C.gold], ['A TURNIP', C.violet], ['A PUMPKIN', C.pumpkin]].map(([x, c], i) => <React.Fragment key={i}>{i ? <div style={{fontSize: 44, color: C.mute, fontWeight: 900}}>→</div> : null}<div style={{transform: `scale(${pop(t, K.chain + i * 0.5)})`}}><Pill text={x} bg={c} size={30} fg={i === 2 ? '#fff' : C.ink} /></div></React.Fragment>)}</div></At> : null}
				<At x={600} y={780} s={pop(t, K.hide - 0.4)} o={K.cta !== undefined ? 1 - P(t, K.cta - 0.4, K.cta) : 1}><Txt text="THEY HID FROM THE DEAD." col={C.bone} size={48} /></At>
				<At x={600} y={880} s={pop(t, K.asthem - 0.5)} o={K.cta !== undefined ? 1 - P(t, K.cta - 0.4, K.cta) : 1}><Title text="WE DRESS UP AS THEM." col={C.ghost} size={70} glow={C.ghost} /></At>
			</Win>
			{ribO > 0 ? <At x={960} y={62} o={1}><div style={{transform: 'scale(.9)'}}><TimeRibbon w={1300} eras={ERAS} pos={rpos} t={t} o={ribO} /></div></At> : null}
			{PARTS.map((p, i) => <PartTitle key={i} n={i + 1} title={p} at={i === 0 ? 0.6 : ch[i] + 0.3} />)}
			<CTA K={K} S={L} cx={960} cy={-760} />
			{Array.from({length: loops}).map((_, i) => (
				<Sequence key={'m' + i} from={Math.round(i * (MUSIC - 4) * FPS)} durationInFrames={Math.round(MUSIC * FPS)} layout="none">
					<Audio src={staticFile('music.mp3')} volume={(f) => 0.12 * Math.min(1, f / (4 * FPS)) * Math.min(1, (MUSIC * FPS - f) / (4 * FPS)) * Math.min(1, (dur * FPS - (f + i * (MUSIC - 4) * FPS)) / 90)} />
				</Sequence>
			))}
			<Sequence from={15} layout="none"><Audio src={staticFile('long/voice.mp3')} volume={1.1} /></Sequence>
			{sfx('fire.mp3', K.bonfires - 0.3, 0.3, 'fi')}
			{sfx('knock.mp3', K.poor - 0.05, 0.45, 'kn')}
			{sfx('carve.mp3', K.pumpkin - 0.1, 0.35, 'ca')}
			{sfx('coins.mp3', K.b135 - 0.2, 0.28, 'co')}
		</AbsoluteFill>
	);
};
