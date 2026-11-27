import React, {useEffect, useRef, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame} from 'remotion';

// Detailed 2D pixel cross-section of a 45° V-twin, drawn at 540x960 then palette-snapped (crisp pixels), shown x2.
export const CW = 540, CH = 960;
type C2 = CanvasRenderingContext2D;
const D2R = Math.PI / 180;
const OUT = '#0b0e14';
const PAL = ['#0b0e14', '#151b26', '#1e2533', '#2a3242', '#3a4456', '#4d5970', '#66738c', '#8794ab', '#a9b4c6', '#d2d9e4', '#f2f4f7',
	'#2b5bb5', '#3f7be0', '#7fb2ff', '#c46a1f', '#ff8a2e', '#ffc04a', '#fff1a8', '#6b4a2b', '#9a6a3a', '#c8943f', '#b33a2a', '#e25a3a', '#5a5f66', '#8a8f97', '#c9cbd0'].map((h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]);

// ---------- helpers ----------
const hatch = (c: C2, col: string, gap = 5, ang = 45) => {const p = document.createElement('canvas'); p.width = p.height = gap; const x = p.getContext('2d')!; x.fillStyle = col; for (let i = 0; i < gap; i++) x.fillRect(i, (ang > 0 ? gap - 1 - i : i), 1, 1); return c.createPattern(p, 'repeat')!;};
const poly = (c: C2, pts: number[][], fill: string | CanvasPattern, stroke = OUT, lw = 2) => {c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (const p of pts.slice(1)) c.lineTo(p[0], p[1]); c.closePath(); c.fillStyle = fill; c.fill(); if (stroke) {c.strokeStyle = stroke; c.lineWidth = lw; c.stroke();}};
const rect = (c: C2, x: number, y: number, w: number, h: number, fill: string | CanvasPattern, stroke: string | null = OUT, lw = 2) => {c.fillStyle = fill; c.fillRect(x, y, w, h); if (stroke) {c.strokeStyle = stroke; c.lineWidth = lw; c.strokeRect(x, y, w, h);}};
const circ = (c: C2, x: number, y: number, r: number, fill: string | CanvasPattern, stroke: string | null = OUT, lw = 2) => {c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fillStyle = fill; c.fill(); if (stroke) {c.strokeStyle = stroke; c.lineWidth = lw; c.stroke();}};
const valveLift = (local: number, open: number, close: number) => {if (local < open || local > close) return 0; const k = (local - open) / (close - open); return Math.sin(k * Math.PI);};

