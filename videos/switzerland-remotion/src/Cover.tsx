import React from 'react';
import {AbsoluteFill} from 'remotion';
import {MapScene} from './MapScene';
import {STR} from './strings';
import {At, Badge, C, Pill, Title} from './ui';

const TXT = {
	ru: {k: 'ВЫ ЗНАЛИ?', l1: 'В ШВЕЙЦАРИИ', l2: '7 024 CHF', l3: 'В МЕСЯЦ?!', b: '3 СЕКРЕТА ВЫСОКИХ ЗАРПЛАТ'},
	en: {k: 'DID YOU KNOW?', l1: 'SWISS MEDIAN PAY:', l2: '7,024 CHF', l3: 'A MONTH?!', b: '3 SECRETS BEHIND IT'},
};
export const Cover: React.FC<{lang: 'ru' | 'en'}> = ({lang}) => {
	const T = TXT[lang];
	const K = {fin: 999, costly: 999, double: 0};
	return (
		<AbsoluteFill style={{background: 'linear-gradient(180deg,#070a1c 0%,#101640 45%,#1a1036 75%,#080a18 100%)'}}>
			<AbsoluteFill style={{top: 260}}><MapScene t0={10} mode="final" K={K} S={STR[lang]} /></AbsoluteFill>
			<AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(7,10,28,.96) 0%, rgba(7,10,28,.75) 36%, rgba(7,10,28,0) 52%)'}} />
			<At x={540} y={360}><Pill text={T.k} bg={C.gold} size={46} /></At>
			<At x={540} y={500}><Title text={T.l1} col="#fff" size={92} /></At>
			<At x={540} y={630}><Title text={T.l2} col={C.red} size={130} glow={C.red} /></At>
			<At x={540} y={760}><Title text={T.l3} col={C.red} size={96} glow={C.red} /></At>
			<At x={540} y={1580}><Badge text={T.b} col={C.teal} size={44} /></At>
		</AbsoluteFill>
	);
};
