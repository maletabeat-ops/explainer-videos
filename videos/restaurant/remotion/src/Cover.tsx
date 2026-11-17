import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Restaurant3D} from './Comps';
import {At, C, Pill, Title} from './ui';
const TXT = {ru: {k: 'ВЫ ЗНАЛИ?', l1: 'РЕСТОРАН', l2: 'СНАЧАЛА БЫЛ СУПОМ'}, en: {k: 'DID YOU KNOW?', l1: 'A RESTAURANT', l2: 'WAS ONCE A SOUP'}};
const FULL = {knock: 1, roof: 1, pot: 1, stew: 0.6, coin: 0, table: 1, stools: 1, dishes: 1, board: 1, shake: 0, split: 1, plates: 1, smoke: 0, wall: 1, window: 1, tray: 0, prices: 1, bill: 1, sign: 1, lamps: 1, steam: 1};
export const CoverShort: React.FC<{lang: 'ru' | 'en'}> = ({lang}) => {
	const T = TXT[lang];
	return (
		<AbsoluteFill style={{background: C.navy}}>
			<Restaurant3D w={1080} h={1920} t={2} cam={{p: [3.6, 6.2, 11.5], l: [0, 2.0, 0.2]}} show={FULL} signText={lang === 'ru' ? 'РЕСТОРАН' : 'RESTAURANT'} />
			<AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(18,10,18,.85) 0%, rgba(18,10,18,0) 38%)'}} />
			<At x={540} y={330}><Pill text={T.k} bg={C.amber} size={46} /></At>
			<At x={540} y={460}><Title text={T.l1} col={C.white} size={lang === 'ru' ? 120 : 108} /></At>
			<At x={540} y={580}><Title text={T.l2} col={C.amber} size={lang === 'ru' ? 82 : 92} glow={C.amber} /></At>
		</AbsoluteFill>
	);
};
