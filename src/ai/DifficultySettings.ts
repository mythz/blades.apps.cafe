import { Difficulty, DifficultySettings } from '../types/game';

export const DIFFICULTY_SETTINGS: Record<Difficulty, DifficultySettings> = {
  easy: {
    aiReactionTime: 500,
    aiAccuracy: 0.4,
    aiAggressiveness: 0.3,
    aiDodgeChance: 0.1,
    aiComboChance: 0.1,
  },
  medium: {
    aiReactionTime: 300,
    aiAccuracy: 0.6,
    aiAggressiveness: 0.5,
    aiDodgeChance: 0.3,
    aiComboChance: 0.3,
  },
  hard: {
    aiReactionTime: 150,
    aiAccuracy: 0.8,
    aiAggressiveness: 0.7,
    aiDodgeChance: 0.5,
    aiComboChance: 0.5,
  },
  insane: {
    aiReactionTime: 50,
    aiAccuracy: 0.95,
    aiAggressiveness: 0.9,
    aiDodgeChance: 0.7,
    aiComboChance: 0.7,
  },
};
