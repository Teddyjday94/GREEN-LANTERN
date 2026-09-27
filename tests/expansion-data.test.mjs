import test from 'node:test'; import assert from 'node:assert/strict';
import {lanternRecords,timelineEvents,expansionSources,getPrimaryArtwork,villainEventLinks} from '../expansion-data.mjs';

test('initial expansion roster contains 18 unique Lantern records across earth and cosmic archives',()=>{
  assert.equal(lanternRecords.length,18); assert.equal(new Set(lanternRecords.map(x=>x.slug)).size,18);
  assert.ok(lanternRecords.some(x=>x.archive==='earth')); assert.ok(lanternRecords.some(x=>x.archive==='cosmic'));
});
test('priority records have complete official artwork metadata and Kyle has real primary art',()=>{
  const priority=['kyle-rayner','alan-scott','jade','keli-quintela','kilowog','abin-sur','tomar-re','mogo','chp','salaak','arisia-rrab','soranik-natu'];
  for(const slug of priority){ const r=lanternRecords.find(x=>x.slug===slug); assert.ok(r?.artwork?.length,slug); for(const a of r.artwork){assert.ok(a.url.startsWith('https://static.dc.com/'));assert.ok(a.sourceUrl.startsWith('https://www.dc.com/'));assert.ok(a.alt&&a.credit&&a.role);} }
  assert.match(getPrimaryArtwork(lanternRecords.find(x=>x.slug==='kyle-rayner')).url,/KyleRayner/i);
});
test('all source references and event links resolve',()=>{
  const sources=new Set(Object.keys(expansionSources)); const slugs=new Set(lanternRecords.map(x=>x.slug)); const events=new Set(timelineEvents.map(x=>x.id));
  for(const r of lanternRecords){ for(const id of r.sourceIds) assert.ok(sources.has(id),`${r.slug}:${id}`); for(const id of r.majorEvents) assert.ok(events.has(id),`${r.slug}:${id}`); }
  for(const e of timelineEvents){ for(const s of e.sourceIds) assert.ok(sources.has(s),`${e.id}:${s}`); for(const c of e.characterSlugs) assert.ok(slugs.has(c),`${e.id}:${c}`); }
  for(const ids of Object.values(villainEventLinks)) for(const id of ids) assert.ok(events.has(id),id);
});
test('timeline is chronological and event ids unique',()=>{ const years=timelineEvents.map(x=>x.year); assert.deepEqual(years,[...years].sort((a,b)=>a-b)); assert.equal(new Set(timelineEvents.map(x=>x.id)).size,timelineEvents.length); });
