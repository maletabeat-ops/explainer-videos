import React from 'react';
import {AbsoluteFill, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Audio} from '@remotion/media';
import {BoardRow, Doc, Flap, Forecast, Pass, Person, Phone, RunwayBg, SeatMap, Ticket} from './Comps';
import {CTA} from './CTA';
import {Plane, Seat, sfx} from './Short';
import {At, Badge, C, DISPLAY, FPS, P, Pill, Title, Txt, clamp, eout, pop} from './ui';

const L = {sub: 'SUBSCRIBE', subbed: 'SUBSCRIBED ✓', like: 'LIKE'};
const N = 14;
const Win: React.FC<{a: number; b: number; children: React.ReactNode; last?: boolean}> = ({a, b, children, last}) => {
	const t = useCurrentFrame() / FPS;
	if (t < a - 0.4 || t > b + 0.4) return null;
	const i = eout(P(t, a - 0.3, a + 0.45)), o = last ? 1 : 1 - P(t, b - 0.3, b + 0.1);
	return <AbsoluteFill style={{opacity: Math.min(1, i * 1.4) * o, transform: `perspective(2000px) rotateX(${(1 - i) * -60}deg)`, transformOrigin: '50% 0%'}}>{children}</AbsoluteFill>;
};
// phase inside a section: fades in at a, out at b
const Ph: React.FC<{a: number; b?: number; children: React.ReactNode}> = ({a, b = 1e9, children}) => {
	const t = useCurrentFrame() / FPS;
	const k = P(t, a - 0.3, a + 0.2) * (1 - P(t, b - 0.3, b));
	return k <= 0 ? null : <AbsoluteFill style={{opacity: k}}>{children}</AbsoluteFill>;
};
const PartTitle: React.FC<{n: number; title: string; at: number}> = ({n, title, at}) => {
	const t = useCurrentFrame() / FPS;
	const k = P(t, at, at + 0.5) * (1 - P(t, at + 4.2, at + 4.8));
	if (k <= 0) return null;
	return (
		<div style={{position: 'absolute', left: 80, bottom: 56, opacity: k, transform: `translateX(${(1 - eout(Math.min(1, k * 1.2))) * -60}px)`}}>
			<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 24, color: C.yellow, letterSpacing: 4}}>GATE {String(n).padStart(2, '0')}</div>
			<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 50, color: C.white, textShadow: '0 4px 20px rgba(0,0,0,.7)'}}>{title}</div>
			<div style={{height: 5, width: 160, background: C.yellow, borderRadius: 3, marginTop: 10, boxShadow: `0 0 14px ${C.yellow}`}} />
		</div>
	);
};
// a list row that lights up at its key
const Row: React.FC<{text: string; on: number; col?: string; w?: number; size?: number; mark?: string}> = ({text, on, col = C.cyan, w = 760, size = 40, mark}) => (
	<div style={{width: w, display: 'flex', alignItems: 'center', gap: 22, padding: '16px 26px', borderRadius: 20, boxSizing: 'border-box', background: on > 0.5 ? `${col}1f` : 'rgba(255,255,255,.04)', border: `3px solid ${on > 0.5 ? col : 'rgba(255,255,255,.12)'}`, boxShadow: on > 0.5 ? `0 0 24px ${col}55` : 'none', opacity: 0.35 + 0.65 * on, transform: `translateX(${(1 - eout(on)) * 30}px)`}}>
		<div style={{minWidth: 40, height: 40, borderRadius: 20, background: on > 0.5 ? col : '#2a3346', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: DISPLAY, fontWeight: 900, fontSize: 24, color: C.ink}}>{mark ?? ''}</div>
		<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: size, color: on > 0.5 ? C.white : C.mute, whiteSpace: 'normal'}}>{text}</div>
	</div>
);
const Rows: React.FC<{t: number; x: number; y: number; items: [string, number, string?][]; w?: number; gap?: number; size?: number; numbered?: boolean}> = ({t, x, y, items, w = 760, gap = 100, size = 40, numbered}) => (
	<>{items.map(([s, k, col], i) => <At key={i} x={x} y={y + i * gap}><Row text={s} on={P(t, k - 0.3, k + 0.1)} col={col ?? C.cyan} w={w} size={size} mark={numbered ? String(i + 1) : undefined} /></At>)}</>
);
const Bar: React.FC<{label: string; v: number; max: number; col: string; text: string; w?: number}> = ({label, v, max, col, text, w = 1100}) => (
	<div style={{display: 'flex', alignItems: 'center', gap: 24}}>
		<div style={{width: 330, textAlign: 'right', fontFamily: DISPLAY, fontWeight: 900, fontSize: 36, color: C.white}}>{label}</div>
		<div style={{width: w, height: 70, borderRadius: 35, background: '#16203a', position: 'relative'}}>
			<div style={{width: `${Math.max(1.2, 100 * v / max)}%`, height: '100%', borderRadius: 35, background: col, boxShadow: `0 0 26px ${col}88`}} />
			<div style={{position: 'absolute', left: `${Math.max(1.2, 100 * v / max)}%`, top: 0, height: '100%', display: 'flex', alignItems: 'center', paddingLeft: 20, fontFamily: DISPLAY, fontWeight: 900, fontSize: 40, color: col, whiteSpace: 'nowrap'}}>{text}</div>
		</div>
	</div>
);
const n$ = (v: number) => '$' + Math.round(v).toLocaleString('en-US');
const STATUS = ['OVERSOLD', 'NO-SHOWS', 'FORECAST', '1972', '1968', 'AUCTION', 'FLIGHT 3411', '$10,000', 'WHO GOES?', 'THE LAW', 'WORLDWIDE', 'RARE NOW', 'YOUR MOVE', 'OVERSOLD'];
const SCOL = [C.red, C.mute, C.cyan, C.yellow, C.yellow, C.yellow, C.red, C.green, C.red, C.green, C.cyan, C.green, C.yellow, C.red];

