#!/usr/bin/env python3
"""Gym edit: beat-synced segments (ffmpeg) + PIL overlay layer (text, flashes, letterbox)."""
import os, subprocess, sys, math, glob
from PIL import Image, ImageDraw, ImageFont, ImageFilter

S = os.path.dirname(os.path.abspath(__file__))
U = '/root/.claude/uploads/808d8be5-6164-5c55-90d6-5e67735981ad'
src = {n: glob.glob(f'{U}/*IMG_{n}.mov')[0] for n in ('9852', '9854', '9855', '9858', '9859')}
FPS = 30
B = 60 / 140          # beat
D = 6.88              # drop
END = 23.0
def k(i): return D + i * B

TM = ("zscale=tin=arib-std-b67:min=bt2020nc:pin=bt2020:rin=tv:t=linear:npl=203,format=gbrpf32le,"
      "zscale=p=bt709,tonemap=hable:desat=0:peak=4.9,zscale=t=bt709:m=bt709:r=tv,format=yuv420p")
CROP = {  # w,h,x,y in rotated 1080x1920 frame
    '9854': (675, 1200, 405, 420), '9855': (771, 1371, 35, 275),
    '9859': (585, 1040, 420, 0), '9858': (980, 1742, 50, 90), '9852': (1080, 1920, 0, 0)}
GRADE = {
    'intro': "hue=s=0.3,eq=contrast=1.12:brightness=-0.04,colorbalance=bs=0.06:bm=0.03,noise=alls=10:allf=t",
    'bw': "hue=s=0,eq=contrast=1.35:brightness=-0.02,noise=alls=12:allf=t",
    'drop': ("eq=contrast=1.2:saturation=1.2:brightness=-0.01,"
             "colorbalance=rs=-0.05:bs=0.07:rh=0.06:bh=-0.05,unsharp=5:5:0.6,noise=alls=5:allf=t"),
}

# (start, end, clip, src_start, speed, grade, fx) ; fx: punch/shake/glitch/pulse/push/freeze
SEG = [
    (0.0,  k(-10), '9854', 0.5, 0.5, 'intro', {'push'}),
    (k(-10), k(-6), '9855', 1.6, 0.5, 'intro', {'push'}),
    (k(-6), k(-2), '9859', 3.6, 0.5, 'intro', {'push'}),
    (k(-2), k(0),  '9858', 0.8, 1.5, 'bw', {'shake'}),
    (k(0),  k(4),  '9858', 2.6, 1.0, 'drop', {'punch', 'shake', 'pulse'}),
    (k(4),  k(6),  '9852', 1.5, 1.0, 'drop', {'punch', 'glitch'}),
    (k(6),  k(8),  '9859', 4.0, 1.0, 'drop', {'punch', 'pulse'}),
    (k(8),  k(10), '9858', 5.0, 0.5, 'drop', {'punch'}),
    (k(10), k(12), '9858', 6.0, 1.6, 'drop', {'shake', 'pulse'}),
    (k(12), k(14), '9852', 3.0, 1.0, 'drop', {'punch', 'glitch'}),
    (k(14), k(16), '9859', 10.5, 1.0, 'drop', {'punch', 'pulse'}),
    (k(16), k(20), '9852', 4.2, 0.5, 'drop', {'punch', 'push'}),
    (k(20), k(22), '9858', 0.3, 1.2, 'drop', {'punch', 'shake', 'pulse'}),
    (k(22), k(24), '9855', 1.0, 1.0, 'drop', {'punch', 'glitch'}),
    (k(24), k(26), '9859', 8.6, 1.0, 'drop', {'punch', 'pulse'}),
    (k(26), k(28), '9858', 6.8, 1.0, 'drop', {'punch', 'glitch'}),
    (k(28), k(30), '9852', 6.0, 1.0, 'drop', {'punch', 'shake', 'pulse'}),
    (k(30), END,   '9858', 3.1, 0.5, 'drop', {'punch', 'freeze'}),
]
FREEZE_AT = k(30) + 0.9   # freeze frame + B&W

def frames(t): return round(t * FPS)

