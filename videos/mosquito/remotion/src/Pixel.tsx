import React, {useEffect, useRef, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame} from 'remotion';
import {N, T} from './timeline';
import {STR} from './strings';

export const W = 180, H = 320, S = 6;
type Ctx = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
type Lang = 'ru' | 'en';
const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const P = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const eio = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const hash = (n: number) => {const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s);};
const hex = (c: string) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
const mix = (a: number[], b: number[], k: number) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);

// ---------- palette ----------
const BG = '#11181b', GRID = '#1a262a', INK = '#0c1012', TXT = '#f4f1e8';
const SK = {light: hex('#f6caa9'), base: hex('#eeb594'), mid: hex('#e09c7e'), shadow: hex('#c47a62'), line: hex('#9a5442')};

// ---------- primitives ----------
const rect = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => {c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));};
const px = (c: Ctx, x: number, y: number, col: string) => rect(c, x, y, 1, 1, col);
const ell = (c: Ctx, cx: number, cy: number, rx: number, ry: number, col: string) => {
	c.fillStyle = col; const R = Math.round(ry);
	for (let y = -R; y <= R; y++) {const s = Math.round(rx * Math.sqrt(Math.max(0, 1 - (y / (ry + 0.5)) ** 2))); c.fillRect(Math.round(cx) - s, Math.round(cy) + y, 2 * s + 1, 1);}
};
const line = (c: Ctx, x0: number, y0: number, x1: number, y1: number, col: string, w = 1) => {
	x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
	const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let e = dx + dy; c.fillStyle = col;
	for (;;) {c.fillRect(x0, y0, w, w); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy) {e += dy; x0 += sx;} if (e2 <= dx) {e += dx; y0 += sy;}}
};
const poly = (c: Ctx, pts: number[][], col: string, w = 1) => {for (let i = 1; i < pts.length; i++) line(c, pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1], col, w);};
const text = (c: Ctx, s: string, x: number, y: number, col = TXT, align: CanvasTextAlign = 'left', size = 8) => {
	c.font = `${size}px PS2P`; c.textBaseline = 'top'; c.textAlign = align; x = Math.round(x); y = Math.round(y);
	c.fillStyle = INK; for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, 1], [1, -1], [-1, 1]]) c.fillText(s, x + dx, y + dy);
	c.fillStyle = col; c.fillText(s, x, y);
};
const typed = (s: string, f: number, a: number) => s.slice(0, Math.max(0, Math.floor((f - a) * 1.2)));
// label with leader line; visible in [a, b)
const label = (c: Ctx, f: number, a: number, b: number, s: string, tx: number, ty: number, pxx: number, pyy: number, col = TXT) => {
	if (f < a || f >= b) return;
	const k = P(f, a, a + 6); const ax = tx + (tx < pxx ? Math.min(s.length * 8, 8 * s.length) / 2 : 0);
	const ex = Math.round(pxx + (ax - pxx) * 0), ey = pyy;
	const lx = Math.round(ex + (tx + (tx <= pxx ? s.length * 4 : 4) - ex) * k), ly = Math.round(ey + (ty + (ty < pyy ? 9 : -2) - ey) * k);
	line(c, ex, ey, lx, ly, INK, 2); line(c, ex, ey, lx, ly, TXT); rect(c, ex - 1, ey - 1, 3, 3, INK); px(c, ex, ey, TXT);
	if (k >= 1) text(c, typed(s, f, a + 6), tx, ty, col);
};

// ---------- background grid ----------
const grid = (c: Ctx) => {rect(c, 0, 0, W, H, BG); c.fillStyle = GRID; for (let x = 4; x < W; x += 12) c.fillRect(x, 0, 1, H); for (let y = 6; y < H; y += 12) c.fillRect(0, y, W, 1);};

