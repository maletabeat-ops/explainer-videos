import json,re,subprocess,sys,shutil,os
d,GAP,TEMPO=sys.argv[1],float(sys.argv[2]),float(sys.argv[3]);OFF=.5
if not os.path.exists(f'{d}/voice_raw.mp3'):shutil.copy(f'{d}/voice.mp3',f'{d}/voice_raw.mp3')
if not os.path.exists(f'{d}/timing_raw.js'):shutil.copy(f'{d}/timing.js',f'{d}/timing_raw.js')
t=open(f'{d}/timing_raw.js').read();SEGS=json.loads(re.search(r'SEGS=(.*);',t).group(1));K=json.loads(re.search(r'K=(.*);',t).group(1))
SC=json.load(open(f'{d}/script.json'))
# cut points: snap to a real silence near each segment boundary (alignment end times of v4 can be early,
# a midpoint cut then clips the tail of the last word -> audible "cut-off" stop). Fallback: just before the next word.
sil=[];o=subprocess.run(['ffmpeg','-i',f'{d}/voice_raw.mp3','-af','silencedetect=n=-45dB:d=0.08','-f','null','-'],capture_output=True,text=True).stderr
for a,b in re.findall(r'silence_start: ([\d.]+)[\s\S]*?silence_end: ([\d.]+)',o):sil.append((float(a),float(b)))
def cut(i):
    lo,hi=SEGS[i-1]['t1']-OFF-0.15,SEGS[i]['t0']-OFF+0.05
    c=[(a,b) for a,b in sil if b>lo and a<hi]
    if c:a,b=max(c,key=lambda x:min(x[1],hi)-max(x[0],lo));return (max(a,lo)+min(b,hi))/2
    return SEGS[i]['t0']-OFF-0.03
cuts=[0]+[cut(i) for i in range(1,len(SEGS))]+[999]
parts=[];fl=[]
for i in range(len(SEGS)):
    pad=f',apad=pad_dur={GAP}' if (i<len(SEGS)-1 and GAP>0) else ''
    fl.append(f'[0]atrim={cuts[i]}:{cuts[i+1]},asetpts=PTS-STARTPTS{pad}[s{i}]');parts.append(f'[s{i}]')
fl.append(''.join(parts)+f'concat=n={len(SEGS)}:v=0:a=1,atempo={TEMPO}[o]')
subprocess.run(['ffmpeg','-v','error','-y','-i',f'{d}/voice_raw.mp3','-filter_complex',';'.join(fl),'-map','[o]','-b:a','192k',f'{d}/voice.mp3'],check=True)
nt=lambda x,i:round((x-OFF+i*GAP)/TEMPO+OFF,3)
for i,s in enumerate(SEGS):s['t0']=nt(s['t0'],i);s['t1']=nt(s['t1'],i)
last={}
for i,s in enumerate(SC):
    for k in s['keys']:last[k]=i  # tts4 keeps the LAST segment's time for duplicate keys
for k,i in last.items():K[k]=nt(K[k],i)
dup=[k for k in last if sum(k in s['keys'] for s in SC)>1]
if dup:print('WARNING duplicate keys (later segment wins):',dup)
open(f'{d}/timing.js','w').write('const SEGS=%s;\nconst K=%s;\n'%(json.dumps(SEGS,ensure_ascii=False),json.dumps(K)))
print(d,'end',SEGS[-1]['t1'])
