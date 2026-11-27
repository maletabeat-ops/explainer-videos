import * as THREE from 'three';
import {BEAT, FIRE_B, N, P, clamp, eio, pulse, sinceFire, steps} from './timeline';

export const PW = 270, PH = 480; // pixel render size (upscaled x4)
const D2R = Math.PI / 180;
let GRAD: THREE.DataTexture | null = null;
const grad = () => {if (!GRAD) {GRAD = new THREE.DataTexture(new Uint8Array([70, 150, 215, 255]), 4, 1, THREE.RedFormat); GRAD.minFilter = GRAD.magFilter = THREE.NearestFilter; GRAD.needsUpdate = true;} return GRAD;};
const toon = (color: string, extra: Partial<THREE.MeshToonMaterialParameters> = {}) => new THREE.MeshToonMaterial({color, gradientMap: grad(), ...extra});
const box = (w: number, h: number, d: number, m: THREE.Material) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
const cyl = (rt: number, rb: number, h: number, m: THREE.Material, seg = 12) => new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m);
const M = {
	chrome: toon('#c9d3e0'), steel: toon('#7c8798'), dark: toon('#2c313c'), black: toon('#16181d'), tank: toon('#d9542b'), tankDark: toon('#a8381c'),
	seat: toon('#1d1a19'), tire: toon('#1a1b1f'), road: toon('#454b57'), line: toon('#e9e4d4'), sand: toon('#d39459'), sand2: toon('#b97640'), mesa: toon('#a35a36'), mesa2: toon('#7d4029'),
	glow: new THREE.MeshBasicMaterial({color: '#ffb347'}), lamp: new THREE.MeshBasicMaterial({color: '#fff3c4'}), fire: new THREE.MeshBasicMaterial({color: '#ffcf4a', transparent: true}),
	barrel: toon('#5d6878'), fin: toon('#8a96a8'), wall: toon('#3a4250'), studio: toon('#1c2330'), pin: new THREE.MeshBasicMaterial({color: '#ff9a2e'}),
};

// ---------- piston kinematics (2D in the XY plane, crank at origin) ----------
const r = 0.42, Lr = 1.55;
const u = (a: number) => new THREE.Vector2(-Math.sin(a), Math.cos(a));
// theta = crank angle in degrees since cylinder A firing TDC
export const crank = (f: number) => (720 * f) / BEAT;
const pistonD = (alpha: number, phi: number) => r * Math.cos(alpha - phi) + Math.sqrt(Lr * Lr - (r * Math.sin(alpha - phi)) ** 2);
const AX = [22.5 * D2R, -22.5 * D2R]; // cylinder A (front), B (rear)