// ---------- the arm (cached mask + shaded image) ----------
let ARM: ImageData | null = null;
const fingerC = [69, 83, 97, 111], fingerTop = [8, 0, 2, 12];
const span = (y: number): [number, number, number, number][] => {
	const out: [number, number, number, number][] = [];
	if (y >= 112) {const cx = 92 + (y - 112) * 0.04, hw = 25 + (y - 112) * 0.04; out.push([cx - hw, cx + hw, cx, hw]);}
	else if (y >= 96) out.push([67, 115, 91, 24]);
	else if (y >= 52) {const hw = 24 + (96 - y) * 0.2; out.push([90 - hw, 90 + hw, 90, hw]); if (y >= 64 && y <= 96) {const t0 = 90 - hw - 10 + (y - 64) * 0.25; out.push([t0, 90 - hw + 2, t0 + 5, 6]);}}
	if (y < 58) fingerC.forEach((fc, i) => {const top = fingerTop[i]; if (y < top) return; const sh = Math.max(0, top + 4 - y); const hw = 6 - sh * 0.9; out.push([fc - hw, fc + hw, fc, 6]);});
	return out;
};
const buildArm = () => {
	const img = new ImageData(W, H); const m = new Uint8Array(W * H);
	for (let y = 0; y < H; y++) for (const [a, b] of span(y)) for (let x = Math.round(a); x <= Math.round(b); x++) if (x >= 0 && x < W) m[y * W + x] = 1;
	for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
		if (!m[y * W + x]) continue;
		const edge = x === 0 || x === W - 1 || y === 0 || !m[y * W + x - 1] || !m[y * W + x + 1] || !m[(y - 1) * W + x] || (y < H - 1 && !m[(y + 1) * W + x]);
		let col = SK.base;
		const sp = span(y).find(([a, b]) => x >= Math.round(a) - 0 && x <= Math.round(b)); const rel = sp ? (x - sp[2]) / sp[3] : 0;
		if (rel < -0.8) col = SK.mid; else if (rel < -0.15) col = SK.light; else if (rel < 0.45) col = SK.base; else if (rel < 0.8) col = SK.mid; else col = SK.shadow;
		if (edge) col = SK.line;
		const i = (y * W + x) * 4; img.data[i] = col[0]; img.data[i + 1] = col[1]; img.data[i + 2] = col[2]; img.data[i + 3] = 255;
	}
	ARM = img;
};
const drawArm = (c: Ctx) => {
	if (!ARM) buildArm();
	// cast shadow
	c.fillStyle = '#090c0e'; for (let y = 0; y < H; y++) for (const [a, b] of span(y)) c.fillRect(Math.round(a) + 8, y + 6, Math.round(b - a), 1);
	const tmp = new OffscreenCanvas(W, H); tmp.getContext('2d')!.putImageData(ARM!, 0, 0); c.drawImage(tmp, 0, 0);
	// details: nails, knuckles, wrist crease, veins
	fingerC.forEach((fc, i) => {const t = fingerTop[i]; ell(c, fc, t + 5, 3, 3, '#c9958a'); ell(c, fc, t + 5, 2, 2, '#f3d6d0'); px(c, fc - 1, t + 4, '#fff0ec'); rect(c, fc - 3, 50, 5, 2, '#f8d6bc'); rect(c, fc + 2, 39, 1, 1, SK.mid.map(Math.round).join(',') ? '#d99478' : '#d99478');});
	line(c, 73, 101, 82, 100, '#c98267'); line(c, 86, 100, 104, 101, '#c98267'); line(c, 86, 101, 104, 102, '#f8d0b4');
	poly(c, [[80, 66], [83, 78], [87, 92]], '#e3a487'); poly(c, [[100, 64], [97, 77], [94, 92]], '#e3a487');
	ell(c, 78, 140, 2, 6, '#f9d6bd'); ell(c, 80, 180, 1, 5, '#f9d6bd');
};

