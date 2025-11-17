import { Vector2D, Particle } from '../types/game';

// Linear interpolation
export function lerp(start: number, end: number, factor: number): number {
  return start + (end - start) * factor;
}

// Clamp value between min and max
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// Distance between two points
export function distance(a: Vector2D, b: Vector2D): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// Generate random number between min and max
export function random(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

// Generate random integer between min and max (inclusive)
export function randomInt(min: number, max: number): number {
  return Math.floor(random(min, max + 1));
}

// Generate unique ID
let idCounter = 0;
export function generateId(prefix = 'id'): string {
  return `${prefix}_${++idCounter}_${Date.now()}`;
}

// Create particles for various effects
export function createHitParticles(x: number, y: number): Particle[] {
  const particles: Particle[] = [];
  const count = randomInt(10, 15);
  const colors = ['#FFFF00', '#FFA500', '#FFFFFF'];

  for (let i = 0; i < count; i++) {
    const angle = random(0, Math.PI * 2);
    const speed = random(2, 5);

    particles.push({
      id: generateId('particle'),
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0,
      maxLife: random(0.5, 1),
      size: random(2, 4),
      color: colors[randomInt(0, colors.length - 1)]!,
      type: 'hit',
    });
  }

  return particles;
}

export function createHealParticles(x: number, y: number): Particle[] {
  const particles: Particle[] = [];
  const count = randomInt(20, 30);
  const colors = ['#00FF00', '#90EE90'];

  for (let i = 0; i < count; i++) {
    particles.push({
      id: generateId('particle'),
      x: x + random(-10, 10),
      y,
      vx: random(-1, 1),
      vy: random(-3, -1),
      life: 0,
      maxLife: random(1, 1.5),
      size: random(2, 5),
      color: colors[randomInt(0, colors.length - 1)]!,
      type: 'heal',
    });
  }

  return particles;
}

export function createDustParticles(x: number, y: number): Particle[] {
  const particles: Particle[] = [];
  const count = randomInt(5, 8);
  const colors = ['#808080', '#A0A0A0'];

  for (let i = 0; i < count; i++) {
    particles.push({
      id: generateId('particle'),
      x: x + random(-10, 10),
      y,
      vx: random(-2, 2),
      vy: random(-1, 0),
      life: 0,
      maxLife: random(0.3, 0.5),
      size: random(1, 3),
      color: colors[randomInt(0, colors.length - 1)]!,
      type: 'dust',
    });
  }

  return particles;
}

export function createLavaBubble(x: number): Particle {
  return {
    id: generateId('particle'),
    x: x + random(-50, 50),
    y: 580,
    vx: random(-0.5, 0.5),
    vy: random(-1, -0.5),
    life: 0,
    maxLife: random(2, 3),
    size: random(3, 6),
    color: randomInt(0, 1) === 0 ? '#FFA500' : '#FF4500',
    type: 'lava_bubble',
  };
}

// Update particles
export function updateParticles(particles: Particle[], deltaTime: number): Particle[] {
  return particles
    .map(particle => ({
      ...particle,
      x: particle.x + particle.vx * deltaTime * 60,
      y: particle.y + particle.vy * deltaTime * 60,
      vy: particle.vy + 0.1 * deltaTime * 60, // Gravity on particles
      life: particle.life + deltaTime,
      size: Math.max(0, particle.size * (1 - particle.life / particle.maxLife)),
    }))
    .filter(particle => particle.life < particle.maxLife && particle.size > 0);
}
