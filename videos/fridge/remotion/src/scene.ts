import * as THREE from 'three';
import {P, eio} from './ui';
// ---- chapter timing helpers ----
export const chapters = (data: any) => {const ch = [0]; for (let s = 2; s <= 8; s++) ch.push(data.segs.find((x: any) => x.s === s).t0 - 0.35); ch.push(data.dur); return ch;};
// ---- camera shots: [pos, target, xray] ----
const SHOTS: [number[], number[], number][] = [
	[[5.5, 3.4, 11.5], [0, 2.7, 0], 1],
	[[-5.8, 3.2, -10.5], [0, 2.6, 0], 1],
	[[-7.0, 4.2, 9.5], [0, 2.6, 0], 0.13],
	[[2.4, 4.6, 5.6], [0, 3.3, -0.5], 0.13],
	[[5.2, 2.4, -7.6], [0.2, 1.9, -1.0], 0.2],
	[[-4.4, 5.2, -5.6], [-0.6, 3.4, -0.9], 0.2],
	[[0, 3.0, 14.0], [0, 2.6, 0], 1],
	[[4.8, 3.2, 11.5], [0, 2.7, 0], 1],
];
export const camState = (t: number, ch: number[]) => {
	let i = 0; for (let j = 0; j < 8; j++) if (t >= ch[j] - 0.5) i = j;
	const s = SHOTS[i]; const drift = Math.sin((t - ch[i]) * 0.25) * 0.25;
	let p = s[0].map((v, k) => v + (k === 0 ? drift : 0)), tg = s[1], x = s[2];
	if (i > 0) {
		const k = eio(P(t, ch[i] - 0.5, ch[i] + 0.8));
		const a = SHOTS[i - 1];
		if (k < 1) {p = a[0].map((v, j) => v + (p[j] - v) * k); tg = a[1].map((v, j) => v + (tg[j] - v) * k); x = a[2] + (x - a[2]) * k;}
	}
	return {p, tg, x, i};
};
export const makeCam = (t: number, ch: number[], w: number, h: number) => {
	const c = new THREE.PerspectiveCamera(30, w / h, 0.1, 100); const s = camState(t, ch);
	c.position.set(s.p[0], s.p[1], s.p[2]); c.lookAt(s.tg[0], s.tg[1], s.tg[2]); c.updateMatrixWorld(); c.updateProjectionMatrix(); return c;
};
export const project = (cam: THREE.PerspectiveCamera, v: number[], w: number, h: number, y0: number) => {
	const p = new THREE.Vector3(v[0], v[1], v[2]).project(cam); return {x: (p.x * 0.5 + 0.5) * w, y: y0 + (-p.y * 0.5 + 0.5) * h};
};
// ---- refrigerant loop ----
type Pt = [number, number, number, string];
const pts: Pt[] = [];
const ev = [3.85, 3.65, 3.45, 3.25];
ev.forEach((y, r) => {const xs = r % 2 ? [0.75, -0.75] : [-0.75, 0.75]; xs.forEach((x) => pts.push([x, y, -0.62, 'evap']));});
pts.push([-0.85, 3.15, -1.0, 'suction'], [-0.85, 0.5, -1.0, 'suction'], [0.15, 0.38, -1.16, 'suction'], [0.75, 0.48, -1.16, 'hot'], [0.82, 0.72, -1.06, 'hot']);
for (let r = 0; r < 11; r++) {const y = 0.72 + r * 0.3; const xs = r % 2 ? [-0.8, 0.8] : [0.8, -0.8]; xs.forEach((x) => pts.push([x, y, -1.06, 'cond']));}
pts.push([-0.9, 3.95, -1.0, 'cap'], [-0.78, 3.97, -0.62, 'cap']);
export const LOOP = pts;
const segLen: number[] = []; let total = 0;
for (let i = 0; i < pts.length; i++) {const a = pts[i], b = pts[(i + 1) % pts.length]; const l = Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]); segLen.push(l); total += l;}
export const LOOP_LEN = total;
const condStart = pts.findIndex((p) => p[3] === 'cond'), condEnd = pts.length - 3;
export const along = (s: number) => {
	s = ((s % total) + total) % total; let i = 0;
	while (s > segLen[i]) {s -= segLen[i]; i++;}
	const a = pts[i], b = pts[(i + 1) % pts.length], k = s / segLen[i];
	const pos = [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
	let col = new THREE.Color('#4de1ff'), size = 1;
	if (a[3] === 'evap') {const f = i / 7; col = new THREE.Color('#2f6bff').lerp(new THREE.Color('#9fe8ff'), f); size = 0.8 + f * 0.6;}
	else if (a[3] === 'suction') {col = new THREE.Color('#9fe8ff'); size = 1.4;}
	else if (a[3] === 'hot') {col = new THREE.Color('#ff3b2f'); size = 1.1;}
	else if (a[3] === 'cond') {const f = (i - condStart) / (condEnd - condStart); col = new THREE.Color('#ff3b2f').lerp(new THREE.Color('#ffb347'), Math.min(1, f * 1.6)).lerp(new THREE.Color('#e8f6ff'), Math.max(0, f * 1.5 - 0.5)); size = 1.1 - f * 0.35;}
	else {col = new THREE.Color('#2f6bff'); size = 0.7;}
	return {pos, col, size};
};
export const PIPE_PATH = new THREE.CurvePath<THREE.Vector3>();
for (let i = 0; i < pts.length; i++) {const a = pts[i], b = pts[(i + 1) % pts.length]; PIPE_PATH.add(new THREE.LineCurve3(new THREE.Vector3(a[0], a[1], a[2]), new THREE.Vector3(b[0], b[1], b[2])));}