// ---------- a V-twin engine model (used both on the bike and big in the cutaway) ----------
type Twin = {g: THREE.Group; pistons: THREE.Mesh[]; rods: THREE.Mesh[]; pin: THREE.Mesh; fly: THREE.Group; fires: THREE.Mesh[]; parts: Record<string, THREE.Object3D>; cut: boolean};
const makeTwin = (cut: boolean): Twin => {
	const g = new THREE.Group(); const parts: Record<string, THREE.Object3D> = {};
	// crankcase + flywheel
	const fly = new THREE.Group(); const disc = cyl(1.05, 1.05, 0.25, M.dark, 24); disc.rotation.x = Math.PI / 2; fly.add(disc);
	const cw = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.27, 24, 1, false, 0, Math.PI), M.steel); cw.rotation.x = Math.PI / 2; fly.add(cw);
	for (let i = 0; i < 8; i++) {const mk = box(0.12, 0.06, 0.28, M.pin); const a = (i / 8) * Math.PI * 2; mk.position.set(Math.cos(a) * 0.98, Math.sin(a) * 0.98, 0); mk.rotation.z = a; if (cut) fly.add(mk);}
	fly.position.z = cut ? -0.42 : 0; g.add(fly); parts.fly = fly;
	if (!cut) {const cc = box(1.5, 1.1, 0.7, M.steel); cc.position.y = -0.1; g.add(cc); parts.case = cc;}
	// cylinders
	const pistons: THREE.Mesh[] = [], rods: THREE.Mesh[] = [], fires: THREE.Mesh[] = [];
	AX.forEach((phi, i) => {
		const cylG = new THREE.Group(); cylG.rotation.z = phi; // axis along local +y
		const barrelH = 1.5, y0 = 1.25;
		if (cut) {for (const sx of [-1, 1]) {const w = box(0.12, barrelH + 0.4, 0.9, M.barrel); w.position.set(sx * 0.5, y0 + barrelH / 2, 0); cylG.add(w); for (let k = 0; k < 7; k++) {const fn = box(0.28, 0.06, 0.95, M.fin); fn.position.set(sx * 0.66, y0 + 0.15 + k * 0.22, 0); cylG.add(fn);}}
			const head = box(1.45, 0.42, 0.95, M.steel); head.position.y = y0 + barrelH + 0.38; cylG.add(head);
			for (const vx of [-0.2, 0.2]) {const v = cyl(0.04, 0.04, 0.45, M.chrome, 6); v.position.set(vx, y0 + barrelH + 0.18, 0.1); cylG.add(v); const vh = cyl(0.13, 0.13, 0.04, M.chrome, 10); vh.position.set(vx, y0 + barrelH - 0.03, 0.1); cylG.add(vh);}
			const plug = cyl(0.05, 0.05, 0.35, M.chrome, 6); plug.position.set(0, y0 + barrelH + 0.62, 0.2); cylG.add(plug);
		} else {
			for (let k = 0; k < 8; k++) {const fn = cyl(0.42, 0.42, 0.06, k % 2 ? M.fin : M.steel, 14); fn.position.y = 0.9 + k * 0.13; cylG.add(fn);} const head = box(0.75, 0.32, 0.6, M.chrome); head.position.y = 2.0; cylG.add(head);
		}
		const fire = new THREE.Mesh(new THREE.SphereGeometry(0.42, 10, 6), M.fire.clone()); fire.scale.set(1, 0.45, 0.9); fire.position.y = y0 + barrelH - 0.12; fire.visible = false; cylG.add(fire); fires.push(fire);
		g.add(cylG); parts['cyl' + i] = cylG;
		if (cut) {
			const pg = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.5, 14), M.chrome); g.add(pg); pistons.push(pg); parts['piston' + i] = pg;
			const rod = box(0.16, Lr, 0.12, i ? M.steel : M.fin); rod.position.z = i ? -0.1 : 0.1; g.add(rod); rods.push(rod); parts['rod' + i] = rod;
		}
	});
	const pin = cyl(0.1, 0.1, 0.55, M.pin, 10); pin.rotation.x = Math.PI / 2; g.add(pin); parts.pin = pin;
	return {g, pistons, rods, pin, fly, fires, parts, cut};
};
const updateTwin = (t: Twin, theta: number, f: number, explode = 0) => {
	const alpha = AX[0] - theta * D2R; const pin = u(alpha).multiplyScalar(r);
	t.pin.position.set(pin.x, pin.y, 0); t.fly.rotation.z = alpha;
	AX.forEach((phi, i) => {
		const d = pistonD(alpha, phi); const pp = u(phi).multiplyScalar(d);
		if (t.cut) {
			const ex = explode * (i ? -1 : 1);
			t.pistons[i].position.set(pp.x + ex * 0.6 * -Math.sin(phi), pp.y + 0.25 + explode * 1.4, 0); t.pistons[i].rotation.z = phi;
			const mid = pin.clone().add(pp).multiplyScalar(0.5); const dir = pp.clone().sub(pin); t.rods[i].position.set(mid.x + ex * 0.3, mid.y + explode * 0.7, t.rods[i].position.z); t.rods[i].rotation.z = Math.atan2(-dir.x, dir.y);
		}
		// combustion: A at theta%720 in [0, 60), B at [405, 465)
		const local = ((theta - (i ? 405 : 0)) % 720 + 720) % 720; const k = local < 110 ? 1 - local / 110 : 0;
		t.fires[i].visible = k > 0.02; (t.fires[i].material as THREE.MeshBasicMaterial).opacity = k; (t.fires[i].material as THREE.MeshBasicMaterial).color.set(k > 0.6 ? '#fff1a8' : '#ff8a2e'); t.fires[i].scale.set(1, 0.3 + 0.5 * k, 0.9);
	});
	void f;
};

