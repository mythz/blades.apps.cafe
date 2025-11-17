import { Character, Vector2D, Platform, Particle } from './game';

export interface RenderContext {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
}

export interface InputState {
  left: boolean;
  right: boolean;
  jump: boolean;
  attack: boolean;
  ability1: boolean;
  ability2: boolean;
  ability3: boolean;
  pause: boolean;
}

export interface DebugInfo {
  fps: number;
  playerPos: Vector2D;
  enemyPos: Vector2D;
  playerState: string;
  enemyState: string;
  collisionCount: number;
  particleCount: number;
  aiStrategy: string;
}
