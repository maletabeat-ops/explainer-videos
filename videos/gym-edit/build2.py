#!/usr/bin/env python3
"""Gym edit v2: long clean shots synced to the bar, natural contrast grade, 4K upscale.
usage: build2.py fx|clean [seg idx...]   -> seg_<mode>/NN.mp4
       build2.py final fx|clean          -> gym_<mode>.mp4
"""
import os, subprocess, sys, glob

S = os.path.dirname(os.path.abspath(__file__))
U = '/root/.claude/uploads/808d8be5-6164-5c55-90d6-5e67735981ad'
src = {n: glob.glob(f'{U}/*IMG_{n}.mov')[0] for n in ('9852', '9855', '9858', '9859')}
FPS = 30
OW, OH = 2160, 3840
P, PH = 0.4175, 0.005           # measured beat grid of music2.mp3
def b(i): return PH + i * P
END = b(66)

TM = ("zscale=tin=arib-std-b67:min=bt2020nc:pin=bt2020:rin=tv:t=linear:npl=203,format=gbrpf32le,"
      "zscale=p=bt709,tonemap=hable:desat=0:peak=4.9,zscale=t=bt709:m=bt709:r=tv,format=yuv420p")
# natural colours, just more contrast / deeper blacks
GRADE = ("eq=contrast=1.14:brightness=-0.035:saturation=1.08:gamma=0.97,"
         "curves=master='0/0 0.12/0.07 0.5/0.49 0.88/0.92 1/1'")
CROP = {'9855': (771, 1371, 35, 275), '9859': (585, 1040, 420, 0),
        '9858': (1080, 1920, 0, 0), '9852': (1080, 1920, 0, 0)}

# (beat_from, beat_to, clip, src_start, speed, hits) ; hits = src times of peak contraction
SEG = [
    (0, 8,   '9855', 1.60, 0.5,  []),
    (8, 24,  '9858', 2.30, 1.0,  [2.33, 4.00, 5.67, 7.33]),
    (24, 32, '9852', 1.00, 1.0,  [1.0, 2.75]),
    (32, 40, '9858', 3.30, 0.5,  [4.00]),
    (40, 48, '9859', 2.67, 1.0,  [2.67, 4.33, 5.67]),
    (48, 56, '9852', 4.00, 0.5,  [4.80]),
    (56, 66, '9858', 5.67, 0.78, [5.67, 7.33]),
]

def frames(t): return round(t * FPS)

def remap(pieces):
    """pieces: [(src_len, speed)] from src 0 -> setpts expr mapping src T to output seconds"""
    expr, s0, o0 = None, 0.0, 0.0
    parts = []
    for ln, sp in pieces:
        parts.append((s0, s0 + ln, o0, sp)); o0 += ln / sp; s0 += ln
    expr = f"({o0:.5f}+(T-{s0:.5f}))"   # after last piece: 1x
    for a, e, o, sp in reversed(parts):
        expr = f"if(lt(T,{e:.5f}),{o:.5f}+(T-{a:.5f})/{sp},{expr})"
    return expr

