export function groupEventsByEra(events=[]) {
  const order=[]; const map=new Map();
  for (const event of [...events].sort((a,b)=>a.year-b.year)) {
    if (!map.has(event.eraId)) { map.set(event.eraId,[]); order.push(event.eraId); }
    map.get(event.eraId).push(event);
  }
  return order.map((eraId)=>({eraId,events:map.get(eraId)}));
}
export function getTimelineAnchors(events=[]) { return [...new Set(events.map((e)=>Number(e.year)).filter(Number.isFinite))].sort((a,b)=>a-b); }
export function resolveTimelineSelection(events=[], rawEventId='') { return events.find((e)=>e.id===rawEventId) || [...events].sort((a,b)=>a.year-b.year)[0] || null; }
export function timelineHref(eventId) { return `/timeline?event=${encodeURIComponent(eventId)}`; }
