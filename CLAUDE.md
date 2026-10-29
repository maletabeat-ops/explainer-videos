# Explainer videos — "HOW?" series

Vertical (1080×1920, 30 fps) explainer videos for Instagram Reels / YouTube Shorts, made in **two languages in parallel**:
a Russian channel and an American (English) channel. Each video is ~60–75 s ("a bit over a minute" is the target).

## Workflow (follow this every time)
1. **Research facts first** (WebSearch). Money/geo topics must be accurate and current; cite sources to the user.
   Watch the scope: a *country* is not a *city* (earlier mistake: "Dubai" vs "UAE").
2. **Write RU and EN scripts in parallel** — localize, don't translate (units, currency, local examples,
   natural phrasing). Keep both voiceovers within ~5% length. Each script is `videos/<topic>/<lang>/script.json`:
   segments `{s: chapter 1..8, tts, sub, keys: {name: "word in tts"}}`; `keys` drive animation timing.
3. **Voice (ElevenLabs, eleven_v3)** via `tools/tts2.py <dir> eleven_v3 <voice>` (RU) or
   `tools/tts3.py <dir> eleven_v3 <voice> 0.92 NLNL` (EN, paragraph pauses). Writes `voice.mp3`, `align.json`, `timing.js`.
   - RU voice: **George** `JBFqnCBsd6RMkjVDRZzb` (user loves it for Russian).
   - EN voice: **"Explainer US Male (v1)"** `w4gF2zzYSAgjVtnUV41o` — American, warm (user chose variant "A", natural).
     It reads fast: fit timing with `tools/post.py <dir> <gap_s> <tempo>` (e.g. `0.5 0.97`) instead of regenerating.
   - The API key cannot list voices (no voices_read); Voice Design + save works.
4. **Music/SFX**: ElevenLabs `/v1/music` (~70–80 s) and `/v1/sound-generation`; music at ~0.14 volume under voice.
5. **Animation** — two engines:
   - **three.js + 2D canvas page** (`videos/microwave`, `videos/uae`): `index.html?lang=ru|en` exposes `renderFrame(t)`;
     render with `node tools/render3.js <index.html> <lang> <outdir> video` (SwiftShader WebGL, ~25 min/video),
     then mix with `tools/mix3.py` / `mix5.py`. Needs `npm i` at repo root (three@0.169.0; `node_modules` symlinks).
   - **Remotion** (`videos/switzerland-remotion`, preferred for new videos): React scenes, MapLibre 3D maps
     (fixed camera plate, animate data/CSS only), TikTok-style word captions from `capgen.py`, `TransitionSeries`.
     Render: `npx remotion render SwissRU out.mp4 --gl=swangle --concurrency=4 --crf=18`.
   Voice timings already include a +0.5 s offset → voice audio must start at 0.5 s.
6. **Check stills before the full render** (layout, cropping, overlaps), then render both languages.
7. **Deliverables per video**: RU + EN MP4, covers (`tools/cover_all.js` / `drawCover`), Instagram title,
   caption, hashtags and a pinned first comment → append to `instagram_posts.md`.

## Style
- Dark neon look, glowing pills/badges, header with progress bar + "0N / 08" chapters, 8 chapters per video.
- Each video has its own palette but the same system. Persistent element at the bottom (ledger / chain / stage list).
- Prefer real 3D (three.js / MapLibre extrusions) where it helps; avoid crooked/ill-fitting geometry — verify with stills.
- Covers: "ВЫ ЗНАЛИ? / DID YOU KNOW?" kicker + big 2-line title, key content inside the 3:4 safe area.
- Brand: 3D "HOW?" / "КАК?" logo (`brand/avatar`), YouTube banner `brand/banner` (2560×1440, safe 1546×423).

## Videos so far
coffee (2D, EN voice is the old British one — needs re-voicing), dishwasher (2D), microwave (3D), UAE taxes (3D),
switzerland salaries (Remotion). Old "Dubai" version was replaced by UAE.
