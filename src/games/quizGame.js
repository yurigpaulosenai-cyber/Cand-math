import { G } from '../state/gameState.js';
import { showStudyOverlay } from '../ui/studyOverlay.js';
import { pickQuestion } from '../engine/questionGenerator.js';
import { $ } from '../utils/dom.js';
import { MSGS } from '../data/messages.js';
import { pick } from '../engine/questionGenerator.js';
import { playSound } from '../audio/soundManager.js';
import { showConfetti } from '../effects/particles.js';
import { saveState } from '../storage/persistence.js';
import { finishRound } from './gameUtils.js';

let quizDotResults = [];

export function startQuizRound() {
  G.quizIndex = 0;
  G.roundCorrect = 0;
  quizDotResults = [];
  updateQuizDots();
  loadQuizQuestion();
}

export function loadQuizQuestion() {
  G.currentQ = pickQuestion(G.selectedLevel || 1);
  const q = G.currentQ;

  $('quizProg').textContent   = `${G.quizIndex+1}/5`;
  $('quizStarsBar').textContent = G.stars;
  $('quizDiff').textContent   = q.diff;
  $('quizEmoji').innerHTML    = `<i class="fa-solid ${q.icon || 'fa-candy-cane'}"></i>`;
  $('quizText').textContent   = q.text;
  $('quizFeedback').classList.remove('show');

  // Shuffle options
  const shuffled = shuffleOpts(q.opts, q.ans);
  renderQuizAnswers(shuffled.opts, shuffled.correctIdx);
  updateQuizDots('current', G.quizIndex);

  // Animate card
  $('quizCard').style.animation = 'none';
  void $('quizCard').offsetWidth;
  $('quizCard').style.animation = 'slideUp 0.4s ease';
}

export function shuffleOpts(opts, correctIdx) {
  const correctAnswer = opts[correctIdx];
  const shuffled = [...opts].sort(() => Math.random() - 0.5);
  const newCorrectIdx = shuffled.indexOf(correctAnswer);
  return { opts: shuffled, correctIdx: newCorrectIdx };
}

export function renderQuizAnswers(opts, correctIdx) {
  const grid = $('quizAnswers');
  grid.innerHTML = '';
  opts.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'ans-btn';
    btn.textContent = opt;
    btn.addEventListener('click', () => handleQuizAnswer(i, correctIdx, btn));
    grid.appendChild(btn);
  });
}

export function handleQuizAnswer(chosen, correct, btn) {
  const btns = document.querySelectorAll('#screenQuiz .ans-btn');
  btns.forEach(b => b.disabled = true);

  if (chosen === correct) {
    btn.classList.add('correct');
    G.stars += 10;
    G.totalCorrect++;
    G.streak++;
    G.roundCorrect++;
    if (G.streak > G.bestStreak) G.bestStreak = G.streak;
    playSound('correct');
    showConfetti();
    const msg = G.streak >= 3 ? pick(MSGS.streak) : pick(MSGS.correct);
    showQuizFeedback(msg);
    updateQuizDots('done', G.quizIndex);
    if (G.streak % 3 === 0) G.stars += 5; // streak bonus
  } else {
    btn.classList.add('wrong');
    btns[correct].classList.add('correct-reveal');
    const correctValue = G.currentQ.opts[G.currentQ.ans];
    showQuizFeedback(`A resposta certa é ${correctValue}! Memorize!`);
    showStudyOverlay(G.currentQ.text, correctValue);
    
    G.streak = 0;
    playSound('wrong');
    updateQuizDots('wrong', G.quizIndex);
  }

  $('quizStarsBar').textContent = G.stars;
  saveState();

  const delay = (chosen === correct) ? 1600 : 4000;
  setTimeout(() => {
    G.quizIndex++;
    if (G.quizIndex >= 5) {
      finishRound('quiz');
    } else {
      loadQuizQuestion();
    }
  }, delay);
}

export function showQuizFeedback(msg) {
  $('quizFeedbackMsg').textContent = msg;
  $('quizFeedback').classList.add('show');
}

export function updateQuizDots(state, index) {
  if (state === 'done' || state === 'wrong') {
    quizDotResults[index] = state;
  }
  document.querySelectorAll('#qDots .qdot').forEach((dot, i) => {
    dot.classList.remove('done','wrong','current');
    if (quizDotResults[i]) dot.classList.add(quizDotResults[i]);
    if (state === 'current' && i === index) dot.classList.add('current');
  });
}
