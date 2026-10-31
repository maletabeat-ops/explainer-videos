import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Ghost, Lantern3D, NightBg} from './Comps';
import {At, Badge, C, Pill, Title} from './ui';
const TXT = {
	ru: {k: 'ВЫ ЗНАЛИ?', l1: 'ОТКУДА ВЗЯЛСЯ', l2: 'ХЭЛЛОУИН?', b: 'СНАЧАЛА БЫЛА РЕПА'},
	en: {k: 'DID YOU KNOW?', l1: 'WHERE HALLOWEEN', l2: 'CAME FROM', b: 'IT STARTED WITH A TURNIP'},
};
export const CoverShort: React.FC<{lang: 'ru' | 'en'}> = ({lang}) => {
	const T = TXT[lang];
	return (
		<AbsoluteFill>
			<NightBg />
			<At x={190} y={760}><Ghost size={170} t={1} /></At>
			<At x={900} y={820}><Ghost size={130} t={2} ph={2} /></At>
			<At x={540} y={1130}><Lantern3D w={1080} h={980} morph={1} glow={1} spin={0.15} flicker={1} dist={5.8} /></At>
			<At x={540} y={360}><Pill text={T.k} bg={C.pumpkin} size={46} /></At>
			<At x={540} y={500}><Title text={T.l1} col={C.bone} size={lang === 'ru' ? 100 : 96} /></At>
			<At x={540} y={630}><Title text={T.l2} col={C.pumpkin} size={118} glow={C.pumpkin} /></At>
			<At x={540} y={1550}><Badge text={T.b} col={C.ghost} size={48} /></At>
		</AbsoluteFill>
	);
};
export const Thumb: React.FC = () => (
	<AbsoluteFill>
		<NightBg w={1280} h={720} moon={[1200, 80]} hills={0.82} />
		<At x={260} y={420}><Lantern3D w={520} h={600} morph={0} glow={1} spin={0.2} flicker={1} dist={7.4} /></At>
		<At x={1020} y={420}><Lantern3D w={520} h={600} morph={1} glow={1} spin={-0.2} flicker={1} dist={7.6} /></At>
		<At x={640} y={430}><div style={{fontFamily: 'Inter Display', fontWeight: 900, fontSize: 130, color: C.bone, textShadow: `0 0 30px ${C.pumpkin}`}}>→</div></At>
		<At x={640} y={95}><Title text="WHERE HALLOWEEN" col={C.bone} size={76} /></At>
		<At x={640} y={180}><Title text="REALLY CAME FROM" col={C.pumpkin} size={84} glow={C.pumpkin} /></At>
		<At x={640} y={655}><Badge text="IT STARTED WITH A TURNIP" col={C.ghost} size={40} /></At>
	</AbsoluteFill>
);
