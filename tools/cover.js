const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const covers={ru:{t:9.2,y:380,kicker:'ВЫ ЗНАЛИ?',l1:'МИКРОВОЛНОВКА',s1:104,l2:'НЕ ГРЕЕТ',l3:'ИЗНУТРИ?!',s2:120,bottom:'МИФ, В КОТОРЫЙ ВЕРЯТ ВСЕ'},
 en:{t:7.3,y:380,kicker:'DID YOU KNOW?',l1:'YOUR MICROWAVE',s1:100,l2:'DOESN’T COOK',l3:'FROM INSIDE?!',s2:112,bottom:'THE MYTH EVERYONE BELIEVES'}};
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files']});
 for(const lang of['ru','en']){const p=await b.newPage({viewport:{width:540,height:960}});p.on('pageerror',e=>console.log(e.message));
  await p.goto('file://'+path.resolve('mw/index.html')+'?lang='+lang);await p.waitForFunction(()=>window.ready);await p.evaluate(()=>window.ready);
  const d=await p.evaluate(o=>{drawCover(o.t,o);return document.getElementById('c').toDataURL('image/png')},covers[lang]);
  fs.writeFileSync(`/home/user/cover_microwave_${lang.toUpperCase()}.png`,Buffer.from(d.split(',')[1],'base64'))}
 await b.close()})();
