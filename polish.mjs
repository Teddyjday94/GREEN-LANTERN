import { batteryMarkup, spectrumRailMarkup } from './polish-ui.mjs';
import { corpsSymbols } from './corps-symbols.mjs';

const app=document.querySelector('#app');
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
let scheduled=0;

document.body.classList.add('x-ui-organized');

function enhanceBatteryScene(scene, {compact=false}={}) {
  if(!scene || scene.dataset.xBattery==='1') return;
  const controls=[...scene.querySelectorAll('.oa-node')];
  scene.querySelectorAll('.oa-planet,.oa-core').forEach((node)=>node.remove());
  scene.insertAdjacentHTML('afterbegin', batteryMarkup({compact}));
  controls.forEach((control)=>scene.append(control));
  scene.dataset.xBattery='1';
  scene.classList.add('x-battery-scene');
}

function wireSpectrumRail(root=document) {
  root.querySelectorAll('.x-corps-spectrum-rail').forEach((rail)=>{
    if(rail.dataset.wired==='1') return;
    rail.dataset.wired='1';
    rail.addEventListener('click',(event)=>{
      const button=event.target.closest('.x-corps-chip');
      if(!button) return;
      rail.querySelectorAll('.x-corps-chip').forEach((chip)=>chip.classList.toggle('is-active',chip===button));
      const symbol=corpsSymbols.find((item)=>item.id===button.dataset.corps);
      if(symbol) document.documentElement.style.setProperty('--x-active-corps',symbol.color);
      const label=button.querySelector('b')?.textContent?.trim().toLowerCase();
      if(location.pathname==='/spectrum' && label){
        const target=[...app.querySelectorAll('.spectrum-detail')].find((section)=>(section.textContent||'').toLowerCase().includes(label));
        target?.scrollIntoView({behavior:reducedMotion?'auto':'smooth',block:'center'});
      }
    });
  });
}

function addSpectrumRail(page) {
  if(!page || page.querySelector('.x-spectrum-symbols')) return;
  const section=document.createElement('section');
  section.className='section x-spectrum-symbols';
  section.innerHTML=`<div class="container"><div class="x-polish-section-heading"><div><p class="eyebrow">Corps identifiers // emotional spectrum</p><h2>The light has <span class="display-outline">a symbol for every force.</span></h2></div><p>Use the Corps marks as an at-a-glance map of will, fear, rage, hope, avarice, compassion, love, death and life.</p></div>${spectrumRailMarkup()}</div>`;
  const hero=page.querySelector('.page-hero,.x-page-hero');
  if(hero) hero.after(section); else page.prepend(section);
  wireSpectrumRail(section);
}

function addGreenMark(root) {
  const hero=root?.querySelector('.hero-copy,.page-hero-grid,.x-page-hero-grid');
  if(!hero || hero.querySelector('.x-green-o-mark')) return;
  const mark=document.createElement('div');
  mark.className='x-green-o-mark';
  mark.setAttribute('aria-hidden','true');
  mark.innerHTML='<i></i><span></span><i></i>';
  hero.append(mark);
}

function organizeSections(root) {
  root?.querySelectorAll('.section').forEach((section,index)=>{
    section.classList.add('x-organized-section');
    if(index%2) section.classList.add('x-organized-section-alt');
  });
  root?.querySelectorAll('.hard-panel').forEach((panel)=>panel.classList.add('x-polished-panel'));
}

function enhanceRoute() {
  if(!app) return;
  const path=location.pathname.replace(/\/$/,'')||'/';
  app.querySelectorAll('.oa-scene').forEach((scene)=>enhanceBatteryScene(scene,{compact:path==='/'}));
  if(path==='/spectrum' || path==='/corps') addSpectrumRail(app.querySelector('.page')||app);
  if(path==='/' || path==='/corps') addGreenMark(app);
  organizeSections(app);
  wireSpectrumRail(app);
}

function schedule(){ cancelAnimationFrame(scheduled); scheduled=requestAnimationFrame(enhanceRoute); }
const observer=new MutationObserver(schedule);
if(app) observer.observe(app,{childList:true,subtree:false});
window.addEventListener('popstate',schedule);
document.addEventListener('click',(event)=>{ if(event.target.closest('a.route-link[href^="/"]')) setTimeout(schedule,0); });
schedule();

export { enhanceBatteryScene };
