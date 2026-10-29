import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {At, C, DISPLAY, FPS, P, eout, pop} from './ui';
export const CTA: React.FC<{K: any; S: any}> = ({K, S}) => {
	const t = useCurrentFrame() / FPS;
	if (K.cta === undefined || t < K.cta - 0.3) return null;
	const t0 = K.cta, tap = t0 + 1.1, like = t0 + 2.0;
	const appear = pop(t, t0 - 0.2, 0.5);
	const pressed = t > tap, press = Math.sin(P(t, tap - 0.12, tap + 0.12) * Math.PI);
	const hand = P(t, t0 + 0.3, tap) * (1 - P(t, like + 0.6, like + 1.0));
	const handX = t < like - 0.3 ? 760 - 120 * eout(P(t, t0 + 0.3, tap)) : 640 - 120 * eout(P(t, tap + 0.3, like));
	const handY = t < like - 0.3 ? 1260 : 1240 + 180 * eout(P(t, tap + 0.3, like));
	const liked = t > like, lp = pop(t, like, 0.5);
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{background: `rgba(3,8,18,${0.55 * Math.min(1, appear)})`}} />
			<At x={540} y={1210} s={appear * (1 - 0.06 * press)}>
				<div style={{display: 'flex', alignItems: 'center', gap: 22, padding: '30px 64px', borderRadius: 999, background: pressed ? '#2a3448' : '#ff2d46', boxShadow: pressed ? 'none' : '0 0 50px #ff2d46aa', fontFamily: DISPLAY, fontWeight: 900, fontSize: 64, color: '#fff'}}>
					<svg width="56" height="56" viewBox="0 0 24 24"><path d="M12 22a2.5 2.5 0 0 0 2.4-2h-4.8A2.5 2.5 0 0 0 12 22zm7-6V11a7 7 0 0 0-5-6.7V3a2 2 0 0 0-4 0v1.3A7 7 0 0 0 5 11v5l-2 2v1h18v-1z" fill="#fff" /></svg>
					{pressed ? S.subbed : S.sub}
				</div>
			</At>
			<At x={540} y={1420} s={appear}>
				<div style={{position: 'relative', width: 200, height: 200}}>
					<svg width="200" height="200" viewBox="0 0 24 24" style={{transform: `scale(${liked ? 0.9 + 0.25 * lp : 0.9})`}}>
						<path d="M12 21s-7.5-4.6-10-9.3C.4 8.4 2.3 4.5 6 4.5c2.1 0 3.4 1.1 4.2 2.3h3.6c.8-1.2 2.1-2.3 4.2-2.3 3.7 0 5.6 3.9 4 7.2C19.5 16.4 12 21 12 21z" fill={liked ? '#ff2d46' : 'none'} stroke={liked ? '#ff2d46' : '#ffffff'} strokeWidth={1.6} />
					</svg>
					{liked ? Array.from({length: 10}).map((_, i) => {const a = (i / 10) * Math.PI * 2, r = 70 + 90 * eout(P(t, like, like + 0.6)); return <div key={i} style={{position: 'absolute', left: 100 + Math.cos(a) * r - 7, top: 100 + Math.sin(a) * r - 7, width: 14, height: 14, borderRadius: 7, background: i % 2 ? C.gold : '#ff2d46', opacity: 1 - P(t, like + 0.3, like + 0.9)}} />;}) : null}
				</div>
			</At>
			<At x={540} y={1560} s={appear}><div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 40, color: C.cream}}>{S.like}</div></At>
			{hand > 0 ? <At x={handX} y={handY + 40 * press} s={1}><svg width="110" height="130" viewBox="0 0 24 28" style={{opacity: Math.min(1, hand * 3)}}><path d="M9 2a2 2 0 0 1 2 2v8l1-.2a2 2 0 0 1 2.3 1.6l.1.6 1.4-.3a2 2 0 0 1 2.3 1.6l.1.5 1-.2a2 2 0 0 1 2.3 1.6l.6 3.9C22.6 25 20 27 17 27h-5c-2 0-3.5-1-4.5-2.5L3.3 18a2 2 0 0 1 3.1-2.5L7 16V4a2 2 0 0 1 2-2z" fill="#ffffff" stroke="#0b1220" strokeWidth="1.2" /></svg></At> : null}
		</AbsoluteFill>
	);
};
