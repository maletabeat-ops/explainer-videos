"""Beat-synced seamless loop track (no external APIs). 120 BPM, 16 bars = 32 s, A minor.
Everything is placed modulo the loop and reverb is circular, so bar 16 flows into bar 1 with no seam.
Arrangement follows the story timeline (frames @30fps, beat = 15 frames)."""
import numpy as np, wave, sys
SR = 44100; BPM = 120; BEAT = 60 / BPM; BAR = 4 * BEAT; NB = 16; L = int(NB * BAR * SR)
rng = np.random.default_rng(3)
def F(fr): return fr / 30.0
def hz(n): return 440 * 2 ** ((n - 69) / 12)
def put(buf, sig, t, g=1.0):
    i0 = int(round(t * SR)) % L; idx = (np.arange(len(sig)) + i0) % L; np.add.at(buf, idx, sig * g)
def adsr(n, a=0.005, d=0.1, s=0.6, r=0.1):
    e = np.full(n, s, float); na, nd, nr = int(a * SR), int(d * SR), int(r * SR)
    na = max(1, min(na, n)); e[:na] = np.linspace(0, 1, na); nd = min(nd, n - na); e[na:na + nd] = np.linspace(1, s, nd) if nd > 0 else e[na:na + nd]
    nr = min(nr, n); e[-nr:] *= np.linspace(1, 0, nr); return e
def saw(f, n, det=0.0):
    t = np.arange(n) / SR; return sum(((t * f * (1 + d)) % 1) * 2 - 1 for d in (-det, 0, det)) / 3
def fftfilt(x, lo=None, hi=None, res=None):
    X = np.fft.rfft(x); fr = np.fft.rfftfreq(len(x), 1 / SR); g = np.ones_like(fr)
    if hi: g *= 1 / np.sqrt(1 + (fr / hi) ** 4)
    if lo: g *= 1 / np.sqrt(1 + (lo / np.maximum(fr, 1)) ** 4)
    return np.fft.irfft(X * g, len(x))
def creverb(x, sec=1.8, mix=0.25, lo=200, hi=7000):
    n = int(sec * SR); ir = rng.standard_normal(n) * np.exp(-np.arange(n) / SR * 6.9 / sec); ir = fftfilt(ir, lo, hi)
    irL = np.zeros(L); irL[:n] = ir; wet = np.fft.irfft(np.fft.rfft(x) * np.fft.rfft(irL), L)
    wet *= np.std(x) / (np.std(wet) + 1e-9); return x * (1 - mix) + wet * mix
def sect(bar):
    return 'intro' if bar in (0, 1, 15) else 'a' if bar in (2, 3) else 'b' if bar in (4, 5, 6, 7) else 'break' if bar == 8 else 'build' if bar == 9 else 'drop' if bar in (10, 11) else 'groove' if bar in (12, 13) else 'ff'
CH = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]  # Am F C G (per bar)
drums, bass, pad, pluck, lead, sfx = (np.zeros(L) for _ in range(6)); kickEnv = np.zeros(L)
def kick(t, g=1):
    n = int(0.35 * SR); tt = np.arange(n) / SR; ph = np.cumsum(45 + 120 * np.exp(-tt * 28)) / SR
    s = np.sin(2 * np.pi * ph) * np.exp(-tt * 9) + 0.3 * rng.standard_normal(n) * np.exp(-tt * 300); put(drums, s, t, g)
    e = 1 - 0.75 * np.exp(-tt * 9); idx = (np.arange(n) + int(t * SR)) % L; kickEnv[idx] = np.minimum(kickEnv[idx], e - 1)
def clap(t, g=1):
    n = int(0.25 * SR); tt = np.arange(n) / SR; s = rng.standard_normal(n); env = sum(np.exp(-np.maximum(0, tt - o) * 60) * (tt >= o) for o in (0, 0.01, 0.022)) + 0.6 * np.exp(-tt * 14)
    put(drums, fftfilt(s * env, 900, 6000) * 0.8, t, g)