// ---------- motorcycle ----------
const makeBike = () => {
	const g = new THREE.Group(); const twin = makeTwin(false); twin.g.scale.setScalar(0.42); twin.g.rotation.y = Math.PI / 2; twin.g.position.set(0, 0.62, 0.05); g.add(twin.g);
	const wheel = (z: number) => {const w = new THREE.Group(); const tire = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.16, 8, 20), M.tire); w.add(tire); const rim = cyl(0.4, 0.4, 0.08, M.chrome, 16); rim.rotation.x = Math.PI / 2; w.add(rim); for (let i = 0; i < 6; i++) {const sp = box(0.03, 0.78, 0.03, M.steel); sp.rotation.z = (i / 6) * Math.PI; w.add(sp);} const hub = cyl(0.1, 0.1, 0.22, M.dark, 10); hub.rotation.x = Math.PI / 2; w.add(hub); w.rotation.y = Math.PI / 2; w.position.set(0, 0.52, z); g.add(w); return w;};
	const fw = wheel(1.55), rw = wheel(-1.45);
	const tank = new THREE.Mesh(new THREE.SphereGeometry(0.42, 10, 8), M.tank); tank.scale.set(0.75, 0.55, 1.25); tank.position.set(0, 1.42, 0.35); g.add(tank);
	const stripe = new THREE.Mesh(new THREE.SphereGeometry(0.425, 10, 8), M.tankDark); stripe.scale.set(0.76, 0.2, 1.1); stripe.position.set(0, 1.36, 0.36); g.add(stripe);
	const seat = box(0.48, 0.16, 0.95, M.seat); seat.position.set(0, 1.28, -0.55); seat.rotation.x = -0.12; g.add(seat);
	const frame = [[0, 1.05, 0.9, 0, 0.55, -0.6], [0, 1.2, 0.95, 0, 1.1, -1.0], [0, 1.25, 0.9, 0, 1.5, 1.15]];
	for (const [x1, y1, z1, x2, y2, z2] of frame) {const a = new THREE.Vector3(x1, y1, z1), b = new THREE.Vector3(x2, y2, z2); const m = cyl(0.05, 0.05, a.distanceTo(b), M.black, 6); m.position.copy(a).add(b).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize()); g.add(m);}
	for (const sx of [-0.16, 0.16]) {const fk = cyl(0.045, 0.045, 1.35, M.chrome, 6); fk.position.set(sx, 1.12, 1.33); fk.rotation.x = 0.42; g.add(fk);}
	const bar = cyl(0.035, 0.035, 1.1, M.chrome, 6); bar.rotation.z = Math.PI / 2; bar.position.set(0, 1.86, 1.0); g.add(bar);
	for (const sx of [-0.55, 0.55]) {const grip = cyl(0.05, 0.05, 0.2, M.black, 6); grip.rotation.z = Math.PI / 2; grip.position.set(sx, 1.86, 0.98); g.add(grip);}
	const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 8), M.chrome); lamp.position.set(0, 1.6, 1.55); g.add(lamp); const lens = new THREE.Mesh(new THREE.CircleGeometry(0.14, 12), M.lamp); lens.position.set(0, 1.6, 1.73); g.add(lens);
	const ffd = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.09, 4, 12, Math.PI * 0.75), M.tank); ffd.rotation.y = Math.PI / 2; ffd.rotation.z = Math.PI * 0.18; ffd.position.set(0, 0.52, 1.55); g.add(ffd);
	const rfd = new THREE.Mesh(new THREE.TorusGeometry(0.64, 0.12, 4, 12, Math.PI * 0.7), M.tank); rfd.rotation.y = Math.PI / 2; rfd.rotation.z = Math.PI * 0.12; rfd.position.set(0, 0.52, -1.45); g.add(rfd);
	// two exhaust pipes on the right side
	const exits: THREE.Vector3[] = [];
	for (const [y, zz] of [[0.55, 0.1], [0.38, -0.1]]) {const a = new THREE.Vector3(0.35, 0.95, zz + 0.25), b = new THREE.Vector3(0.42, y, -0.2), c = new THREE.Vector3(0.45, y + 0.08, -2.05);
		for (const [p, q] of [[a, b], [b, c]]) {const m = cyl(0.075, 0.075, p.distanceTo(q), M.chrome, 8); m.position.copy(p).add(q).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), q.clone().sub(p).normalize()); g.add(m);}
		const tip = cyl(0.11, 0.09, 0.3, M.chrome, 8); tip.rotation.x = Math.PI / 2; tip.position.copy(c); g.add(tip); exits.push(c.clone().add(new THREE.Vector3(0, 0, -0.18)));}
	return {g, twin, fw, rw, exits};
};

