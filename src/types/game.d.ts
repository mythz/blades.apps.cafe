// Core entity position and physics
export interface Vector2D {
  x: number;
  y: number;
}

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Sword types
export interface SwordType {
  id: string;
  name: string;
  damage: number;
  range: number;
  attackSpeed: number;
  price: number;
  unlocked: boolean;
  sprite: string;
}

// Ability system
export interface AbilityEffect {
  type: 'damage_boost' | 'speed_boost' | 'heal' | 'shield' | 'double_jump' | 'dash';
  value: number;
  duration?: number;
}

export interface Ability {
  id: string;
  name: string;
  description: string;
  price: number;
  unlocked: boolean;
  type: 'passive' | 'active';
  cooldown?: number;
  effect: AbilityEffect;
}

// Player/Enemy entity
export interface Character {
  id: string;
  position: Vector2D;
  velocity: Vector2D;
  health: number;
  maxHealth: number;
  width: number;
  height: number;
  facing: 'left' | 'right';
  isGrounded: boolean;
  isAttacking: boolean;
  attackCooldown: number;
  lastHealTime: number;
  invulnerable: boolean;
  invulnerableTime: number;
  state: 'idle' | 'running' | 'jumping' | 'attacking' | 'hurt' | 'dead';
  equippedSword: SwordType;
  abilities: Ability[];
  activeEffects: ActiveEffect[];
  jumpCount: number;
}

export interface ActiveEffect {
  abilityId: string;
  type: AbilityEffect['type'];
  value: number;
  startTime: number;
  duration: number;
}

// Platform
export interface Platform {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'main' | 'floating' | 'hazard';
}

// Game difficulty
export type Difficulty = 'easy' | 'medium' | 'hard' | 'insane';

export interface DifficultySettings {
  aiReactionTime: number;
  aiAccuracy: number;
  aiAggressiveness: number;
  aiDodgeChance: number;
  aiComboChance: number;
}

// Game settings
export interface GameSettings {
  volume: number;
  musicVolume: number;
  sfxVolume: number;
  showFPS: boolean;
  particles: boolean;
}

// Game state
export interface GameState {
  status: 'menu' | 'playing' | 'paused' | 'gameover' | 'shop';
  difficulty: Difficulty;
  player: Character;
  enemy: Character;
  platforms: Platform[];
  coins: number;
  totalCoins: number;
  wins: number;
  losses: number;
  gameTime: number;
  swords: SwordType[];
  abilities: Ability[];
  settings: GameSettings;
  particles: Particle[];
  winner: 'player' | 'enemy' | null;
}

// Save data structure
export interface SaveData {
  coins: number;
  totalCoins: number;
  wins: number;
  losses: number;
  unlockedSwords: string[];
  unlockedAbilities: string[];
  equippedSword: string;
  equippedAbilities: string[];
  settings: GameSettings;
  lastPlayed: number;
}

// Particle system
export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  type: 'hit' | 'heal' | 'lava_bubble' | 'dust';
}

// Collision result
export interface CollisionResult {
  colliding: boolean;
  side: 'top' | 'bottom' | 'left' | 'right' | null;
  overlap: number;
}

// AI types
export type AIStrategy = 'approach' | 'attack' | 'retreat';

export interface AIAction {
  move: -1 | 0 | 1;
  jump: boolean;
  attack: boolean;
}
