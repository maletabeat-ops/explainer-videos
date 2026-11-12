import React from 'react';
import {AbsoluteFill} from 'remotion';
import {CityBg, PushButton} from './Comps';
import {At, Badge, C, Pill, Title} from './ui';
const TXT = {
	ru: {k: 'ВЫ ЗНАЛИ?', l1: 'ЭТА КНОПКА', l2: 'НИЧЕГО НЕ ДЕЛАЕТ', b: 'НО НАЖИМАЮТ ЕЁ МИЛЛИОНЫ'},
	en: {k: 'DID YOU KNOW?', l1: 'THIS BUTTON', l2: 'DOES NOTHING', b: 'YET MILLIONS PRESS IT DAILY'},
};
export const CoverShort: React.FC<{lang: 'ru' | 'en'}> = ({lang}) => {
	const T = TXT[lang];
	return (
		<AbsoluteFill>
			<CityBg />
			<At x={540} y={1170}><PushButton size={500} press={0} glow={0.8} fake={1} /></At>
			<At x={540} y={330}><Pill text={T.k} bg={C.yellow} size={46} /></At>
			<At x={540} y={460}><Title text={T.l1} col={C.white} size={110} /></At>
			<At x={540} y={575}><Title text={T.l2} col={C.yellow} size={lang === 'ru' ? 92 : 104} glow={C.yellow} /></At>
			<At x={540} y={1640}><Badge text={T.b} col={C.red} size={lang === 'ru' ? 42 : 40} /></At>
		</AbsoluteFill>
	);
};
export const Thumb: React.FC = () => (
	<AbsoluteFill>
		<CityBg w={1280} h={720} />
		<At x={960} y={380}><PushButton size={330} press={0} glow={0.9} fake={1} /></At>
		<At x={420} y={190}><Pill text="NOBODY TELLS YOU THIS" bg={C.red} fg="#fff" size={34} /></At>
		<At x={420} y={330}><Title text="THIS BUTTON" col={C.white} size={92} /></At>
		<At x={420} y={440}><Title text="IS FAKE" col={C.yellow} size={120} glow={C.yellow} /></At>
		<At x={420} y={570}><Badge text="2,500+ in NYC alone" col={C.cyan} size={38} /></At>
	</AbsoluteFill>
);
