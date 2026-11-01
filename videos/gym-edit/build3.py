#!/usr/bin/env python3
"""Gym edit v3: user's own 15 s clip of the track (ref3.wav), cuts on the bar / half-bar,
contraction on the snare, cool natural grade, 4K.
usage: build3.py fx|clean [seg idx...] ; build3.py final fx|clean
"""
import os, subprocess, sys, glob
from build2 import TM, src, remap, ramp_pieces, ramp_out_hits

S = os.path.dirname(os.path.abspath(__file__))
FPS, OW, OH = 30, 2160, 3840
P = 0.4158                      # beat of the clip (144.3 BPM)
T0 = 0.556                      # first downbeat
HB = 2 * P                      # half bar
END = 15.0
def hb(i): return T0 + i * HB

GRADE = ("colorbalance=rs=-0.04:bs=0.05:rm=-0.06:gm=-0.01:bm=0.06:rh=-0.04:bh=0.04,"
         "eq=contrast=1.12:brightness=-0.03:saturation=0.95,"
         "curves=master='0/0 0.12/0.08 0.5/0.5 0.88/0.92 1/1'")
CROP = {'9855': (900, 1600, 0, 160), '9859': (960, 1707, 120, 0),
        '9858': (1080, 1920, 0, 0), '9852': (1080, 1920, 0, 0)}

# (t_from, t_to, clip, src_start, speed, hits) ; hits = src times of peak contraction
SEG = [
    (0.0,    hb(0),  '9855', 2.20, 1.0, []),
    (hb(0),  hb(2),  '9858', 1.50, 1.0, [2.33]),
    (hb(2),  hb(3),  '9852', 2.33, 1.0, [2.75]),
    (hb(3),  hb(4),  '9859', 2.25, 1.0, [2.67]),
    (hb(4),  hb(6),  '9858', 3.17, 1.0, [4.00]),
    (hb(6),  hb(8),  '9852', 3.97, 1.0, [4.80]),
    (hb(8),  hb(9),  '9859', 3.91, 1.0, [4.33]),
    (hb(9),  hb(10), '9858', 5.25, 1.0, [5.67]),
    (hb(10), hb(12), '9852', 6.68, 0.5, [7.10]),
    (hb(12), hb(14), '9859', 4.84, 1.0, [5.67]),
    (hb(14), hb(16), '9858', 6.50, 1.0, [7.33]),
    (hb(16), END,    '9858', 0.00, 0.5, [0.33]),
]

def frames(t): return round(t * FPS)

def seg_cmd(i, mode):
    t0, t1, clip, ss, sp, hits = SEG[i]
    nf = frames(t1) - frames(t0)
    dur = nf / FPS
    fx = mode == 'fx'
    out_hits = [(h - ss) / sp for h in hits]
    cw, ch, cx, cy = CROP[clip]
    f = [TM]
    pieces = ramp_pieces(hits, ss, dur) if fx and sp == 1.0 and hits else None
    if pieces:
        f.append(f"setpts='({remap(pieces)})/TB'")
        out_hits = ramp_out_hits(hits, ss, pieces)
        f.append("tmix=frames=2")
    else:
        f.append(f"setpts=(PTS-STARTPTS)/{sp}")
    f.append(f"fps={FPS}")
    f.append(f"crop={cw}:{ch}:{cx}:{cy},hqdn3d=1.5:1.5:4:4,{GRADE}")
    if fx:
        # afterimage trail on the pull, up to the contraction
        lead, tail = (0.9, 0.25) if sp == 0.5 else (0.45, 0.10)
        win = "+".join(f"between(t,{h - lead:.3f},{h + tail:.3f})" for h in out_hits)
        if win:
            f.append(f"tmix=frames=6:weights='1 1 1 2 3 6':enable='{win}'")
        # punch-in on the cut and on every contraction, shake on the contraction
        Z = "1.035+0.045*exp(-t*9)"
        for h in out_hits:
            Z += f"+0.05*exp(-max(0,t-{h:.3f})*7)*gte(t,{h:.3f}-0.02)"
        f.append(f"scale=w='2*trunc({OW // 2}*({Z}))':h='2*trunc({OH // 2}*({Z}))':eval=frame:flags=lanczos")
        sh = "+".join(f"18*exp(-max(0,t-{h:.3f})*10)*gte(t,{h:.3f})" for h in out_hits) or "0"
        f.append(f"crop={OW}:{OH}:x='(iw-{OW})/2+({sh})*sin(t*83)':y='(ih-{OH})/2+({sh})*cos(t*61)'")
    else:
        f.append(f"scale={OW}:{OH}:flags=lanczos")
    f.append("unsharp=7:7:0.7:5:5:0.0,format=yuv420p,tpad=stop_mode=clone:stop_duration=2")
    if i == len(SEG) - 1:
        f.append(f"fade=t=out:st={dur - 0.5:.3f}:d=0.5")
    srcdur = dur * sp + 0.6
    out = f"{S}/seg3_{mode}/{i:02d}.mp4"
    return ['ffmpeg', '-v', 'error', '-y', '-ss', f'{ss:.3f}', '-t', f'{srcdur:.3f}', '-i', src[clip],
            '-vf', ','.join(f), '-frames:v', str(nf), '-an', '-c:v', 'libx264', '-crf', '14',
            '-preset', 'medium', '-r', str(FPS), out]

def final(mode):
    lst = f'{S}/list3_{mode}.txt'
    with open(lst, 'w') as fh:
        for p in sorted(glob.glob(f'{S}/seg3_{mode}/*.mp4')): fh.write(f"file '{p}'\n")
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-i', f'{S}/ref3.wav',
                    '-filter_complex', f"[1:a]atrim=0:{END},afade=t=out:st={END - 0.4}:d=0.4[a]",
                    '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k',
                    '-movflags', '+faststart', f'{S}/gym3_{mode}.mp4'], check=True)

if __name__ == '__main__':
    mode = sys.argv[1]
    if mode == 'final':
        final(sys.argv[2]); sys.exit()
    os.makedirs(f'{S}/seg3_{mode}', exist_ok=True)
    for i in ([int(x) for x in sys.argv[2:]] or range(len(SEG))):
        subprocess.run(seg_cmd(i, mode), check=True); print(mode, 'seg', i, flush=True)
