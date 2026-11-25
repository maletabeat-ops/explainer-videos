"""Seamless chiptune loop + 8-bit SFX for the mosquito pixel loop (no external APIs).
Everything is written modulo the loop length, so the last sample flows into the first."""
import numpy as np, wave, sys
SR = 44100; FPS = 30; NF = 768; L = NF * SR // FPS  # 25.6 s
out = np.zeros(L)
def fr(f): return f / FPS
def place(sig, t, gain=1.0):
    i0 = int(round(t * SR)) % L; idx = (np.arange(len(sig)) + i0) % L; np.add.at(out, idx, sig * gain)
def env(n, a=0.005, r=0.05, sus=1.0):
    e = np.ones(n) * sus; na = max(1, int(a * SR)); nr = max(1, int(r * SR)); e[:na] = np.linspace(0, sus, na); e[-nr:] *= np.linspace(1, 0, nr); return e
def sq(freq, dur, duty=0.5):
    t = np.arange(int(dur * SR)) / SR; ph = (np.cumsum(np.broadcast_to(freq, t.shape)) / SR) % 1.0 if np.ndim(freq) else (t * freq) % 1.0
    return np.where(ph < duty, 1.0, -1.0)
def tri(freq, dur):
    t = np.arange(int(dur * SR)) / SR; ph = (t * freq) % 1.0; return 4 * np.abs(ph - 0.5) - 1
rng = np.random.default_rng(7)
def noise(dur): return rng.uniform(-1, 1, int(dur * SR))
def lp(x, k):
    y = np.zeros_like(x); a = 0.0
    for i in range(len(x)): a += k * (x[i] - a); y[i] = a
    return y
def hz(n): return 440 * 2 ** ((n - 69) / 12)

