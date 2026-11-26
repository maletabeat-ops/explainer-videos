import React, {useEffect, useRef, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame} from 'remotion';
import {BEAT, N, T, pulse} from './timeline';
import {STR} from './strings';

// Pipeline: draw smooth vector art at 1080x1920 (scene units = 270x480, scale 4) -> downsample to 270x480
// -> posterize with ordered dithering (pixel-art look) -> crisp pixel text/HUD -> upscale x4 nearest.
export const W = 270, H = 480, K = 4;
type C2 = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
type Lang = 'ru' | 'en';
const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const P = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const eio = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const eout = (k: number) => 1 - Math.pow(1 - k, 3);
const hash = (n: number) => {const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s);};
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);
const BG = '#11181b', GRID = '#1b272b', INK = '#0c1012', TXT = '#f4f1e8';
export type Style = 'pixel' | 'flat' | 'paper';
let STYLE: Style = 'pixel';

// ---------------- vector helpers (scene units) ----------------
const circle = (c: C2, x: number, y: number, r: number) => {c.beginPath(); c.arc(x, y, Math.max(0.01, r), 0, Math.PI * 2);};
const ellipse = (c: C2, x: number, y: number, rx: number, ry: number, rot = 0) => {c.beginPath(); c.ellipse(x, y, Math.max(0.01, rx), Math.max(0.01, ry), rot, 0, Math.PI * 2);};
const radial = (c: C2, x: number, y: number, r: number, stops: [number, string][]) => {const g = c.createRadialGradient(x, y, 0, x, y, r); stops.forEach(([o, col]) => g.addColorStop(o, col)); return g;};
const linear = (c: C2, x0: number, y0: number, x1: number, y1: number, stops: [number, string][]) => {const g = c.createLinearGradient(x0, y0, x1, y1); stops.forEach(([o, col]) => g.addColorStop(o, col)); return g;};
const stroke = (c: C2, pts: number[][], col: string, w: number) => {c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length - 1; i++) {const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2; c.quadraticCurveTo(pts[i][0], pts[i][1], mx, my);} const l = pts[pts.length - 1]; c.lineTo(l[0], l[1]); c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round'; c.stroke();};

const grid = (c: C2) => {const sh = c.shadowColor; c.shadowColor = 'transparent'; c.fillStyle = STYLE === 'paper' ? '#1d2a2e' : BG; c.fillRect(-200, -200, W + 400, H + 400); c.fillStyle = GRID; for (let x = -192; x < W + 200; x += 16) c.fillRect(x, -200, 0.5, H + 400); for (let y = -200; y < H + 200; y += 16) c.fillRect(-200, y, W + 400, 0.5); c.shadowColor = sh;};

// ---------------- the arm (back of the left forearm + hand, top-down) ----------------
const armPath = (c: C2, dx = 0, dy = 0) => {
	c.beginPath();
	const p = (x: number, y: number) => [x + dx, y + dy] as const;
	c.moveTo(...p(84, 490));
	c.bezierCurveTo(...p(86, 400), ...p(92, 300), ...p(100, 205));   // left edge of forearm up to wrist
	c.bezierCurveTo(...p(101, 192), ...p(97, 182), ...p(93, 168));   // wrist -> base of thumb
	c.bezierCurveTo(...p(78, 152), ...p(62, 128), ...p(58, 112));    // thumb outer edge
	c.bezierCurveTo(...p(55, 102), ...p(62, 97), ...p(69, 103));     // thumb tip
	c.bezierCurveTo(...p(78, 114), ...p(88, 124), ...p(95, 126));    // thumb inner edge back to hand
	c.bezierCurveTo(...p(96, 110), ...p(96, 90), ...p(98, 70));      // index finger outer
	c.bezierCurveTo(...p(99, 42), ...p(100, 22), ...p(102, 10));
	c.bezierCurveTo(...p(104, -2), ...p(118, -2), ...p(119, 10));    // index tip
	c.bezierCurveTo(...p(120, 30), ...p(121, 52), ...p(122, 58));
	c.bezierCurveTo(...p(122, 30), ...p(124, 6), ...p(127, -6));     // middle finger
	c.bezierCurveTo(...p(129, -18), ...p(144, -18), ...p(145, -6));
	c.bezierCurveTo(...p(146, 20), ...p(146, 46), ...p(147, 56));
	c.bezierCurveTo(...p(148, 34), ...p(150, 12), ...p(152, 2));     // ring finger
	c.bezierCurveTo(...p(154, -10), ...p(169, -9), ...p(169, 4));
	c.bezierCurveTo(...p(169, 28), ...p(170, 50), ...p(171, 64));
	c.bezierCurveTo(...p(173, 50), ...p(175, 36), ...p(177, 30));    // little finger
	c.bezierCurveTo(...p(180, 20), ...p(192, 22), ...p(192, 34));
	c.bezierCurveTo(...p(192, 70), ...p(190, 110), ...p(186, 140));  // outer edge of hand
	c.bezierCurveTo(...p(183, 165), ...p(176, 185), ...p(174, 205)); // wrist (ulna side)
	c.bezierCurveTo(...p(178, 300), ...p(186, 400), ...p(190, 490));
	c.closePath();
};
const drawArm = (c: C2) => {
	// soft cast shadow
	c.save(); c.filter = 'blur(6px)'; c.fillStyle = 'rgba(0,0,0,0.55)'; armPath(c, 12, 10); c.fill(); c.restore();
	c.save(); armPath(c); c.clip();
	// base + cylindrical lighting across the arm
	c.fillStyle = linear(c, 70, 0, 200, 0, [[0, '#d88d6e'], [0.16, '#f3c3a3'], [0.38, '#f7cfb2'], [0.62, '#eeb594'], [0.85, '#d99476'], [1, '#b86e55']]); c.fillRect(0, -40, W, H + 80);
	// hand slightly lighter on top + finger separations and shading
	const fingers = [[110, 4, 58], [136, -10, 56], [160, -2, 64], [183, 28, 70]];
	for (const [x, top, base] of fingers) {c.fillStyle = linear(c, x - 10, 0, x + 10, 0, [[0, 'rgba(160,80,60,0.35)'], [0.3, 'rgba(255,230,210,0.25)'], [0.7, 'rgba(255,230,210,0.05)'], [1, 'rgba(150,70,50,0.35)']]); c.fillRect(x - 11, top - 10, 22, base - top + 14);}
	// knuckles (soft bumps) and joint creases
	for (const [x, , base] of fingers) {c.fillStyle = radial(c, x, base + 10, 9, [[0, 'rgba(255,235,220,0.55)'], [1, 'rgba(255,235,220,0)']]); circle(c, x, base + 10, 9); c.fill();
		for (const dy of [-18, -38]) {stroke(c, [[x - 5, base + dy], [x, base + dy + 1.5], [x + 5, base + dy]], 'rgba(150,80,60,0.55)', 0.9); stroke(c, [[x - 4, base + dy + 1.6], [x + 4, base + dy + 1.6]], 'rgba(255,225,205,0.5)', 0.7);}}
	// extensor tendons fanning to the fingers
	for (const [x, , base] of fingers) stroke(c, [[x, base + 14], [x * 0.55 + 140 * 0.45, 120], [137 + (x - 147) * 0.15, 168]], 'rgba(255,228,205,0.35)', 2.2);
	// veins
	stroke(c, [[150, 175], [158, 150], [150, 120], [158, 96]], 'rgba(150,120,160,0.28)', 2.2); stroke(c, [[120, 200], [117, 260], [124, 330], [118, 420]], 'rgba(150,120,160,0.18)', 2.6);
	// wrist creases
	stroke(c, [[104, 200], [130, 204], [168, 200]], 'rgba(160,85,65,0.45)', 0.9); stroke(c, [[106, 206], [134, 210], [166, 206]], 'rgba(160,85,65,0.3)', 0.8);
	// forearm highlight & ulna bump
	c.fillStyle = radial(c, 112, 330, 60, [[0, 'rgba(255,240,228,0.35)'], [1, 'rgba(255,240,228,0)']]); ellipse(c, 112, 330, 16, 120); c.fill();
	c.fillStyle = radial(c, 168, 214, 10, [[0, 'rgba(255,230,210,0.5)'], [1, 'rgba(255,230,210,0)']]); circle(c, 168, 214, 10); c.fill();
	c.restore();
	// nails
	const nails = [[110.5, 4, -0.02], [136.2, -9, 0], [160.5, -1, 0.02], [184.5, 30, 0.06]];
	for (const [x, y, r] of nails) {c.fillStyle = linear(c, x, y, x, y + 14, [[0, '#f6e0da'], [1, '#e3b3a8']]); ellipse(c, x, y + 7, 5.2, 7.5, r); c.fill(); c.strokeStyle = 'rgba(150,80,65,0.7)'; c.lineWidth = 0.8; c.stroke(); c.fillStyle = 'rgba(255,255,255,0.7)'; ellipse(c, x - 1.8, y + 4, 1.2, 2.6, r); c.fill();}
	c.fillStyle = '#f0d6cf'; ellipse(c, 63.5, 104, 4.5, 5.5, 0.9); c.fill(); c.strokeStyle = 'rgba(150,80,65,0.7)'; c.stroke();
	// outline
	armPath(c); c.strokeStyle = '#8a4636'; c.lineWidth = 1.3; c.stroke();
};

