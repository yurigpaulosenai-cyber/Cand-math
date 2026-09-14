import { G } from '../state/gameState.js';
import { showToast } from '../ui/toastManager.js';
import { $ } from '../utils/dom.js';

let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

export function playSound(type) {
  if (!G.soundOn) return;
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const t = ctx.currentTime;

    if (type === 'correct') {
      osc.frequency.setValueAtTime(659, t);
      osc.frequency.setValueAtTime(784, t+0.1);
      osc.frequency.setValueAtTime(1046,t+0.2);
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t+0.4);
      osc.start(t); osc.stop(t+0.4);
    } else if (type === 'wrong') {
      osc.frequency.setValueAtTime(300, t);
      osc.frequency.setValueAtTime(150, t+0.2);
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t+0.4);
      osc.start(t); osc.stop(t+0.4);
    } else if (type === 'levelup') {
      const freqs=[523,659,784,1046];
      freqs.forEach((f,i) => {
        const o2=ctx.createOscillator(), g2=ctx.createGain();
        o2.connect(g2); g2.connect(ctx.destination);
        o2.frequency.setValueAtTime(f,t+i*0.12);
        g2.gain.setValueAtTime(0.2,t+i*0.12);
        g2.gain.exponentialRampToValueAtTime(0.001,t+i*0.12+0.2);
        o2.start(t+i*0.12); o2.stop(t+i*0.12+0.25);
      });
      osc.stop(t);
    } else if (type === 'buy') {
      osc.frequency.setValueAtTime(880, t);
      osc.frequency.setValueAtTime(1100,t+0.1);
      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t+0.25);
      osc.start(t); osc.stop(t+0.25);
    }
  } catch(e) { console.warn('Audio error:', e); }
}

export function speakText() {
  if (!G.currentQ || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(G.currentQ.text);
  u.lang = 'pt-BR'; u.rate = 0.9;
  window.speechSynthesis.speak(u);
}

export function toggleSound() {
  G.soundOn = !G.soundOn;
  const el = $('soundIcon');
  if (el) el.className = G.soundOn ? 'fa-solid fa-volume-high' : 'fa-solid fa-volume-xmark';
  window.triggerSave && window.triggerSave();
  showToast(G.soundOn ? 'Som ativado!' : 'Som desativado');
}
