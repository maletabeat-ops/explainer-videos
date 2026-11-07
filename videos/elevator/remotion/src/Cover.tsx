import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Lift3D} from './Comps';
import {At, Badge, C, Pill, Title} from './ui';
const TXT = {
	ru: {k: 'ВЫ ЗНАЛИ?', l1: 'КАК ИЗОБРЕСТИ', l2: 'ЛИФТ С НУЛЯ', b: 'ВСЁ НАЧАЛОСЬ С ВЕРЁВКИ'},
	en: {k: 'DID YOU KNOW?', l1: 'HOW TO INVENT', l2: 'THE ELEVATOR', b: 'IT STARTS WITH A ROPE'},
};
const SHOW = {wheel: 1, box: 1, cw: 1, motor: 1, rails: 1, brake: 1, doors: 1, buttons: 1};
export const CoverShort: React.FC<{lang: 'ru' | 'en'}> = ({lang}) => {
	const T = TXT[lang];
	return (
		<AbsoluteFill style={{background: C.navy}}>
			<AbsoluteFill><Lift3D w={1080} h={1920} t={1} cam={{p: [5, 4.5, 19], l: [0, 5.8, 0]}} show={SHOW} boxY={6} ropeOK teeth={0} spin={0} doorFloor={6} doorOpen={1} bagY={-1} litFloor={6} sparks={0} /></AbsoluteFill>
			<At x={540} y={330}><Pill text={T.k} bg={C.amber} size={46} /></At>
			<At x={540} y={460}><Title text={T.l1} col={C.white} size={96} /></At>
			<At x={540} y={570}><Title text={T.l2} col={C.amber} size={lang === 'ru' ? 82 : 86} glow={C.amber} /></At>
			<At x={540} y={1580}><Badge text={T.b} col={C.cyan} size={46} /></At>
		</AbsoluteFill>
	);
};
export const Thumb: React.FC = () => (
	<AbsoluteFill style={{background: C.navy}}>
		<AbsoluteFill style={{left: 560}}><Lift3D w={720} h={720} t={1} cam={{p: [7, 7, 17], l: [0, 6, 0]}} show={SHOW} boxY={6} ropeOK={false} teeth={1} spin={0} doorFloor={6} doorOpen={0} bagY={-1} litFloor={6} sparks={0.4} /></AbsoluteFill>
		<At x={330} y={170}><Title text="YOU JUST" col={C.white} size={84} /></At>
		<At x={330} y={270}><Title text="INVENTED" col={C.white} size={84} /></At>
		<At x={330} y={380}><Title text="THE ELEVATOR" col={C.amber} size={80} glow={C.amber} /></At>
		<At x={330} y={540}><Badge text="WHAT IF THE ROPE BREAKS?" col={C.red} size={34} /></At>
	</AbsoluteFill>
);