// ---------- one cylinder in its own local frame (axis = -y, crank center at 0,0) ----------
const R = 62, ROD = 230, BORE = 92;
type Phase = 'power' | 'exhaust' | 'intake' | 'compression';
const phaseOf = (local: number): Phase => (local < 180 ? 'power' : local < 360 ? 'exhaust' : local < 540 ? 'intake' : 'compression');
const drawCylinder = (c: C2, local: number, alpha: number, side: number, t: number) => {
	// local: crank degrees since THIS cylinder's firing TDC (0..720); alpha: crank-pin angle relative to this cylinder's axis
	const pinX = -Math.sin(alpha) * R, pinY = -Math.cos(alpha) * R;
	const d = R * Math.cos(alpha) + Math.sqrt(ROD * ROD - (R * Math.sin(alpha)) ** 2); // wrist pin distance along axis
	const pistonY = -d; const deckY = -(R + ROD) - 64; // top of stroke region
	const H = hatch(c, '#4d5970', 5), H2 = hatch(c, '#3a4456', 4, -45);
	// barrel walls (cut, hatched) with air-cooling fins outside
	for (const sx of [-1, 1]) {
		const x0 = sx * (BORE / 2 + 2), w = 22 * sx;
		poly(c, [[x0, deckY], [x0 + w, deckY], [x0 + w, -150], [x0, -150]], '#5b6780'); poly(c, [[x0, deckY], [x0 + w, deckY], [x0 + w, -150], [x0, -150]], H, OUT, 2);
		for (let k = 0; k < 11; k++) {const fy = deckY + 8 + k * 17; poly(c, [[x0 + w, fy], [x0 + w + sx * (46 - Math.abs(k - 3) * 1.5), fy + 2], [x0 + w + sx * (46 - Math.abs(k - 3) * 1.5), fy + 9], [x0 + w, fy + 11]], '#8794ab', OUT, 2); rect(c, Math.min(x0 + w, x0 + w + sx * 40), fy + 3, 40, 2, '#a9b4c6', null);}
	}
	// bore interior (dark) + gas fill above piston
	const top = deckY + 6; rect(c, -BORE / 2 + 2, top, BORE - 4, pistonY - top - 30, '#151b26', null);
	const ph = phaseOf(local); const gas = ph === 'power' ? (local < 40 ? '#fff1a8' : local < 110 ? '#ffc04a' : '#c46a1f') : ph === 'exhaust' ? '#5a5f66' : ph === 'intake' ? '#3f7be0' : '#2b5bb5';
	const gh = pistonY - 30 - top; c.globalAlpha = ph === 'compression' ? 0.9 : 0.85; rect(c, -BORE / 2 + 2, top, BORE - 4, gh, gas, null); c.globalAlpha = 1;
	// gas texture (particles)
	for (let i = 0; i < 26; i++) {const px = -BORE / 2 + 6 + ((i * 37 + Math.floor(t * 3) * (ph === 'power' ? 5 : 2)) % (BORE - 12)), py = top + 4 + ((i * 23 + Math.floor(t * 2) * 3) % Math.max(4, gh - 8)); rect(c, px, py, 2, 2, ph === 'power' ? '#fff1a8' : ph === 'exhaust' ? '#8a8f97' : '#7fb2ff', null);}
	// cylinder head (cut) with combustion dome, ports, valves, springs, rockers, spark plug
	const hy = deckY - 70;
	poly(c, [[-BORE / 2 - 30, hy], [BORE / 2 + 30, hy], [BORE / 2 + 30, deckY + 6], [-BORE / 2 - 30, deckY + 6]], '#66738c'); poly(c, [[-BORE / 2 - 30, hy], [BORE / 2 + 30, hy], [BORE / 2 + 30, deckY + 6], [-BORE / 2 - 30, deckY + 6]], H2, OUT, 2);
	c.beginPath(); c.ellipse(0, deckY + 6, BORE / 2 - 2, 22, 0, Math.PI, 0); c.fillStyle = gas; c.fill(); c.strokeStyle = OUT; c.lineWidth = 2; c.stroke();
	// ports: intake (blue, side -1 of this cylinder) and exhaust (brown, +1)
	const inL = valveLift(local, 350, 560), exL = valveLift(local, 140, 370);
	poly(c, [[-26, deckY - 14], [-BORE / 2 - 30, hy + 18], [-BORE / 2 - 30, hy + 44], [-12, deckY - 2]], inL > 0.05 ? '#3f7be0' : '#1e2533');
	poly(c, [[26, deckY - 14], [BORE / 2 + 30, hy + 18], [BORE / 2 + 30, hy + 44], [12, deckY - 2]], exL > 0.05 ? '#9a6a3a' : '#1e2533');
	for (const [vx, L, isIn] of [[-24, inL, true], [24, exL, false]] as [number, number, boolean][]) {
		const drop = L * 12; const sx = vx > 0 ? 1 : -1;
		// valve head + stem
		poly(c, [[vx - 15, deckY - 6 + drop], [vx + 15, deckY - 6 + drop], [vx + 4, deckY - 16 + drop], [vx - 4, deckY - 16 + drop]], '#c9cbd0', OUT, 2);
		rect(c, vx - 3, hy - 54 + drop, 6, 46 + 26, '#a9b4c6', OUT, 1.5);
		// spring (coil)
		const sTop = hy - 50, sBot = hy - 4 + drop * 0.3; c.strokeStyle = '#d2d9e4'; c.lineWidth = 3; c.beginPath(); for (let k = 0; k <= 8; k++) {const y = sTop + drop + (sBot - sTop - drop) * (k / 8); c.lineTo(vx + (k % 2 ? 11 : -11), y);} c.stroke();
		rect(c, vx - 13, sTop - 6 + drop, 26, 6, '#8794ab', OUT, 1.5);
		// rocker arm (pivot above), pushed by pushrod on the outside
		const piv = [vx + sx * 18, hy - 78]; const tip = [vx, sTop - 8 + drop]; const tail = [vx + sx * 52, hy - 70 - L * 10];
		poly(c, [[tip[0] - 4, tip[1] - 2], [piv[0], piv[1] - 6], [tail[0], tail[1] - 4], [tail[0], tail[1] + 6], [piv[0], piv[1] + 6], [tip[0] + 4, tip[1] + 4]], '#8794ab', OUT, 2); circ(c, piv[0], piv[1], 5, '#d2d9e4');
		// pushrod down to the cam (outside the barrel fins)
		c.strokeStyle = OUT; c.lineWidth = 7; c.beginPath(); c.moveTo(tail[0], tail[1] + 4); c.lineTo(sx * 118, -120 - L * 10); c.stroke(); c.strokeStyle = isIn ? '#7fb2ff' : '#ff8a2e'; c.lineWidth = 3; c.stroke();
	}
	// rocker cover
	poly(c, [[-BORE / 2 - 40, hy - 4], [-BORE / 2 - 30, hy - 104], [BORE / 2 + 30, hy - 104], [BORE / 2 + 40, hy - 4]], 'rgba(0,0,0,0)', '#66738c', 3);
	// spark plug + spark
	rect(c, -5, hy - 40, 10, 44, '#d2d9e4', OUT, 1.5); rect(c, -9, hy - 52, 18, 14, '#f2f4f7', OUT, 1.5);
	if (local < 18 || local > 714) {for (let k = 0; k < 6; k++) {const a = k * 1.05 + t; rect(c, Math.cos(a) * 10 - 1, deckY - 2 + Math.sin(a) * 6, 3, 3, '#fff1a8', null);} circ(c, 0, deckY - 2, 7, '#ffffff', null);}
	// piston (with rings, pin) + rod
	const pTop = pistonY - 30;
	rect(c, -BORE / 2 + 3, pTop, BORE - 6, 58, '#a9b4c6', OUT, 2); rect(c, -BORE / 2 + 3, pTop, BORE - 6, 6, '#d2d9e4', null); for (const ry of [10, 16, 22]) rect(c, -BORE / 2 + 3, pTop + ry, BORE - 6, 2, '#4d5970', null); rect(c, -BORE / 2 + 3, pTop + 34, 8, 24, '#8794ab', null);
	const rodA = Math.atan2(pinX, -(pistonY - pinY)); void rodA;
	poly(c, [[-9, pistonY], [9, pistonY], [pinX + 16, pinY], [pinX - 16, pinY]], side ? '#8794ab' : '#a9b4c6', OUT, 2);
	circ(c, 0, pistonY, 10, '#66738c'); circ(c, 0, pistonY, 4, OUT, null);
};