// ---------------- mosquito (vector, local units, head at origin, body along +x) ----------------
const MANG = -0.62; // body tilt (tail up-right)
const rot = (x: number, y: number, a: number) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
const tipLocal = [-19, 8];
const mosquito = (c: C2, x: number, y: number, s: number, f: number, flying: boolean, fill: number, legsDown = 1) => {
	c.save(); c.translate(x, y); c.scale(s, s); c.rotate(MANG);
	const lw = 0.55;
	// legs (jointed, white bands)
	const legs: number[][][] = [
		[[4, 1.5], [0, 8], [-6, 14 * legsDown + 4], [-12, 18 * legsDown + 6]],
		[[6, 2], [5, 10], [2, 18 * legsDown + 2], [0, 24 * legsDown + 2]],
		[[8, 1.5], [14, 9], [18, 17 * legsDown], [24, 22 * legsDown]],
		[[5, -1], [2, -8], [-4, -10], [-10, -9]],
		[[7, -1.5], [12, -9], [20, -12], [26, -10]],
		[[8, 2], [18, 4], [28, 12 * legsDown], [34, 18 * legsDown]],
	];
	for (const l of legs) {stroke(c, l, '#1e1816', lw * 1.5); for (let i = 2; i < l.length; i++) {const [ax, ay] = l[i - 1], [bx, by] = l[i]; const k = 0.08; stroke(c, [[ax + (bx - ax) * 0.02, ay + (by - ay) * 0.02], [ax + (bx - ax) * (0.02 + k), ay + (by - ay) * (0.02 + k)]], '#d9d3c8', lw * 1.2);}}
	// wings
	const ph = flying ? Math.sin(f * 2.6) : -0.9;
	for (const [off, al] of [[0, 0.45], [1, 0.32]] as [number, number][]) {
		c.save(); c.translate(7, -2.5); c.rotate(-0.25 + ph * 0.55 + off * 0.18);
		c.fillStyle = `rgba(205,232,255,${al})`; ellipse(c, 11, 0, 12, 3.2); c.fill(); c.strokeStyle = 'rgba(150,190,220,0.8)'; c.lineWidth = 0.4; c.stroke();
		stroke(c, [[0, 0], [21, -0.8]], 'rgba(140,180,210,0.6)', 0.3); stroke(c, [[3, 0.5], [20, 1.6]], 'rgba(140,180,210,0.5)', 0.3); c.restore();
	}
	// abdomen
	const segs = 7;
	for (let i = segs - 1; i >= 0; i--) {
		const k = i / (segs - 1); const sx = 12 + i * 2.6; const ry = (3.4 - 1.6 * k) * (1 + fill * 0.75 * Math.sin(Math.PI * Math.min(1, 0.15 + k)));
		c.fillStyle = fill > 0.05 ? linear(c, sx, -ry, sx, ry, [[0, '#e8606a'], [0.5, '#c22a37'], [1, '#7a1220']]) : linear(c, sx, -ry, sx, ry, [[0, '#4a3f38'], [0.5, '#2b2420'], [1, '#14100e']]);
		ellipse(c, sx, 0, 2.2, ry); c.fill();
		c.fillStyle = fill > 0.05 ? `rgba(255,220,220,${0.5 - fill * 0.3})` : '#e9e4da'; ellipse(c, sx - 1.6, 0, 0.5, ry * 0.92); c.fill();
	}
	if (fill > 0.05) {c.fillStyle = 'rgba(255,255,255,0.5)'; ellipse(c, 20, -2.2 * (1 + fill * 0.5), 6, 0.6); c.fill();}
	// thorax with lyre pattern
	c.fillStyle = radial(c, 6, -1.5, 6, [[0, '#5a4c44'], [1, '#1e1816']]); ellipse(c, 6.5, 0, 5.2, 4.3); c.fill();
	stroke(c, [[4, -2.5], [6, -1], [5, 1.5]], '#f2eee6', 0.55); stroke(c, [[8.5, -2.5], [7, -1], [8, 1.5]], '#f2eee6', 0.55); stroke(c, [[6.5, -3.4], [6.5, 2.8]], '#f2eee6', 0.35);
	// head, eye, palps, antennae, proboscis
	c.fillStyle = radial(c, -0.5, -0.5, 3.2, [[0, '#3a302c'], [1, '#120e0c']]); circle(c, 0, 0.5, 2.8); c.fill();
	c.fillStyle = radial(c, -1, -0.2, 2, [[0, '#7a2a2a'], [1, '#2a0e0e']]); circle(c, -0.8, 0, 1.7); c.fill(); c.fillStyle = 'rgba(255,255,255,0.7)'; circle(c, -1.4, -0.6, 0.45); c.fill();
	stroke(c, [[-1.5, -1.5], [-6, -6], [-9, -8]], '#1e1816', 0.45); stroke(c, [[-1, -2], [-4, -8], [-5, -11]], '#1e1816', 0.45);
	for (let k = 0.3; k < 1; k += 0.2) {stroke(c, [[-1.5 - 7.5 * k, -1.5 - 6.5 * k], [-1.5 - 7.5 * k - 1.2, -1.5 - 6.5 * k + 1]], 'rgba(30,24,22,0.6)', 0.25);}
	stroke(c, [[-2, 2], [-7, 4.5], [-10, 5]], '#2a2220', 0.6);
	stroke(c, [[-2.2, 1.5], [tipLocal[0], tipLocal[1]]], '#1e1816', 0.75);
	c.restore();
};

