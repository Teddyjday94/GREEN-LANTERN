import { lanternRecords, timelineEvents, villainEventLinks, getLantern, getPrimaryArtwork } from './expansion-data.mjs';
import { timelineHref } from './timeline.mjs';
import { mountPowerRing } from './ring-scene.mjs';
import { card, wireImageFallbacks, renderArchive, renderDossier, renderTimeline } from './expansion-render.mjs';
const app=document.querySelector('#app');
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const escapeHTML=(value='')=>String(value).replace(/[&<>'"]/g,(c)=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const titleCase=(value='')=>String(value).split('-').map((x)=>x.charAt(0).toUpperCase()+x.slice(1)).join(' ');
let rendering=false,ringController=null,ringAbort=null,scheduled=0;
async function enhanceHome(){
const home=app.querySelector('.home-page'); if(!home) return;
const hero=home.querySelector('#hero-visual');
if(hero && !hero.dataset.xRing){
hero.dataset.xRing='1'; hero.classList.add('x-ring-stage');
const label=document.createElement('div'); label.className='x-ring-spec'; label.innerHTML='<span>OAN POWER RING // CLASSIC SIGNET STUDY</span><small>locally rendered WebGL · CSS fallback retained</small>'; hero.append(label);
ringAbort?.abort(); ringController?.destroy?.(); ringAbort=new AbortController();
ringController=await mountPowerRing({container:hero,reducedMotion,signal:ringAbort.signal});
if(ringController && !reducedMotion) setTimeout(()=>ringController?.pulse(),1500);
}
home.querySelectorAll('.lantern-card').forEach((el)=>{if(/Kyle Rayner/i.test(el.textContent||'') && !el.querySelector('img')){const art=getPrimaryArtwork(getLantern('kyle-rayner'));const target=el.querySelector('.card-fallback')||el; const img=document.createElement('img');img.dataset.xArt='1';img.src=art.url;img.alt=art.alt;img.loading='lazy';img.referrerPolicy='no-referrer';target.append(img);wireImageFallbacks(el);}});
if(!home.querySelector('.x-home-cosmic')){
const anchor=home.querySelector('.oa-section')||home.querySelector('.section');
const section=document.createElement('section');section.className='section x-home-cosmic';section.innerHTML=`<div class="container"><div class="section-head"><div><p class="eyebrow">Cosmic archive // off-world Lanterns</p><h2>Sector 2814 is only <span class="display-outline">one piece of the Corps.</span></h2></div><p>Meet the scientists, trainers, physicians, living worlds and administrators who make the Green Lantern Corps an institution instead of a single superhero identity.</p></div><div class="x-cosmic-rail">${['kilowog','tomar-re','mogo','soranik-natu'].map((s)=>card(getLantern(s))).join('')}</div><div class="button-row"><a class="button route-link" href="/lanterns">Open full Corps registry</a></div></div>`;
anchor?.after(section); wireImageFallbacks(section);
}
}
function enhanceCorps(){
const page=app.querySelector('.page'); if(!page||page.querySelector('.x-corps-roster'))return;
const sec=document.createElement('section');sec.className='section x-corps-roster';sec.innerHTML=`<div class="container"><div class="section-head"><div><p class="eyebrow">Cosmic personnel layer</p><h2>Oa is a network <span class="display-outline">of people, worlds and sectors.</span></h2></div><p>The expanded archive tracks alien Lanterns with species, homeworld, sector and duty context rather than treating the Corps as anonymous background.</p></div><div class="x-cosmic-rail">${['kilowog','salaak','arisia-rrab','soranik-natu','mogo'].map((s)=>card(getLantern(s))).join('')}</div></div>`; page.append(sec);wireImageFallbacks(sec);
}
function enhanceVillains(){
const page=app.querySelector('.page'); if(!page||page.querySelector('.x-villain-crosslinks'))return;
const sec=document.createElement('section');sec.className='section x-villain-crosslinks';sec.innerHTML=`<div class="container hard-panel x-conflict-index"><p class="eyebrow">Conflict cross-index</p><h2>Enemies leave <span class="display-outline">marks on the timeline.</span></h2><div class="x-conflict-grid">${Object.entries(villainEventLinks).map(([slug,ids])=>`<article><h3>${escapeHTML(titleCase(slug))}</h3>${ids.map((id)=>{const e=timelineEvents.find(x=>x.id===id);return e?`<a class="route-link" href="${timelineHref(id)}"><span>${e.year}</span>${escapeHTML(e.title)}</a>`:'';}).join('')}</article>`).join('')}</div></div>`; page.prepend(sec);
}
function cleanupRing(){ if(location.pathname!=='/' && ringController){ ringAbort?.abort(); ringController.destroy?.(); ringController=null; ringAbort=null; } }
async function enhanceRoute(){
if(rendering||!app)return; rendering=true;
try{
cleanupRing();
const path=location.pathname.replace(/\/$/,'')||'/';
const current=app.querySelector('.x-expanded-view')?.dataset.xView;
if(path==='/lanterns' && current!=='archive') renderArchive();
else if(path.startsWith('/lanterns/') && current!=='dossier') renderDossier(decodeURIComponent(path.split('/').pop()));
else if(path==='/timeline' && current!=='timeline') renderTimeline();
else if(path==='/') await enhanceHome();
else if(path==='/corps') enhanceCorps();
else if(path==='/villains') enhanceVillains();
wireImageFallbacks(app);
} finally { rendering=false; }
}
function schedule(){ cancelAnimationFrame(scheduled); scheduled=requestAnimationFrame(()=>enhanceRoute()); }
const observer=new MutationObserver(()=>{ if(!rendering)schedule(); }); observer.observe(app,{childList:true,subtree:false});
window.addEventListener('popstate',schedule); document.addEventListener('click',(e)=>{const link=e.target.closest('a.route-link[href^="/"]');if(link)setTimeout(schedule,0);});
schedule();