// ---------- mosquito sprite (s = scale, head at x,y facing down-left) ----------
const mosq = (c: Ctx, x: number, y: number, f: number, s: number, flying: boolean, fill: number) => {
	const L = (pts: number[][], col: string) => poly(c, pts.map(([a, b]) => [x + a * s, y + b * s]), col);
	const legs = flying ? [[[0, 0], [-4, 5], [-5, 9]], [[1, 1], [0, 6], [1, 10]], [[2, 0], [6, 5], [8, 9]]] : [[[0, 0], [-6, 3], [-9, 8]], [[1, 1], [-1, 6], [-2, 10]], [[2, 0], [7, 3], [10, 8]], [[3, -1], [9, -1], [13, 4]]];
	for (const l of legs) L(l, '#2a2220');
	// abdomen: chain of circles with stripes
	for (let i = 0; i < 6; i++) {const k = i / 5; const r = (2.4 - 0.9 * k + fill * 1.2 * Math.sin(Math.PI * Math.min(1, k * 1.3))) * s; const col = fill > 0.15 ? (i % 2 ? '#b0303a' : '#d0464c') : i % 2 ? '#e8e2d8' : '#3a332e'; ell(c, x + (3 + i * 2.2) * s, y - (3 + i * 1.9) * s, r, r, i === 0 ? '#3a332e' : col);}
	ell(c, x + 1 * s, y - 1 * s, 2.6 * s, 2.4 * s, '#4a3f38'); px(c, x + 1 * s, y - 2 * s, '#e8e2d8'); px(c, x + 2 * s, y - 1 * s, '#e8e2d8');
	ell(c, x - 2 * s, y + 1.5 * s, 1.6 * s, 1.6 * s, '#2e2622'); px(c, x - 2.6 * s, y + 1 * s, '#c84a3a');
	L([[-2, 1], [-5, -2]], '#2a2220'); L([[-2, 1], [-6, 0]], '#2a2220'); if (s < 3) L([[-3, 2.5], [-6, 6]], '#2a2220');
	// wings
	const up = flying ? (Math.floor(f / 1.5) % 2 === 0) : false;
	c.globalAlpha = 0.6;
	if (up) {ell(c, x + 4 * s, y - 8 * s, 2 * s, 5 * s, '#cfe9ff'); ell(c, x + 6 * s, y - 6 * s, 1.6 * s, 4 * s, '#b4d8f5');}
	else {ell(c, x + 7 * s, y - 2 * s, 5 * s, 1.8 * s, '#cfe9ff'); ell(c, x + 6 * s, y + 0 * s, 4 * s, 1.4 * s, '#b4d8f5');}
	c.globalAlpha = 1;
};

// ---------- fat cells (voronoi, cached) ----------
let FAT: Int16Array | null = null; const FW = W, FH = 220;
const buildFat = () => {
	const seeds: number[][] = []; for (let i = 0; i < 70; i++) seeds.push([hash(i) * FW, hash(i + 99) * FH]);
	FAT = new Int16Array(FW * FH);
	for (let y = 0; y < FH; y++) for (let x = 0; x < FW; x++) {let bi = 0, bd = 1e9; for (let i = 0; i < seeds.length; i++) {const dx = x - seeds[i][0], dy = (y - seeds[i][1]) * 1.15; const d = dx * dx + dy * dy; if (d < bd) {bd = d; bi = i;}} FAT[y * FW + x] = bi;}
};
const C = {surf: hex('#f7d2c4'), epi: hex('#eeb1a4'), epiDot: hex('#f6c9bd'), ridge: hex('#d27c80'), derm: hex('#e58f93'), fib: hex('#f0aeb0'), capW: hex('#7e1a26'), capI: hex('#c9333f'), capH: hex('#de4d56'), fatF: [hex('#e0a548'), hex('#d99c40'), hex('#e6ad52')], fatB: hex('#9c6230'), fatH: hex('#f0c46a'), deep: hex('#c0806a'), red: hex('#e8606a'), bg: hex(BG), grid: hex(GRID)};
const SURF = 92;
const cap1 = (x: number) => 150 + 1.5 * Math.sin(x / 20), cap2 = (x: number) => 196 + 1.5 * Math.sin(x / 17 + 1);