def seg_cmd(i, mode):
    bf, bt, clip, ss, sp, hits = SEG[i]
    t0, t1 = b(bf), b(bt)
    nf = frames(t1) - frames(t0)
    dur = nf / FPS
    fx = mode == 'fx'
    out_hits = [(h - ss) / sp for h in hits]           # output times of contractions (constant speed)
    pieces = None
    if fx and sp == 1.0 and len(hits) > 1:
        # speed ramp: slow-mo on every contraction, the rest of the rep sped up to stay on the bar
        pieces = ramp_pieces(hits, ss, dur)
    cw, ch, cx, cy = CROP[clip]
    f = [TM]
    if pieces:
        f.append(f"setpts='({remap(pieces)})/TB'")
        out_hits = ramp_out_hits(hits, ss, pieces)
    else:
        f.append(f"setpts=(PTS-STARTPTS)/{sp}")
    if fx and sp != 0.5 and pieces: f.append("tmix=frames=2")   # smooth the fast parts
    f.append(f"fps={FPS}")
    f.append(f"crop={cw}:{ch}:{cx}:{cy},hqdn3d=1.5:1.5:4:4,{GRADE}")
    if fx:
        # echo / afterimage on the pull: from 0.45 s before each contraction to 0.1 s after
        win = "+".join(f"between(t,{h - 0.45:.3f},{h + 0.10:.3f})" for h in out_hits)
        if sp == 0.5:
            win = "+".join(f"between(t,{h - 0.9:.3f},{h + 0.25:.3f})" for h in out_hits)
        if win:
            f.append(f"tmix=frames=6:weights='1 1 1 2 3 6':enable='{win}'")
        Z = "1.035"
        for h in out_hits:
            Z += f"+0.05*exp(-max(0,t-{h:.3f})*7)*gte(t,{h:.3f}-0.02)"
        f.append(f"scale=w='2*trunc({OW // 2}*({Z}))':h='2*trunc({OH // 2}*({Z}))':eval=frame:flags=lanczos")
        sh = "+".join(f"18*exp(-max(0,t-{h:.3f})*10)*gte(t,{h:.3f})" for h in out_hits) or "0"
        f.append(f"crop={OW}:{OH}:x='(iw-{OW})/2+({sh})*sin(t*83)':y='(ih-{OH})/2+({sh})*cos(t*61)'")
    else:
        f.append(f"scale={OW}:{OH}:flags=lanczos")
    f.append("unsharp=7:7:0.7:5:5:0.0,format=yuv420p,tpad=stop_mode=clone:stop_duration=2")
    if i == len(SEG) - 1:
        f.append(f"fade=t=out:st={dur - 0.8:.3f}:d=0.8")
    srcdur = dur * sp + 0.6
    out = f"{S}/seg_{mode}/{i:02d}.mp4"
    return ['ffmpeg', '-v', 'error', '-y', '-ss', f'{ss:.3f}', '-t', f'{srcdur:.3f}', '-i', src[clip],
            '-vf', ','.join(f), '-frames:v', str(nf), '-an', '-c:v', 'libx264', '-crf', '14',
            '-preset', 'medium', '-r', str(FPS), out]

def ramp_pieces(hits, ss, dur):
    """Each contraction keeps its constant-speed output time; 0.2 s of source around it plays at 0.5x
    (0.4 s output), the rest of the rep is sped up to compensate."""
    rel = [h - ss for h in hits]
    pieces, cur_s, cur_o = [], 0.0, 0.0
    for r in rel:
        a = max(cur_s, r - 0.10)
        oa = a + 0.0 if not pieces else None
        # output time where slow part must start so the hit lands at output r: r - 0.2
        target_o = max(cur_o, r - 0.20)
        if a > cur_s:
            span_o = max(0.05, target_o - cur_o)
            pieces.append((a - cur_s, (a - cur_s) / span_o)); cur_o += span_o; cur_s = a
        ln = min(0.20, r + 0.10 - cur_s)
        pieces.append((ln, 0.5)); cur_s += ln; cur_o += ln / 0.5
    # remaining: map so that output ends at dur with source ending at dur (1x average)
    rest_o = max(0.05, dur - cur_o)
    rest_s = max(0.05, dur - cur_s)
    pieces.append((rest_s, rest_s / rest_o))
    return pieces

def ramp_out_hits(hits, ss, pieces):
    res = []
    for h in hits:
        T = h - ss; s0 = o0 = 0.0
        for ln, sp in pieces:
            if T <= s0 + ln:
                res.append(o0 + (T - s0) / sp); break
            s0 += ln; o0 += ln / sp
    return res

def final(mode):
    lst = f'{S}/list_{mode}.txt'
    with open(lst, 'w') as fh:
        for p in sorted(glob.glob(f'{S}/seg_{mode}/*.mp4')): fh.write(f"file '{p}'\n")
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-i', f'{S}/music2.mp3',
                    '-filter_complex', f"[1:a]atrim=0:{END:.3f},afade=t=out:st={END - 1.0:.3f}:d=1.0[a]",
                    '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k',
                    '-movflags', '+faststart', f'{S}/gym_{mode}.mp4'], check=True)

if __name__ == '__main__':
    mode = sys.argv[1]
    if mode == 'final':
        final(sys.argv[2]); sys.exit()
    if mode == 'dump':
        for i in range(len(SEG)): print(' '.join(seg_cmd(i, sys.argv[2])[10:12])[:3000], '\n')
        sys.exit()
    os.makedirs(f'{S}/seg_{mode}', exist_ok=True)
    for i in ([int(x) for x in sys.argv[2:]] or range(len(SEG))):
        subprocess.run(seg_cmd(i, mode), check=True); print(mode, 'seg', i, flush=True)
