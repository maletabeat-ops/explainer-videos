import json,re,sys
d,GAP,TEMPO,SEP=sys.argv[1],float(sys.argv[2]),float(sys.argv[3]),sys.argv[4].replace('NL','\n');OFF=.5
al=json.load(open(f'{d}/align.json'));S=json.load(open(f'{d}/script.json'))
st=al['character_start_times_seconds'];en=al['character_end_times_seconds']
t=open(f'{d}/timing.js').read();SEGS=json.loads(re.search(r'SEGS=(.*);',t).group(1));K=json.loads(re.search(r'K=(.*);',t).group(1))
caps=[];pos=0
nt=lambda x,i:(x+i*GAP)/TEMPO+OFF
for i,s in enumerate(S):
    txt=s['tts']
    for m in re.finditer(r'\S+',txt):
        a=pos+m.start();b=pos+m.end()-1
        w=m.group(0)
        caps.append({'text':(' ' if caps else '')+w,'startMs':round(nt(st[a],i)*1000),'endMs':round(nt(en[b],i)*1000),'timestampMs':None,'confidence':1})
    pos+=len(txt)+len(SEP)
    caps[-1]['pageBreakAfter']=True
dur=SEGS[-1]['t1']+4.1
json.dump({'segs':SEGS,'k':K,'captions':caps,'dur':dur},open(f'{d}/data.json','w'),ensure_ascii=False)
print(d,len(caps),'dur',round(dur,2),caps[:3])
