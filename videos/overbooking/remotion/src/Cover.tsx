import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Pass, RunwayBg} from './Comps';
import {At, Badge, C, Pill, Title} from './ui';
const TXT = {
	ru: {k: 'ВЫ ЗНАЛИ?', l1: 'ТВОЁ МЕСТО', l2: 'ПРОДАЛИ ДВАЖДЫ', b: 'И ЭТО ХОТЯТ УЗАКОНИТЬ', route: 'MOW → AER', p1: 'ИВАНОВ / ИВАН', p2: 'ТЫ', s: 'МЕСТО'},
	en: {k: 'DID YOU KNOW?', l1: 'YOUR SEAT', l2: 'WAS SOLD TWICE', b: "AND IT'S LEGAL", route: 'JFK → LAX', p1: 'SMITH / JOHN', p2: 'YOU', s: 'SEAT'},
};
export const CoverShort: React.FC<{lang: 'ru' | 'en'}> = ({lang}) => {
	const T = TXT[lang];
	return (
		<AbsoluteFill>
			<RunwayBg />
			<At x={515} y={930} rot={-5}><Pass w={820} seat="14C" route={T.route} name={T.p1} label={T.s} /></At>
			<At x={565} y={1120} rot={4}><Pass w={820} seat="14C" route={T.route} name={T.p2} label={T.s} col={C.yellow} stamp="× 2" stampK={1} stampX="55%" stampY="20%" /></At>
			<At x={540} y={330}><Pill text={T.k} bg={C.yellow} size={46} /></At>
			<At x={540} y={470}><Title text={T.l1} col={C.white} size={120} /></At>
			<At x={540} y={590}><Title text={T.l2} col={C.yellow} size={lang === 'ru' ? 92 : 100} glow={C.yellow} /></At>
			<At x={540} y={1440}><Badge text={T.b} col={C.red} size={lang === 'ru' ? 50 : 56} /></At>
		</AbsoluteFill>
	);
};
