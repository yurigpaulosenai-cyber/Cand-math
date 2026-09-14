import { G } from '../state/gameState.js';
import { SHOP_ITEMS } from '../data/shopItems.js';
import { MSGS } from '../data/messages.js';
import { pick } from '../engine/questionGenerator.js';
import { $ } from '../utils/dom.js';

let idleTimer = null;

export function updateHubUI() {
  $('hubStars').textContent = G.stars;
  $('hubPhase').textContent = G.phase;
  // Jaguar accessories
  applyEquipToEl('kHat',   'hat');
  applyEquipToEl('kGlass', 'glasses');
  applyEquipToEl('kOutfit','outfit');
  applyEquipToEl('kAcc',   'accessory');
}

export function applyEquipToEl(elId, slot) {
  const item = G.equip[slot] ? SHOP_ITEMS.find(i=>i.id===G.equip[slot]) : null;
  const el = $(elId);
  if (item) {
    const col = item.iconColor || 'inherit';
    el.innerHTML = `<i class="fa-solid ${item.icon}" style="color:${col}"></i>`;
  } else {
    el.innerHTML = '';
  }
}

export function startIdleMessages() {
  clearTimeout(idleTimer);
  function setMsg() {
    $('jaguarSpeech').textContent = pick(MSGS.idle);
    idleTimer = setTimeout(setMsg, 5000);
  }
  idleTimer = setTimeout(setMsg, 3000);
}

export function jaguarSpeak(msg) {
  $('jaguarSpeech').textContent = msg;
  clearTimeout(idleTimer);
  idleTimer = setTimeout(startIdleMessages, 4000);
}
