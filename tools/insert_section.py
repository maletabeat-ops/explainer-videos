"""Insert a new section into an existing tts_long voiceover without re-voicing the rest (use when long-form is under 8:00).
usage: insert_section.py <long dir> <index (0-based, insert before)> "<text>" '{keys json}' <voice> <lang> <gap_s>
Updates script.json, data_nocta.json, voice_nocta.mp3; then re-run append_cta.py."""
# insert a new section into an existing tts_long voiceover without regenerating the others
import json, sys, base64, urllib.request, subprocess, re, os
d, idx, text, keysjson, voice, lang, gap = sys.argv[1], int(sys.argv[2]), sys.argv[3], sys.argv[4], sys.argv[5], sys.argv[6], float(sys.argv[7])
OFF = 0.5
S = json.load(open(f'{d}/script.json')); keys = json.loads(keysjson)
data = json.load(open(f'{d}/data_nocta.json'))
prev, nxt = S[idx - 1]['tts'], S[idx]['tts']
body = {"text": text, "model_id": "eleven_v4", "language_code": lang, "voice_settings": {"stability": 0.5, "similarity_boost": 0.75}, "previous_text": prev[-400:], "next_text": nxt[:400]}
r = json.load(urllib.request.urlopen(urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{voice}/with-timestamps?output_format=mp3_44100_192", data=json.dumps(body).encode(), headers={"Content-Type": "application/json"}), timeout=600))
open(f'{d}/parts/new.mp3', 'wb').write(base64.b64decode(r['audio_base64']))
al = r.get('normalized_alignment') or r['alignment']; st, en = al['character_start_times_seconds'], al['character_end_times_seconds']
ndur = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f'{d}/parts/new.mp3']).decode())
segs = data['segs']; insert_t = segs[idx]['t0'] - st[0]  # start of the old section idx (audio-relative incl. OFF)
shift = ndur + gap
def sh(x): return x + shift if x >= insert_t - 0.05 else x
for s in segs: s['t0'] = round(sh(s['t0']), 3); s['t1'] = round(sh(s['t1']), 3)
for s in segs[idx:]: s['s'] += 1
data['k'] = {k: round(sh(v), 3) for k, v in data['k'].items()}
for c in data['captions']:
    if c['startMs'] / 1000 >= insert_t - 0.05: c['startMs'] += round(shift * 1000); c['endMs'] += round(shift * 1000)
base = insert_t
newseg = {'s': idx + 1, 'sub': '', 't0': round(base + st[0], 3), 't1': round(base + en[-1], 3)}
segs.insert(idx, newseg)
for k, w in keys.items():
    j = text.find(w); data['k'][k] = round(base + st[j + min(2, len(w) - 1)], 3)
newcaps = []
for m in re.finditer(r'\S+', text):
    newcaps.append({'text': ' ' + m.group(0), 'startMs': round((base + st[m.start()]) * 1000), 'endMs': round((base + en[m.end() - 1]) * 1000), 'timestampMs': None, 'confidence': 1})
newcaps[-1]['pageBreakAfter'] = True
caps = data['captions']; pos = next(i for i, c in enumerate(caps) if c['startMs'] / 1000 >= base + shift - 0.05)
data['captions'] = caps[:pos] + newcaps + caps[pos:]
data['dur'] = segs[-1]['t1'] + 3
# rebuild audio: split old voice_nocta at insert point
v = f'{d}/voice_nocta.mp3'; cut = insert_t - OFF
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', v, '-i', f'{d}/parts/new.mp3', '-filter_complex', f'[0]atrim=0:{cut},asetpts=PTS-STARTPTS[a];[0]atrim={cut},asetpts=PTS-STARTPTS[b];[1]apad=pad_dur={gap}[n];[a][n][b]concat=n=3:v=0:a=1[o]', '-map', '[o]', '-ar', '44100', '-ac', '1', '-b:a', '192k', f'{d}/voice_nocta_new.mp3'], check=True)
os.replace(f'{d}/voice_nocta_new.mp3', v)
S.insert(idx, {"s": idx + 1, "tts": text, "sub": "", "keys": keys})
for i, s in enumerate(S): s['s'] = i + 1
json.dump(S, open(f'{d}/script.json', 'w'), ensure_ascii=False, indent=1)
json.dump(data, open(f'{d}/data_nocta.json', 'w'), ensure_ascii=False)
print('inserted', round(ndur, 1), 's; new dur', round(data['dur'], 1))