def seg_cmd(i, s):
    t0, t1, clip, ss, sp, grade, fx = s
    nf = frames(t1) - frames(t0)
    play = nf / FPS
    if 'freeze' in fx: play = FREEZE_AT - t0
    srcdur = play * sp + 0.2
    cw, ch, cx, cy = CROP[clip]
    f = [TM, f"setpts=(PTS-STARTPTS)/{sp}"]
    if sp > 1: f.append("tmix=frames=3:weights='1 2 1'")
    f.append(f"fps={FPS}")
    f.append(f"crop={cw}:{ch}:{cx}:{cy},scale=1080:1920:flags=lanczos")
    # dynamic zoom: base, punch-in decay, beat pulse, slow push
    Z = "1.06"
    if 'punch' in fx: Z += "+0.14*exp(-t*9)"
    if 'pulse' in fx: Z += f"+0.035*exp(-mod(t,{B:.5f})*14)"
    if 'push' in fx: Z += f"+0.08*t/{max(play,0.1):.3f}"
    f.append(f"scale=w='2*trunc(540*({Z}))':h='2*trunc(960*({Z}))':eval=frame:flags=bicubic")
    sh = "0"
    if 'shake' in fx: sh = f"(14*exp(-mod(t,{2*B:.5f})*6)+4)"
    f.append(f"crop=1080:1920:x='(iw-1080)/2+{sh}*sin(t*71)':y='(ih-1920)/2+{sh}*cos(t*53)'")
    f.append(GRADE[grade])
    if 'glitch' in fx:
        f.append("rgbashift=rh=-18:bh=18:rv=6:enable='lt(t,0.17)'")
    if 'freeze' in fx:
        f.append(f"tpad=stop_mode=clone:stop_duration={END - FREEZE_AT + 0.5:.3f}")
        f.append(f"hue=s='min(1,max(0,1-(t-{play:.3f})*6))'")   # fades to B&W on freeze
        f.append(f"eq=contrast=1.25:enable='gte(t,{play:.3f})'")
    f.append("vignette=PI/4.5,format=yuv420p")
    out = f"{S}/seg/{i:02d}.mp4"
    return ['ffmpeg', '-v', 'error', '-y', '-ss', str(ss), '-t', f'{srcdur:.3f}', '-i', src[clip],
            '-vf', ','.join(f), '-frames:v', str(nf), '-an', '-c:v', 'libx264', '-crf', '15',
            '-preset', 'medium', '-r', str(FPS), out]

# ---------------- overlay layer ----------------
W, H = 1080, 1920
FB = '/usr/share/fonts/opentype/inter/InterDisplay-Black.otf'
FBI = '/usr/share/fonts/opentype/inter/InterDisplay-BlackItalic.otf'
FS = '/usr/share/fonts/opentype/inter/Inter-SemiBold.otf'
_fc = {}
def font(p, sz):
    if (p, sz) not in _fc: _fc[(p, sz)] = ImageFont.truetype(p, sz)
    return _fc[(p, sz)]

