import React, {useMemo} from 'react';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {C, DISPLAY, clamp, eio, eout} from './ui';

export type Key = [number, number];
export const track = (t: number, keys: Key[]) => {
	if (t <= keys[0][0]) return keys[0][1];
	for (let i = 1; i < keys.length; i++) {
		const [t1, v1] = keys[i], [t0, v0] = keys[i - 1];
		if (t <= t1) return v0 + (v1 - v0) * eio((t - t0) / Math.max(0.001, t1 - t0));
	}
	return keys[keys.length - 1][1];
};
export type Cam = {p: [number, number, number]; l: [number, number, number]};
const CamRig: React.FC<{cam: Cam}> = ({cam}) => {
	const {camera} = useThree();
	camera.position.set(...cam.p);
	camera.lookAt(...cam.l);
	return null;
};
const Std: React.FC<{c: string; e?: number; r?: number; m?: number; o?: number}> = ({c, e = 0, r = 0.7, m = 0, o = 1}) => <meshStandardMaterial color={c} emissive={c} emissiveIntensity={e} roughness={r} metalness={m} transparent={o < 1} opacity={o} />;
const WOOD = '#c48a5c', WOOD2 = '#8f5a38', WALL = '#d0705a', FLOOR = '#b98457';

export type Extra = {slips?: number; stations?: number; icebox?: number; crate?: number; book?: number; tub?: number; tips?: number; signOn?: number};
export type Show = Extra & {roof: number; pot: number; stew: number; coin: number; stools: number; table: number; dishes: number; board: number; shake: number; split: number; plates: number; smoke: number; wall: number; window: number; tray: number; prices: number; bill: number; sign: number; lamps: number; steam: number; knock: number};
// long table pieces → small tables
const SMALL: [number, number][] = [[-1.05, -0.55], [1.05, -0.55], [-1.05, 1.45], [1.05, 1.45]];
const LONGZ = [-1.2, -0.2, 0.8, 1.8];
const signTex = (text: string) => {
	const c = document.createElement('canvas'); c.width = 690; c.height = 240; const g = c.getContext('2d')!;
	g.fillStyle = '#ffb347'; g.fillRect(0, 0, 690, 240); g.fillStyle = '#2a1418'; g.textAlign = 'center'; g.textBaseline = 'middle';
	let fs = 150; g.font = `900 ${fs}px "Inter Display"`; while (g.measureText(text).width > 620 && fs > 40) {fs -= 4; g.font = `900 ${fs}px "Inter Display"`;}
	g.fillText(text, 345, 128); const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; return tx;
};
export const Restaurant3D: React.FC<{w: number; h: number; t: number; cam: Cam; show: Show; signText?: string}> = ({w, h, t, cam, show: s, signText = 'RESTAURANT'}) => {
	const texQ = useMemo(() => signTex('?'), []);
	const texOn = useMemo(() => signTex(signText), [signText]);
	const potLathe = useMemo(() => new THREE.LatheGeometry([[0, 0], [0.25, 0.02], [0.36, 0.15], [0.4, 0.35], [0.38, 0.5], [0.42, 0.52]].map(([x, y]) => new THREE.Vector2(x, y)), 40), []);
	const bowlLathe = useMemo(() => new THREE.LatheGeometry([[0, 0], [0.07, 0], [0.13, 0.05], [0.15, 0.09]].map(([x, y]) => new THREE.Vector2(x, y)), 24), []);
	const sp = eio(clamp(s.split));
	const shake = s.shake > 0 && s.shake < 1 ? Math.sin(t * 40) * 0.03 * Math.sin(s.shake * Math.PI) : 0;
	// table piece positions
	const piece = (i: number): [number, number] => [shake + (SMALL[i][0] - 0) * sp, LONGZ[i] + (SMALL[i][1] - LONGZ[i]) * sp];
	// stools: 10 around long table → 8 around small tables (2 per table), 2 fade
	const stool = (i: number): [number, number, number] => {
		const side = i % 2 ? 1 : -1, row = Math.floor(i / 2);
		const lz = -1.4 + row * 0.85, lx = side * 0.72;
		if (row > 3) return [lx, lz, 1 - sp];
		const [tx, tz] = SMALL[row];
		return [lx + (tx + side * 0.62 - lx) * sp, lz + (tz - lz) * sp, 1];
	};
	const roofY = 2.25 + 4 * eio(clamp(s.roof));
	const wallH = 2.2 * eout(clamp(s.wall));
	const trayK = s.tray > 0 ? (t * 0.35) % 1 : 0;
	const trayPos: [number, number, number] = [0.7 + (1.05 - 0.7) * Math.sin(trayK * Math.PI), 0.95, -1.5 + (-0.55 + 1.5) * Math.sin(trayK * Math.PI) * 0.75];
	return (
		<ThreeCanvas width={w} height={h} camera={{fov: 34, position: cam.p}}>
			<CamRig cam={cam} />
			<color attach="background" args={['#3a2c3c']} />
			<fog attach="fog" args={['#3a2c3c', 22, 45]} />
			<ambientLight intensity={0.9} />
			<hemisphereLight args={['#fff1dc', '#6a4a5a', 1.1]} />
			<directionalLight position={[5, 10, 8]} intensity={2.4} color="#fff4e6" />
			<directionalLight position={[-6, 5, 4]} intensity={0.9} color="#d9c8ff" />
			<pointLight position={[0, 1.8, 0.4]} intensity={2 + 3 * s.lamps} color="#ffb347" distance={7} />
			<pointLight position={[-0.6, 1.0, -2.3]} intensity={1.5 + 1.5 * s.pot} color="#ff7a2a" distance={3.5} />
			{/* ground + road */}
			<mesh position={[0, -0.06, 2]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[30, 24]} /><Std c="#6b8a5a" r={1} /></mesh>
			<mesh position={[0, -0.03, 3.9]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[30, 1.8]} /><Std c="#8a7a6e" r={1} /></mesh>
			{Array.from({length: 14}).map((_, i) => <mesh key={'rd' + i} position={[-13 + i * 2, -0.02, 3.9]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[0.9, 0.08]} /><Std c={C.amber} e={0.5} /></mesh>)}
			{/* floor + walls (cut-away) */}
			<mesh position={[0, 0.05, -0.3]}><boxGeometry args={[4.2, 0.1, 5.6]} /><Std c={FLOOR} /></mesh>
			{Array.from({length: 7}).map((_, i) => <mesh key={'fl' + i} position={[-1.8 + i * 0.6, 0.105, -0.3]}><boxGeometry args={[0.02, 0.01, 5.6]} /><Std c="#9a6a44" /></mesh>)}
			<mesh position={[0, 1.15, -3.05]}><boxGeometry args={[4.2, 2.2, 0.1]} /><Std c={WALL} /></mesh>
			<mesh position={[-2.05, 1.15, -0.3]}><boxGeometry args={[0.1, 2.2, 5.6]} /><Std c={WALL} /></mesh>
			<mesh position={[2.05, 0.35, -0.3]}><boxGeometry args={[0.1, 0.6, 5.6]} /><Std c={WALL} /></mesh>
			{/* door frame front */}
			{[[-0.45, 1.05], [0.45, 1.05]].map(([x], i) => <mesh key={'df' + i} position={[x, 1.05, 2.45]}><boxGeometry args={[0.12, 2.0, 0.12]} /><Std c={WOOD2} /></mesh>)}
			<mesh position={[0, 2.08, 2.45]}><boxGeometry args={[1.02, 0.12, 0.12]} /><Std c={WOOD2} /></mesh>
			{s.knock > 0 && s.knock < 1 ? <mesh position={[0, 1.05, 2.45]}><planeGeometry args={[0.78, 1.95]} /><meshBasicMaterial color="#ffb347" transparent opacity={0.5 * Math.sin(s.knock * Math.PI)} side={THREE.DoubleSide} /></mesh> : null}
			{/* roof (gable), lifts away */}
			{s.roof < 1 ? <group position={[0, roofY, -0.3]}>
				<mesh position={[-1.15, 0.6, 0]} rotation={[0, 0, 0.62]}><boxGeometry args={[2.8, 0.12, 5.9]} /><Std c="#8a3a2e" o={1 - clamp(s.roof * 1.5)} /></mesh>
				<mesh position={[1.15, 0.6, 0]} rotation={[0, 0, -0.62]}><boxGeometry args={[2.8, 0.12, 5.9]} /><Std c="#8a3a2e" o={1 - clamp(s.roof * 1.5)} /></mesh>
			</group> : null}
			{s.roof < 1 ? <group>
				<mesh position={[-1.25, 1.1, 2.45]}><boxGeometry args={[1.6, 2.2, 0.1]} /><Std c={WALL} o={1 - clamp(s.roof * 1.5)} /></mesh>
				<mesh position={[1.25, 1.1, 2.45]}><boxGeometry args={[1.6, 2.2, 0.1]} /><Std c={WALL} o={1 - clamp(s.roof * 1.5)} /></mesh>
				<mesh position={[-1.25, 1.25, 2.51]}><planeGeometry args={[0.55, 0.55]} /><meshBasicMaterial color="#ffb347" transparent opacity={1 - clamp(s.roof * 1.5)} /></mesh>
				<mesh position={[1.25, 1.25, 2.51]}><planeGeometry args={[0.55, 0.55]} /><meshBasicMaterial color="#ffb347" transparent opacity={1 - clamp(s.roof * 1.5)} /></mesh>
				<mesh position={[0, 1.05, 2.47]}><planeGeometry args={[0.78, 1.95]} /><Std c="#4a2a1c" o={1 - clamp(s.roof * 1.5)} /></mesh>
			</group> : null}
			{/* hearth + pot (back left) */}
			<mesh position={[-0.6, 0.25, -2.45]}><boxGeometry args={[1.0, 0.3, 0.8]} /><Std c="#8a7a74" r={0.95} /></mesh>
			{[0, 1, 2].map((i) => <mesh key={'fire' + i} position={[-0.6 + (i - 1) * 0.18, 0.48 + 0.05 * Math.sin(t * 9 + i), -2.45]} scale={[1, 1 + 0.25 * Math.sin(t * 11 + i * 2), 1]}><coneGeometry args={[0.1, 0.32, 8]} /><meshBasicMaterial color={i === 1 ? '#ffd27a' : '#ff6a2a'} /></mesh>)}
			{s.pot > 0 ? <group position={[-0.6, 0.55, -2.45]} scale={eout(clamp(s.pot))}>
				<mesh geometry={potLathe}><meshStandardMaterial color="#2a2a2e" metalness={0.6} roughness={0.4} side={THREE.DoubleSide} /></mesh>
				<mesh position={[0, 0.12 + 0.36 * s.stew, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.37, 32]} /><Std c="#b0652a" e={0.25} /></mesh>
			</group> : null}
			{/* stove (back right) with smoke */}
			<mesh position={[0.9, 0.45, -2.6]}><boxGeometry args={[1.1, 0.8, 0.7]} /><Std c="#5a5a66" m={0.3} /></mesh>
			<mesh position={[0.9, 0.86, -2.6]}><boxGeometry args={[1.0, 0.03, 0.6]} /><Std c="#ff5a2a" e={0.6 * s.smoke + 0.15} /></mesh>
			{s.smoke > 0 ? Array.from({length: 7}).map((_, i) => {const q = (t * 0.45 + i / 7) % 1; return <mesh key={'sm' + i} position={[0.9 + Math.sin(i * 2.3 + t) * 0.2, 1.0 + q * 1.6, -2.6]} scale={0.18 + q * 0.3}><sphereGeometry args={[1, 12, 12]} /><meshBasicMaterial color="#6f6a72" transparent opacity={0.4 * s.smoke * (1 - q)} /></mesh>;}) : null}
			{/* prepared dishes on the counter */}
			{s.dishes > 0 ? <group position={[1.3, 0, -1.9]}>
				<mesh position={[0, 0.45, 0]}><boxGeometry args={[1.2, 0.9, 0.5]} /><Std c={WOOD} /></mesh>
				{[['#e8a24a', 0], ['#7a3b24', 1], ['#f0c46a', 2]].map(([col, i]: any) => <group key={'d' + i} position={[-0.38 + i * 0.38, 0.92, 0]} scale={eout(clamp(s.dishes * 3 - i))}>
					<mesh><cylinderGeometry args={[0.16, 0.16, 0.02, 20]} /><Std c="#f2ebe2" /></mesh>
					{i === 0 ? <mesh geometry={bowlLathe} position={[0, 0.01, 0]}><meshStandardMaterial color="#f2ebe2" side={THREE.DoubleSide} /></mesh> : null}
					{i === 0 ? <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.13, 20]} /><Std c={col} e={0.2} /></mesh> : null}
					{i === 1 ? <mesh position={[0, 0.07, 0]} scale={[1.3, 0.6, 0.9]}><sphereGeometry args={[0.1, 16, 12]} /><Std c={col} /></mesh> : null}
					{i === 2 ? <mesh position={[0, 0.05, 0]}><cylinderGeometry args={[0.13, 0.14, 0.07, 20]} /><Std c={col} e={0.15} /></mesh> : null}
				</group>)}
			</group> : null}
			{/* chalk board on left wall */}
			{s.board > 0 ? <group position={[-1.4, 1.15, 2.2]} rotation={[-0.12, 0.3, 0]} scale={eout(clamp(s.board * 2)) * 0.62}>
				{[-0.6, 0.6].map((x, i) => <mesh key={'lg' + i} position={[x, -0.95, -0.15]} rotation={[0.15, 0, 0]}><boxGeometry args={[0.07, 1.3, 0.07]} /><Std c={WOOD2} /></mesh>)}
				<mesh><boxGeometry args={[1.7, 1.05, 0.05]} /><Std c={WOOD} /></mesh>
				<mesh position={[0, 0, 0.03]}><planeGeometry args={[1.55, 0.9]} /><Std c="#1f2a24" r={1} /></mesh>
				{[0, 1, 2].map((i) => <mesh key={'ch' + i} position={[-0.62 + 0.4 * clamp(s.board * 3 - 0.6 - i * 0.5), 0.25 - i * 0.25, 0.04]}><planeGeometry args={[0.8 * clamp(s.board * 3 - 0.6 - i * 0.5) + 0.001, 0.07]} /><meshBasicMaterial color={C.chalk} /></mesh>)}
				{[0, 1, 2].map((i) => s.prices > i * 0.3 ? <mesh key={'pr' + i} position={[0.5, 0.25 - i * 0.25, 0.05]} scale={eout(clamp((s.prices - i * 0.3) * 3))}><planeGeometry args={[0.3, 0.13]} /><meshBasicMaterial color={C.amber} /></mesh> : null)}
			</group> : null}
			{/* table pieces */}
			{s.table > 0 ? [0, 1, 2, 3].map((i) => {const [x, z] = piece(i); return <group key={'tb' + i} position={[x, 0, z]} scale={[1, eout(clamp(s.table)), 1]}>
				<mesh position={[0, 0.78, 0]}><boxGeometry args={[0.95 - 0.1 * sp, 0.07, 0.99 - 0.15 * sp]} /><Std c={WOOD} /></mesh>
				{[[-0.35, -0.35], [0.35, -0.35], [-0.35, 0.35], [0.35, 0.35]].map(([a, b], j) => <mesh key={j} position={[a, 0.4, b]}><boxGeometry args={[0.06, 0.75, 0.06]} /><Std c={WOOD2} /></mesh>)}
				{/* shared bowls before split, own plates + candle after */}
				{sp < 0.5 ? <mesh geometry={bowlLathe} position={[0, 0.82, 0]} scale={1.4}><meshStandardMaterial color="#f2ebe2" side={THREE.DoubleSide} /></mesh> : null}
				{s.plates > 0 ? [-0.22, 0.22].map((px, j) => <mesh key={'pl' + j} position={[px, 0.83, 0]} scale={eout(clamp(s.plates))}><cylinderGeometry args={[0.15, 0.15, 0.02, 20]} /><Std c="#f6efe6" /></mesh>) : null}
				{s.lamps > 0 ? <group position={[0, 0, 0]}>
					<mesh position={[0, 0.88, 0.25]}><cylinderGeometry args={[0.03, 0.03, 0.12, 10]} /><Std c="#fff1d6" /></mesh>
					<mesh position={[0, 0.98 + 0.01 * Math.sin(t * 13 + i), 0.25]}><sphereGeometry args={[0.035, 10, 10]} /><meshBasicMaterial color="#ffd27a" transparent opacity={clamp(s.lamps)} /></mesh>
				</group> : null}
				{s.steam > 0 ? [0, 1, 2].map((k) => {const q = (t * 0.5 + k / 3 + i * 0.2) % 1; return <mesh key={'st' + k} position={[-0.22 + Math.sin(q * 6 + k) * 0.04, 0.9 + q * 0.6, 0]} scale={0.04 + q * 0.06}><sphereGeometry args={[1, 8, 8]} /><meshBasicMaterial color="#fff6ec" transparent opacity={0.45 * s.steam * (1 - q)} /></mesh>;}) : null}
			</group>;}) : null}
			{/* stools */}
			{s.stools > 0 ? Array.from({length: 10}).map((_, i) => {const [x, z, o] = stool(i); const k = eout(clamp(s.stools * 3 - i * 0.18)); return o > 0.01 && k > 0 ? <group key={'sl' + i} position={[x + shake, 0, z]} scale={k * (0.4 + 0.6 * o)}>
				<mesh position={[0, 0.48, 0]}><cylinderGeometry args={[0.17, 0.17, 0.05, 16]} /><Std c="#a8693f" o={o} /></mesh>
				<mesh position={[0, 0.24, 0]}><cylinderGeometry args={[0.04, 0.05, 0.46, 8]} /><Std c={WOOD2} o={o} /></mesh>
			</group> : null;}) : null}
			{/* coin */}
			{s.coin > 0 && s.coin < 1 ? <mesh position={[-0.05, 0.6 + 0.9 * Math.sin(Math.min(1, s.coin * 1.6) * Math.PI), -1.95]} rotation={[s.coin * 18, 0, 0]}><cylinderGeometry args={[0.09, 0.09, 0.02, 20]} /><meshStandardMaterial color="#ffd27a" emissive="#ffb347" emissiveIntensity={0.6} metalness={0.9} roughness={0.25} /></mesh> : null}
			{/* partition wall with pass-through window */}
			{s.wall > 0 ? <group position={[0, 0.1, -1.55]}>
				<mesh position={[-1.0, wallH / 2, 0]}><boxGeometry args={[2.0, wallH, 0.1]} /><Std c="#e8c9a8" /></mesh>
				<mesh position={[1.65, wallH / 2, 0]}><boxGeometry args={[0.7, wallH, 0.1]} /><Std c="#e8c9a8" /></mesh>
				{wallH > 1.3 ? <mesh position={[0.65, 0.4, 0]}><boxGeometry args={[1.3, 0.8, 0.1]} /><Std c="#e8c9a8" /></mesh> : null}
				{wallH > 1.8 ? <mesh position={[0.65, 1.9, 0]}><boxGeometry args={[1.3, 0.6, 0.1]} /><Std c="#e8c9a8" /></mesh> : null}
				{s.window > 0 ? <>
					<mesh position={[0.65, 0.82, 0.12]}><boxGeometry args={[1.35, 0.05, 0.3]} /><Std c={WOOD} /></mesh>
					<lineSegments position={[0.65, 1.2, 0]}><edgesGeometry args={[new THREE.BoxGeometry(1.3, 0.8, 0.12)]} /><lineBasicMaterial color="#ffb347" transparent opacity={clamp(s.window)} /></lineSegments>
				</> : null}
			</group> : null}
			{/* tray travelling from the window to a table */}
			{s.tray > 0 ? <group position={trayPos} scale={eout(clamp(s.tray))}>
				<mesh><cylinderGeometry args={[0.24, 0.24, 0.02, 24]} /><meshStandardMaterial color="#c9c3bd" metalness={0.7} roughness={0.3} /></mesh>
				<mesh geometry={bowlLathe} position={[-0.08, 0.01, 0]}><meshStandardMaterial color="#f2ebe2" side={THREE.DoubleSide} /></mesh>
				<mesh position={[0.1, 0.05, 0.04]}><cylinderGeometry args={[0.06, 0.06, 0.08, 12]} /><Std c="#f0c46a" /></mesh>
			</group> : null}
			{/* the bill */}
			{s.bill > 0 ? <group position={[1.05 + 0.2, 0.83, 1.45 + 0.28]} rotation={[-Math.PI / 2, 0, 0.3]} scale={eout(clamp(s.bill))}>
				<mesh><planeGeometry args={[0.22, 0.32]} /><meshBasicMaterial color="#fff6ec" side={THREE.DoubleSide} /></mesh>
				{[0, 1, 2].map((i) => <mesh key={i} position={[0, 0.09 - i * 0.06, 0.002]}><planeGeometry args={[0.15, 0.015]} /><meshBasicMaterial color="#5a4a44" /></mesh>)}
				<mesh position={[0, -0.11, 0.002]}><planeGeometry args={[0.15, 0.025]} /><meshBasicMaterial color="#d08a20" /></mesh>
			</group> : null}
			{/* sign on a post by the road */}
			{s.sign > 0 ? <group position={[-2.5, 0, 2.9]}>
				<mesh position={[0, 1.4 * eout(clamp(s.sign)), 0]}><boxGeometry args={[0.1, 2.8 * eout(clamp(s.sign)), 0.1]} /><Std c={WOOD2} /></mesh>
				<group position={[0.75, 2.55, 0]} scale={eout(clamp(s.sign * 1.4 - 0.4))}>
					<mesh position={[-0.35, 0.3, 0]}><boxGeometry args={[0.04, 0.25, 0.04]} /><Std c="#2a2a2e" /></mesh>
					<mesh position={[0.35, 0.3, 0]}><boxGeometry args={[0.04, 0.25, 0.04]} /><Std c="#2a2a2e" /></mesh>
					<mesh position={[0, 0, 0]}><boxGeometry args={[1.5, 0.6, 0.06]} /><Std c="#2a1418" /></mesh>
					<mesh position={[0, 0, 0.035]}><planeGeometry args={[1.38, 0.48]} /><meshBasicMaterial map={(s.signOn ?? s.lamps) > 0.5 ? texOn : texQ} transparent opacity={0.6 + 0.4 * Math.max(s.lamps, s.sign)} /></mesh>
				</group>
			</group> : null}
			{/* warm street lamps glow at the end */}
			{s.lamps > 0 ? [[-4, 3], [3.6, 3], [7, 3]].map(([x, z], i) => <group key={'lp' + i} position={[x, 0, z]}>
				<mesh position={[0, 1.3, 0]}><cylinderGeometry args={[0.04, 0.05, 2.6, 8]} /><Std c="#2a2a2e" /></mesh>
				<mesh position={[0, 2.65, 0]}><sphereGeometry args={[0.13, 12, 12]} /><meshBasicMaterial color="#ffd27a" transparent opacity={clamp(s.lamps)} /></mesh>
			</group>) : null}
			{/* LONG-FORM EXTRAS */}
			{(s.slips ?? 0) > 0 ? <group position={[0.65, 1.72, -1.47]}>
				<mesh><boxGeometry args={[1.3, 0.03, 0.03]} /><meshStandardMaterial color="#c9c3bd" metalness={0.7} roughness={0.3} /></mesh>
				{Array.from({length: 6}).map((_, i) => {const k = clamp((s.slips ?? 0) * 6 - i); return k > 0 ? <mesh key={'sl' + i} position={[-0.55 + i * 0.22, -0.11, 0.02]} rotation={[0, 0, (i % 2 ? 0.06 : -0.05)]} scale={eout(k)}><planeGeometry args={[0.16, 0.2]} /><meshBasicMaterial color="#fffaf0" side={THREE.DoubleSide} /></mesh> : null;})}
			</group> : null}
			{(s.stations ?? 0) > 0 ? [[-0.6, -2.0, '#ff7a4a'], [0.9, -2.15, '#ffd27a'], [1.3, -1.45, '#8fe388']].map(([x, z, col]: any, i) => <mesh key={'stn' + i} position={[x, 1.45 + 0.05 * Math.sin(t * 2 + i), z]} rotation={[-Math.PI / 2, 0, 0]} scale={eout(clamp((s.stations ?? 0) * 3 - i))}><torusGeometry args={[0.36, 0.045, 12, 48]} /><meshBasicMaterial color={col} /></mesh>) : null}
			{(s.icebox ?? 0) > 0 ? <group position={[-1.65, 0, -2.7]} scale={eout(clamp(s.icebox ?? 0))}>
				<mesh position={[0, 0.35, 0]}><boxGeometry args={[0.5, 0.6, 0.5]} /><Std c={WOOD} /></mesh>
				{Array.from({length: 6}).map((_, i) => <mesh key={'ice' + i} position={[-0.13 + (i % 3) * 0.13, 0.7 + Math.floor(i / 3) * 0.08, -0.06 + Math.floor(i / 3) * 0.1]} rotation={[0.3 * i, 0.5 * i, 0]}><boxGeometry args={[0.12, 0.1, 0.12]} /><meshStandardMaterial color="#cfefff" emissive="#9fdcff" emissiveIntensity={0.35} transparent opacity={0.85} roughness={0.1} /></mesh>)}
			</group> : null}
			{(s.crate ?? 0) > 0 ? <group position={[-2.6, 0, -2.2 + (1 - eout(clamp(s.crate ?? 0))) * 2]} >
				<mesh position={[0, 0.2, 0]}><boxGeometry args={[0.6, 0.35, 0.45]} /><Std c="#d6a46a" /></mesh>
				{[['#ff6a3d', -0.15, 0], ['#8fe388', 0.05, 0.08], ['#ffe08a', 0.18, -0.08], ['#ff6a3d', 0.0, -0.1], ['#fff6ec', -0.12, 0.1]].map(([col, x, z]: any, i) => <mesh key={'veg' + i} position={[x, 0.42, z]}><sphereGeometry args={[0.09, 12, 12]} /><Std c={col} /></mesh>)}
			</group> : null}
			{(s.book ?? 0) > 0 ? <group position={[0.85, 0, 2.05]} scale={eout(clamp(s.book ?? 0))}>
				<mesh position={[0, 0.5, 0]}><cylinderGeometry args={[0.04, 0.06, 1.0, 10]} /><Std c={WOOD2} /></mesh>
				<mesh position={[0, 1.02, 0]} rotation={[-0.5, 0, 0]}><boxGeometry args={[0.42, 0.04, 0.3]} /><Std c={WOOD2} /></mesh>
				<mesh position={[0, 1.06, 0.01]} rotation={[-0.5, 0, 0]}><boxGeometry args={[0.38, 0.05, 0.26]} /><Std c="#8a2f45" /></mesh>
				<mesh position={[0, 1.09, 0.02]} rotation={[-0.5, 0, 0]}><planeGeometry args={[0.34, 0.22]} /><meshBasicMaterial color="#fffaf0" side={THREE.DoubleSide} /></mesh>
			</group> : null}
			{(s.tub ?? 0) > 0 ? <group position={[-1.65, 0, -1.95]} scale={eout(clamp(s.tub ?? 0))}>
				<mesh position={[0, 0.3, 0]}><boxGeometry args={[0.5, 0.5, 0.42]} /><Std c={WOOD} /></mesh>
				<mesh position={[0, 0.56, 0]}><boxGeometry args={[0.42, 0.04, 0.34]} /><meshStandardMaterial color="#9fdcff" emissive="#9fdcff" emissiveIntensity={0.3} /></mesh>
				{[0, 1, 2, 3].map((i) => <mesh key={'pl' + i} position={[-0.12 + i * 0.08, 0.72, -0.12]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.13, 0.13, 0.015, 18]} /><Std c="#f6efe6" /></mesh>)}
				{[0, 1, 2].map((k) => {const q = (t * 0.6 + k / 3) % 1; return <mesh key={'bub' + k} position={[0.1 - k * 0.08, 0.6 + q * 0.4, 0.05]} scale={0.03 + q * 0.04}><sphereGeometry args={[1, 8, 8]} /><meshBasicMaterial color="#ffffff" transparent opacity={0.5 * (1 - q)} /></mesh>;})}
			</group> : null}
			{(s.tips ?? 0) > 0 ? [0, 1, 2].map((i) => <mesh key={'tip' + i} position={[-1.05 + 0.3, 0.83 + i * 0.02 + (1 - eout(clamp((s.tips ?? 0) * 3 - i))) * 0.6, -0.55 + 0.25]}><cylinderGeometry args={[0.07, 0.07, 0.02, 18]} /><meshStandardMaterial color="#ffd27a" emissive="#ffb347" emissiveIntensity={0.5} metalness={0.9} roughness={0.25} /></mesh>) : null}
		</ThreeCanvas>
	);
};

export const Callout: React.FC<{text: string; col?: string; size?: number}> = ({text, col = C.white, size = 34}) => (
	<div style={{display: 'flex', alignItems: 'center', gap: 10}}>
		<div style={{width: 14, height: 14, borderRadius: 7, background: col, boxShadow: `0 0 12px ${col}`}} />
		<div style={{background: col, color: C.ink, fontFamily: DISPLAY, fontWeight: 900, fontSize: size, padding: `${size * 0.25}px ${size * 0.55}px`, borderRadius: 14, boxShadow: '0 8px 20px rgba(0,0,0,.4)'}}>{text}</div>
	</div>
);