// ---------------- skin cross-section ----------------
const SURF = 140, CAP1 = 225, CAP2 = 300, DERM_END = 345;
const cap1 = (x: number) => CAP1 + 2.5 * Math.sin(x / 26), cap2 = (x: number) => CAP2 + 2.5 * Math.sin(x / 22 + 1);
let FAT: number[][] | null = null, EPI: number[][] | null = null;
const prep = () => {
	FAT = []; let tries = 0;
	while (FAT.length < 160 && tries < 20000) {tries++; const x = hash(tries) * (W + 40) - 20, y = DERM_END - 6 + hash(tries + 777) * 160; if (FAT.every(([a, b]) => (a - x) ** 2 + ((b - y) * 1.15) ** 2 > 19 ** 2)) FAT.push([x, y]);}
	FAT = FAT.map(([x, y]) => {const d = Math.min(...FAT!.filter(([a, b]) => a !== x || b !== y).map(([a, b]) => Math.hypot(a - x, (b - y) * 1.15))); return [x, y, d * 0.5];});
	EPI = []; for (let i = 0; i < 260; i++) EPI.push([hash(i * 3.1) * W, 147 + hash(i * 5.7) * 17, 2 + hash(i) * 1.5]);
};
type St = {bump: number; red: number; dil: number};
const bumpAt = (x: number, st: St) => st.bump * 22 * Math.exp(-(((x - 135) / 44) ** 2));
const layerPath = (c: C2, yTop: (x: number) => number, yBot: number) => {c.beginPath(); c.moveTo(-10, yBot); for (let x = -10; x <= W + 10; x += 3) c.lineTo(x, yTop(x)); c.lineTo(W + 10, yBot); c.closePath();};
const drawSection = (c: C2, f: number, st: St, lang: Lang, labels: boolean) => {
	if (!FAT) prep();
	grid(c);
	const lift = (x: number, y: number) => y - bumpAt(x, st) * clamp((DERM_END + 40 - y) / (DERM_END + 40 - SURF));
	// fat (hypodermis)
	c.fillStyle = '#b06a2c'; c.fillRect(-10, DERM_END - 10, W + 20, H);
	for (const [x, y, r] of FAT!) {c.fillStyle = radial(c, x - r * 0.3, y - r * 0.35, r * 1.2, [[0, '#f6d27a'], [0.55, '#e8b052'], [1, '#c98634']]); ellipse(c, x, lift(x, y), r * 0.96, r * 0.86); c.fill(); c.fillStyle = 'rgba(255,245,210,0.35)'; ellipse(c, x - r * 0.35, lift(x, y) - r * 0.4, r * 0.35, r * 0.18); c.fill();}
	// dermis
	layerPath(c, (x) => lift(x, SURF + 24), DERM_END + 2); c.fillStyle = linear(c, 0, SURF, 0, DERM_END, [[0, '#ee9ea3'], [1, '#d97a86']]); c.fill();
	layerPath(c, (x) => lift(x, DERM_END - 2) , DERM_END + 6); c.fillStyle = '#c56a6a'; c.fill();
	// collagen bands
	c.save(); layerPath(c, (x) => lift(x, SURF + 26), DERM_END); c.clip();
	for (let k = 0; k < 15; k++) {const y0 = SURF + 34 + k * 12.5; const pts: number[][] = []; for (let x = -10; x <= W + 10; x += 12) pts.push([x, lift(x, y0 + 3 * Math.sin(x / 19 + k * 1.3))]); stroke(c, pts, k % 3 === 0 ? 'rgba(200,100,115,0.45)' : 'rgba(255,210,212,0.55)', k % 3 === 0 ? 1 : 1.6);}
	// redness around the bite
	if (st.red > 0) {c.fillStyle = radial(c, 135, lift(135, 215), 110, [[0, `rgba(235,70,85,${0.45 * st.red})`], [1, 'rgba(235,70,85,0)']]); c.fillRect(0, 0, W, H);}
	c.restore();
	// capillaries
	for (const [cf, dil] of [[cap1, st.dil], [cap2, st.dil * 0.6]] as [(x: number) => number, number][]) {
		const pts: number[][] = []; for (let x = -10; x <= W + 10; x += 6) pts.push([x, lift(x, cf(x))]);
		const w0 = 11 + dil * 6 + pulse(f) * 1.6; stroke(c, pts, '#6e1220', w0 + 2.4); stroke(c, pts, '#b82634', w0); stroke(c, pts, '#d8414c', w0 * 0.55); stroke(c, pts.map(([x, y]) => [x, y - w0 * 0.28]), 'rgba(255,140,140,0.55)', 1.1);
	}
	// flowing red blood cells
	for (let i = 0; i < 34; i++) {const fast = 0.9 + (i % 4) * 0.18; const surge = Math.floor(f / BEAT) * 6 + eout(P(f % BEAT, 0, 8)) * 6; const x = ((i * 37 + f * fast * 0.6 + surge) % (W + 30)) - 15; const cf = i % 2 ? cap1 : cap2; const y = lift(x, cf(x)) + ((i % 3) - 1) * 2.2; c.fillStyle = '#e2444f'; ellipse(c, x, y, 2.6, 1.6, 0.2); c.fill(); c.fillStyle = '#a81c2a'; ellipse(c, x, y, 1.1, 0.6, 0.2); c.fill();}
	// epidermis + stratum corneum
	const epiTop = (x: number) => lift(x, SURF), epiBot = (x: number) => lift(x, SURF + 24 + 3 * Math.sin(x / 7));
	c.beginPath(); c.moveTo(-10, epiBot(-10)); for (let x = -10; x <= W + 10; x += 2) c.lineTo(x, epiBot(x)); for (let x = W + 10; x >= -10; x -= 2) c.lineTo(x, epiTop(x)); c.closePath();
	c.fillStyle = linear(c, 0, SURF, 0, SURF + 26, [[0, '#f9d9cc'], [0.25, '#f1b9aa'], [1, '#e99a98']]); c.fill();
	c.save(); c.clip(); for (const [x, y, r] of EPI!) {c.strokeStyle = 'rgba(255,230,225,0.6)'; c.lineWidth = 0.6; ellipse(c, x, lift(x, y), r * 1.4, r); c.stroke(); c.fillStyle = 'rgba(200,120,125,0.45)'; circle(c, x, lift(x, y), 0.7); c.fill();} c.restore();
	stroke(c, Array.from({length: 100}, (_, i) => {const x = -10 + i * 3; return [x, epiBot(x)];}), '#cf7a82', 1.2);
	stroke(c, Array.from({length: 100}, (_, i) => {const x = -10 + i * 3; return [x, epiTop(x) + 0.4];}), '#fff0ea', 1.1);
	stroke(c, Array.from({length: 100}, (_, i) => {const x = -10 + i * 3; return [x, epiTop(x) - 0.6];}), '#9a5a50', 0.9);
	// nerve
	const NP = [[20, 500], [40, 440], [64, 392], [92, 346], [118, 300], [132, 270]].map(([x, y]) => [x, lift(x, y)]);
	if (f >= T.mastLab - 12) {c.globalAlpha = P(f, T.mastLab - 12, T.mastLab + 6); stroke(c, NP, '#7a5e16', 4.2); stroke(c, NP, '#f2d65c', 2.4); stroke(c, NP.map(([x, y]) => [x - 0.6, y - 0.4]), '#fff3b0', 0.7); for (const [dx, dy] of [[-8, -12], [8, -11], [10, 4]]) stroke(c, [[132, lift(132, 270)], [132 + dx, lift(132 + dx, 270 + dy)]], '#f2d65c', 1.4); c.globalAlpha = 1;}
	// mast cells
	const MC = [[92, 262], [135, 268], [180, 260]];
	if (f >= T.salA) MC.forEach(([x0, y0], j) => {
		const x = x0, y = lift(x0, y0); const bk = P(f, T.burst + j * 2, T.burst + j * 2 + 7);
		if (bk < 1) {const r = 11 * (1 - 0.3 * bk); const wob = f >= T.mastLab && f < T.burst ? (pulse(f, f >= T.burst - 60 ? BEAT / 2 : BEAT, 3) * 2.2 * (j % 2 ? -1 : 1)) : 0;
			c.fillStyle = radial(c, x - 3, y - 3, r * 1.3, [[0, '#c7a2f0'], [0.7, '#8e5cc8'], [1, '#5a2f86']]); ellipse(c, x + wob, y, r + 1, r); c.fill(); c.strokeStyle = '#3f1f63'; c.lineWidth = 0.9; c.stroke();
			c.fillStyle = '#6a3a9a'; ellipse(c, x + 1 + wob, y + 1, r * 0.36, r * 0.3); c.fill();
			for (let g = 0; g < 18; g++) {const a = g * 2.39 + j, rr = (r - 3) * Math.sqrt(hash(g * 3 + j)); c.fillStyle = '#ffe14d'; circle(c, x + wob + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.9, 0.9); c.fill();}}
		else if (f < T.burst + 34) {c.globalAlpha = 1 - P(f, T.burst + 10, T.burst + 34); c.strokeStyle = '#8e5cc8'; c.lineWidth = 1.2; for (let a = 0; a < 8; a++) {c.beginPath(); c.arc(x, y, 13 + (f - T.burst) * 0.25, a * 0.8, a * 0.8 + 0.4); c.stroke();} c.globalAlpha = 1;}
		if (f >= T.burst + j * 2) {const fade = 1 - P(f, T.nerveB - 10, T.zoutA); for (let i = 0; i < 40; i++) {const a = hash(i * 7 + j * 31) * Math.PI * 2, v = 12 + hash(i + j * 13) * 50; const tt = eout(P(f, T.burst + j * 2, T.burst + j * 2 + 50)); const px = x + Math.cos(a) * v * tt + Math.sin(f * 0.1 + i) * 1.5, py = y + Math.sin(a) * v * 0.7 * tt; c.globalAlpha = fade; c.fillStyle = radial(c, px, py, 3, [[0, 'rgba(255,240,140,1)'], [1, 'rgba(255,225,77,0)']]); circle(c, px, py, 3); c.fill(); c.fillStyle = '#fff6a8'; circle(c, px, py, 0.8); c.fill(); c.globalAlpha = 1;}}
	});
	// leaking plasma
	if (f >= T.swellA && f < T.zoutA) for (let i = 0; i < 50; i++) {const k = P(f, T.swellA + i * 0.7, T.swellA + i * 0.7 + 34); if (k <= 0) continue; const x = 85 + hash(i + 3) * 100; c.fillStyle = 'rgba(190,230,248,0.85)'; circle(c, x, lift(x, cap1(x)) - 8 - k * (18 + hash(i) * 50), 1); c.fill();}
	// saliva cloud
	const salFade = 1 - P(f, T.nerveB - 20, T.zoutA);
	if (f >= T.salA && salFade > 0) {c.globalAlpha = salFade; for (let i = 0; i < 70; i++) {const born = T.salA + Math.floor(i / 18) * BEAT + (i % 18) * 0.15; if (f < born) continue; const a = hash(i + 7) * Math.PI * 2, r = (4 + (i % 9) * 2.6) * Math.sqrt(P(f, born, born + 26)); const x = 135 + Math.cos(a) * r * 1.5, y = lift(135, CAP1) - 6 + Math.sin(a) * r * 0.8; c.fillStyle = radial(c, x, y, 2.4, [[0, '#b8ffb0'], [1, 'rgba(80,200,90,0)']]); circle(c, x, y, 2.4); c.fill(); c.fillStyle = '#5fcf5a'; circle(c, x, y, 0.8); c.fill();} c.globalAlpha = 1;}
	// mosquito + stylets
	const tipD = f < T.pierceA ? 0 : f < T.pierceB ? (eout(P(f, T.pierceA, T.pierceA + 6)) * 0.55 + eout(P(f, T.pierceA + BEAT, T.pierceA + BEAT + 6)) * 0.45) : f < T.withA ? 1 : 1 - eio(P(f, T.withA, T.withB));
	const probe = f >= T.pierceB && f < T.probeB ? Math.sin(((f - T.pierceB) / 7.5) * Math.PI) * 5 * (1 - P(f, T.probeB - 4, T.probeB)) : 0;
	const tx = 135 + probe, ty = SURF + tipD * (CAP1 - SURF - 2);
	const fly = eio(P(f, T.flyA, T.flyB)); const nb = (T.suckB - T.suckA) / BEAT; const fill = f < T.suckA ? 0 : f >= T.suckB ? 1 : (Math.floor((f - T.suckA) / BEAT) + eout(P((f - T.suckA) % BEAT, 0, 6))) / nb;
	const S4 = 2.9; const [ox, oy] = rot(tipLocal[0] * S4, tipLocal[1] * S4, MANG); const hx = 135 - ox, hy = SURF - 2 - oy; // head so that labium tip touches skin
	if (fly < 1) {
		if (tipD > 0 && fly === 0) {stroke(c, [[135, SURF - 1], [tx, ty]], '#241a18', 2.2); stroke(c, [[135.6, SURF - 1], [tx + 0.6, ty]], '#8a7262', 0.6); c.fillStyle = '#241a18'; circle(c, tx, ty, 1.2); c.fill();}
		// labium bends as stylets go in
		mosquito(c, hx + fly * 220, hy - fly * 180, S4, f, fly > 0, fill, 0.72 - fly * 0.4);
	}
	// blood going up
	if (f >= T.suckA && f < T.suckB) for (let k = 0; k < 3; k++) {const p = eio(P((f - T.suckA) % BEAT, 0, BEAT - 1)) * 0.34 + k * 0.33; const yy = ty - p * (ty - SURF + 2); c.fillStyle = '#ff4a55'; ellipse(c, 135, yy, 1.6, 2.6); c.fill();}
	// nerve signals
	if (f >= T.nerveA && f < T.nerveB) for (let k = 0; k < 2; k++) {const p = clamp(eout(P((f - T.nerveA) % BEAT, 0, BEAT)) * 0.55 + k * 0.44, 0, 0.999); if (k === 1 && f < T.nerveA + BEAT) continue; const seg = p * (NP.length - 1); const si = NP.length - 2 - Math.floor(seg), sk = seg % 1; const a = NP[si + 1], b = NP[si]; const xx = a[0] + (b[0] - a[0]) * sk, yy = a[1] + (b[1] - a[1]) * sk; c.fillStyle = radial(c, xx, yy, 7, [[0, 'rgba(255,255,255,1)'], [0.4, 'rgba(255,246,168,0.8)'], [1, 'rgba(255,225,77,0)']]); circle(c, xx, yy, 7); c.fill();}
	void labels; void lang;
};
const sectionLabels = (c: C2, f: number, st: St, lang: Lang) => {
	const L = STR[lang]; const surfY = (x: number) => SURF - bumpAt(x, st);
	label(c, f, T.lab[0], T.mastLab, L.epi, 6, 112, 26, 152);
	label(c, f, T.lab[1], T.mastLab, L.derm, 6, 186, 20, 200);
	label(c, f, T.lab[2], T.mastLab, L.cap, 6, 318, 40, 302);
	label(c, f, T.lab[3], T.mastLab, L.fat, 10, 404, 34, 386);
	label(c, f, T.pierceA + 10, T.salA, L.sty, 152, 172, 138, 186);
	if (f >= T.salA + 4 && f < T.suckA) {label(c, f, T.salA + 4, T.suckA, L.sal, 152, 176, 146, 218, '#9cf09a'); if (f >= T.salA + 16) text(c, typed(L.sal2, f, T.salA + 16), lang === 'ru' ? 160 : 152, 188, '#9cf09a');}
	label(c, f, T.suckA + 4, T.withA, L.blood, 152, 172, 138, 186, '#ff8a8a');
	label(c, f, T.mastLab, T.burst + 4, L.mast, lang === 'ru' ? 150 : 170, 322, 180, 270, '#d8c2ff');
	label(c, f, T.burst + 6, T.nerveA, L.hist, 6, 322, 92, 270, '#ffe14d');
	label(c, f, T.bumpLab, T.zoutA, L.bump, 176, 84, 150, Math.round(surfY(150)), '#ffb0a8');
	label(c, f, T.nerveA - 4, T.zoutA, L.nerve, 62, 430, 47, 424, '#f2d65c');
	if (f >= T.itch && f < T.nerveB) {const on = (f - T.itch) % BEAT < 7; text(c, L.itch, 135, 44, on ? '#ff4a4a' : '#ffffff', 'center', 16);}
};

