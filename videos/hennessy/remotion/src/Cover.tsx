import React from 'react';
import {AbsoluteFill} from 'remotion';
import {CellarBg, Flag, Glass3D} from './Comps';
import {At, Badge, C, Pill, Title} from './ui';
const TXT = {
	ru: {k: 'ВЫ ЗНАЛИ?', l1: 'ГЛАВНЫЙ КОНЬЯК МИРА', l2: 'ОСНОВАЛ ИРЛАНДЕЦ', b: 'HENNESSY · С 1765'},
	en: {k: 'DID YOU KNOW?', l1: "THE WORLD'S TOP COGNAC", l2: 'WAS STARTED BY AN IRISHMAN', b: 'HENNESSY · SINCE 1765'},
};
export const CoverShort: React.FC<{lang: 'ru' | 'en'}> = ({lang}) => {
	const T = TXT[lang];
	return (
		<AbsoluteFill>
			<CellarBg />
			<At x={540} y={1040}><Glass3D w={1000} h={900} t={1.2} fill={0.5} glow={1} dist={6.6} /></At>
			<At x={540} y={360}><Pill text={T.k} bg={C.gold} size={46} /></At>
			<At x={540} y={490}><Title text={T.l1} col={C.cream} size={lang === 'ru' ? 70 : 70} /></At>
			<At x={540} y={600}><Title text={T.l2} col={C.gold} size={lang === 'ru' ? 78 : 64} glow={C.amber} /></At>
			<At x={540} y={1560}><div style={{display: 'flex', alignItems: 'center', gap: 20}}><Flag c="ie" w={90} /><Badge text={T.b} col={C.gold} size={44} /><Flag c="fr" w={90} /></div></At>
		</AbsoluteFill>
	);
};
export const Thumb: React.FC = () => (
	<AbsoluteFill>
		<CellarBg w={1280} h={720} />
		<At x={950} y={400}><Glass3D w={620} h={660} t={1.2} fill={0.5} glow={1} dist={6.8} /></At>
		<At x={420} y={150}><Title text="AN IRISH SOLDIER" col={C.cream} size={64} /></At>
		<At x={420} y={240}><Title text="BUILT THE KING" col={C.gold} size={72} glow={C.amber} /></At>
		<At x={420} y={330}><Title text="OF COGNAC" col={C.gold} size={72} glow={C.amber} /></At>
		<At x={420} y={480}><div style={{display: 'flex', alignItems: 'center', gap: 18}}><Flag c="ie" w={110} /><div style={{fontFamily: 'Inter Display', fontWeight: 900, fontSize: 60, color: C.gold}}>→</div><Flag c="fr" w={110} /><div style={{fontFamily: 'Inter Display', fontWeight: 900, fontSize: 60, color: C.gold}}>→</div><Flag c="us" w={110} /></div></At>
		<At x={420} y={620}><Badge text="THE STORY OF HENNESSY" col={C.gold} size={36} /></At>
	</AbsoluteFill>
);
