import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Restaurant3D} from './Comps';
import {At, C, Pill, Title} from './ui';
const TXT = {ru: {k: 'С НУЛЯ ЗА 6 ШАГОВ', l1: 'ИЗОБРЕТАЕМ', l2: 'РЕСТОРАН'}, en: {k: 'FROM SCRATCH IN 6 STEPS', l1: 'INVENTING', l2: 'THE RESTAURANT'}};
const FULL = {knock: 1, roof: 1, pot: 1, stew: 0.6, coin: 0, table: 1, stools: 1, dishes: 1, board: 1, shake: 0, split: 1, plates: 1, smoke: 0, wall: 1, window: 1, tray: 0, prices: 1, bill: 1, sign: 1, lamps: 1, steam: 1};
export const CoverShort: React.FC<{lang: 'ru' | 'en'}> = ({lang}) => {
	const T = TXT[lang];
	return (
		<AbsoluteFill style={{background: C.navy}}>
			<Restaurant3D w={1080} h={1920} t={2} cam={{p: [3.6, 6.2, 11.5], l: [0, 2.0, 0.2]}} show={FULL} signText={lang === 'ru' ? 'РЕСТОРАН' : 'RESTAURANT'} />
			<AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(30,20,32,.8) 0%, rgba(30,20,32,0) 36%)'}} />
			<At x={540} y={330}><Pill text={T.k} bg={C.amber} size={46} /></At>
			<At x={540} y={460}><Title text={T.l1} col={C.white} size={lang === 'ru' ? 120 : 108} /></At>
			<At x={540} y={595}><Title text={T.l2} col={C.amber} size={lang === 'ru' ? 130 : 104} glow={C.amber} /></At>
		</AbsoluteFill>
	);
};
export const Thumb: React.FC = () => (
	<AbsoluteFill style={{background: C.navy}}>
		<Restaurant3D w={1280} h={720} t={2} cam={{p: [3.2, 5.0, 9.5], l: [-3.6, 0.9, 0.9]}} show={{...FULL, signOn: 0}} signText="RESTAURANT" />
		<AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(30,20,32,.85) 0%, rgba(30,20,32,0) 55%)'}} />
		<At x={330} y={170}><Pill text="FROM SCRATCH" bg={C.amber} size={34} /></At>
		<At x={330} y={300}><Title text="INVENT IT" col={C.white} size={96} /></At>
		<At x={330} y={410}><Title text="IN 15 STEPS" col={C.amber} size={86} glow={C.amber} /></At>
		<At x={330} y={540}><Title text="Can you guess it?" col={C.white} size={42} /></At>
	</AbsoluteFill>
);
