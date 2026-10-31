import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Roulette3D} from './Comps';
import {CasinoBg} from './Short';
import {At, Badge, C, Pill, Title} from './ui';
const TXT = {
	ru: {k: 'ВЫ ЗНАЛИ?', l1: 'КАЗИНО ВСЕГДА', l2: 'ВЫИГРЫВАЕТ?!', b: 'НЕ УДАЧА, А МАТЕМАТИКА'},
	en: {k: 'DID YOU KNOW?', l1: 'THE CASINO', l2: 'ALWAYS WINS?!', b: "IT'S NOT LUCK. IT'S MATH"},
};
export const CoverShort: React.FC<{lang: 'ru' | 'en'}> = ({lang}) => {
	const T = TXT[lang];
	return (
		<AbsoluteFill>
			<CasinoBg />
			<AbsoluteFill style={{top: 640}}><Roulette3D t={6} w={1080} h={1000} land={5} glow={1} tilt={1.0} dist={12.5} /></AbsoluteFill>
			<At x={540} y={360}><Pill text={T.k} bg={C.gold} size={46} /></At>
			<At x={540} y={500}><Title text={T.l1} col="#fff" size={100} /></At>
			<At x={540} y={630}><Title text={T.l2} col={C.gold} size={108} glow={C.gold} /></At>
			<At x={540} y={1640}><Badge text={T.b} col={C.red} size={46} /></At>
		</AbsoluteFill>
	);
};
export const Thumb: React.FC = () => (
	<AbsoluteFill>
		<CasinoBg />
		<AbsoluteFill style={{left: -60}}><Roulette3D t={6} w={700} h={720} land={5} glow={1} tilt={1.0} dist={13} /></AbsoluteFill>
		<At x={900} y={190}><Title text="WHY THE CASINO" col="#fff" size={78} /></At>
		<At x={900} y={300}><Title text="ALWAYS WINS" col={C.gold} size={96} glow={C.gold} /></At>
		<At x={900} y={470} rot={-6}><div style={{fontFamily: 'Inter Display', fontWeight: 900, fontSize: 150, color: C.red, textShadow: `0 0 40px ${C.red}, 0 8px 0 #5a0010`}}>−2.7%</div></At>
		<At x={900} y={630}><Pill text="IT'S NOT LUCK. IT'S MATH." bg={C.cream} size={34} /></At>
	</AbsoluteFill>
);
