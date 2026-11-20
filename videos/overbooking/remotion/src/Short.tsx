import React from 'react';
import {AbsoluteFill, Img, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Audio} from '@remotion/media';
import {loadFont} from '@remotion/fonts';
import {BoardRow, Doc, Flap, Forecast, Pass, Person, Phone, RunwayBg, SeatMap, Ticket} from './Comps';
import {CTA} from './CTA';
import {Captions} from './Captions';
import {STR} from './strings';
import {At, Badge, C, DISPLAY, FPS, P, Pill, Title, Txt, clamp, eout, pop} from './ui';

for (const [f, w] of [['InterDisplay-Black.otf', '900'], ['InterDisplay-ExtraBold.otf', '800']]) loadFont({family: 'Inter Display', url: staticFile('fonts/' + f), weight: w});
for (const [f, w] of [['Inter-Bold.otf', '700'], ['Inter-ExtraBold.otf', '800']]) loadFont({family: 'Inter', url: staticFile('fonts/' + f), weight: w});

export const chapters = (data: any, n = 8) => {const ch = [0]; for (let s = 2; s <= n; s++) ch.push(data.segs.find((x: any) => x.s === s).t0 - 0.35); ch.push(data.dur); return ch;};
const Brand: React.FC<{S: any}> = ({S}) => (
	<div style={{position: 'absolute', left: 44, top: 52, display: 'flex', alignItems: 'center', gap: 16}}>
		<Img src={staticFile(S.logo)} style={{width: 72, height: 72, borderRadius: 36, border: `3px solid ${C.yellow}cc`, boxShadow: `0 0 18px ${C.yellow}66`}} />
		<div style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 32, color: 'rgba(244,247,255,.92)', textShadow: '0 2px 10px rgba(0,0,0,.6)'}}>{S.handle}</div>
	</div>
);
// signature transition: departure-board "flip" — the scene folds in on X axis
export const Win: React.FC<{a: number; b: number; children: React.ReactNode; last?: boolean}> = ({a, b, children, last}) => {
	const t = useCurrentFrame() / FPS;
	if (t < a - 0.2 || t > b + 0.2) return null;
	const i = eout(P(t, a - 0.12, a + 0.25)), o = last ? 1 : 1 - P(t, b - 0.12, b + 0.08);
	return <AbsoluteFill style={{opacity: Math.min(i, o) > 0 ? Math.min(1, i * 1.5) * o : 0, transform: `perspective(1600px) rotateX(${(1 - i) * -70}deg)`, transformOrigin: '50% 0%'}}>{children}</AbsoluteFill>;
};
export const sfx = (src: string, at: number, vol: number, key: string) => <Sequence key={key} from={Math.max(0, Math.round(at * FPS))} layout="none"><Audio src={staticFile('sfx/' + src)} volume={vol} /></Sequence>;
const money = (v: number, lang: string) => '$' + (lang === 'ru' ? Math.round(v).toLocaleString('ru-RU').replace(/ /g, ' ') : Math.round(v).toLocaleString('en-US'));

export const Seat: React.FC<{size: number; burn: number}> = ({size, burn}) => (
	<svg width={size} height={size * 1.1} viewBox="0 0 100 110" style={{filter: `drop-shadow(0 0 ${40 * burn}px #ff6a1e)`}}>
		<rect x="18" y="4" width="64" height="66" rx="16" fill={burn > 0.5 ? '#4a4f5c' : C.cyan} opacity={1 - 0.6 * clamp((burn - 0.5) * 2)} />
		<rect x="10" y="64" width="80" height="26" rx="10" fill={burn > 0.5 ? '#3a3f4c' : '#2fb8e0'} opacity={1 - 0.6 * clamp((burn - 0.5) * 2)} />
		<rect x="4" y="44" width="12" height="44" rx="6" fill="#26324a" /><rect x="84" y="44" width="12" height="44" rx="6" fill="#26324a" />
		<rect x="40" y="90" width="20" height="18" fill="#26324a" />
	</svg>
);
export const Plane: React.FC<{size: number}> = ({size}) => (
	<svg width={size} height={size} viewBox="0 0 24 24"><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" fill="#e9eef7" /></svg>
);

