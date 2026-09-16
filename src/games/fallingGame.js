import { G } from '../state/gameState.js';
import { pickQuestion, pick } from '../engine/questionGenerator.js';
import { $ } from '../utils/dom.js';
import { MSGS } from '../data/messages.js';
import { playSound, speakText } from '../audio/soundManager.js';
import { showConfetti } from '../effects/particles.js';
import { saveState } from '../storage/persistence.js';
import { finishRound } from './gameUtils.js';
import { progressQuest } from './gameManager.js';

let fallingIndex = 0;
let candiesFallen = 0;

export function startFallingRound() {
  fallingIndex = 0;
  G.roundCorrect = 0;
  loadFallingQuestion();
}

export function loadFallingQuestion() {
  G.currentQ = pickQuestion(G.selectedLevel || 1);
  const q = G.currentQ;

  $('fallingProg').textContent    = `${fallingIndex+1}/5`;
  $('fallingStarsBar').textContent = G.stars;
  $('fallingDiff').textContent    = q.diff;
  $('fallingText').textContent    = q.text;
  $('fallingFeedback').classList.remove('show');
  
  if (G.autoTTS) speakText(q.text);
  
  const stage = $('fallingStage');
  stage.innerHTML = '';
  
  let threeOpts = [q.opts[q.ans]];
  const wrongs = q.opts.filter(o => o !== q.opts[q.ans]);
  threeOpts.push(wrongs[0], wrongs[1]);
  threeOpts = threeOpts.sort(() => Math.random() - 0.5);
  const correctIdx = threeOpts.indexOf(q.opts[q.ans]);

  candiesFallen = 0;
  threeOpts.forEach((opt, i) => {
    const c = document.createElement('div');
    c.className = 'falling-candy';
    c.style.left = (20 + i * 25) + '%';
    c.innerHTML = `<div class="fc-val">${opt}</div>`;
    
    let pos = -60;
    const speed = 1.0 + Math.random() * 1.5; 
    
    c.dataset.isCorrect = (i === correctIdx);
    c.onclick = () => handleCandyClick(c, c.dataset.isCorrect === 'true');
    stage.appendChild(c);
    
    const fallInterval = setInterval(() => {
      if (!c.isConnected || c.dataset.stopped) {
        clearInterval(fallInterval);
        return;
      }
      pos += speed;
      c.style.top = pos + 'px';
      
      if (pos > stage.offsetHeight - 40) {
        clearInterval(fallInterval);
        c.remove();
        candiesFallen++;
        if (candiesFallen === 3 && !$('fallingFeedback').classList.contains('show')) {
           handleCandyMiss();
        }
      }
    }, 20);
  });
}

export function handleCandyClick(c, isCorrect) {
  if (c.dataset.stopped) return;
  
  document.querySelectorAll('.falling-candy').forEach(cand => {
    cand.dataset.stopped = true;
  });

  // Track stats
  const op = G.currentQ.op;
  if (op && G.stats[op]) {
    if (isCorrect) G.stats[op].c++;
    else G.stats[op].w++;
  }

  if (isCorrect) {
    c.classList.add('correct');
    G.stars += 15;
    G.totalCorrect++;
    G.streak++;
    G.roundCorrect++;
    if (G.streak > G.bestStreak) G.bestStreak = G.streak;
    playSound('correct');
    showConfetti();
    showFallingFeedback(pick(MSGS.correct));
    progressQuest('correct_math', 1);
  } else {
    c.classList.add('wrong');
    G.streak = 0;
    playSound('wrong');
    showFallingFeedback(pick(MSGS.wrong));
  }
  
  $('fallingStarsBar').textContent = G.stars;
  saveState();

  setTimeout(nextFallingRound, 1500);
}

export function handleCandyMiss() {
  document.querySelectorAll('.falling-candy').forEach(cand => {
    cand.dataset.stopped = true;
  });
  G.streak = 0;
  playSound('wrong');
  showFallingFeedback('Você deixou cair!');
  saveState();
  setTimeout(nextFallingRound, 1500);
}

export function showFallingFeedback(msg) {
  $('fallingFeedbackMsg').textContent = msg;
  $('fallingFeedback').classList.add('show');
}

export function nextFallingRound() {
  fallingIndex++;
  if (fallingIndex >= 5) {
    finishRound('falling');
  } else {
    loadFallingQuestion();
  }
}
