import React, {useEffect, useRef, useState} from 'react';
import {AbsoluteFill, staticFile, useCurrentFrame, useDelayRender} from 'remotion';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {At, Badge, C, Card, DISPLAY, FPS, P, Pill, SwissCross, Title, eio, eout, pop} from './ui';

const MW = 1240, MH = 1700;
const NB = ['DEU', 'FRA', 'ITA', 'AUT', 'LIE'];
const CAM = {
	europe: {center: [9.0, 48.6] as [number, number], zoom: 4.25, pitch: 56, bearing: -16},
	swiss: {center: [8.2, 46.55] as [number, number], zoom: 6.65, pitch: 44, bearing: -8},
};
const CITIES: Record<string, [number, number]> = {basel: [7.5886, 47.5596], zurich: [8.5417, 47.3769], jura: [6.83, 47.1], geneva: [6.1432, 46.2044]};
let workerSet = false;

type Mode = 'europe' | 'swiss' | 'final';
export const MapScene: React.FC<{t0: number; mode: Mode; K: any; S: any}> = ({t0, mode, K, S}) => {
	const ref = useRef<HTMLDivElement>(null);
	const frame = useCurrentFrame();
	const t = t0 + frame / FPS;
	const {delayRender, continueRender} = useDelayRender();
	const [handle] = useState(() => delayRender('map load'));
	const [map, setMap] = useState<maplibregl.Map | null>(null);
	const cam = mode === 'swiss' ? CAM.swiss : CAM.europe;
	const BASE = 150000;
	const heights = () => {
		if (mode === 'swiss') return {ch: 26000 * eout(P(t, t0 + 0.1, t0 + 1.0)), nb: 0, ot: 0};
		if (mode === 'final') return {ch: BASE * 2, nb: BASE, ot: BASE * 0.8};
		const grow = eout(P(t, 0.4, 1.8));
		return {ch: BASE * grow * (1 + eio(P(t, K.double - 0.4, K.double + 0.8))), nb: BASE * grow, ot: BASE * 0.8 * grow};
	};
	const expr = (ch: any, nb: any, ot: any) => ['match', ['get', 'iso'], 'CHE', ch, NB, nb, ot];

	useEffect(() => {
		if (!ref.current) return;
		if (!workerSet) {
			const abs = new URL(staticFile('maplibre/maplibre-gl-worker.mjs'), window.location.href).href;
			maplibregl.setWorkerUrl(URL.createObjectURL(new Blob([`import "${abs}";`], {type: 'text/javascript'})));
			workerSet = true;
		}
		const h = heights();
		const dim = mode === 'swiss';
		const m = new maplibregl.Map({
			container: ref.current,
			style: {
				version: 8,
				light: {anchor: 'viewport', color: '#ffffff', intensity: 0.42, position: [1.4, 200, 35]},
				sources: {eu: {type: 'geojson', data: new URL(staticFile('europe.geojson'), window.location.href).href}},
				layers: [
					{id: 'fill', type: 'fill', source: 'eu', paint: {'fill-color': expr('#5a1020', dim ? '#1a2246' : '#24306a', dim ? '#141a38' : '#1c2552') as any}},
					{id: 'ext', type: 'fill-extrusion', source: 'eu', paint: {
						'fill-extrusion-color': expr(C.red, dim ? '#1a2246' : '#4659b8', '#33408a') as any,
						'fill-extrusion-height': expr(h.ch, h.nb, h.ot) as any,
						'fill-extrusion-opacity': 0.96, 'fill-extrusion-vertical-gradient': true}},
					{id: 'line', type: 'line', source: 'eu', paint: {'line-color': ['match', ['get', 'iso'], 'CHE', '#ffd0d6', '#8090ff'] as any, 'line-width': ['match', ['get', 'iso'], 'CHE', 3, 1] as any, 'line-opacity': 0.7}},
				],
			} as any,
			center: cam.center, zoom: cam.zoom, pitch: cam.pitch, bearing: cam.bearing,
			interactive: false, attributionControl: false, fadeDuration: 0,
			canvasContextAttributes: {preserveDrawingBuffer: true, antialias: true},
		} as any);
		m.on('load', () => m.once('idle', () => {setMap(m); continueRender(handle);}));
	}, []);

	useEffect(() => {
		if (!map) return;
		const h = heights();
		const hd = delayRender('map frame');
		map.setPaintProperty('ext', 'fill-extrusion-height', expr(h.ch, h.nb, h.ot) as any);
		map.once('idle', () => continueRender(hd));
		map.triggerRepaint();
	}, [map, frame]);

	// slow push-in, scale stays <= 1 (plate is oversized)
	const sc = 0.87 + 0.07 * P(t, t0, t0 + 8);
	const ox = (1080 - MW * sc) / 2, oy = mode === 'swiss' ? 120 : 260;
	const pr = (ll: [number, number], lift = 0) => {
		if (!map) return null;
		const p = map.project(ll);
		return {x: ox + p.x * sc, y: oy + p.y * sc - lift};
	};
	const ch = pr([8.23, 46.82], mode === 'swiss' ? 40 : 0);
	return (
		<AbsoluteFill>
			<div style={{position: 'absolute', left: ox, top: oy, width: MW, height: MH, transform: `scale(${sc})`, transformOrigin: '0 0'}}>
				<div ref={ref} style={{width: MW, height: MH}} />
			</div>
			{mode === 'europe' && map && ch ? (
				<>
					<At x={540} y={250} s={pop(t, 0.1)}><Title text={S.t1} col="#fff" size={86} /></At>
					<At x={540} y={350} s={pop(t, 0.35)}><Title text={S.t2} col={C.red} size={92} glow={C.red} /></At>
					<At x={ch.x} y={ch.y - 260} s={pop(t, K.wage - 0.4)}>
						<div style={{textAlign: 'center'}}>
							<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 120, color: '#fff', textShadow: `0 0 40px ${C.red}`}}>{S.num(Math.round(7024 * eout(P(t, K.wage - 0.3, K.wage + 1.2))))}</div>
							<div style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 34, color: C.cream, marginTop: -6}}>{S.perMonth}</div>
						</div>
					</At>
					<At x={ch.x + 230} y={ch.y - 60} s={pop(t, K.double - 0.3)} rot={-6}><Badge text={S.double} col={C.gold} size={46} /></At>
					<At x={540} y={1390} s={pop(t, K.why - 0.3)}><Pill text={S.why} bg={C.gold} size={44} /></At>
				</>
			) : null}
			{mode === 'swiss' && map ? (
				<>
					<At x={540} y={250} s={pop(t, K.s1 - 0.4)}><Badge text={S.secret(1)} col={C.gold} size={66} /></At>
					<At x={540} y={355} s={pop(t, K.s1 + 0.3)}><Pill text={S.s1} bg={C.cream} size={36} /></At>
					{([['basel', K.pharma, C.teal], ['zurich', K.bank, C.gold], ['jura', K.watch, C.violet], ['geneva', K.trade, C.pink]] as const).map(([k, kt, col], i) => {
						const p = pr(CITIES[k], 26);
						if (!p) return null;
						const s = pop(t, kt - 0.25);
						const dy = [-150, -190, -120, 120][i], dx = [-80, 110, -150, -40][i];
						return (
							<React.Fragment key={k}>
								<svg style={{position: 'absolute', left: 0, top: 0, opacity: Math.min(1, s)}} width={1080} height={1920}>
									<line x1={p.x} y1={p.y} x2={p.x + dx} y2={p.y + dy} stroke={col} strokeWidth={4} />
									<circle cx={p.x} cy={p.y} r={12} fill={col} />
								</svg>
								<At x={p.x + dx} y={p.y + dy} s={s}>
									<div style={{textAlign: 'center'}}>
										<Pill text={S.cities[k][1]} bg={col} size={34} />
										<div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 26, color: C.cream, marginTop: 8, textShadow: '0 2px 10px #000'}}>{S.cities[k][0]}</div>
									</div>
								</At>
							</React.Fragment>
						);
					})}
					<At x={540} y={1390} s={pop(t, K.world - 0.6)}><Badge text={S.world} col={C.teal} size={40} /></At>
				</>
			) : null}
			{mode === 'final' && map && ch ? (
				<>
					<At x={ch.x} y={ch.y - 330} s={pop(t, t0 + 0.2)}><SwissCross size={110} /></At>
					<At x={540} y={250} s={pop(t, K.fin - 0.8)}><Title text={S.fin1} col="#fff" size={56} /></At>
					<At x={540} y={350} s={pop(t, K.costly - 0.6)}><Title text={S.fin2} col={C.red} size={80} glow={C.red} /></At>
					<At x={540} y={1400} s={pop(t, K.costly + 1.2)} o={0.85}><div style={{fontFamily: 'Inter', fontWeight: 600, fontSize: 26, color: C.mute}}>{S.note}</div></At>
				</>
			) : null}
		</AbsoluteFill>
	);
};
