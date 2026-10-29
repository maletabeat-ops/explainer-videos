import json,sys,base64,urllib.request,os
d=sys.argv[1]; model=sys.argv[2]; voice=sys.argv[3]; OFF=0.5
segs=json.load(open(f'{d}/script.json'))
text=' '.join(s['tts'] for s in segs)
body=json.dumps({"text":text,"model_id":model,"voice_settings":{"stability":0.5,"similarity_boost":0.75,"style":0.3,"speed":1.05}}).encode()
req=urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{voice}/with-timestamps?output_format=mp3_44100_192",data=body,headers={"Content-Type":"application/json"})
r=json.load(urllib.request.urlopen(req,timeout=300))
open(f'{d}/voice.mp3','wb').write(base64.b64decode(r['audio_base64']))
al=r.get('normalized_alignment') or r['alignment'];json.dump(al,open(f'{d}/align.json','w'))
st=al['character_start_times_seconds'];en=al['character_end_times_seconds']
pos=0;SEGS=[];K={}
for s in segs:
    a=pos;b=pos+len(s['tts'])-1
    SEGS.append(dict(s=s['s'],sub=s['sub'],t0=round(st[a]+OFF,3),t1=round(en[b]+OFF,3)))
    for k,w in s['keys'].items():
        i=s['tts'].find(w);assert i>=0,(k,w);K[k]=round(st[a+i+min(2,len(w)-1)]+OFF,3)
    pos=b+2
open(f'{d}/timing.js','w').write('const SEGS=%s;\nconst K=%s;\n'%(json.dumps(SEGS,ensure_ascii=False),json.dumps(K)))
print(d,'chars',len(text),'end',SEGS[-1]['t1'])
