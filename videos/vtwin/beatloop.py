"""V-twin loop track: 120 BPM, 16 bars (32 s). The groove IS the engine: exhaust thump on every beat (cyl A)
and 9/16 of a beat later (cyl B, 405 deg / 720 deg) = 'po-ta'. Seamless (modulo placement + circular reverb)."""
import numpy as np, wave, sys
SR = 44100; BEAT = 0.5; BAR = 2.0; NB = 16; L = int(NB * BAR * SR); FB = 9 / 16 * BEAT
rng = np.random.default_rng(11)
def F(fr): return fr / 30.0
def hz(n): return 440 * 2 ** ((n - 69) / 12)
def put(buf, sig, t, g=1.0):
    i0 = int(round(t * SR)) % L; idx = (np.arange(len(sig)) + i0) % L; np.add.at(buf, idx, sig * g)
def fftfilt(x, lo=None, hi=None):
    X = np.fft.rfft(x); fr = np.fft.rfftfreq(len(x), 1 / SR); g = np.ones_like(fr)
    if hi: g *= 1 / np.sqrt(1 + (fr / hi) ** 4)
    if lo: g *= 1 / np.sqrt(1 + (lo / np.maximum(fr, 1)) ** 4)
    return np.fft.irfft(X * g, len(x))
def creverb(x, sec=1.6, mix=0.25):
    n = int(sec * SR); ir = fftfilt(rng.standard_normal(n) * np.exp(-np.arange(n) / SR * 6.9 / sec), 200, 6000)
    irL = np.zeros(L); irL[:n] = ir; wet = np.fft.irfft(np.fft.rfft(x) * np.fft.rfft(irL), L); wet *= np.std(x) / (np.std(wet) + 1e-9); return x * (1 - mix) + wet * mix
def saw(f, n, det=0.0):
    t = np.arange(n) / SR; return sum(((t * f * (1 + d)) % 1) * 2 - 1 for d in (-det, 0, det)) / 3
def env(n, a=0.004, r=0.05):
    e = np.ones(n); na = max(1, int(a * SR)); nr = max(1, int(r * SR)); e[:na] = np.linspace(0, 1, na); e[-nr:] *= np.linspace(1, 0, nr); return e
def section(fr):
    f = fr % 960
    return 'hook' if f < 120 else 'vtwin' if f < 240 else 'slow' if f < 360 else 'graph' if f < 480 else 'explode' if f < 600 else 'trade' if f < 645 else 'silence' if f < 660 else 'drop' if f < 780 else 'ride'
eng, drums, bass, pad, pluck, lead, fx = (np.zeros(L) for _ in range(7)); duck = np.zeros(L)
def thump(t, g=1.0, slow=False):
    n = int((0.5 if slow else 0.28) * SR); tt = np.arange(n) / SR; base = 48 if not slow else 36
    s = np.sin(2 * np.pi * np.cumsum(base + 70 * np.exp(-tt * 30)) / SR) * np.exp(-tt * (7 if slow else 11))
    s += fftfilt(rng.standard_normal(n), 80, 900 if slow else 1800) * np.exp(-tt * (12 if slow else 22)) * 0.8
    put(eng, s, t, g); idx = (np.arange(n) + int(t * SR)) % L; duck[idx] = np.minimum(duck[idx], -0.7 * np.exp(-tt * 9))
def clap(t, g=1):
    n = int(0.22 * SR); tt = np.arange(n) / SR; e = sum(np.exp(-np.maximum(0, tt - o) * 60) * (tt >= o) for o in (0, 0.012, 0.024)) + 0.5 * np.exp(-tt * 14); put(drums, fftfilt(rng.standard_normal(n) * e, 900, 6000), t, g)
def hat(t, g=1, open_=False):
    n = int((0.2 if open_ else 0.045) * SR); tt = np.arange(n) / SR; put(drums, fftfilt(rng.standard_normal(n), 7000) * np.exp(-tt * (12 if open_ else 85)), t, g)
def clank(t, m, g=1):  # metallic hit for parts flying apart
    n = int(0.6 * SR); tt = np.arange(n) / SR; s = sum(np.sin(2 * np.pi * hz(m) * k * tt) * np.exp(-tt * (6 + 3 * k)) / k for k in (1, 2.76, 5.4, 8.9)); put(fx, s, t, g)
