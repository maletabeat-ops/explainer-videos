import React from 'react';
import {AbsoluteFill, Img, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Audio} from '@remotion/media';
import {loadFont} from '@remotion/fonts';
import {Card, CaseFile, CityBg, Clock, LiftPanel, Meter, PushButton, Thermostat, TrafficLight} from './Comps';
import {CTA} from './CTA';
import {Captions} from './Captions';
import {STR} from './strings';
import {At, Badge, C, DISPLAY, FPS, P, Pill, Title, Txt, eout, pop} from './ui';

for (const [f, w] of [['InterDisplay-Black.otf', '900'], ['InterDisplay-ExtraBold.otf', '800']]) loadFont({family: 'Inter Display', url: staticFile('fonts/' + f), weight: w});
for (const [f, w] of [['Inter-Bold.otf', '700'], ['Inter-ExtraBold.otf', '800']]) loadFont({family: 'Inter', url: staticFile('fonts/' + f), weight: w});

export const chapters = (data: any, n = 8) => {const ch = [0]; for (let s = 2; s <= n; s++) ch.push(data.segs.find((x: any) => x.s === s).t0 - 0.35); ch.push(data.dur); return ch;};
const Brand: React.FC<{S: any}> = ({S}) => (
	<div style={{position: 'absolute', left: 44, top: 52, display: 'flex', alignItems: 'center', gap: 16}}>
		<Img src={staticFile(S.logo)} style={{width: 72, height: 72, borderRadius: 36, border: `3px solid ${C.yellow}cc`, boxShadow: `0 0 18px ${C.yellow}66`}} />
		<div style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 32, color: 'rgba(244,247,255,.92)', textShadow: '0 2px 10px rgba(0,0,0,.6)'}}>{S.handle}</div>
	</div>
);
// fast, punchy cut: slide up + quick zoom settle
export const Win: React.FC<{a: number; b: number; children: React.ReactNode; last?: boolean}> = ({a, b, children, last}) => {
	const t = useCurrentFrame() / FPS;
	if (t < a - 0.2 || t > b + 0.2) return null;
	const i = eout(P(t, a - 0.15, a + 0.22)), o = last ? 1 : 1 - P(t, b - 0.12, b + 0.08);
	return <AbsoluteFill style={{opacity: i * o, transform: `translateY(${(1 - i) * 120}px) scale(${1.1 - 0.1 * i})`}}>{children}</AbsoluteFill>;
};
export const sfx = (src: string, at: number, vol: number, key: string) => <Sequence key={key} from={Math.max(0, Math.round(at * FPS))} layout="none"><Audio src={staticFile('sfx/' + src)} volume={vol} /></Sequence>;
// camera "punch" on key words: brief zoom kick
const punch = (t: number, ks: number[]) => ks.reduce((a, k) => a + 0.035 * Math.max(0, 1 - Math.abs(t - k) / 0.18) * (t >= k - 0.05 ? 1 : 0), 0);

