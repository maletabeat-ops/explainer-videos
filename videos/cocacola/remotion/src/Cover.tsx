import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Bottle3D, RedBg} from './Comps';
import {At, Badge, C, Pill, Title} from './ui';
const TXT = {
	ru: {k: 'ВЫ ЗНАЛИ?', l1: 'ПОЧЕМУ КОЛА', l2: 'ПАХНЕТ НОВЫМ ГОДОМ', b: 'НАЧАЛОСЬ С АПТЕКИ · 1886'},
	en: {k: 'DID YOU KNOW?', l1: 'WHY COKE', l2: 'TASTES LIKE CHRISTMAS', b: 'IT STARTED IN A PHARMACY · 1886'},
};
export const CoverShort: React.FC<{lang: 'ru' | 'en'}> = ({lang}) => {
	const T = TXT[lang];
	return (
		<AbsoluteFill>
			<RedBg snow={0.8} />
			<At x={540} y={1130}><Bottle3D w={900} h={900} t={1.2} glow={1} dist={6.6} /></At>
			<At x={540} y={330}><Pill text={T.k} bg={C.white} size={46} /></At>
			<At x={540} y={460}><Title text={T.l1} col={C.white} size={104} /></At>
			<At x={540} y={575}><Title text={T.l2} col={C.red} size={lang === 'ru' ? 76 : 70} glow={C.red} /></At>
			<At x={540} y={1630}><Badge text={T.b} col={C.gold} size={lang === 'ru' ? 44 : 40} /></At>
		</AbsoluteFill>
	);
};
export const Thumb: React.FC = () => (
	<AbsoluteFill>
		<RedBg w={1280} h={720} snow={0.8} />
		<At x={1010} y={380}><Bottle3D w={440} h={680} t={1.2} glow={1} dist={7.6} /></At>
		<At x={420} y={170}><Title text="HOW A MEDICINE" col={C.white} size={70} /></At>
		<At x={420} y={260}><Title text="BECAME THE TASTE" col={C.white} size={70} /></At>
		<At x={420} y={360}><Title text="OF CHRISTMAS" col={C.red} size={90} glow={C.red} /></At>
		<At x={420} y={520}><Badge text="THE STORY OF COCA-COLA" col={C.gold} size={36} /></At>
	</AbsoluteFill>
);
