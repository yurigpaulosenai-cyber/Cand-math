import { G } from '../state/gameState.js';
import { showStudyOverlay } from '../ui/studyOverlay.js';
import { pickQuestion, pick } from '../engine/questionGenerator.js';
import { $ } from '../utils/dom.js';
import { MSGS } from '../data/messages.js';
import { playSound } from '../audio/soundManager.js';
import { showConfetti } from '../effects/particles.js';
import { saveState } from '../storage/persistence.js';
import { finishRound } from './gameUtils.js';

let tfCurrentAnswer = true;
let tfIndex = 0;
let tfDotResults = [];

export function startTFRound() {
  tfIndex = 0;
  G.roundCorrect = 0;
  tfDotResults = [];
  updateTFDots();
  loadTFQuestion();
}

export function updateTFDots(state, index) {
  if (state === 'done' || state === 'wrong') {
    tfDotResults[index] = state;
  }
  document.querySelectorAll('#tfDots .qdot').forEach((dot, i) => {
    dot.classList.remove('done','wrong','current');
    if (tfDotResults[i]) dot.classList.add(tfDotResults[i]);
    if (state === 'current' && i === index) dot.classList.add('current');
  });
}

export function loadTFQuestion() {
  G.currentQ = pickQuestion(G.selectedLevel || 1);
  const q = G.currentQ;
  
  $('tfProg').textContent = `${tfIndex+1}/5`;
  $('tfStarsBar').textContent = G.stars;
  $('tfDiff').textContent = q.diff;
  $('tfFeedback').classList.remove('show');
  
  tfCurrentAnswer = Math.random() > 0.5;
  let displayedAnswer = q.opts[q.ans];
  
  if (!tfCurrentAnswer) {
    const wrongs = q.opts.filter(o => o !== q.opts[q.ans]);
    displayedAnswer = wrongs[Math.floor(Math.random() * wrongs.length)];
  }
  
  $('tfText').innerHTML = `${q.text}<br><br><strong style="font-size:32px; color:var(--purple);">${displayedAnswer}</strong>`;
  
  updateTFDots('current', tfIndex);
  
  const btns = document.querySelectorAll('.tf-answers .ans-btn');
  btns.forEach(b => b.disabled = false);
  
  $('tfCard').style.animation = 'none';
  void $('tfCard').offsetWidth;
  $('tfCard').style.animation = 'slideUp 0.4s ease';
}

export function handleTFAnswer(isTrue) {
  const btns = document.querySelectorAll('.tf-answers .ans-btn');
  btns.forEach(b => b.disabled = true);
  
  if (isTrue === tfCurrentAnswer) {
    G.stars += 10;
    G.totalCorrect++;
    G.streak++;
    G.roundCorrect++;
    if (G.streak > G.bestStreak) G.bestStreak = G.streak;
    playSound('correct');
    showConfetti();
    $('tfFeedbackMsg').textContent = pick(MSGS.correct);
    $('tfFeedback').classList.add('show');
    updateTFDots('done', tfIndex);
  } else {
    const correctBtnIndex = tfCurrentAnswer ? 0 : 1;
    btns[correctBtnIndex].classList.add('correct-reveal');
    
    const correctValue = G.currentQ.opts[G.currentQ.ans];
    const displayedAnswer = tfCurrentAnswer ? 'Verdadeiro' : 'Falso';
    
    $('tfFeedbackMsg').textContent = `Era ${displayedAnswer}! Memorize!`;
    $('tfFeedback').classList.add('show');
    showStudyOverlay(G.currentQ.text, correctValue);
    
    G.streak = 0;
    playSound('wrong');
    updateTFDots('wrong', tfIndex);
  }
  
  $('tfStarsBar').textContent = G.stars;
  saveState();
  
  const delay = (isTrue === tfCurrentAnswer) ? 1600 : 4000;
  setTimeout(() => {
    tfIndex++;
    if (tfIndex >= 5) {
      finishRound('tf');
    } else {
      loadTFQuestion();
    }
  }, delay);
}
