import { loadState, saveState } from './storage/persistence.js';
import { showScreen, goHub } from './ui/screenManager.js';
import { startMode, openDifficulty, selectDifficulty } from './games/gameManager.js';
import { updateHubUI, startIdleMessages } from './ui/hubUI.js';
import { openShop, filterShop, buyItem, toggleEquip } from './ui/shopUI.js';
import { openModal, closeModal, closeAllModals } from './ui/modalManager.js';
import { setupParticleCanvas } from './effects/particles.js';
import { speakText, toggleSound } from './audio/soundManager.js';
import { handleTFAnswer } from './games/trueFalseGame.js';
import { checkPuzzle, giveHint, nextPuzzle } from './games/puzzleGame.js';
import { setupLogin } from './ui/loginUI.js';
import { G } from './state/gameState.js';
import { $ } from './utils/dom.js';

// Auto-save every 15s
setInterval(saveState, 15000);
window.triggerSave = saveState; // For explicit saves across the app if needed

document.addEventListener('DOMContentLoaded', async () => {
  await loadState();
  setupLogin();
  
  if (G.profile && G.profile.childName) {
    document.querySelector('.splash-koala-bubble').textContent = `Olá, ${G.profile.childName}! Sou Juju Candy!`;
    showScreen('screenSplash');
  } else {
    showScreen('screenLogin');
  }
  
  const btnPlay = $('btnPlay');
  if (btnPlay) {
    btnPlay.addEventListener('click', () => {
      showScreen('screenHub');
      updateHubUI();
      startIdleMessages();
    });
  }
  
  setupParticleCanvas();
});

// Expor globalmente para onclick inline do HTML
window.goHub = goHub;
window.openDifficulty = openDifficulty;
window.selectDifficulty = selectDifficulty;
window.startMode = startMode;
window.openShop = openShop;
window.filterShop = filterShop;
window.buyItem = buyItem;
window.toggleEquip = toggleEquip;
window.openModal = openModal;
window.closeModal = closeModal;
window.closeAllModals = closeAllModals;
window.speakText = speakText;
window.toggleSound = toggleSound;
window.handleTFAnswer = handleTFAnswer;
window.checkPuzzle = checkPuzzle;
window.giveHint = giveHint;
window.nextPuzzle = nextPuzzle;

// Extra for the records reset
window.resetGame = function() {
  if (!confirm('Tem certeza? Todos os dados serão apagados!')) return;
  import('./state/gameState.js').then(module => {
    module.resetGameState();
    saveState();
    closeAllModals();
    updateHubUI();
    import('./ui/toastManager.js').then(tm => tm.showToast('Jogo reiniciado! Boa sorte!'));
  });
};