const T_FIRE_B = 405;
export const drawEngine = (c: C2, theta: number, t: number) => {
	// background: riveted dark panels
	c.fillStyle = '#121722'; c.fillRect(0, 0, CW, CH); for (let y = 0; y < CH; y += 60) for (let x = 0; x < CW; x += 60) {rect(c, x + 2, y + 2, 56, 56, (x / 60 + y / 60) % 2 ? '#161c28' : '#141a25', '#0d1119', 2); circ(c, x + 8, y + 8, 2, '#2a3242', null);}
	c.save(); c.translate(CW / 2, 640);
	// crankcase (cut, hatched)
	const H = hatch(c, '#4d5970', 5);
	c.beginPath(); c.moveTo(-200, -120); c.lineTo(200, -120); c.lineTo(230, 40); c.quadraticCurveTo(230, 190, 0, 200); c.quadraticCurveTo(-230, 190, -230, 40); c.closePath(); c.fillStyle = '#5b6780'; c.fill(); c.fillStyle = H; c.fill(); c.strokeStyle = OUT; c.lineWidth = 3; c.stroke();
	circ(c, 0, 0, 150, '#151b26');
	// cam (one lobe per cylinder) on the right-bottom
	const camA = (theta / 2) * D2R; c.save(); c.translate(140, 110); c.rotate(camA); poly(c, [[-18, -16], [0, -34], [18, -16], [18, 14], [-18, 14]], '#c8943f', OUT, 2); circ(c, 0, 0, 6, '#6b4a2b'); c.restore();
	// flywheel with counterweight
	const al = (22.5 - theta) * D2R; // crank pin angle (A axis at +22.5)
	c.save(); c.rotate(-al); circ(c, 0, 0, 132, '#3a4456'); c.beginPath(); c.arc(0, 0, 128, 0, Math.PI); c.fillStyle = '#4d5970'; c.fill(); for (let k = 0; k < 12; k++) {c.save(); c.rotate((k / 12) * Math.PI * 2); rect(c, 120, -3, 10, 6, k % 3 ? '#66738c' : '#ff8a2e', null); c.restore();} circ(c, 0, 0, 24, '#8794ab'); c.restore();
	// two cylinders
	[[22.5, 0], [-22.5, T_FIRE_B]].forEach(([phi, off], i) => {
		c.save(); c.rotate(-phi * D2R); const local = (((theta - off) % 720) + 720) % 720; const alpha = (22.5 - theta - phi) * D2R; drawCylinder(c, local, alpha, i, t); c.restore();
	});
	// shared crank pin on top
	const px = -Math.sin(al) * R, py = -Math.cos(al) * R; circ(c, px, py, 17, '#ff9a2e'); circ(c, px, py, 7, '#fff1a8', null);
	c.restore();
};
const snap = (c: C2) => {const im = c.getImageData(0, 0, CW, CH), a = im.data; for (let i = 0; i < a.length; i += 4) {let best = 0, bd = 1e9; for (let k = 0; k < PAL.length; k++) {const d = (a[i] - PAL[k][0]) ** 2 + (a[i + 1] - PAL[k][1]) ** 2 + (a[i + 2] - PAL[k][2]) ** 2; if (d < bd) {bd = d; best = k;}} a[i] = PAL[best][0]; a[i + 1] = PAL[best][1]; a[i + 2] = PAL[best][2];} c.putImageData(im, 0, 0);};
export const CutTest: React.FC<{theta?: number}> = ({theta}) => {
	const f = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null); const [h] = useState(() => delayRender('f'));
	useEffect(() => {const c = ref.current!.getContext('2d')!; drawEngine(c, theta ?? (f * 720) / 15, f); snap(c); continueRender(h);}, [f, theta, h]);
	void staticFile;
	return <AbsoluteFill style={{background: '#121722'}}><canvas ref={ref} width={CW} height={CH} style={{width: 1080, height: 1920, imageRendering: 'pixelated'}} /></AbsoluteFill>;
};