export const OverShort: React.FC<{lang: 'ru' | 'en'; data: any}> = ({lang, data}) => {
	const S = STR[lang], K = data.k, ch = chapters(data), dur = data.dur, ru = lang === 'ru';
	const t = useCurrentFrame() / FPS;
	const cta = K.cta !== undefined ? 1 - P(t, K.cta - 0.4, K.cta) : 1;
	const ci = ch.findIndex((c, i) => t >= c && t < ch[i + 1]);
	const flip = P(t, ch[Math.max(0, ci)] + 0.1, ch[Math.max(0, ci)] + 0.9);
	const statusCol = [C.red, C.red, C.mute, C.cyan, C.yellow, C.red, C.green, ru ? C.yellow : C.green][Math.max(0, ci)] ?? C.white;
	const bid = t < K.b400 - 0.2 ? 200 : t < K.b800 - 0.2 ? 400 : 800;
	const bidFlip = t < K.b400 - 0.2 ? P(t, K.b200 - 0.3, K.b200 + 0.4) : t < K.b800 - 0.2 ? P(t, K.b400 - 0.2, K.b400 + 0.4) : P(t, K.b800 - 0.2, K.b800 + 0.4);
	const k10 = 10000 * eout(P(t, K.k10 - 0.6, K.k10 + 0.5));
	return (
		<AbsoluteFill>
			<RunwayBg />
			<AbsoluteFill>
				{/* 1 hook: 180 seats, 189 tickets */}
				<Win a={0} b={ch[1]}>
					<At x={540} y={250} s={pop(t, 0.05, 0.35)}><div style={{display: 'flex', alignItems: 'center', gap: 26}}><Flap text="180" size={110} col={C.cyan} flip={P(t, 0.1, 0.9)} /><Title text={S.seats} col={C.white} size={80} /></div></At>
					<At x={540} y={400} s={pop(t, K.tickets - 0.35, 0.35)}><div style={{display: 'flex', alignItems: 'center', gap: 26}}><Flap text="189" size={110} col={C.red} flip={P(t, K.tickets - 0.3, K.tickets + 0.5)} /><Title text={S.tickets} col={C.white} size={80} /></div></At>
					<At x={420} y={1010} s={0.68}><SeatMap fill={eout(P(t, 0.3, K.tickets))} /></At>
					{Array.from({length: 9}).map((_, i) => <At key={i} x={800 + (i % 3) * 80} y={760 + Math.floor(i / 3) * 150} s={pop(t, K.tickets + 0.1 + i * 0.07, 0.35)}><Person size={56} col={C.red} /></At>)}
					<At x={880} y={1250} s={pop(t, K.tickets + 0.8)}><Txt text="+9" col={C.red} size={64} /></At>
					<At x={540} y={1000} s={t < K.noerror - 0.25 ? 0 : 2 - eout(P(t, K.noerror - 0.25, K.noerror + 0.05))} rot={-8}><div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: ru ? 104 : 92, color: C.yellow, border: `9px solid ${C.yellow}`, borderRadius: 24, padding: '4px 34px', background: 'rgba(5,8,15,.88)', boxShadow: `0 0 40px ${C.yellow}88`}}>{S.noerror}</div></At>
				</Win>
				{/* 2 overbooking */}
				<Win a={ch[1]} b={ch[2]}>
					<At x={540} y={260} s={pop(t, K.overbook - 0.35)}><Badge text={S.over} col={C.yellow} size={ru ? 84 : 80} /></At>
					<At x={540} y={385} s={pop(t, K.everyday - 0.3)}><Pill text={S.everyday} bg={C.cyan} size={40} /></At>
					<At x={520} y={680} s={pop(t, ch[1] + 0.15)} rot={-4}><Pass w={760} seat="14C" route={S.route} name={S.pax1} label={S.seatL} /></At>
					<At x={560} y={800} s={pop(t, K.overbook + 0.2)} rot={3}><Pass w={760} seat="14C" route={S.route} name={S.pax2} label={S.seatL} col={C.yellow} /></At>
					<At x={540} y={1110} s={pop(t, K.why - 0.5)}><div style={{whiteSpace: 'pre-line'}}><Title text={S.whyQ} col={C.white} size={ru ? 62 : 66} /></div></At>
					<At x={540} y={1330} s={pop(t, K.you - 0.3)}><Pill text={S.tease} bg={C.red} fg="#fff" size={ru ? 40 : 38} /></At>
				</Win>
				{/* 3 no-shows */}
				<Win a={ch[2]} b={ch[3]}>
					<At x={540} y={250} s={pop(t, K.noshow - 0.4)}><Title text={S.noshow} col={C.white} size={ru ? 70 : 64} /></At>
					<At x={330} y={940} s={0.6}><SeatMap fill={1} noshow={P(t, K.noshow - 0.2, K.pct)} /></At>
					{S.reasons.map((r: string, i: number) => <At key={i} x={800} y={560 + i * 140} s={pop(t, K.late - 0.3 + i * 0.45)}><Pill text={r} bg={[C.yellow, C.red, C.mute][i]} fg={i === 1 ? '#fff' : C.ink} size={ru ? 40 : 36} /></At>)}
					<At x={800} y={1080} s={pop(t, K.pct - 0.4, 0.4)}><Title text={S.pct} col={C.yellow} size={150} glow={C.yellow} /></At>
					<At x={800} y={1180} s={pop(t, K.pct - 0.2)}><Txt text={S.pctSub} col={C.white} size={44} /></At>
				</Win>
				{/* 4 empty seat burns + forecast */}
				<Win a={ch[3]} b={ch[4]}>
					<At x={540} y={250} s={pop(t, K.empty - 0.4)}><Title text={S.empty} col={C.white} size={84} /></At>
					<At x={540} y={350} s={pop(t, K.burned - 0.4)}><Title text={S.burned} col={C.red} size={ru ? 60 : 56} glow={C.red} /></At>
					<At x={540} y={640} s={pop(t, ch[3] + 0.2) * (1 - 0.45 * eout(P(t, K.computer - 0.5, K.computer)))} >
						<div style={{position: 'relative'}}>
							<Seat size={260} burn={P(t, K.burned - 0.6, K.burned + 1.2)} />
							{Array.from({length: 6}).map((_, i) => {const k = P(t, K.burned - 0.4 + i * 0.15, K.burned + 1.4 + i * 0.15); return k > 0 && k < 1 ? <div key={i} style={{position: 'absolute', left: 60 + (i * 37) % 150, top: 120 - 320 * k, fontFamily: DISPLAY, fontWeight: 900, fontSize: 56, color: k > 0.4 ? '#6a7184' : C.green, opacity: 1 - k}}>$</div> : null;})}
						</div>
					</At>
					{(() => {const k = P(t, K.burned + 0.2, K.burned + 2.4); return k > 0 && k < 1 ? <At x={-80 + 1300 * eout(k)} y={820 - 520 * k} rot={50}><Plane size={160} /></At> : null;})()}
					<At x={540} y={1150} s={pop(t, K.computer - 0.4)}><Forecast w={880} labels={S.fc} v={P(t, K.computer, K.season + 0.5)} result={S.fcRes} /></At>
				</Win>
				{/* 5 auction */}
				<Win a={ch[4]} b={ch[5]}>
					<At x={540} y={250} s={pop(t, K.catch - 0.3)}><Title text={S.catch} col={C.white} size={ru ? 62 : 52} /></At>
					{Array.from({length: 12}).map((_, i) => <At key={i} x={150 + (i % 6) * 156} y={420 + Math.floor(i / 6) * 120} s={pop(t, K.all - 0.3 + i * 0.04, 0.3)}><Person size={56} col={i < 9 ? C.cyan : C.red} /></At>)}
					<At x={540} y={700} s={pop(t, K.auction - 0.4)}><Badge text={S.auction} col={C.yellow} size={ru ? 62 : 60} /></At>
					<At x={540} y={940} s={pop(t, K.b200 - 0.4, 0.35)}><Flap text={'$' + bid} size={170} col={C.green} flip={bidFlip} /></At>
					<At x={540} y={1140} s={pop(t, K.auction + 0.4)}><Txt text={S.who} col={C.white} size={48} /></At>
					<At x={540} y={1300} s={pop(t, K.auction + 0.9)}><Pill text={S.voucher} bg={C.yellow} size={44} /></At>
				</Win>
				{/* 6 United 2017 */}
				<Win a={ch[5]} b={ch[6]}>
					<At x={540} y={250} s={pop(t, K.united - 0.4)}><Badge text={S.y2017} col={C.red} size={ru ? 58 : 60} /></At>
					<At x={540} y={800} s={pop(t, ch[5] + 0.2)}><Phone w={620} t={t} empty={P(t, K.dragged - 0.2, K.dragged + 0.5)} top={S.phoneTop} bottom={t > K.united + 0.8 ? S.nobody : ''} /></At>
					<At x={540} y={1300} s={pop(t, K.dragged - 0.3)}><Pill text={S.dragged} bg={C.red} fg="#fff" size={ru ? 42 : 44} /></At>
					<At x={540} y={1400} s={pop(t, K.dao - 0.3)}><Txt text={S.who2} col={C.mute} size={36} /></At>
				</Win>
				{/* 7 payouts */}
				<Win a={ch[6]} b={ch[7]}>
					<At x={540} y={260} s={pop(t, K.k10 - 1.2)}><Txt text={S.after} col={C.white} size={ru ? 44 : 42} /></At>
					<At x={540} y={420} s={pop(t, K.k10 - 0.8, 0.35)}><Title text={money(k10, lang)} col={C.green} size={170} glow={C.green} /></At>
					<At x={540} y={820} s={pop(t, K.law - 0.4)}><Doc w={900} head={S.lawHead} lines={S.lawLines} stamp={S.lawStamp} k={P(t, K.k2150 - 0.1, K.k2150 + 0.3)} col={C.green} /></At>
				</Win>
				{/* 8 twist */}
				<Win a={ch[7]} b={ch[8]} last>
					{ru ? (
						<>
							<At x={540} y={250} s={pop(t, K.russia - 0.4)} o={cta}><Badge text={S.ru1} col={C.yellow} size={70} /></At>
							<At x={540} y={380} s={pop(t, K.banned - 0.4)} o={cta}><Pill text={S.ru2} bg={C.green} size={42} /></At>
							<At x={540} y={700} s={pop(t, K.mintrans - 0.4)} o={cta * (1 - 0.35 * P(t, K.twice - 1.2, K.twice - 0.6))}><Doc w={840} head={S.billHead} lines={S.billLines} stamp={S.billStamp} k={P(t, K.mintrans + 1.0, K.mintrans + 1.4)} col={C.red} /></At>
							<At x={520} y={1080} s={pop(t, K.twice - 1.1)} rot={-4} o={cta}><Pass w={700} seat="14C" route={S.route} name={S.pax1} label={S.seatL} /></At>
							<At x={560} y={1200} s={pop(t, K.twice - 0.4)} rot={3} o={cta}><Pass w={700} seat="14C" route={S.route} name="ТЫ" label={S.seatL} col={C.yellow} stamp="× 2" stampK={P(t, K.twice, K.twice + 0.3)} stampX="55%" stampY="20%" /></At>
						</>
					) : (
						<>
							<At x={540} y={250} s={pop(t, K.secret - 0.5)} o={cta}><Badge text={S.secret} col={C.yellow} size={58} /></At>
							<At x={540} y={540} s={pop(t, K.cash - 0.4)} o={cta}><Ticket w={860} title={S.vTitle} big={S.vBig} col={C.red} cross={P(t, K.check - 1.6, K.check - 1.1)} /></At>
							<At x={540} y={860} s={pop(t, K.check - 1.0) * (1 + 0.06 * Math.sin(P(t, K.check - 0.2, K.check + 0.3) * Math.PI))} o={cta}><Ticket w={900} title={S.cTitle} big={S.cBig} col={C.green} glow={P(t, K.check - 0.3, K.check + 0.2)} /></At>
							<At x={540} y={1200} s={pop(t, K.most - 0.3)} o={cta}><Pill text={S.most} bg={C.yellow} size={46} /></At>
						</>
					)}
				</Win>
			</AbsoluteFill>
			<At x={540} y={1490} o={P(t, ch[1] - 0.2, ch[1] + 0.2) * cta}><BoardRow cols={[[S.bk[0], 'WD189'], [S.bk[1], '180'], [S.bk[2], '189']]} status={S.status[Math.max(0, ci)] ?? ''} statusCol={statusCol} o={1} flip={flip} /></At>
			<Brand S={S} />
			<CTA K={K} S={S} />
			<Captions captions={data.captions} />
			<Audio src={staticFile('music.mp3')} volume={(f) => 0.14 * Math.min(1, f / 20) * Math.min(1, (dur * FPS - f) / 75)} />
			<Sequence from={15} layout="none"><Audio src={staticFile(`${lang}/voice.mp3`)} volume={1.1} /></Sequence>
			{sfx('jet.mp3', K.burned + 0.1, 0.3, 'jet')}
			{sfx('crowd.mp3', K.all - 0.3, 0.22, 'crowd')}
			{sfx('chime.mp3', K.auction - 0.5, 0.35, 'chime')}
			{sfx('register.mp3', K.k10 + 0.4, 0.35, 'reg')}
		</AbsoluteFill>
	);
};