export const OverLong: React.FC<{data: any}> = ({data}) => {
	const K = data.k, dur = data.dur;
	const ch = [0, ...data.segs.filter((s: any) => !s.cta).slice(1, N).map((s: any) => s.t0 - 0.4), dur];
	const t = useCurrentFrame() / FPS;
	const ci = Math.max(0, ch.findIndex((c: number, i: number) => t >= c && t < ch[i + 1]));
	const cta = K.cta !== undefined ? 1 - P(t, K.cta - 0.4, K.cta) : 1;
	const MUSIC = 90, loops = Math.ceil(dur / (MUSIC - 4)) + 1;
	const bid = t < K.f_400 - 0.2 ? 200 : t < K.f_600 - 0.2 ? 400 : t < K.f_800 - 0.2 ? 600 : 800;
	const bidK = [K.f_200, K.f_400, K.f_600, K.f_800][[200, 400, 600, 800].indexOf(bid)];
	return (
		<AbsoluteFill>
			<RunwayBg w={1920} h={1080} />
			{/* 1 Sold twice */}
			<Win a={ch[0]} b={ch[1]}>
				<Ph a={0} b={K.a_three - 0.2}>
					<At x={440} y={560} s={0.52}><SeatMap fill={eout(P(t, 0.4, K.a_tickets))} /></At>
					{Array.from({length: 9}).map((_, i) => <At key={i} x={720 + (i % 3) * 60} y={420 + Math.floor(i / 3) * 110} s={pop(t, K.a_tickets + i * 0.06, 0.3)}><Person size={42} col={C.red} /></At>)}
					<At x={1350} y={250} s={pop(t, 0.3)}><div style={{display: 'flex', alignItems: 'center', gap: 24}}><Flap text="180" size={100} col={C.cyan} flip={P(t, 0.4, 1.2)} /><Title text="SEATS" col={C.white} size={70} /></div></At>
					<At x={1350} y={390} s={pop(t, K.a_tickets - 0.3)}><div style={{display: 'flex', alignItems: 'center', gap: 24}}><Flap text="189" size={100} col={C.red} flip={P(t, K.a_tickets - 0.2, K.a_tickets + 0.6)} /><Title text="TICKETS" col={C.white} size={70} /></div></At>
					<At x={1350} y={560} s={pop(t, K.a_name - 0.3)}><Badge text="OVERBOOKING" col={C.yellow} size={70} /></At>
					<At x={1300} y={780} s={pop(t, K.a_twice - 1.2)} rot={-4}><Pass w={620} seat="14C" route="JFK → LAX" name="SMITH / JOHN" label="SEAT" /></At>
					<At x={1340} y={870} s={pop(t, K.a_twice - 0.4)} rot={3}><Pass w={620} seat="14C" route="JFK → LAX" name="YOU" label="SEAT" col={C.yellow} stamp="× 2" stampK={P(t, K.a_twice, K.a_twice + 0.3)} stampX="55%" stampY="20%" /></At>
					<At x={1000} y={560} s={t < K.a_purpose - 0.25 ? 0 : 2 - eout(P(t, K.a_purpose - 0.25, K.a_purpose + 0.05))} rot={-8} o={1 - P(t, K.a_name - 0.4, K.a_name)}><div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 90, color: C.yellow, border: `9px solid ${C.yellow}`, borderRadius: 24, padding: '4px 34px', background: 'rgba(5,8,15,.88)'}}>ON PURPOSE</div></At>
				</Ph>
				<Ph a={K.a_three}>
					<At x={960} y={250} s={pop(t, K.a_three - 0.2)}><Title text="3 SECRETS AIRLINES DON'T ADVERTISE" col={C.white} size={64} /></At>
					<Rows t={t} x={960} y={440} w={1100} size={50} gap={150} numbered items={[['Why selling seats that don’t exist makes sense', K.a_why], ['Who gets kicked off first', K.a_who, C.red], ['How to walk away with a lot more', K.a_pay, C.green]]} />
				</Ph>
			</Win>
			{/* 2 No-shows */}
			<Win a={ch[1]} b={ch[2]}>
				<Ph a={ch[1]} b={K.b_sweater - 0.2}>
					<At x={440} y={560} s={0.52}><SeatMap fill={1} noshow={P(t, K.b_noshow, K.b_twenty)} /></At>
					<At x={1350} y={200} s={pop(t, K.b_noshow - 0.3)}><Title text="SOMEBODY DOESN'T SHOW UP" col={C.white} size={58} /></At>
					<Rows t={t} x={1080} y={330} w={500} size={34} gap={95} items={[['OVERSLEPT', K.b_sleep, C.yellow], ['TRAFFIC', K.b_traffic, C.yellow], ['THE FLU', K.b_flu, C.red], ['BOOKED TWO FLIGHTS', K.b_two, C.mute]]} />
					<At x={1640} y={520} s={pop(t, K.b_pct - 0.4)}><Title text="5–15%" col={C.yellow} size={130} glow={C.yellow} /></At>
					<At x={1350} y={820} s={pop(t, K.b_twenty - 0.4)}><Pill text="20+ EMPTY SEATS ON ONE PLANE" bg={C.red} fg="#fff" size={44} /></At>
				</Ph>
				<Ph a={K.b_sweater}>
					<At x={520} y={300} s={pop(t, K.b_sweater - 0.2)}><Ticket w={700} title="A SHOP'S SWEATER" big="SELL IT TOMORROW" col={C.green} bigSize={56} /></At>
					<At x={1400} y={300} s={pop(t, K.b_gone - 0.6)}><Ticket w={700} title="A PLANE'S SEAT" big="GONE FOREVER" col={C.red} bigSize={56} /></At>
					<At x={1400} y={640} s={pop(t, K.b_gone - 0.4)}><Seat size={220} burn={P(t, K.b_gone - 0.2, K.b_gone + 1.6)} /></At>
					{(() => {const k = P(t, K.b_air - 1.2, K.b_air + 1.6); return k > 0 && k < 1 ? <At x={-100 + 2100 * eout(k)} y={820 - 500 * k} rot={60}><Plane size={180} /></At> : null;})()}
				</Ph>
			</Win>
			{/* 3 Forecast */}
			<Win a={ch[2]} b={ch[3]}>
				<At x={960} y={180} s={pop(t, K.c_rm - 0.4)}><Badge text="REVENUE MANAGEMENT" col={C.cyan} size={56} /></At>
				<At x={560} y={500} s={pop(t, K.c_tuesday - 0.6)}><Forecast w={860} labels={['LAST TUESDAY', 'MONDAY BIZ', 'AUGUST BEACH']} v={P(t, K.c_tuesday - 0.3, K.c_bet)} result="NO-SHOWS: ~9" /></At>
				<At x={1440} y={380} s={pop(t, K.c_cheap - 0.4)}><Row text="NON-REFUNDABLE → SHOWS UP" on={1} col={C.green} w={720} size={34} /></At>
				<At x={1440} y={490} s={pop(t, K.c_flex - 0.4)}><Row text="FLEXIBLE → OFTEN NO-SHOW" on={1} col={C.red} w={720} size={34} /></At>
				<At x={1440} y={660} s={pop(t, K.c_sells - 0.4)}><div style={{display: 'flex', alignItems: 'center', gap: 20}}><Flap text={t < K.c_sells + 0.3 ? '180' : '189'} size={100} col={t < K.c_sells + 0.3 ? C.cyan : C.yellow} flip={P(t, K.c_sells + 0.2, K.c_sells + 0.9)} /><Title text="SOLD" col={C.white} size={64} /></div></At>
				<At x={1440} y={820} s={pop(t, K.c_full - 0.3)}><Pill text="+9 EXTRA FARES" bg={C.green} size={44} /></At>
				{t > K.c_everyone - 0.4 ? <AbsoluteFill style={{background: `rgba(3,6,12,${0.75 * P(t, K.c_everyone - 0.4, K.c_everyone)})`}} /> : null}
				<At x={960} y={560} s={t < K.c_everyone - 0.3 ? 0 : pop(t, K.c_everyone - 0.3, 0.4)}><div style={{padding: '30px 60px', borderRadius: 30, background: 'rgba(5,8,15,.95)', border: `6px solid ${C.red}`, boxShadow: `0 0 50px ${C.red}88`}}><Title text="…AND EVERYBODY SHOWS UP" col={C.red} size={80} /></div></At>
			</Win>
			{/* 4 Nader */}
			<Win a={ch[3]} b={ch[4]}>
				<At x={540} y={480} s={pop(t, K.d_1972 - 0.4)} rot={-2}><Doc w={760} head="APRIL 1972 · WASHINGTON" lines={['Passenger: Ralph Nader', 'Allegheny Airlines → Hartford', 'Reservation: CONFIRMED']} stamp="NO SEAT" k={P(t, K.d_noseat, K.d_noseat + 0.3)} col={C.red} /></At>
				<At x={1400} y={230} s={pop(t, K.d_945 - 0.5)}><Card2 big="945" small="bumped by Allegheny that month" col={C.yellow} /></At>
				<At x={1400} y={430} s={pop(t, K.d_83k - 0.5)}><Card2 big="~83,000" small="bumped across the U.S. in 1972" col={C.red} /></At>
				<At x={1400} y={630} s={pop(t, K.d_25k - 0.5)}><Card2 big="$25,000" small="punitive damages awarded" col={C.green} /></At>
				<At x={1400} y={800} s={pop(t, K.d_court - 0.4)}><Badge text="→ SUPREME COURT" col={C.cyan} size={48} /></At>
				<At x={540} y={880} s={pop(t, K.d_secret - 0.4)}><Pill text="THE SECRET IS OUT" bg={C.yellow} size={46} /></At>
			</Win>
			{/* 5 Simon */}
			<Win a={ch[4]} b={ch[5]}>
				<Ph a={ch[4]} b={K.e_1978 - 0.2}>
					<At x={540} y={460} s={pop(t, K.e_simon - 0.4)} rot={-2}><Doc w={760} head="JULIAN SIMON · 1968" lines={['“An Almost Practical Solution', 'to Airline Overbooking”']} stamp="JUST ASK" k={P(t, K.e_ask, K.e_ask + 0.3)} col={C.green} /></At>
					<At x={1400} y={220} s={pop(t, K.e_hurry - 0.4)}><Row text="IN A HURRY → KEEP SEAT" on={1} col={C.red} w={720} size={36} /></At>
					<At x={1400} y={330} s={pop(t, K.e_wait - 0.4)}><Row text="CAN WAIT → NAME A PRICE" on={1} col={C.green} w={720} size={36} /></At>
					<At x={1400} y={480} s={pop(t, K.e_auction - 0.4)}><Title text="REVERSE AUCTION" col={C.yellow} size={60} glow={C.yellow} /></At>
					{[['$600', 0], ['$350', 1], ['$150', 2]].map(([v, i]) => <At key={v as string} x={1180 + (i as number) * 220} y={640} s={pop(t, K.e_auction + 0.4 + (i as number) * 0.3)}><div style={{padding: '18px 26px', borderRadius: 20, border: `4px solid ${i === 2 && t > K.e_least - 0.2 ? C.green : '#3a4660'}`, background: 'rgba(8,14,26,.9)', boxShadow: i === 2 && t > K.e_least - 0.2 ? `0 0 30px ${C.green}` : 'none', fontFamily: DISPLAY, fontWeight: 900, fontSize: 56, color: i === 2 && t > K.e_least - 0.2 ? C.green : C.white}}>{v}</div></At>)}
					<At x={1400} y={780} s={pop(t, K.e_least - 0.2)}><Txt text="lowest price gives up the seat" col={C.green} size={36} /></At>
					<At x={540} y={880} s={pop(t, K.e_nobody - 0.3)}><Pill text="FOR YEARS, NOBODY LISTENED" bg={C.mute} size={40} /></At>
				</Ph>
				<Ph a={K.e_1978}>
					<At x={960} y={330} s={pop(t, K.e_1978 - 0.3)}><Title text="1978" col={C.yellow} size={180} glow={C.yellow} /></At>
					<At x={960} y={540} s={pop(t, K.e_vol - 0.5)}><Badge text="ASK FOR VOLUNTEERS FIRST" col={C.green} size={70} /></At>
					<At x={960} y={740} s={pop(t, K.e_mic - 0.4)}><Pill text="…THAT'S WHY THE GATE AGENT STARTS MAKING OFFERS" bg={C.white} size={38} /></At>
				</Ph>
			</Win>
			{/* 6 Auction */}
			<Win a={ch[5]} b={ch[6]}>
				<Ph a={ch[5]} b={K.f_290 - 0.2}>
					<At x={960} y={170} s={pop(t, K.f_oversold - 0.4)}><Badge text="THIS FLIGHT IS OVERSOLD" col={C.yellow} size={56} /></At>
					<At x={960} y={420} s={pop(t, K.f_200 - 0.5, 0.35)}><Flap text={'$' + bid} size={190} col={C.green} flip={P(t, bidK - 0.2, bidK + 0.5)} /></At>
					<At x={960} y={590} s={pop(t, K.f_200)}><Txt text="TRAVEL VOUCHER + LATER FLIGHT" col={C.white} size={40} /></At>
					{Array.from({length: 12}).map((_, i) => {const up = i === 7 && t > K.f_stands - 0.3; return <At key={i} x={300 + i * 120} y={810 - (up ? 50 * eout(P(t, K.f_stands - 0.3, K.f_stands + 0.2)) : 0)} s={pop(t, K.f_heard + i * 0.05, 0.3)}><Person size={64} col={up ? C.green : '#6c7a99'} /></At>;})}
				</Ph>
				<Ph a={K.f_290}>
					<At x={960} y={200} s={pop(t, K.f_290 - 0.4)}><Title text="U.S. AIRLINES, 2024" col={C.white} size={64} /></At>
					<At x={960} y={420}><Bar label="VOLUNTEERED" v={291 * eout(P(t, K.f_290 - 0.2, K.f_290 + 1))} max={300} col={C.green} text="~291,000" w={1000} /></At>
					<At x={960} y={540}><Bar label="FORCED OFF" v={25 * eout(P(t, K.f_25 - 0.2, K.f_25 + 0.8))} max={300} col={C.red} text="~25,000" w={1000} /></At>
					<At x={960} y={740} s={pop(t, K.f_ten - 0.4)}><Pill text="10+ VOLUNTEERS FOR EVERY FORCED BUMP" bg={C.yellow} size={46} /></At>
					<At x={960} y={880} s={pop(t, K.f_notalways - 0.3)}><Txt text="…but not always" col={C.red} size={48} /></At>
				</Ph>
			</Win>
			{/* 7 Flight 3411 */}
			<Win a={ch[6]} b={ch[7]}>
				<At x={480} y={520} s={pop(t, ch[6] + 0.3) * 0.82}><Phone w={620} t={t} empty={P(t, K.g_drag - 0.2, K.g_drag + 0.5)} top="CHICAGO" bottom={t > K.g_nobody - 0.2 ? '$800 — NOBODY' : ''} /></At>
				<Rows t={t} x={1340} y={175} w={860} size={34} gap={90} items={[['APRIL 9, 2017 · UNITED EXPRESS 3411', K.g_date, C.yellow], ['EVERYONE ALREADY BOARDED', K.g_boarded], ['4 SEATS NEEDED FOR CREW', K.g_crew], ['OFFER: $400 → $800', K.g_o400, C.green], ['NOBODY MOVES', K.g_nobody, C.red], ['4 PASSENGERS CHOSEN · 3 LEAVE', K.g_four], ['DR. DAVID DAO REFUSES', K.g_refuses, C.red], ['DRAGGED DOWN THE AISLE', K.g_drag, C.red]]} />
				<At x={1340} y={920} s={pop(t, K.g_millions - 0.4)}><Pill text="SEEN BY MILLIONS WORLDWIDE" bg={C.red} fg="#fff" size={40} /></At>
			</Win>
			{/* 8 $10,000 */}
			<Win a={ch[7]} b={ch[8]}>
				<At x={540} y={260} s={pop(t, K.h_10k - 1.0)}><Txt text="NEW MAX FOR A VOLUNTEER" col={C.white} size={40} /></At>
				<At x={540} y={400} s={pop(t, K.h_10k - 0.7, 0.35)}><Title text={n$(10000 * eout(P(t, K.h_10k - 0.6, K.h_10k + 0.6)))} col={C.green} size={160} glow={C.green} /></At>
				<Rows t={t} x={1400} y={230} w={820} size={36} gap={110} items={[['SETTLED · AMOUNT UNDISCLOSED', K.h_settled, C.mute], ['NO MORE REMOVING SEATED PASSENGERS', K.h_seated, C.green], ['UNITED: UP TO $10,000', K.h_10k, C.green], ['DELTA: UP TO ~$9,950', K.h_nearly, C.green]]} />
				<At x={960} y={720}><Bar label="BEFORE" v={800 * eout(P(t, K.h_taker - 0.3, K.h_taker + 0.5))} max={10000} col={C.red} text="$800" w={1100} /></At>
				<At x={960} y={830}><Bar label="AFTER" v={10000 * eout(P(t, K.h_times - 0.3, K.h_times + 0.8))} max={10000 * 1.15} col={C.green} text="UP TO $10,000" w={1100} /></At>
				<At x={960} y={960} s={pop(t, K.h_viral - 0.4)}><Pill text="STILL CHEAPER THAN ONE VIRAL VIDEO" bg={C.yellow} size={40} /></At>
			</Win>
			{/* 9 Who first */}
			<Win a={ch[8]} b={ch[9]}>
				<At x={520} y={430} s={pop(t, K.i_contract - 0.4)} rot={-2}><Doc w={720} head="CONTRACT OF CARRIAGE" lines={['Rule: denied boarding priority', 'If not enough volunteers…']} stamp="NOT RANDOM" k={P(t, K.i_random, K.i_random + 0.3)} col={C.red} /></At>
				<At x={1400} y={170} s={pop(t, K.i_last - 0.6)}><Txt text="MOST LIKELY TO BE BUMPED" col={C.red} size={40} /></At>
				<Rows t={t} x={1400} y={270} w={760} size={38} gap={100} numbered items={[['CHECKED IN LAST', K.i_last, C.red], ['LOWEST FARE', K.i_low, C.red], ['NO SEAT ASSIGNMENT', K.i_noseat, C.red], ['NO LOYALTY STATUS', K.i_status, C.red]]} />
				<At x={1400} y={740} s={pop(t, K.i_families - 0.4)}><Row text="USUALLY PROTECTED: FAMILIES WITH KIDS, PASSENGERS WITH DISABILITIES" on={1} col={C.green} w={760} size={30} /></At>
				<At x={520} y={880} s={pop(t, K.i_cheaper - 0.4)}><Pill text="CHEAPER + LATER = YOUR NAME" bg={C.yellow} size={42} /></At>
			</Win>
			{/* 10 Law */}
			<Win a={ch[9]} b={ch[10]}>
				<At x={960} y={160} s={pop(t, K.j_law - 0.4)}><Badge text="U.S. LAW · BUMPED AGAINST YOUR WILL" col={C.cyan} size={48} /></At>
				<Rows t={t} x={700} y={330} w={1100} size={40} gap={130} items={[['ARRIVE < 1 HOUR LATE → $0', K.j_nothing, C.mute], ['1–2 HOURS LATE → 200% OF FARE · UP TO $1,075', K.j_1075 - 1.4, C.yellow], ['2+ HOURS LATE → 400% OF FARE · UP TO $2,150', K.j_2150 - 1.4, C.green]]} />
				<At x={1600} y={350} s={pop(t, K.j_money - 0.4)}><Ticket w={460} title="A COUPON?" big="NO" col={C.red} cross={P(t, K.j_money, K.j_money + 0.4)} /></At>
				<At x={1600} y={600} s={pop(t, K.j_check - 0.6) * (1 + 0.05 * Math.sin(P(t, K.j_check - 0.2, K.j_check + 0.4) * Math.PI))}><Ticket w={460} title="CASH OR CHECK" big="$2,150" col={C.green} glow={P(t, K.j_check - 0.3, K.j_check + 0.2)} /></At>
				<At x={960} y={860} s={pop(t, K.j_never - 0.3)}><Pill text="MOST PEOPLE NEVER ASK" bg={C.yellow} size={50} /></At>
			</Win>
			{/* 11 World */}
			<Win a={ch[10]} b={ch[11]}>
				<At x={960} y={160} s={pop(t, K.k_rules - 0.4)}><Title text="DIFFERENT COUNTRIES, DIFFERENT RULES" col={C.white} size={58} /></At>
				<At x={400} y={540} s={pop(t, K.k_eu - 0.4)}><Panel title="EUROPEAN UNION" sub="by distance" col={C.cyan} lines={[['≤1,500 km', '€250', K.k_250], ['1,500–3,500 km', '€400', K.k_400], ['long-haul', '€600', K.k_600]]} t={t} /></At>
				<At x={960} y={540} s={pop(t, K.k_canada - 0.4)}><Panel title="CANADA" sub="by arrival delay" col={C.red} lines={[['< 6 hours', 'C$900', K.k_900], ['6–9 hours', 'C$1,800', K.k_2400 - 0.6], ['9+ hours', 'C$2,400', K.k_2400]]} t={t} /></At>
				<At x={1520} y={540} s={pop(t, K.k_russia - 0.4)}><Panel title="RUSSIA" sub="status" col={C.yellow} lines={[['today', 'NOT ALLOWED', K.k_russia + 0.3], ['2026', 'PROPOSAL', K.k_ministry]]} t={t} /></At>
			</Win>
			{/* 12 Rarer */}
			<Win a={ch[11]} b={ch[12]}>
				<At x={960} y={170} s={pop(t, K.l_twist - 0.4)}><Badge text="OVERBOOKING: EVERYWHERE · FORCED BUMPS: RARE" col={C.green} size={44} /></At>
				<At x={960} y={360}><Bar label="1972" v={83 * eout(P(t, K.l_83 - 0.4, K.l_83 + 0.6))} max={95} col={C.red} text="~83,000 bumped" w={1050} /></At>
				<At x={960} y={480}><Bar label="TODAY" v={4 * eout(P(t, K.l_ratio - 0.6, K.l_ratio + 0.4))} max={95} col={C.green} text="2–3 per 100,000 passengers" w={1050} /></At>
				<At x={600} y={680} s={pop(t, K.l_zero - 0.6)}><Card2 big="0" small="Delta involuntary bumps, 2025" col={C.green} /></At>
				<At x={1320} y={680} s={pop(t, K.l_frontier - 0.4)}><Card2 big="2.5 / 10,000" small="Frontier, highest rate, 2025" col={C.red} /></At>
				<At x={600} y={890} s={pop(t, K.l_smarter - 0.4)}><Pill text="SMARTER FORECASTS" bg={C.cyan} size={40} /></At>
				<At x={1320} y={890} s={pop(t, K.l_keeps - 0.6)}><Pill text="NO-SHOW? AIRLINE KEEPS THE FARE" bg={C.yellow} size={40} /></At>
			</Win>
			{/* 13 Make it pay */}
			<Win a={ch[12]} b={ch[13]}>
				<At x={500} y={170} s={pop(t, K.m_adv - 0.2)}><Title text="CAN'T AFFORD TO BE BUMPED?" col={C.red} size={46} /></At>
				<Rows t={t} x={500} y={280} w={760} size={36} gap={96} items={[['CHECK IN AS EARLY AS POSSIBLE', K.m_early, C.cyan], ['PICK YOUR SEAT IN ADVANCE', K.m_seat, C.cyan], ['JOIN THE LOYALTY PROGRAM', K.m_loyal, C.cyan]]} />
				<At x={1420} y={170} s={pop(t, K.m_flex - 0.4)}><Title text="FLEXIBLE? MAKE IT PAY" col={C.green} size={46} /></At>
				<Rows t={t} x={1420} y={280} w={760} size={36} gap={96} items={[['BE FIRST AT THE DESK', K.m_desk, C.green], ["DON'T TAKE THE FIRST OFFER", K.m_first, C.green], ['CONFIRMED SEAT, NOT STANDBY', K.m_confirmed, C.green], ['MEALS + HOTEL IF OVERNIGHT', K.m_hotel, C.green], ['CHECK VOUCHER EXPIRY & RULES', K.m_expires, C.green]]} />
				<At x={500} y={720} s={pop(t, K.m_check - 1.6)}><Ticket w={760} title="FORCED OFF?" big="THE CHECK IS YOURS" col={C.yellow} bigSize={58} glow={P(t, K.m_check - 0.3, K.m_check + 0.2)} /></At>
			</Win>
			{/* 14 Ending */}
			<Win a={ch[13]} b={ch[14]} last>
				<At x={960} y={220} s={pop(t, K.n_bet - 0.4)} o={cta}><Title text="A MACHINE PLACED A BET" col={C.white} size={70} /></At>
				<At x={960} y={330} s={pop(t, K.n_lost - 0.3)} o={cta}><Title text="TODAY IT LOST" col={C.red} size={80} glow={C.red} /></At>
				<At x={900} y={600} s={pop(t, K.n_two - 0.8)} rot={-4} o={cta}><Pass w={700} seat="14C" route="JFK → LAX" name="SMITH / JOHN" label="SEAT" /></At>
				<At x={1020} y={700} s={pop(t, K.n_two - 0.2)} rot={3} o={cta}><Pass w={700} seat="14C" route="JFK → LAX" name="YOU" label="SEAT" col={C.yellow} stamp="× 2" stampK={P(t, K.n_two + 0.2, K.n_two + 0.5)} stampX="55%" stampY="20%" /></At>
				<At x={960} y={940} s={pop(t, K.n_paid - 0.4)} o={cta}><Pill text="WHO KEEPS IT — AND WHO GETS PAID?" bg={C.yellow} size={44} /></At>
			</Win>
			<At x={1440} y={56} o={P(t, 1.5, 2.2) * cta}><div style={{transform: 'scale(0.85)'}}><BoardRow cols={[['FLIGHT', 'WD189'], ['SEATS', '180'], ['SOLD', '189']]} status={STATUS[ci] ?? ''} statusCol={SCOL[ci] ?? C.white} o={1} flip={P(t, ch[ci] + 0.1, ch[ci] + 0.9)} /></div></At>
			{data.segs.filter((s: any) => !s.cta).map((s: any, i: number) => <PartTitle key={i} n={i + 1} title={s.title} at={i === 0 ? 0.6 : ch[i] + 0.3} />)}
			<CTA K={K} S={L} cx={960} cy={-760} />
			{Array.from({length: loops}).map((_, i) => (
				<Sequence key={'m' + i} from={Math.round(i * (MUSIC - 4) * FPS)} durationInFrames={Math.round(MUSIC * FPS)} layout="none">
					<Audio src={staticFile('music.mp3')} volume={(f) => 0.11 * Math.min(1, f / (4 * FPS)) * Math.min(1, (MUSIC * FPS - f) / (4 * FPS)) * clamp((dur * FPS - (f + i * (MUSIC - 4) * FPS)) / 90)} />
				</Sequence>
			))}
			<Sequence from={15} layout="none"><Audio src={staticFile('long/voice.mp3')} volume={1.1} /></Sequence>
			{sfx('jet.mp3', K.b_air - 1.0, 0.28, 'jet')}
			{sfx('crowd.mp3', K.f_heard - 0.3, 0.2, 'crowd')}
			{sfx('chime.mp3', K.f_oversold - 0.8, 0.32, 'chime')}
			{sfx('register.mp3', K.h_10k + 0.4, 0.32, 'reg')}
		</AbsoluteFill>
	);
};
const Card2: React.FC<{big: string; small: string; col: string}> = ({big, small, col}) => (
	<div style={{width: 640, padding: '18px 28px', borderRadius: 24, background: 'rgba(8,14,26,.92)', border: `4px solid ${col}`, boxShadow: `0 0 26px ${col}55`, boxSizing: 'border-box', textAlign: 'center'}}>
		<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 76, color: col, lineHeight: 1.05}}>{big}</div>
		<div style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 30, color: C.white}}>{small}</div>
	</div>
);
const Panel: React.FC<{title: string; sub: string; col: string; lines: [string, string, number][]; t: number}> = ({title, sub, col, lines, t}) => (
	<div style={{width: 500, padding: 30, borderRadius: 28, background: 'rgba(8,14,26,.92)', border: `4px solid ${col}`, boxShadow: `0 0 30px ${col}44`, boxSizing: 'border-box'}}>
		<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 44, color: col, textAlign: 'center'}}>{title}</div>
		<div style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 26, color: C.mute, textAlign: 'center', marginBottom: 20}}>{sub}</div>
		{lines.map(([a, b, k], i) => {const on = P(t, k - 0.3, k + 0.1); return (
			<div key={i} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 6px', borderTop: '2px solid #23304a', opacity: 0.3 + 0.7 * on}}>
				<div style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 30, color: C.white}}>{a}</div>
				<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 42, color: on > 0.5 ? col : C.mute}}>{b}</div>
			</div>
		);})}
	</div>
);