// ---------------- outside view ----------------
const SPOT = {x: 139, y: 322};
const S_OUT = 2.0;
const LANDH = (() => {const [ox, oy] = rot(tipLocal[0] * S_OUT, tipLocal[1] * S_OUT, MANG); return {x: SPOT.x - ox, y: SPOT.y - oy};})();
const bumpOut = (f: number) => (f < T.zoutA ? 0 : f < T.ffA ? 1 : f >= T.ffB ? 0 : 1 - (Math.floor((f - T.ffA) / BEAT) + eout(P((f - T.ffA) % BEAT, 0, 6))) / 4);
const mosqOutPos = (f: number) => {
	const inLen = N - T.inA + T.land; const u = f >= T.inA ? (f - T.inA) / inLen : f < T.land ? (f + N - T.inA) / inLen : 1;
	const k = eio(u); return {x: 330 + (LANDH.x - 330) * k + 20 * Math.sin(u * 9) * (1 - u), y: 70 + (LANDH.y - 70) * k + 16 * Math.sin(u * 13) * (1 - u), u};
};
const drawOutside = (c: C2, f: number) => {
	grid(c); drawArm(c);
	const amp = bumpOut(f);
	if (amp > 0) {
		const r = 9 + 9 * amp; c.fillStyle = radial(c, SPOT.x, SPOT.y, r * 1.6, [[0, `rgba(220,80,80,${0.75 * amp})`], [0.5, `rgba(235,120,110,${0.45 * amp})`], [1, 'rgba(235,140,120,0)']]); circle(c, SPOT.x, SPOT.y, r * 1.6); c.fill();
		c.fillStyle = radial(c, SPOT.x - 2, SPOT.y - 3, r * 0.8, [[0, `rgba(255,225,210,${0.8 * amp})`], [1, 'rgba(255,200,190,0)']]); circle(c, SPOT.x - 1, SPOT.y - 2, r * 0.7); c.fill();
		c.fillStyle = `rgba(170,40,50,${amp})`; circle(c, SPOT.x, SPOT.y, 1.3); c.fill();
	}
	if (f >= T.scrA && f < T.ffB) {c.globalAlpha = 1 - P(f, T.ffA, T.ffA + 45); for (let i = 0; i < 4; i++) if (f > T.scrA + 6 + i * 8) stroke(c, [[SPOT.x - 9 + i * 4.5, SPOT.y - 9], [SPOT.x - 5 + i * 4.5, SPOT.y + 9]], 'rgba(205,60,65,0.85)', 1.1); c.globalAlpha = 1;}
	if (f >= T.inA || f < T.zoutA - 300) {const m = mosqOutPos(f); mosquito(c, m.x, m.y, S_OUT, f, m.u < 1, 0);}
	// scratching finger (vector)
	if (f >= T.scrA && f < T.scrB) {
		const k = eout(P(f, T.scrA, T.scrA + 9)) * (1 - eio(P(f, T.scrB - 9, T.scrB))); const osc = Math.sin(((f - T.scrA) / 7.5) * Math.PI) * 7;
		const fx = SPOT.x + 4 + (1 - k) * 150, fy = SPOT.y - 2 + osc;
		c.save(); c.filter = 'blur(3px)'; c.fillStyle = 'rgba(0,0,0,0.45)'; c.beginPath(); c.roundRect(fx + 6, fy - 6, 200, 26, 12); c.fill(); c.restore();
		c.beginPath(); c.roundRect(fx, fy - 12, 200, 24, 12); c.fillStyle = linear(c, 0, fy - 12, 0, fy + 12, [[0, '#f8d3b6'], [0.45, '#eeb594'], [1, '#c4785e']]); c.fill(); c.strokeStyle = '#8a4636'; c.lineWidth = 1.2; c.stroke();
		stroke(c, [[fx + 34, fy - 9], [fx + 35, fy + 9]], 'rgba(150,80,60,0.5)', 0.9); stroke(c, [[fx + 38, fy - 9], [fx + 39, fy + 9]], 'rgba(150,80,60,0.4)', 0.8);
		c.fillStyle = linear(c, fx, 0, fx + 12, 0, [[0, '#f8e6e0'], [1, '#e2b0a4']]); ellipse(c, fx + 7, fy, 7, 8); c.fill(); c.strokeStyle = 'rgba(150,80,65,0.7)'; c.lineWidth = 0.8; c.stroke(); c.fillStyle = 'rgba(255,255,255,0.75)'; ellipse(c, fx + 4, fy - 3, 2, 1.3); c.fill();
	}
	if (f >= T.spark && f < T.spark + 24) {const k = Math.sin(P(f, T.spark, T.spark + 24) * Math.PI); for (const [ox, oy, sz] of [[0, 0, 8], [-14, -15, 4], [12, -9, 3.5]]) {const r = sz * k; c.fillStyle = 'rgba(255,255,255,0.95)'; c.beginPath(); c.moveTo(SPOT.x + ox - r, SPOT.y + oy); c.lineTo(SPOT.x + ox, SPOT.y + oy - r * 0.18); c.lineTo(SPOT.x + ox + r, SPOT.y + oy); c.lineTo(SPOT.x + ox, SPOT.y + oy + r * 0.18); c.fill(); c.beginPath(); c.moveTo(SPOT.x + ox, SPOT.y + oy - r); c.lineTo(SPOT.x + ox + r * 0.18, SPOT.y + oy); c.lineTo(SPOT.x + ox, SPOT.y + oy + r); c.lineTo(SPOT.x + ox - r * 0.18, SPOT.y + oy); c.fill();}}
};
const outsideOverlay = (c: C2, f: number, lang: Lang) => {
	const S_ = STR[lang];
	if (f >= T.inA || f < T.retB) {const m = mosqOutPos(f); const ff = f < T.inA ? f + N : f; label(c, ff, T.female + N, T.retB + N, S_.female, 176, 236, Math.round(m.x) + 6, Math.round(m.y) - 8, '#ffb0d0');}
	if (f >= T.retA && f < T.zinA + 6) {const k = eio(P(f, T.retA, T.retB)); const r = Math.round(44 - 24 * k); const col = Math.floor(f / 3) % 2 ? '#7fe0d0' : '#c8fff6'; for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {const cx = SPOT.x + sx * r, cy = SPOT.y + sy * r; c.fillStyle = INK; c.fillRect(Math.min(cx, cx - sx * 7) - 1, cy - 1, 9, 3); c.fillRect(cx - 1, Math.min(cy, cy - sy * 7) - 1, 3, 9); c.fillStyle = col; c.fillRect(Math.min(cx, cx - sx * 7), cy, 8, 1); c.fillRect(cx, Math.min(cy, cy - sy * 7), 1, 8);}}
	if (f >= T.scrA + 10 && f < T.scrB) {text(c, typed(S_.scr1, f, T.scrA + 10), 135, 402, TXT, 'center'); text(c, typed(S_.scr2, f, T.scrA + 22), 135, 420, '#ff6a6a', 'center');}
};

