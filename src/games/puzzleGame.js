import { G } from '../state/gameState.js';
import { PUZZLES } from '../data/puzzles.js';
import { $ } from '../utils/dom.js';
import { playSound } from '../audio/soundManager.js';
import { showConfetti } from '../effects/particles.js';
import { saveState } from '../storage/persistence.js';
import { showToast } from '../ui/toastManager.js';

let currentPuzzle = null;
let hintsUsed = 0;

export function startPuzzleMode() {
  hintsUsed = 0;
  $('btnNextPuzzle').style.display = 'none';
  loadPuzzle(G.puzzleIndex % PUZZLES.length);
}

export function loadPuzzle(idx) {
  currentPuzzle = PUZZLES[idx];
  $('puzzleLvlLabel').textContent = `Nível ${idx+1}`;
  $('puzzleStarsBar').textContent = G.stars;
  $('puzzleTitle').textContent    = currentPuzzle.title;
  $('puzzleDesc').textContent     = currentPuzzle.desc;
  hintsUsed = 0;
  renderPuzzleGrid();
}

export function renderPuzzleGrid() {
  const p = currentPuzzle;
  const n = p.size;
  const wrap = $('puzzleGridWrap');

  // Grid = n rows + 1 sum row, n cols + 1 sum col + corner
  const totalCols = n + 1;
  const totalRows = n + 1;

  const grid = document.createElement('div');
  grid.className = 'puzzle-grid';
  grid.style.gridTemplateColumns = `repeat(${totalCols}, 1fr)`;
  grid.innerHTML = '';

  // Data rows
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const cell = document.createElement('div');
      const key = `${r}-${c}`;
      if (p.grid[r][c] !== null) {
        cell.className = 'pcell fixed';
        cell.textContent = p.grid[r][c];
      } else {
        cell.className = 'pcell blank';
        const inp = document.createElement('input');
        inp.type = 'number';
        inp.min = 0; inp.max = 99;
        inp.id = `cell-${key}`;
        inp.placeholder = '?';
        cell.appendChild(inp);
      }
      grid.appendChild(cell);
    }
    // Row sum label
    const sumCell = document.createElement('div');
    sumCell.className = 'pcell sum-label';
    sumCell.innerHTML = `= <strong>${p.rowSums[r]}</strong>`;
    grid.appendChild(sumCell);
  }

  // Column sum row
  for (let c = 0; c < n; c++) {
    const sumCell = document.createElement('div');
    sumCell.className = 'pcell sum-label';
    sumCell.innerHTML = `= <strong>${p.colSums[c]}</strong>`;
    grid.appendChild(sumCell);
  }
  // Corner
  const corner = document.createElement('div');
  corner.className = 'pcell corner';
  corner.innerHTML = '<i class="fa-solid fa-candy-cane"></i>';
  grid.appendChild(corner);

  wrap.innerHTML = '';
  wrap.appendChild(grid);
}

export function checkPuzzle() {
  const p = currentPuzzle;
  const n = p.size;
  let allCorrect = true;
  let anyFilled = false;

  // Clear previous states
  document.querySelectorAll('.pcell.blank').forEach(c => {
    c.classList.remove('correct-cell','wrong-cell');
  });

  Object.entries(p.answers).forEach(([key, ans]) => {
    const inp = $(`cell-${key}`);
    if (!inp) return;
    const cell = inp.parentElement;
    const val = parseInt(inp.value, 10);
    if (!isNaN(val)) anyFilled = true;
    if (val === ans) {
      cell.classList.add('correct-cell');
    } else {
      cell.classList.add('wrong-cell');
      allCorrect = false;
    }
  });

  if (!anyFilled) {
    showToast('Preencha os espaços primeiro!');
    return;
  }

  if (allCorrect) {
    const earned = Math.max(p.stars - hintsUsed * 5, 10);
    G.stars += earned;
    G.totalCorrect++;
    G.puzzleIndex = (G.puzzleIndex + 1) % PUZZLES.length;
    saveState();
    playSound('correct');
    showConfetti();
    showToast(`Correto! +${earned} estrelas!`);
    $('puzzleStarsBar').textContent = G.stars;
    $('btnNextPuzzle').style.display = 'inline-block';
    document.querySelectorAll('.btn-check-puzzle').forEach(b => b.disabled = true);
  } else {
    playSound('wrong');
    showToast('Alguns números estão errados! Tente novamente!');
  }
}

export function giveHint() {
  const p = currentPuzzle;
  const blanks = Object.entries(p.answers).filter(([key]) => {
    const inp = $(`cell-${key}`);
    if (!inp) return false;
    return !inp.parentElement.classList.contains('correct-cell');
  });
  if (!blanks.length) { showToast('Tudo já está correto!'); return; }
  const [hKey, hAns] = blanks[0];
  const inp = $(`cell-${hKey}`);
  inp.value = hAns;
  inp.parentElement.classList.add('hinted');
  hintsUsed++;
  showToast(`Dica: célula preenchida! (-5 estrelas)`);
}

export function nextPuzzle() {
  $('btnNextPuzzle').style.display = 'none';
  document.querySelectorAll('.btn-check-puzzle').forEach(b => b.disabled = false);
  loadPuzzle(G.puzzleIndex % PUZZLES.length);
}
