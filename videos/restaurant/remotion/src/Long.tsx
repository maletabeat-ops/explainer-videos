import React from 'react';
import {AbsoluteFill, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Audio} from '@remotion/media';
import {Callout, Cam, Restaurant3D, Show} from './Comps';
import {CTA} from './CTA';
import {camAt, chapters, sfx} from './Short';
import {At, C, DISPLAY, FPS, P, Title, eout, pop} from './ui';

const L = {sub: 'SUBSCRIBE', subbed: 'SUBSCRIBED ✓', like: 'LIKE'};
const PartTitle: React.FC<{n: number; title: string; at: number}> = ({n, title, at}) => {
	const t = useCurrentFrame() / FPS;
	const k = P(t, at, at + 0.5) * (1 - P(t, at + 4.2, at + 4.8));
	if (k <= 0) return null;
	return (
		<div style={{position: 'absolute', left: 80, bottom: 70, opacity: k, transform: `translateX(${(1 - eout(Math.min(1, k * 1.2))) * -60}px)`, padding: '16px 26px', borderRadius: 18, background: 'rgba(30,20,32,.72)'}}>
			<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 24, color: C.amber, letterSpacing: 4}}>STEP {n}</div>
			<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 50, color: C.white}}>{title}</div>
			<div style={{height: 5, width: 160, background: C.amber, borderRadius: 3, marginTop: 10, boxShadow: `0 0 14px ${C.amber}`}} />
		</div>
	);
};
const CAMS: Cam[] = [
	{p: [5.5, 3.2, 12], l: [0, 1.2, 0.5]},
	{p: [3.5, 6.5, 8], l: [-0.3, 0.6, -1.0]},
	{p: [4.5, 8.5, 9], l: [0, 0.4, -0.3]},
	{p: [3.6, 3.8, 2.5], l: [0.5, 0.9, -1.9]},
	{p: [2.4, 2.8, 7.2], l: [-1.2, 1.1, 1.8]},
	{p: [0.01, 10.5, 3.4], l: [0, 0, -0.2]},
	{p: [4.2, 6.5, 7.5], l: [0.2, 0.8, -1.2]},
	{p: [1.8, 2.6, 2.6], l: [0.6, 1.5, -1.5]},
	{p: [0.6, 8.6, -0.5], l: [0.1, 0, -2.35]},
	{p: [-0.9, 8.2, -0.4], l: [-1.6, 0, -2.4]},
	{p: [3.4, 3.2, 4.6], l: [1.0, 0.8, 1.4]},
	{p: [2.8, 2.6, 6.6], l: [0.6, 1.0, 2.0]},
	{p: [-0.7, 7.8, -0.2], l: [-1.4, 0, -2.2]},
	{p: [-2.6, 4.6, 7.2], l: [0.2, 0.8, 0]},
	{p: [3.5, 3.0, 12.5], l: [-1.2, 1.6, 1.5]},
	{p: [5, 7, 13], l: [-0.5, 1, 0.3]},
];
const showL = (t: number, K: any): Show => ({
	knock: P(t, K.knock, K.knock + 0.8), roof: P(t, K.woman, K.woman + 1.6), pot: P(t, K.pot - 0.4, K.pot + 0.2), stew: t < K.several ? 1 - P(t, K.empty - 0.5, K.empty + 0.5) : 0.7,
	coin: P(t, K.holdcoin, K.holdcoin + 1.0), table: P(t, K.ten - 0.7, K.ten - 0.1), stools: P(t, K.ten - 0.2, K.ten + 0.8),
	dishes: P(t, K.several - 0.3, K.several + 1.2), board: P(t, K.darkboard - 0.3, K.chalk + 1.0), shake: P(t, K.elbows - 0.3, K.elbows + 1.4), split: P(t, K.saw, K.saw + 1.6), plates: P(t, K.ownplate - 0.3, K.ownplate + 0.3),
	smoke: P(t, K.burn7 - 0.4, K.burn7 + 0.2) * (1 - P(t, K.wall + 1, K.wall + 2.5)), wall: P(t, K.wall - 0.2, K.wall + 1.0), window: P(t, K.window - 0.2, K.window + 0.3), tray: P(t, K.carry - 0.2, K.carry + 0.3),
	slips: P(t, K.slips - 0.2, K.pinned + 0.5), stations: P(t, K.stations - 0.2, K.stations + 0.8) * (1 - P(t, K.doesntwait - 1, K.doesntwait)), icebox: P(t, K.icebox - 0.3, K.icebox + 0.4), crate: P(t, K.farmers - 0.3, K.farmers + 0.8),
	prices: P(t, K.price - 0.2, K.price + 1.2), bill: P(t, K.littlepaper - 0.3, K.littlepaper + 0.2), book: P(t, K.thickbook - 0.3, K.thickbook + 0.4), tub: P(t, K.washcorner - 0.3, K.washcorner + 0.4),
	lamps: P(t, K.candles - 0.5, K.candles + 1), steam: P(t, K.candles, K.candles + 1), tips: P(t, K.extracoin - 0.2, K.extracoin + 0.6), sign: P(t, K.bigsign - 0.3, K.bigsign + 1.2), signOn: P(t, K.congrats - 0.1, K.congrats + 0.1),
});
type CO = [string, string, string];
const COL: Record<number, CO[]> = {
	1: [['growling', 'STARVING', C.red], ['sixty', '60 MI BEHIND · 100 AHEAD', C.white], ['closed', 'EVERY DOOR IS CLOSED', C.mute], ['knock', 'KNOCK KNOCK', C.amber]],
	2: [['pot', 'A POT OF STEW', C.amber], ['holdcoin', 'A COIN = A BOWL', C.gold], ['ten', '+10 STRANGERS A NIGHT', C.white], ['idea', 'AN IDEA…', C.amber]],
	3: [['rightnext', 'A HOUSE BY THE ROAD', C.white], ['hearth', 'ONE HEARTH · ONE POT', C.amber], ['longtable', 'ONE LONG TABLE', C.gold]],
	4: [['empty', 'LATE = NOTHING LEFT', C.red], ['hatestew', 'SOME HATE STEW', C.red], ['several', 'FIX: SEVERAL DISHES', C.green]],
	5: [['askq', '“WHAT DO YOU HAVE?” ×50', C.red], ['darkboard', 'FIX: A BOARD BY THE DOOR', C.green], ['chalk', 'TODAY\'S DISHES IN CHALK', C.white]],
	6: [['elbows', 'CROWDED · ELBOWS · FIGHTS', C.red], ['saw', 'FIX: SAW THE TABLE', C.green], ['ownplate', 'OWN TABLE · OWN PLATE', C.white]],
	7: [['waving', 'COOK OR SERVE?', C.red], ['wall', 'FIX: A WALL', C.green], ['kitchen', 'KITCHEN | DINING ROOM', C.white], ['window', 'A PASS-THROUGH WINDOW', C.amber], ['helper', '+ A HELPER', C.gold]],
	8: [['mixed', 'ORDERS GET MIXED UP', C.red], ['slips', 'FIX: PAPER SLIPS', C.green], ['pinned', 'PINNED IN A ROW', C.white], ['firstslip', 'FIRST IN, FIRST COOKED', C.amber]],
	9: [['twenty', '20 ORDERS AT ONCE', C.red], ['stations', 'FIX: STATIONS', C.green], ['meat', 'MEAT · SOUPS · DESSERTS', C.white], ['prepares', 'PREP BEFORE THE RUSH', C.amber]],
	10: [['smell', 'FOOD GOES BAD', C.red], ['cellar', 'FIX: A COOL CELLAR + ICE', C.green], ['farmers', 'FRESH FROM FARMERS DAILY', C.white]],
	11: [['arguments', 'WHO PAYS WHAT?', C.red], ['price', 'FIX: A PRICE PER DISH', C.green], ['littlepaper', 'THE BILL', C.white]],
	12: [['crowd', 'A CROWD AT THE DOOR', C.red], ['thickbook', 'FIX: A BOOK BY THE DOOR', C.green], ['writename', 'NAME · DAY · TIME · SEATS', C.white]],
	13: [['dirtyplates', 'MOUNTAINS OF DIRTY PLATES', C.red], ['washcorner', 'FIX: A WASHING CORNER', C.green], ['onemore', '+ ONE MORE PERSON', C.white]],
	14: [['eatfast', 'EAT FAST AND LEAVE', C.red], ['candles', 'FIX: CANDLES · MUSIC · SMILES', C.green], ['extracoin', 'AN EXTRA COIN = THANK YOU', C.gold]],
	15: [['walkpast', 'EVERYONE WALKS PAST', C.red], ['bigsign', 'FIX: A BIG SIGN', C.green], ['lamp', 'A LAMP ALL NIGHT', C.amber]],
};
const PARTS = ['Hungry on the road', 'A coin for a bowl', 'A house by the road', 'The pot runs dry', 'What is there to eat?', 'The long table', 'You can\'t be in two places', 'The forgotten orders', 'One cook, too many dishes', 'The food goes bad', 'Who pays what?', 'The crowd at the door', 'Mountains of dishes', 'Why come back?', 'Nobody can find you', 'Look what you built'];