def hat(t, g=1, open_=False):
    n = int((0.22 if open_ else 0.05) * SR); tt = np.arange(n) / SR; s = fftfilt(rng.standard_normal(n), 7000) * np.exp(-tt * (12 if open_ else 80)); put(drums, s, t, g)
for bar in range(NB):
    sc = sect(bar); root = CH[bar % 4]; t0 = bar * BAR
    for b in range(4):
        t = t0 + b * BEAT
        if sc not in ('break', 'build', 'intro') or (sc == 'intro' and True):
            if sc != 'break' and sc != 'build': kick(t, 1.0 if sc != 'intro' else 0.85)
        if b in (1, 3) and sc not in ('break', 'intro'): clap(t, 0.55 if sc != 'build' else 0.0)
        for e in range(2):
            if sc != 'break': hat(t + e * BEAT / 2, 0.16 if e else 0.08, open_=(e == 1 and sc in ('drop', 'groove')))
        if sc == 'ff':
            for s16 in range(4): hat(t + s16 * BEAT / 4, 0.12)
    if sc == 'build':   # snare roll accelerating into the drop
        for i in range(16):
            k = i / 16; put(drums, fftfilt(rng.standard_normal(int(0.08 * SR)), 1200, 7000) * np.exp(-np.arange(int(0.08 * SR)) / SR * 40), t0 + k * BAR, 0.15 + 0.4 * k)
    # bass (sidechained later): 8th-note pulse on root
    if sc not in ('break',):
        for e in range(8):
            if sc == 'intro' and e % 2: continue
            n = int(BEAT / 2 * SR * 0.9); f = hz(root[0] - 24 + (12 if (sc in ('drop', 'groove') and e % 4 == 3) else 0))
            s = (np.sin(2 * np.pi * f * np.arange(n) / SR) * 0.7 + saw(f, n) * 0.35) * adsr(n, 0.004, 0.08, 0.7, 0.03); put(bass, s, t0 + e * BEAT / 2)
    # pad chord each bar
    n = int(BAR * SR); s = sum(saw(hz(m), n, 0.006) for m in root + [root[0] + 12]) * adsr(n, 0.35, 0.3, 0.8, 0.35); put(pad, s, t0, 0.5 if sc != 'break' else 0.9)
    # pluck arpeggio (16ths) in b / drop / groove / ff
    if sc in ('b', 'drop', 'groove', 'ff', 'a'):
        seq = [0, 1, 2, 1, 0, 2, 1, 2] * 2
        for i, d in enumerate(seq):
            if sc == 'a' and i % 2: continue
            m = root[d] + 12 + (12 if i % 8 == 7 else 0); n = int(0.22 * SR); tt = np.arange(n) / SR
            s = saw(hz(m), n, 0.003) * np.exp(-tt * 18); put(pluck, s, t0 + i * BEAT / 4, 0.55)
    # lead hook on the drop
    if sc == 'drop':
        mel = [(0, 76, 1.5), (1.5, 74, 0.5), (2, 72, 1), (3, 71, 1)] if bar == 10 else [(0, 72, 1), (1, 74, 1), (2, 76, 1.5), (3.5, 79, 0.5)]
        for (b, m, d) in mel:
            n = int(d * BEAT * SR); tt = np.arange(n) / SR; vib = 1 + 0.006 * np.sin(2 * np.pi * 5.5 * tt) * np.minimum(1, tt * 4)
            ph = np.cumsum(hz(m) * vib) / SR; s = ((ph % 1) * 2 - 1) * 0.5 + np.sign(np.sin(2 * np.pi * ph)) * 0.3
            put(lead, s * adsr(n, 0.01, 0.1, 0.8, 0.08), t0 + b * BEAT)
