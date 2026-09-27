import { lanterns, villains, spectrum, events, reading, sources } from './data.mjs';
import { searchLanterns } from './search.mjs';
import { resolveRoute } from './router.mjs';

const app = document.querySelector('#app');
const header = document.querySelector('#site-header');
const nav = document.querySelector('#site-nav');
const navToggle = document.querySelector('#nav-toggle');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const earthLanterns = lanterns.filter((l) => !['cosmic'].includes(l.era));
let cleanupFns = [];

const escapeHTML = (value = '') => String(value).replace(/[&<>'"]/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
const tags = (items = []) => `<div class="tag-row">${items.map((x) => `<span class="tag">${escapeHTML(x)}</span>`).join('')}</div>`;
const sourceLinks = (ids = []) => `<div class="source-list">${ids.map((id) => {
  const s = sources[id];
  return s ? `<a class="source-link" href="${s.url}" target="_blank" rel="noreferrer"><strong>${escapeHTML(s.title)}</strong><small>${escapeHTML(s.publisher)} · ${escapeHTML(s.note)}</small></a>` : '';
}).join('')}</div>`;

function artworkMarkup(record, className = 'card-art') {
  if (!record.artwork) return `<div class="${className} card-fallback" aria-hidden="true"></div>`;
  return `<figure class="${className}"><div class="card-fallback" aria-hidden="true"></div><img data-art src="${record.artwork.url}" alt="${escapeHTML(record.artwork.alt)}" loading="lazy" referrerpolicy="no-referrer"/><figcaption class="art-credit">${escapeHTML(record.artwork.credit)}</figcaption></figure>`;
}

function lanternCard(record) {
  return `<article class="lantern-card reveal">
    ${artworkMarkup(record)}
    <span class="card-status">${escapeHTML(record.status)} · ${escapeHTML(record.sector)}</span>
    <a class="route-link card-content" href="/lanterns/${record.slug}" aria-label="Open ${escapeHTML(record.name)} dossier">
      <div class="holo-code">${escapeHTML(record.firstAppearance)}</div>
      <h3>${escapeHTML(record.name)}</h3>
      <p>${escapeHTML(record.alias)} — ${escapeHTML(record.summary)}</p>
    </a>
  </article>`;
}

function pageHero(eyebrow, title, description, code = 'OAN ARCHIVE / VERIFIED RECORD') {
  return `<section class="page-hero"><div class="container page-hero-grid"><div><p class="eyebrow">${escapeHTML(eyebrow)}</p><h1>${title}</h1></div><div class="page-hero-side"><p class="holo-code">${escapeHTML(code)}</p><p>${escapeHTML(description)}</p></div></div></section>`;
}

function homePage() {
  const featured = ['hal-jordan','john-stewart','jessica-cruz','jo-mullein','guy-gardner','kyle-rayner'].map((slug) => lanterns.find((l) => l.slug === slug));
  return `<div class="page home-page">
    <section class="hero"><div class="container hero-grid">
      <div class="hero-copy reveal in">
        <p class="eyebrow">Sector 2814 // Earth uplink</p>
        <h1 class="hero-title"><span class="thin">Green Lantern</span><span class="bright">Corps Archive</span></h1>
        <p class="lede">A cinematic field archive of Earth’s ring-bearers, Oa, the Emotional Spectrum and the stories that repeatedly rebuilt the Corps.</p>
        <div class="button-row"><a class="button primary route-link" href="/lanterns">Enter the archive <span>↗</span></a><a class="button ghost route-link" href="/universe">Explore sectors</a></div>
        <div class="hero-meta"><span>Archive state: online</span><span>Primary sector: 2814</span><span>Sources: ${Object.keys(sources).length}</span><span>Records: ${lanterns.length}</span></div>
      </div>
      <div class="hero-visual" id="hero-visual" aria-label="Procedural three-dimensional power ring visualization">
        <div class="orbit-shell" aria-hidden="true"></div>
        <div class="power-ring" id="power-ring" aria-hidden="true"><div class="ring-band"></div><div class="ring-face"><span class="lantern-glyph"></span></div></div>
        <div class="ring-data"><b>POWER RING // 2814</b><span>Will-energy interface<br>Construct protocol ready<br>Charge stable: 100%</span></div>
      </div>
    </div></section>

    <section class="stat-strip"><div class="container stats">
      <div class="stat"><strong>7,200</strong><span>Corps members in DC’s official overview</span></div>
      <div class="stat"><strong>3,600</strong><span>Space sectors</span></div>
      <div class="stat"><strong>2814</strong><span>Earth sector</span></div>
      <div class="stat"><strong>Oa</strong><span>Historic Corps base</span></div>
    </div></section>

    <section class="section"><div class="container">
      <div class="section-head reveal"><div><p class="eyebrow">Earth file // selected dossiers</p><h2>One planet.<br><span class="display-outline">Many definitions of will.</span></h2></div><p>Earth’s Green Lantern history is not one straight line. The archive distinguishes Corps membership, Golden Age legacy, experimental technology and major shifts in continuity instead of flattening them together.</p></div>
      <div class="archive-rail">${featured.map(lanternCard).join('')}</div>
      <div class="button-row" style="margin-top:28px"><a class="button route-link" href="/lanterns">View all Earth records</a></div>
    </div></section>

    <section class="section oa-section"><div class="container oa-grid">
      <div class="oa-scene reveal" aria-hidden="true"><div class="oa-planet"></div><div class="oa-core"></div></div>
      <div class="reveal"><p class="eyebrow">Corps command // Oa</p><h2>Built around<br><span class="display-outline">a central light.</span></h2><p class="lede">Oa is the historic home of the Guardians and the Green Lantern Corps. The archive treats it as an institution—training ground, command center, political symbol and frequent target—rather than just a glowing planet in the background.</p><div class="meta-split"><div class="hard-panel meta-card"><span class="holo-code">Archive fact</span><strong class="big">0</strong><p>Oa is commonly associated with Sector 0, the administrative heart of the Corps.</p></div><div class="hard-panel meta-card"><span class="holo-code">Archive fact</span><strong class="big">2814</strong><p>Earth’s sector produced an unusually dense concentration of major Lanterns.</p></div></div><div class="button-row" style="margin-top:24px"><a class="button route-link" href="/corps">Enter Oa systems</a></div></div>
    </div></section>

    <section class="section"><div class="container"><div class="section-head reveal"><div><p class="eyebrow">Emotional spectrum</p><h2>Seven colors.<br><span class="display-outline">Two forces beyond them.</span></h2></div><p>DC’s spectrum framework maps green to willpower, yellow to fear, red to rage, blue to hope, violet to love, orange to avarice and indigo to compassion. Black and White are handled separately here as death and life.</p></div>
      <div class="spectrum-strip reveal">${spectrum.filter((s) => s.kind === 'emotion').map((s) => `<a class="route-link spectrum-band" href="/spectrum" style="--band:${s.color}" data-ambient="${s.color}"><strong>${s.emotion}</strong><span>${s.corps}</span></a>`).join('')}</div>
    </div></section>

    <section class="section"><div class="container"><div class="section-head reveal"><div><p class="eyebrow">Event stream</p><h2>History keeps<br><span class="display-outline">rebuilding the Corps.</span></h2></div><p>The mythology repeatedly destroys, restores and reframes the institution. That cycle is part of the subject, not a continuity error to hide.</p></div><div class="timeline">${events.slice(-6).map((e) => `<article class="timeline-item reveal"><span class="timeline-year">${e.year}</span><p class="holo-code">${escapeHTML(e.era)}</p><h3>${escapeHTML(e.title)}</h3><p>${escapeHTML(e.summary)}</p></article>`).join('')}</div><a class="button route-link" href="/timeline">Open complete timeline</a></div></section>

    <section class="section"><div class="container hard-panel" style="padding:clamp(36px,6vw,76px)"><div class="section-head" style="margin:0"><div><p class="eyebrow">Research mode</p><h2>Every dossier<br><span class="display-outline">shows its sources.</span></h2></div><div><p>This project favors official DC material for baseline facts and labels uncertainty when stories from different eras do not line up cleanly.</p><div class="button-row"><a class="button route-link" href="/sources">Open source registry</a><a class="button route-link" href="/reading">Reading paths</a></div></div></div></div></section>
  </div>`;
}

function archivePage() {
  return `<div class="page">${pageHero('Sector 2814 / personnel', 'Earth Lantern<br><span class="display-outline">Archive</span>', 'Search by name, alias, story, affiliation or construct style. Filter by era and Corps relationship.', 'DATASET / EARTH + LEGACY')}
    <section class="section" style="padding-top:50px"><div class="container">
      <div class="archive-controls hard-panel"><div class="search-wrap"><label class="sr-only" for="archive-search">Search Lanterns</label><input id="archive-search" type="search" placeholder="Search: Torchbearer, Far Sector, Justice League…" autocomplete="off" /></div>
        <select class="filter-select" id="era-filter" aria-label="Filter by era"><option value="">All eras</option><option value="golden">Golden Age</option><option value="silver">Silver Age</option><option value="bronze">Bronze Age</option><option value="modern">Modern</option></select>
        <select class="filter-select" id="status-filter" aria-label="Filter by status"><option value="">All statuses</option><option value="corps">Corps</option><option value="legacy">Legacy</option><option value="allied">Corps ally</option></select>
      </div><p class="results-count" id="results-count"></p><div class="archive-grid" id="archive-results"></div>
    </div></section>
  </div>`;
}

function dossierPage(slug) {
  const l = lanterns.find((record) => record.slug === slug);
  if (!l) return notFoundPage('No Lantern record matches that archive ID.');
  const art = l.artwork ? `<div class="dossier-bg"><img data-art src="${l.artwork.url}" alt="" aria-hidden="true" referrerpolicy="no-referrer"/><div class="card-fallback"></div>${l.artwork ? `<span class="art-credit">${escapeHTML(l.artwork.credit)}</span>`:''}</div>` : `<div class="dossier-bg card-fallback"></div>`;
  return `<div class="page"><section class="dossier-hero">${art}<div class="container dossier-hero-inner"><p class="eyebrow">Personnel dossier // ${escapeHTML(l.sector)}</p><p class="dossier-alias">${escapeHTML(l.alias)}</p><h1>${escapeHTML(l.name)}</h1><p class="lede">${escapeHTML(l.summary)}</p><p class="dossier-quote">“${escapeHTML(l.quote)}”</p></div></section>
    <div class="container dossier-grid"><aside class="facts hard-panel"><p class="eyebrow">Record metadata</p>
      <div class="fact"><span>Real name</span><strong>${escapeHTML(l.realName)}</strong></div><div class="fact"><span>First appearance</span><strong>${escapeHTML(l.firstAppearance)}</strong></div><div class="fact"><span>Creators</span><strong>${escapeHTML(l.creators.join(' · '))}</strong></div><div class="fact"><span>Sector / assignment</span><strong>${escapeHTML(l.sector)}</strong></div><div class="fact"><span>Archive status</span><strong>${escapeHTML(l.status)}</strong></div><div class="fact"><span>Era tag</span><strong>${escapeHTML(l.era)}</strong></div>
      <div style="margin-top:20px"><a class="button route-link" href="/lanterns">← Archive</a></div></aside>
      <article class="dossier-copy hard-panel"><p class="holo-code">Construct profile</p><h2>How the light thinks</h2><p>${escapeHTML(l.constructStyle)}</p>${tags(l.abilities)}
      <h2>Affiliations</h2>${tags(l.affiliations)}<h2>Major stories</h2>${tags(l.stories)}<h2>Relationships / context</h2>${tags(l.relationships)}<h2>Research trail</h2><p class="muted">Sources below support the major biographical and continuity claims in this dossier. Some historical facts span multiple publishing eras.</p>${sourceLinks(l.sourceIds)}</article>
    </div></div>`;
}

const oaNodes = {
  battery:{title:'Central Power Battery',copy:'The symbolic and technological heart of the Corps’ classic infrastructure. Its status changes across eras, but it remains central to how Green Lantern stories visualize shared will-energy.'},
  guardians:{title:'Guardians of the Universe',copy:'Ancient administrators whose attempt to impose cosmic order created the Green Lantern Corps—and many of the institution’s recurring political problems.'},
  training:{title:'Training & Recruitment',copy:'Rings identify candidates, but Corps culture also depends on training, field judgment and veterans such as Kilowog. Earth’s crowded Sector 2814 is an exception, not the default model.'},
  sectors:{title:'3,600 Sectors',copy:'DC’s official Corps overview describes 7,200 members patrolling 3,600 sectors: a two-Lantern-per-sector scale that stories frequently complicate.'}
};

function corpsPage() {
  return `<div class="page">${pageHero('Oa / institutional archive','The Corps<br><span class="display-outline">as a system</span>','Explore the Central Power Battery, Guardians, sector model and a procedural ring-construct lab.', 'SYSTEM / OAN INFRASTRUCTURE')}
    <section class="section"><div class="container oa-grid"><div class="oa-scene hard-panel" aria-label="Stylized Oa and Central Power Battery visualization"><div class="oa-planet"></div><div class="oa-core"></div>
      <button class="oa-node n1" data-oa="battery">Power Battery</button><button class="oa-node n2" data-oa="guardians">Guardians</button><button class="oa-node n3" data-oa="training">Recruitment</button><button class="oa-node n4" data-oa="sectors">Sectors</button></div>
      <div class="oa-info hard-panel" id="oa-info"><p class="holo-code">Select an Oan system node</p><h3>Central Power Battery</h3><p>${oaNodes.battery.copy}</p></div></div></section>
    <section class="section"><div class="container"><div class="section-head"><div><p class="eyebrow">Construct lab // local simulation</p><h2>Think it.<br><span class="display-outline">Hold it. Release it.</span></h2></div><p>Draw with a pointer. Hold to build charge, release to launch the construct, and watch it dissolve. On touch devices, construction mode must be explicitly enabled so normal page scrolling is never trapped.</p></div>
      <div class="construct-wrap"><div class="construct-stage hard-panel"><canvas id="construct-canvas" aria-label="Interactive Green Lantern construct drawing canvas"></canvas><div class="construct-hud"><span id="lab-state">STATE: IDLE</span><span>ESC: RESET</span></div></div>
      <aside class="lab-controls hard-panel"><p class="eyebrow">Ring interface</p><h3>Energy reserve</h3><div class="energy-meter"><i id="energy-fill"></i></div><p class="muted">Desktop: press and drag. Touch: tap “Enable touch construct,” then draw; tap again to return to scroll-safe mode.</p><div class="button-row"><button class="button primary" id="lab-toggle">Enable touch construct</button><button class="button" id="lab-reset">Reset</button></div><div style="margin-top:24px" class="holo-code">Simulation uses original canvas geometry—no copyrighted 3D asset files.</div></aside></div>
    </div></section>
    <section class="section"><div class="container"><div class="meta-split"><div class="hard-panel meta-card"><p class="eyebrow">Scale</p><strong class="big">7,200</strong><p>Members in DC’s official high-level Corps description.</p></div><div class="hard-panel meta-card"><p class="eyebrow">Coverage</p><strong class="big">3,600</strong><p>Sectors in the same official description.</p></div></div>${sourceLinks(['corps','glc2025','gl2021'])}</div></section>
  </div>`;
}

const sectors = {
  '0':{title:'Sector 0 — Oa',copy:'Administrative heart of the Green Lantern Corps and the Guardians in classic Corps geography.'},
  '2814':{title:'Sector 2814 — Earth',copy:'Earth’s sector, unusually rich in major human Green Lanterns across multiple generations.'},
  '1417':{title:'Sector 1417 — Korugar',copy:'Sinestro’s home sector and a key location in his fall from celebrated Green Lantern to founder of the fear-powered Sinestro Corps.'},
  '666':{title:'Sector 666',copy:'The massacre associated with the Manhunters and Atrocitus’ history becomes foundational to the Red Lantern mythology.'},
  '674':{title:'Sector 674',copy:'Historically associated with Kilowog, one of the Corps’ best-known trainers and alien veterans.'}
};

function universePage() {
  return `<div class="page">${pageHero('Universe map / selected nodes','Sector<br><span class="display-outline">Navigation</span>','This is a lore-oriented map, not an attempt at a literal astronomical projection. Select a sector node to inspect its significance.', 'MAP / SYMBOLIC TOPOLOGY')}
    <section class="section" style="padding-top:50px"><div class="container sector-layout"><div class="sector-map hard-panel"><svg class="sector-svg" viewBox="0 0 800 600" role="img" aria-label="Interactive symbolic Green Lantern sector map">
      <circle class="orbit" cx="400" cy="300" r="250"/><circle class="orbit" cx="400" cy="300" r="180"/><circle class="orbit" cx="400" cy="300" r="105"/><path class="orbit" d="M100 430 C280 90 580 80 720 390"/><path class="orbit" d="M110 160 C320 520 600 500 730 170"/>
      ${[['0',400,300],['2814',250,390],['1417',610,180],['666',180,155],['674',590,440]].map(([id,x,y]) => `<g class="sector-node" data-sector="${id}" tabindex="0" role="button" aria-label="Select Sector ${id}"><circle cx="${x}" cy="${y}" r="${id==='2814'?14:10}"/><text x="${Number(x)+18}" y="${Number(y)+5}">${id}</text></g>`).join('')}
      <circle cx="400" cy="300" r="4" fill="#dfffea"/><text x="414" y="286">OAN REFERENCE</text></svg></div>
      <aside class="sector-info hard-panel"><p class="eyebrow">Selected node</p><div class="sector-num" id="sector-number">2814</div><h3 id="sector-title">${sectors['2814'].title}</h3><p id="sector-copy">${sectors['2814'].copy}</p><div class="tag-row">${Object.keys(sectors).map((id) => `<button class="tag sector-button" data-sector="${id}">${id}</button>`).join('')}</div><div style="margin-top:30px">${sourceLinks(['corps','sinestro'])}</div></aside></div></section>
  </div>`;
}

function spectrumPage() {
  return `<div class="page">${pageHero('Light / emotion / metaphysics','Emotional<br><span class="display-outline">Spectrum</span>','The seven-color framework is presented separately from Black and White, which DC material associates with death and life rather than another ordinary emotion.', 'SPECTRUM / 7 + 2')}
    <section class="section"><div class="container"><div class="spectrum-strip">${spectrum.filter(s=>s.kind==='emotion').map((s) => `<button class="spectrum-band" style="--band:${s.color}" data-ambient="${s.color}"><strong>${s.emotion}</strong><span>${s.corps}</span></button>`).join('')}</div></div></section>
    <section class="section"><div class="container">${spectrum.map((s) => `<article class="hard-panel reveal spectrum-detail" data-ambient="${s.color}" style="padding:clamp(28px,5vw,58px);margin-bottom:18px;--band:${s.color}"><p class="eyebrow" style="color:${s.color}">${s.kind==='emotion'?'Emotional light':'Beyond the seven'}</p><div class="section-head" style="margin:0"><div><h2 style="color:${s.color}">${escapeHTML(s.name)} / ${escapeHTML(s.emotion)}</h2></div><div><p><strong>${escapeHTML(s.corps)}</strong></p><p class="muted">Representative: ${escapeHTML(s.exemplar)}</p></div></div></article>`).join('')}${sourceLinks(['spectrum','blackest'])}</div></section>
  </div>`;
}

function timelinePage() {
  return `<div class="page">${pageHero('Publication history / selected milestones','The Lantern<br><span class="display-outline">Timeline</span>','A reading-oriented chronology of major changes in the Green Lantern idea. It is intentionally selective, not a complete issue-by-issue bibliography.', 'TIMELINE / 1940 → CURRENT')}
    <section class="section"><div class="container"><div class="timeline">${events.map((e) => `<article class="timeline-item reveal"><span class="timeline-year">${e.year}</span><p class="holo-code">${escapeHTML(e.era)}</p><h3>${escapeHTML(e.title)}</h3><p>${escapeHTML(e.summary)}</p>${sourceLinks(e.sourceIds)}</article>`).join('')}</div></div></section></div>`;
}

function villainsPage() {
  return `<div class="page">${pageHero('Threat index / recurring adversaries','Threat<br><span class="display-outline">Archive</span>','Selected enemies and cosmic antagonists whose histories intersect with the Corps, the spectrum or Sector 2814.', 'SECURITY / RED FLAGGED')}
    <section class="section"><div class="container villain-grid">${villains.map((v) => `<article class="hard-panel villain-card reveal" style="--villain:${v.color}"><div class="villain-color"></div><p class="holo-code">${escapeHTML(v.firstAppearance)}</p><h3>${escapeHTML(v.name)}</h3><p><strong>${escapeHTML(v.role)}</strong></p><p>${escapeHTML(v.summary)}</p>${sourceLinks(v.sourceIds)}</article>`).join('')}</div></section></div>`;
}

function readingPage() {
  return `<div class="page">${pageHero('Recommended entry vectors','Reading<br><span class="display-outline">Paths</span>','There is no single correct Green Lantern starting point. Pick the kind of story you want, then move outward through the archive.', 'GUIDE / START ANYWHERE')}
    <section class="section"><div class="container reading-grid">${reading.map((r,i) => `<article class="hard-panel reading-card reveal"><span class="year">PATH ${String(i+1).padStart(2,'0')} // ${escapeHTML(r.year)}</span><h3>${escapeHTML(r.title)}</h3><p>${escapeHTML(r.why)}</p>${tags(r.tags)}</article>`).join('')}</div></section>
    <section class="section" style="padding-top:0"><div class="container hard-panel" style="padding:36px"><p class="eyebrow">Continuity note</p><h3>Green Lantern changes shape by era.</h3><p class="muted">Treat publication eras as layers, not one perfectly synchronized biography. Character histories are repeatedly revised, restored or recontextualized; this guide surfaces that rather than hiding it.</p><a class="button route-link" href="/timeline">Pair with the timeline</a></div></section></div>`;
}

function sourcesPage() {
  return `<div class="page">${pageHero('Research ledger / primary preference','Sources &<br><span class="display-outline">Credits</span>','The archive favors official DC pages for baseline canon and publication context. External artwork is shown selectively and remains the property of its rights holders.', 'RESEARCH / TRACEABLE')}
    <section class="section"><div class="container"><div class="source-grid">${Object.values(sources).map((s) => `<article class="hard-panel source-card reveal"><span class="publisher">${escapeHTML(s.publisher)}</span><h3>${escapeHTML(s.title)}</h3><p>${escapeHTML(s.note)}</p><a class="button" href="${s.url}" target="_blank" rel="noreferrer">Open source ↗</a></article>`).join('')}</div></div></section>
    <section class="section" style="padding-top:0"><div class="container hard-panel" style="padding:40px"><p class="eyebrow">Artwork policy</p><h3>Borrowed art is context, not the site’s visual foundation.</h3><p class="muted">Character/editorial images are linked from official DC-hosted resources where available and include credit/source metadata. The starfield, ring, Oa, map, spectrum transitions and construct lab are original procedural/CSS/canvas work created for this fan project.</p></div></section></div>`;
}

function notFoundPage(copy='The requested archive location does not exist.') {
  return `<div class="page"><section class="hero"><div class="container"><p class="eyebrow">Archive fault // 404</p><h1>Signal<br><span class="display-outline">Lost</span></h1><p class="lede">${escapeHTML(copy)}</p><a class="button primary route-link" href="/">Return to Sector 2814</a></div></section></div>`;
}

function render() {
  cleanupFns.forEach((fn) => fn());
  cleanupFns = [];
  const route = resolveRoute(location.pathname);
  const pages = {home:homePage,lanterns:archivePage,corps:corpsPage,universe:universePage,spectrum:spectrumPage,timeline:timelinePage,villains:villainsPage,reading:readingPage,sources:sourcesPage};
  app.innerHTML = route.name === 'lantern' ? dossierPage(route.slug) : (pages[route.name]?.() ?? notFoundPage());
  updateMeta(route);
  bindRouteLinks();
  bindImageFallbacks();
  bindReveal();
  bindPageInteractions(route);
  updateCurrentNav(route);
  nav.classList.remove('open');
  navToggle.setAttribute('aria-expanded','false');
  if (!history.state?.preserveScroll) scrollTo({top:0,behavior:'auto'});
}

function updateMeta(route) {
  let title = 'Green Lantern Corps Archive';
  let desc = 'Unofficial, research-driven Green Lantern fan archive exploring Sector 2814, Oa, the Emotional Spectrum and Lantern history.';
  if (route.name === 'lantern') {
    const l = lanterns.find((x) => x.slug === route.slug);
    if (l) { title = `${l.name} — Green Lantern Corps Archive`; desc = l.summary; }
  } else if (route.name !== 'home' && route.name !== 'not-found') {
    title = `${route.name[0].toUpperCase()+route.name.slice(1)} — Green Lantern Corps Archive`;
  }
  document.title = title;
  document.querySelector('meta[name="description"]')?.setAttribute('content',desc);
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) { canonical = document.createElement('link'); canonical.rel='canonical'; document.head.append(canonical); }
  canonical.href = `${location.origin}${location.pathname}`;
}

function bindRouteLinks() {
  document.querySelectorAll('a.route-link').forEach((link) => link.addEventListener('click', (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const url = new URL(link.href, location.origin);
    if (url.origin !== location.origin) return;
    event.preventDefault();
    history.pushState({},'',url.pathname);
    render();
  }));
}

function updateCurrentNav(route) {
  document.querySelectorAll('.site-nav a').forEach((link) => {
    const path = new URL(link.href,location.origin).pathname;
    const current = route.name === 'lantern' ? path === '/lanterns' : path === location.pathname;
    if (current) link.setAttribute('aria-current','page'); else link.removeAttribute('aria-current');
  });
}

function bindImageFallbacks() {
  document.querySelectorAll('img[data-art]').forEach((img) => {
    const handle = () => { img.style.display='none'; img.closest('figure, .dossier-bg')?.classList.add('image-failed'); };
    img.addEventListener('error',handle,{once:true});
    if (img.complete && img.naturalWidth === 0) handle();
  });
}

function bindReveal() {
  const els = [...document.querySelectorAll('.reveal')];
  if (reduceMotion || !('IntersectionObserver' in window)) { els.forEach((el) => el.classList.add('in')); return; }
  const obs = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('in'); obs.unobserve(entry.target); } }), {threshold:.12});
  els.forEach((el) => obs.observe(el));
  cleanupFns.push(() => obs.disconnect());
}

