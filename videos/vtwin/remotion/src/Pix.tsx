import React, {useEffect, useRef, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame} from 'remotion';
import {Audio} from '@remotion/media';
import {CH, CW, circ, drawEngine, drawPanels, hatch, poly, rect, snap} from './Cut2D';
import {BEAT, FIRE_B, N, P, eio, eout, pulse, sinceFire} from './timeline';

type C2 = CanvasRenderingContext2D;
const OUT = '#0b0e14', OR = '#ffae42', WH = '#f4f1e8', INK = '#0b0f16';
const D2R = Math.PI / 180;
const theta = (f: number) => (720 * (f >= 645 && f < 660 ? 645 : f)) / BEAT;

// ---------------- bike scene (side view, idling at sunset) ----------------
const ENG = {x: 300, y: 590}; // bike engine crank point (bike space)
const rev = (f: number) => (f >= 660 && f < 780 ? Math.sin(P(f, 660, 780) * Math.PI) : 0);
const SCROLL = (f: number) => (f / N) * 11520; // px per loop; every layer's pattern width divides its share -> seamless
const wrap = (x: number, w: number) => ((x % w) + w) % w;
const drawBikeScene = (c: C2, f: number) => {
	const S = SCROLL(f) * (1 + 0 * rev(f));
	// sky bands + sun
	const sky = c.createLinearGradient(0, 0, 0, 640); [[0, '#2a1b3d'], [0.3, '#4a2a52'], [0.55, '#7a3a5a'], [0.72, '#b5525a'], [0.86, '#e07a52'], [1, '#f5a65a']].forEach(([o, col]) => sky.addColorStop(o as number, col as string)); c.fillStyle = sky; c.fillRect(-400, -400, 1400, 1100);
	circ(c, 360, 520, 120, '#ffd27a', null); for (let k = 0; k < 6; k++) rect(c, 230, 560 + k * 13, 260, 3 + k, '#f5a65a', null);
	// far mesas (0.1x, pattern 576)
	const far = [[0, 640], [60, 560], [130, 560], [170, 600], [260, 600], [300, 545], [380, 545], [420, 600], [576, 640]];
	for (let r = -1; r < 3; r++) {const ox = r * 576 - wrap(S * 0.1, 576) - 100; poly(c, far.map(([x, y]) => [x + ox, y]), '#4a2a52', null);}
	// mid mesas (0.25x, pattern 720)
	const mid = [[0, 640], [80, 612], [120, 586], [200, 586], [240, 622], [420, 610], [470, 578], [560, 578], [600, 616], [720, 640]];
	for (let r = -1; r < 3; r++) {const ox = r * 720 - wrap(S * 0.25, 720) - 100; poly(c, mid.map(([x, y]) => [x + ox, y]), '#7a3a5a', null);}
	// desert ground with streaks (0.75x)
	rect(c, -400, 640, 1400, 60, '#c98a4b', null);
	for (let k = 0; k < 30; k++) {const x = wrap(k * 97 - S * 0.75, 720) - 100; rect(c, x, 648 + ((k * 37) % 46), 8 + (k % 3) * 6, 2, '#a86a3a', null);}
	// cacti (0.75x, pattern 720)
	for (const [cx0, h] of [[60, 70], [330, 50], [560, 84]]) {const x = wrap(cx0 - S * 0.75, 720) - 100; poly(c, [[x, 690], [x, 690 - h], [x + 8, 690 - h - 8], [x + 16, 690 - h], [x + 16, 690]], '#5a3a2a', OUT, 2); poly(c, [[x, 690 - h * 0.5], [x - 14, 690 - h * 0.5], [x - 14, 690 - h * 0.8], [x - 6, 690 - h * 0.8], [x - 6, 690 - h * 0.62], [x, 690 - h * 0.62]], '#5a3a2a', OUT, 2);}
	// road
	rect(c, -400, 700, 1400, 140, '#3a3f4a', null); rect(c, -400, 700, 1400, 4, '#d2d9e4', null); rect(c, -400, 836, 1400, 4, '#d2d9e4', null);
	for (let k = 0; k < 8; k++) rect(c, wrap(k * 120 - S, 960) - 200, 768, 64, 5, '#ffd27a', null);
	for (let k = 0; k < 16; k++) rect(c, wrap(k * 60 + 17 - S, 960) - 200, 720 + ((k * 29) % 100), 10, 2, '#2a2e37', null);
	rect(c, -400, 840, 1400, 400, '#a86a3a', null);
	// roadside posts (1.0x, pattern 360) and near grass tufts (1.4x, pattern 576)
	for (let k = 0; k < 3; k++) {const x = wrap(k * 360 - S, 1080) - 200; rect(c, x, 652, 8, 48, '#d2d9e4', OUT, 2); rect(c, x, 660, 8, 8, '#e25a3a', null);}
	// speed lines in the sky
	for (let k = 0; k < 7; k++) {const y = 380 + ((k * 53) % 220); const x = wrap(k * 210 - S * 2.2, 1200) - 300; c.globalAlpha = 0.35; rect(c, x, y, 120 + (k % 3) * 60, 2, '#ffd27a', null); c.globalAlpha = 1;}
	// ---- bike + rider ----
	const bob = (sinceFire(f) < 2 ? -2 : 0) + Math.sin(f * 2.1) * rev(f) * 2 + Math.round(Math.sin((f / N) * Math.PI * 64));
	c.save(); c.translate(0, bob);
	c.fillStyle = 'rgba(0,0,0,0.35)'; c.beginPath(); c.ellipse(300, 706, 220, 9, 0, 0, Math.PI * 2); c.fill();
	const wa = (f / N) * 344 * (Math.PI / 6);
	const wheel = (x: number) => {circ(c, x, 640, 64, '#16181d'); for (let k = 0; k < 16; k++) {const a = (k / 16) * Math.PI * 2 + wa; rect(c, x + Math.cos(a) * 58 - 2, 640 + Math.sin(a) * 58 - 2, 4, 4, '#2a2e37', null);} circ(c, x, 640, 48, '#2a2e37'); circ(c, x, 640, 44, '#3a3f4a', '#8794ab', 2);
		for (let k = 0; k < 12; k++) {const a = (k / 12) * Math.PI * 2 + wa; c.strokeStyle = '#c9cbd0'; c.lineWidth = 2; c.beginPath(); c.moveTo(x + Math.cos(a) * 8, 640 + Math.sin(a) * 8); c.lineTo(x + Math.cos(a + 0.25) * 44, 640 + Math.sin(a + 0.25) * 44); c.stroke();}
		circ(c, x, 640, 22, 'rgba(0,0,0,0)', '#8794ab', 3); circ(c, x, 640, 10, '#d2d9e4');};
	wheel(140); wheel(462);
	// chain + sprocket + rear shock
	circ(c, 140, 640, 18, '#5a5f66'); c.strokeStyle = '#2a2e37'; c.lineWidth = 4; c.beginPath(); c.moveTo(140, 622); c.lineTo(285, 612); c.moveTo(140, 658); c.lineTo(285, 628); c.stroke();
	c.lineWidth = 12; c.strokeStyle = OUT; c.beginPath(); c.arc(140, 640, 74, Math.PI * 1.05, Math.PI * 1.75); c.stroke(); c.lineWidth = 8; c.strokeStyle = '#d9542b'; c.stroke();
	c.lineWidth = 12; c.strokeStyle = OUT; c.beginPath(); c.arc(462, 640, 74, Math.PI * 1.15, Math.PI * 1.7); c.stroke(); c.lineWidth = 8; c.strokeStyle = '#d9542b'; c.stroke();
	const tube = (pts: number[][], w = 8, col = '#16181d') => {c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (const p of pts.slice(1)) c.lineTo(p[0], p[1]); c.strokeStyle = OUT; c.lineWidth = w + 4; c.stroke(); c.strokeStyle = col; c.lineWidth = w; c.stroke();};
	tube([[140, 640], [230, 600], [380, 630]]); tube([[140, 640], [220, 500], [395, 470]]); tube([[395, 470], [380, 630]]);
	tube([[150, 628], [205, 520]], 7, '#8794ab'); for (let k = 0; k < 6; k++) {const t = k / 6; rect(c, 155 + 46 * t, 610 - 88 * t, 10, 3, '#d2d9e4', null);}
	tube([[462, 640], [404, 452]], 9); c.strokeStyle = '#d2d9e4'; c.lineWidth = 4; c.beginPath(); c.moveTo(460, 634); c.lineTo(406, 458); c.stroke();
	circ(c, 462, 640, 26, 'rgba(0,0,0,0)', '#a9b4c6', 4);
	tube([[404, 452], [384, 414], [352, 404]], 6); circ(c, 432, 470, 20, '#a9b4c6'); circ(c, 438, 470, 13, '#fff1a8'); c.globalAlpha = 0.25; poly(c, [[450, 460], [560, 420], [560, 520], [450, 482]], '#fff1a8', null); c.globalAlpha = 1;
	tube([[394, 412], [404, 384]], 3, '#a9b4c6'); poly(c, [[398, 376], [414, 380], [410, 392], [396, 388]], '#d2d9e4', OUT, 2);
	// engine
	poly(c, [[262, 566], [338, 566], [352, 615], [318, 642], [278, 642], [248, 612]], '#66738c', OUT, 3); circ(c, 300, 606, 16, '#a9b4c6');
	for (const phi of [22.5, -22.5]) {c.save(); c.translate(ENG.x, ENG.y); c.rotate(-phi * D2R); for (let k = 0; k < 7; k++) rect(c, -21 + (k % 2), -30 - k * 7, 42 - (k % 2) * 2, 5, k % 2 ? '#a9b4c6' : '#8794ab', OUT, 1.5); rect(c, -18, -83, 36, 13, '#d2d9e4', OUT, 2); rect(c, -14, -92, 28, 9, '#8794ab', OUT, 2); c.restore();}
	// air cleaner (round chrome) on the right side
	circ(c, 318, 548, 15, '#c9cbd0'); circ(c, 318, 548, 7, '#8794ab', null);
	// tank + badge + seat
	c.beginPath(); c.moveTo(250, 482); c.bezierCurveTo(270, 440, 370, 430, 398, 462); c.bezierCurveTo(400, 490, 300, 500, 250, 482); c.closePath(); c.fillStyle = '#d9542b'; c.fill(); c.strokeStyle = OUT; c.lineWidth = 3; c.stroke();
	c.beginPath(); c.moveTo(270, 456); c.bezierCurveTo(300, 446, 350, 444, 380, 452); c.strokeStyle = '#ff7a4a'; c.lineWidth = 5; c.stroke(); poly(c, [[312, 466], [342, 464], [340, 476], [312, 478]], '#d2d9e4', OUT, 1.5);
	c.beginPath(); c.moveTo(160, 498); c.quadraticCurveTo(200, 470, 255, 482); c.lineTo(250, 500); c.quadraticCurveTo(200, 500, 165, 510); c.closePath(); c.fillStyle = '#16181d'; c.fill(); c.strokeStyle = OUT; c.lineWidth = 3; c.stroke();
	// exhaust pipes
	for (const [dy, i] of [[0, 0], [12, 1]]) {c.lineCap = 'round'; c.beginPath(); c.moveTo(i ? 350 : 262, i ? 520 : 522); c.quadraticCurveTo(i ? 372 : 238, 652 + dy, 250 + (i ? 30 : 0), 664 + dy); c.lineTo(80, 652 + dy); c.strokeStyle = OUT; c.lineWidth = 14; c.stroke(); c.strokeStyle = '#c9cbd0'; c.lineWidth = 9; c.stroke(); c.strokeStyle = '#f2f4f7'; c.lineWidth = 2; c.stroke();}
	// rider: boots, jeans, leather jacket, gloves, helmet with visor
	poly(c, [[270, 600], [296, 600], [300, 612], [266, 614]], '#16181d', OUT, 2);                                  // boot on peg
	c.lineCap = 'round'; c.strokeStyle = OUT; c.lineWidth = 26; c.beginPath(); c.moveTo(214, 480); c.lineTo(282, 520); c.lineTo(282, 596); c.stroke(); c.strokeStyle = '#2b5bb5'; c.lineWidth = 20; c.stroke(); c.strokeStyle = '#3f7be0'; c.lineWidth = 4; c.beginPath(); c.moveTo(220, 472); c.lineTo(280, 508); c.stroke();
	c.beginPath(); c.moveTo(196, 478); c.bezierCurveTo(190, 430, 220, 380, 262, 372); c.lineTo(290, 384); c.bezierCurveTo(276, 420, 250, 460, 236, 488); c.closePath(); c.fillStyle = '#6b4a2b'; c.fill(); c.strokeStyle = OUT; c.lineWidth = 3; c.stroke(); // torso
	c.strokeStyle = '#9a6a3a'; c.lineWidth = 3; c.beginPath(); c.moveTo(214, 430); c.bezierCurveTo(222, 404, 240, 388, 262, 380); c.stroke();
	c.strokeStyle = OUT; c.lineWidth = 18; c.beginPath(); c.moveTo(262, 392); c.lineTo(318, 412); c.lineTo(350, 406); c.stroke(); c.strokeStyle = '#6b4a2b'; c.lineWidth = 13; c.stroke(); // arm
	circ(c, 352, 405, 9, '#16181d');                                                                                // glove
	circ(c, 272, 348, 30, '#16181d'); c.beginPath(); c.arc(272, 348, 30, -0.5, 0.75); c.lineTo(272, 348); c.closePath(); c.fillStyle = '#2b5bb5'; c.fill(); poly(c, [[288, 336], [300, 344], [296, 352]], '#7fb2ff', null); circ(c, 272, 348, 30, 'rgba(0,0,0,0)', OUT, 3);
	c.strokeStyle = '#e25a3a'; c.lineWidth = 4; c.beginPath(); c.arc(272, 348, 22, Math.PI * 1.1, Math.PI * 1.55); c.stroke();
	c.restore();
	// exhaust trail + shock rings (exit ~ x 74, y 657)
	for (let k = 0; k < 6; k++) {const fire = Math.floor(f / BEAT) - Math.floor(k / 2); const ft = fire * BEAT + (k % 2 ? FIRE_B : 0); const age = f - ft; if (age < 0 || age > 22) continue; const big = 1 + rev(f) * 1.5; const x = 70 - age * 9 * big, y = 655 - age * 0.6; c.globalAlpha = 1 - age / 22; circ(c, x, y, (4 + age * 1.1) * big, '#8a8f97', null); circ(c, x - 2, y - 2, (2 + age * 0.6) * big, '#c9cbd0', null); c.globalAlpha = 1;
		if (f >= 640 && f < 800 && age < 14) {c.strokeStyle = '#ffc04a'; c.lineWidth = 3; c.globalAlpha = 1 - age / 14; c.beginPath(); c.ellipse(74 - age * 4, 657, 6 + age * 6, 10 + age * 8, 0, 0, Math.PI * 2); c.stroke(); c.globalAlpha = 1;}}
	// dust kicked by the rear tyre
	for (let k = 0; k < 8; k++) {const age = ((f + k * 3) % 24); const x = 100 - age * 7, y = 700 - Math.sin(age / 24 * Math.PI) * 14; c.globalAlpha = 0.5 * (1 - age / 24); rect(c, x, y, 6, 4, '#c98a4b', null); c.globalAlpha = 1;}
};