// ---------- ROAD scene ----------
export type Road = {scene: THREE.Scene; cam: THREE.PerspectiveCamera; bike: ReturnType<typeof makeBike>; dashes: THREE.Mesh[]; posts: THREE.Mesh[]; rings: THREE.Mesh[]};
export const makeRoad = (): Road => {
	const scene = new THREE.Scene();
	const sky = new THREE.Mesh(new THREE.SphereGeometry(200, 16, 12), new THREE.ShaderMaterial({side: THREE.BackSide, uniforms: {}, vertexShader: 'varying vec3 p; void main(){p=normalize(position); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}', fragmentShader: 'varying vec3 p; void main(){float h=clamp(p.y*2.2,0.0,1.0); vec3 a=vec3(1.0,0.62,0.32); vec3 b=vec3(0.86,0.42,0.42); vec3 c=vec3(0.24,0.22,0.42); vec3 col=h<0.25?mix(a,b,h/0.25):mix(b,c,(h-0.25)/0.75); gl_FragColor=vec4(col,1.0);}'}));
	scene.add(sky);
	const sun = new THREE.Mesh(new THREE.CircleGeometry(9, 20), new THREE.MeshBasicMaterial({color: '#ffe0a0'})); sun.position.set(-30, 9, -120); sun.lookAt(0, 0, 0); scene.add(sun);
	scene.add(new THREE.HemisphereLight('#ffd9b8', '#5a3a50', 1.4)); const dl = new THREE.DirectionalLight('#fff0d8', 2.2); dl.position.set(-6, 8, 4); scene.add(dl);
	scene.fog = new THREE.Fog('#d98a6a', 40, 160);
	const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), M.sand); ground.rotation.x = -Math.PI / 2; ground.position.y = -0.01; scene.add(ground);
	const road = new THREE.Mesh(new THREE.PlaneGeometry(6, 400), M.road); road.rotation.x = -Math.PI / 2; scene.add(road);
	for (const sx of [-3.05, 3.05]) {const e = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 400), M.line); e.rotation.x = -Math.PI / 2; e.position.set(sx, 0.005, 0); scene.add(e);}
	const dashes: THREE.Mesh[] = []; for (let i = 0; i < 30; i++) {const d = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 2.2), M.line); d.rotation.x = -Math.PI / 2; d.position.y = 0.006; scene.add(d); dashes.push(d);}
	const posts: THREE.Mesh[] = []; for (let i = 0; i < 25; i++) {const p = box(0.12, 0.9, 0.12, i % 2 ? M.line : M.steel); p.position.y = 0.45; scene.add(p); posts.push(p);}
	for (let i = 0; i < 14; i++) {const w = 8 + (i * 37) % 14, h = 5 + (i * 13) % 9; const m = box(w, h, 6, i % 2 ? M.mesa : M.mesa2); m.position.set((i % 2 ? 1 : -1) * (35 + (i * 23) % 40), h / 2, -60 - (i * 31) % 90); scene.add(m); const top = box(w * 0.7, 1.2, 5, M.sand2); top.position.set(m.position.x, h + 0.5, m.position.z); scene.add(top);}
	const bike = makeBike(); scene.add(bike.g);
	const rings: THREE.Mesh[] = []; for (let i = 0; i < 8; i++) {const ring = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.035, 4, 18), new THREE.MeshBasicMaterial({color: '#ffcf7a', transparent: true})); ring.visible = false; scene.add(ring); rings.push(ring);}
	const cam = new THREE.PerspectiveCamera(38, PW / PH, 0.1, 400);
	return {scene, cam, bike, dashes, posts, rings};
};
// camera poses on the road
const POSE = {
	start: {p: new THREE.Vector3(1.9, 1.05, 6.6), l: new THREE.Vector3(0, 1.0, 0)},
	engine: {p: new THREE.Vector3(4.6, 1.15, 0.5), l: new THREE.Vector3(0, 1.0, 0.0)},
	drop: {p: new THREE.Vector3(3.6, 0.85, -5.6), l: new THREE.Vector3(0.1, 0.8, -0.4)},
};
const lerpPose = (a: typeof POSE.start, b: typeof POSE.start, k: number) => ({p: a.p.clone().lerp(b.p, k), l: a.l.clone().lerp(b.l, k)});
export const roadState = (f: number) => {
	// rpm: idle ~1000 (potato) most of the time, rev up on the drop bars 11-12 (660-780)
	const rev = f >= 660 && f < 780 ? Math.sin(P(f, 660, 780) * Math.PI) : 0;
	return {rev};
};
export const updateRoad = (R: Road, f: number) => {
	const t = f / 30; const dist = (f / N) * 600; // 600 units per loop -> dashes (150) and posts (300) repeat exactly
	R.dashes.forEach((d, i) => {d.position.set(0, 0.006, ((i * 5 + dist) % 150) - 120);});
	R.posts.forEach((p, i) => {p.position.set((i % 2 ? 1 : -1) * 4.2, 0.45, ((i * 12 + dist) % 300) - 260);});
	// make dash/post motion loop-exact: dist at N must be a multiple of 150 and 280 -> handled by speed choice below
	const b = R.bike; const thump = pulse(f, BEAT, 3) * 0.035 + (sinceFire(f) < 3 ? 0.012 : 0);
	b.g.position.y = thump; b.g.rotation.z = Math.sin((f / N) * Math.PI * 4) * 0.02;
	const wa = -(f / N) * Math.PI * 2 * 100; b.fw.rotation.x = wa; b.rw.rotation.x = wa; void t;
	updateTwin(b.twin, crank(f) * 4, f);
	// exhaust shock rings on every firing (drop section bigger)
	const {rev} = roadState(f);
	R.rings.forEach((ring, i) => {
		const k = Math.floor(f / BEAT) - Math.floor(i / 2); const fireT = k * BEAT + (i % 2 ? FIRE_B : 0); const age = f - fireT;
		const show = age >= 0 && age < 16 && (f >= 640 && f < 800 || f < 120 || f >= 900);
		ring.visible = show; if (!show) return; const e = b.exits[i % 2]; ring.position.set(e.x + 0.05, e.y + thump, e.z - age * 0.12); ring.rotation.set(0, 0, 0);
		const s = 1 + age * (0.1 + rev * 0.12); ring.scale.set(s, s, s); (ring.material as THREE.MeshBasicMaterial).opacity = (1 - age / 16) * (0.6 + rev * 0.4);
	});
	// camera
	let pose = POSE.start;
	if (f < 120) pose = POSE.start;
	else if (f < 180) pose = lerpPose(POSE.start, POSE.engine, eio(steps(f, 120)));
	else if (f < 660) pose = POSE.engine;
	else if (f < 780) pose = POSE.drop;
	else {const k = eio(P(f, 790, 935)); pose = lerpPose(POSE.drop, POSE.start, k); pose.p.x += Math.sin(k * Math.PI) * 2.6; pose.p.y += Math.sin(k * Math.PI) * 0.6;}
	const bump = pulse(f, BEAT, 3.5) * 0.05;
	R.cam.position.copy(pose.p).add(new THREE.Vector3(0, bump, 0)); if (f >= 660 && f < 780) R.cam.position.x += Math.sin(f * 1.7) * 0.03 * rev;
	R.cam.lookAt(pose.l);
};

