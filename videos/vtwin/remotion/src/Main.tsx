import React, {useEffect, useRef, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame} from 'remotion';
import {Audio} from '@remotion/media';
import {Cut, EXPLODE, PH, PW, Road, THREE, makeCut, makeRoad, project, roadState, updateCut, updateRoad} from './Scenes';
import {BAR, BEAT, FIRE_B, N, P, eout, pulse, sinceFire} from './timeline';

const OR = '#ffae42', WH = '#f4f1e8', INK = '#0b0f16';
type Cap = [number, number, string[], number?]; // start, end, lines (*x* = orange), second line delay
const CAPS: Cap[] = [
	[0, 118, ['WHY DOES THIS ENGINE SAY', 'POTATO-POTATO-POTATO?']],
	[122, 178, ['IT\'S A *V-TWIN*:', 'TWO CYLINDERS AT *45°*'], 15],
	[182, 238, ['TWO PISTONS.', '*ONE* SHARED CRANKPIN'], 23],
	[242, 298, ['*FIRE*... THEN TURN *405°*']],
	[300, 358, ['*FIRE*... THEN TURN *315°*', 'AND REPEAT'], 30],
	[362, 418, ['THE GAPS ARE *UNEVEN*', 'LONG, SHORT, LONG, SHORT'], 15],
	[422, 478, ['MOST ENGINES FIRE *EVENLY*', 'THIS ONE *LIMPS*'], 28],
	[482, 538, ['ALL OF IT HANGS ON', '*ONE CRANKPIN*'], 15],
	[542, 598, ['*1994*: HARLEY-DAVIDSON', 'TRIED TO TRADEMARK', 'THE SOUND'], 0],
	[602, 644, ['RIVALS: EVERY V-TWIN', 'SOUNDS LIKE *THIS*'], 0],
	[625, 644, ['', '', '*2000*: THEY GAVE UP'], 0],
	[662, 718, ['THAT *LIMP*']],
	[720, 778, ['THAT *LIMP*', 'IS THE SOUND.'], 0],
];
let road: Road | null = null, cut: Cut | null = null, rR: THREE.WebGLRenderer | null = null, rC: THREE.WebGLRenderer | null = null; let logo: HTMLImageElement | null = null;

