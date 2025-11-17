// Physics constants
export const PHYSICS = {
  GRAVITY: 0.8,
  JUMP_FORCE: -15,
  MOVE_SPEED: 5,
  AIR_RESISTANCE: 0.95,
  GROUND_FRICTION: 0.8,
  MAX_FALL_SPEED: 20,
  KNOCKBACK_FORCE: 8,
  LAVA_Y: 580,
} as const;

// Canvas dimensions
export const CANVAS = {
  WIDTH: 1200,
  HEIGHT: 600,
} as const;

// Game mechanics
export const GAME = {
  HEAL_INTERVAL: 60000, // 60 seconds
  HEAL_AMOUNT: 50,
  INVULNERABILITY_DURATION: 200, // ms
  ATTACK_DURATION: 100, // ms
  COINS_PER_WIN: 50,
  MAX_PARTICLES: 200,
  AUTO_SAVE_INTERVAL: 30000, // 30 seconds
  COMBO_TIMEOUT: 3000, // Combo resets after 3 seconds
  COMBO_DAMAGE_MULTIPLIER: 0.1, // 10% bonus per combo hit
  MAX_COMBO_MULTIPLIER: 2.0, // Max 200% damage
  SCREEN_SHAKE_DURATION: 200, // ms
  SCREEN_SHAKE_INTENSITY: 5, // pixels
} as const;

// Difficulty coin bonuses
export const DIFFICULTY_BONUSES: Record<string, number> = {
  easy: 50,
  medium: 75,
  hard: 100,
  insane: 150,
};

// Control mappings
export const CONTROLS = {
  MOVE_LEFT: ['ArrowLeft', 'a', 'A'],
  MOVE_RIGHT: ['ArrowRight', 'd', 'D'],
  JUMP: ['ArrowUp', 'w', 'W', ' '],
  ATTACK: ['Enter', 'j', 'J'],
  ABILITY_1: ['1'],
  ABILITY_2: ['2'],
  ABILITY_3: ['3'],
  PAUSE: ['Escape', 'p', 'P'],
  DEBUG: ['F3'],
} as const;

// Character dimensions
export const CHARACTER = {
  WIDTH: 40,
  HEIGHT: 60,
  MAX_HEALTH: 100,
} as const;

// Lava zone
export const LAVA_ZONE = {
  Y: 580,
  HEIGHT: 20,
} as const;