// ---------------- pixel text / labels (drawn on the low-res canvas) ----------------
const text = (c: C2, s: string, x: number, y: number, col = TXT, align: CanvasTextAlign = 'left', size = 8) => {
	c.font = STYLE === 'pixel' ? `${size}px PS2P` : `900 ${size * 1.25}px InterBlack`; c.textBaseline = 'top'; c.textAlign = align; x = Math.round(x); y = Math.round(y);
	c.fillStyle = INK; for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, 1], [1, -1], [-1, 1]]) c.fillText(s, x + dx, y + dy);
	c.fillStyle = col; c.fillText(s, x, y);
};
const typed = (s: string, f: number, a: number) => s.slice(0, Math.max(0, Math.floor((f - a) * 1.2)));
const pline = (c: C2, x0: number, y0: number, x1: number, y1: number, col: string, w = 1) => {
	x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
	const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let e = dx + dy; c.fillStyle = col;
	for (;;) {c.fillRect(x0 - (w > 1 ? 1 : 0), y0 - (w > 1 ? 1 : 0), w, w); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy) {e += dy; x0 += sx;} if (e2 <= dx) {e += dx; y0 += sy;}}
};
const back = (k: number) => {const c1 = 1.9; return k <= 0 ? 0 : 1 + (c1 + 1) * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2);};
const label = (c: C2, f: number, a: number, b: number, s: string, tx: number, ty: number, px: number, py: number, col = TXT) => {
	if (f < a || f >= b) return;
	if (STYLE !== 'pixel') {
		const k = back(P(f, a, a + 7)), out = 1 - P(f, b - 5, b); if (k <= 0 || out <= 0) return;
		c.save(); c.globalAlpha = out;
		c.font = `900 10px InterBlack`; const tw = c.measureText(s).width; const bw = tw + 10, bh = 15;
		const bx = tx, by = ty - 3, cx = bx + bw / 2, cy = by + bh / 2; const ex = cx + (px - cx) * 0, ey = cy;
		const lk = eout(P(f, a, a + 6));
		c.shadowColor = 'rgba(0,0,0,0.45)'; c.shadowBlur = 6; c.shadowOffsetY = 2.5;
		c.strokeStyle = '#fffaf0'; c.lineWidth = 1.3; c.lineCap = 'round'; c.beginPath(); c.moveTo(px, py); c.lineTo(px + (ex - px) * lk, py + (ey - py) * lk); c.stroke();
		c.fillStyle = '#fffaf0'; circle(c, px, py, 2.2); c.fill();
		c.translate(cx, cy); c.rotate(((a / 15) % 2 ? 1 : -1) * 0.035); c.scale(k, k);
		c.fillStyle = col === TXT ? '#fffaf0' : col; c.beginPath(); c.roundRect(-bw / 2, -bh / 2, bw, bh, 3); c.fill();
		c.shadowColor = 'transparent'; c.fillStyle = '#1a1412'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(s, 0, 0.8);
		c.restore(); return;
	}
	const k = eout(P(f, a, a + 7)); const ex = tx + (tx <= px ? Math.min(s.length * 8, 40) : 4), ey = ty + (ty < py ? 10 : -2);
	const lx = px + (ex - px) * k, ly = py + (ey - py) * k;
	pline(c, px, py, lx, ly, INK, 3); pline(c, px, py, lx, ly, TXT); c.fillStyle = INK; c.fillRect(Math.round(px) - 2, Math.round(py) - 2, 5, 5); c.fillStyle = TXT; c.fillRect(Math.round(px) - 1, Math.round(py) - 1, 3, 3);
	if (k >= 1) text(c, typed(s, f, a + 7), tx, ty, col);
};