type State = {bump: number; red: number; dil: number};
const drawSection = (c: Ctx, f: number, st: State, lang: Lang) => {
	if (!FAT) buildFat();
	const img = c.createImageData(W, H); const d = img.data;
	for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
		const g = Math.exp(-(((x - 90) / 30) ** 2)); const b = st.bump * 14 * g;
		const yy = y + b * clamp((250 - y) / 170);
		let col: number[];
		if (yy < SURF) col = (x - 4) % 12 === 0 || (y - 6) % 12 === 0 ? C.grid : C.bg;
		else if (yy < SURF + 2) col = C.surf;
		else {
			const rb = SURF + 14 + Math.round(2 * Math.sin(x / 5));
			if (yy < rb - 1) col = (x * 7 + Math.floor(yy) * 3) % 9 === 0 ? C.epiDot : C.epi;
			else if (yy <= rb) col = C.ridge;
			else if (yy < 228) {
				col = C.derm;
				for (let k = 0; k < 12; k++) {const yk = 114 + 10 * k + 2 * Math.sin(x / 14 + k * 1.7); if (Math.abs(yy - yk) < 0.6) {col = C.fib; break;}}
				for (const [cf, extra] of [[cap1, st.dil], [cap2, st.dil * 0.6]] as [(x: number) => number, number][]) {const th = 3.2 + extra * 2; const dd = Math.abs(yy - cf(x)); if (dd < th - 1) col = dd < 0.6 ? C.capH : C.capI; else if (dd < th) col = C.capW;}
			} else if (yy < 230) col = C.deep;
			else {
				const fy = Math.min(FH - 1, Math.floor(yy - 230)), id = FAT![fy * FW + x];
				const r = x < W - 1 ? FAT![fy * FW + x + 1] : id, dn = fy < FH - 1 ? FAT![(fy + 1) * FW + x] : id, up = fy > 0 ? FAT![(fy - 1) * FW + x] : id;
				col = r !== id || dn !== id ? C.fatB : up !== id ? C.fatH : C.fatF[id % 3];
			}
			if (st.red > 0 && yy < 228) {const w = st.red * 0.55 * Math.exp(-(((x - 90) / 36) ** 2) - (((yy - 140) / 50) ** 2)); col = mix(col, C.red, w);}
		}
		const i = (y * W + x) * 4; d[i] = col[0]; d[i + 1] = col[1]; d[i + 2] = col[2]; d[i + 3] = 255;
	}
	c.putImageData(img, 0, 0);
	const S_ = STR[lang];
	const surfY = (x: number) => SURF - st.bump * 14 * Math.exp(-(((x - 90) / 30) ** 2));
	// flowing red blood cells
	for (let i = 0; i < 26; i++) {const x = ((i * 23 + f * (0.9 + (i % 3) * 0.2)) % 200) - 10; const cf = i % 2 ? cap1 : cap2; rect(c, x, cf(x) - 1 + (i % 3 === 0 ? 1 : 0), 2, 1, '#f06a72');}
	// nerve
	const nerveVis = P(f, T.mastLab - 10, T.mastLab + 10);
	const NP = [[14, 320], [24, 290], [40, 256], [60, 224], [78, 190], [86, 178]];
	if (nerveVis > 0) {poly(c, NP, '#8a6d1c', 3); poly(c, NP, '#f2d65c', 1); line(c, 86, 178, 81, 169, '#f2d65c'); line(c, 86, 178, 93, 170, '#f2d65c'); line(c, 86, 178, 91, 183, '#f2d65c');}
	// mosquito + stylets
	const tipD = f < T.pierceA ? 0 : f < T.pierceB ? eio(P(f, T.pierceA, T.pierceB)) : f < T.withA ? 1 : 1 - eio(P(f, T.withA, T.withB));
	const probe = f >= T.pierceB && f < T.probeB ? Math.sin(f * 0.7) * 3 * (1 - P(f, T.probeB - 6, T.probeB)) : 0;
	const tx = 90 + probe, ty = SURF + tipD * (cap1(90) - SURF);
	const fly = P(f, T.flyA, T.flyB);
	const mx = 96 + fly * 120, my = 70 - fly * 100;
	const fill = P(f, T.suckA, T.suckB);
	if (fly < 1) {
		if (fly === 0) {poly(c, [[87, 78], [82, 84], [90, SURF]], '#3a302a', 2); if (tipD > 0) {line(c, 90, SURF, tx, ty, '#2b2020', 2); line(c, 91, SURF, tx + 1, ty, '#7a665a');}}
		mosq(c, mx, my, f, 3.6, fly > 0, fill);
	}
	// saliva
	const salFade = 1 - P(f, T.ffA - 200, T.zoutA);
	if (f >= T.salA && salFade > 0) for (let i = 0; i < 60; i++) {const born = T.salA + i * 0.55; if (f < born) continue; const a = hash(i + 7) * Math.PI * 2, r = (3 + (i % 9) * 1.6) * Math.sqrt(P(f, born, born + 24)); c.globalAlpha = salFade; px(c, 90 + Math.cos(a) * r * 1.4, cap1(90) - 4 + Math.sin(a) * r * 0.8, i % 3 ? '#7fe07a' : '#3fae48'); c.globalAlpha = 1;}
	// blood going up the stylets
	if (f >= T.suckA && f < T.suckB) for (let k = 0; k < 5; k++) {const p = ((f - T.suckA) / 14 + k / 5) % 1; const yy = ty - p * (ty - 80); rect(c, 90, yy, 2, 2, '#e8404a');}
	// mast cells
	const MC = [[62, 172], [92, 175], [120, 171]];
	if (f >= T.salA) MC.forEach(([x, y], j) => {
		const bk = P(f, T.burst + j * 2, T.burst + j * 2 + 6);
		if (bk < 1) {const r = 8 - 3 * bk; const wob = f >= T.mastLab && f < T.burst ? Math.round(Math.sin(f * 0.9 + j) * 0.6) : 0; ell(c, x + wob, y, r + 1, r, '#5a2f86'); ell(c, x + wob, y, r, r - 1, '#9b6fd0'); for (let g = 0; g < 11; g++) px(c, x + wob + Math.round(Math.cos(g * 2.4 + j) * (r - 2.5) * hash(g + j)), y + Math.round(Math.sin(g * 2.4 + j) * (r - 3) * hash(g * 3 + j)), '#ffe14d');}
		else if (f < T.burst + 30) {c.globalAlpha = 1 - P(f, T.burst + 8, T.burst + 30); for (let a = 0; a < 10; a++) px(c, x + Math.cos(a * 0.63) * 9, y + Math.sin(a * 0.63) * 8, '#9b6fd0'); c.globalAlpha = 1;}
		if (f >= T.burst + j * 2) for (let i = 0; i < 34; i++) {const a = hash(i * 7 + j * 31) * Math.PI * 2, v = 8 + hash(i + j * 13) * 32; const tt = Math.pow(Math.max(0, f - T.burst - j * 2), 0.55) / Math.pow(60, 0.55); const fade = 1 - P(f, T.nerveB - 10, T.zoutA); if (fade <= 0) continue; c.globalAlpha = fade; px(c, x + Math.cos(a) * v * Math.min(1, tt), y + Math.sin(a) * v * 0.7 * Math.min(1, tt), (f + i) % 6 < 3 ? '#ffe14d' : '#fff6a8'); c.globalAlpha = 1;}
	});
	// leaking fluid
	if (f >= T.swellA && f < T.zoutA) for (let i = 0; i < 40; i++) {const k = P(f, T.swellA + i * 0.8, T.swellA + i * 0.8 + 30); if (k <= 0) continue; const x = 60 + hash(i + 3) * 60; px(c, x, cap1(x) - 4 - k * (12 + hash(i) * 36), '#bfe6f7');}
	// nerve signals + itch
	if (f >= T.nerveA && f < T.nerveB) for (let k = 0; k < 3; k++) {const p = ((f - T.nerveA) / 22 + k / 3) % 1; const seg = p * (NP.length - 1); const si = NP.length - 2 - Math.floor(seg), sk = seg % 1; const a = NP[si + 1], b2 = NP[si]; const xx = a[0] + (b2[0] - a[0]) * sk, yy = a[1] + (b2[1] - a[1]) * sk; ell(c, xx, yy, 2, 2, '#ffffff'); ell(c, xx, yy, 1, 1, '#fff6a8');}
	// labels
	const L = S_;
	label(c, f, T.lab[0], T.mastLab, L.epi, 4, 70, 18, 99);
	label(c, f, T.lab[1], T.mastLab, L.derm, 4, 124, 14, 134);
	label(c, f, T.lab[2], T.mastLab, L.cap, 4, 208, 30, 197);
	label(c, f, T.lab[3], T.mastLab, L.fat, 8, 266, 24, 252);
	label(c, f, T.pierceA + 10, T.salA, L.sty, 100, 112, 92, 120);
	if (f >= T.salA + 6 && f < T.suckA) {label(c, f, T.salA + 4, T.suckA, L.sal, 100, 116, 98, 144, '#9cf09a'); if (f >= T.salA + 14) text(c, typed(L.sal2, f, T.salA + 14), lang === 'ru' ? 82 : 100, 126, '#9cf09a');}
	label(c, f, T.suckA + 4, T.withA, L.blood, 100, 112, 92, 120, '#ff8a8a');
	label(c, f, T.mastLab, T.burst + 4, L.mast, lang === 'ru' ? 72 : 102, 210, 120, 171, '#cfb4ff');
	label(c, f, T.burst + 6, T.nerveA, L.hist, 4, 210, 62, 172, '#ffe14d');
	label(c, f, T.bumpLab, T.zoutA, L.bump, 112, 50, 98, Math.round(surfY(98)), '#ffb0a8');
	label(c, f, T.nerveA - 4, T.zoutA, L.nerve, 44, 284, 31, 276, '#f2d65c');
	if (f >= T.itch && f < T.nerveB) {const on = Math.floor((f - T.itch) / 4) % 2 === 0; text(c, L.itch, 90, 26, on ? '#ff4a4a' : '#ffffff', 'center', 16);}
};

