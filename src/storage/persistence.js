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
    equip: G.equip,
    owned: G.owned,
    puzzleIndex: G.puzzleIndex,
    version: 3,
    lastSaved: Date.now(),
  });
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

  if (!data) return;
  
  // Aplicar ao estado global G
  G.profile = data.profile || null;
  G.stars = data.stars || 0;
  G.phase = data.phase || 1;
  G.totalCorrect = data.totalCorrect || 0;
  G.streak = data.streak || 0;
  G.bestStreak = data.bestStreak || 0;
  G.soundOn = data.soundOn !== undefined ? data.soundOn : true;
  G.equip = data.equip || { hat: null, glasses: null, outfit: null, accessory: null };
  G.owned = data.owned || [];
  G.puzzleIndex = data.puzzleIndex || 0;

  const sIcon = $('soundIcon');
  if (sIcon) sIcon.className = G.soundOn ? 'fa-solid fa-volume-high' : 'fa-solid fa-volume-xmark';
}