// ---------------- HUD ----------------
let LOGO: HTMLImageElement | null = null;
const hud = (c: C2, f: number, lang: Lang) => {
	const S_ = STR[lang];
	if (LOGO && LOGO.complete) {c.imageSmoothingEnabled = true; c.save(); c.beginPath(); c.arc(11, 11, 8, 0, Math.PI * 2); c.clip(); c.drawImage(LOGO, 3, 3, 16, 16); c.restore();}
	text(c, S_.handle, 23, 7, TXT, 'left', 8);
	const tri = (x: number, y: number, col: string) => {c.fillStyle = col; for (let i = 0; i < 4; i++) c.fillRect(x + i, y + i, 1, 7 - 2 * i);};
	if (f >= T.pierceA && f < T.withB) {const x = W - 6 - S_.slow.length * 8; tri(x - 9, 27, '#7fe0d0'); text(c, S_.slow, x, 27, '#7fe0d0');}
	if (f >= T.ffA && f < T.ffB) {const day = 1 + Math.min(3, Math.floor((f - T.ffA) / BEAT)); const s = `${S_.day} ${day}`; const x = W - 6 - s.length * 8; tri(x - 15, 27, '#ffd24a'); tri(x - 9, 27, '#ffd24a'); text(c, s, x, 27, '#ffd24a');}
};

