import { G } from '../state/gameState.js';

export function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getWeightedOp(availableOps) {
  if (!G.stats || availableOps.length <= 1) return pick(availableOps);

  let weights = [];
  let totalWeight = 0;

  availableOps.forEach(opKey => {
    const stat = G.stats[opKey];
    // Se a criança erra, o peso sobe. 
    // Peso base = 10. Cada erro a mais que acerto = +2. Max peso = 40.
    let weight = 10;
    if (stat) {
      const errorRate = stat.w - stat.c;
      if (errorRate > 0) weight += errorRate * 2;
    }
    weight = Math.min(weight, 40);
    weights.push({ op: opKey, weight });
    totalWeight += weight;
  });

  let rand = Math.random() * totalWeight;
  for (let w of weights) {
    if (rand < w.weight) return w.op;
    rand -= w.weight;
  }
  return pick(availableOps);
}

export function generateQuestion(level = 1) {
  let op1, op2, res, symbol, text;
  const icons = ['fa-candy-cane', 'fa-cookie-bite', 'fa-cookie', 'fa-ice-cream', 'fa-cake-candles', 'fa-circle-dot'];
  const icon = pick(icons);

  const opsMap = ['add'];
  if (level >= 2) opsMap.push('sub');
  if (level >= 3) opsMap.push('mul');
  if (level >= 4) opsMap.push('div');
  
  const opKey = getWeightedOp(opsMap);

  if (opKey === 'add') {
    op1 = Math.floor(Math.random() * 10) + 1;
    op2 = Math.floor(Math.random() * 10) + 1;
    res = op1 + op2;
    symbol = '+';
  } else if (opKey === 'sub') {
    op1 = Math.floor(Math.random() * 15) + 5;
    op2 = Math.floor(Math.random() * op1) + 1;
    res = op1 - op2;
    symbol = '-';
  } else if (opKey === 'mul') {
    op1 = Math.floor(Math.random() * 10) + 1;
    op2 = Math.floor(Math.random() * 10) + 1;
    res = op1 * op2;
    symbol = '×';
  } else if (opKey === 'div') {
    res = Math.floor(Math.random() * 9) + 2;
    op2 = Math.floor(Math.random() * 9) + 2;
    op1 = res * op2;
    symbol = '÷';
  }
  text = `Quanto é ${op1} ${symbol} ${op2}?`;

  let optsSet = new Set([res]);
  while (optsSet.size < 4) {
    let wrong = res + (Math.floor(Math.random() * 7) - 3);
    if (wrong < 0) wrong = res + Math.floor(Math.random() * 5) + 1;
    if (wrong !== res) optsSet.add(wrong);
  }
  
  let opts = Array.from(optsSet).sort(() => Math.random() - 0.5);
  let ansIdx = opts.indexOf(res);
  let diffText = level === 1 ? "Iniciante" : level === 2 ? "Aprendiz" : level === 3 ? "Experiente" : "Mestre";

  return { diff: diffText, icon, text, opts: opts.map(String), ans: ansIdx, numericRes: res, op: opKey };
}

export function pickQuestion(selectedLevel) {
  return generateQuestion(selectedLevel || 1);
}