function bindPageInteractions(route) {
  if (route.name === 'home') initHome();
  if (route.name === 'lanterns') initArchive();
  if (route.name === 'corps') { initOa(); initConstructLab(); }
  if (route.name === 'universe') initSectorMap();
  if (route.name === 'spectrum' || route.name === 'home') initSpectrumAmbient();
}

function initHome() {
  const visual = document.querySelector('#hero-visual');
  const ring = document.querySelector('#power-ring');
  if (!visual || !ring || reduceMotion) return;
  const move = (event) => {
    const rect = visual.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - .5;
    const y = (event.clientY - rect.top) / rect.height - .5;
    ring.style.transform = `translate(-50%,-50%) rotateX(${64-y*18}deg) rotateY(${x*18}deg) rotateZ(${-14+x*8}deg)`;
  };
  visual.addEventListener('pointermove',move);
  cleanupFns.push(() => visual.removeEventListener('pointermove',move));
}

function initArchive() {
  const input = document.querySelector('#archive-search');
  const era = document.querySelector('#era-filter');
  const status = document.querySelector('#status-filter');
  const results = document.querySelector('#archive-results');
  const count = document.querySelector('#results-count');
  const paint = () => {
    const filtered = searchLanterns(earthLanterns,input.value,{eras:era.value?[era.value]:[],statuses:status.value?[status.value]:[]});
    count.textContent = `${filtered.length} record${filtered.length===1?'':'s'} located`;
    results.innerHTML = filtered.length ? filtered.map(lanternCard).join('') : `<div class="empty-state" style="grid-column:1/-1"><strong>No archive match.</strong><span>Try a broader name, story title or clear one of the filters.</span></div>`;
    bindRouteLinks(); bindImageFallbacks(); document.querySelectorAll('#archive-results .reveal').forEach((el)=>el.classList.add('in'));
  };
  input.addEventListener('input',paint); era.addEventListener('change',paint); status.addEventListener('change',paint); paint();
}