// ---------------- frame compositor ----------------
const sceneState = (f: number): St => ({bump: eio(P(f, T.swellA, T.swellB)), red: P(f, T.swellA - 10, T.swellB), dil: P(f, T.burst, T.swellB)});
const shake = (f: number) => {
	let a = 0; if (f >= T.land && f < T.land + 4) a = 0.6; if (f >= T.probeB && f < T.probeB + 5) a = 1; if (f >= T.burst && f < T.burst + 8) a = 2.2; if (f >= T.itch && f < T.itch + 14) a = 2;
	return [(hash(f) - 0.5) * 2 * a, (hash(f + 50) - 0.5) * 2 * a];
};
let HR: OffscreenCanvas | null = null, HR2: OffscreenCanvas | null = null, LR: OffscreenCanvas | null = null, LR2: OffscreenCanvas | null = null;
const toPixels = (src: OffscreenCanvas, dst: OffscreenCanvas) => {
	const d = dst.getContext('2d', {willReadFrequently: true})!; d.imageSmoothingEnabled = true; d.imageSmoothingQuality = 'high'; d.clearRect(0, 0, W, H); d.drawImage(src, 0, 0, W, H);
	const img = d.getImageData(0, 0, W, H), a = img.data; const STEP = 14;
	for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {const t = BAYER[(y & 3) * 4 + (x & 3)] - 0.5; const i = (y * W + x) * 4; for (let ch = 0; ch < 3; ch++) a[i + ch] = Math.max(0, Math.min(255, Math.round((a[i + ch] + t * STEP) / STEP) * STEP));}
	d.putImageData(img, 0, 0); return d;
};
const paperTex = (() => {let t: OffscreenCanvas | null = null; return () => {if (t) return t; t = new OffscreenCanvas(W * K, H * K); const x = t.getContext('2d')!; const im = x.createImageData(W * K, H * K); for (let i = 0; i < im.data.length; i += 4) {const v = 128 + (hash(i * 0.37) - 0.5) * 60; im.data[i] = v; im.data[i + 1] = v; im.data[i + 2] = v; im.data[i + 3] = 255;} x.putImageData(im, 0, 0); return t;};})();
const renderSmooth = (main: CanvasRenderingContext2D, f: number, lang: Lang) => {
	HR ??= new OffscreenCanvas(W * K, H * K); const h = HR.getContext('2d')!;
	const inSec = f >= (T.zinA + T.zinB) / 2 && f < (T.zoutA + T.zoutB) / 2;
	const kb = pulse(f, BEAT, 3.5) * (f >= T.burst && f < T.nerveB ? 1.6 : 1);
	const zoomK = f >= T.zinA && f < T.zinB ? 1 + 7 * eio(P(f, T.zinA, T.zinB - 2)) : f >= T.zoutA && f < T.zoutB ? 1 + 7 * (1 - eio(P(f, T.zoutA + 2, T.zoutB))) : 1;
	const [sx, sy] = shake(f);
	h.setTransform(K, 0, 0, K, 0, 0); h.translate(sx, sy);
	const cz = 1 + 0.012 * kb; h.translate(W / 2, H / 2); h.scale(cz, cz); h.translate(-W / 2, -H / 2);
	const trans = (f >= T.zinA && f < T.zinB) || (f >= T.zoutA && f < T.zoutB);
	const paperOn = (cx: OffscreenCanvasRenderingContext2D) => {if (STYLE === 'paper') {cx.shadowColor = 'rgba(10,4,2,0.5)'; cx.shadowBlur = 12; cx.shadowOffsetY = 5;}};
	if (trans) {
		// crossfade: zoomed outside view <-> cross-section
		const zin = f < T.zinB; const mid = zin ? T.zinA + 18 : T.zoutA + 10; const wIn = zin ? eio(P(f, mid - 7, mid + 5)) : 1 - eio(P(f, mid - 5, mid + 7));
		h.save(); h.translate(SPOT.x, SPOT.y); h.scale(zoomK, zoomK); h.translate(-SPOT.x, -SPOT.y); paperOn(h); drawOutside(h, f); h.restore();
		HR2 ??= new OffscreenCanvas(W * K, H * K); const h2 = HR2.getContext('2d')!; h2.setTransform(K, 0, 0, K, 0, 0); h2.translate(W / 2, H / 2); const sz = zin ? 1.25 - 0.25 * eout(P(f, mid - 7, T.zinB)) : 1 + 0.25 * eio(P(f, T.zoutA, mid + 7)); h2.scale(sz, sz); h2.translate(-W / 2, -H / 2); paperOn(h2);
		drawSection(h2, f, sceneState(zin ? T.zinB : T.zoutA - 1), lang, true); h2.shadowColor = 'transparent';
		h.save(); h.setTransform(1, 0, 0, 1, 0, 0); h.globalAlpha = wIn; h.drawImage(HR2, 0, 0); h.restore();
	} else {
	if (!inSec) {h.translate(SPOT.x, SPOT.y); h.scale(zoomK, zoomK); h.translate(-SPOT.x, -SPOT.y);}
	paperOn(h);
	if (inSec) drawSection(h, f, sceneState(f), lang, true); else drawOutside(h, f);
	}
	h.shadowColor = 'transparent'; h.shadowBlur = 0; h.shadowOffsetY = 0;
	if (STYLE === 'paper') {h.setTransform(1, 0, 0, 1, 0, 0); h.globalCompositeOperation = 'overlay'; h.globalAlpha = 0.35; h.drawImage(paperTex(), 0, 0); h.globalAlpha = 1; h.globalCompositeOperation = 'source-over'; h.setTransform(K, 0, 0, K, 0, 0);}
	h.setTransform(1, 0, 0, 1, 0, 0);
	h.setTransform(K, 0, 0, K, 0, 0); h.translate(sx, sy);
	if (!trans) {if (inSec) sectionLabels(h, f, sceneState(f), lang); else outsideOverlay(h, f, lang);}
	if (f >= T.ffA && f < T.ffB) {h.fillStyle = 'rgba(255,250,240,0.10)'; for (let i = 0; i < 6; i++) h.fillRect(0, hash(f * 3 + i) * H, W, 0.8);}
	h.setTransform(K, 0, 0, K, 0, 0); hud(h, f, lang);
	main.drawImage(HR, 0, 0);
};
export const renderFrame = (main: CanvasRenderingContext2D, f: number, lang: Lang, style: Style = 'pixel') => {
	STYLE = style; if (style !== 'pixel') return renderSmooth(main, f, lang);
	HR ??= new OffscreenCanvas(W * K, H * K); HR2 ??= new OffscreenCanvas(W * K, H * K); LR ??= new OffscreenCanvas(W, H); LR2 ??= new OffscreenCanvas(W, H);
	const h = HR.getContext('2d')!, h2 = HR2.getContext('2d')!;
	const [sx, sy] = shake(f);
	let mode: 'out' | 'in' | 'z' = 'out'; let zin = true;
	if (f >= T.zinA && f < T.zinB) {mode = 'z'; zin = true;} else if (f >= T.zinB && f < T.zoutA) mode = 'in'; else if (f >= T.zoutA && f < T.zoutB) {mode = 'z'; zin = false;}
	const drawOut = (cx: OffscreenCanvasRenderingContext2D, scale: number) => {cx.setTransform(K, 0, 0, K, 0, 0); cx.translate(sx, sy); cx.translate(SPOT.x, SPOT.y); cx.scale(scale, scale); cx.translate(-SPOT.x, -SPOT.y); drawOutside(cx, f);};
	const drawIn = (cx: OffscreenCanvasRenderingContext2D, ff: number) => {cx.setTransform(K, 0, 0, K, 0, 0); cx.translate(sx, sy); drawSection(cx, f, sceneState(ff), lang, true);};
	let low: OffscreenCanvasRenderingContext2D;
	if (mode === 'out') {drawOut(h, 1); low = toPixels(HR, LR);}
	else if (mode === 'in') {drawIn(h, f); low = toPixels(HR, LR);}
	else {
		const scale = zin ? 1 + 7 * eio(P(f, T.zinA, T.zinB - 2)) : 1 + 7 * (1 - eio(P(f, T.zoutA + 2, T.zoutB)));
		const wIn = zin ? P(f, T.zinA + 12, T.zinB) : 1 - P(f, T.zoutA, T.zoutA + 12);
		drawOut(h, scale); drawIn(h2, zin ? T.zinB : T.zoutA - 1);
		const A = toPixels(HR, LR), B = toPixels(HR2, LR2);
		const ia = A.getImageData(0, 0, W, H), ib = B.getImageData(0, 0, W, H);
		for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (BAYER[(y & 3) * 4 + (x & 3)] < wIn) {const i = (y * W + x) * 4; ia.data[i] = ib.data[i]; ia.data[i + 1] = ib.data[i + 1]; ia.data[i + 2] = ib.data[i + 2];}
		A.putImageData(ia, 0, 0); low = A;
	}
	low.setTransform(1, 0, 0, 1, 0, 0);
	if (mode === 'in') sectionLabels(low, f, sceneState(f), lang);
	if (mode === 'out') outsideOverlay(low, f, lang);
	if (f >= T.ffA && f < T.ffB) {low.fillStyle = 'rgba(255,255,255,0.10)'; for (let i = 0; i < 6; i++) low.fillRect(0, Math.floor(hash(f * 3 + i) * H), W, 1 + (i % 2));}
	hud(low, f, lang);
	main.imageSmoothingEnabled = false; main.drawImage(low.canvas, 0, 0);
};

