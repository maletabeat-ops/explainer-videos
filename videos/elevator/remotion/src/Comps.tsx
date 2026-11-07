import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {C, DISPLAY, FPS, clamp, eio, eout} from './ui';

// ---------------- shared helpers ----------------
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

// ---------------- the lift diorama ----------------
// show: 0..1 visibility of each invention step
export type Show = {wheel: number; box: number; cw: number; motor: number; rails: number; brake: number; doors: number; buttons: number};
const FLOORS = 10, FH = 1.0;
const Rod: React.FC<{a: [number, number, number]; b: [number, number, number]; r?: number; col?: string; emissive?: number}> = ({a, b, r = 0.025, col = '#d9e6ff', emissive = 0}) => {
	const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b);
	const len = va.distanceTo(vb);
	if (len < 0.001) return null;
	const mid = va.clone().add(vb).multiplyScalar(0.5);
	const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), vb.clone().sub(va).normalize());
	return <mesh position={mid} quaternion={q}><cylinderGeometry args={[r, r, len, 10]} /><meshStandardMaterial color={col} emissive={col} emissiveIntensity={emissive} roughness={0.5} /></mesh>;
};
export const Lift3D: React.FC<{w: number; h: number; t: number; cam: Cam; show: Show; boxY: number; ropeOK: boolean; teeth: number; spin: number; doorFloor: number; doorOpen: number; bagY: number; litFloor: number; sparks: number}> = ({w, h, t, cam, show, boxY, ropeOK, teeth, spin, doorFloor, doorOpen, bagY, litFloor, sparks}) => {
	const top = FLOORS * FH + 0.6;
	const wheelY = top + 0.55, wheelR = 0.5;
	const bx = -0.45, cwx = 0.55;
	const cwY = Math.max(0.2, top - 1.6 - boxY);
	return (
		<ThreeCanvas width={w} height={h} camera={{fov: 34, position: cam.p}}>
			<CamRig cam={cam} />
			<color attach="background" args={['#070d1a']} />
			<fog attach="fog" args={['#070d1a', 20, 48]} />
			<ambientLight intensity={0.5} />
			<directionalLight position={[6, 14, 8]} intensity={1.5} />
			<directionalLight position={[-6, 4, -4]} intensity={0.6} color="#4fd1ff" />
			{/* ground */}
			<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}><planeGeometry args={[40, 40]} /><meshStandardMaterial color="#0b1730" roughness={1} /></mesh>
			{/* building: cut-away slabs left (stairs) and right (flat) of the shaft */}
			{Array.from({length: FLOORS + 1}).map((_, i) => (
				<group key={i} position={[0, i * FH, 0]}>
					<mesh position={[-1.85, -0.04, 0]}><boxGeometry args={[1.7, 0.08, 2.2]} /><meshStandardMaterial color="#14233f" roughness={0.9} /></mesh>
					<mesh position={[1.75, -0.04, 0]}><boxGeometry args={[1.5, 0.08, 2.2]} /><meshStandardMaterial color="#14233f" roughness={0.9} /></mesh>
					<mesh position={[-1.85, 0, 1.1]}><boxGeometry args={[1.7, 0.025, 0.025]} /><meshStandardMaterial color="#2b5f80" emissive="#2b5f80" emissiveIntensity={0.3} /></mesh>
					<mesh position={[1.75, 0, 1.1]}><boxGeometry args={[1.5, 0.025, 0.025]} /><meshStandardMaterial color="#2b5f80" emissive="#2b5f80" emissiveIntensity={0.3} /></mesh>
					{i < FLOORS ? <mesh position={[2.48, 0.5, 0]}><boxGeometry args={[0.04, 0.5, 1.2]} /><meshStandardMaterial color={i === FLOORS - 1 ? '#ffb547' : '#1d3157'} emissive={i === FLOORS - 1 ? '#ffb547' : '#1d3157'} emissiveIntensity={i === FLOORS - 1 ? 1.2 : 0.3} /></mesh> : null}
				</group>
			))}
			{/* stairs (zig-zag) on the left */}
			{Array.from({length: FLOORS}).map((_, i) => <mesh key={'s' + i} position={[-1.85, i * FH + 0.5, i % 2 ? 0.45 : -0.45]} rotation={[0, 0, (i % 2 ? 1 : -1) * 0.6]}><boxGeometry args={[1.5, 0.05, 0.6]} /><meshStandardMaterial color="#2a4573" /></mesh>)}
			{/* the grocery bag climbing the stairs */}
			{bagY >= 0 ? <mesh position={[-1.85 + Math.sin(bagY * Math.PI) * 0.55, bagY + 0.25, (Math.floor(bagY) % 2 ? 0.5 : -0.5)]}><boxGeometry args={[0.28, 0.32, 0.2]} /><meshStandardMaterial color="#ffb547" emissive="#ffb547" emissiveIntensity={0.6} /></mesh> : null}
			{/* shaft outline */}
			{show.rails > 0 ? <group>
				{[[-1.0, 1.05], [1.0, 1.05], [-1.0, -1.05], [1.0, -1.05]].map(([x, z], i) => <Rod key={i} a={[x, 0, z]} b={[x, (FLOORS * FH + 0.5) * show.rails, z]} r={0.02} col="#4fd1ff" emissive={0.8} />)}
				{/* guide rails with notches */}
				{[-0.5, 0.5].map((z, i) => <group key={'g' + i}>
					<Rod a={[bx - 0.48, 0, z]} b={[bx - 0.48, (FLOORS * FH + 0.4) * show.rails, z]} r={0.035} col="#9fb4d6" />
					{Array.from({length: Math.floor(40 * show.rails)}).map((_, j) => <mesh key={j} position={[bx - 0.44, j * 0.26 + 0.1, z]}><boxGeometry args={[0.05, 0.05, 0.08]} /><meshStandardMaterial color="#c7d6ee" /></mesh>)}
				</group>)}
			</group> : null}
			{/* roof wheel + motor */}
			{show.wheel > 0 ? <group position={[0.05, wheelY, 0]} scale={eout(show.wheel)}>
				<group rotation={[0, 0, -spin]}>
					<mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[wheelR, wheelR, 0.16, 40]} /><meshStandardMaterial color="#c7d6ee" metalness={0.6} roughness={0.3} /></mesh>
					{[0, 1, 2].map((i) => <mesh key={i} rotation={[0, 0, (i * Math.PI) / 3]}><boxGeometry args={[wheelR * 1.9, 0.06, 0.18]} /><meshStandardMaterial color="#4a5f85" /></mesh>)}
				</group>
				<mesh position={[0, -0.45, 0]}><boxGeometry args={[0.12, 0.6, 0.12]} /><meshStandardMaterial color="#4a5f85" /></mesh>
			</group> : null}
			{show.motor > 0 ? <group position={[0.05, wheelY, -0.55]} scale={eout(show.motor)}>
				<mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.32, 0.32, 0.7, 28]} /><meshStandardMaterial color="#ffb547" emissive="#ffb547" emissiveIntensity={0.25 + 0.4 * Math.abs(Math.sin(t * 20)) * (spin > 0 ? 1 : 0)} metalness={0.4} roughness={0.4} /></mesh>
				{Array.from({length: 8}).map((_, i) => <mesh key={i} position={[Math.cos(i * 0.8) * 0.33, Math.sin(i * 0.8) * 0.33, 0]}><boxGeometry args={[0.05, 0.05, 0.6]} /><meshStandardMaterial color="#c47b1c" /></mesh>)}
			</group> : null}
			{/* ropes */}
			{show.wheel > 0 && show.box > 0 ? <>
				{ropeOK ? <Rod a={[bx, wheelY, 0]} b={[bx, boxY + 0.95, 0]} r={0.03} col="#f5f8ff" /> : <Rod a={[bx, wheelY, 0]} b={[bx, wheelY - 1.2, 0]} r={0.03} col="#f5f8ff" />}
				{show.cw > 0 ? <Rod a={[cwx, wheelY, 0]} b={[cwx, cwY + 0.9, 0]} r={0.03} col="#f5f8ff" /> : <Rod a={[cwx, wheelY, 0]} b={[cwx + 1.4, 0.9, 0.3]} r={0.03} col="#f5f8ff" />}
			</> : null}
			{/* the box (car) */}
			{show.box > 0 ? <group position={[bx, boxY, 0]} scale={eout(show.box)}>
				<mesh position={[0, 0.45, 0]}><boxGeometry args={[0.86, 0.9, 0.86]} /><meshStandardMaterial color="#ffb547" emissive="#ffb547" emissiveIntensity={0.25} transparent opacity={0.35} /></mesh>
				<lineSegments position={[0, 0.45, 0]}><edgesGeometry args={[new THREE.BoxGeometry(0.86, 0.9, 0.86)]} /><lineBasicMaterial color="#ffb547" /></lineSegments>
				<mesh position={[0, 0.82, 0]}><boxGeometry args={[0.6, 0.04, 0.6]} /><meshStandardMaterial color="#ffb547" emissive="#ffb547" emissiveIntensity={1.2} /></mesh>
				<mesh position={[0.15, 0.16, 0.1]}><boxGeometry args={[0.28, 0.32, 0.2]} /><meshStandardMaterial color="#ffb547" emissive="#ffb547" emissiveIntensity={0.5} /></mesh>
				{/* safety dogs (teeth) */}
				{show.brake > 0 ? [-0.5, 0.5].map((z, i) => <group key={i} position={[-0.43 - 0.06 * teeth, 0.92, z * 0.92]} scale={eout(show.brake)}>
					<mesh rotation={[0, 0, 0.6 - 0.9 * teeth]}><boxGeometry args={[0.2, 0.06, 0.08]} /><meshStandardMaterial color={teeth > 0.5 ? '#ff4d5e' : '#4dffa6'} emissive={teeth > 0.5 ? '#ff4d5e' : '#4dffa6'} emissiveIntensity={0.9} /></mesh>
				</group>) : null}
			</group> : null}
			{/* sparks when the teeth bite */}
			{sparks > 0 ? Array.from({length: 14}).map((_, i) => {const a = i * 2.3; const r = sparks * (0.3 + (i % 4) * 0.12); return <mesh key={'sp' + i} position={[bx - 0.5 + Math.cos(a) * r * 0.3, boxY + 0.92 + Math.sin(a) * r, (i % 2 ? 0.46 : -0.46)]}><sphereGeometry args={[0.025, 6, 6]} /><meshBasicMaterial color="#ffd27a" transparent opacity={1 - sparks} /></mesh>;}) : null}
			{/* counterweight */}
			{show.cw > 0 ? <group position={[cwx, cwY, 0]} scale={eout(show.cw)}>
				<mesh position={[0, 0.45, 0]}><boxGeometry args={[0.3, 0.9, 0.6]} /><meshStandardMaterial color="#9b8cff" emissive="#9b8cff" emissiveIntensity={0.25} metalness={0.4} roughness={0.5} /></mesh>
				{[0.2, 0.4, 0.6].map((y) => <mesh key={y} position={[0, y + 0.05, 0]}><boxGeometry args={[0.32, 0.02, 0.62]} /><meshStandardMaterial color="#5a4fb0" /></mesh>)}
			</group> : null}
			{/* landing doors */}
			{show.doors > 0 ? Array.from({length: FLOORS}).map((_, i) => {
				const open = i === doorFloor ? doorOpen : 0;
				return <group key={'d' + i} position={[bx, i * FH + 0.45, 0.62]} scale={[1, eout(show.doors), 1]}>
					{[-1, 1].map((sd) => <mesh key={sd} position={[sd * (0.21 + 0.36 * open), 0, 0]}><boxGeometry args={[0.42, 0.86, 0.04]} /><meshStandardMaterial color={i === doorFloor ? '#4dffa6' : '#5f7aa8'} emissive={i === doorFloor ? '#4dffa6' : '#000'} emissiveIntensity={i === doorFloor ? 0.35 : 0} metalness={0.5} roughness={0.35} /></mesh>)}
				</group>;
			}) : null}
			{/* call buttons per floor */}
			{show.buttons > 0 ? Array.from({length: FLOORS}).map((_, i) => <mesh key={'b' + i} position={[bx + 0.62, i * FH + 0.5, 0.66]} scale={eout(show.buttons)}><sphereGeometry args={[0.05, 12, 12]} /><meshStandardMaterial color={i === litFloor ? '#ffb547' : '#9fb4d6'} emissive={i === litFloor ? '#ffb547' : '#000'} emissiveIntensity={i === litFloor ? 1.6 : 0} /></mesh>) : null}
		</ThreeCanvas>
	);
};

