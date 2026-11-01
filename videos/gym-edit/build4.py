#!/usr/bin/env python3
"""Accents on the user's own edit (user_edit.mov) - timing and audio untouched, HDR (HLG) kept.
Micro speed ramps that keep every contraction on its original time, two short thermal flashes,
subtle punch-ins; 4K upscale. usage: build4.py [out.mp4]
"""
import os, subprocess, sys
from build2 import remap

S = os.path.dirname(os.path.abspath(__file__))
IN = f'{S}/user_edit.mov'
OUT = sys.argv[1] if len(sys.argv) > 1 else f'{S}/gym4_accents.mp4'
DUR = 18.508
FPS, OW, OH = 60, 2160, 3840

RAMPS = [3.75, 7.10, 10.10, 13.95]       # contractions: slow-mo around them, speed-up on both sides
SLOW, LEAD = 0.12, 0.50                  # +-0.12 s of source at 0.5x, 0.5 s of source sped up each side
THERMAL = [(7.02, 7.18), (11.96, 12.08)]
PUNCH = [(0.0, 0.05), (3.75, 0.03), (7.02, 0.045), (11.96, 0.035), (13.95, 0.03), (14.70, 0.03), (17.45, 0.025)]
HEAT = "clip((cr(X/2,Y/2)-128)*7-(cb(X/2,Y/2)-128)*4+lum(X,Y)*0.25,0,255)"

def pieces():
    out, pos = [], 0.0
    for c in RAMPS:
        a = c - SLOW - LEAD
        out.append((a - pos, 1.0))
        out.append((LEAD, LEAD / (LEAD - SLOW)))
        out.append((2 * SLOW, 0.5))
        out.append((LEAD, LEAD / (LEAD - SLOW)))
        pos = c + SLOW + LEAD
    out.append((DUR - pos + 1, 1.0))
    return out

def between(spans): return "+".join(f"between(t,{a:.3f},{b:.3f})" for a, b in spans)

slow_win = between([(c - SLOW * 2, c + SLOW * 2) for c in RAMPS])
Z = "1" + "".join(f"+{amp}*exp(-max(0,t-{t0:.3f})*8)*gte(t,{t0:.3f})" for t0, amp in PUNCH)
fc = (
    f"[0:v]setpts=PTS-STARTPTS,setpts='({remap(pieces())})/TB',fps={FPS},"
    f"tmix=frames=2:enable='{slow_win}',format=yuv420p10le,split[m][t];"
    f"[t]format=yuv420p,geq=lum='{HEAT}':cb=128:cr=128,gblur=sigma=4,pseudocolor=p=inferno,"
    f"eq=brightness=-0.04,format=yuv420p10le[th];"
    f"[m][th]overlay=enable='{between(THERMAL)}',"
    f"scale=w='2*trunc({OW // 2}*({Z}))':h='2*trunc({OH // 2}*({Z}))':eval=frame:flags=lanczos,"
    f"crop={OW}:{OH},unsharp=5:5:0.5:5:5:0.0,format=yuv420p10le[v]"
)
cmd = ['ffmpeg', '-v', 'error', '-y', '-i', IN, '-filter_complex', fc, '-map', '[v]', '-map', '0:a',
       '-c:v', 'libx265', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p10le', '-tag:v', 'hvc1',
       '-x265-params', 'colorprim=bt2020:transfer=arib-std-b67:colormatrix=bt2020nc:log-level=error',
       '-color_primaries', 'bt2020', '-color_trc', 'arib-std-b67', '-colorspace', 'bt2020nc',
       '-c:a', 'copy', '-t', f'{DUR}', '-movflags', '+faststart', OUT]
if __name__ == '__main__':
    print(pieces())
    subprocess.run(cmd, check=True)
