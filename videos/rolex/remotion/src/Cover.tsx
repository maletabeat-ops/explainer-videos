import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Dial, Flag, GreenBg} from './Comps';
import {At, Badge, C, Pill, Title} from './ui';
const TXT = {
	ru: {k: 'ВЫ ЗНАЛИ?', l1: 'ГЛАВНЫЕ ЧАСЫ МИРА', l2: 'ПРИНАДЛЕЖАТ ФОНДУ', b: 'ROLEX · БЕЗ АКЦИОНЕРОВ'},
	en: {k: 'DID YOU KNOW?', l1: "THE WORLD'S TOP WATCH", l2: 'IS OWNED BY A FOUNDATION', b: 'ROLEX · NO SHAREHOLDERS'},
};
export const CoverShort: React.FC<{lang: 'ru' | 'en'}> = ({lang}) => {
	const T = TXT[lang];
	return (
		<AbsoluteFill>
			<GreenBg />
			<At x={540} y={1070}><Dial size={820} t={4} glow={1} /></At>
			<At x={540} y={360}><Pill text={T.k} bg={C.gold} size={46} /></At>
			<At x={540} y={490}><Title text={T.l1} col={C.cream} size={lang === 'ru' ? 78 : 72} /></At>
			<At x={540} y={600}><Title text={T.l2} col={C.gold} size={lang === 'ru' ? 82 : 66} glow={C.gold} /></At>
			<At x={540} y={1580}><div style={{display: 'flex', alignItems: 'center', gap: 20}}><Flag c="ch" w={70} /><Badge text={T.b} col={C.gold} size={42} /></div></At>
		</AbsoluteFill>
	);
};
export const Thumb: React.FC = () => (
	<AbsoluteFill>
		<GreenBg w={1280} h={720} />
		<At x={960} y={380}><Dial size={560} t={4} glow={1} /></At>
		<At x={400} y={150}><Title text="NO OWNER." col={C.cream} size={80} /></At>
		<At x={400} y={250}><Title text="NO SHAREHOLDERS." col={C.gold} size={64} glow={C.gold} /></At>
		<At x={400} y={350}><Title text="$11B A YEAR." col={C.gold} size={80} glow={C.gold} /></At>
		<At x={400} y={480}><div style={{display: 'flex', alignItems: 'center', gap: 16}}><Flag c="de" w={100} /><div style={{fontFamily: 'Inter Display', fontWeight: 900, fontSize: 54, color: C.gold}}>→</div><Flag c="uk" w={100} /><div style={{fontFamily: 'Inter Display', fontWeight: 900, fontSize: 54, color: C.gold}}>→</div><Flag c="ch" w={70} /></div></At>
		<At x={400} y={620}><Badge text="THE STRANGE STORY OF ROLEX" col={C.gold} size={34} /></At>
	</AbsoluteFill>
);
