import json,re,subprocess,sys,shutil,os
d,GAP,TEMPO=sys.argv[1],float(sys.argv[2]),float(sys.argv[3]);OFF=.5
if not os.path.exists(f'{d}/voice_raw.mp3'):shutil.copy(f'{d}/voice.mp3',f'{d}/voice_raw.mp3')
if not os.path.exists(f'{d}/timing_raw.js'):shutil.copy(f'{d}/timing.js',f'{d}/timing_raw.js')
t=open(f'{d}/timing_raw.js').read();SEGS=json.loads(re.search(r'SEGS=(.*);',t).group(1));K=json.loads(re.search(r'K=(.*);',t).group(1))
SC=json.load(open(f'{d}/script.json'))
cuts=[0]+[((SEGS[i-1]['t1']+SEGS[i]['t0'])/2-OFF) for i in range(1,len(SEGS))]+[999]
parts=[];fl=[]
for i in range(len(SEGS)):
    pad=f',apad=pad_dur={GAP}' if (i<len(SEGS)-1 and GAP>0) else ''
    fl.append(f'[0]atrim={cuts[i]}:{cuts[i+1]},asetpts=PTS-STARTPTS{pad}[s{i}]');parts.append(f'[s{i}]')
fl.append(''.join(parts)+f'concat=n={len(SEGS)}:v=0:a=1,atempo={TEMPO}[o]')
subprocess.run(['ffmpeg','-v','error','-y','-i',f'{d}/voice_raw.mp3','-filter_complex',';'.join(fl),'-map','[o]','-b:a','192k',f'{d}/voice.mp3'],check=True)
nt=lambda x,i:round((x-OFF+i*GAP)/TEMPO+OFF,3)
for i,s in enumerate(SEGS):s['t0']=nt(s['t0'],i);s['t1']=nt(s['t1'],i)
for i,s in enumerate(SC):
    for k in s['keys']:K[k]=nt(K[k],i)
open(f'{d}/timing.js','w').write('const SEGS=%s;\nconst K=%s;\n'%(json.dumps(SEGS,ensure_ascii=False),json.dumps(K)))
print(d,'end',SEGS[-1]['t1'])
