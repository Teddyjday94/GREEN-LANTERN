import { corpsSymbols, symbolSVG } from './corps-symbols.mjs';

export function batteryMarkup({compact=false}={}) {
  return `<div class="x-central-battery${compact?' is-compact':''}" role="img" aria-label="Central Power Battery on Oa">
    <div class="x-battery-aura" aria-hidden="true"></div>
    <div class="x-battery-light-column" aria-hidden="true"></div>
    <div class="x-battery-handle" aria-hidden="true"><i></i><i></i></div>
    <div class="x-battery-shoulder x-battery-shoulder-left" aria-hidden="true"></div>
    <div class="x-battery-shoulder x-battery-shoulder-right" aria-hidden="true"></div>
    <div class="x-battery-shell" aria-hidden="true">
      <div class="x-battery-core"><span class="x-battery-core-light"></span>${symbolSVG('green')}</div>
      <div class="x-battery-plinth"><span></span><span></span><span></span></div>
    </div>
    <div class="x-battery-caption"><strong>Central Power Battery</strong><small>Sector 0 · Oa · reservoir of willpower</small></div>
  </div>`;
}

export function spectrumRailMarkup({active='green'}={}) {
  return `<nav class="x-corps-spectrum-rail" aria-label="Emotional spectrum Corps symbols">${corpsSymbols.map((item)=>`<button type="button" class="x-corps-chip${item.id===active?' is-active':''}" data-corps="${item.id}" style="--corps-color:${item.color}" aria-label="${item.name}: ${item.force}">${symbolSVG(item.id)}<span><b>${item.force}</b><small>${item.name}</small></span></button>`).join('')}</nav>`;
}