// ---------- outside view ----------
const LAND = {x: 105, y: 203}, SPOT = {x: 93, y: 215};
const drawOutside = (c: Ctx, f: number, lang: Lang) => {
	grid(c); drawArm(c);
	const S_ = STR[lang];
	// bump amount outside
	const amp = f < T.zoutA ? 0 : f < T.ffA ? 1 : 1 - P(f, T.ffA, T.ffB - 8);
	if (amp > 0) {c.globalAlpha = Math.min(1, amp * 1.6); ell(c, SPOT.x, SPOT.y, 5 + 5 * amp, 4 + 4 * amp, '#e9958a'); ell(c, SPOT.x, SPOT.y, 3 + 3 * amp, 2 + 3 * amp, '#e07a6a'); ell(c, SPOT.x, SPOT.y, 1 + amp, 1 + amp, '#c8504a'); px(c, SPOT.x - 3, SPOT.y - 3, '#ffd9c6'); px(c, SPOT.x - 2, SPOT.y - 4, '#ffd9c6'); c.globalAlpha = 1;}
	// scratch marks
	if (f >= T.scrA && f < T.ffB) {c.globalAlpha = 1 - P(f, T.ffA, T.ffA + 40); for (let i = 0; i < 4; i++) if (f > T.scrA + 6 + i * 8) line(c, SPOT.x - 6 + i * 3, SPOT.y - 6, SPOT.x - 3 + i * 3, SPOT.y + 6, '#d24a48'); c.globalAlpha = 1;}
	// mosquito: arriving (wraps around the loop end) and sitting
	const inLen = N - T.inA + T.land; const u = f >= T.inA ? (f - T.inA) / inLen : f < T.land ? (f + N - T.inA) / inLen : 1;
	if (f >= T.inA || f < T.zoutA - 300) {
		const k = eio(u);
		const mx = 200 + (LAND.x - 200) * k + 14 * Math.sin(u * 9) * (1 - u), my = 50 + (LAND.y - 50) * k + 10 * Math.sin(u * 13) * (1 - u);
		mosq(c, mx, my, f, 2, u < 1, 0);
		label(c, f < T.inA ? f + N : f, T.female + N, T.retB + N, S_.female, 118, 150, Math.round(mx) + 4, Math.round(my) - 6, '#ffb0d0');
		label(c, f, T.female, T.retB, S_.female, 118, 150, Math.round(mx) + 4, Math.round(my) - 6, '#ffb0d0');
	}
	// reticle
	if (f >= T.retA && f < T.zinB) {const k = eio(P(f, T.retA, T.retB)); const r = Math.round(30 - 16 * k); const col = Math.floor(f / 3) % 2 ? '#7fe0d0' : '#c8fff6'; for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {const cx = SPOT.x + sx * r, cy = SPOT.y + sy * r; line(c, cx, cy, cx - sx * 5, cy, col); line(c, cx, cy, cx, cy - sy * 5, col);}}
	// scratching finger
	if (f >= T.scrA && f < T.scrB) {
		const k = P(f, T.scrA, T.scrA + 8) * (1 - P(f, T.scrB - 8, T.scrB)); const osc = Math.round(Math.sin((f - T.scrA) * 1.2) * 5);
		const fx = SPOT.x + 4 + (1 - k) * 90, fy = SPOT.y - 2 + osc;
		rect(c, fx + 6, fy - 8, 120, 16, '#9a5442'); rect(c, fx + 7, fy - 7, 120, 14, '#eeb594'); rect(c, fx + 7, fy - 7, 120, 4, '#f6caa9'); rect(c, fx + 7, fy + 4, 120, 3, '#d99478'); line(c, fx + 26, fy - 5, fx + 26, fy + 4, '#d99478'); line(c, fx + 28, fy - 5, fx + 28, fy + 4, '#d99478');
		ell(c, fx + 7, fy, 7, 7, '#9a5442'); ell(c, fx + 7, fy, 6, 6, '#eeb594'); rect(c, fx + 1, fy - 4, 7, 8, '#c9958a'); rect(c, fx + 2, fy - 3, 6, 6, '#f3d6d0'); px(c, fx + 3, fy - 2, '#ffffff');
		if (f > T.scrA + 10) {text(c, typed(S_.scr1, f, T.scrA + 10), 90, 262, TXT, 'center'); text(c, typed(S_.scr2, f, T.scrA + 22), 90, 274, '#ff6a6a', 'center');}
	}
	// sparkle
	if (f >= T.spark && f < T.spark + 22) {const k = Math.sin(P(f, T.spark, T.spark + 22) * Math.PI); for (const [ox, oy, sz] of [[0, 0, 4], [-9, -10, 2], [8, -6, 2]]) {const r = Math.round(sz * k); line(c, SPOT.x + ox - r, SPOT.y + oy, SPOT.x + ox + r, SPOT.y + oy, '#ffffff'); line(c, SPOT.x + ox, SPOT.y + oy - r, SPOT.x + ox, SPOT.y + oy + r, '#ffffff'); px(c, SPOT.x + ox, SPOT.y + oy, '#fff6a8');}}
};

