import { lanternRecords, timelineEvents, eraDefinitions, expansionSources, villainEventLinks, getLantern, getPrimaryArtwork } from './expansion-data.mjs';
import { searchExpandedLanterns } from './expansion-search.mjs';
import { getTimelineAnchors, resolveTimelineSelection, timelineHref } from './timeline.mjs';
const app = document.querySelector('#app');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
let rendering = false;
const escapeHTML=(value='')=>String(value).replace(/[&<>'"]/g,(c)=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const titleCase=(value='')=>String(value).split('-').map((x)=>x.charAt(0).toUpperCase()+x.slice(1)).join(' ');
const unique=(values)=>[...new Set(values.filter(Boolean))].sort((a,b)=>String(a).localeCompare(String(b)));
const tagList=(items=[])=>`<div class="x-tags">${items.map((x)=>`<span>${escapeHTML(x)}</span>`).join('')}</div>`;
const sourceList=(ids=[])=>`<div class="x-source-list">${ids.map((id)=>{const s=expansionSources[id];return s?`<a href="${s.url}" target="_blank" rel="noreferrer"><strong>${escapeHTML(s.title)}</strong><small>${escapeHTML(s.publisher)} · official research source</small></a>`:'';}).join('')}</div>`;
function artMarkup(record, cls='x-card-art') {
const art=getPrimaryArtwork(record);
if(!art) return `<div class="${cls} x-art-fallback" aria-hidden="true"><span></span></div>`;
return `<figure class="${cls}"><div class="x-art-fallback" aria-hidden="true"><span></span></div><img data-x-art src="${art.url}" alt="${escapeHTML(art.alt)}" loading="lazy" referrerpolicy="no-referrer"><figcaption>${escapeHTML(art.credit)}</figcaption></figure>`;
}
function wireImageFallbacks(root=document) {
root.querySelectorAll('img[data-x-art]').forEach((img)=>{
if(img.dataset.xFallbackWired) return;
img.dataset.xFallbackWired='1';
img.addEventListener('error',()=>{ const parent=img.closest('figure,.x-dossier-art,.x-gallery-item'); parent?.classList.add('image-failed'); img.remove(); },{once:true});
});
}
function badge(record){ return `<span class="x-status x-status-${escapeHTML(record.status)}">${escapeHTML(record.status.replaceAll('-',' '))}</span>`; }
function card(record){
return `<article class="x-lantern-card" data-archive="${record.archive}">
${artMarkup(record)}
<div class="x-card-scan" aria-hidden="true"></div>
<div class="x-card-body"><div class="x-card-kicker"><span>SECTOR ${escapeHTML(record.sector)}</span>${badge(record)}</div>
<h3>${escapeHTML(record.name)}</h3><p class="x-alias">${escapeHTML(record.aliases[0]||'Green Lantern')}</p>
<p>${escapeHTML(record.summary)}</p>
<div class="x-card-meta"><span>${escapeHTML(record.species)}</span><span>${escapeHTML(record.homeworld)}</span></div>
<a class="route-link x-card-link" href="/lanterns/${record.slug}">Open Oan dossier <span aria-hidden="true">↗</span></a>
</div>
</article>`;
}
function shellHero(kicker,title,copy,code){return `<section class="x-page-hero"><div class="container x-page-hero-grid"><div><p class="eyebrow">${escapeHTML(kicker)}</p><h1>${title}</h1></div><div class="x-hero-brief"><span class="holo-code">${escapeHTML(code)}</span><p>${escapeHTML(copy)}</p></div></div></section>`;}
function selectOptions(values,label){ return `<option value="">${label}</option>${values.map((v)=>`<option value="${escapeHTML(v)}">${escapeHTML(v)}</option>`).join('')}`; }
function renderArchive(){
const eraOpts=unique(lanternRecords.map((r)=>r.era));
const statusOpts=unique(lanternRecords.map((r)=>r.status));
const speciesOpts=unique(lanternRecords.map((r)=>r.species));
const sectorOpts=unique(lanternRecords.map((r)=>r.sector));
app.innerHTML=`<div class="page x-expanded-view" data-x-view="archive">
${shellHero('Oan personnel registry','Lantern <span class="display-outline">Archive</span>','Search Earth’s Green Lantern lineage and a growing cosmic Corps registry. Legacy, ally and Corps records stay explicitly separated.','DATABASE / 18 VERIFIED RECORDS')}
<section class="x-archive-layout container">
<aside class="x-archive-filter-rail hard-panel" id="x-filter-rail" aria-label="Archive filters">
<div class="x-filter-heading"><span class="holo-code">ARCHIVE MODE</span><button id="x-filter-close" class="x-filter-close" type="button" aria-label="Close filters">×</button></div>
<div class="x-mode-switch" role="group" aria-label="Archive mode"><button type="button" data-x-mode="earth" class="is-active">Sector 2814 / Earth</button><button type="button" data-x-mode="cosmic">Cosmic Corps</button></div>
<label>Search<input id="x-archive-search" type="search" placeholder="Torchbearer, Xudar, Honor Guard…"></label>
<label>Era<select id="x-era">${selectOptions(eraOpts,'All eras')}</select></label>
<label>Status<select id="x-status">${selectOptions(statusOpts,'All statuses')}</select></label>
<label>Sector<select id="x-sector">${selectOptions(sectorOpts,'All sectors')}</select></label>
<label>Species<select id="x-species">${selectOptions(speciesOpts,'All species')}</select></label>
<button type="button" class="button ghost" id="x-clear-filters">Clear filters</button>
</aside>
<main class="x-archive-main">
<div class="x-archive-toolbar"><div><span class="holo-code">LIVE CORPS INDEX</span><strong id="x-results-count"></strong></div><button type="button" id="x-filter-open" class="button x-filter-open" aria-expanded="false" aria-controls="x-filter-rail">Filters</button></div>
<div class="x-archive-grid" id="x-archive-results"></div>
</main>
</section>
</div>`;
wireArchive(); wireImageFallbacks(app);
}
function wireArchive(){
const state={mode:'earth',query:'',era:'',status:'',sector:'',species:''};
const results=app.querySelector('#x-archive-results'); const count=app.querySelector('#x-results-count');
const rail=app.querySelector('#x-filter-rail'); const open=app.querySelector('#x-filter-open');
const update=()=>{
const filtered=searchExpandedLanterns(lanternRecords,state.query,{archives:[state.mode],eras:state.era?[state.era]:[],statuses:state.status?[state.status]:[],sectors:state.sector?[state.sector]:[],species:state.species?[state.species]:[]});
count.textContent=`${filtered.length} ${state.mode==='earth'?'EARTH / LEGACY':'COSMIC'} RECORD${filtered.length===1?'':'S'}`;
results.innerHTML=filtered.length?filtered.map(card).join(''):`<div class="x-empty hard-panel"><span class="holo-code">NO MATCHING RECORDS</span><h3>Nothing in this sector.</h3><p>Clear one or more filters or try a broader search term.</p></div>`;
wireImageFallbacks(results);
};
app.querySelectorAll('[data-x-mode]').forEach((b)=>b.addEventListener('click',()=>{state.mode=b.dataset.xMode;app.querySelectorAll('[data-x-mode]').forEach(x=>x.classList.toggle('is-active',x===b));update();}));
const binds=[['#x-archive-search','query','input'],['#x-era','era','change'],['#x-status','status','change'],['#x-sector','sector','change'],['#x-species','species','change']];
binds.forEach(([sel,key,event])=>app.querySelector(sel).addEventListener(event,(e)=>{state[key]=e.target.value;update();}));
app.querySelector('#x-clear-filters').addEventListener('click',()=>{state.query=state.era=state.status=state.sector=state.species=''; binds.forEach(([sel])=>app.querySelector(sel).value='');update();});
const close=()=>{rail.classList.remove('is-open');open.setAttribute('aria-expanded','false');};
open.addEventListener('click',()=>{const next=!rail.classList.contains('is-open');rail.classList.toggle('is-open',next);open.setAttribute('aria-expanded',String(next));});
app.querySelector('#x-filter-close').addEventListener('click',close);
update();
}
function relationMarkup(record){
const groups=[['allies','Allies'],['mentors','Mentors'],['predecessors','Predecessors'],['successors','Successors'],['rivals','Rivals']].filter(([key])=>record.relationships?.[key]?.length);
if(!groups.length) return '<p class="muted">No relationship nodes indexed yet.</p>';
return `<div class="x-rel-network"><div class="x-rel-center"><span>${escapeHTML(record.name)}</span></div>${groups.map(([key,label],i)=>`<div class="x-rel-group" style="--i:${i}"><small>${label}</small>${record.relationships[key].map((slug)=>{const target=getLantern(slug);return target?`<a class="route-link" href="/lanterns/${target.slug}">${escapeHTML(target.name)}</a>`:`<span>${escapeHTML(titleCase(slug))}</span>`;}).join('')}</div>`).join('')}</div>`;
}
function renderDossier(slug){
const r=getLantern(slug); if(!r) return;
const primary=getPrimaryArtwork(r);
const gallery=(r.artwork||[]).slice(1);
const events=r.majorEvents.map((id)=>timelineEvents.find((e)=>e.id===id)).filter(Boolean);
app.innerHTML=`<div class="page x-expanded-view" data-x-view="dossier">
<section class="x-dossier-hero">
<div class="x-dossier-art">${primary?`<img data-x-art src="${primary.url}" alt="${escapeHTML(primary.alt)}" referrerpolicy="no-referrer"><div class="x-art-credit">${escapeHTML(primary.credit)}</div>`:'<div class="x-art-fallback"><span></span></div>'}</div>
<div class="x-dossier-shade"></div><div class="x-scanline" aria-hidden="true"></div>
<div class="container x-dossier-title"><p class="eyebrow">PERSONNEL DOSSIER // ${escapeHTML(r.sector)}</p><div class="x-dossier-badges">${badge(r)}<span class="x-status">${escapeHTML(r.archive)} archive</span></div><h1>${escapeHTML(r.name)}</h1><p class="x-dossier-alias">${escapeHTML(r.aliases.join(' · '))}</p><p class="lede">${escapeHTML(r.summary)}</p></div>
</section>
<section class="container x-dossier-layout">
<aside class="x-dossier-facts hard-panel"><p class="holo-code">IDENTITY / ASSIGNMENT</p>
${[['Real name',r.realName],['Species',r.species],['Homeworld',r.homeworld],['Sector',r.sector],['Power source',r.ringType],['First appearance',r.firstAppearance],['Creators',r.creators.join(' · ')]].map(([k,v])=>`<div><span>${escapeHTML(k)}</span><strong>${escapeHTML(v)}</strong></div>`).join('')}
<a class="button route-link" href="/lanterns">← Return to archive</a>
</aside>
<main class="x-dossier-main">
<section class="hard-panel x-dossier-section"><p class="holo-code">CONSTRUCT PROFILE</p><h2>How the light thinks</h2><p>${escapeHTML(r.constructStyle)}</p>${tagList(r.abilities)}</section>
<section class="x-dossier-split"><div class="hard-panel x-dossier-section"><p class="holo-code">AFFILIATIONS</p><h2>Corps context</h2>${tagList(r.affiliations)}</div><div class="hard-panel x-dossier-section"><p class="holo-code">READING PATH</p><h2>Start here</h2><ol class="x-reading-list">${r.recommendedReading.map((x)=>`<li>${escapeHTML(x)}</li>`).join('')}</ol></div></section>
<section class="hard-panel x-dossier-section"><p class="holo-code">RELATIONSHIP MAP</p><h2>Connected files</h2>${relationMarkup(r)}</section>
<section class="hard-panel x-dossier-section"><p class="holo-code">EVENT NODES</p><h2>Where this record intersects history</h2><div class="x-event-chips">${events.map((e)=>`<a class="route-link" href="${timelineHref(e.id)}"><strong>${e.year}</strong><span>${escapeHTML(e.title)}</span></a>`).join('')}</div></section>
${(r.continuityNotes?.length||r.firstAppearanceNotes)?`<section class="hard-panel x-dossier-section x-continuity"><p class="holo-code">CONTINUITY / SOURCE NOTES</p><h2>Read the record carefully</h2>${r.firstAppearanceNotes?`<p>${escapeHTML(r.firstAppearanceNotes)}</p>`:''}${(r.continuityNotes||[]).map((x)=>`<p>${escapeHTML(x)}</p>`).join('')}</section>`:''}
${gallery.length?`<section class="x-dossier-section"><p class="holo-code">SECONDARY ARTWORK</p><div class="x-gallery">${gallery.map((a)=>`<figure class="x-gallery-item"><img data-x-art src="${a.url}" alt="${escapeHTML(a.alt)}" loading="lazy" referrerpolicy="no-referrer"><figcaption>${escapeHTML(a.credit)}</figcaption></figure>`).join('')}</div></section>`:''}
<section class="hard-panel x-dossier-section"><p class="holo-code">RESEARCH TRAIL</p><h2>Official sources</h2>${sourceList(r.sourceIds)}</section>
</main>
</section>
</div>`;
wireImageFallbacks(app);
}
function eventDossier(event){
const era=eraDefinitions.find((x)=>x.id===event.eraId);
return `<article class="x-timeline-dossier" style="--era:${era?.color||'#62ff9c'}"><div class="x-timeline-year-big">${event.year}</div><p class="holo-code">${escapeHTML(era?.label||event.eraId)}</p><h2>${escapeHTML(event.title)}</h2><p class="lede">${escapeHTML(event.summary)}</p>
<div class="x-timeline-facts"><div><span>Consequence</span><p>${escapeHTML(event.consequences)}</p></div><div><span>Recommended reading</span>${tagList(event.recommendedReading)}</div></div>
<div class="x-event-people"><span>Linked dossiers</span>${event.characterSlugs.map((slug)=>{const r=getLantern(slug);return r?`<a class="route-link" href="/lanterns/${slug}">${escapeHTML(r.name)}</a>`:'';}).join('')}</div>
${event.villainSlugs.length?`<div class="x-event-villains"><span>Opposition</span>${tagList(event.villainSlugs.map(titleCase))}</div>`:''}
${sourceList(event.sourceIds)}</article>`;
}
function renderTimeline(){
const params=new URLSearchParams(location.search); const selected=resolveTimelineSelection(timelineEvents,params.get('event'));
const anchors=getTimelineAnchors(timelineEvents);
app.innerHTML=`<div class="page x-expanded-view" data-x-view="timeline">${shellHero('Corps chronometer','The Lantern <span class="display-outline">Timeline</span>','A publication-oriented history of how the Green Lantern idea expands, collapses and rebuilds. Choose a year to open a sourced event dossier.','CHRONOMETER / 1940 → 2026')}
<section class="container x-timeline-shell"><nav class="x-year-rail" aria-label="Timeline years">${anchors.map((year)=>`<button type="button" data-x-year="${year}">${year}</button>`).join('')}</nav>
<div class="x-timeline-body"><aside class="x-era-rail">${eraDefinitions.map((era)=>`<button type="button" data-x-era="${era.id}" style="--era:${era.color}">${escapeHTML(era.label)}</button>`).join('')}</aside>
<div class="x-event-rail" id="x-event-rail">${timelineEvents.map((e)=>`<button type="button" class="x-event-node ${e.id===selected?.id?'is-active':''}" data-x-event="${e.id}" data-x-event-year="${e.year}" data-x-event-era="${e.eraId}"><span>${e.year}</span><strong>${escapeHTML(e.title)}</strong></button>`).join('')}</div>
<div class="x-timeline-detail hard-panel" id="x-timeline-detail">${selected?eventDossier(selected):''}</div>
</div>
</section></div>`;
wireTimeline();
}
function wireTimeline(){
const detail=app.querySelector('#x-timeline-detail'); const rail=app.querySelector('#x-event-rail');
const select=(id,updateUrl=true)=>{const event=resolveTimelineSelection(timelineEvents,id); if(!event)return; rail.querySelectorAll('[data-x-event]').forEach((b)=>b.classList.toggle('is-active',b.dataset.xEvent===event.id)); detail.innerHTML=eventDossier(event); if(updateUrl) history.replaceState(history.state,'',timelineHref(event.id)); };
rail.querySelectorAll('[data-x-event]').forEach((b)=>b.addEventListener('click',()=>select(b.dataset.xEvent)));
app.querySelectorAll('[data-x-year]').forEach((b)=>b.addEventListener('click',()=>{const node=rail.querySelector(`[data-x-event-year="${b.dataset.xYear}"]`);node?.scrollIntoView({behavior:reducedMotion?'auto':'smooth',inline:'center',block:'nearest'});if(node)select(node.dataset.xEvent);}));
app.querySelectorAll('[data-x-era]').forEach((b)=>b.addEventListener('click',()=>{const node=rail.querySelector(`[data-x-event-era="${b.dataset.xEra}"]`);node?.scrollIntoView({behavior:reducedMotion?'auto':'smooth',inline:'center',block:'nearest'});if(node)select(node.dataset.xEvent);}));
}
export { card, wireImageFallbacks, renderArchive, renderDossier, renderTimeline };
