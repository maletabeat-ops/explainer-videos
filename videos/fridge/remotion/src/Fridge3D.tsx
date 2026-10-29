import React, {useMemo} from 'react';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import {useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import {FPS, P, eio, eout} from './ui';
import {LOOP_LEN, PIPE_PATH, along, camState} from './scene';

export const VW = 1080, VH = 1500, VY = 140;
const CamRig: React.FC<{t: number; ch: number[]}> = ({t, ch}) => {
	const {camera} = useThree();
	const s = camState(t, ch);
	camera.position.set(s.p[0], s.p[1], s.p[2]); camera.lookAt(s.tg[0], s.tg[1], s.tg[2]);
	(camera as THREE.PerspectiveCamera).fov = 30; camera.updateProjectionMatrix();
	return null;
};
const Shell: React.FC<{x: number; door1: number; door2: number}> = ({x, door1, door2}) => {
	const m = (c: string, extra: any = {}) => <meshStandardMaterial color={c} metalness={0.35} roughness={0.28} transparent opacity={x} depthWrite={x > 0.97} {...extra} />;
	return (
		<group>
			{/* side, top, bottom, back walls */}
			<mesh position={[-0.98, 2, 0]}><boxGeometry args={[0.04, 4, 1.8]} />{m('#eef3f8')}</mesh>
			<mesh position={[0.98, 2, 0]}><boxGeometry args={[0.04, 4, 1.8]} />{m('#eef3f8')}</mesh>
			<mesh position={[0, 3.98, 0]}><boxGeometry args={[2, 0.04, 1.8]} />{m('#eef3f8')}</mesh>
			<mesh position={[0, 0.08, 0]}><boxGeometry args={[2, 0.16, 1.8]} />{m('#d9e1ea')}</mesh>
			<mesh position={[0, 2, -0.88]}><boxGeometry args={[2, 4, 0.04]} />{m('#dfe6ee')}</mesh>
			<mesh position={[0, 2.95, 0]}><boxGeometry args={[1.92, 0.06, 1.7]} />{m('#cfd8e3')}</mesh>
			{/* doors (hinged on the left) */}
			<group position={[-1, 3.47, 0.92]} rotation={[0, -door1, 0]}>
				<mesh position={[1, 0, 0]}><boxGeometry args={[2, 1.0, 0.08]} />{m('#f4f7fb')}</mesh>
				<mesh position={[1.8, -0.2, 0.08]}><boxGeometry args={[0.06, 0.4, 0.06]} />{m('#9aa6b5', {metalness: 0.9})}</mesh>
			</group>
			<group position={[-1, 1.5, 0.92]} rotation={[0, -door2, 0]}>
				<mesh position={[1, 0, 0]}><boxGeometry args={[2, 2.84, 0.08]} />{m('#f4f7fb')}</mesh>
				<mesh position={[1.8, 0.9, 0.08]}><boxGeometry args={[0.06, 0.9, 0.06]} />{m('#9aa6b5', {metalness: 0.9})}</mesh>
			</group>
		</group>
	);
};
const Food: React.FC = () => (
	<group>
		{[0.95, 1.75, 2.45].map((y) => <mesh key={y} position={[0, y, 0.05]}><boxGeometry args={[1.88, 0.03, 1.5]} /><meshStandardMaterial color="#bfe9ff" transparent opacity={0.45} /></mesh>)}
		<mesh position={[-0.55, 1.33, 0.2]}><boxGeometry args={[0.3, 0.7, 0.3]} /><meshStandardMaterial color="#f5f7ff" /></mesh>
		<mesh position={[-0.55, 1.6, 0.36]}><boxGeometry args={[0.31, 0.12, 0.02]} /><meshStandardMaterial color="#3a7bff" /></mesh>
		{[0, 0.22].map((x, i) => <mesh key={i} position={[0.1 + x, 1.3, 0.1]}><cylinderGeometry args={[0.09, 0.09, 0.66, 20]} /><meshStandardMaterial color={i ? '#ffb347' : '#3ddc84'} transparent opacity={0.85} /></mesh>)}
		{[[-0.4, 2.07], [-0.15, 2.07], [0.55, 1.07]].map(([x, y], i) => <mesh key={i} position={[x, y, 0.3]}><sphereGeometry args={[0.13, 20, 16]} /><meshStandardMaterial color="#ff4d5e" roughness={0.3} /></mesh>)}
		<mesh position={[0.5, 2.07, 0.2]}><boxGeometry args={[0.5, 0.2, 0.35]} /><meshStandardMaterial color="#ffd166" /></mesh>
		{[-0.5, -0.1, 0.3].map((x, i) => <mesh key={i} position={[x, 3.15, 0.25]}><boxGeometry args={[0.28, 0.28, 0.28]} /><meshStandardMaterial color="#d8f4ff" transparent opacity={0.8} /></mesh>)}
	</group>
);
const Arrow: React.FC<{pos: number[]; dir: number[]; col: string; s: number}> = ({pos, dir, col, s}) => {
	const q = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(...dir).normalize()), [dir.join()]);
	if (s <= 0.01) return null;
	return (
		<group position={pos as any} quaternion={q} scale={s}>
			<mesh position={[0, 0.25, 0]}><cylinderGeometry args={[0.04, 0.04, 0.5, 10]} /><meshBasicMaterial color={col} toneMapped={false} /></mesh>
			<mesh position={[0, 0.6, 0]}><coneGeometry args={[0.11, 0.22, 16]} /><meshBasicMaterial color={col} toneMapped={false} /></mesh>
		</group>
	);
};
export const Fridge3D: React.FC<{ch: number[]; K: any; dur: number; tt?: number}> = ({ch, K, tt}) => {
	const f0 = useCurrentFrame();
	const t = tt ?? f0 / FPS;
	const s = camState(t, ch);
	const door1 = 0, door2 = 0.45 * Math.sin(Math.PI * P(t, 0.6, 3.2)) + 1.25 * eio(P(t, K.door - 0.6, K.door + 0.6));
	const flowOn = P(t, ch[1] - 0.2, ch[1] + 0.6);
	const parts = useMemo(() => Array.from({length: 90}, (_, i) => i), []);
	const comp = 0.012 * Math.sin(t * 60) * (t > ch[1] ? 1 : 0);
	const pipe = useMemo(() => new THREE.TubeGeometry(PIPE_PATH, 600, 0.028, 8, true), []);
	const heatBack = Math.max(P(t, K.out - 0.2, K.out + 0.4) * (1 - P(t, ch[1] + 4, ch[2])), P(t, ch[1], ch[1] + 0.6) * (1 - P(t, ch[2] - 0.4, ch[2])), P(t, K.grid - 0.4, K.grid + 0.3) * (1 - P(t, ch[5] - 0.3, ch[5])), P(t, K.heat - 0.4, K.heat + 0.3));
	const heatFood = P(t, K.evap - 0.3, K.evap + 0.4) * (1 - P(t, ch[4] - 0.3, ch[4]));
	return (
		<ThreeCanvas width={VW} height={VH} style={{position: 'absolute', top: VY}} camera={{fov: 30, near: 0.1, far: 100}}>
			<CamRig t={t} ch={ch} />
			<ambientLight intensity={0.55} />
			<directionalLight position={[5, 8, 6]} intensity={1.6} />
			<directionalLight position={[-6, 3, -5]} intensity={1.4} color="#7fb8ff" />
			<pointLight position={[0, 2.6, 0.4]} intensity={door2 > 0.2 ? 3 : 0.6} color="#dff3ff" distance={4} />
			<mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[4, 64]} /><meshStandardMaterial color="#13233d" metalness={0.4} roughness={0.6} /></mesh>
			<Food />
			<mesh geometry={pipe}><meshStandardMaterial color="#c8794a" metalness={0.85} roughness={0.3} /></mesh>
			{/* condenser wires */}
			{Array.from({length: 7}).map((_, i) => <mesh key={i} position={[-0.75 + i * 0.25, 2.2, -1.1]}><cylinderGeometry args={[0.008, 0.008, 3.2, 6]} /><meshStandardMaterial color="#202631" /></mesh>)}
			{/* compressor */}
			<group position={[0.45 + comp, 0.38, -1.22]}>
				<mesh><capsuleGeometry args={[0.24, 0.22, 8, 20]} /><meshStandardMaterial color="#1b1f27" metalness={0.6} roughness={0.35} emissive="#ff4020" emissiveIntensity={P(t, K.comp - 0.3, K.comp + 0.3) * (1 - P(t, ch[5], ch[5] + 0.5)) * 0.6} /></mesh>
			</group>
			{parts.map((i) => {
				const a = along(t * 2.6 + (i / parts.length) * LOOP_LEN);
				const sc = 0.034 * a.size * flowOn;
				if (sc <= 0.002) return null;
				return <mesh key={i} position={a.pos as any} scale={sc}><sphereGeometry args={[1, 10, 8]} /><meshBasicMaterial color={a.col} toneMapped={false} /></mesh>;
			})}
			{[-0.6, 0, 0.6].map((x, i) => [1.2, 2.2, 3.2].map((y, j) => <Arrow key={`${i}${j}`} pos={[x, y, -1.25 - ((t * 0.8 + i * 0.3 + j * 0.5) % 1) * 0.9]} dir={[0, 0, -1]} col="#ff5a4f" s={heatBack * 0.9} />))}
			{[[-0.55, 1.4], [0.2, 1.4], [-0.3, 2.1], [0.5, 2.1]].map(([x, y], i) => <Arrow key={'f' + i} pos={[x, y + ((t * 0.7 + i * 0.25) % 1) * 0.9, -0.2]} dir={[0, 1, -0.6]} col="#ffb347" s={heatFood * 0.7} />)}
			<Shell x={s.x} door1={door1} door2={door2} />
		</ThreeCanvas>
	);
};
