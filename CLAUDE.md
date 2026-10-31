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
   - EN voice: **Jessica** `cgSgspJ2msm6clMCkdW9` on `eleven_v4` (user's choice since the fridge video; young
     expressive American female). Older videos used "Explainer US Male (v1)" `w4gF2zzYSAgjVtnUV41o`.
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
7. **Deliverables per NEW video (always, at the end, without being asked)** for BOTH the RU and EN version:
   a **cover** (1080×1920), a **title** and the **pinned-comment text** — written out in the chat, also appended to
   `instagram_posts.md`. **No description/caption needed.** Don't redo texts for older videos.
8. **Models**: use `eleven_v4` (`tools/tts4.py`, pass language code; v4 only takes stability/similarity) and `music_v2_5`.
   EN: do NOT use paragraph separators (NLNL) — they create odd pauses that sound like a cut; avoid tiny standalone
   sentences like "It can't." between pauses.
9. **Ending CTA (always)**: the voice ends with a follow/like line (RU "Подпишись и поставь лайк — впереди ещё больше
   разборов!", EN similar) — `tools/append_cta.py` adds it with request stitching — plus the animated end card
   (Follow button tapped → "Following ✓", heart fills) from `videos/fridge/remotion/src/Overlays.tsx` `CTA`.
10. **SFX**: NO whoosh/transition sounds on camera moves (user hates them, "like hitting a pipe"). Keep only
    meaningful SFX tied to on-screen actions (pop for labels, door, compressor click, etc.). — see `.claude/skills`
   (official ElevenLabs skills: text-to-speech, music, sound-effects, voice-isolator, speech-to-text, dubbing...).

## Long-form YouTube (EN) — per new topic, on request
- Besides the RU + EN vertical shorts, the user may want a **horizontal 16:9 (1920×1080) EN video, 6–8 min**
  (≥8 min enables mid-roll ads) for the English YouTube channel: a deeper, separate script on the same topic
  (more facts/examples), NOT a stretched short. Reuse the short's Remotion scenes re-laid out for 16:9, its music
  (loop/crossfade) and SFX → only TTS costs credits (~1 credit/char: ~4k for 4–5 min, ~7k for 8 min).
- Use on-screen section titles (lower thirds) instead of chapter counters, and give the user YouTube chapter
  timestamps, a title and a 1280×720 thumbnail.

## Style
- **Every video gets its own twist** (user request): keep the series look (dark neon, header, captions, CTA), but
  don't copy the previous template — vary the hero visual, camera moves, transitions, a signature gimmick,
  palette, music mood. Experiment freely, but cheaply (reuse code/assets; don't burn ElevenLabs credits on
  throwaway generations).
- Dark neon look, glowing pills/badges, header with the topic title only. **NO progress bar and NO chapter
  counter ("0N / 08") at the top** (user request) — the story still has ~8 beats internally.
- Each video has its own palette but the same system. Persistent element at the bottom (ledger / chain / stage list).
- Prefer real 3D (three.js / R3F via `@remotion/three` / MapLibre extrusions) where it helps; avoid crooked/ill-fitting geometry — verify with stills.
- Covers: "ВЫ ЗНАЛИ? / DID YOU KNOW?" kicker + big 2-line title, key content inside the 3:4 safe area.
- Brand: 3D "HOW?" / "КАК?" logo (`brand/avatar`), YouTube banner `brand/banner` (2560×1440, safe 1546×423).

## Videos so far
coffee (2D, EN voice is the old British one — needs re-voicing), dishwasher (2D), microwave (3D), UAE taxes (3D),
switzerland salaries (Remotion), fridge (Remotion + R3F 3D, eleven_v4, CTA). Old "Dubai" version was replaced by UAE.
