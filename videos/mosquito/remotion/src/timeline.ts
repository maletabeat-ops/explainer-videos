// all times in frames @30fps; 120 BPM -> beat = 15 frames, bar = 60 frames; loop = 16 bars = 960 frames (32 s)
export const N = 960, BEAT = 15, BAR = 60;
export const T = {
	land: 60, retA: 60, retB: 105, zinA: 120, zinB: 150,
	lab: [180, 195, 210, 225], female: 15,
	pierceA: 240, pierceB: 270, probeB: 300, salA: 300, salB: 360, suckA: 360, suckB: 480, withA: 480, withB: 495, flyA: 495, flyB: 525,
	mastLab: 510, burst: 600, swellA: 603, swellB: 655, bumpLab: 640,
	nerveA: 660, itch: 660, nerveB: 720, zoutA: 720, zoutB: 750,
	scrA: 752, scrB: 830, ffA: 840, ffB: 900, spark: 900, inA: 900,
};
// beat pulse 1 -> 0 after each beat
export const pulse = (f: number, every = BEAT, decay = 4) => Math.exp(-(((f % every) + every) % every) / decay);
