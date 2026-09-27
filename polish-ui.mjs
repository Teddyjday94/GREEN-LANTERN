import { corpsSymbols, symbolSVG } from './corps-symbols.mjs';

export function batteryMarkup({compact=false}={}) {
  return `<div class="x-central-battery${compact?' is-compact':''}" role="img" aria-label="Central Power Battery on Oa">
    <div class="x-battery-aura" aria-hidden="true"></div>
    <div class="x-battery-light-column" aria-hidden="true"></div>
    <div class="x-battery-floor-rings" aria-hidden="true"><i></i><i></i><i></i></div>

    <div class="x-battery-crown" aria-hidden="true">
      <span class="x-battery-crown-arch"></span>
      <span class="x-battery-crown-cap"></span>
      <i class="x-battery-crown-rib x-battery-crown-rib-left"></i>
      <i class="x-battery-crown-rib x-battery-crown-rib-right"></i>
    </div>

    <div class="x-battery-reactor" aria-hidden="true">
      <span class="x-battery-brace x-battery-brace-left"></span>
      <span class="x-battery-brace x-battery-brace-right"></span>
      <span class="x-battery-shoulder-ring x-battery-shoulder-ring-top"></span>
      <span class="x-battery-shoulder-ring x-battery-shoulder-ring-bottom"></span>

      <div class="x-battery-glass">
        <span class="x-battery-glass-reflection"></span>
        <div class="x-battery-energy-column">
          <i></i><i></i><i></i><i></i><i></i>
        </div>
        <div class="x-battery-energy-particles"><i></i><i></i><i></i><i></i><i></i><i></i></div>
      </div>

      <div class="x-battery-emblem-housing">
        <span class="x-battery-emblem-ring"></span>
        ${symbolSVG('green')}
      </div>

      <div class="x-battery-base-reactor">
        <span></span><span></span><span></span><span></span>
      </div>
    </div>

    <div class="x-battery-caption"><strong>Central Power Battery</strong><small>Sector 0 · Oa · reservoir of willpower</small></div>
  </div>`;
}

export function spectrumRailMarkup({active='green'}={}) {
  return `<nav class="x-corps-spectrum-rail" aria-label="Emotional spectrum Corps symbols">${corpsSymbols.map((item)=>`<button type="button" class="x-corps-chip${item.id===active?' is-active':''}" data-corps="${item.id}" style="--corps-color:${item.color}" aria-label="${item.name}: ${item.force}">${symbolSVG(item.id)}<span><b>${item.force}</b><small>${item.name}</small></span></button>`).join('')}</nav>`;
}
