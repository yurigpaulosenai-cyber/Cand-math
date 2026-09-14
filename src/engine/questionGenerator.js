export function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateQuestion(level = 1) {
  let op1, op2, res, symbol, text;
  const icons = ['fa-candy-cane', 'fa-cookie-bite', 'fa-cookie', 'fa-ice-cream', 'fa-cake-candles', 'fa-circle-dot'];
  const icon = pick(icons);

  const ops = ['+'];
  if (level >= 2) ops.push('-');
  if (level >= 3) ops.push('*');
  if (level >= 4) ops.push('/');
  
  const op = pick(ops);

  if (op === '+') {
    op1 = Math.floor(Math.random() * 10) + 1;
    op2 = Math.floor(Math.random() * 10) + 1;
    res = op1 + op2;
    symbol = '+';
  } else if (op === '-') {
    op1 = Math.floor(Math.random() * 15) + 5;
    op2 = Math.floor(Math.random() * op1) + 1;
    res = op1 - op2;
    symbol = '-';
  } else if (op === '*') {
    op1 = Math.floor(Math.random() * 10) + 1;
    op2 = Math.floor(Math.random() * 10) + 1;
    res = op1 * op2;
    symbol = '×';
  } else if (op === '/') {
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

  return { diff: diffText, icon, text, opts: opts.map(String), ans: ansIdx, numericRes: res };
}

export function pickQuestion(selectedLevel) {
  return generateQuestion(selectedLevel || 1);
}
