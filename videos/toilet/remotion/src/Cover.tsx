import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Toilet3D} from './Comps';
import {At, Badge, C, Pill, Title} from './ui';
const TXT = {
	ru: {k: 'ВЫ ЗНАЛИ?', l1: 'ТЫ ПОЛЬЗУЕШЬСЯ ЭТИМ', l2: 'КАЖДЫЙ ДЕНЬ', b: 'ЗАЧЕМ ТРУБЕ ИЗГИБ?'},
	en: {k: 'DID YOU KNOW?', l1: 'YOU USE THIS', l2: 'EVERY SINGLE DAY', b: 'WHY IS THIS PIPE BENT?'},
};
const SHOW = {pipe: 1, trap: 1, tank: 0, chain: 0, supply: 0, float: 0, bowl: 0, seat: 0};
export const CoverShort: React.FC<{lang: 'ru' | 'en'}> = ({lang}) => {
	const T = TXT[lang];
	return (
		<AbsoluteFill style={{background: C.navy}}>
			<AbsoluteFill><Toilet3D w={1080} h={1920} t={1} cam={{p: [2.2, -0.6, 4.6], l: [0.3, -0.55, 0]}} show={SHOW} bucketX={30} stink={0} flush={0} level={1} glow={0.6} /></AbsoluteFill>
			<At x={540} y={200}><Pill text={T.k} bg={C.aqua} size={46} /></At>
			<At x={540} y={310}><Title text={T.l1} col={C.white} size={lang === 'ru' ? 72 : 88} /></At>
			<At x={540} y={415}><Title text={T.l2} col={C.aqua} size={lang === 'ru' ? 96 : 84} glow={C.aqua} /></At>
			<At x={540} y={1580}><Badge text={T.b} col={C.amber} size={46} /></At>
		</AbsoluteFill>
	);
};
export const Thumb: React.FC = () => (
	<AbsoluteFill style={{background: C.navy}}>
		<AbsoluteFill style={{left: 520}}><Toilet3D w={760} h={720} t={1} cam={{p: [2.2, -0.6, 4.6], l: [0.3, -0.55, 0]}} show={SHOW} bucketX={30} stink={0} flush={0} level={1} glow={0.6} /></AbsoluteFill>
		<At x={330} y={170}><Title text="YOU USE THIS" col={C.white} size={80} /></At>
		<At x={330} y={270}><Title text="EVERY DAY" col={C.aqua} size={92} glow={C.aqua} /></At>
		<At x={330} y={420}><Title text="WHY IS IT BENT?" col={C.amber} size={60} /></At>
		<At x={330} y={590}><Badge text="LET'S INVENT IT FROM SCRATCH" col={C.white} size={30} /></At>
	</AbsoluteFill>
);