export const BtnShort: React.FC<{lang: 'ru' | 'en'; data: any}> = ({lang, data}) => {
	const S = STR[lang], K = data.k, ch = chapters(data), dur = data.dur;
	const t = useCurrentFrame() / FPS;
	const cta = K.cta !== undefined ? 1 - P(t, K.cta - 0.4, K.cta) : 1;
	const presses = [0.6, 2.3, 4.2, 5.4];
	const press = presses.reduce((a, p) => a + Math.sin(P(t, p, p + 0.25) * Math.PI), 0);
	const z = 1 + punch(t, [K.nothing, K.n2500, K.lift, K.thermo, K.illusion, K.onyou]);
	const active = t < ch[3] ? 0 : t < ch[4] ? 1 : t < ch[5] ? 2 : -1;
	return (
		<AbsoluteFill>
			<CityBg />
			<AbsoluteFill style={{transform: `scale(${z})`}}>
				{/* 1 hook */}
				<Win a={0} b={ch[1]}>
					<At x={540} y={240} s={pop(t, 0.05, 0.35)}><Title text={S.t1} col={C.white} size={96} /></At>
					<At x={540} y={350} s={pop(t, K.nothing - 0.3, 0.35)}><Title text={S.t2} col={C.yellow} size={lang === 'ru' ? 94 : 104} glow={C.yellow} /></At>
					<At x={540} y={880}><PushButton size={520} press={press} glow={0.6} label={S.signLabel} /></At>
					<At x={540} y={1340} s={pop(t, K.you - 0.4)}><Pill text={S.hookSub} bg={C.white} size={lang === 'ru' ? 36 : 38} /></At>
				</Win>
				{/* 2 NYC */}
				<Win a={ch[1]} b={ch[2]}>
					<At x={540} y={250} s={pop(t, K.nyc - 0.3)}><Badge text={S.nyc} col={C.yellow} size={52} /></At>
					<At x={540} y={380} s={pop(t, K.n3250 - 0.3)}><Txt text={S.of} col={C.mute} size={40} /></At>
					<At x={540} y={800}><div style={{display: 'grid', gridTemplateColumns: 'repeat(10, 64px)', gap: 12}}>{Array.from({length: 60}).map((_, i) => {const fake = i % 13 !== 0; const v = P(t, K.n3250 - 0.4 + i * 0.012, K.n3250 + i * 0.012); const red = fake && t > K.n2500 - 0.2 + (i % 10) * 0.02; return <div key={i} style={{width: 64, height: 64, borderRadius: '50%', background: red ? C.red : 'radial-gradient(circle at 40% 35%, #fff2a0, #e0a800)', opacity: v * (red ? 0.95 : 1), transform: `scale(${0.4 + 0.6 * eout(v)})`, boxShadow: !fake && t > K.n2500 ? `0 0 18px ${C.green}` : undefined, border: !fake && t > K.n2500 ? `4px solid ${C.green}` : undefined}} />;})}</div></At>
					<At x={540} y={1200} s={t < K.n2500 - 0.3 ? 0 : 2 - eout(P(t, K.n2500 - 0.3, K.n2500))} rot={-6}><div style={{display: 'flex', alignItems: 'baseline', gap: 20, fontFamily: DISPLAY, fontWeight: 900, color: C.red, border: `8px solid ${C.red}`, borderRadius: 22, padding: '6px 30px', background: 'rgba(20,4,4,.85)'}}><span style={{fontSize: 110}}>{S.fakeN}</span><span style={{fontSize: 52}}>{S.fakeSub}</span></div></At>
				</Win>
				{/* 3 timer + cost */}
				<Win a={ch[2]} b={ch[3]}>
					<At x={540} y={260} s={pop(t, K.computer - 0.3)}><Badge text={S.timer} col={C.cyan} size={lang === 'ru' ? 40 : 46} /></At>
					<At x={330} y={760} s={pop(t, ch[2] + 0.1)}><TrafficLight h={620} t={t} /></At>
					<At x={760} y={700} s={pop(t, K.computer)}><Clock size={300} t={t} /></At>
					<At x={760} y={1000} s={pop(t, K.cost - 0.3)}><PushButton size={220} press={0} fake={P(t, K.cost, K.cost + 0.3)} /></At>
					<At x={540} y={1260} s={pop(t, K.cost - 0.2)}><Pill text={S.cost} bg={C.yellow} size={48} /></At>
					<At x={540} y={1370} s={pop(t, K.cost + 0.8)}><Txt text={S.stay} col={C.white} size={40} /></At>
				</Win>
				{/* 4 elevator */}
				<Win a={ch[3]} b={ch[4]}>
					<At x={540} y={250} s={pop(t, ch[3] + 0.05)}><Title text={S.strange} col={C.yellow} size={lang === 'ru' ? 50 : 52} /></At>
					<At x={540} y={370} s={pop(t, K.lift - 0.3)}><Badge text={S.lift} col={C.white} size={58} /></At>
					<At x={540} y={820} s={pop(t, K.lift - 0.4)}><LiftPanel w={500} pressClose={[K.lift + 0.4, K.lift + 1.1, K.lift + 1.7].reduce((a, p) => a + Math.sin(P(t, p, p + 0.22) * Math.PI), 0)} fire={P(t, K.fire - 0.2, K.fire)} fake={P(t, K.cane - 0.6, K.cane - 0.3)} /></At>
					<At x={540} y={1250} s={pop(t, K.cane - 0.3)}><Txt text={S.cane} col={C.white} size={lang === 'ru' ? 34 : 38} /></At>
					<At x={540} y={1350} s={pop(t, K.fire - 0.3)}><Pill text={S.fire} bg={C.red} fg="#fff" size={40} /></At>
				</Win>
				{/* 5 thermostat */}
				<Win a={ch[4]} b={ch[5]}>
					<At x={540} y={260} s={pop(t, K.office - 0.3)}><Badge text={S.office} col={C.cyan} size={lang === 'ru' ? 50 : 52} /></At>
					<At x={540} y={650} s={pop(t, K.office)}><Thermostat size={440} turn={P(t, K.thermo + 0.6, K.warmer)} wire={P(t, K.thermo, K.thermo + 0.5)} temp={21 + 3 * P(t, K.thermo + 0.6, K.warmer)} /></At>
					<At x={540} y={1205} s={pop(t, K.thermo + 0.2)}><Pill text={S.thermo} bg={C.red} fg="#fff" size={40} /></At>
					<At x={540} y={1315} s={pop(t, K.warmer - 0.3)}><Title text={S.warmer} col={C.amber} size={80} glow={C.amber} /></At>
				</Win>
				{/* 6 why */}
				<Win a={ch[5]} b={ch[6]}>
					<At x={540} y={270} s={pop(t, K.why - 0.3)}><Title text={S.why} col={C.yellow} size={170} glow={C.yellow} /></At>
					<At x={540} y={460} s={pop(t, K.illusion - 0.3)}><Badge text={S.illusion} col={C.cyan} size={lang === 'ru' ? 52 : 46} /></At>
					<At x={540} y={800} s={pop(t, K.illusion + 0.3)}><div style={{display: 'flex', flexDirection: 'column', gap: 46}}><Meter w={820} label={S.control} v={0.15 + 0.8 * P(t, K.wait - 0.6, K.wait + 0.6)} col={C.green} /><Meter w={820} label={S.stress} v={0.9 - 0.65 * P(t, K.wait - 0.3, K.wait + 0.9)} col={C.red} /></div></At>
					<At x={540} y={1180} s={pop(t, K.wait - 0.6)}><PushButton size={200} press={Math.sin(P(t, K.wait - 0.5, K.wait - 0.25) * Math.PI)} glow={0.5} /></At>
				</Win>
				{/* 7 without / with */}
				<Win a={ch[6]} b={ch[7]}>
					<At x={540} y={480} s={pop(t, K.stand - 0.4)}><Card w={860} col={C.mute} top="" big={S.without} /></At>
					<At x={540} y={880} s={pop(t, K.could - 0.6)}><Card w={860} col={C.yellow} top="" big={S.with} /></At>
					<At x={540} y={1240} s={pop(t, K.could - 0.3)}><PushButton size={180} press={Math.sin(P(t, K.could - 0.2, K.could + 0.05) * Math.PI)} glow={0.7} /></At>
				</Win>
				{/* 8 reveal */}
				<Win a={ch[7]} b={ch[8]} last>
					<At x={540} y={270} s={pop(t, K.works - 0.3)} o={cta}><Title text={S.works} col={C.white} size={lang === 'ru' ? 86 : 90} /></At>
					<At x={540} y={380} s={pop(t, K.notlight - 0.3)} o={cta}><Txt text={S.on} col={C.mute} size={48} /></At>
					<At x={540} y={820} o={cta}><PushButton size={400} press={Math.sin(P(t, K.onyou - 0.2, K.onyou + 0.05) * Math.PI)} glow={0.4 + 0.6 * P(t, K.onyou - 0.2, K.onyou + 0.3)} label={S.signLabel} /></At>
					<At x={540} y={1365} s={pop(t, K.onyou - 0.25, 0.4)} o={cta}><Title text={S.you} col={C.yellow} size={130} glow={C.yellow} /></At>
				</Win>
			</AbsoluteFill>
			<At x={540} y={1478}><CaseFile items={S.cases} stamps={[P(t, K.n2500, K.n2500 + 0.3), P(t, K.cane - 0.3, K.cane), P(t, K.thermo, K.thermo + 0.3)]} active={active} o={P(t, ch[1] - 0.2, ch[1] + 0.2) * (1 - P(t, ch[5] - 0.2, ch[5] + 0.2))} /></At>
			<Brand S={S} />
			<CTA K={K} S={S} />
			<Captions captions={data.captions} />
			<Audio src={staticFile('music.mp3')} volume={(f) => 0.13 * Math.min(1, f / 20) * Math.min(1, (dur * FPS - f) / 75)} />
			<Sequence from={15} layout="none"><Audio src={staticFile(`${lang}/voice.mp3`)} volume={1.1} /></Sequence>
			{presses.map((p, i) => sfx('click.mp3', p, 0.35, 'c' + i))}
			{sfx('beep.mp3', K.computer, 0.22, 'be')}
			{sfx('lift.mp3', K.lift, 0.3, 'li')}
			{sfx('dial.mp3', K.thermo + 0.6, 0.35, 'di')}
			{sfx('click.mp3', K.onyou - 0.2, 0.4, 'cf')}
		</AbsoluteFill>
	);
};
