const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const L=(a,b)=>({ru:a,en:b});
const JOBS=[
 // 2D pages: render frame t, then overlay
 {name:'coffee',html:'coffee/index.html',q:{ru:'',en:''},dirs:{ru:'coffee',en:'coffee_en'},t:{ru:51.5,en:57},bg:'#120906',kick:'#ffd166',acc:'#ffb454',bot:'#2ee6a6',
  txt:L({k:'ВЫ ЗНАЛИ?',l1:'КОФЕ ЗА 300 ₽,',l2:'А ЗЁРНА — НА 30 ₽?!',b:'КУДА УХОДЯТ ДЕНЬГИ'},{k:'DID YOU KNOW?',l1:'YOUR $5 COFFEE,',l2:'BEANS COST 50¢?!',b:'WHERE YOUR MONEY GOES'})},
 {name:'dishwasher',html:'dish/index.html',q:{ru:'?lang=ru',en:'?lang=en'},t:{ru:21,en:20},bg:'#061427',kick:'#ffd166',acc:'#3ee0ff',bot:'#7cf0a8',
  txt:L({k:'ВЫ ЗНАЛИ?',l1:'ПОСУДОМОЙКЕ НУЖНО',l2:'ВСЕГО 12 Л ВОДЫ?!',b:'А РУКАМИ — ДО 100 Л'},{k:'DID YOU KNOW?',l1:'A DISHWASHER USES',l2:'JUST 3 GALLONS?!',b:'BY HAND: UP TO 27'})},
];
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files']});
 for(const j of JOBS)for(const lang of['ru','en']){const p=await b.newPage({viewport:{width:540,height:960}});p.on('pageerror',e=>console.log(j.name,e.message));
  let url;if(j.dirs)url='file://'+path.resolve(j.dirs[lang],'index.html');else url='file://'+path.resolve(j.html)+j.q[lang];
  await p.goto(url,{timeout:120000});await p.waitForFunction(()=>window.renderFrame,null,{timeout:120000});await p.evaluate(()=>window.ready);
  const d=await p.evaluate(([t,o])=>{renderFrame(t);const c=document.getElementById('c'),x=c.getContext('2d');x.save();x.globalAlpha=1;x.shadowBlur=0;
   const sn=document.createElement('canvas');sn.width=1080;sn.height=640;const sx=sn.getContext('2d');sx.drawImage(c,0,1040,1080,640,0,0,1080,640);
   sx.globalCompositeOperation='destination-in';const mv=sx.createLinearGradient(0,0,0,640);mv.addColorStop(0,'rgba(0,0,0,0)');mv.addColorStop(.12,'#000');mv.addColorStop(.88,'#000');mv.addColorStop(1,'rgba(0,0,0,0)');sx.fillStyle=mv;sx.fillRect(0,0,1080,640);
   x.globalAlpha=1;drawBg(t);x.fillStyle=o.bg+'99';x.fillRect(0,0,1080,1920);for(const[cx,cy,r,col]of[[300,500,600,o.acc],[800,1300,600,o.bot]]){const q=x.createRadialGradient(cx,cy,0,cx,cy,r);q.addColorStop(0,col+'30');q.addColorStop(1,col+'00');x.fillStyle=q;x.fillRect(0,0,1080,1920)}
   x.drawImage(sn,0,0,1080,640,-54,900,1188,704);
   const T=(s,y,sz,col,gl)=>{x.font=`900 ${sz}px "Inter Display"`;x.textAlign='center';x.textBaseline='middle';let w=x.measureText(s).width;if(w>1000){sz=sz*1000/w;x.font=`900 ${sz}px "Inter Display"`}x.shadowColor=gl||'rgba(0,0,0,.7)';x.shadowBlur=34;x.fillStyle=col;x.fillText(s,540,y);x.shadowBlur=0};
   const pill=(s,y,sz,bg,fg)=>{x.font=`900 ${sz}px "Inter Display"`;const w=x.measureText(s).width+56,h=sz+30;x.shadowColor=bg;x.shadowBlur=30;x.beginPath();x.roundRect(540-w/2,y-h/2,w,h,h/2);x.fillStyle=bg;x.fill();x.shadowBlur=0;x.fillStyle=fg;x.textAlign='center';x.textBaseline='middle';x.fillText(s,540,y+2)};
   pill(o.k,430,46,o.kick,'#111');T(o.l1,580,96,'#ffffff');T(o.l2,710,104,o.acc,o.acc);
   x.font='900 44px "Inter Display"';const w=x.measureText(o.b).width+60;x.beginPath();x.roundRect(540-w/2,1720,w,84,28);x.fillStyle='rgba(0,0,0,.6)';x.fill();x.lineWidth=5;x.strokeStyle=o.bot;x.shadowColor=o.bot;x.shadowBlur=30;x.stroke();x.fillStyle=o.bot;x.textAlign='center';x.fillText(o.b,540,1764);x.restore();
   return c.toDataURL('image/png')},[j.t[lang],{...j.txt[lang],bg:j.bg,kick:j.kick,acc:j.acc,bot:j.bot}]);
  fs.writeFileSync(`/home/user/cover_${j.name}_${lang.toUpperCase()}.png`,Buffer.from(d.split(',')[1],'base64'));await p.close()}
 if(process.env.SKIP3D){await b.close();return}
 // UAE 3D cover
 const U={ru:{t:2,y:330,kicker:'ВЫ ЗНАЛИ?',l1:'В ОАЭ ЕСТЬ',s1:110,l2:'НАЛОГИ?!',s2:130,bottom:'ПРОСТО НЕ В ЗАРПЛАТЕ'},en:{t:2,y:330,kicker:'DID YOU KNOW?',l1:'THE UAE DOES',s1:104,l2:'HAVE TAXES?!',s2:118,bottom:'JUST NOT ON YOUR PAYCHECK'}};
 for(const lang of['ru','en']){const p=await b.newPage({viewport:{width:540,height:960}});await p.goto('file://'+path.resolve('uae/index.html')+'?lang='+lang,{timeout:180000});await p.waitForFunction(()=>window.ready,null,{timeout:180000});await p.evaluate(()=>window.ready);
  const d=await p.evaluate(o=>{drawCover(o.t,o);return document.getElementById('c').toDataURL('image/png')},U[lang]);fs.writeFileSync(`/home/user/cover_uae_${lang.toUpperCase()}.png`,Buffer.from(d.split(',')[1],'base64'));await p.close()}
 await b.close()})();