// ---------- HUD ----------
let LOGO: HTMLImageElement | null = null;
const hud = (c: Ctx, f: number, lang: Lang) => {
	const S_ = STR[lang];
	if (LOGO && LOGO.complete) {c.imageSmoothingEnabled = false; c.drawImage(LOGO, 3, 3, 11, 11);}
	text(c, S_.handle, 17, 5, TXT, 'left', 8);
	if (f >= T.pierceA && f < T.withB) {const x = W - 4 - S_.slow.length * 8; for (let i = 0; i < 4; i++) line(c, x - 9, 18 + i, x - 9, 24 - i, '#7fe0d0'); line(c, x - 9 + 0, 18, x - 6, 21, '#7fe0d0'); for (let i = 0; i < 4; i++) rect(c, x - 9 + i, 18 + i, 1, 7 - 2 * i, '#7fe0d0'); text(c, S_.slow, x, 18, '#7fe0d0');}
	if (f >= T.ffA && f < T.ffB) {const day = 1 + Math.min(3, Math.floor(P(f, T.ffA, T.ffB) * 4)); const s = `${S_.day} ${day}`; const x = W - 4 - s.length * 8; for (const o of [0, 5]) for (let i = 0; i < 4; i++) rect(c, x - 14 + o + i, 18 + i, 1, 7 - 2 * i, '#ffd24a'); text(c, s, x, 18, '#ffd24a');}
};

