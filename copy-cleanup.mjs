const phraseRules = [
  [/Sector 2814\s*\/\/\s*Earth uplink/gi, 'Sector 2814 · Earth'],
  [/Earth file\s*\/\/\s*selected dossiers/gi, 'Selected Earth dossiers'],
  [/Corps command\s*\/\/\s*Oa/gi, 'Oa and the Corps'],
  [/POWER RING\s*\/\/\s*2814/gi, 'POWER RING · 2814'],
  [/Construct lab\s*\/\/\s*local simulation/gi, 'Construct lab'],
  [/PERSONNEL DOSSIER\s*\/\/\s*/g, 'PERSONNEL DOSSIER · '],
  [/Cosmic archive\s*\/\/\s*off-world Lanterns/gi, 'Off-world Lanterns'],
  [/A cinematic field archive of/gi, 'A field guide to'],
  [/Enter a cinematic, interactive archive of Green Lantern lore\./gi, 'Explore a Green Lantern archive built around characters, Corps history, and source-backed lore.'],
  [/Green Lantern Corps\s*—\s*Official DC Character/gi, 'Green Lantern Corps: Official DC Character'],
  [/Green Lantern\s*—\s*Official DC Character/gi, 'Green Lantern: Official DC Character'],
  [/Simon Baz\s*—\s*Official DC Character/gi, 'Simon Baz: Official DC Character'],
  [/Sinestro\s*—\s*Official DC Character/gi, 'Sinestro: Official DC Character'],
  [/Alan Scott\s*—\s*Official DC Character/gi, 'Alan Scott: Official DC Character'],
  [/Guy Gardner\s*—\s*Official DC Character/gi, 'Guy Gardner: Official DC Character'],
  [/Atrocitus\s*—\s*Official DC Character/gi, 'Atrocitus: Official DC Character'],
  [/Flashpoint: Abin Sur\s*—\s*The Green Lantern #1/gi, 'Flashpoint: Abin Sur, The Green Lantern #1'],
  [/\bimmersive\b/gi, 'focused'],
  [/\bdynamic\b/gi, 'responsive'],
  [/\bseamlessly\b/gi, 'cleanly'],
  [/\belevates?\b/gi, 'improves'],
  [/\bat-a-glance\b/gi, 'quick']
];

function sanitizeCopy(value = '') {
  let text = String(value);
  for (const [pattern, replacement] of phraseRules) text = text.replace(pattern, replacement);
  text = text.replace(/\s*—\s*/g, ': ');
  text = text.replace(/\s{2,}/g, ' ');
  return text;
}

function cleanAttributes(root) {
  if (!(root instanceof Element || root instanceof Document)) return;
  const nodes = root instanceof Element ? [root, ...root.querySelectorAll('[aria-label],[title],[placeholder]')] : [...root.querySelectorAll('[aria-label],[title],[placeholder]')];
  for (const node of nodes) {
    for (const attr of ['aria-label', 'title', 'placeholder']) {
      if (!node.hasAttribute?.(attr)) continue;
      const current = node.getAttribute(attr);
      const cleaned = sanitizeCopy(current);
      if (cleaned !== current) node.setAttribute(attr, cleaned);
    }
  }
}

function cleanText(root) {
  if (!root || typeof document === 'undefined') return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || parent.matches('script,style,code,pre,textarea')) return NodeFilter.FILTER_REJECT;
      return node.nodeValue?.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    }
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  for (const node of nodes) {
    const cleaned = sanitizeCopy(node.nodeValue);
    if (cleaned !== node.nodeValue) node.nodeValue = cleaned;
  }
  cleanAttributes(root);
}

function cleanDocumentCopy() {
  if (typeof document === 'undefined') return;
  if (document.body) cleanText(document.body);
  document.title = sanitizeCopy(document.title);
  for (const selector of ['meta[name="description"]', 'meta[property="og:description"]']) {
    const meta = document.querySelector(selector);
    if (!meta) continue;
    const current = meta.getAttribute('content') || '';
    const cleaned = sanitizeCopy(current);
    if (cleaned !== current) meta.setAttribute('content', cleaned);
  }
}

if (typeof document !== 'undefined') {
  let queued = false;
  const schedule = () => {
    if (queued) return;
    queued = true;
    queueMicrotask(() => {
      queued = false;
      cleanDocumentCopy();
    });
  };
  const start = () => {
    cleanDocumentCopy();
    if (!document.body) return;
    new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true, characterData: true });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
}

export { sanitizeCopy, cleanDocumentCopy };