# ---------------- music ----------------
BEAT = 0.4; SIX = BEAT / 4
CH = [(57, [57, 60, 64]), (53, [53, 57, 60]), (48, [48, 52, 55]), (55, [55, 59, 62]), (57, [57, 60, 64]), (53, [53, 57, 60]), (50, [50, 53, 57]), (52, [52, 56, 59])]
slowA, slowB = fr(168), fr(330); ffA, ffB = fr(572), fr(680)
def sect(t): return 'slow' if slowA <= t < slowB else 'ff' if ffA <= t < ffB else 'norm'
# lead motifs (16ths, -1 = rest) relative scale degrees in A minor pentatonic over 2 bars
PENT = [57, 60, 62, 64, 67, 69, 72, 74, 76]
MOT = [[4, -1, 3, -1, 4, 5, -1, 3, 2, -1, -1, 1, 2, -1, 3, -1], [5, -1, 4, -1, 3, -1, 2, 3, -1, 2, 1, -1, 0, -1, -1, -1]]
for bar in range(16):
    root, chord = CH[bar // 2]
    for s16 in range(16):
        t = bar * 1.6 + s16 * SIX; m = sect(t)
        # bass: 8ths, root / octave
        if s16 % 2 == 0:
            n = root - 12 + (12 if s16 % 4 == 2 else 0)
            place(tri(hz(n), SIX * 1.8) * env(int(SIX * 1.8 * SR), 0.003, 0.04), t, 0.30 if m != 'slow' else 0.22)
        # arp
        if m != 'slow' or s16 % 2 == 0:
            n = chord[s16 % 3] + 12
            place(sq(hz(n), SIX * 0.9, 0.125) * env(int(SIX * 0.9 * SR), 0.002, 0.03), t, 0.045)
        # lead
        if m != 'slow':
            deg = MOT[(bar // 2) % 2][((bar % 2) * 8 + s16 // 2) % 16] if s16 % 2 == 0 else -1
            if deg >= 0:
                n = PENT[deg] + (12 if m == 'ff' else 0)
                d = SIX * 1.7; vib = hz(n) * (1 + 0.004 * np.sin(2 * np.pi * 6 * np.arange(int(d * SR)) / SR))
                place(sq(vib, d, 0.5) * env(int(d * SR), 0.004, 0.06, 0.8), t, 0.06)
        # drums
        if m == 'norm' or m == 'ff':
            if s16 in (0, 8) or (s16 == 14 and bar % 2):
                d = 0.14; tt = np.arange(int(d * SR)) / SR; f = 50 + 110 * np.exp(-tt * 30); ph = np.cumsum(f) / SR
                place(np.sin(2 * np.pi * ph) * np.exp(-tt * 18), t, 0.42)
            if s16 in (4, 12):
                d = 0.13; tt = np.arange(int(d * SR)) / SR
                place((noise(d) * 0.8 + 0.4 * sq(190, d)) * np.exp(-tt * 22), t, 0.16)
        if s16 % 2 == 0 or m == 'ff':
            d = 0.035; tt = np.arange(int(d * SR)) / SR; h = noise(d); h = h - lp(h, 0.3)
            place(h * np.exp(-tt * 90), t, 0.07 if m != 'slow' else 0.05)

# ---------------- SFX ----------------
def buzz(a, b, gain):
    d = (b - a) % (NF / FPS); n = int(d * SR); tt = np.arange(n) / SR
    f = 540 + 18 * np.sin(2 * np.pi * 27 * tt) + 40 * np.sin(2 * np.pi * 0.7 * tt)
    s = np.where(((np.cumsum(f) / SR) % 1) < 0.5, 1.0, -1.0) * 0.5 + (((np.cumsum(f * 1.01) / SR) % 1) * 2 - 1) * 0.5
    e = np.minimum(1, tt / 0.3) * np.minimum(1, (d - tt) / 0.15) * (0.6 + 0.4 * np.sin(2 * np.pi * 9 * tt) ** 2)
    place(lp(s, 0.35) * e, a, gain)
buzz(fr(700), fr(75 + NF) , 0.07)
buzz(fr(344), fr(376), 0.07)
def sweep(f0, f1, d, duty=0.5):
    n = int(d * SR); f = np.geomspace(f0, f1, n); ph = np.cumsum(f) / SR % 1; return np.where(ph < duty, 1.0, -1.0) * env(n, 0.002, 0.03)
place(sweep(1200, 900, 0.03), fr(75), 0.05)                       # landing tick
place(sweep(900, 260, 0.28, 0.25), fr(168), 0.10)                 # stylets go in
place(np.concatenate([sweep(330, 330, 0.06), sweep(495, 495, 0.08)]), fr(226), 0.10)  # capillary found
for k in range(4): d = 0.09; place(lp(noise(d), 0.25) * np.exp(-np.arange(int(d * SR)) / SR * 30), fr(232 + k * 7), 0.22)   # saliva squirts
for k in range(8): place(sweep(220, 440, 0.07), fr(266 + k * 8), 0.07)   # gulps
for j in range(3):                                                  # mast cells burst
    d = 0.4; tt = np.arange(int(d * SR)) / SR
    place(lp(noise(d), 0.45) * np.exp(-tt * 9) + 0.5 * sweep(160, 50, d) * np.exp(-tt * 6), fr(386 + j * 2), 0.18)
for k in (456, 476):                                                # ITCH alarm
    seq = np.concatenate([sq(880 if i % 2 == 0 else 1175, 0.05, 0.5) for i in range(10)]); place(seq * env(len(seq), 0.002, 0.05), fr(k), 0.06)
for k in range(8): d = 0.08; tt = np.arange(int(d * SR)) / SR; h = noise(d); place((h - lp(h, 0.15)) * np.exp(-tt * 40), fr(530 + k * 4.5), 0.16)   # scratching
for k in range(4): place(np.concatenate([sweep(660, 660, 0.05, 0.25), sweep(990, 990, 0.08, 0.25)]), fr(572 + k * 27), 0.06)   # day ticks
place(np.concatenate([tri(hz(n), 0.06) for n in (84, 88, 91, 96)]) * env(int(0.24 * SR), 0.002, 0.08), fr(682), 0.14)   # sparkle

out *= 0.85 / np.max(np.abs(out))
st = np.stack([out, out], 1); pcm = (st * 32767).astype('<i2')
with wave.open(sys.argv[1], 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('ok', L / SR, 's')