// ---------- compositing ----------
const shake = (f: number) => {
	let a = 0; if (f >= T.land && f < T.land + 4) a = 1; if (f >= T.probeB && f < T.probeB + 5) a = 1; if (f >= T.burst && f < T.burst + 8) a = 2; if (f >= T.itch && f < T.itch + 14) a = 2;
	return a ? [Math.round((hash(f) - 0.5) * 2 * a), Math.round((hash(f + 50) - 0.5) * 2 * a)] : [0, 0];
};
const sceneState = (f: number): State => ({bump: eio(P(f, T.swellA, T.swellB)), red: P(f, T.swellA - 10, T.swellB), dil: P(f, T.burst, T.swellB)});

export const renderFrame = (main: Ctx, f: number, lang: Lang) => {
	const A = new OffscreenCanvas(W, H).getContext('2d')!, B = new OffscreenCanvas(W, H).getContext('2d')!;
	const inside = f >= T.zinA && f < T.zoutB;
	let mode: 'out' | 'in' | 'zin' | 'zout' = 'out';
	if (f >= T.zinA && f < T.zinB) mode = 'zin'; else if (f >= T.zinB && f < T.zoutA) mode = 'in'; else if (f >= T.zoutA && f < T.zoutB) mode = 'zout';
	const zoomed = (scale: number) => {drawOutside(A, f, lang); const sw = W / scale, sh = H / scale; const sx = SPOT.x - SPOT.x / scale, sy = SPOT.y - SPOT.y / scale; const Z = new OffscreenCanvas(W, H).getContext('2d')!; Z.imageSmoothingEnabled = false; Z.drawImage(A.canvas, sx, sy, sw, sh, 0, 0, W, H); return Z;};
	let out: OffscreenCanvasRenderingContext2D;
	if (mode === 'out') {drawOutside(A, f, lang); out = A;}
	else if (mode === 'in') {drawSection(B as any, f, sceneState(f), lang); out = B;}
	else {
		const zin = mode === 'zin';
		const scale = zin ? 1 + 5 * eio(P(f, T.zinA, T.zinB - 4)) : 1 + 5 * (1 - eio(P(f, T.zoutA + 4, T.zoutB)));
		const wIn = zin ? P(f, T.zinA + 14, T.zinB) : 1 - P(f, T.zoutA, T.zoutA + 10);
		const Z = zoomed(scale); drawSection(B as any, f, sceneState(zin ? T.zinB : T.zoutA - 1), lang);
		const zi = Z.getImageData(0, 0, W, H), bi = B.getImageData(0, 0, W, H);
		for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (BAYER[(y % 4) * 4 + (x % 4)] < wIn) {const i = (y * W + x) * 4; zi.data[i] = bi.data[i]; zi.data[i + 1] = bi.data[i + 1]; zi.data[i + 2] = bi.data[i + 2];}
		Z.putImageData(zi, 0, 0); out = Z;
	}
	void inside;
	// fast-forward streaks
	if (f >= T.ffA && f < T.ffB) {out.fillStyle = 'rgba(255,255,255,0.10)'; for (let i = 0; i < 5; i++) out.fillRect(0, Math.floor(hash(f * 3 + i) * H), W, 1 + (i % 2));}
	hud(out as any, f, lang);
	const [sx, sy] = shake(f);
	main.imageSmoothingEnabled = false; main.fillStyle = BG; main.fillRect(0, 0, W, H); main.drawImage(out.canvas, sx, sy);
};

