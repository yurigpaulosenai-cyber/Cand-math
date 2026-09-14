import { G } from '../state/gameState.js';
import { SHOP_ITEMS } from '../data/shopItems.js';
import { $ } from '../utils/dom.js';
import { showToast } from './toastManager.js';
import { playSound } from '../audio/soundManager.js';
import { openModal } from './modalManager.js';
import { updateHubUI } from './hubUI.js';

let shopFilter = 'all';

export function openShop() {
  $('shopCoins').textContent = G.stars;
  renderShop('all');
  // Reset tabs
  document.querySelectorAll('.stab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.stab')[0].classList.add('active');
  updateWardrobePreview();
  openModal('modalShop');
}

export function filterShop(cat, btn) {
  shopFilter = cat;
  document.querySelectorAll('.stab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  renderShop(cat);
}

export function renderShop(cat) {
  const grid = $('shopGrid');
  grid.innerHTML = '';
  const items = cat === 'all' ? SHOP_ITEMS : SHOP_ITEMS.filter(i => i.cat === cat);

  items.forEach(item => {
    const owned    = G.owned.includes(item.id);
    const equipped = G.equip[item.cat] === item.id;
    const canAfford = G.stars >= item.price;

    const card = document.createElement('div');
    card.className = `shop-item-card${owned?' owned':''}${equipped?' equipped':''}`;
    const iconStyle = item.iconColor ? `style="color:${item.iconColor}"` : '';
    card.innerHTML = `
      <div class="sic-icon"><i class="fa-solid ${item.icon}" ${iconStyle}></i></div>
      <div class="sic-name">${item.name}</div>
      <div class="sic-price">${owned
        ? '<i class="fa-solid fa-circle-check"></i> Possuído'
        : '<i class="fa-solid fa-star"></i> '+item.price
      }</div>
      ${owned
        ? `<button class="sic-btn ${equipped?'unequip-btn':'equip-btn'}"
             onclick="toggleEquip('${item.id}','${item.cat}')">
             ${equipped
               ? '<i class="fa-solid fa-trash"></i> Remover'
               : '<i class="fa-solid fa-wand-magic-sparkles"></i> Equipar'}
           </button>`
        : `<button class="sic-btn ${canAfford?'buy-btn':'locked-btn'}"
             onclick="buyItem('${item.id}')"
             ${canAfford?'':'disabled'}>
             ${canAfford
               ? '<i class="fa-solid fa-cart-shopping"></i> Comprar'
               : '<i class="fa-solid fa-lock"></i> '+item.price}
           </button>`
      }
    `;
    grid.appendChild(card);
  });
}

export function buyItem(id) {
  const item = SHOP_ITEMS.find(i => i.id === id);
  if (!item || G.stars < item.price) { showToast('Estrelas insuficientes!'); return; }
  G.stars -= item.price;
  G.owned.push(id);
  // saveState() is handled externally or implicitly, we need it here
  window.triggerSave && window.triggerSave();
  showToast(`Comprado: ${item.name}!`);
  playSound('buy');
  $('shopCoins').textContent = G.stars;
  renderShop(shopFilter);
  updateWardrobePreview();
  updateHubUI();
}

export function toggleEquip(id, cat) {
  if (G.equip[cat] === id) {
    G.equip[cat] = null; showToast('Item removido!');
  } else {
    G.equip[cat] = id;
    const item = SHOP_ITEMS.find(i=>i.id===id);
    showToast(`${item.name} equipado!`);
  }
  window.triggerSave && window.triggerSave();
  renderShop(shopFilter);
  updateWardrobePreview();
  updateHubUI();
}

export function updateWardrobePreview() {
  ['hat','glasses','outfit','accessory'].forEach(slot => {
    const elMap = { hat:'wdHat', glasses:'wdGlass', outfit:'wdOutfit', accessory:'wdAcc' };
    const item = G.equip[slot] ? SHOP_ITEMS.find(i=>i.id===G.equip[slot]) : null;
    const el = $(elMap[slot]);
    if (item) {
      const col = item.iconColor || 'inherit';
      el.innerHTML = `<i class="fa-solid ${item.icon}" style="color:${col}"></i>`;
    } else {
      el.innerHTML = '';
    }
  });
  // Equipped list text
  const equipped = Object.entries(G.equip)
    .filter(([,v])=>v)
    .map(([,v])=>{ const i=SHOP_ITEMS.find(x=>x.id===v); return i?i.name:''; })
    .filter(Boolean);
  $('wdEquippedList').textContent = equipped.length ? equipped.join(' · ') : 'Nenhum item equipado';
}
