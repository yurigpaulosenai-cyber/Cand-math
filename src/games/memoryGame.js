import { G } from '../state/gameState.js';
import { $ } from '../utils/dom.js';
import { playSound } from '../audio/soundManager.js';
import { showConfetti } from '../effects/particles.js';
import { saveState } from '../storage/persistence.js';
import { finishRound } from './gameUtils.js';

let memoryCards = [];
let memoryFlipped = [];
let memoryPairsFound = 0;

export function startMemoryMode() {
  memoryPairsFound = 0;
  memoryFlipped = [];
  $('memoryProg').textContent = 'Pares: 0/4';
  $('memoryStarsBar').textContent = G.stars;
  $('memoryFeedback').classList.remove('show');
  
  // Create 4 pairs with unique results to avoid confusion
  memoryCards = [];
  const usedResults = new Set();
  
  for (let i = 0; i < 4; i++) {
    let op1, op2, res, symbol, eq;
    let isUnique = false;
    
    while (!isUnique) {
      if (Math.random() > 0.5) {
        op1 = Math.floor(Math.random() * 5) + 1;
        op2 = Math.floor(Math.random() * 5) + 1;
        res = op1 + op2;
        symbol = '+';
      } else {
        op1 = Math.floor(Math.random() * 5) + 5;
        op2 = Math.floor(Math.random() * 5) + 1;
        res = op1 - op2;
        symbol = '-';
      }
      
      if (!usedResults.has(res)) {
        usedResults.add(res);
        eq = `${op1} ${symbol} ${op2}`;
        isUnique = true;
      }
    }
    
    memoryCards.push({ id: i, type: 'eq', val: eq, pairId: i });
    memoryCards.push({ id: i + 10, type: 'res', val: res, pairId: i });
  }
  
  memoryCards = memoryCards.sort(() => Math.random() - 0.5);
  renderMemoryGrid();
}

export function renderMemoryGrid() {
  const grid = $('memoryGrid');
  grid.innerHTML = '';
  memoryCards.forEach((c, idx) => {
    const card = document.createElement('div');
    card.className = 'mcard';
    card.dataset.idx = idx;
    card.innerHTML = `
      <div class="mcard-inner">
        <div class="mcard-front"><i class="fa-solid fa-clone"></i></div>
        <div class="mcard-back">${c.val}</div>
      </div>
    `;
    card.addEventListener('click', () => handleMemoryClick(card, c, idx));
    grid.appendChild(card);
  });
}

export function handleMemoryClick(cardEl, cardData, idx) {
  if (cardEl.classList.contains('flipped') || cardEl.classList.contains('matched')) return;
  if (memoryFlipped.length >= 2) return;
  
  cardEl.classList.add('flipped');
  playSound('buy');
  memoryFlipped.push({ el: cardEl, data: cardData });
  
  if (memoryFlipped.length === 2) {
    setTimeout(checkMemoryMatch, 800);
  }
}

export function checkMemoryMatch() {
  const [c1, c2] = memoryFlipped;
  if (c1.data.pairId === c2.data.pairId) {
    c1.el.classList.add('matched');
    c2.el.classList.add('matched');
    playSound('correct');
    memoryPairsFound++;
    $('memoryProg').textContent = `Pares: ${memoryPairsFound}/4`;
    
    if (memoryPairsFound === 4) {
      showConfetti();
      $('memoryFeedbackMsg').textContent = 'Você encontrou todos os pares!';
      $('memoryFeedback').classList.add('show');
      G.stars += 20;
      G.totalCorrect++;
      $('memoryStarsBar').textContent = G.stars;
      saveState();
      
      setTimeout(() => {
        finishRound('memory');
      }, 2000);
    }
  } else {
    c1.el.classList.remove('flipped');
    c2.el.classList.remove('flipped');
    playSound('wrong');
  }
  memoryFlipped = [];
}