function initOa() {
  const info = document.querySelector('#oa-info');
  document.querySelectorAll('[data-oa]').forEach((btn) => btn.addEventListener('click', () => {
    document.querySelectorAll('[data-oa]').forEach((x)=>x.classList.remove('active')); btn.classList.add('active');
    const node = oaNodes[btn.dataset.oa];
    info.innerHTML = `<p class="holo-code">Oan system // selected</p><h3>${escapeHTML(node.title)}</h3><p>${escapeHTML(node.copy)}</p>`;
  }));
}

function initSectorMap() {
  const num = document.querySelector('#sector-number');
  const title = document.querySelector('#sector-title');
  const copy = document.querySelector('#sector-copy');
  const select = (id) => {
    if (!sectors[id]) return;
    num.textContent=id; title.textContent=sectors[id].title; copy.textContent=sectors[id].copy;
    document.querySelectorAll('[data-sector]').forEach((el)=>el.classList.toggle('active',el.dataset.sector===id));
  };
  document.querySelectorAll('[data-sector]').forEach((el) => {
    el.addEventListener('click',()=>select(el.dataset.sector));
    el.addEventListener('keydown',(e)=>{ if (e.key==='Enter'||e.key===' ') {e.preventDefault();select(el.dataset.sector);} });
  });
  select('2814');
}