// ---------- Remotion component ----------
let fontsReady: Promise<void> | null = null;
const loadFonts = () => {
	if (fontsReady) return fontsReady;
	const faces = [new FontFace('PS2P', `url(${staticFile('fonts/press-start-2p-latin-400-normal.woff2')})`, {unicodeRange: 'U+0000-00FF, U+2000-206F'}), new FontFace('PS2P', `url(${staticFile('fonts/press-start-2p-cyrillic-400-normal.woff2')})`, {unicodeRange: 'U+0400-04FF'})];
	fontsReady = Promise.all(faces.map((ff) => ff.load().then((l) => {(document.fonts as any).add(l);}))).then(() => new Promise<void>((res) => {LOGO = new Image(); LOGO.onload = () => res(); LOGO.onerror = () => res(); LOGO.src = staticFile('logo_en_s.png');}));
	return fontsReady;
};
export const PixelLoop: React.FC<{lang: Lang; at?: number}> = ({lang, at}) => {
	const f = at ?? useCurrentFrame() % N; const ref = useRef<HTMLCanvasElement>(null);
	const [handle] = useState(() => delayRender('fonts'));
	const [ready, setReady] = useState(false);
	useEffect(() => {loadFonts().then(() => {if (lang === 'ru' && LOGO) {const im = new Image(); im.onload = () => {LOGO = im; setReady(true); continueRender(handle);}; im.src = staticFile(STR[lang].logo);} else {setReady(true); continueRender(handle);}});}, [handle, lang]);
	useEffect(() => {if (!ready || !ref.current) return; renderFrame(ref.current.getContext('2d')!, f, lang);}, [f, ready, lang]);
	return (
		<AbsoluteFill style={{background: BG}}>
			<canvas ref={ref} width={W} height={H} style={{width: W * S, height: H * S, imageRendering: 'pixelated'}} />
		</AbsoluteFill>
	);
};
