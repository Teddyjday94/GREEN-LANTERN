import { expansionSources } from './expansion-sources.mjs';
import { earthLanternRecords } from './expansion-earth.mjs';
import { cosmicLanternRecords } from './expansion-cosmic.mjs';
import { eraDefinitions, timelineEvents, villainEventLinks } from './expansion-events.mjs';

export { expansionSources, eraDefinitions, timelineEvents, villainEventLinks };
export const lanternRecords = [...earthLanternRecords, ...cosmicLanternRecords];
export const getLantern = (slug) => lanternRecords.find((record) => record.slug === slug);
export const getPrimaryArtwork = (record) => record?.artwork?.find((item) => item.role === 'portrait') || record?.artwork?.find((item) => item.role === 'hero') || record?.artwork?.[0] || null;