function initSpectrumAmbient() {
  const targets = [...document.querySelectorAll('[data-ambient]')];
  const set = (color) => document.documentElement.style.setProperty('--ambient',color);
  targets.forEach((el) => { el.addEventListener('pointerenter',()=>set(el.dataset.ambient)); el.addEventListener('focus',()=>set(el.dataset.ambient)); });
  if (!reduceMotion && 'IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries) => entries.forEach((entry)=> { if (entry.isIntersecting) set(entry.target.dataset.ambient); }),{rootMargin:'-30% 0px -50%'});
    document.querySelectorAll('.spectrum-detail').forEach((el)=>obs.observe(el));
    cleanupFns.push(()=>obs.disconnect());
  }
  cleanupFns.push(()=>document.documentElement.style.setProperty('--ambient','#22f28d'));
}

function initConstructLab() {
  const canvas = document.querySelector('#construct-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const stage = canvas.parentElement;
  const stateEl = document.querySelector('#lab-state');
  const energy = document.querySelector('#energy-fill');
  const toggle = document.querySelector('#lab-toggle');
  const reset = document.querySelector('#lab-reset');
  let points=[], sparks=[], drawing=false, charge=0, chargeTimer=0, touchEnabled=false, raf=0;
  const resize = () => { const r=stage.getBoundingClientRect(); const d=Math.min(devicePixelRatio||1,2); canvas.width=r.width*d; canvas.height=r.height*d; ctx.setTransform(d,0,0,d,0,0); };
  const pointFrom = (e) => { const r=canvas.getBoundingClientRect(); return {x:e.clientX-r.left,y:e.clientY-r.top,t:performance.now()}; };
  const setState = (s) => stateEl.textContent=`STATE: ${s.toUpperCase()}`;
  const setEnergy = (n) => { charge=Math.max(0,Math.min(100,n)); energy.style.width=`${charge}%`; };
  const clear = () => { points=[];sparks=[];drawing=false;cancelAnimationFrame(chargeTimer);setEnergy(0);setState('idle');ctx.clearRect(0,0,canvas.width,canvas.height); };
  const begin = (e) => {
    if (e.pointerType !== 'mouse' && !touchEnabled) return;
    drawing=true; points=[pointFrom(e)]; setState('drawing'); setEnergy(8); canvas.setPointerCapture?.(e.pointerId);
    const chargeUp=()=>{ if(!drawing)return;setState('charging');setEnergy(charge+1.25);chargeTimer=requestAnimationFrame(chargeUp);}; chargeTimer=requestAnimationFrame(chargeUp);
  };
  const move = (e) => { if(!drawing)return; if(e.pointerType!=='mouse'&&touchEnabled)e.preventDefault(); points.push(pointFrom(e)); if(points.length>90)points.shift(); };
  const end = (e) => { if(!drawing)return;drawing=false;cancelAnimationFrame(chargeTimer);setState('released'); const last=points.at(-1)||pointFrom(e); const count=Math.round(18+charge*.35); for(let i=0;i<count;i++) sparks.push({x:last.x,y:last.y,vx:(Math.random()-.5)*(2+charge*.06),vy:(Math.random()-.5)*(2+charge*.06),life:1}); setTimeout(()=>setState('dissolving'),120); };
  const renderFrame = () => {
    const r=canvas.getBoundingClientRect(); ctx.clearRect(0,0,r.width,r.height);
    if(points.length>1){ ctx.save();ctx.lineCap='round';ctx.lineJoin='round';ctx.shadowBlur=20;ctx.shadowColor='#22f28d';ctx.strokeStyle=`rgba(80,255,165,${drawing?.95:.42})`;ctx.lineWidth=2+charge*.035;ctx.beginPath();ctx.moveTo(points[0].x,points[0].y);points.slice(1).forEach(p=>ctx.lineTo(p.x,p.y));ctx.stroke();ctx.restore(); }
    sparks.forEach((s)=>{s.x+=s.vx;s.y+=s.vy;s.vx*=.986;s.vy*=.986;s.life-=.014;ctx.fillStyle=`rgba(86,255,170,${Math.max(0,s.life)})`;ctx.beginPath();ctx.arc(s.x,s.y,Math.max(1,3*s.life),0,Math.PI*2);ctx.fill();});
    sparks=sparks.filter(s=>s.life>0); if(!drawing&&points.length&&!reduceMotion){ points=points.slice(Math.ceil(points.length*.035)); if(!points.length&&!sparks.length){setEnergy(Math.max(0,charge-4)); if(charge<=4)setState('idle');} }
    raf=requestAnimationFrame(renderFrame);
  };
  toggle.addEventListener('click',()=>{touchEnabled=!touchEnabled;canvas.style.touchAction=touchEnabled?'none':'pan-y';toggle.textContent=touchEnabled?'Disable touch construct':'Enable touch construct';toggle.classList.toggle('primary',!touchEnabled);setState(touchEnabled?'touch armed':'idle');});
  reset.addEventListener('click',clear); canvas.addEventListener('pointerdown',begin); canvas.addEventListener('pointermove',move,{passive:false}); canvas.addEventListener('pointerup',end); canvas.addEventListener('pointercancel',end);
  const esc=(e)=>{if(e.key==='Escape')clear();}; addEventListener('keydown',esc); addEventListener('resize',resize); resize(); raf=requestAnimationFrame(renderFrame);
  cleanupFns.push(()=>{cancelAnimationFrame(raf);cancelAnimationFrame(chargeTimer);removeEventListener('keydown',esc);removeEventListener('resize',resize);});
}

function initBoot() {
  const boot = document.querySelector('#boot-screen');
  if (!boot || reduceMotion || sessionStorage.getItem('gl-booted')) { boot?.classList.add('is-done'); return; }
  const bar = document.querySelector('#charge-bar'); const value = document.querySelector('#charge-value'); let n=0;
  const id = setInterval(() => { n += Math.max(1,Math.round((101-n)*.08)); n=Math.min(n,100); bar.style.width=`${n}%`; value.textContent=`${n}%`; if(n>=100){clearInterval(id);sessionStorage.setItem('gl-booted','1');setTimeout(()=>boot.classList.add('is-done'),260);} }, 38);
}

function initStarfield() {
  const canvas = document.querySelector('#starfield');
  const ctx = canvas.getContext('2d');
  let stars=[],w=0,h=0,dpr=1,raf=0,lastY=scrollY;
  const resize=()=>{dpr=Math.min(devicePixelRatio||1,1.6);w=innerWidth;h=innerHeight;canvas.width=w*dpr;canvas.height=h*dpr;canvas.style.width=`${w}px`;canvas.style.height=`${h}px`;ctx.setTransform(dpr,0,0,dpr,0,0);const count=Math.min(190,Math.round((w*h)/7500));stars=Array.from({length:count},()=>({x:Math.random()*w,y:Math.random()*h,z:Math.random(),r:.35+Math.random()*1.25}));};
  const draw=()=>{ctx.clearRect(0,0,w,h);const dy=(scrollY-lastY)*.025;lastY=scrollY;for(const s of stars){if(!reduceMotion){s.y+=.07+s.z*.22+dy;if(s.y>h+4)s.y=-4;if(s.y<-4)s.y=h+4;}ctx.fillStyle=`rgba(188,255,219,${.16+s.z*.64})`;ctx.fillRect(s.x,s.y,s.r,s.r*(1+s.z*1.3));}if(!reduceMotion)raf=requestAnimationFrame(draw);};
  addEventListener('resize',resize);resize();draw();
}

navToggle.addEventListener('click',()=>{const open=nav.classList.toggle('open');navToggle.setAttribute('aria-expanded',String(open));});
addEventListener('popstate',render);
addEventListener('scroll',()=>header.classList.toggle('scrolled',scrollY>24),{passive:true});
initBoot(); initStarfield(); render();
