import { saveData, loadData } from './storageAdapter.js';
import { G } from '../state/gameState.js';
import { $ } from '../utils/dom.js';

const SAVE_KEY = 'candymath_v3';
const LEGACY_KEY = 'candymath_v2';

export async function saveState() {
  await saveData(SAVE_KEY, {
    profile: G.profile,
    stars: G.stars,
    phase: G.phase,
    totalCorrect: G.totalCorrect,
    streak: G.streak,
    bestStreak: G.bestStreak,
    soundOn: G.soundOn,
    autoTTS: G.autoTTS,
    highContrast: G.highContrast,
    dyslexiaFont: G.dyslexiaFont,
    equip: G.equip,
    owned: G.owned,
    puzzleIndex: G.puzzleIndex,
    xp: G.xp,
    level: G.level,
    lastLoginDate: G.lastLoginDate,
    dailyQuests: G.dailyQuests,
    stats: G.stats,
    version: 3,
    lastSaved: Date.now(),
  });
}

function generateQuests() {
  return [
    { id: 1, type: 'play_falling', target: 2, progress: 0, reward: 20, desc: 'Jogue Chuva de Doces 2x', claimed: false },
    { id: 2, type: 'correct_math', target: 15, progress: 0, reward: 30, desc: 'Acerte 15 contas', claimed: false },
    { id: 3, type: 'play_any', target: 3, progress: 0, reward: 20, desc: 'Jogue 3 partidas', claimed: false }
  ];
}

function checkDailyReset() {
  const today = new Date().toISOString().split('T')[0];
  if (G.lastLoginDate !== today) {
    // Check if it's contiguous day for streak
    if (G.lastLoginDate) {
      const last = new Date(G.lastLoginDate);
      const curr = new Date(today);
      const diffTime = Math.abs(curr - last);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        G.streak += 1;
        if (G.streak > G.bestStreak) G.bestStreak = G.streak;
      } else if (diffDays > 1) {
        G.streak = 1; // Reset to 1 for the new day
      }
    } else {
      G.streak = 1;
    }

    G.lastLoginDate = today;
    G.dailyQuests = generateQuests();
    // Salvar estado imediatamente para registrar o novo login
    saveState();
  }
}

export async function loadState() {
  // Tentar carregar dados novos primeiro
  let data = await loadData(SAVE_KEY);

  // Fallback: migrar dados legados do localStorage
  if (!data) {
    try {
      const raw = localStorage.getItem(LEGACY_KEY);
      if (raw) {
        data = JSON.parse(raw);
        // Migrar e apagar legado
        await saveData(SAVE_KEY, { ...data, version: 3, lastSaved: Date.now() });
        localStorage.removeItem(LEGACY_KEY);
        console.log('[CandyMath] Dados migrados do localStorage para IndexedDB');
      }
    } catch (e) {
      console.warn('[CandyMath] Erro na migração:', e);
    }
  }

  if (data) {
    // Aplicar ao estado global G
    G.profile = data.profile || null;
    G.stars = data.stars || 0;
    G.phase = data.phase || 1;
    G.totalCorrect = data.totalCorrect || 0;
    G.streak = data.streak || 0;
    G.bestStreak = data.bestStreak || 0;
    G.soundOn = data.soundOn !== undefined ? data.soundOn : true;
    G.autoTTS = data.autoTTS || false;
    G.highContrast = data.highContrast || false;
    G.dyslexiaFont = data.dyslexiaFont || false;
    G.equip = data.equip || { hat: null, glasses: null, outfit: null, accessory: null };
    G.owned = data.owned || [];
    G.puzzleIndex = data.puzzleIndex || 0;
    
    G.xp = data.xp || 0;
    G.level = data.level || 1;
    G.lastLoginDate = data.lastLoginDate || null;
    G.dailyQuests = data.dailyQuests || [];
    G.stats = data.stats || { add: { c: 0, w: 0 }, sub: { c: 0, w: 0 }, mul: { c: 0, w: 0 }, div: { c: 0, w: 0 } };
  }

  const sIcon = $('soundIcon');
  if (sIcon) sIcon.className = G.soundOn ? 'fa-solid fa-volume-high' : 'fa-solid fa-volume-xmark';
  
  // Apply accessibility classes
  if (G.highContrast) document.body.classList.add('high-contrast');
  else document.body.classList.remove('high-contrast');
  
  if (G.dyslexiaFont) document.body.classList.add('dyslexia-font');
  else document.body.classList.remove('dyslexia-font');
  
  // Update buttons in Settings modal
  const btnSound = $('toggleSoundBtn');
  const btnTTS = $('toggleTTSBtn');
  const btnCont = $('toggleContrastBtn');
  const btnFont = $('toggleFontBtn');
  if (btnSound) {
    btnSound.textContent = G.soundOn ? 'Ativado' : 'Desativado';
    btnSound.className = G.soundOn ? 'btn-toggle active' : 'btn-toggle';
  }
  if (btnTTS) {
    btnTTS.textContent = G.autoTTS ? 'Ativado' : 'Desativado';
    btnTTS.className = G.autoTTS ? 'btn-toggle active' : 'btn-toggle';
  }
  if (btnCont) {
    btnCont.textContent = G.highContrast ? 'Ativado' : 'Desativado';
    btnCont.className = G.highContrast ? 'btn-toggle active' : 'btn-toggle';
  }
  if (btnFont) {
    btnFont.textContent = G.dyslexiaFont ? 'Ativado' : 'Desativado';
    btnFont.className = G.dyslexiaFont ? 'btn-toggle active' : 'btn-toggle';
  }

  if (G.profile) {
    checkDailyReset();
  }
}
