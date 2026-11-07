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

// drain path: straight (u=0) → U-trap (u=1); same number of points so we can morph
const STRAIGHT: [number, number][] = [[0, 0.05], [0, -0.3], [0, -0.6], [0, -0.9], [0, -1.2], [0, -1.5], [0.3, -1.8], [1.0, -2.2], [1.8, -2.6], [2.6, -3.0]];
const TRAP: [number, number][] = [[0, 0.05], [0, -0.35], [0.05, -0.75], [0.3, -0.95], [0.55, -0.75], [0.6, -0.4], [0.9, -0.5], [1.4, -1.6], [2.0, -2.5], [2.6, -3.0]];
const pathAt = (u: number) => new THREE.CatmullRomCurve3(STRAIGHT.map(([x, y], i) => new THREE.Vector3(x + (TRAP[i][0] - x) * u, y + (TRAP[i][1] - y) * u, 0)));

export type Show = {pipe: number; trap: number; tank: number; chain: number; supply: number; float: number; bowl: number; seat: number};
export const Toilet3D: React.FC<{w: number; h: number; t: number; cam: Cam; show: Show; bucketX: number; stink: number; flush: number; level: number; glow?: number}> = ({w, h, t, cam, show, bucketX, stink, flush, level, glow = 0}) => {
	const u = eio(clamp(show.trap));
	const curve = useMemo(() => pathAt(u), [u]);
	const tube = useMemo(() => new THREE.TubeGeometry(curve, 120, 0.13, 18, false), [curve]);
	// water sitting in the U (between path params ~0.24..0.5)
	const water = useMemo(() => {
		const pts: any[] = [];
		for (let i = 0; i <= 30; i++) pts.push(curve.getPoint(0.2 + (0.33 * i) / 30));
		return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, 0.105, 14, false);
	}, [curve]);
	const bucketLathe = useMemo(() => new THREE.LatheGeometry([[0, 0], [0.38, 0], [0.48, 0.75], [0.5, 0.78]].map(([x, y]) => new THREE.Vector2(x, y)), 48), []);
	const bowlLathe = useMemo(() => new THREE.LatheGeometry([[0, 0], [0.32, 0], [0.3, 0.22], [0.42, 0.42], [0.56, 0.72], [0.58, 0.8], [0.5, 0.8], [0.44, 0.7], [0.2, 0.45], [0.13, 0.3]].map(([x, y]) => new THREE.Vector2(x, y)), 64), []);
	const lvl = clamp(level);
	const floatY = 2.25 + 0.55 * lvl;
	const armA = -0.5 + 0.6 * lvl;
	return (
		<ThreeCanvas width={w} height={h} camera={{fov: 34, position: cam.p}}>
			<CamRig cam={cam} />
			<color attach="background" args={['#06121a']} />
			<fog attach="fog" args={['#06121a', 12, 30]} />
			<ambientLight intensity={0.55} />
			<directionalLight position={[4, 8, 6]} intensity={1.6} />
			<directionalLight position={[-5, 2, -2]} intensity={0.6} color="#3ee6d0" />
			<pointLight position={[0, 1.5, 2]} intensity={1.5 + 2 * glow} color="#ffc35a" distance={7} />
			{/* room: back wall + floor slab (cut-away) */}
			<mesh position={[0, 1.6, -1.2]}><boxGeometry args={[5, 3.6, 0.1]} /><meshStandardMaterial color="#123041" roughness={0.9} /></mesh>
			{Array.from({length: 8}).map((_, i) => <mesh key={'tile' + i} position={[-2.5 + i * 0.7 + 0.35, 1.6, -1.14]}><boxGeometry args={[0.02, 3.6, 0.02]} /><meshStandardMaterial color="#1c4a5f" /></mesh>)}
			<mesh position={[0, -0.12, -0.1]}><boxGeometry args={[5, 0.24, 2.2]} /><meshStandardMaterial color="#1a3b4d" roughness={0.9} /></mesh>
			<mesh position={[0, 0, 1.0]}><boxGeometry args={[5, 0.03, 0.03]} /><meshStandardMaterial color="#3ee6d0" emissive="#3ee6d0" emissiveIntensity={0.6} /></mesh>
			{/* earth under the floor */}
			<mesh position={[0.6, -1.9, -0.6]}><boxGeometry args={[6.2, 3.3, 0.1]} /><meshStandardMaterial color="#0d2430" /></mesh>
			{/* ditch */}
			<mesh position={[2.9, -3.15, 0]}><boxGeometry args={[1.4, 0.3, 1.2]} /><meshStandardMaterial color="#3d5a2e" emissive="#3d5a2e" emissiveIntensity={0.2} /></mesh>
			{/* drain pipe */}
			{show.pipe > 0 ? <mesh geometry={tube} scale={[1, eout(clamp(show.pipe)), 1]}><meshStandardMaterial color="#c9d8de" metalness={0.4} roughness={0.35} transparent opacity={0.55} side={THREE.DoubleSide} /></mesh> : null}
			{show.trap > 0.6 ? <mesh geometry={water}><meshStandardMaterial color="#3ee6d0" emissive="#3ee6d0" emissiveIntensity={0.5 + 0.4 * Math.sin(t * 3)} transparent opacity={clamp((show.trap - 0.6) * 3)} /></mesh> : null}
			{/* flush particles along the pipe */}
			{flush > 0 ? Array.from({length: 26}).map((_, i) => {const q = ((flush * 1.4 + i / 26) % 1); const p = curve.getPoint(q); return <mesh key={'f' + i} position={[p.x, p.y, p.z]}><sphereGeometry args={[0.07, 8, 8]} /><meshBasicMaterial color="#7ff3ff" transparent opacity={0.85 * Math.sin(Math.min(1, flush * 3) * Math.PI / 2) * (1 - clamp((flush - 0.8) * 5))} /></mesh>;}) : null}
			{/* stink clouds */}
			{stink > 0 ? Array.from({length: 7}).map((_, i) => {const q = ((t * 0.35 + i / 7) % 1); return <mesh key={'s' + i} position={[Math.sin(i * 2.1 + t) * 0.35, 0.1 + q * 2.2, 0.2]} scale={0.25 + q * 0.35}><sphereGeometry args={[1, 14, 14]} /><meshBasicMaterial color="#b6ff4d" transparent opacity={0.28 * stink * (1 - q)} /></mesh>;}) : null}
			{/* bucket → porcelain bowl */}
			<group position={[bucketX, 0.0, 0]}>
				{show.bowl < 1 ? <mesh geometry={bucketLathe} scale={1 - eout(clamp(show.bowl))}><meshStandardMaterial color="#8fa3ad" metalness={0.6} roughness={0.35} side={THREE.DoubleSide} /></mesh> : null}
				{show.bowl > 0 ? <mesh geometry={bowlLathe} scale={eout(clamp(show.bowl))}><meshStandardMaterial color="#f4fbff" roughness={0.18} metalness={0.05} side={THREE.DoubleSide} /></mesh> : null}
				{show.seat > 0 ? <mesh position={[0, 0.84 + (1 - eout(clamp(show.seat))) * 0.5, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.47, 0.06, 14, 48]} /><meshStandardMaterial color="#2b3b44" roughness={0.4} /></mesh> : null}
			</group>
			{/* cistern high on the wall */}
			{show.tank > 0 ? <group position={[0, 0, -0.75]} scale={eout(clamp(show.tank))}>
				<mesh position={[0, 2.6, 0]}><boxGeometry args={[1.0, 0.8, 0.5]} /><meshStandardMaterial color="#9fe9f2" transparent opacity={0.28} side={THREE.DoubleSide} /></mesh>
				<lineSegments position={[0, 2.6, 0]}><edgesGeometry args={[new THREE.BoxGeometry(1.0, 0.8, 0.5)]} /><lineBasicMaterial color="#3ee6d0" /></lineSegments>
				<mesh position={[0, 2.21 + 0.36 * lvl, 0]} scale={[1, Math.max(0.01, lvl), 1]}><boxGeometry args={[0.94, 0.72, 0.44]} /><meshStandardMaterial color="#3ee6d0" emissive="#3ee6d0" emissiveIntensity={0.35} transparent opacity={0.6} /></mesh>
				{/* flush pipe from cistern to bowl */}
				<mesh position={[0, 1.4, 0.15]}><cylinderGeometry args={[0.05, 0.05, 1.6, 12]} /><meshStandardMaterial color="#c9d8de" metalness={0.5} roughness={0.3} /></mesh>
				<mesh position={[0, 0.62, 0.45]} rotation={[0.9, 0, 0]}><cylinderGeometry args={[0.05, 0.05, 0.5, 12]} /><meshStandardMaterial color="#c9d8de" metalness={0.5} roughness={0.3} /></mesh>
			</group> : null}
			{show.chain > 0 ? <group position={[0.42, 2.2, -0.45]}>
				{Array.from({length: Math.round(9 * clamp(show.chain))}).map((_, i) => <mesh key={i} position={[0, -i * 0.11 - (flush > 0 && flush < 0.15 ? 0.15 : 0), 0]} rotation={[0, i % 2 ? Math.PI / 2 : 0, 0]}><torusGeometry args={[0.035, 0.012, 6, 12]} /><meshStandardMaterial color="#d7c08a" metalness={0.8} roughness={0.3} /></mesh>)}
				<mesh position={[0, -1.05 - (flush > 0 && flush < 0.15 ? 0.15 : 0), 0]}><sphereGeometry args={[0.07, 12, 12]} /><meshStandardMaterial color="#d7c08a" metalness={0.8} roughness={0.3} /></mesh>
			</group> : null}
			{/* water supply + float valve */}
			{show.supply > 0 ? <group>
				<mesh position={[-1.7, 2.85, -0.75]} rotation={[0, 0, Math.PI / 2]} scale={[1, eout(clamp(show.supply)), 1]}><cylinderGeometry args={[0.05, 0.05, 2.4, 12]} /><meshStandardMaterial color="#4f9dff" emissive="#4f9dff" emissiveIntensity={0.4} /></mesh>
				<mesh position={[-0.42, 2.85, -0.75]}><boxGeometry args={[0.12, 0.12, 0.12]} /><meshStandardMaterial color="#ffc35a" /></mesh>
			</group> : null}
			{show.float > 0 ? <group position={[-0.42, 2.85, -0.75]} rotation={[0, 0, armA]} scale={eout(clamp(show.float))}>
				<mesh position={[0.3, 0, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.015, 0.015, 0.6, 8]} /><meshStandardMaterial color="#ffc35a" /></mesh>
				<mesh position={[0.62, 0, 0]}><sphereGeometry args={[0.1, 16, 16]} /><meshStandardMaterial color="#ff5a6e" emissive="#ff5a6e" emissiveIntensity={0.4} /></mesh>
			</group> : null}
			{/* inflow drops while the tank refills */}
			{show.supply > 0.9 && lvl < 0.98 && lvl > 0.02 ? Array.from({length: 6}).map((_, i) => <mesh key={'dr' + i} position={[-0.36, 2.75 - ((t * 2 + i / 6) % 1) * 0.5, -0.75]}><sphereGeometry args={[0.03, 6, 6]} /><meshBasicMaterial color="#7ff3ff" /></mesh>) : null}
			{void floatY}
		</ThreeCanvas>
	);
};

export const Callout: React.FC<{text: string; col?: string; size?: number}> = ({text, col = C.white, size = 34}) => (
	<div style={{display: 'flex', alignItems: 'center', gap: 10}}>
		<div style={{width: 14, height: 14, borderRadius: 7, background: col, boxShadow: `0 0 12px ${col}`}} />
		<div style={{background: col, color: C.ink, fontFamily: DISPLAY, fontWeight: 900, fontSize: size, padding: `${size * 0.25}px ${size * 0.55}px`, borderRadius: 14, boxShadow: '0 8px 20px rgba(0,0,0,.4)'}}>{text}</div>
	</div>
);
