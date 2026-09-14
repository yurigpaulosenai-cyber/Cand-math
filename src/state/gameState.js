export const G = {
  stars: 0,
  phase: 1,
  totalCorrect: 0,
  streak: 0,
  bestStreak: 0,
  soundOn: true,
  roundCorrect: 0,
  currentMode: null,
  currentQ: null,
  quizIndex: 0,
  raceIndex: 0,
  puzzleIndex: 0,
  equip: { hat: null, glasses: null, outfit: null, accessory: null },
  owned: [],
};

export function resetGameState() {
  G.stars = 0;
  G.phase = 1;
  G.totalCorrect = 0;
  G.streak = 0;
  G.bestStreak = 0;
  G.equip = { hat: null, glasses: null, outfit: null, accessory: null };
  G.owned = [];
  G.puzzleIndex = 0;
}
