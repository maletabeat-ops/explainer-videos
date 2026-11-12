"""Smooth long-form voiceover: one request per section with request stitching (previous_text/next_text),
each part trimmed to its own speech (natural head/tail, NO inserted digital silence), concatenated, then ONE global
filter chain (highpass + light denoise + atempo) over the whole file so the noise floor never switches on/off.
usage: tts_long_smooth.py <dir> <voice_id> <lang> "<cta text>" [tempo=1.0] [tail=0.32]
Writes <dir>/voice.mp3, data.json {segs (with title), k, captions, dur}; times include +0.5 s offset; k.cta = CTA start.
Re-run with a different tempo reuses cached parts (no credits)."""
import json, sys, base64, urllib.request, subprocess, re, os
d, voice, lang, cta = sys.argv[1:5]; tempo = float(sys.argv[5]) if len(sys.argv) > 5 else 1.0
tail = float(sys.argv[6]) if len(sys.argv) > 6 else 0.32; OFF = 0.5
S = json.load(open(f'{d}/script.json')); os.makedirs(f'{d}/parts', exist_ok=True)
texts = [s['tts'] for s in S]; texts[-1] = texts[-1] + ' ' + cta
segs, K, caps, files = [], {}, [], []; cur = 0.0
T = lambda x: round(x / tempo + OFF, 3)
for i, s in enumerate(S):
	f = f'{d}/parts/s{i:02d}.mp3'; fj = f'{d}/parts/s{i:02d}.json'
	if not os.path.exists(fj):
		body = {"text": texts[i], "model_id": "eleven_v4", "language_code": lang, "voice_settings": {"stability": 0.55, "similarity_boost": 0.75}}
		if i > 0: body["previous_text"] = texts[i - 1][-500:]
		if i < len(S) - 1: body["next_text"] = texts[i + 1][:300]
		r = json.load(urllib.request.urlopen(urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{voice}/with-timestamps?output_format=mp3_44100_192", data=json.dumps(body).encode(), headers={"Content-Type": "application/json"}), timeout=600))
		open(f, 'wb').write(base64.b64decode(r['audio_base64'])); json.dump(r.get('normalized_alignment') or r['alignment'], open(fj, 'w'))
	al = json.load(open(fj)); st, en = al['character_start_times_seconds'], al['character_end_times_seconds']
	dur = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).decode())
	a = max(0.0, st[0] - 0.06); b = min(dur, en[-1] + tail)
	files.append((f, a, b)); L = lambda x: T(cur + x - a)
	p = texts[i]
	segs.append({'s': s['s'], 'title': s.get('title', ''), 't0': L(st[0]), 't1': L(en[len(s['tts']) - 1])})
	for k, w in s['keys'].items():
		j = s['tts'].find(w); K[k] = L(st[j + min(2, len(w) - 1)])
	if i == len(S) - 1: K['cta'] = L(st[len(s['tts']) + 1])
	for m in re.finditer(r'\S+', p):
		caps.append({'text': (' ' if caps else '') + m.group(0), 'startMs': round(L(st[m.start()]) * 1000), 'endMs': round(L(en[m.end() - 1]) * 1000), 'timestampMs': None, 'confidence': 1})
		if i == len(S) - 1 and m.end() == len(s['tts']): caps[-1]['pageBreakAfter'] = True
	caps[-1]['pageBreakAfter'] = True
	cur += b - a
	print('section', i + 1, round(b - a, 1), 's')
inp = sum([['-i', f] for f, _, _ in files], [])
fc = ''.join(f"[{i}:a]atrim={a}:{b},asetpts=PTS-STARTPTS,aformat=sample_rates=44100:channel_layouts=mono,afade=t=in:d=0.02,afade=t=out:st={b - a - 0.04}:d=0.04[p{i}];" for i, (f, a, b) in enumerate(files))
fc += ''.join(f'[p{i}]' for i in range(len(files))) + f'concat=n={len(files)}:v=0:a=1,highpass=f=70,afftdn=nf=-28:nr=10,atempo={tempo},afade=t=in:d=0.04,afade=t=out:st={cur / tempo - 0.3}:d=0.3[out]'
subprocess.run(['ffmpeg', '-v', 'error', '-y', *inp, '-filter_complex', fc, '-map', '[out]', '-ar', '44100', '-b:a', '192k', f'{d}/voice.mp3'], check=True)
dur = T(cur) + 3.2
json.dump({'segs': segs, 'k': K, 'captions': caps, 'dur': dur}, open(f'{d}/data.json', 'w'), ensure_ascii=False)
print('voice', round(cur / tempo, 1), 's  total', round(dur, 1), 's =', f'{int(dur // 60)}:{dur % 60:04.1f}')
