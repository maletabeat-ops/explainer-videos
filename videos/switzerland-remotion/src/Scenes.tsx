import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {At, Badge, BODY, C, Card, DISPLAY, FPS, P, Person, Pill, SwissCross, Title, eio, eout, pop} from './ui';

const useT = (t0: number) => t0 + useCurrentFrame() / FPS;

export const Domino: React.FC<{t0: number; K: any; S: any}> = ({t0, K, S}) => {
	const t = useT(t0);
	const rows = [[K.pay, C.gold], [K.waiter, C.teal], [K.cashier, C.sky], [K.driver, C.violet]] as const;
	return (
		<AbsoluteFill>
			<At x={540} y={260} s={pop(t, K.pay - 0.5)}><Badge text={S.payLabel + ' ↑'} col={C.gold} size={64} /></At>
			{rows.map(([kt, col], i) => {
				const y = 480 + i * 210;
				const s = pop(t, (i ? kt : t0 + 0.2) - 0.3);
				const w = eout(P(t, kt - 0.2, kt + 0.7));
				const push = i > 0 ? Math.sin(P(t, kt - 0.2, kt + 0.2) * Math.PI) * 20 : 0;
				return (
					<At key={i} x={540 + push} y={y} s={s}>
						<div style={{width: 900, display: 'flex', alignItems: 'center', gap: 26}}>
							<div style={{width: 120, height: 120, borderRadius: 60, background: `${col}22`, border: `4px solid ${col}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Person col={col} size={70} /></div>
							<div style={{flex: 1}}>
								<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 40, color: C.cream, marginBottom: 12}}>{S.jobs[i]}</div>
								<div style={{height: 34, borderRadius: 17, background: 'rgba(255,255,255,.08)', overflow: 'hidden'}}>
									<div style={{height: '100%', width: `${(i ? 30 + 55 * w : 92 * w)}%`, background: `linear-gradient(90deg, ${col}88, ${col})`, borderRadius: 17, boxShadow: `0 0 20px ${col}`}} />
								</div>
							</div>
						</div>
					</At>
				);
			})}
			<At x={540} y={1360} s={pop(t, K.leave - 0.4)} rot={-3}><Pill text={S.leave + ' →'} bg={C.red} size={46} fg="#fff" /></At>
		</AbsoluteFill>
	);
};

export const Apprentice: React.FC<{t0: number; K: any; S: any}> = ({t0, K, S}) => {
	const t = useT(t0);
	const k = P(t, K.twothirds - 0.2, K.twothirds + 0.8);
	return (
		<AbsoluteFill>
			<At x={540} y={250} s={pop(t, K.s2 - 0.5)}><Badge text={S.secret(2)} col={C.gold} size={66} /></At>
			<At x={540} y={355} s={pop(t, K.s2 + 0.2)}><Pill text={S.s2} bg={C.cream} size={36} /></At>
			{Array.from({length: 9}).map((_, i) => {
				const appr = i % 3 !== 2;
				const col = k > (i / 9) * 0.8 ? (appr ? C.teal : C.violet) : '#5a6290';
				const x = 290 + (i % 3) * 250, y = 560 + Math.floor(i / 3) * 210;
				return <At key={i} x={x} y={y} s={pop(t, t0 + 0.15 + i * 0.06)}><Person col={col} size={110} hat={appr && k > (i / 9) * 0.8} /></At>;
			})}
			<At x={540} y={1210} s={pop(t, K.twothirds)}>
				<div style={{display: 'flex', gap: 24, alignItems: 'center'}}>
					<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 110, color: C.teal, textShadow: `0 0 30px ${C.teal}`}}>⅔</div>
					<Pill text={S.appr} bg={C.teal} size={40} />
					<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 60, color: C.violet}}>⅓</div>
					<Pill text={S.uni} bg={C.violet} size={30} />
				</div>
			</At>
			<At x={540} y={1380} s={pop(t, K.job - 0.4)}>
				<Card w={820} col={C.gold} pad={24}>
					<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 34, color: C.gold, textAlign: 'center', marginBottom: 14}}>{S.job}</div>
					<div style={{display: 'flex', height: 54, borderRadius: 14, overflow: 'hidden', fontFamily: DISPLAY, fontWeight: 900, fontSize: 28}}>
						<div style={{flex: 3 * eout(P(t, K.job, K.job + 0.8)) + 0.01, background: C.teal, color: C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{S.work}</div>
						<div style={{flex: 1.4, background: C.violet, color: C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{S.school}</div>
					</div>
				</Card>
			</At>
		</AbsoluteFill>
	);
};

export const Stability: React.FC<{t0: number; K: any; S: any}> = ({t0, K, S}) => {
	const t = useT(t0);
	const rot = t * 90;
	const coin = pop(t, K.franc - 0.5);
	const layers = Array.from({length: 14});
	return (
		<AbsoluteFill>
			<At x={540} y={250} s={pop(t, K.s3 - 0.5)}><Badge text={S.secret(3)} col={C.gold} size={66} /></At>
			<At x={540} y={355} s={pop(t, K.s3 + 0.2)}><Pill text={S.s3} bg={C.cream} size={36} /></At>
			<At x={540} y={700} s={coin}>
				<div style={{width: 380, height: 380, perspective: 1200}}>
					<div style={{width: 380, height: 380, position: 'relative', transformStyle: 'preserve-3d', transform: `rotateY(${rot}deg) rotateX(12deg)`}}>
						{layers.map((_, i) => (
							<div key={i} style={{position: 'absolute', inset: 0, borderRadius: '50%', background: i === 0 || i === layers.length - 1 ? `radial-gradient(circle at 35% 30%, #fff3c4, ${C.gold} 45%, #b8860b)` : '#a8790d', transform: `translateZ(${(i - layers.length / 2) * 2.4}px)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: i === layers.length - 1 ? `0 0 60px ${C.gold}88` : undefined}}>
								{i === layers.length - 1 || i === 0 ? <div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 120, color: '#7a5200', transform: i === 0 ? 'scaleX(-1)' : undefined}}>CHF</div> : null}
							</div>
						))}
					</div>
				</div>
			</At>
			<At x={540} y={960} s={pop(t, K.franc)}><Pill text={S.franc} bg={C.gold} size={40} /></At>
			<At x={290} y={1130} s={pop(t, K.neutral - 0.3)}>
				<div style={{display: 'flex', alignItems: 'center', gap: 18}}><SwissCross size={84} /><Pill text={S.neutral} bg={C.cream} size={32} /></div>
			</At>
			<At x={790} y={1130} s={pop(t, K.zug - 0.3)}><Pill text={S.zug} bg={C.teal} size={32} /></At>
			<At x={540} y={1340} s={pop(t, K.hq - 0.5)}>
				<div style={{display: 'flex', alignItems: 'flex-end', gap: 14}}>
					{[150, 210, 120, 180].map((h, i) => {
						const k = eout(P(t, K.hq - 0.3 + i * 0.12, K.hq + 0.4 + i * 0.12));
						return <div key={i} style={{width: 70, height: h * k, background: `linear-gradient(${C.sky}, #2b3a7a)`, borderRadius: 8, boxShadow: `0 0 18px ${C.sky}66`, backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,230,160,.8) 0 6px, transparent 6px 16px)'}} />;
					})}
					<div style={{marginLeft: 20}}><Pill text={S.hq} bg={C.sky} size={30} /></div>
				</div>
			</At>
		</AbsoluteFill>
	);
};

export const Costs: React.FC<{t0: number; K: any; S: any}> = ({t0, K, S}) => {
	const t = useT(t0);
	const ki = eio(P(t, K.ins, K.ins + 0.9)), kr = eio(P(t, K.rent, K.rent + 0.9));
	const total = 7024, ins = 465, rent = 2900;
	const left = Math.round(total - ins * ki - rent * kr);
	const W = 880;
	const row = (label: string, val: string, col: string, s: number) => (
		<div style={{display: 'flex', justifyContent: 'space-between', fontFamily: BODY, fontWeight: 800, fontSize: 38, color: col, opacity: Math.min(1, s), transform: `translateX(${(1 - Math.min(1, s)) * 60}px)`}}><span>{label}</span><span>{val}</span></div>
	);
	return (
		<AbsoluteFill>
			<At x={540} y={260} s={pop(t, K.cost - 0.5)}><Badge text={S.costTitle} col={C.red} size={56} /></At>
			<At x={540} y={720} s={pop(t, t0 + 0.2)}>
				<Card w={W} col={C.cream}>
					{row(S.gross, `${S.num(total)} CHF`, C.cream, 1)}
					<div style={{height: 64, borderRadius: 18, overflow: 'hidden', display: 'flex', margin: '22px 0 26px', background: 'rgba(255,255,255,.06)'}}>
						<div style={{flex: total - ins * ki - rent * kr, background: `linear-gradient(90deg, ${C.green}, ${C.teal})`}} />
						<div style={{flex: rent * kr, background: C.pink}} />
						<div style={{flex: ins * ki, background: C.gold}} />
					</div>
					<div style={{display: 'flex', flexDirection: 'column', gap: 14}}>
						{row('− ' + S.ins, `${S.num(ins)} CHF`, C.gold, P(t, K.ins - 0.2, K.ins + 0.3))}
						{row('− ' + S.rent, `≈ ${S.num(rent)} CHF`, C.pink, P(t, K.rent - 0.2, K.rent + 0.3))}
					</div>
				</Card>
			</At>
			<At x={540} y={1150} s={pop(t, K.rent + 0.8)}>
				<div style={{textAlign: 'center'}}>
					<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 44, color: C.mute}}>{S.left}</div>
					<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 130, color: C.teal, textShadow: `0 0 30px ${C.teal}`}}>≈ {S.num(left)}</div>
					<div style={{fontFamily: BODY, fontWeight: 700, fontSize: 32, color: C.cream}}>{S.leftNote}</div>
				</div>
			</At>
		</AbsoluteFill>
	);
};

