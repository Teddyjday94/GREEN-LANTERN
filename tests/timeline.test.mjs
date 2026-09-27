import test from 'node:test'; import assert from 'node:assert/strict';
import {timelineEvents} from '../expansion-data.mjs'; import {groupEventsByEra,getTimelineAnchors,resolveTimelineSelection,timelineHref} from '../timeline.mjs';
test('timeline includes required anchors',()=>{ const a=getTimelineAnchors(timelineEvents); for(const y of [1940,1959,1968,1971,1994,2005,2007,2009,2011,2012,2014,2016,2019,2023,2025,2026]) assert.ok(a.includes(y),y); });
test('multiple events in one year remain grouped and chronology preserved',()=>{ assert.ok(timelineEvents.filter(e=>e.year===2019).length>=2); const groups=groupEventsByEra(timelineEvents); assert.ok(groups.every(g=>g.events.every((e,i,a)=>i===0||a[i-1].year<=e.year))); });
test('selection resolves deep link or safely falls back',()=>{ assert.equal(resolveTimelineSelection(timelineEvents,'blackest-night').id,'blackest-night'); assert.equal(resolveTimelineSelection(timelineEvents,'not-real').id,timelineEvents[0].id); assert.equal(resolveTimelineSelection([], 'x'),null); });
test('timelineHref encodes event id',()=>assert.equal(timelineHref('a b'),'/timeline?event=a%20b'));
