import { G } from '../state/gameState.js';
import { SHOP_ITEMS } from '../data/shopItems.js';
import { MSGS } from '../data/messages.js';
import { pick } from '../engine/questionGenerator.js';
import { $ } from '../utils/dom.js';
import { saveState } from '../storage/persistence.js';
import { playSound } from '../audio/soundManager.js';

let idleTimer = null;

export function updateHubUI() {
  $('hubStars').textContent = G.stars;
  $('hubPhase').textContent = G.phase;
  
  // Update XP
  const xpNeeded = G.level * 100;
  const xpPercent = Math.min(100, Math.max(0, (G.xp / xpNeeded) * 100));
  const xpFill = $('hubXpFill');
  const xpText = $('hubXpText');
  if (xpFill && xpText) {
    xpFill.style.width = `${xpPercent}%`;
    xpText.textContent = `Lvl ${G.level}`;
  }

  // Update Streak
  const streakVal = $('hubStreak');
  const streakStat = $('hubStreakStat');
  if (streakVal && streakStat) {
    streakVal.textContent = G.streak;
    if (G.streak > 0) {
      streakStat.classList.add('active');
      streakStat.style.filter = 'none';
      streakStat.style.color = '#ff5722';
    } else {
      streakStat.classList.remove('active');
      streakStat.style.filter = 'grayscale(1)';
      streakStat.style.color = '#666';
    }
  }

  // Jaguar accessories
  applyEquipToEl('kHat',   'hat');
  applyEquipToEl('kGlass', 'glasses');
  applyEquipToEl('kOutfit','outfit');
  applyEquipToEl('kAcc',   'accessory');
}

export function renderQuests() {
  const container = $('questsList');
  if (!container) return;
  
  container.innerHTML = '';
  if (!G.dailyQuests || G.dailyQuests.length === 0) {
    container.innerHTML = '<p style="text-align:center; color:#666;">Sem missões hoje!</p>';
    return;
  }

  G.dailyQuests.forEach((q, index) => {
    const isDone = q.progress >= q.target;
    const pct = Math.min(100, (q.progress / q.target) * 100);
    
    let btnHtml = '';
    if (q.claimed) {
      btnHtml = `<div style="color:var(--green); font-weight:bold; font-family:'Luckiest Guy', cursive;"><i class="fa-solid fa-check"></i> Resgatado</div>`;
    } else if (isDone) {
      btnHtml = `<button class="btn-claim" onclick="claimQuest(${index})">Resgatar</button>`;
    } else {
      btnHtml = `<div>${q.progress}/${q.target}</div>`;
    }

    const html = `
      <div class="quest-item ${q.claimed ? 'completed' : ''}">
        <div class="quest-info">
          <span>${q.desc}</span>
          <span class="quest-reward">+${q.reward}<i class="fa-solid fa-star"></i></span>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div class="quest-prog-bar" style="flex:1; margin-right:12px;">
            <div class="quest-prog-fill" style="width:${pct}%"></div>
            <div class="quest-prog-text">${pct.toFixed(0)}%</div>
          </div>
          ${btnHtml}
        </div>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', html);
  });
}

window.claimQuest = function(index) {
  const q = G.dailyQuests[index];
  if (!q || q.claimed || q.progress < q.target) return;
  
  q.claimed = true;
  G.stars += q.reward;
  saveState();
  playSound('buy');
  updateHubUI();
  renderQuests();
};

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
