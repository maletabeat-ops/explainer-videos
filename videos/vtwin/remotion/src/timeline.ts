// 120 BPM: beat = 15 frames, bar = 60 frames; loop = 16 bars = 960 frames (32 s)
export const N = 960, BEAT = 15, BAR = 60;
// engine: crank turns 720 deg per beat in the cutaway (X1/4 of idle); cyl A fires on the beat, cyl B 405 deg later = 9/16 beat
export const FIRE_B = (405 / 720) * BEAT;
export const pulse = (f: number, every = BEAT, decay = 4) => Math.exp(-((((f % every) + every) % every) / decay));
// time since last firing (either cylinder), in frames
export const sinceFire = (f: number) => {const m = ((f % BEAT) + BEAT) % BEAT; return m >= FIRE_B ? m - FIRE_B : m;};
export const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const P = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
export const eio = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
export const eout = (k: number) => 1 - Math.pow(1 - k, 3);
// step-on-beat easing: progress jumps a quarter per beat between a and a+4 beats
export const steps = (f: number, a: number, n = 4) => {const k = clamp((f - a) / BEAT, 0, n); const i = Math.floor(k); return (i + (i < n ? eout(clamp((k - i) * 2.2)) : 0)) / n;};
