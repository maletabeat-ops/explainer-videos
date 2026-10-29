const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const [,,dir,mode,...rest]=process.argv;
(async()=>{const b=await chromium.launch();
 const mk=async()=>{const p=await b.newPage({viewport:{width:540,height:960}});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
  await p.goto('file://'+path.resolve(dir,'index.html'));await p.evaluate(()=>window.ready);if(errs.length)console.log('ERR',errs);return p};
 const grab=async(p,t)=>{const d=await p.evaluate(t=>{renderFrame(t);return document.getElementById('c').toDataURL('image/jpeg',.93)},t);return Buffer.from(d.split(',')[1],'base64')};
 if(mode==='stills'){const p=await mk();fs.mkdirSync(dir+'/stills',{recursive:true});for(const t of rest){fs.writeFileSync(`${dir}/stills/${String(t).padStart(5,'0')}.jpg`,await grab(p,+t))}}
 else{const fps=30,N=Math.round(+rest[0]*fps),W=+rest[1]||4;fs.mkdirSync(dir+'/frames',{recursive:true});
  await Promise.all([...Array(W)].map(async(_,w)=>{const p=await mk();for(let f=w;f<N;f+=W){fs.writeFileSync(`${dir}/frames/f${String(f).padStart(5,'0')}.jpg`,await grab(p,f/fps));if(w==0&&f%300==0)console.log(f)}}))}
 await b.close()})();
