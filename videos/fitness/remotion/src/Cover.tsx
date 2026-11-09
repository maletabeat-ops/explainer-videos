import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Dumbbell3D, GymBg} from './Comps';
import {At, Badge, C, Pill, Title} from './ui';
const TXT = {
	ru: {k: 'ВЫ ЗНАЛИ?', l1: 'ФИТНЕС-БЛОГЕР ЗАРАБОТАЛА', l2: '$1,8 МИЛЛИАРДА', b: 'И НЕ НА ПРОСМОТРАХ'},
	en: {k: 'DID YOU KNOW?', l1: 'A FITNESS INFLUENCER MADE', l2: '$1.8 BILLION', b: 'AND NOT FROM VIEWS'},
};
export const CoverShort: React.FC<{lang: 'ru' | 'en'}> = ({lang}) => {
	const T = TXT[lang];
	return (
		<AbsoluteFill>
			<GymBg />
			<At x={540} y={1050}><Dumbbell3D w={1080} h={820} t={0.8} glow={1} dist={7.4} /></At>
			<At x={540} y={330}><Pill text={T.k} bg={C.volt} size={46} /></At>
			<At x={540} y={460}><Title text={T.l1} col={C.white} size={lang === 'ru' ? 64 : 62} /></At>
			<At x={540} y={575}><Title text={T.l2} col={C.volt} size={lang === 'ru' ? 112 : 120} glow={C.volt} /></At>
			<At x={540} y={1580}><Badge text={T.b} col={C.volt} size={lang === 'ru' ? 44 : 46} /></At>
		</AbsoluteFill>
	);
};
export const Thumb: React.FC = () => (
	<AbsoluteFill>
		<GymBg w={1280} h={720} />
		<At x={990} y={300}><Dumbbell3D w={560} h={440} t={0.8} glow={1} dist={7.6} /></At>
		<At x={400} y={150}><Title text="HOW FITNESS" col={C.white} size={78} /></At>
		<At x={400} y={245}><Title text="INFLUENCERS" col={C.white} size={78} /></At>
		<At x={400} y={350}><Title text="REALLY GET RICH" col={C.pink} size={70} glow={C.pink} /></At>
		<At x={990} y={600}><div style={{fontFamily: 'Inter Display', fontWeight: 900, fontSize: 64, color: C.volt, border: `6px solid ${C.volt}`, borderRadius: 16, padding: '4px 22px', transform: 'rotate(-5deg)', background: 'rgba(12,9,24,.8)'}}>$1.8B</div></At>
		<At x={400} y={560}><Badge text="IT'S NOT THE VIEWS" col={C.volt} size={36} /></At>
	</AbsoluteFill>
);
