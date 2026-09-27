export function normalizeSearchText(value='') {
  return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase().replace(/\s+/g,' ');
}

const flat = (value) => {
  if (Array.isArray(value)) return value.flatMap(flat);
  if (value && typeof value === 'object') return Object.values(value).flatMap(flat);
  return value == null ? [] : [String(value)];
};

export function searchExpandedLanterns(records, query='', filters={}) {
  const q = normalizeSearchText(query);
  return records.filter((record) => {
    const haystack = normalizeSearchText(flat([
      record.name, record.aliases, record.realName, record.species, record.homeworld, record.sector,
      record.archive, record.era, record.status, record.ringType, record.firstAppearance,
      record.firstAppearanceNotes, record.affiliations, record.abilities, record.constructStyle,
      record.stories, record.majorEvents, record.relationships, record.recommendedReading,
      record.continuityNotes, record.summary
    ]).join(' '));
    if (q && !haystack.includes(q)) return false;
    const entries = [
      ['archives', record.archive], ['eras',record.era], ['statuses',record.status],
      ['sectors',record.sector], ['species',record.species]
    ];
    for (const [key, value] of entries) {
      if (filters[key]?.length && !filters[key].some((f)=>normalizeSearchText(value).includes(normalizeSearchText(f)))) return false;
    }
    if (filters.affiliations?.length && !filters.affiliations.some((f)=> (record.affiliations||[]).some((a)=>normalizeSearchText(a)===normalizeSearchText(f)))) return false;
    return true;
  });
}
