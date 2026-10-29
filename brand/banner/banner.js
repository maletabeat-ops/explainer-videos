const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files']});const p=await b.newPage({viewport:{width:1280,height:720}});p.on('pageerror',e=>console.log(e.message));
await p.goto('file://'+__dirname+'/banner.html',{timeout:120000});await p.waitForFunction(()=>window.ok,null,{timeout:120000});await p.evaluate(()=>document.fonts.load('900 50px "Inter Display"'));
await p.evaluate(b=>setFont(b),fs.readFileSync(__dirname+'/InterDisplay-Black.otf').toString('base64'));await p.evaluate(()=>make());
const d=await p.evaluate(()=>document.getElementById('c').toDataURL('image/png'));fs.writeFileSync('/home/user/youtube_banner_EN.png',Buffer.from(d.split(',')[1],'base64'));await b.close()})();