// ---------- CUTAWAY scene ----------
export type Cut = {scene: THREE.Scene; cam: THREE.PerspectiveCamera; twin: Twin; light: THREE.PointLight[]};
export const makeCut = (): Cut => {
	const scene = new THREE.Scene(); scene.background = new THREE.Color('#141a24');
	const back = new THREE.Group(); for (let x = -8; x <= 8; x++) for (let y = -6; y <= 10; y++) {const tile = box(0.95, 0.95, 0.1, (x + y) % 2 ? M.studio : M.wall); tile.position.set(x, y, -3); back.add(tile);} scene.add(back);
	for (let i = -8; i <= 8; i++) for (let j = -6; j <= 10; j++) {const rv = new THREE.Mesh(new THREE.SphereGeometry(0.05, 4, 3), M.steel); rv.position.set(i + 0.4, j + 0.4, -2.94); scene.add(rv);}
	scene.add(new THREE.HemisphereLight('#c8d8ff', '#202432', 1.5)); const dl = new THREE.DirectionalLight('#ffffff', 1.8); dl.position.set(3, 5, 6); scene.add(dl);
	const twin = makeTwin(true); scene.add(twin.g);
	const light = [0, 1].map(() => {const l = new THREE.PointLight('#ffa040', 0, 6, 1.6); scene.add(l); return l;});
	const cam = new THREE.PerspectiveCamera(34, PW / PH, 0.1, 100);
	return {scene, cam, twin, light};
};
export const EXPLODE = ['cyl0', 'cyl1', 'piston0', 'fly'];
export const updateCut = (C: Cut, f: number) => {
	const ex = f < 480 ? 0 : f < 540 ? steps(f, 480) : f < 600 ? 1 - steps(f, 540) : 0;
	const theta = crank(f >= 645 && f < 660 ? 645 : f);
	updateTwin(C.twin, theta, f, ex);
	// exploded offsets (move whole parts on the beats)
	const off: Record<string, number[]> = {cyl0: [-1.1, 1.3, 0.6], cyl1: [1.1, 1.3, -0.4], fly: [0, -1.4, -0.9], pin: [0, 0, 1.4]};
	for (const [k, v] of Object.entries(off)) {const o = C.twin.parts[k]; const base = k === 'fly' ? [0, 0, -0.42] : k === 'pin' ? [o.position.x, o.position.y, 0] : [0, 0, 0]; o.position.set(base[0] + v[0] * ex, base[1] + v[1] * ex, base[2] + v[2] * ex);}
	C.twin.fires.forEach((fi, i) => {C.light[i].intensity = fi.visible ? 8 * ((fi.material as THREE.MeshBasicMaterial).opacity) : 0; const wp = new THREE.Vector3(); fi.getWorldPosition(wp); C.light[i].position.copy(wp).add(new THREE.Vector3(0, 0, 0.8));});
	(C.twin.pin.material as THREE.MeshBasicMaterial).color.set(f >= 205 && f < 240 && Math.floor(f / 4) % 2 ? '#fff0b0' : '#ff9a2e');
	// camera: frontal studio view, slight drift; 3/4 view for the explosion
	const k3 = f < 480 ? 0 : f < 600 ? eio(P(f, 470, 500)) * (1 - eio(P(f, 575, 600))) : 0;
	const bump = pulse(f, BEAT, 3.5) * 0.06;
	C.cam.position.set(0 + k3 * 5.5 + Math.sin(f / 90) * 0.3, 1.5 + k3 * 2.2 + bump, 12.5 + k3 * 1.5);
	C.cam.lookAt(0, 1.45, 0);
};
export const project = (v: THREE.Vector3, cam: THREE.Camera) => {const p = v.clone().project(cam); return [(p.x * 0.5 + 0.5) * 1080, (-p.y * 0.5 + 0.5) * 1920];};
export {THREE, clamp};