export const RestLong: React.FC<{data: any}> = ({data}) => {
	const K = data.k, ch = chapters(data, 16), dur = data.dur;
	const t = useCurrentFrame() / FPS;
	const cam = camAt(t, ch, CAMS, 15), show = showL(t, K);
	const cta = K.cta !== undefined ? 1 - P(t, K.cta - 0.4, K.cta) : 1;
	let c = 0; while (c < 15 && t >= ch[c + 1]) c++;
	const items = COL[c + 1] ?? [];
	const MUSIC = 120, loops = Math.ceil(dur / (MUSIC - 4)) + 1;
	return (
		<AbsoluteFill style={{background: '#3a2c3c'}}>
			<AbsoluteFill><Restaurant3D w={1920} h={1080} t={t} cam={cam} show={show} signText="RESTAURANT" /></AbsoluteFill>
			<div style={{position: 'absolute', left: 70, top: 70, display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'flex-start', opacity: 1 - P(t, ch[c + 1] - 0.4, ch[c + 1])}}>
				{items.map(([k, text, col]) => t > K[k] - 0.3 ? <div key={k} style={{transform: `scale(${pop(t, K[k] - 0.3)})`, transformOrigin: 'left center'}}><Callout text={text} col={col} size={34} /></div> : null)}
			</div>
			{t > K.congrats - 0.4 ? <>
				<At x={960} y={150} s={pop(t, K.congrats - 0.3)} o={cta}><Title text="CONGRATULATIONS, YOU JUST INVENTED" col={C.white} size={58} /></At>
				<At x={960} y={250} s={pop(t, K.congrats + 1.2, 0.6)} o={cta}><Title text="THE RESTAURANT" col={C.amber} size={120} glow={C.amber} /></At>
			</> : null}
			{PARTS.map((p, i) => <PartTitle key={i} n={i + 1} title={i === 15 ? p : p} at={i === 0 ? 0.6 : ch[i] + 0.3} />)}
			<CTA K={K} S={L} cx={960} cy={-760} />
			{Array.from({length: loops}).map((_, i) => (
				<Sequence key={'m' + i} from={Math.round(i * (MUSIC - 4) * FPS)} durationInFrames={Math.round(MUSIC * FPS)} layout="none">
					<Audio src={staticFile('music.mp3')} volume={(f) => 0.11 * Math.min(1, f / (4 * FPS)) * Math.min(1, (MUSIC * FPS - f) / (4 * FPS)) * Math.min(1, (dur * FPS - (f + i * (MUSIC - 4) * FPS)) / 90)} />
				</Sequence>
			))}
			<Sequence from={15} layout="none"><Audio src={staticFile('long/voice.mp3')} volume={1.1} /></Sequence>
			{sfx('knock.mp3', K.knock - 0.1, 0.4, 'kn')}
			{sfx('coin.mp3', K.holdcoin + 0.5, 0.35, 'co')}
			{sfx('chalk.mp3', K.chalk - 0.2, 0.3, 'chk')}
			{sfx('saw.mp3', K.saw - 0.1, 0.3, 'sw')}
			{sfx('plates.mp3', K.carry + 0.3, 0.3, 'pl')}
			{sfx('plates.mp3', K.washcorner + 0.4, 0.25, 'pl2')}
			{sfx('coin.mp3', K.extracoin + 0.3, 0.3, 'co2')}
		</AbsoluteFill>
	);
};
