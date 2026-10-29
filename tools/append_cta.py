"""Append a call-to-action line to an existing voiceover without regenerating it.
usage: append_cta.py <dir> <model> <voice_id> <lang> "<text>" [gap_s]
Generates the line with request stitching (previous_text), appends it to voice.mp3 after a pause,
and extends data.json (segs, k.cta, captions, dur). Keeps the original in voice_nocta.mp3 / data_nocta.json."""
import json, sys, base64, urllib.request, subprocess, shutil, os, re
d, model, voice, lang, text = sys.argv[1:6]; gap = float(sys.argv[6]) if len(sys.argv) > 6 else 0.45; OFF = 0.5
if not os.path.exists(f'{d}/voice_nocta.mp3'): shutil.copy(f'{d}/voice.mp3', f'{d}/voice_nocta.mp3'); shutil.copy(f'{d}/data.json', f'{d}/data_nocta.json')
data = json.load(open(f'{d}/data_nocta.json')); prev = json.load(open(f'{d}/script.json'))[-1]['tts']
vs = {"stability": 0.5, "similarity_boost": 0.75}
body = json.dumps({"text": text, "model_id": model, "language_code": lang, "voice_settings": vs, "previous_text": prev}).encode()
r = json.load(urllib.request.urlopen(urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{voice}/with-timestamps?output_format=mp3_44100_192", data=body, headers={"Content-Type": "application/json"}), timeout=300))
open(f'{d}/cta.mp3', 'wb').write(base64.b64decode(r['audio_base64']))
al = r.get('normalized_alignment') or r['alignment']; st, en = al['character_start_times_seconds'], al['character_end_times_seconds']
dur0 = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f'{d}/voice_nocta.mp3']).decode())
lead = dur0 + gap  # CTA start inside voice.mp3
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'{d}/voice_nocta.mp3', '-i', f'{d}/cta.mp3', '-filter_complex', f'[0]apad=pad_dur={gap}[a];[a][1]concat=n=2:v=0:a=1[o]', '-map', '[o]', '-b:a', '192k', f'{d}/voice.mp3'], check=True)
t0 = lead + OFF
caps = data['captions']
for i, m in enumerate(re.finditer(r'\S+', text)):
    a, b = m.start(), m.end() - 1
    caps.append({'text': ' ' + m.group(0), 'startMs': round((t0 + st[a]) * 1000), 'endMs': round((t0 + en[b]) * 1000), 'timestampMs': None, 'confidence': 1})
caps[-1]['pageBreakAfter'] = True
seg = {'s': 8, 'sub': '', 't0': round(t0 + st[0], 3), 't1': round(t0 + en[-1], 3), 'cta': True}
data['segs'].append(seg); data['k']['cta'] = seg['t0']; data['dur'] = seg['t1'] + 3.2
json.dump(data, open(f'{d}/data.json', 'w'), ensure_ascii=False)
print('cta', seg, 'dur', round(data['dur'], 2))