CH = [[45, 52, 57, 60, 64], [41, 48, 53, 57, 60], [43, 50, 55, 59, 62], [40, 47, 52, 56, 59]]  # Am F G E (E major for pull back to Am)
for bar in range(NB):
    t0 = bar * BAR; ch = CH[bar % 4]
    for b in range(4):
        t = t0 + b * BEAT; fr = t * 30; sc = section(fr)
        if sc == 'silence': continue
        slow = sc in ('slow', 'graph')
        thump(t, 1.0, slow); thump(t + FB, 0.8, slow)
        if sc in ('vtwin', 'graph', 'explode', 'drop', 'ride', 'trade') and b in (1, 3): clap(t, 0.5)
        if sc != 'slow':
            for e in range(2): hat(t + e * BEAT / 2, 0.14 if e else 0.07, open_=(e == 1 and sc in ('drop', 'ride')))
        else: hat(t + BEAT / 2, 0.06)
        if sc in ('drop',):
            for s16 in range(4): hat(t + s16 * BEAT / 4, 0.08)
        # bass locks to the engine: root on A-fire, fifth on B-fire
        if sc not in ('hook',) or b % 2 == 0:
            for (off, nn, d) in ((0, ch[0] - 12, FB * 0.9), (FB, ch[1] - 12, (BEAT - FB) * 0.9)):
                n = int(d * SR); s = (np.sin(2 * np.pi * hz(nn) * np.arange(n) / SR) * 0.8 + saw(hz(nn), n) * 0.3) * env(n, 0.004, 0.03); put(bass, s, t + off, 0.9 if not slow else 0.6)
        if sc == 'explode' and fr < 540: clank(t, [69, 72, 76, 81][b], 0.25)
        if sc == 'explode' and fr >= 540: clank(t, [81, 76, 72, 69][b], 0.2)
    # pad: one chord per bar
    n = int(BAR * SR); s = sum(saw(hz(m + 12), n, 0.006) for m in ch[2:]) * np.minimum(1, np.arange(n) / SR / 0.3) * np.minimum(1, (BAR - np.arange(n) / SR) / 0.3)
    if section(t0 * 30) != 'silence': put(pad, s, t0, 0.5)
    # pluck: arpeggio that follows the potato rhythm (on A, on B, and the 8th)
    sc0 = section(t0 * 30)
    if sc0 in ('graph', 'explode', 'drop', 'ride', 'trade'):
        for b in range(4):
            for j, off in enumerate((0, FB, BEAT * 0.75)):
                t = t0 + b * BEAT + off
                if section(t * 30) == 'silence': continue
                m = ch[2 + (b + j) % 3] + 12; n = int(0.2 * SR); tt = np.arange(n) / SR; put(pluck, saw(hz(m), n, 0.003) * np.exp(-tt * 16), t, 0.5)
# lead on the drop (bars 11-12 = 660..780 -> 22..26 s)
mel = [(0, 76, 0.5625), (0.5625, 72, 0.4375), (1, 74, 0.5), (1.5, 76, 0.5), (2, 79, 0.5625), (2.5625, 76, 0.4375), (3, 72, 1.0), (4, 76, 0.5625), (4.5625, 72, 0.4375), (5, 74, 0.5), (5.5, 71, 0.5), (6, 69, 2.0)]
for (b, m, d) in mel:
    n = int(d * BEAT * SR); tt = np.arange(n) / SR; ph = np.cumsum(hz(m) * (1 + 0.005 * np.sin(2 * np.pi * 5.5 * tt) * np.minimum(1, tt * 4))) / SR
    put(lead, (((ph % 1) * 2 - 1) * 0.55 + np.sign(np.sin(2 * np.pi * ph)) * 0.25) * env(n, 0.01, 0.06), F(660) + b * BEAT)
# engine rev on the drop: firing pulses speed up and become a tone (rpm 1000 -> 5000 -> 1000)
t = F(660); end = F(780)
while t < end:
    k = (t - F(660)) / (end - F(660)); rpm = 1000 + 4000 * np.sin(np.pi * k); cyc = 120 / rpm  # seconds per 720 deg
    for off, g in ((0, 0.25), (cyc * 405 / 720, 0.2)):
        n = int(0.05 * SR); tt = np.arange(n) / SR; put(fx, fftfilt(rng.standard_normal(n), 60, 1200) * np.exp(-tt * 60), t + off, g)
    t += cyc
# riser into the silence and a hit on the drop
n = int(BAR * SR); tt = np.arange(n) / SR; put(fx, fftfilt(np.sin(2 * np.pi * np.cumsum(150 * 2 ** (tt / BAR * 3)) / SR) * 0.3 + rng.standard_normal(n) * 0.4, 500) * (tt / BAR) ** 2 * (tt < BAR - 0.5), F(600), 0.3)
n = int(1.4 * SR); tt = np.arange(n) / SR; put(fx, np.sin(2 * np.pi * np.cumsum(32 + 90 * np.exp(-tt * 6)) / SR) * np.exp(-tt * 2.6) + fftfilt(rng.standard_normal(n), 2500) * np.exp(-tt * 3) * 0.4, F(660), 0.6)
put(fx, np.concatenate([np.sin(2 * np.pi * hz(m) * np.arange(int(0.12 * SR)) / SR) * np.exp(-np.arange(int(0.12 * SR)) / SR * 18) for m in (84, 88)]), F(628), 0.25)  # stamp
# mix
side = 1 + duck
mix = eng * 0.95 + drums * 0.7 + fftfilt(bass, None, 800) * side * 0.5 + creverb(fftfilt(pad, 150, 2500), 2.4, 0.5) * side * 0.16 + creverb(fftfilt(pluck, 300, 4500), 1.2, 0.3) * 0.22 + creverb(lead, 1.5, 0.3) * 0.17 + creverb(fx, 1.0, 0.2) * 0.8
# slow-motion feel: low-pass the music bed during the X1/4 section (240-360) except the engine
i0, i1 = int(F(240) * SR), int(F(360) * SR); seg = mix[i0:i1] - eng[i0:i1] * 0.95; mix[i0:i1] = fftfilt(seg, None, 1400) + eng[i0:i1] * 1.1
# hard silence for the held beat before the drop (645-660), with a tiny fade
s0, s1 = int(F(645) * SR), int(F(660) * SR); fade = int(0.02 * SR); mix[s0:s0 + fade] *= np.linspace(1, 0, fade); mix[s0 + fade:s1] *= 0.0
mix = np.tanh(mix * 1.3) / np.tanh(1.3); mix *= 0.89 / np.max(np.abs(mix))
pcm = (np.stack([mix, mix], 1) * 32767).astype('<i2')
with wave.open(sys.argv[1], 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('ok', L / SR)