// ---------------- cameras ----------------
type Cam = {x: number; y: number; z: number};
const keyed = (f: number, keys: [number, number, number, number][], dur = 8): Cam => {
	let cur = keys[0]; let prev = keys[0];
	for (const k of keys) {if (f >= k[0]) {prev = cur; cur = k;}}
	const t = eio(P(f, cur[0], cur[0] + dur)); return {x: prev[1] + (cur[1] - prev[1]) * t, y: prev[2] + (cur[2] - prev[2]) * t, z: prev[3] + (cur[3] - prev[3]) * t};
};
const HEADA = {x: 107, y: 260}, HEADB = {x: 433, y: 260}, CRANK = {x: 270, y: 640};
const engCam = (f: number): Cam => keyed(f, [[0, 270, 640, 1.8], [180, 270, 640, 1.8], [190, 270, 470, 0.86], [270, HEADA.x + 40, HEADA.y + 30, 1.9], [300, CRANK.x, CRANK.y - 40, 1.7], [330, HEADB.x - 40, HEADB.y + 30, 1.9], [360, 270, 470, 0.86], [420, 270, 560, 0.74], [480, 380, 360, 1.55], [540, 270, 470, 0.86]], 10);
const bikeCam = (f: number): Cam => {
	const base = {x: 300 + Math.sin((f / N) * Math.PI * 2) * 8, y: 520, z: 1.0};
	if (f >= 120 && f < 190) {const k = eio(Math.min(1, (Math.floor((f - 120) / BEAT) + eout(P((f - 120) % BEAT, 0, 6))) / 4)); return {x: base.x + (ENG.x - base.x) * k, y: base.y + (ENG.y - 60 - base.y) * k, z: 1 + 2.2 * k};}
	if (f >= 660 && f < 690) {const k = 1 - eio(P(f, 656, 690)); return {x: base.x + (ENG.x - base.x) * k, y: base.y + (ENG.y - 60 - base.y) * k, z: 1 + 2.2 * k};}
	return base;
};
const applyCam = (c: C2, cam: Cam, bump = 0) => {c.setTransform(1, 0, 0, 1, 0, 0); c.translate(CW / 2, CH / 2); c.scale(cam.z * (1 + bump), cam.z * (1 + bump)); c.translate(-cam.x, -cam.y);};
const toScreen = (p: {x: number; y: number}, cam: Cam) => [((p.x - cam.x) * cam.z + CW / 2) * 2, ((p.y - cam.y) * cam.z + CH / 2) * 2];
// local point of a cylinder (phi deg) -> engine space
const eng = (phi: number, lx: number, ly: number) => {const a = -phi * D2R; return {x: CRANK.x + lx * Math.cos(a) - ly * Math.sin(a), y: CRANK.y + lx * Math.sin(a) + ly * Math.cos(a)};};

