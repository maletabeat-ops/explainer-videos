import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Fridge3D} from './Fridge3D';
import {chapters} from './scene';
import {At, Badge, C, Pill, Title} from './ui';
import ru from '../public/ru/data.json';
import en from '../public/en/data.json';
const TXT = {
	ru: {k: 'ВЫ ЗНАЛИ?', l1: 'ХОЛОДИЛЬНИК', l2: 'НЕ ДЕЛАЕТ', l3: 'ХОЛОД?!', b: 'ОН — НАСОС ДЛЯ ТЕПЛА'},
	en: {k: 'DID YOU KNOW?', l1: 'YOUR FRIDGE', l2: "DOESN'T MAKE", l3: 'COLD?!', b: "IT'S A HEAT PUMP"},
};
export const Cover: React.FC<{lang: 'ru' | 'en'}> = ({lang}) => {
	const T = TXT[lang], data: any = lang === 'ru' ? ru : en, ch = chapters(data);
	return (
		<AbsoluteFill style={{background: 'linear-gradient(180deg,#050c1c 0%,#0b1f3d 45%,#0d1630 75%,#050a16 100%)'}}>
			<AbsoluteFill style={{top: 330, left: 95}}><Fridge3D ch={ch} K={data.k} dur={data.dur} tt={ch[2] + 2.5} /></AbsoluteFill>
			<AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(5,12,28,.97) 0%, rgba(5,12,28,.8) 38%, rgba(5,12,28,0) 52%)'}} />
			<At x={540} y={330}><Pill text={T.k} bg={C.gold} size={46} /></At>
			<At x={540} y={470}><Title text={T.l1} col="#fff" size={104} /></At>
			<At x={540} y={600}><Title text={T.l2} col={C.cyan} size={112} glow={C.cyan} /></At>
			<At x={540} y={725}><Title text={T.l3} col={C.cyan} size={112} glow={C.cyan} /></At>
			<At x={540} y={1790}><Badge text={T.b} col={C.red} size={46} /></At>
		</AbsoluteFill>
	);
};
