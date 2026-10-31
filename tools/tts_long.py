"""Long-form voiceover: one ElevenLabs request per section with request stitching (previous_text/next_text),
concatenated with pauses. usage: tts_long.py <dir> <model> <voice_id> <lang> [gap_s]
Writes <dir>/voice.mp3 and <dir>/data.json {segs, k, captions, dur} (times include +0.5 s offset)."""
import json, sys, base64, urllib.request, subprocess, re, os
d, model, voice, lang = sys.argv[1:5]; gap = float(sys.argv[5]) if len(sys.argv) > 5 else 0.6; OFF = 0.5
S = json.load(open(f'{d}/script.json')); os.makedirs(f'{d}/parts', exist_ok=True)
segs, K, caps, files = [], {}, [], []; cur = 0.0
for i, s in enumerate(S):
	body = {"text": s['tts'], "model_id": model, "language_code": lang, "voice_settings": {"stability": 0.5, "similarity_boost": 0.75}}
	if i > 0: body["previous_text"] = S[i - 1]['tts'][-400:]
	if i < len(S) - 1: body["next_text"] = S[i + 1]['tts'][:400]
	r = json.load(urllib.request.urlopen(urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{voice}/with-timestamps?output_format=mp3_44100_192", data=json.dumps(body).encode(), headers={"Content-Type": "application/json"}), timeout=600))
	f = f'{d}/parts/p{i:02d}.mp3'; open(f, 'wb').write(base64.b64decode(r['audio_base64'])); files.append(f)
	al = r.get('normalized_alignment') or r['alignment']; st, en = al['character_start_times_seconds'], al['character_end_times_seconds']
	dur = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).decode())
	base = cur + OFF
	segs.append({'s': s['s'], 'sub': '', 't0': round(base + st[0], 3), 't1': round(base + en[-1], 3)})
	for k, w in s['keys'].items():
		j = s['tts'].find(w); K[k] = round(base + st[j + min(2, len(w) - 1)], 3)
	for m in re.finditer(r'\S+', s['tts']):
		caps.append({'text': (' ' if caps else '') + m.group(0), 'startMs': round((base + st[m.start()]) * 1000), 'endMs': round((base + en[m.end() - 1]) * 1000), 'timestampMs': None, 'confidence': 1})
	caps[-1]['pageBreakAfter'] = True
	cur += dur + gap
	print('section', i + 1, round(dur, 1), 's')
lst = f'{d}/parts/list.txt'
with open(lst, 'w') as fh:
	for i, f in enumerate(files):
		fh.write(f"file '{os.path.abspath(f)}'\n")
		if i < len(files) - 1: fh.write(f"file '{os.path.abspath(d)}/parts/gap.mp3'\n")
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'lavfi', '-i', f'anullsrc=r=44100:cl=mono', '-t', str(gap), '-b:a', '192k', f'{d}/parts/gap.mp3'], check=True)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-ar', '44100', '-ac', '1', '-b:a', '192k', f'{d}/voice.mp3'], check=True)
json.dump({'segs': segs, 'k': K, 'captions': caps, 'dur': segs[-1]['t1'] + 3.0}, open(f'{d}/data.json', 'w'), ensure_ascii=False)
print('total', round(segs[-1]['t1'], 1), 's')
