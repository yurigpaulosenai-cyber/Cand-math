export const G = {
  profile: null,
  stars: 0,
  phase: 1,
  totalCorrect: 0,
  streak: 0,
  bestStreak: 0,
  soundOn: true,
  autoTTS: false,
  highContrast: false,
  dyslexiaFont: false,
  roundCorrect: 0,
  currentMode: null,
  currentQ: null,
  quizIndex: 0,
  raceIndex: 0,
  puzzleIndex: 0,
  equip: { hat: null, glasses: null, outfit: null, accessory: null },
  owned: [],
  // New Engagement & Pedagogical fields
  xp: 0,
  level: 1,
  lastLoginDate: null,
  dailyQuests: [],
  stats: { add: { c: 0, w: 0 }, sub: { c: 0, w: 0 }, mul: { c: 0, w: 0 }, div: { c: 0, w: 0 } }
};

export function resetGameState() {
  G.profile = null;
  G.stars = 0;
  G.phase = 1;
  G.totalCorrect = 0;
  G.streak = 0;
  G.bestStreak = 0;
  G.equip = { hat: null, glasses: null, outfit: null, accessory: null };
  G.owned = [];
  G.puzzleIndex = 0;
  G.xp = 0;
  G.level = 1;
  G.lastLoginDate = null;
  G.dailyQuests = [];
  G.stats = { add: { c: 0, w: 0 }, sub: { c: 0, w: 0 }, mul: { c: 0, w: 0 }, div: { c: 0, w: 0 } };
}
