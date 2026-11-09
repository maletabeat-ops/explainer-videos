"""One-breath voiceover: the WHOLE script + CTA in ONE ElevenLabs request (no cutting, no inserted silences),
optional global tempo (atempo on the whole file, never split), light denoise + highpass, fades.
usage: tts_smooth.py <dir> <voice_id> <lang> "<cta text>" [tempo=1.0]
writes <dir>/voice.mp3 + data.json {segs, k, captions, dur} (times include the +0.5 s offset; k.cta = CTA start)."""
import json, sys, base64, urllib.request, subprocess, re
d, voice, lang, cta = sys.argv[1:5]; tempo = float(sys.argv[5]) if len(sys.argv) > 5 else 1.0; OFF = 0.5
S = json.load(open(f'{d}/script.json'))
parts = [s['tts'] for s in S] + [cta]
text = ' '.join(parts)
body = {"text": text, "model_id": "eleven_v4", "language_code": lang, "voice_settings": {"stability": 0.55, "similarity_boost": 0.75}}
r = json.load(urllib.request.urlopen(urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{voice}/with-timestamps?output_format=mp3_44100_192", data=json.dumps(body).encode(), headers={"Content-Type": "application/json"}), timeout=600))
open(f'{d}/voice_take.mp3', 'wb').write(base64.b64decode(r['audio_base64']))
al = r.get('normalized_alignment') or r['alignment']; st, en = al['character_start_times_seconds'], al['character_end_times_seconds']
raw = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f'{d}/voice_take.mp3']).decode())
af = f"highpass=f=70,afftdn=nf=-28:nr=10,atempo={tempo},afade=t=in:d=0.04,afade=t=out:st={raw / tempo - 0.25}:d=0.25"
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'{d}/voice_take.mp3', '-af', af, '-ar', '44100', '-b:a', '192k', f'{d}/voice.mp3'], check=True)
T = lambda x: round(x / tempo + OFF, 3)
segs, K, caps = [], {}, []; pos = 0
for i, p in enumerate(parts):
    a, b = pos, pos + len(p) - 1
    if i < len(S):
        segs.append({'s': S[i]['s'], 'sub': '', 't0': T(st[a]), 't1': T(en[b])})
        for k, w in S[i]['keys'].items():
            j = p.find(w); K[k] = T(st[a + j + min(2, len(w) - 1)])
    else:
        segs.append({'s': S[-1]['s'], 'sub': '', 't0': T(st[a]), 't1': T(en[b]), 'cta': True}); K['cta'] = T(st[a])
    for m in re.finditer(r'\S+', p):
        caps.append({'text': (' ' if caps else '') + m.group(0), 'startMs': round(T(st[a + m.start()]) * 1000), 'endMs': round(T(en[a + m.end() - 1]) * 1000), 'timestampMs': None, 'confidence': 1})
    caps[-1]['pageBreakAfter'] = True
    pos = b + 2
dur = segs[-1]['t1'] + 3.2
json.dump({'segs': segs, 'k': K, 'captions': caps, 'dur': dur}, open(f'{d}/data.json', 'w'), ensure_ascii=False)
print(d, 'chars', len(text), 'voice', round(raw / tempo, 1), 's, dur', round(dur, 1))
