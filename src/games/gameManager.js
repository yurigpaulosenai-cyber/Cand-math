import { G } from '../state/gameState.js';
import { $ } from '../utils/dom.js';
import { showScreen } from '../ui/screenManager.js';
import { startQuizRound } from './quizGame.js';
import { startFallingRound } from './fallingGame.js';
import { startPuzzleMode } from './puzzleGame.js';
import { startMemoryMode } from './memoryGame.js';
import { startTFRound } from './trueFalseGame.js';

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
