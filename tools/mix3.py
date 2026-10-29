import re,json,subprocess,sys
d,lang,out=sys.argv[1:4]
t=open(f'{d}/{lang}/timing.js').read();SEGS=json.loads(re.search(r'SEGS=(.*);',t).group(1));K=json.loads(re.search(r'K=(.*);',t).group(1))
DUR=SEGS[-1]['t1']+4.1;FINAL=SEGS[-1]['t0']-.3
ch=[next(x for x in SEGS if x['s']==s)['t0']-.35 for s in range(2,9)]+[FINAL]
ev=[('sfx_whoosh.mp3',x,.28) for x in ch]+[('sfx_pop.mp3',K[k]-.1,.35) for k in('mag','waves','mol','heat')]+[('sfx_pop.mp3',K['guide']+.4,.35)]
ev+=[('sfx_zap.mp3',K['sparks']-1.2+i*.9,.4) for i in range(3)]+[('sfx_ding.mp3',FINAL+.6,.5),('sfx_hum.mp3',0.2,.12)]
ins=['-framerate','30','-i',f'{d}/fr_{lang}/f%05d.jpg','-i',f'{d}/{lang}/voice.mp3','-i',f'{d}/music.mp3']
fl=['[1]adelay=500|500,volume=1.15[v]',f'[2]atrim=0:{DUR},volume=0.14,afade=t=in:d=1,afade=t=out:st={DUR-2.5}:d=2.5[m]'];mix=['[v]','[m]'];n=3
for i,(f,tt,vol) in enumerate(ev):
    ins+=['-i',f'{d}/{f}'];ms=int(max(0,tt)*1000);fl.append(f'[{n}]adelay={ms}|{ms},volume={vol}[e{i}]');mix.append(f'[e{i}]');n+=1
fl.append(''.join(mix)+f'amix=inputs={len(mix)}:normalize=0:duration=longest,atrim=0:{DUR},alimiter=limit=0.95[a]')
subprocess.run(['ffmpeg','-v','error','-y',*ins,'-filter_complex',';'.join(fl),'-map','0:v','-map','[a]','-c:v','libx264','-preset','slow','-crf','18','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-movflags','+faststart','-t',str(DUR),out],check=True)
