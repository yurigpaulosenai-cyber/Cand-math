import { G } from '../state/gameState.js';
import { $ } from '../utils/dom.js';
import { showScreen, openModal } from '../ui/screenManager.js';
import { startQuizRound } from './quizGame.js';
import { startFallingRound } from './fallingGame.js';
import { startPuzzleMode } from './puzzleGame.js';
import { startMemoryMode } from './memoryGame.js';
import { startTFRound } from './trueFalseGame.js';
import { saveState } from '../storage/persistence.js';
import { playSound } from '../audio/soundManager.js';
import { createConfetti } from '../effects/particles.js';
import { updateHubUI } from '../ui/hubUI.js';

let modeToLaunch = null;

export function openDifficulty(mode) {
  modeToLaunch = mode;
  
  const total = G.totalCorrect || 0;
  const levels = [
    { id: 2, req: 50,  desc: "Soma e Subtração" },
    { id: 3, req: 150, desc: "Até Multiplicação" },
    { id: 4, req: 300, desc: "Todas as Operações!" }
  ];
  
  levels.forEach(lvl => {
    const btn = $('diffBtn' + lvl.id);
    const desc = $('diffDesc' + lvl.id);
    if (btn && desc) {
      if (total >= lvl.req) {
        btn.disabled = false;
        desc.textContent = lvl.desc;
      } else {
        btn.disabled = true;
        desc.innerHTML = `<i class="fa-solid fa-lock"></i> Requer ${lvl.req} acertos (Tem: ${total})`;
      }
    }
  });

  $('modalDifficulty').style.display = 'flex';
}

export function selectDifficulty(level) {
  G.selectedLevel = level;
  $('modalDifficulty').style.display = 'none';
  startMode(modeToLaunch);
}

export function startMode(mode) {
  G.currentMode = mode;
  G.roundCorrect = 0;
  // clearTimeout(idleTimer); -> will do via event or just let it be handled by screenManager
  if (window.clearIdleTimer) window.clearIdleTimer();
  
  if (mode === 'quiz')    { G.quizIndex = 0;   startQuizRound();    showScreen('screenQuiz');  }
  if (mode === 'falling') { startFallingRound(); showScreen('screenFalling'); }
  if (mode === 'puzzle')  { startPuzzleMode();   showScreen('screenPuzzle'); }
  if (mode === 'memory')  { startMemoryMode();   showScreen('screenMemory'); }
  if (mode === 'tf')      { startTFRound();      showScreen('screenTrueFalse'); }
}

export function progressQuest(type, amount = 1) {
  if (!G.dailyQuests) return;
  let updated = false;
  G.dailyQuests.forEach(q => {
    if (q.type === type || q.type === 'play_any') {
      if (q.progress < q.target) {
        q.progress += amount;
        if (q.progress > q.target) q.progress = q.target;
        updated = true;
      }
    }
  });
  if (updated) saveState();
}

export function addXP(amount) {
  G.xp += amount;
  const xpNeeded = G.level * 100;
  
  if (G.xp >= xpNeeded) {
    // Level UP!
    G.xp -= xpNeeded;
    G.level += 1;
    G.stars += 100;
    
    // Show Modal XP Level Up
    $('xpLevelText').textContent = `Nível ${G.level - 1} → ${G.level}`;
    openModal('modalXPLevelUp');
    
    // Confetti and sound
    setTimeout(() => {
      playSound('win');
      const box = document.querySelector('.levelup-box');
      createConfetti('xpLuConfetti', box ? box.clientWidth : 300, box ? box.clientHeight : 300, 100);
    }, 100);
  }
  
  updateHubUI();
  saveState();
}
