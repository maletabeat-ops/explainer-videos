import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Chart} from './Scenes';
import {STR} from './strings';
import {At, Badge, C, Pill, Title} from './ui';
const TXT = {
	ru: {k: 'ВЫ ЗНАЛИ?', l1: 'ЗА ЧУЖИЕ КРАЖИ', l2: 'ПЛАТИТЕ ВЫ?!', b: 'ЧЕСТНАЯ МАТЕМАТИКА КРАЖ'},
	en: {k: 'DID YOU KNOW?', l1: "YOU PAY FOR", l2: "SHOPLIFTERS?!", b: 'THE HONEST MATH OF THEFT'},
};
export const Cover: React.FC<{lang: 'ru' | 'en'}> = ({lang}) => {
	const T = TXT[lang], S = STR[lang];
	return (
		<AbsoluteFill style={{background: 'linear-gradient(180deg,#04110c 0%,#0a2219 45%,#0b1a17 75%,#040b09 100%)'}}>
			<AbsoluteFill style={{backgroundImage: 'linear-gradient(rgba(150,255,200,.04) 2px, transparent 2px), linear-gradient(90deg, rgba(150,255,200,.04) 2px, transparent 2px)', backgroundSize: '60px 60px'}} />
			<At x={540} y={360}><Pill text={T.k} bg={C.gold} size={46} /></At>
			<At x={540} y={500}><Title text={T.l1} col="#fff" size={96} /></At>
			<At x={540} y={630}><Title text={T.l2} col={C.red} size={116} glow={C.red} /></At>
			<At x={540} y={1080}><Chart k={1} crash={1} S={S} value="−∞" col={C.red} /></At>
			<At x={540} y={1080} rot={-12}>
				<div style={{fontFamily: 'Inter Display', fontWeight: 900, fontSize: 84, color: C.red, border: `10px solid ${C.red}`, borderRadius: 24, padding: '10px 40px', background: 'rgba(30,5,8,.7)', textShadow: `0 0 30px ${C.red}`}}>{S.deal}</div>
			</At>
			<At x={540} y={1520}><Badge text={T.b} col={C.green} size={44} /></At>
		</AbsoluteFill>
	);
};
