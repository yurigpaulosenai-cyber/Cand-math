/**
 * Calcula a velocidade de queda baseada na dificuldade do nível.
 * 
 * Princípio pedagógico: operações mais complexas = mais tempo para pensar.
 * 
 * Nível 1 (Soma):          velocidade rápida   → baseSpeed = 1.8, variance = 0.8
 * Nível 2 (Subtração):     velocidade moderada  → baseSpeed = 1.4, variance = 0.6
 * Nível 3 (Multiplicação): velocidade lenta     → baseSpeed = 1.0, variance = 0.4
 * Nível 4 (Divisão):       velocidade muito lenta → baseSpeed = 0.7, variance = 0.3
 * 
 * Fórmula: speed = baseSpeed + (Math.random() * variance)
 */
export function getFallingSpeed(level) {
  const config = {
    1: { base: 1.8, variance: 0.8 },  // Soma: rápido
    2: { base: 1.4, variance: 0.6 },  // Subtração: moderado
    3: { base: 1.0, variance: 0.4 },  // Multiplicação: lento
    4: { base: 0.7, variance: 0.3 },  // Divisão: muito lento
  };
  
  const { base, variance } = config[level] || config[1];
  return base + Math.random() * variance;
}

/**
 * Retorna a duração do intervalo do game loop (em ms).
 * Níveis mais difíceis usam interval menor para compensar a velocidade baixa,
 * mantendo a animação suave.
 */
export function getFallingInterval(level) {
  return 20; // mantido constante; a suavidade vem do speed
}
