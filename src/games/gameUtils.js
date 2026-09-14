import { G } from '../state/gameState.js';
import { saveState } from '../storage/persistence.js';
import { $ } from '../utils/dom.js';
import { openModal } from '../ui/modalManager.js';
import { spawnLevelUpConfetti } from '../effects/particles.js';
import { playSound } from '../audio/soundManager.js';

export function finishRound(mode) {
  const correct = G.roundCorrect;
  const bonus = correct === 5 ? 25 : correct >= 3 ? 10 : 0;
  if (bonus) {
    G.stars += bonus;
  }

  const oldPhase = G.phase;
  if (correct >= 3) {
    G.phase = Math.min(G.phase + 1, 8);
  }
  saveState();

  const phaseChanged = G.phase > oldPhase;
  const earned = (mode==='quiz'?10:15)*correct + bonus;

  document.querySelector('.lu-title').textContent = phaseChanged ? 'Fase Completa!' : 'Rodada Concluída!';
  $('luPhaseText').textContent = phaseChanged
    ? `Fase ${oldPhase} → Fase ${G.phase}`
    : `Você acertou ${correct}/5`;
  $('luStarsText').innerHTML = `+${earned} <i class="fa-solid fa-star"></i>  (bônus: ${bonus})`;
  openModal('modalLevelUp');
  if (phaseChanged) spawnLevelUpConfetti();
  playSound('levelup');
}
