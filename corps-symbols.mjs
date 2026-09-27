export const corpsSymbols = [
  { id:'green', name:'Green Lantern Corps', force:'Willpower', color:'#42ff83' },
  { id:'yellow', name:'Sinestro Corps', force:'Fear', color:'#ffe44d' },
  { id:'red', name:'Red Lantern Corps', force:'Rage', color:'#ff4a4a' },
  { id:'blue', name:'Blue Lantern Corps', force:'Hope', color:'#4aa8ff' },
  { id:'orange', name:'Orange Light', force:'Avarice', color:'#ff9b38' },
  { id:'indigo', name:'Indigo Tribe', force:'Compassion', color:'#7b72ff' },
  { id:'violet', name:'Star Sapphires', force:'Love', color:'#ff61d8' },
  { id:'black', name:'Black Lantern Corps', force:'Death', color:'#727a78' },
  { id:'white', name:'White Lanterns', force:'Life', color:'#f5fff7' },
];

const shapes = {
  green: `<circle cx="50" cy="50" r="23" fill="none" stroke="currentColor" stroke-width="10"/><path d="M22 20h56v10H22zm0 50h56v10H22z" fill="currentColor"/>`,
  yellow: `<circle cx="50" cy="50" r="18" fill="none" stroke="currentColor" stroke-width="8"/><path d="M50 8l8 20H42zm0 84l-8-20h16zM8 50l20-8v16zm84 0l-20 8V42z" fill="currentColor"/><path d="M20 20l15 9-6 6zm60 0l-9 15-6-6zM20 80l9-15 6 6zm60 0l-15-9 6-6z" fill="currentColor"/>`,
  red: `<circle cx="50" cy="43" r="19" fill="none" stroke="currentColor" stroke-width="8"/><path d="M31 43H18V17l17 17m34 9h13V17L65 34M50 61v31" fill="none" stroke="currentColor" stroke-width="9" stroke-linecap="square"/>`,
  blue: `<circle cx="50" cy="50" r="18" fill="none" stroke="currentColor" stroke-width="8"/><path d="M22 27h15l-7-12h40l-7 12h15M22 73h15l-7 12h40l-7-12h15" fill="none" stroke="currentColor" stroke-width="8" stroke-linejoin="round"/>`,
  orange: `<circle cx="50" cy="50" r="18" fill="none" stroke="currentColor" stroke-width="8"/><path d="M50 7v17M50 76v17M7 50h17M76 50h17M19 19l12 12M69 69l12 12M81 19L69 31M31 69L19 81" stroke="currentColor" stroke-width="8"/><path d="M35 18l15 8 15-8-3 16 14 9-15 7 3 16-14-8-14 8 3-16-15-7 14-9z" fill="none" stroke="currentColor" stroke-width="4" opacity=".7"/>`,
  indigo: `<path d="M50 13l31 37-31 37L19 50z" fill="none" stroke="currentColor" stroke-width="8"/><circle cx="50" cy="50" r="11" fill="none" stroke="currentColor" stroke-width="7"/><path d="M50 2v18M50 80v18M2 50h18M80 50h18" stroke="currentColor" stroke-width="6"/>`,
  violet: `<circle cx="50" cy="50" r="15" fill="none" stroke="currentColor" stroke-width="7"/><path d="M50 5l9 26 25-12-14 24 25 7-25 7 14 24-25-12-9 26-9-26-25 12 14-24-25-7 25-7-14-24 25 12z" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/>`,
  black: `<path d="M20 25h60M25 35h50M30 45h40" stroke="currentColor" stroke-width="8"/><path d="M18 54h64L50 90z" fill="none" stroke="currentColor" stroke-width="8"/>`,
  white: `<path d="M18 46h64L50 12z" fill="none" stroke="currentColor" stroke-width="8"/><path d="M26 58h48M31 68h38M36 78h28" stroke="currentColor" stroke-width="8"/>`,
};

export function getCorpsSymbol(id='green') {
  return corpsSymbols.find((item) => item.id === id) || corpsSymbols[0];
}

export function symbolSVG(id='green', { className='x-corps-symbol', decorative=true }={}) {
  const symbol=getCorpsSymbol(id);
  const aria=decorative ? `aria-hidden="true"` : `role="img" aria-label="${symbol.name} symbol"`;
  return `<svg class="${className}" data-corps="${symbol.id}" viewBox="0 0 100 100" ${aria} style="--corps-color:${symbol.color}" xmlns="http://www.w3.org/2000/svg">${shapes[symbol.id]}</svg>`;
}
