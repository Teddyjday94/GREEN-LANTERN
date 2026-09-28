import { corpsSymbols, symbolSVG } from './corps-symbols.mjs';

export function ringHostMarkup() {
  return `<div class="hero-visual" id="hero-visual" aria-label="Three-dimensional Green Lantern power ring visualization">
    <div class="orbit-shell" aria-hidden="true"></div>
    <div class="ring-data"><b>POWER RING // 2814</b><span>Will-energy interface<br>Construct protocol ready<br>Charge stable: 100%</span></div>
  </div>`;
}

export function batteryMarkup({compact=false}={}) {
  return `<div class="x-central-battery${compact?' is-compact':''}" role="button" tabindex="0" aria-label="Central Power Battery on Oa. Activate to play the Green Lantern oath.">
    <div class="x-battery-model" aria-hidden="true"></div>
    <audio class="x-battery-oath" src="/assets/audio/in-brightest-day-oath.mp3" preload="metadata" aria-hidden="true"></audio>
    <div class="x-battery-caption"><strong>Central Power Battery</strong><small>Sector 0 · Oa · reservoir of willpower</small></div>
  </div>`;
}

export function spectrumRailMarkup({active='green'}={}) {
  return `<nav class="x-corps-spectrum-rail" aria-label="Emotional spectrum Corps symbols">${corpsSymbols.map((item)=>`<button type="button" class="x-corps-chip${item.id===active?' is-active':''}" data-corps="${item.id}" style="--corps-color:${item.color}" aria-label="${item.name}: ${item.force}">${symbolSVG(item.id)}<span><b>${item.force}</b><small>${item.name}</small></span></button>`).join('')}</nav>`;
}