def text_img(txt, fp, sz, fill=(255, 255, 255), track=0, stroke=0, glow=None):
    f = font(fp, sz)
    ws = [f.getbbox(c)[2] for c in txt]
    tw = int(sum(ws) + track * (len(txt) - 1)) + 80
    th = int(sz * 1.4) + 80
    im = Image.new('RGBA', (tw, th), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    x = 40
    for c, w in zip(txt, ws):
        if stroke:
            d.text((x, 40), c, font=f, fill=(0, 0, 0, 0), stroke_width=stroke, stroke_fill=fill)
        else:
            d.text((x, 40), c, font=f, fill=fill)
        x += w + track
    if glow:
        g = im.copy().filter(ImageFilter.GaussianBlur(glow))
        base = Image.new('RGBA', im.size, (0, 0, 0, 0))
        base.alpha_composite(g); base.alpha_composite(g); base.alpha_composite(im)
        im = base
    return im

def paste(fr, im, cx, cy, scale=1.0, alpha=1.0):
    if alpha <= 0.01: return
    if scale != 1.0:
        im = im.resize((max(1, int(im.width * scale)), max(1, int(im.height * scale))), Image.LANCZOS)
    if alpha < 1:
        a = im.getchannel('A').point(lambda v: int(v * alpha)); im = im.copy(); im.putalpha(a)
    fr.alpha_composite(im, (int(cx - im.width / 2), int(cy - im.height / 2)))

def ease_punch(dt, dur=0.14, s0=1.35):
    if dt < 0: return None
    p = min(1, dt / dur)
    return 1 + (s0 - 1) * (1 - p) ** 3

T_INTRO = text_img('NO ONE SEES THE WORK', FS, 46, track=10)
T_SELF = text_img('SELF', FBI, 230, glow=18)
T_CTRL = text_img('CONTROL', FBI, 190, stroke=5, glow=14)
T_NDO = text_img('NO DAYS OFF', FBI, 150, glow=16)
T_END1 = text_img('SELF', FB, 220, glow=20)
T_END2 = text_img('CONTROL', FB, 170, stroke=5, glow=14)
T_END3 = text_img('DISCIPLINE  >  MOTIVATION', FS, 40, track=8, fill=(255, 255, 255))

EMPTY = Image.new('RGBA', (W, H), (0, 0, 0, 0))
SHADE_END = Image.new('RGBA', (W, H), (0, 0, 0, 0))
_sd = ImageDraw.Draw(SHADE_END)
for y in range(560, 1360):
    _sd.line([(0, y), (W, y)], fill=(0, 0, 0, int(150 * math.sin(math.pi * (y - 560) / 800))))
T_END3 = text_img('DISCIPLINE  >  MOTIVATION', FS, 42, track=8, glow=None)
FLASH_BIG = [k(0)]
FLASH_SMALL = [k(i) for i in (4, 8, 12, 16, 20, 24, 28, 30)]

def overlay(t):
    fr = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(fr)
    # letterbox in intro, snaps open on drop
    bar = 0
    if t < D: bar = 210
    elif t < D + 0.2: bar = int(210 * (1 - (t - D) / 0.2) ** 2)
    if bar: d.rectangle([0, 0, W, bar], fill=(0, 0, 0, 255)); d.rectangle([0, H - bar, W, H], fill=(0, 0, 0, 255))
    # intro typewriter line
    if 0.5 <= t < k(-6):
        n = min(len('NO ONE SEES THE WORK'), int((t - 0.5) / 0.07) + 1)
        sub = text_img('NO ONE SEES THE WORK'[:n], FS, 46, track=10)
        a = 1.0 if t < k(-6) - 0.4 else (k(-6) - t) / 0.4
        fr.alpha_composite(Image.new('RGBA', (1, 1)), (0, 0))
        im = sub
        if a < 1:
            al = im.getchannel('A').point(lambda v: int(v * a)); im = im.copy(); im.putalpha(al)
        fr.alpha_composite(im, (int(W / 2 - T_INTRO.width / 2), H - 210 - 150))
    # SELF / CONTROL hits on the build
    if k(-2) <= t < D:
        s = ease_punch(t - k(-2)); paste(fr, T_SELF, W / 2, 820, s)
        if t >= k(-1):
            s = ease_punch(t - k(-1)); paste(fr, T_CTRL, W / 2, 1040, s)
    # NO DAYS OFF over slow-mo face
    if k(16) + 0.1 <= t < k(20):
        dt = t - k(16) - 0.1
        a = 1 if t < k(20) - 0.15 else (k(20) - t) / 0.15
        paste(fr, T_NDO, W / 2, 1420, ease_punch(dt, 0.18, 1.5), a)
    # ending over freeze
    if t >= FREEZE_AT:
        dt = t - FREEZE_AT
        fade = 1 if t < END - 0.7 else max(0, (END - 0.15 - t) / 0.55)
        fr.alpha_composite(SHADE_END if dt > 0.3 else Image.blend(EMPTY, SHADE_END, dt / 0.3))
        paste(fr, T_END1, W / 2, 800, ease_punch(dt, 0.16, 1.4), fade)
        if dt > B:
            paste(fr, T_END2, W / 2, 1000, ease_punch(dt - B, 0.16, 1.4), fade)
        if dt > 2 * B:
            paste(fr, T_END3, W / 2, 1160, 1.0, min(1, (dt - 2 * B) / 0.3) * fade)
    # flashes
    fa = 0
    for ft in FLASH_BIG:
        if 0 <= t - ft < 0.3: fa = max(fa, 1 - (t - ft) / 0.3)
    for ft in FLASH_SMALL:
        if 0 <= t - ft < 0.1: fa = max(fa, 0.45 * (1 - (t - ft) / 0.1))
    if FREEZE_AT <= t < FREEZE_AT + 0.2: fa = max(fa, 0.8 * (1 - (t - FREEZE_AT) / 0.2))
    if fa > 0: fr.alpha_composite(Image.new('RGBA', (W, H), (255, 255, 255, int(255 * fa))))
    # final fade to black
    if t > END - 0.5:
        fr.alpha_composite(Image.new('RGBA', (W, H), (0, 0, 0, int(255 * min(1, (t - END + 0.5) / 0.45)))))
    return fr

if __name__ == '__main__':
    what = sys.argv[1]
    os.makedirs(f'{S}/seg', exist_ok=True); os.makedirs(f'{S}/ov', exist_ok=True)
    if what == 'segs':
        only = [int(x) for x in sys.argv[2:]] or range(len(SEG))
        for i in only:
            subprocess.run(seg_cmd(i, SEG[i]), check=True); print('seg', i, flush=True)
    elif what == 'ov':
        a, b = int(sys.argv[2]), int(sys.argv[3])
        for n in range(a, min(b, frames(END))):
            overlay(n / FPS).save(f'{S}/ov/{n:05d}.png', compress_level=1)
    elif what == 'n':
        print(frames(END))
