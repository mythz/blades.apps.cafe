import { Difficulty, Character, GameSettings, SaveData } from '../types/game';

export type GameAction =
  | { type: 'START_GAME'; difficulty: Difficulty }
  | { type: 'UPDATE_PLAYER'; player: Partial<Character> }
  | { type: 'UPDATE_ENEMY'; enemy: Partial<Character> }
  | { type: 'DAMAGE_PLAYER'; amount: number }
  | { type: 'DAMAGE_ENEMY'; amount: number }
  | { type: 'HEAL_CHARACTER'; target: 'player' | 'enemy'; amount: number }
  | { type: 'GAME_OVER'; winner: 'player' | 'enemy' }
  | { type: 'ADD_COINS'; amount: number }
  | { type: 'SPEND_COINS'; amount: number }
  | { type: 'UNLOCK_SWORD'; swordId: string }
  | { type: 'UNLOCK_ABILITY'; abilityId: string }
  | { type: 'EQUIP_SWORD'; swordId: string }
  | { type: 'EQUIP_ABILITY'; abilityId: string }
  | { type: 'PAUSE_GAME' }
  | { type: 'RESUME_GAME' }
  | { type: 'OPEN_SHOP' }
  | { type: 'CLOSE_SHOP' }
  | { type: 'BACK_TO_MENU' }
  | { type: 'UPDATE_SETTINGS'; settings: Partial<GameSettings> }
  | { type: 'TICK'; deltaTime: number }
  | { type: 'LOAD_SAVE'; data: SaveData }
  | { type: 'SET_PLAYER'; player: Character }
  | { type: 'SET_ENEMY'; enemy: Character }
  | { type: 'ADD_PARTICLES'; particles: import('../types/game').Particle[] }
  | { type: 'UPDATE_PARTICLES'; particles: import('../types/game').Particle[] }
  | { type: 'APPLY_KNOCKBACK'; target: 'player' | 'enemy'; direction: 'left' | 'right'; force: number };