export const Chain: React.FC<{t0: number; K: any; S: any}> = ({t0, K, S}) => {
	const t = useT(t0);
	const ks = [K.goods, K.prod, K.wages, K.prices], cols = [C.gold, C.teal, C.green, C.red];
	const pts = [[540, 500], [800, 820], [540, 1140], [280, 820]];
	return (
		<AbsoluteFill>
			<At x={540} y={260} s={pop(t, K.chain - 0.5)}><Badge text={S.chainTitle} col={C.violet} size={64} /></At>
			<svg width={1080} height={1920} style={{position: 'absolute'}}>
				{pts.map((p, i) => {
					const q = pts[(i + 1) % 4];
					const k = eout(P(t, ks[(i + 1) % 4] - 0.4, ks[(i + 1) % 4] + 0.2)) * (i < 3 ? 1 : P(t, K.prices + 0.3, K.prices + 1));
					const cx = 540 + (p[0] + q[0] - 1080) * 0.75, cy = 820 + (p[1] + q[1] - 1640) * 0.75;
					return <path key={i} d={`M${p[0]} ${p[1]} Q${cx} ${cy} ${q[0]} ${q[1]}`} stroke={cols[(i + 1) % 4]} strokeWidth={8} fill="none" strokeDasharray="1000" strokeDashoffset={1000 * (1 - k)} opacity={0.85} />;
				})}
			</svg>
			{pts.map(([x, y], i) => (
				<At key={i} x={x} y={y} s={pop(t, ks[i] - 0.3)}>
					<div style={{width: 300, textAlign: 'center', whiteSpace: 'normal'}}><Pill text={S.chain[i]} bg={cols[i]} size={i === 1 ? 26 : 32} /></div>
				</At>
			))}
			<At x={540} y={820} s={pop(t, K.prices + 0.6)} rot={(t * 60) % 360}><div style={{fontSize: 120, color: C.cream, fontFamily: DISPLAY, fontWeight: 900}}>↻</div></At>
		</AbsoluteFill>
	);
};
