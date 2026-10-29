"""ElevenLabs TTS with character timestamps (supports eleven_v4).
usage: tts4.py <dir> <model> <voice_id> <lang> [SEP]   (SEP: ' ' default, 'NLNL' = paragraph pauses)
writes <dir>/voice.mp3, align.json, timing.js (segment + keyword times, +0.5 s offset)"""
import json, sys, base64, urllib.request
d, model, voice, lang = sys.argv[1:5]; OFF = 0.5
SEP = (sys.argv[5] if len(sys.argv) > 5 else ' ').replace('NL', '\n')
segs = json.load(open(f'{d}/script.json'))
text = SEP.join(s['tts'] for s in segs)
vs = {"stability": 0.5, "similarity_boost": 0.75}
if not model.startswith('eleven_v4'): vs.update({"style": 0.3, "speed": 1.0})
body = json.dumps({"text": text, "model_id": model, "language_code": lang, "voice_settings": vs}).encode()
req = urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{voice}/with-timestamps?output_format=mp3_44100_192", data=body, headers={"Content-Type": "application/json"})
r = json.load(urllib.request.urlopen(req, timeout=600))
open(f'{d}/voice.mp3', 'wb').write(base64.b64decode(r['audio_base64']))
al = r.get('normalized_alignment') or r['alignment']; json.dump(al, open(f'{d}/align.json', 'w'))
st, en = al['character_start_times_seconds'], al['character_end_times_seconds']
pos = 0; SEGS = []; K = {}
for s in segs:
    a, b = pos, pos + len(s['tts']) - 1
    SEGS.append(dict(s=s['s'], sub=s['sub'], t0=round(st[a] + OFF, 3), t1=round(en[b] + OFF, 3)))
    for k, w in s['keys'].items():
        i = s['tts'].find(w); K[k] = round(st[a + i + min(2, len(w) - 1)] + OFF, 3)
    pos = b + 1 + len(SEP)
open(f'{d}/timing.js', 'w').write('const SEGS=%s;\nconst K=%s;\n' % (json.dumps(SEGS, ensure_ascii=False), json.dumps(K)))
print(d, 'chars', len(text), 'end', SEGS[-1]['t1'])