// ---------------- callout label (like the reference) ----------------
export const Callout: React.FC<{text: string; col?: string; size?: number}> = ({text, col = C.white, size = 34}) => (
	<div style={{display: 'flex', alignItems: 'center', gap: 10}}>
		<div style={{width: 14, height: 14, borderRadius: 7, background: col, boxShadow: `0 0 12px ${col}`}} />
		<div style={{background: col, color: C.ink, fontFamily: DISPLAY, fontWeight: 900, fontSize: size, padding: `${size * 0.25}px ${size * 0.55}px`, borderRadius: 14, boxShadow: '0 8px 20px rgba(0,0,0,.4)'}}>{text}</div>
	</div>
);

// ---------------- persistent "inventory" of invented parts ----------------
const ICONS: Record<string, React.ReactNode> = {
	wheel: <g><circle cx="20" cy="20" r="13" fill="none" stroke="currentColor" strokeWidth="4" /><circle cx="20" cy="20" r="3" fill="currentColor" /></g>,
	box: <g><rect x="8" y="8" width="24" height="24" rx="3" fill="none" stroke="currentColor" strokeWidth="4" /><rect x="14" y="12" width="12" height="3" fill="currentColor" /></g>,
	cw: <g><rect x="12" y="8" width="16" height="26" rx="2" fill="currentColor" /><line x1="20" y1="2" x2="20" y2="8" stroke="currentColor" strokeWidth="3" /></g>,
	motor: <g><circle cx="20" cy="20" r="11" fill="currentColor" /><path d="M20 9 L23 18 L17 18 Z" fill="#070d1a" /><path d="M14 20 h12" stroke="#070d1a" strokeWidth="3" /></g>,
	rails: <g><line x1="11" y1="4" x2="11" y2="36" stroke="currentColor" strokeWidth="4" /><line x1="29" y1="4" x2="29" y2="36" stroke="currentColor" strokeWidth="4" />{[10, 18, 26].map((y) => <line key={y} x1="11" y1={y} x2="29" y2={y} stroke="currentColor" strokeWidth="2" />)}</g>,
	brake: <g><path d="M8 30 L14 10 L20 30 L26 10 L32 30" fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" /></g>,
	doors: <g><rect x="6" y="6" width="13" height="28" rx="2" fill="currentColor" /><rect x="21" y="6" width="13" height="28" rx="2" fill="currentColor" /></g>,
	buttons: <g><circle cx="20" cy="12" r="6" fill="currentColor" /><circle cx="20" cy="28" r="6" fill="none" stroke="currentColor" strokeWidth="3" /></g>,
};
export const Inventory: React.FC<{items: string[]; got: number[]; o: number}> = ({items, got, o}) => (
	<div style={{display: 'flex', gap: 14, padding: '14px 20px', borderRadius: 26, background: 'rgba(7,13,26,.85)', border: '2px solid rgba(79,209,255,.35)', opacity: o}}>
		{items.map((k, i) => {
			const g = clamp(got[i]);
			return (
				<div key={k} style={{width: 78, height: 78, borderRadius: 18, border: `3px solid ${g > 0 ? C.amber : 'rgba(139,154,184,.35)'}`, background: g > 0 ? 'rgba(255,181,71,.12)' : 'rgba(255,255,255,.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: g > 0 ? C.amber : 'rgba(139,154,184,.35)', transform: `scale(${g > 0 && g < 1 ? 1 + 0.25 * Math.sin(g * Math.PI) : 1})`, boxShadow: g > 0 ? `0 0 ${18 * g}px ${C.amber}88` : undefined}}>
					<svg width="46" height="46" viewBox="0 0 40 40">{ICONS[k]}</svg>
				</div>
			);
		})}
	</div>
);
export const BlueprintBg: React.FC = () => {
	const t = useCurrentFrame() / FPS;
	return <AbsoluteFill style={{background: '#070d1a', backgroundImage: 'linear-gradient(rgba(79,209,255,.06) 2px, transparent 2px), linear-gradient(90deg, rgba(79,209,255,.06) 2px, transparent 2px)', backgroundSize: '60px 60px', backgroundPosition: `0 ${t * 6}px`}} />;
};
export {clamp};