# riser into the drop (bar 9) and impact on the drop (bar 10 downbeat)
n = int(BAR * SR); tt = np.arange(n) / SR; f = 200 * 2 ** (tt / BAR * 3); r = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.3 + rng.standard_normal(n) * 0.4
put(sfx, fftfilt(r, 400) * (tt / BAR) ** 2, 9 * BAR, 0.35)
n = int(1.6 * SR); tt = np.arange(n) / SR; boom = np.sin(2 * np.pi * np.cumsum(30 + 90 * np.exp(-tt * 6)) / SR) * np.exp(-tt * 2.5) + fftfilt(rng.standard_normal(n), 3000) * np.exp(-tt * 3) * 0.5
put(sfx, boom, 10 * BAR, 0.7)
# --- story SFX, musical and on the beat ---
def blip(m, d=0.12, g=0.3, t=0, wave_='saw'):
    n = int(d * SR); tt = np.arange(n) / SR; s = saw(hz(m), n, 0.004) if wave_ == 'saw' else np.sin(2 * np.pi * hz(m) * tt); put(sfx, fftfilt(s * np.exp(-tt * 14), None, 5000), t, g)
# mosquito buzz (tuned to A), flying in bars 15->1 and flying off at 495-525
def buzz(a, b, g):
    d = (b - a) % (NB * BAR); n = int(d * SR); tt = np.arange(n) / SR; f = hz(69) * (1 + 0.02 * np.sin(2 * np.pi * 24 * tt))
    s = ((np.cumsum(f) / SR) % 1) * 2 - 1; e = np.minimum(1, tt / 0.4) * np.minimum(1, (d - tt) / 0.2); put(sfx, fftfilt(s, 300, 3000) * e, a, g)
buzz(F(900), F(60 + 960), 0.10); buzz(F(495), F(530), 0.10)
blip(81, 0.06, 0.25, F(60))                                  # landing tap
for i, fr in enumerate((240, 255)): blip(64 + i * 5, 0.18, 0.35, F(fr))   # stylets in, two steps
blip(76, 0.25, 0.35, F(300), 'sine'); blip(81, 0.25, 0.3, F(300 + 7.5), 'sine')  # found the vessel
for k in range(4): put(sfx, fftfilt(rng.standard_normal(int(0.1 * SR)), 300, 2500) * np.exp(-np.arange(int(0.1 * SR)) / SR * 25), F(300 + k * 15), 0.3)  # saliva squirts
for k in range(8): blip([57, 60, 64, 67][k % 4] + 12, 0.1, 0.22, F(360 + k * 15), 'sine')   # gulps, arpeggiated
for k in range(4): blip([69, 72, 76, 81][k], 0.18, 0.25, F(660 + k * 15))                 # ITCH stabs
for k in range(10): put(sfx, fftfilt(rng.standard_normal(int(0.07 * SR)), 2500) * np.exp(-np.arange(int(0.07 * SR)) / SR * 45), F(752 + k * 7.5), 0.35)  # scratching on 8ths
for k in range(4): blip([84, 86, 88, 91][k], 0.15, 0.2, F(840 + k * 15), 'sine')          # day ticks
for i, m in enumerate((84, 88, 91, 96, 100)): blip(m, 0.3, 0.18, F(900) + i * BEAT / 4, 'sine')  # sparkle
# --- mix ---
side = 1 + kickEnv
pad = fftfilt(pad, 150, 2500) * side; bass = fftfilt(bass, None, 900) * side; pluck = fftfilt(pluck, 300, 4500)
mix = drums * 0.9 + bass * 0.55 + creverb(pad, 2.5, 0.5) * 0.18 + creverb(pluck, 1.4, 0.3) * 0.22 + creverb(lead, 1.6, 0.3) * 0.16 + creverb(sfx, 1.2, 0.2) * 0.9
mix = np.tanh(mix * 1.4) / np.tanh(1.4); mix *= 0.89 / np.max(np.abs(mix))
st = np.stack([mix, mix], 1); pcm = (st * 32767).astype('<i2')
with wave.open(sys.argv[1], 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('ok', L / SR)
