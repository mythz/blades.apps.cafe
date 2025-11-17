import { GameState, Character } from '../types/game';
import { SWORDS } from './swords';
import { ABILITIES } from './abilities';
import { PLATFORMS } from './platforms';
import { CHARACTER } from '../utils/constants';

export function createCharacter(id: string, x: number, y: number): Character {
  return {
    id,
    position: { x, y },
    velocity: { x: 0, y: 0 },
    health: CHARACTER.MAX_HEALTH,
    maxHealth: CHARACTER.MAX_HEALTH,
    width: CHARACTER.WIDTH,
    height: CHARACTER.HEIGHT,
    facing: id === 'player' ? 'right' : 'left',
    isGrounded: false,
    isAttacking: false,
    attackCooldown: 0,
    lastHealTime: Date.now(),
    invulnerable: false,
    invulnerableTime: 0,
    state: 'idle',
    equippedSword: SWORDS[0]!,
    abilities: [],
    activeEffects: [],
    jumpCount: 0,
  };
}

export const INITIAL_STATE: GameState = {
  status: 'menu',
  difficulty: 'medium',
  player: createCharacter('player', 400, 300),
  enemy: createCharacter('enemy', 700, 300),
  platforms: PLATFORMS,
  coins: 0,
  totalCoins: 0,
  wins: 0,
  losses: 0,
  gameTime: 0,
  swords: [...SWORDS],
  abilities: [...ABILITIES],
  settings: {
    volume: 0.7,
    musicVolume: 0.5,
    sfxVolume: 0.7,
    showFPS: false,
    particles: true,
  },
  particles: [],
  winner: null,
};
