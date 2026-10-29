const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const [,,html,lang,out,mode,...rest]=process.argv;
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files']});
 const mk=async()=>{const p=await b.newPage({viewport:{width:540,height:960}});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
  await p.goto('file://'+path.resolve(html)+'?lang='+lang,{timeout:180000});await p.waitForFunction(()=>window.ready,null,{timeout:180000});await p.evaluate(()=>window.ready);if(errs.length)console.log('ERR',errs);return p};
 const grab=async(p,t)=>{const d=await p.evaluate(t=>{renderFrame(t);return document.getElementById('c').toDataURL('image/jpeg',.93)},t);return Buffer.from(d.split(',')[1],'base64')};
 fs.mkdirSync(out,{recursive:true});
 if(mode==='stills'){const p=await mk();for(const t of rest)fs.writeFileSync(`${out}/${String((+t).toFixed(1)).padStart(5,'0')}.jpg`,await grab(p,+t))}
 else{const p0=await mk();const DUR=await p0.evaluate(()=>window.DUR);const N=Math.round(DUR*30),W=4;console.log('DUR',DUR);
  await Promise.all([...Array(W)].map(async(_,w)=>{const p=w?await mk():p0;for(let f=w;f<N;f+=W)fs.writeFileSync(`${out}/f${String(f).padStart(5,'0')}.jpg`,await grab(p,f/30))}))}
 await b.close()})();
