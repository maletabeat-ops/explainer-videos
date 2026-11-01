import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Hose, Sneaker3D, TrackBg} from './Comps';
import {At, Badge, C, Pill, Title} from './ui';
const TXT = {
	ru: {k: 'ВЫ ЗНАЛИ?', l1: 'КРОССОВКИ', l2: 'ИЗ САДОВОГО ШЛАНГА', b: 'On · CHF 3 МЛРД В ГОД'},
	en: {k: 'DID YOU KNOW?', l1: 'SNEAKERS MADE', l2: 'FROM A GARDEN HOSE', b: 'On · CHF 3 BILLION A YEAR'},
};
export const CoverShort: React.FC<{lang: 'ru' | 'en'}> = ({lang}) => {
	const T = TXT[lang];
	return (
		<AbsoluteFill>
			<TrackBg />
			<At x={540} y={1380}><div style={{opacity: 0.9}}><Hose w={900} cut={1} t={0.4} /></div></At>
			<AbsoluteFill style={{top: 620}}><Sneaker3D w={1080} h={820} t={0} yaw={0.4} glow={1} dist={8.4} /></AbsoluteFill>
			<At x={540} y={360}><Pill text={T.k} bg={C.lime} size={46} /></At>
			<At x={540} y={490}><Title text={T.l1} col={C.white} size={110} /></At>
			<At x={540} y={610}><Title text={T.l2} col={C.lime} size={lang === 'ru' ? 76 : 84} glow={C.lime} /></At>
			<At x={540} y={1580}><Badge text={T.b} col={C.white} size={44} /></At>
		</AbsoluteFill>
	);
};
export const Thumb: React.FC = () => (
	<AbsoluteFill>
		<TrackBg w={1280} h={720} />
		<At x={330} y={520}><Hose w={560} cut={1} t={0.4} /></At>
		<At x={720} y={470}><div style={{fontFamily: 'Inter Display', fontWeight: 900, fontSize: 110, color: C.white, textShadow: `0 0 30px ${C.lime}`}}>→</div></At>
		<AbsoluteFill style={{left: 600, top: 190}}><Sneaker3D w={660} h={500} t={0} yaw={0.4} glow={1} dist={11} /></AbsoluteFill>
		<At x={640} y={90}><Title text="FROM A GARDEN HOSE" col={C.white} size={78} /></At>
		<At x={640} y={185}><Title text="TO CHF 3 BILLION" col={C.lime} size={90} glow={C.lime} /></At>
		<At x={640} y={665}><Badge text="THE STORY OF ON & THE SNEAKER" col={C.white} size={34} /></At>
	</AbsoluteFill>
);