const rich = (c: CanvasRenderingContext2D, s: string, x: number, y: number, size: number, k = 1) => {
	// draw centered text with *orange* spans and a hard pixel outline
	c.font = `${size}px PS2P`; c.textBaseline = 'top'; const parts = s.split('*'); const total = parts.reduce((a, p) => a + c.measureText(p).width, 0); let cx = x - total / 2;
	const shown = Math.floor(s.replace(/\*/g, '').length * k); let n = 0;
	parts.forEach((p, i) => {const vis = p.slice(0, Math.max(0, shown - n)); n += p.length; for (const [dx, dy] of [[-4, 0], [4, 0], [0, -4], [0, 4], [-4, -4], [4, 4], [4, -4], [-4, 4], [0, 6], [3, 6], [-3, 6]]) {c.fillStyle = INK; c.fillText(vis, cx + dx, y + dy);} c.fillStyle = i % 2 ? OR : WH; c.fillText(vis, cx, y); cx += c.measureText(p).width;});
};
const tag = (c: CanvasRenderingContext2D, s: string, px: number, py: number, tx: number, ty: number, k: number) => {
	if (k <= 0) return; c.strokeStyle = WH; c.lineWidth = 4; c.beginPath(); c.moveTo(px, py); c.lineTo(px + (tx - px) * eout(k), py + (ty - py) * eout(k)); c.stroke(); c.fillStyle = OR; c.fillRect(px - 8, py - 8, 16, 16);
	if (k >= 1) {c.font = '26px PS2P'; c.textBaseline = 'middle'; const w = c.measureText(s).width; let x = tx < px ? tx - 10 - w : tx + 10; x = Math.max(24, Math.min(1056 - w, x)); const y = ty + (x < tx && tx >= px ? -36 : 0); c.fillStyle = INK; for (const [dx, dy] of [[-3, 0], [3, 0], [0, -3], [0, 3]]) c.fillText(s, x + dx, y + dy); c.fillStyle = WH; c.fillText(s, x, y);}
};
const overlay = (c: CanvasRenderingContext2D, f: number) => {
	c.clearRect(0, 0, 1080, 1920);
	// handle
	if (logo) {c.save(); c.beginPath(); c.arc(66, 70, 30, 0, Math.PI * 2); c.clip(); c.drawImage(logo, 36, 40, 60, 60); c.restore();}
	c.font = '24px PS2P'; c.textBaseline = 'middle'; c.fillStyle = INK; c.fillText('@thewhydept_', 114, 74); c.fillStyle = WH; c.fillText('@thewhydept_', 110, 70);
	// captions (pop on, type in)
	for (const [a, b, lines, d2 = 999] of CAPS) {
		if (f < a || f >= b) continue;
		lines.forEach((ln, i) => {if (!ln) return; const st = a + (i === 0 ? 0 : d2 === 999 ? 0 : d2) ; if (f < st) return; const k = P(f, st, st + 6); rich(c, ln, 540, 250 + i * 66, 38, k);});
	}
	// hook: light up each POTATO on its firing
	if (f >= 8 && f < 118) {const fires = Math.floor(f / BEAT) * 2 + ((f % BEAT) >= FIRE_B ? 1 : 0); const idx = fires % 3; c.font = '38px PS2P'; const w = c.measureText('POTATO-POTATO-POTATO?').width; const x0 = 540 - w / 2 + idx * c.measureText('POTATO-').width; c.fillStyle = OR; const sf = sinceFire(f); c.save(); c.globalAlpha = 1; c.textBaseline = 'top'; for (const [dx, dy] of [[-4, 0], [4, 0], [0, -4], [0, 4], [0, 6]]) {c.fillStyle = INK; c.fillText('POTATO', x0 + dx, 316 - (sf < 3 ? 8 : 0) + dy);} c.fillStyle = OR; c.fillText('POTATO', x0, 316 - (sf < 3 ? 8 : 0)); c.restore();}
	// 45 deg marker on the bike engine
	if (f >= 140 && f < 180 && road) {const v = new THREE.Vector3(); road.bike.twin.g.getWorldPosition(v); const [ex, ey] = project(v, road.cam); const k = eout(P(f, 140, 150)); c.strokeStyle = OR; c.lineWidth = 8; c.beginPath(); c.moveTo(ex, ey); c.lineTo(ex - Math.sin(0.39) * 330 * k, ey - Math.cos(0.39) * 330 * k); c.moveTo(ex, ey); c.lineTo(ex + Math.sin(0.39) * 330 * k, ey - Math.cos(0.39) * 330 * k); c.stroke(); c.beginPath(); c.arc(ex, ey, 220, -Math.PI / 2 - 0.39 * k, -Math.PI / 2 + 0.39 * k); c.stroke(); if (k >= 1) rich(c, '*45°*', ex, ey - 300, 40);}
	// cutaway labels
	if (cut) {
		const cam = cut.cam; const L = (o: THREE.Object3D) => {const v = new THREE.Vector3(); o.getWorldPosition(v); return project(v, cam);};
		if (f >= 182 && f < 238) {const [x1, y1] = L(cut.twin.parts.piston0); tag(c, 'PISTON A', x1, y1, 150, y1 - 60, P(f, 186, 192)); const [x2, y2] = L(cut.twin.parts.piston1); tag(c, 'PISTON B', x2, y2, 930, y2 - 60, P(f, 196, 202)); const [x3, y3] = L(cut.twin.pin); tag(c, 'CRANKPIN', x3, y3, 900, y3 + 240, P(f, 206, 212));}
		if (f >= 486 && f < 596) {const names: [string, THREE.Object3D, number, number][] = [['CYLINDER A', cut.twin.parts.cyl0, -1, -1], ['CYLINDER B', cut.twin.parts.cyl1, 1, -1], ['FLYWHEEL', cut.twin.parts.fly, -1, 1], ['CRANKPIN', cut.twin.pin, 1, 1]];
			names.forEach(([s, o, sx, sy], i) => {const [x, y] = L(o); const a0 = 480 + i * BEAT + 4; tag(c, s, x, y, x + sx * 170, y + sy * 140, P(f, a0, a0 + 6) * (1 - P(f, 588, 596)));});}
	}
	// slow-motion plaque (bronze) + angle counter
	if (f >= 240 && f < 480) {
		const k = eout(P(f, 240, 250)); c.save(); c.translate(540, 1500); c.scale(k, k);
		c.fillStyle = '#3a2410'; c.fillRect(-250, -86, 500, 172); c.fillStyle = '#c98a2e'; c.fillRect(-238, -74, 476, 148); c.fillStyle = '#7a4c16'; c.fillRect(-226, -62, 452, 124); c.fillStyle = '#e0a848'; c.fillRect(-226, -62, 452, 10);
		c.font = '60px PS2P'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#2a1608'; c.fillText('X1/4', 4, 6); c.fillStyle = '#ffd98a'; c.fillText('X1/4', 0, 0); c.font = '18px PS2P'; c.fillStyle = '#ffd98a'; c.fillText('SLOW MOTION', 0, -46); c.restore(); c.textAlign = 'left';
		if (f < 360) {const m = f % BEAT; const sinceA = m < FIRE_B; const deg = Math.round(sinceA ? (m / BEAT) * 720 : ((m - FIRE_B) / BEAT) * 720); const target = sinceA ? 405 : 315; rich(c, `${deg}°`.padStart(4, ' ') + ` / *${target}°*`, 540, 1340, 40); rich(c, sinceA ? 'A FIRED' : 'B FIRED', 540, 1290, 22);}
	}
	// pulse graph
	if (f >= 360 && f < 480) {
		const rows: [string, number, string][] = [['V-TWIN', FIRE_B, OR]]; if (f >= 420) rows.unshift(['EVEN-FIRE', BEAT / 2, '#9aa6b8']);
		rows.forEach(([name, second, col], ri) => {const y = 1320 - ri * 130 + (f >= 420 ? 130 : 0) - 130 * (rows.length - 1) * 0; const yy = f >= 420 ? (ri === 0 ? 1220 : 1360) : 1340;
			c.font = '22px PS2P'; c.fillStyle = col; c.textBaseline = 'middle'; c.fillText(name, 60, yy - 50); c.fillStyle = 'rgba(255,255,255,0.15)'; c.fillRect(60, yy - 2, 960, 4);
			const pxPerF = 9; for (let k = -6; k <= 6; k++) for (const off of [0, second]) {const ft = (Math.floor(f / BEAT) + k) * BEAT + off; const x = 540 + (ft - f) * pxPerF; if (x < 50 || x > 1030) continue; const age = f - ft; const h = 30 + (age >= 0 && age < 6 ? 40 * (1 - age / 6) : 0); c.fillStyle = col; c.fillRect(x - 8, yy - h, 16, h * 2);}
			void y;
			if (name === 'V-TWIN') {const ft = Math.floor(f / BEAT) * BEAT; const xa = 540 + (ft - f) * pxPerF, xb = xa + FIRE_B * pxPerF, xc = xa + BEAT * pxPerF; c.fillStyle = WH; c.fillRect(xa, yy + 60, xb - xa - 6, 4); c.fillRect(xb + 6, yy + 60, xc - xb - 12, 4); c.font = '18px PS2P'; c.textAlign = 'center'; c.fillText('405°', (xa + xb) / 2, yy + 84); c.fillText('315°', (xb + xc) / 2, yy + 84); c.textAlign = 'left';}
		});
		c.fillStyle = 'rgba(255,174,66,0.6)'; c.fillRect(538, 1120, 4, 330);
	}
	// trademark stamp
	if (f >= 628 && f < 660) {const k = eout(P(f, 628, 634)); c.save(); c.translate(540, 1420); c.rotate(-0.12); c.scale(2 - k, 2 - k); c.globalAlpha = Math.min(1, k * 2); c.strokeStyle = '#ff4a3d'; c.lineWidth = 10; c.strokeRect(-300, -60, 600, 120); c.font = '40px PS2P'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#ff4a3d'; c.fillText('WITHDRAWN', 0, 4); c.restore(); c.textAlign = 'left';}
	// spectrum analyzer on the drop
	if (f >= 660 && f < 790) {const k = P(f, 660, 668) * (1 - P(f, 780, 790)); const {rev} = roadState(f); const sf = sinceFire(f); for (let i = 0; i < 24; i++) {const band = Math.exp(-((i - 9 - rev * 6) ** 2) / 30); const h = (40 + 380 * band * (0.5 + 0.5 * Math.exp(-sf / 3)) + 30 * Math.sin(f * 0.9 + i * 1.7)) * k; const x = 84 + i * 39; for (let y = 0; y < h; y += 18) {c.fillStyle = y > 300 ? '#ff6a3d' : y > 180 ? OR : '#ffd98a'; c.fillRect(x, 1720 - y, 30, 14);}} c.font = '18px PS2P'; c.fillStyle = WH; c.fillText('50 HZ', 84, 1755); c.fillText('500 HZ', 470, 1755); c.fillText('5K', 940, 1755);}
	// riding HUD (gear + rpm), like a dashboard
	const onRoad = f < 180 || f >= 660;
	if (onRoad && f < 660 + 2000) {const {rev} = roadState(f); const gear = f >= 790 && f < 900 ? 2 + Math.floor((f - 790) / BAR) : 1; const rpm = 1000 + rev * 4200 + (pulse(f, BEAT / 2, 2) * 120);
		c.font = '64px PS2P'; c.textBaseline = 'top'; c.fillStyle = INK; c.fillText(String(gear), 64, 1586); c.fillStyle = WH; c.fillText(String(gear), 60, 1582); c.font = '16px PS2P'; c.fillStyle = OR; c.fillText('GEAR', 60, 1556);
		const cells = 14; const lit = Math.round((rpm / 5500) * cells); for (let i = 0; i < cells; i++) {c.fillStyle = i < lit ? (i > 10 ? '#ff4a3d' : i > 7 ? OR : '#7fe08a') : 'rgba(255,255,255,0.15)'; c.fillRect(150 + i * 22, 1600, 16, 34);} c.fillStyle = WH; c.font = '16px PS2P'; c.fillText(`${Math.round(rpm / 10) * 10} RPM`, 150, 1648);}
};

const loadFonts = () => Promise.all([new FontFace('PS2P', `url(${staticFile('fonts/press-start-2p-latin-400-normal.woff2')})`, {unicodeRange: 'U+0000-00FF, U+2000-206F'}), new FontFace('PS2P', `url(${staticFile('fonts/press-start-2p-cyrillic-400-normal.woff2')})`, {unicodeRange: 'U+0400-04FF'})].map((ff) => ff.load().then((l) => {(document.fonts as any).add(l);}))).then(() => new Promise<void>((res) => {logo = new Image(); logo.onload = () => res(); logo.onerror = () => res(); logo.src = staticFile('logo_en_s.png');}));

export const VTwin: React.FC<{at?: number}> = ({at}) => {
	const cur = useCurrentFrame(); const f = at ?? cur % N;
	const cR = useRef<HTMLCanvasElement>(null), cC = useRef<HTMLCanvasElement>(null), cO = useRef<HTMLCanvasElement>(null);
	const [h] = useState(() => delayRender('init')); const [ready, setReady] = useState(false);
	useEffect(() => {loadFonts().then(() => {setReady(true); continueRender(h);});}, [h]);
	const cutO = P(f, 176, 186) * (1 - P(f, 654, 664));
	useEffect(() => {
		if (!ready || !cR.current || !cC.current || !cO.current) return;
		if (!rR) {rR = new THREE.WebGLRenderer({canvas: cR.current, antialias: false, preserveDrawingBuffer: true}); rR.setPixelRatio(1); rR.setSize(PW, PH, false); road = makeRoad();}
		if (!rC) {rC = new THREE.WebGLRenderer({canvas: cC.current, antialias: false, preserveDrawingBuffer: true}); rC.setPixelRatio(1); rC.setSize(PW, PH, false); cut = makeCut();}
		updateRoad(road!, f); rR.render(road!.scene, road!.cam);
		updateCut(cut!, f); rC.render(cut!.scene, cut!.cam);
		overlay(cO.current.getContext('2d')!, f);
	}, [f, ready]);
	void EXPLODE;
	const px: React.CSSProperties = {position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, imageRendering: 'pixelated'};
	return (
		<AbsoluteFill style={{background: '#141a24'}}>
			<canvas ref={cR} width={PW} height={PH} style={px} />
			<canvas ref={cC} width={PW} height={PH} style={{...px, opacity: cutO}} />
			<canvas ref={cO} width={1080} height={1920} style={{...px, imageRendering: 'auto'}} />
		</AbsoluteFill>
	);
};
export const Cover: React.FC = () => (
	<AbsoluteFill>
		<VTwin at={239} />
		<AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(11,15,22,0.92) 0%, rgba(11,15,22,0.55) 38%, rgba(11,15,22,0) 55%)'}} />
		<div style={{position: 'absolute', top: 330, width: 1080, textAlign: 'center', fontFamily: 'PS2P', color: '#f4f1e8', textShadow: '6px 6px 0 #0b0f16, -6px 6px 0 #0b0f16, 6px -6px 0 #0b0f16, -6px -6px 0 #0b0f16', lineHeight: 1.35}}>
			<div style={{display: 'inline-block', background: '#ffae42', color: '#0b0f16', textShadow: 'none', fontSize: 34, padding: '14px 22px', marginBottom: 40}}>DID YOU KNOW?</div>
			<div style={{fontSize: 60}}>WHY IT SAYS</div>
			<div style={{fontSize: 74, color: '#ffae42'}}>POTATO-</div>
			<div style={{fontSize: 74, color: '#ffae42'}}>POTATO</div>
		</div>
	</AbsoluteFill>
);
export const VTwinAudio: React.FC = () => (<AbsoluteFill><VTwin /><Audio src={staticFile('loop.wav')} /></AbsoluteFill>);
