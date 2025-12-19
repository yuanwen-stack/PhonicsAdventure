
export enum Level {
  LEVEL_1 = 1,
  LEVEL_2 = 2,
  LEVEL_3 = 3,
  LEVEL_4 = 4,
  LEVEL_5 = 5,
}

export type LevelInfo = {
  id: Level;
  title: string;
  description: string;
  example: string;
};

export interface PhonicsItem {
  word: string;
  readingGuide: string;
  phonemes: string[];
  phonemeGuides: string[]; // Individual guide for each phoneme, e.g., ["/k/ as in kite", "/æ/ as in apple", "/t/ as in tiger"]
  audioCue: string;
  visualReward: string;
  congratulation: string;
}

export interface GameState {
  currentLevel: Level;
  currentStep: 'intro' | 'decoding' | 'reward' | 'test' | 'menu';
  history: PhonicsItem[];
  currentItem: PhonicsItem | null;
  loading: boolean;
  rewardLoading: boolean;
  rewardImageUrl: string | null;
  testPhase: number;
}
