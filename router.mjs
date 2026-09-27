const known = new Set(['lanterns','corps','universe','spectrum','timeline','villains','reading','sources']);
export function resolveRoute(pathname = '/') {
  const path = pathname.replace(/\/+$/, '') || '/';
  if (path === '/') return { name:'home' };
  const bits = path.split('/').filter(Boolean);
  if (bits[0] === 'lanterns' && bits.length === 2) return { name:'lantern', slug:bits[1] };
  if (bits.length === 1 && known.has(bits[0])) return { name:bits[0] };
  return { name:'not-found' };
}
