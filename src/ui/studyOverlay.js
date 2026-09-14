export function showStudyOverlay(question, answer) {
  const overlay = document.createElement('div');
  overlay.className = 'study-overlay';
  overlay.innerHTML = `
    <div class="study-card">
      <div class="study-icon">📝</div>
      <p class="study-question">${question}</p>
      <p class="study-answer">= ${answer}</p>
      <div class="study-timer-bar"></div>
      <p class="study-hint">Memorize a resposta correta!</p>
    </div>
  `;
  document.body.appendChild(overlay);
  
  // Barra de progresso de 3.5s
  const bar = overlay.querySelector('.study-timer-bar');
  bar.style.animation = 'studyCountdown 3.5s linear forwards';
  
  setTimeout(() => {
    overlay.style.animation = 'fadeOut 0.3s ease forwards';
    setTimeout(() => overlay.remove(), 300);
  }, 3500);
}