// ---------------- Remotion component ----------------
let fontsReady: Promise<void> | null = null;
const loadFonts = (lang: Lang) => {
	if (fontsReady) return fontsReady;
	const faces = [new FontFace('PS2P', `url(${staticFile('fonts/press-start-2p-latin-400-normal.woff2')})`, {unicodeRange: 'U+0000-00FF, U+2000-206F'}), new FontFace('PS2P', `url(${staticFile('fonts/press-start-2p-cyrillic-400-normal.woff2')})`, {unicodeRange: 'U+0400-04FF'}), new FontFace('InterBlack', `url(${staticFile('fonts/InterDisplay-Black.otf')})`)];
	fontsReady = Promise.all(faces.map((ff) => ff.load().then((l) => {(document.fonts as any).add(l);}))).then(() => new Promise<void>((res) => {LOGO = new Image(); LOGO.onload = () => res(); LOGO.onerror = () => res(); LOGO.src = staticFile(STR[lang].logo);}));
	return fontsReady;
};
export const PixelLoop: React.FC<{lang: Lang; at?: number; style?: Style}> = ({lang, at, style = 'pixel'}) => {
	const cur = useCurrentFrame(); const f = at ?? cur % N; const ref = useRef<HTMLCanvasElement>(null);
	const [handle] = useState(() => delayRender('fonts'));
	const [ready, setReady] = useState(false);
	useEffect(() => {loadFonts(lang).then(() => {setReady(true); continueRender(handle);});}, [handle, lang]);
	useEffect(() => {if (!ready || !ref.current) return; renderFrame(ref.current.getContext('2d')!, f, lang, style);}, [f, ready, lang, style]);
	return (
		<AbsoluteFill style={{background: BG}}>
			<canvas ref={ref} width={style === 'pixel' ? W : W * K} height={style === 'pixel' ? H : H * K} style={{width: W * K, height: H * K, imageRendering: style === 'pixel' ? 'pixelated' : 'auto'}} />
		</AbsoluteFill>
	);
};