// ---------------- overlay (full-res text/HUD) ----------------
type Cap = [number, number, string[], number?];
const CAPS: Cap[] = [
	[0, 118, ['WHY DOES THIS ENGINE SAY', 'POTATO-POTATO-POTATO?']],
	[122, 178, ['IT\'S A *V-TWIN*:', 'TWO CYLINDERS AT *45°*'], 15],
	[190, 238, ['TWO PISTONS.', '*ONE* SHARED CRANKPIN'], 18],
	[242, 298, ['*BANG*... THEN TURN *405°*']],
	[300, 358, ['*BANG*... THEN TURN *315°*', 'AND REPEAT'], 30],
	[362, 418, ['EACH CYLINDER:', '*SUCK, SQUEEZE, BANG, BLOW*'], 15],
	[422, 478, ['MOST ENGINES FIRE *EVENLY*', 'THIS ONE *LIMPS*'], 28],
	[482, 538, ['CAM, PUSHROD, ROCKER:', 'THE *VALVES* KEEP THE BEAT'], 30],
	[542, 598, ['*1994*: HARLEY-DAVIDSON', 'TRIED TO TRADEMARK', 'THE SOUND'], 0],
	[602, 644, ['RIVALS: EVERY V-TWIN', 'SOUNDS LIKE *THIS*'], 0],
	[625, 644, ['', '', '*2000*: THEY GAVE UP'], 0],
	[662, 718, ['THAT *LIMP*']],
	[720, 778, ['THAT *LIMP*', 'IS THE SOUND.'], 0],
];
const rich = (c: C2, s: string, x: number, y: number, size: number, k = 1, align: 'center' | 'left' = 'center') => {
	c.font = `${size}px PS2P`; c.textBaseline = 'top'; c.textAlign = 'left'; const parts = s.split('*'); const total = parts.reduce((a, p) => a + c.measureText(p).width, 0); let cx = align === 'center' ? x - total / 2 : x;
	const shown = Math.floor(s.replace(/\*/g, '').length * k); let n = 0;
	parts.forEach((p, i) => {const vis = p.slice(0, Math.max(0, shown - n)); n += p.length; for (const [dx, dy] of [[-4, 0], [4, 0], [0, -4], [0, 4], [-4, -4], [4, 4], [4, -4], [-4, 4], [0, 6], [3, 6], [-3, 6]]) {c.fillStyle = INK; c.fillText(vis, cx + dx, y + dy);} c.fillStyle = i % 2 ? OR : WH; c.fillText(vis, cx, y); cx += c.measureText(p).width;});
};
const tag = (c: C2, s: string, px: number, py: number, tx: number, ty: number, k: number, col = WH) => {
	if (k <= 0) return; c.strokeStyle = INK; c.lineWidth = 8; c.beginPath(); c.moveTo(px, py); c.lineTo(px + (tx - px) * eout(k), py + (ty - py) * eout(k)); c.stroke(); c.strokeStyle = WH; c.lineWidth = 4; c.stroke(); c.fillStyle = INK; c.fillRect(px - 10, py - 10, 20, 20); c.fillStyle = OR; c.fillRect(px - 6, py - 6, 12, 12);
	if (k >= 1) {c.font = '26px PS2P'; c.textBaseline = 'middle'; const w = c.measureText(s).width; let x = tx < px ? tx - 12 - w : tx + 12; x = Math.max(24, Math.min(1056 - w, x)); c.fillStyle = INK; for (const [dx, dy] of [[-4, 0], [4, 0], [0, -4], [0, 4], [0, 5]]) c.fillText(s, x + dx, ty + dy); c.fillStyle = col; c.fillText(s, x, ty);}
};
let logo: HTMLImageElement | null = null;
const PHASE = (local: number) => (local < 180 ? ['BANG', '#ffc04a'] : local < 360 ? ['BLOW', '#c9cbd0'] : local < 540 ? ['SUCK', '#7fb2ff'] : ['SQUEEZE', '#3f7be0']);
const overlay = (c: C2, f: number, inside: boolean, cam: Cam) => {
	c.clearRect(0, 0, 1080, 1920);
	if (logo) {c.save(); c.beginPath(); c.arc(66, 70, 30, 0, Math.PI * 2); c.clip(); c.drawImage(logo, 36, 40, 60, 60); c.restore();}
	c.font = '24px PS2P'; c.textBaseline = 'middle'; c.textAlign = 'left'; c.fillStyle = INK; c.fillText('@thewhydept_', 114, 74); c.fillStyle = WH; c.fillText('@thewhydept_', 110, 70);
	for (const [a, b, lines, d2 = 999] of CAPS) {if (f < a || f >= b) continue; lines.forEach((ln, i) => {if (!ln) return; const st = a + (i === 0 || d2 === 999 ? 0 : d2); if (f < st) return; rich(c, ln, 540, 250 + i * 66, 38, P(f, st, st + 6));});}
	if (f >= 8 && f < 118) {const fires = Math.floor(f / BEAT) * 2 + ((f % BEAT) >= FIRE_B ? 1 : 0); const idx = fires % 3; c.font = '38px PS2P'; const w = c.measureText('POTATO-POTATO-POTATO?').width; const x0 = 540 - w / 2 + idx * c.measureText('POTATO-').width; const lift = sinceFire(f) < 3 ? 8 : 0; c.textBaseline = 'top'; for (const [dx, dy] of [[-4, 0], [4, 0], [0, -4], [0, 4], [0, 6]]) {c.fillStyle = INK; c.fillText('POTATO', x0 + dx, 316 - lift + dy);} c.fillStyle = OR; c.fillText('POTATO', x0, 316 - lift);}
	if (!inside && f >= 140 && f < 186) {const [ex, ey] = toScreen(ENG, cam); const k = eout(P(f, 142, 152)); c.strokeStyle = OR; c.lineWidth = 8; const L = 150 * cam.z; c.beginPath(); c.moveTo(ex, ey); c.lineTo(ex - Math.sin(0.39) * L * k, ey - Math.cos(0.39) * L * k); c.moveTo(ex, ey); c.lineTo(ex + Math.sin(0.39) * L * k, ey - Math.cos(0.39) * L * k); c.stroke(); c.beginPath(); c.arc(ex, ey, L * 0.7, -Math.PI / 2 - 0.39 * k, -Math.PI / 2 + 0.39 * k); c.stroke(); if (k >= 1) rich(c, '*45°*', ex, ey - L - 70, 40);}
	if (inside) {
		const th = theta(f); const R = 62; const al = (22.5 - th) * D2R; const pin = {x: CRANK.x - Math.sin(al) * R, y: CRANK.y - Math.cos(al) * R};
		if (f >= 196 && f < 238) {const pa = eng(22.5, 0, -300), pb = eng(-22.5, 0, -300); const [ax, ay] = toScreen(pa, cam), [bx, by] = toScreen(pb, cam), [cx, cy] = toScreen(pin, cam); tag(c, 'PISTON A', ax, ay, 120, ay + 120, P(f, 196, 202)); tag(c, 'PISTON B', bx, by, 960, by + 120, P(f, 204, 210)); tag(c, 'CRANKPIN', cx, cy, 880, cy + 260, P(f, 212, 218), OR);}
		if (f >= 362 && f < 418) for (const [phi, off, side] of [[22.5, 0, -1], [-22.5, 405, 1]] as [number, number, number][]) {const local = (((th - off) % 720) + 720) % 720; const [name, col] = PHASE(local); const p = eng(phi, 0, -380); const [x, y] = toScreen(p, cam); tag(c, name, x, y, x + side * 120, y - 150, P(f, 366, 372), col);}
		if (f >= 486 && f < 540) {const B = -22.5; const pts: [string, {x: number; y: number}, number, number][] = [['CAM', {x: CRANK.x + 140, y: CRANK.y + 110}, -260, 80], ['PUSHROD', eng(B, 110, -240), 200, 40], ['ROCKER', eng(B, 42, -506), 200, -60], ['SPRING', eng(B, 24, -460), -260, -40], ['VALVE', eng(B, 24, -372), -260, 60]]; pts.forEach(([s, p, dx, dy], i) => {const [x, y] = toScreen(p, cam); tag(c, s, x, y, x + dx, y + dy, P(f, 486 + i * 9, 492 + i * 9), i === 0 ? OR : WH);});}
	}
	if (f >= 240 && f < 360) {const k = eout(P(f, 240, 250)); c.save(); c.translate(540, 1600); c.scale(k, k); c.fillStyle = '#3a2410'; c.fillRect(-250, -86, 500, 172); c.fillStyle = '#c98a2e'; c.fillRect(-238, -74, 476, 148); c.fillStyle = '#7a4c16'; c.fillRect(-226, -62, 452, 124); c.fillStyle = '#e0a848'; c.fillRect(-226, -62, 452, 10); c.font = '60px PS2P'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#2a1608'; c.fillText('X1/4', 4, 6); c.fillStyle = '#ffd98a'; c.fillText('X1/4', 0, 0); c.font = '18px PS2P'; c.fillText('SLOW MOTION', 0, -46); c.restore(); c.textAlign = 'left';
		const m = f % BEAT; const sinceA = m < FIRE_B; const deg = Math.round(sinceA ? (m / BEAT) * 720 : ((m - FIRE_B) / BEAT) * 720); rich(c, `${deg}°`.padStart(4, ' ') + ` / *${sinceA ? 405 : 315}°*`, 540, 1420, 44); rich(c, sinceA ? 'SINCE A FIRED' : 'SINCE B FIRED', 540, 1370, 22);}
	if (f >= 420 && f < 480) {[['EVEN-FIRE', BEAT / 2, '#9aa6b8', 1480], ['V-TWIN', FIRE_B, OR, 1660]].forEach(([name, second, col, yy]) => {const Y = yy as number; c.font = '22px PS2P'; c.fillStyle = col as string; c.textBaseline = 'middle'; c.fillText(name as string, 60, Y - 56); c.fillStyle = 'rgba(255,255,255,0.15)'; c.fillRect(60, Y - 2, 960, 4); for (let k = -6; k <= 6; k++) for (const off of [0, second as number]) {const ft = (Math.floor(f / BEAT) + k) * BEAT + off; const x = 540 + (ft - f) * 9; if (x < 50 || x > 1030) continue; const age = f - ft; const h = 30 + (age >= 0 && age < 6 ? 40 * (1 - age / 6) : 0); c.fillStyle = col as string; c.fillRect(x - 8, Y - h, 16, h * 2);}}); c.fillStyle = 'rgba(255,174,66,0.7)'; c.fillRect(538, 1400, 4, 330);}
	if (f >= 628 && f < 660) {const k = eout(P(f, 628, 634)); c.save(); c.translate(540, 1560); c.rotate(-0.12); c.scale(2 - k, 2 - k); c.globalAlpha = Math.min(1, k * 2); c.strokeStyle = '#ff4a3d'; c.lineWidth = 10; c.strokeRect(-300, -60, 600, 120); c.font = '40px PS2P'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#ff4a3d'; c.fillText('WITHDRAWN', 0, 4); c.restore(); c.textAlign = 'left';}
	if (f >= 660 && f < 790) {const k = P(f, 660, 668) * (1 - P(f, 780, 790)); const sf = sinceFire(f); for (let i = 0; i < 24; i++) {const band = Math.exp(-((i - 9 - rev(f) * 6) ** 2) / 30); const h = (40 + 380 * band * (0.5 + 0.5 * Math.exp(-sf / 3)) + 30 * Math.sin(f * 0.9 + i * 1.7)) * k; const x = 84 + i * 39; for (let y = 0; y < h; y += 18) {c.fillStyle = y > 300 ? '#ff6a3d' : y > 180 ? OR : '#ffd98a'; c.fillRect(x, 1840 - y, 30, 14);}}}
	if (!inside) {const rpm = 1000 + rev(f) * 4200 + pulse(f, BEAT / 2, 2) * 120; c.font = '16px PS2P'; c.textBaseline = 'top'; c.fillStyle = OR; c.fillText('RPM', 60, 1556); const lit = Math.round((rpm / 5500) * 14); for (let i = 0; i < 14; i++) {c.fillStyle = i < lit ? (i > 10 ? '#ff4a3d' : i > 7 ? OR : '#7fe08a') : 'rgba(255,255,255,0.15)'; c.fillRect(60 + i * 22, 1582, 16, 34);} c.fillStyle = WH; c.fillText(`${Math.round(rpm / 10) * 10}`, 60, 1630);}
};

const loadFonts = () => Promise.all([new FontFace('PS2P', `url(${staticFile('fonts/press-start-2p-latin-400-normal.woff2')})`, {unicodeRange: 'U+0000-00FF, U+2000-206F'})].map((ff) => ff.load().then((l) => {(document.fonts as any).add(l);}))).then(() => new Promise<void>((res) => {logo = new Image(); logo.onload = () => res(); logo.onerror = () => res(); logo.src = staticFile('logo_en_s.png');}));
export const PixTwin: React.FC<{at?: number}> = ({at}) => {
	const cur = useCurrentFrame(); const f = at ?? cur % N; const ref = useRef<HTMLCanvasElement>(null), refO = useRef<HTMLCanvasElement>(null), tmp = useRef<HTMLCanvasElement | null>(null);
	const [h] = useState(() => delayRender('fonts')); const [ready, setReady] = useState(false);
	useEffect(() => {loadFonts().then(() => {setReady(true); continueRender(h);});}, [h]);
	useEffect(() => {
		if (!ready || !ref.current || !refO.current) return;
		const c = ref.current.getContext('2d', {willReadFrequently: true})!; const bump = pulse(f, BEAT, 3.5) * 0.01;
		const cutW = P(f, 180, 190) * (1 - P(f, 654, 664));
		const bc = bikeCam(f), ec = engCam(f);
		if (cutW < 1) {applyCam(c, bc, bump); drawBikeScene(c, f);}
		if (cutW > 0) {
			if (!tmp.current) {tmp.current = document.createElement('canvas'); tmp.current.width = CW; tmp.current.height = CH;}
			const t2 = tmp.current.getContext('2d')!; applyCam(t2, ec, bump); drawPanels(t2); drawEngine(t2, theta(f), f);
			c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = cutW; c.drawImage(tmp.current, 0, 0); c.globalAlpha = 1;
		}
		c.setTransform(1, 0, 0, 1, 0, 0); snap(c);
		overlay(refO.current.getContext('2d')!, f, cutW >= 0.5, cutW >= 0.5 ? ec : bc);
	}, [f, ready]);
	const px: React.CSSProperties = {position: 'absolute', left: 0, top: 0, width: 1080, height: 1920};
	void hatch; void poly; void rect;
	return (
		<AbsoluteFill style={{background: '#121722'}}>
			<canvas ref={ref} width={CW} height={CH} style={{...px, imageRendering: 'pixelated'}} />
			<canvas ref={refO} width={1080} height={1920} style={px} />
		</AbsoluteFill>
	);
};
export const PixTwinAudio: React.FC = () => (<AbsoluteFill><PixTwin /><Audio src={staticFile('loop.wav')} /></AbsoluteFill>);
export const PixCover: React.FC = () => (
	<AbsoluteFill>
		<PixTwin at={252} />
		<AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(11,15,22,0.95) 0%, rgba(11,15,22,0.6) 36%, rgba(11,15,22,0) 52%)'}} />
		<div style={{position: 'absolute', top: 300, width: 1080, textAlign: 'center', fontFamily: 'PS2P', color: '#f4f1e8', textShadow: '6px 6px 0 #0b0f16, -6px 6px 0 #0b0f16, 6px -6px 0 #0b0f16, -6px -6px 0 #0b0f16', lineHeight: 1.35}}>
			<div style={{display: 'inline-block', background: '#ffae42', color: '#0b0f16', textShadow: 'none', fontSize: 34, padding: '14px 22px', marginBottom: 40}}>DID YOU KNOW?</div>
			<div style={{fontSize: 60}}>WHY IT SAYS</div>
			<div style={{fontSize: 74, color: '#ffae42'}}>POTATO-</div>
			<div style={{fontSize: 74, color: '#ffae42'}}>POTATO</div>
		</div>
	</AbsoluteFill>
);
