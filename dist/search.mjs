export function normalizeSearchText(value = '') {
  return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase().replace(/\s+/g, ' ');
}

export function searchLanterns(records, query = '', filters = {}) {
  const q = normalizeSearchText(query);
  return records.filter((record) => {
    const haystack = normalizeSearchText([
      record.name, record.alias, record.realName, record.sector, record.firstAppearance,
      record.summary, record.constructStyle, ...(record.affiliations || []), ...(record.stories || []),
      ...(record.relationships || []), ...(record.abilities || [])
    ].filter(Boolean).join(' '));
    const queryMatch = !q || haystack.includes(q);
    const eraMatch = !filters.eras?.length || filters.eras.includes(record.era);
    const statusMatch = !filters.statuses?.length || filters.statuses.includes(record.status);
    const affiliationMatch = !filters.affiliations?.length || filters.affiliations.some((item) => (record.affiliations || []).includes(item));
    return queryMatch && eraMatch && statusMatch && affiliationMatch;
  });
}
