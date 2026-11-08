/* Actual-game captures. Fresh browser context; no calls to player-save APIs. */
'use strict';
const fs=require('node:fs'),path=require('node:path');
const PW=process.env.PLAYWRIGHT_MODULE||'playwright';
const {chromium}=require(PW);
const out=path.resolve(process.env.SHOT_DIR||'artifacts/oakhaven-gate');
const url=process.env.PREVIEW_URL||'http://127.0.0.1:8000';
(async()=>{
 fs.mkdirSync(out,{recursive:true});let browser,page;
 const report={commit:process.env.GITHUB_SHA||null,status:'incomplete',screenshots:[],errors:[],visualReview:'pending',performance:'not validated'};
 try{
  browser=await chromium.launch({headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  report.browserVersion=browser.version();
  const ctx=await browser.newContext({viewport:{width:1280,height:800},serviceWorkers:'block'});
  page=await ctx.newPage();page.on('pageerror',e=>report.errors.push(e.message));
  await page.addInitScript(()=>{window.__r3d21={automation:true};});
  await page.goto(url,{waitUntil:'load'});
  await page.waitForFunction(()=>typeof Engine!=='undefined'&&Engine.sprites.proctor&&typeof G!=='undefined'&&G.state==='title',null,{timeout:90000});
  const click=sel=>page.locator(sel).first().dispatchEvent('click');
  await click('#btn-new');await page.locator('#cname').fill('Gate Capture');await click('#c-next');
  await click('.classlist button');await click('#c-next');await click('#c-next');
  for(let i=0;i<20&&!await page.locator('#c-go').count();i++){
   const c=page.locator('#create-panel .list button').first();
   if(await c.count())await c.dispatchEvent('click');else await page.locator('#create-panel button').filter({hasText:/Continue|Begin|Confirm|Accept/}).first().dispatchEvent('click');
  }
  await click('#c-go');await click('#btn-intro-skip');
  await page.waitForFunction(()=>G.state==='play',null,{timeout:60000});
  await page.addScriptTag({path:path.resolve('js/oakhaven-gate-frame.js')});
  await page.evaluate(()=>{
   GFX.illustratedScreens=false;closeModal();hide('#event');
   loadMap('oakhaven',{x:23.5,y:3.5,dir:-Math.PI/2});G.state='play';G.fadeT=0;
   G.keys={};G.vel.x=G.vel.y=0;Engine.cam.pitch=0;
   if(typeof SCREENS!=='undefined'&&SCREENS.dismiss)SCREENS.dismiss();
   R3D.setMode('on');
  });
  await page.waitForFunction(()=>R3D.active(),null,{timeout:30000});
  report.runtime=await page.evaluate(()=>({renderer:R3D.st.renderer,software:R3D.st.software,placement:OAK_GATE_FRAME.inspect(G.map,G.flags)}));
  if(!report.runtime.placement)throw Error('Runtime gate passage differs from pilot assumptions; inspect overlays.');
  await page.evaluate(()=>{window.__capturePreviousUpdate=update;update=function(){};});
  const views=[['center',23.5,3.5,-Math.PI/2],['left',22.35,3,-.95],['right',24.65,3,-2.19],['threshold',23.5,2.25,-Math.PI/2]];
  for(const [lighting,tod]of [['day',.5],['dusk',.76]])for(const [name,x,y,dir]of views){
   await page.evaluate(({x,y,dir,tod})=>{Engine.cam.x=x;Engine.cam.y=y;Engine.cam.dir=dir;Engine.cam.pitch=0;G.tod=tod;},{x,y,dir,tod});
   for(const enabled of [false,true]){
    await page.evaluate(v=>{OAK_GATE_FRAME.setEnabled(v);render();render();},enabled);
    const data=await page.evaluate(()=>{const canvas=PHOTO21.grab();return canvas.toDataURL('image/png').split(',')[1];});
    const nameOut=`${lighting}-${name}-${enabled?'frame':'baseline'}.png`;
    fs.writeFileSync(path.join(out,nameOut),Buffer.from(data,'base64'));report.screenshots.push(nameOut);
   }
  }
  report.checks=await page.evaluate(()=>{
   const m=G.map,d=m.doors[23],keep=[d.open,d.target],threshold=[];
   try{for(const v of [0,.69,.7,.71,1]){d.open=d.target=v;threshold.push({open:v,blocked:m.isSolidCell(23,0),expected:!(v>.7)});}}finally{[d.open,d.target]=keep;}
   const had=Object.prototype.hasOwnProperty.call(G.flags,'greening'),old=G.flags.greening;let excluded;
   try{G.flags.greening=true;excluded=OAK_GATE_FRAME.inspect(m,G.flags)===null;}finally{if(had)G.flags.greening=old;else delete G.flags.greening;}
   return {threshold,excludedDuringGreening:excluded,stats:{...OAK_GATE_FRAME.stats},patch:OAK_GATE_FRAME.status()};
  });
  if(report.errors.length||report.checks.stats.errors||!report.checks.stats.draws||!report.checks.excludedDuringGreening||report.checks.threshold.some(x=>x.blocked!==x.expected))throw Error('Automated checkpoint failed; inspect report.');
  report.status='captures-ready-for-human-review';
  report.limitations=['World-view captures omit HUD via PHOTO21.grab','Scripted camera relocation is not a passage walk','Software rendering is not hardware performance evidence','Existing lattice unchanged','Lighting needs human review','No portal/save regression or actual context-loss test'];
 }catch(e){report.status='failed';report.failure=e.stack||String(e);process.exitCode=1;if(page)await page.screenshot({path:path.join(out,'failure-page.png')}).catch(()=>{});}
 finally{fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));if(browser)await browser.close();console.log(report.status);}
})();
